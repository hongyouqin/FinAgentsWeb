/**
 * 百度统计事件埋点工具
 *
 * 设计原则：
 * 1. 无侵入：失败永不抛错（_hmt 不存在 / 网络问题 / 浏览器禁用），不影响业务
 * 2. 防脏数据：本地开发 / 内网 / 预渲染环境自动跳过（与 index.html 守卫一致）
 * 3. 类型安全：参数收敛为四元组，避免业务代码各自传不同形状
 *
 * 百度统计事件 API 文档：
 * _hmt.push(['_trackEvent', category, action, opt_label, opt_value])
 * - category：事件类别（如 User / Analysis / Recharge）
 * - action：事件操作（如 Login / Submit / PaySuccess）
 * - opt_label（可选）：事件标签（如 stockCode / loginType / orderNo）
 * - opt_value（可选）：事件值，必须是 number（如金额）
 */

declare global {
  interface Window {
    _hmt?: any[]
  }
}

/** 是否禁用上报：本地 / 内网 / 预渲染 */
function isTrackDisabled(): boolean {
  if (typeof window === 'undefined' || typeof location === 'undefined') return true

  const h = location.hostname || ''
  const isLocal =
    !h ||
    h === 'localhost' ||
    /^127\./.test(h) ||
    h === '0.0.0.0' ||
    /^192\.168\./.test(h) ||
    /^10\./.test(h) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(h)
  if (isLocal) return true

  // 预渲染 / 爬虫 UA
  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent || ''
    if (/Prerender|HeadlessChrome|Puppeteer/i.test(ua)) return true
  }
  return false
}

/**
 * 上报百度统计事件
 *
 * @param category 事件类别（首字母大写英文，如 User / Analysis / Recharge）
 * @param action   事件操作（首字母大写英文，如 Login / Submit / PaySuccess）
 * @param label    （可选）事件标签，会展示在百度统计后台事件分析里
 * @param value    （可选）事件值，必须是 number；不是 number 会被忽略
 *
 * @example
 * trackEvent('User', 'Login', 'password')
 * trackEvent('Analysis', 'Submit', '600519')
 * trackEvent('Recharge', 'PaySuccess', orderNo, 99)
 */
export function trackEvent(
  category: string,
  action: string,
  label?: string,
  value?: number
): void {
  if (isTrackDisabled()) return

  try {
    const _hmt = window._hmt || (window._hmt = [])
    const payload: any[] = ['_trackEvent', category, action]
    if (label !== undefined && label !== null && label !== '') {
      payload.push(String(label))
      if (typeof value === 'number' && !Number.isNaN(value)) {
        payload.push(value)
      }
    }
    _hmt.push(payload)
  } catch (_) {
    // 上报失败不影响业务
  }
}

/**
 * 上报百度统计页面访问（手动调用场景；router 路由切换已自动上报）
 *
 * @param path 页面路径（默认 location.pathname + search）
 */
export function trackPageview(path?: string): void {
  if (isTrackDisabled()) return
  try {
    const _hmt = window._hmt || (window._hmt = [])
    const target = path || location.pathname + location.search
    _hmt.push(['_trackPageview', target])
  } catch (_) {
    // 上报失败不影响业务
  }
}
