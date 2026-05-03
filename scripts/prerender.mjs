/**
 * prerender.mjs
 *
 * 作用：在 `vite build` 产出 dist/ 之后，用 Puppeteer（Edge Headless）
 *       抓取若干公开页面的完整渲染 HTML，写回 dist/<route>/index.html，
 *       让百度/Google 等蜘蛛无需执行 JS 即可读到首屏内容。
 *
 * 使用：
 *   1) 确保已执行 `npm run build`
 *   2) 运行 `node scripts/prerender.mjs`
 *   3) 或者直接 `npm run build:ssg`
 *
 * 技术栈（轻量方案，无需下载 170MB Chromium）：
 *   - puppeteer-core：无内置 Chromium 的 Puppeteer
 *   - 系统 Edge/Chrome：Windows 默认自带，由 EDGE_PATHS/CHROME_PATHS 自动探测
 *   - sirv：轻量静态服务器，serve dist/
 *   - portfinder：自动找可用端口
 */

import { createServer } from 'node:http'
import { promises as fs, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sirv from 'sirv'
import portfinder from 'portfinder'
import puppeteer from 'puppeteer-core'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')

// 需要预渲染的公开路由（与 sitemap.xml / robots.txt 对齐）
const ROUTES = [
  '/',
  '/about',
  '/learning',
  '/register',
  '/login',
  '/user-agreement',
  '/privacy-policy',
]

// 可能的浏览器可执行路径（优先 Edge，其次 Chrome）
const BROWSER_CANDIDATES = [
  // Windows Edge（绝大多数 Win10/11 默认存在）
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  // Windows Chrome
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  // macOS
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  // Linux
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/microsoft-edge',
]

function findBrowser() {
  // 支持用环境变量 PUPPETEER_EXECUTABLE_PATH 覆盖
  if (process.env.PUPPETEER_EXECUTABLE_PATH && existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH
  }
  for (const p of BROWSER_CANDIDATES) {
    if (existsSync(p)) return p
  }
  return null
}

/** 启动 sirv 静态服务器 */
async function startStaticServer() {
  if (!existsSync(DIST)) {
    throw new Error(`dist/ 目录不存在：${DIST}\n请先执行 \`npm run build\``)
  }
  const port = await portfinder.getPortPromise({ port: 4173 })
  const handler = sirv(DIST, { dev: false, etag: true, single: true })
  const server = createServer((req, res) => handler(req, res))
  await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve))
  return { server, port }
}

/** 格式化耗时 */
function fmt(ms) {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`
}

async function renderRoute(browser, baseUrl, route) {
  const page = await browser.newPage()
  const url = baseUrl + route

  // 注入预渲染标记，main.ts 会据此跳过 API/认证初始化
  await page.evaluateOnNewDocument(() => {
    window.__PRERENDER_INJECTED__ = true
  })

  const start = Date.now()
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30_000 })
    // 等待 main.ts 抛出 render-event（最多再等 5s）
    await page.evaluate(
      () =>
        new Promise((resolve) => {
          if (window.__PRERENDER_READY__) return resolve()
          const timer = setTimeout(resolve, 5000)
          document.addEventListener('render-event', () => {
            clearTimeout(timer)
            resolve()
          })
        })
    )

    const html = await page.content()

    // 路由 "/" → dist/index.html；其它 → dist/<route>/index.html
    const outDir = route === '/' ? DIST : path.join(DIST, route)
    const outFile = path.join(outDir, 'index.html')
    await fs.mkdir(outDir, { recursive: true })
    await fs.writeFile(outFile, html, 'utf8')

    const size = (html.length / 1024).toFixed(1)
    console.log(`  ✓ ${route.padEnd(20)}  ${size} KB  (${fmt(Date.now() - start)})`)
  } catch (err) {
    console.error(`  ✗ ${route.padEnd(20)}  失败：${err.message}`)
    throw err
  } finally {
    await page.close()
  }
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  TradingAgents 中文版 · 预渲染构建')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const browserPath = findBrowser()
  if (!browserPath) {
    console.error(
      '❌ 未找到可用的 Edge/Chrome 浏览器。请设置环境变量：\n' +
        '   $env:PUPPETEER_EXECUTABLE_PATH = "C:\\\\path\\\\to\\\\msedge.exe"\n' +
        '   然后重新运行 `npm run build:ssg`'
    )
    process.exit(1)
  }
  console.log(`🧭 浏览器：${browserPath}`)

  const { server, port } = await startStaticServer()
  const baseUrl = `http://127.0.0.1:${port}`
  console.log(`🌐 静态服务：${baseUrl}`)

  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })
  console.log(`🚀 开始预渲染 ${ROUTES.length} 个路由：\n`)

  const t0 = Date.now()
  let failed = 0
  for (const route of ROUTES) {
    try {
      await renderRoute(browser, baseUrl, route)
    } catch {
      failed++
    }
  }

  await browser.close()
  server.close()

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  if (failed === 0) {
    console.log(`✅ 预渲染完成：${ROUTES.length}/${ROUTES.length}  耗时 ${fmt(Date.now() - t0)}`)
  } else {
    console.log(`⚠️ 预渲染完成但有失败：${ROUTES.length - failed}/${ROUTES.length}  失败 ${failed}`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('\n❌ 预渲染失败：', err)
  process.exit(1)
})
