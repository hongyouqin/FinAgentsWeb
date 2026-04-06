/**
 * 微信登录工具类
 * 实现微信公众号授权登录流程
 */

import weixin from './weixin'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

interface WechatLoginConfig {
  appId: string
  redirectUri: string
  onSuccess?: () => void // 登录成功后的回调
}

class WechatLogin {
  private config: WechatLoginConfig | null = null

  /**
   * 初始化微信登录配置
   */
  init(config: WechatLoginConfig) {
    this.config = config
  }

  /**
   * 获取当前配置
   */
  getConfig(): WechatLoginConfig | null {
    return this.config
  }

  /**
   * 检查是否在微信环境中
   */
  isWechat(): boolean {
    return weixin.isWechatEnv()
  }

  /**
   * 获取 URL 中的 code 参数
   */
  getCodeFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('code')
  }

  /**
   * 清除 URL 中的 code 参数（避免重复使用）
   */
  clearCodeFromUrl() {
    const url = new URL(window.location.href)
    url.searchParams.delete('code')
    url.searchParams.delete('state')
    window.history.replaceState({}, '', url.toString())
  }

  /**
   * 开始微信授权登录流程
   * @param redirectUri 授权后重定向的 URI
   */
  startAuth(redirectUri?: string) {
    if (!this.config) {
      console.error('❌ 微信登录未初始化')
      return
    }

    const uri = redirectUri || this.config.redirectUri
    console.log('🔐 开始微信授权登录...', {
      appId: this.config.appId,
      redirectUri: uri
    })

    // 调用微信授权接口
    weixin.getWechatCodeForUser(this.config.appId, uri)
  }

  /**
   * 处理微信授权回调
   * @param code 微信授权码
   * @returns 是否成功处理
   */
  async handleAuthCallback(code: string): Promise<boolean> {
    try {
      console.log('📨 处理微信授权回调，code:', code)

      // 获取当前页面的完整 URL（用于后端生成 JSSDK 配置）
      const currentUrl = window.location.href.split('?')[0] // 去除 code 参数

      // 1. 调用后端接口，用 code 换取登录信息
      const response = await fetch(`/api/auth/wechat/login?code=${code}&url=${currentUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // body: JSON.stringify({ 
        //   code,
        //   url: currentUrl // 传递当前页面 URL，用于生成 JSSDK 签名
        // })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()
      console.log('📥 微信登录响应:', result)

      if (!result.success) {
        throw new Error(result.message || '微信登录失败')
      }

      // 2. 获取 auth store
      const authStore = useAuthStore()

      // 3. 设置认证信息
      const { access_token, refresh_token, user, wx_config } = result.data

      // 设置登录信息
      authStore.setAuthInfo(access_token, refresh_token, user)

      // 开源版admin用户拥有所有权限
      authStore.permissions = ['*']
      authStore.roles = ['admin']

      // 同步用户偏好设置到 appStore
      authStore.syncUserPreferencesToAppStore()

      // 获取积分余额
      authStore.fetchUserBalance()

      // 启动积分自动刷新定时器（每60秒刷新一次）
      authStore.startBalanceAutoRefresh(30000)

      // 启动 token 自动刷新定时器
      const { setupTokenRefreshTimer } = await import('./auth')
      setupTokenRefreshTimer()

      // 4. 如果返回了 jssdk_config，进行注册
      if (wx_config) {
        await this.registerJSSDK(wx_config)
      }

      // 5. 清除 URL 中的 code 参数
      this.clearCodeFromUrl()

      console.log('✅ 微信登录成功')
      ElMessage.success('微信登录成功')

      // 6. 触发成功回调（如果配置了）
      if (this.config?.onSuccess) {
        this.config.onSuccess()
      }

      return true
    } catch (error: any) {
      console.error('❌ 微信登录失败:', error)
      ElMessage.error(error.message || '微信登录失败，请重试')
      return false
    }
  }

  /**
   * 注册 JSSDK
   * @param config JSSDK 配置信息
   */
  async registerJSSDK(config: any) {
    try {
      console.log('🔧 注册微信 JSSDK...')

      await weixin.config({
        debug: false, // 生产环境设为 false
        appId: config.appId,
        timestamp: config.timestamp,
        nonceStr: config.nonceStr,
        signature: config.signature,
        jsApiList: config.jsApiList || ['chooseWXPay', 'updateAppMessageShareData', 'updateTimelineShareData', 'downloadImage']
      })

      console.log('✅ 微信 JSSDK 注册成功')
    } catch (error) {
      console.error('❌ 微信 JSSDK 注册失败:', error)
      // JSSDK 注册失败不影响登录流程
    }
  }

  /**
   * 检查并处理微信登录
   * 在应用启动时调用此方法
   * @returns 是否进行了微信登录
   */
  async checkAndLogin(): Promise<boolean> {
    // 1. 检查是否在微信环境中
    if (!this.isWechat()) {
      console.log('ℹ️ 非微信环境，跳过微信登录')
      return false
    }

    // 2. 检查 URL 中是否有 code 参数
    const code = this.getCodeFromUrl()
    if (!code) {
      console.log('ℹ️ URL 中没有 code 参数，开始微信授权')
      // 如果没有 code，开始授权流程
      this.startAuth()
      return false
    }

    // 3. 有 code，处理授权回调
    console.log('✅ 检测到微信授权码，处理登录...')
    const success = await this.handleAuthCallback(code)

    return success
  }

  /**
   * 主动触发微信登录（用于登录按钮点击等场景）
   */
  triggerWechatLogin() {
    if (!this.isWechat()) {
      ElMessage.warning('请在微信中打开')
      return
    }

    this.startAuth()
  }
}

// 创建单例实例
const wechatLogin = new WechatLogin()

export default wechatLogin
