/**
 * 百度搜索资源平台 - 普通收录 API 主动推送
 *
 * 用途：
 *   把站点 URL 主动推送给百度蜘蛛，触发抓取。
 *   比 sitemap 被动拉取更快，新站接入和内容更新后强烈建议跑一次。
 *
 * 文档：https://ziyuan.baidu.com/linksubmit/index
 *
 * 使用：
 *   1. 在项目根目录 .env.local 中配置：
 *        BAIDU_PUSH_URL=http://data.zz.baidu.com/urls?site=https://nbstockai.com&token=xxx
 *   2. 执行：
 *        npm run push:baidu
 *
 * URL 来源优先级：
 *   1) 命令行参数（空格分隔多个 URL）
 *   2) dist/sitemap.xml（推荐，build:ssg 之后自动带到 dist）
 *   3) public/sitemap.xml（兜底）
 *
 * 单次调用上限（百度官方）：
 *   - 单次最多 2000 条
 *   - 每日额度见站长后台「今日提交余额」
 */

import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import https from 'node:https'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// -------- 1. 加载 .env.local --------
function loadEnvLocal() {
  const file = path.join(ROOT, '.env.local')
  if (!fs.existsSync(file)) return
  const text = fs.readFileSync(file, 'utf-8')
  for (const line of text.split(/\r?\n/)) {
    const s = line.trim()
    if (!s || s.startsWith('#')) continue
    const idx = s.indexOf('=')
    if (idx < 0) continue
    const key = s.slice(0, idx).trim()
    const val = s.slice(idx + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
}
loadEnvLocal()

const PUSH_URL = process.env.BAIDU_PUSH_URL
if (!PUSH_URL) {
  console.error('❌ 未找到 BAIDU_PUSH_URL 环境变量')
  console.error('   请在 .env.local 中配置：')
  console.error('   BAIDU_PUSH_URL=http://data.zz.baidu.com/urls?site=https://xxx.com&token=xxx')
  process.exit(1)
}

// -------- 2. 收集 URL 列表 --------
function parseSitemap(file) {
  if (!fs.existsSync(file)) return []
  const xml = fs.readFileSync(file, 'utf-8')
  const list = []
  const re = /<loc>\s*([^<\s]+)\s*<\/loc>/gi
  let m
  while ((m = re.exec(xml))) list.push(m[1].trim())
  return list
}

let urls = process.argv.slice(2).filter(Boolean)
let source = 'argv'

if (!urls.length) {
  const distSitemap = path.join(ROOT, 'dist', 'sitemap.xml')
  const publicSitemap = path.join(ROOT, 'public', 'sitemap.xml')
  if (fs.existsSync(distSitemap)) {
    urls = parseSitemap(distSitemap)
    source = 'dist/sitemap.xml'
  } else if (fs.existsSync(publicSitemap)) {
    urls = parseSitemap(publicSitemap)
    source = 'public/sitemap.xml'
  }
}

if (!urls.length) {
  console.error('❌ 没有找到要推送的 URL')
  process.exit(1)
}

// 去重 + 百度要求单次 ≤ 2000 条
urls = Array.from(new Set(urls)).slice(0, 2000)

console.log('================= 百度主动推送 =================')
console.log(`URL 来源 : ${source}`)
console.log(`待推送数 : ${urls.length}`)
urls.forEach((u, i) => console.log(`  ${String(i + 1).padStart(2, ' ')}. ${u}`))
console.log('-------------------------------------------------')

// -------- 3. 发送 POST 请求 --------
function request(url, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const lib = u.protocol === 'https:' ? https : http
    const req = lib.request(
      {
        method: 'POST',
        hostname: u.hostname,
        port: u.port || (u.protocol === 'https:' ? 443 : 80),
        path: u.pathname + u.search,
        headers: {
          'Content-Type': 'text/plain',
          'Content-Length': Buffer.byteLength(body),
          'User-Agent': 'curl/7.88.1',
        },
        timeout: 15_000,
      },
      (res) => {
        let data = ''
        res.setEncoding('utf-8')
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => resolve({ status: res.statusCode, body: data }))
      }
    )
    req.on('timeout', () => {
      req.destroy(new Error('请求超时（15s）'))
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

try {
  const body = urls.join('\n')
  const { status, body: resp } = await request(PUSH_URL, body)

  console.log(`HTTP 状态: ${status}`)
  console.log(`返回内容: ${resp}`)
  console.log('-------------------------------------------------')

  let json
  try {
    json = JSON.parse(resp)
  } catch {
    console.error('❌ 返回不是 JSON，可能是网络或 token 问题')
    process.exit(1)
  }

  if (json.error) {
    console.error(`❌ 推送失败：${json.error} / ${json.message || ''}`)
    console.error('   常见错误码：')
    console.error('     401 - token 错误或站点未验证')
    console.error('     400 - 站点未绑定/超出配额/URL 格式错误')
    process.exit(1)
  }

  console.log('✅ 推送完成')
  console.log(`  成功提交      : ${json.success ?? 0} 条`)
  console.log(`  今日剩余配额  : ${json.remain ?? '?'} 条`)
  if (json.not_same_site && json.not_same_site.length) {
    console.log(`  ⚠️  非本站 URL : ${json.not_same_site.length} 条`)
    json.not_same_site.forEach((u) => console.log(`       - ${u}`))
  }
  if (json.not_valid && json.not_valid.length) {
    console.log(`  ⚠️  不合法 URL : ${json.not_valid.length} 条`)
    json.not_valid.forEach((u) => console.log(`       - ${u}`))
  }
  console.log('================================================')
} catch (err) {
  console.error('❌ 网络错误:', err.message)
  process.exit(1)
}
