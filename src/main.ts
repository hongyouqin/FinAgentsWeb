import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@unhead/vue'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import zhCn from 'element-plus/es/locale/lang/zh-cn'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

import NProgress from 'nprogress'
import App from './App.vue'
import router from './router'
import { setupGlobalComponents } from './components'
import { useAuthStore } from './stores/auth'
import { useAppStore } from './stores/app'
import { setupTokenRefreshTimer } from './utils/auth'
import weixin from './utils/weixin'
import wechatLogin from './utils/wechatLogin'
import './styles/index.scss'
import './styles/dark-theme.scss'

// 创建应用实例
const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用插件
const pinia = createPinia()
app.use(pinia)
app.use(router)

// 挂载 @unhead/vue：为每个路由提供独立的 title/description/canonical/og 等 SEO 元信息
const head = createHead()
app.use(head)
// 设置全局中文 locale（Element Plus）
dayjs.locale('zh-cn')
app.use(ElementPlus, {
  size: 'default',
  zIndex: 3000,
  locale: zhCn,
  // 配置消息提示
  message: {
    max: 3, // 最多同时显示3个消息
    grouping: true, // 启用消息分组，相同内容的消息不会重复显示
    duration: 3000, // 默认显示时长3秒
  },
})

// 注册全局组件
setupGlobalComponents(app)

// 注册全局 $wx 方法
app.config.globalProperties.$wx = weixin

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('全局错误:', err, info)

  // 检查是否是认证错误
  if (err && typeof err === 'object') {
    const error = err as any
    // 检查错误消息或状态码
    if (
      error.message?.includes('认证失败') ||
      error.message?.includes('登录已过期') ||
      error.message?.includes('Token') ||
      error.response?.status === 401 ||
      error.code === 401
    ) {
      console.log('🔒 全局错误处理：检测到认证错误，跳转登录页')
      const authStore = useAuthStore()
      authStore.clearAuthInfo()
      router.push('/login')
    }
  }

  // 这里可以集成错误监控服务
}

// 全局警告处理
app.config.warnHandler = (msg, vm, trace) => {
  console.warn('全局警告:', msg, trace)
}

// 初始化认证状态
const initApp = async () => {
  // 预渲染/爬虫分流：不走后端依赖的初始化，直接挂载并通知预渲染器 render-event
  // 识别条件：
  //   1) window.__PRERENDER_INJECTED__  （预渲染脚本注入）
  //   2) navigator.userAgent 包含 Headless / Prerender / Baiduspider / Googlebot 等爬虫特征
  const ua = (typeof navigator !== 'undefined' ? navigator.userAgent : '') || ''
  const isBot = /HeadlessChrome|Prerender|Baiduspider|Googlebot|bingbot|YisouSpider|Sogou web spider|360Spider|Bytespider/i.test(ua)
  const isPrerender = (typeof window !== 'undefined' && (window as any).__PRERENDER_INJECTED__) || isBot

  if (isPrerender) {
    console.log('🤖 检测到预渲染/爬虫环境，跳过 API 与认证初始化')
    try {
      const appStore = useAppStore()
      appStore.applyTheme()
    } catch (e) {
      // 预渲染环境下如果 store 异常也不中断挂载
      console.warn('预渲染环境应用主题失败，忽略:', e)
    }
    // 关键：必须等 router 完成初次路由匹配 + 异步组件加载
    // （否则 mount 时 router-view 仍是 Loading 状态，拓取出空 HTML）
    try {
      await router.isReady()
    } catch (e) {
      console.warn('预渲染 router.isReady 失败，忽略:', e)
    }
    app.mount('#app')
    // 给 Vue 一帧时间完成 DOM 挂载，再通知预渲染器抓取
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // 双保险：若路由守卫意外调用了 NProgress，彻底移除 .nprogress-busy class
        // 与 <div id="nprogress"> DOM，避免被 Puppeteer 抓进静态产物
        try {
          NProgress.remove()
          document.documentElement.classList.remove('nprogress-busy')
          const np = document.getElementById('nprogress')
          if (np && np.parentNode) np.parentNode.removeChild(np)
        } catch (e) {
          // 忽略，不影响预渲染
        }
        ;(window as any).__PRERENDER_READY__ = true
        document.dispatchEvent(new Event('render-event'))
        console.log('✅ 预渲染 render-event 已触发')
      })
    })
    return
  }

  try {
    const authStore = useAuthStore()
    const appStore = useAppStore()

    console.log('🔄 初始化应用状态...')

    // 应用主题
    appStore.applyTheme()
    console.log('🎨 主题已应用:', appStore.theme)

    // 设置网络状态监听
    window.addEventListener('online', () => {
      console.log('🌐 网络已连接')
      appStore.setOnlineStatus(true)
      appStore.checkApiConnection()
    })

    window.addEventListener('offline', () => {
      console.log('📱 网络已断开')
      appStore.setOnlineStatus(false)
      appStore.setApiConnected(false)
    })

    // 检查API连接状态
    console.log('🔍 检查API连接状态...')
    const apiConnected = await appStore.checkApiConnection()

    if (apiConnected) {
      console.log('✅ API连接正常，检查认证状态...')

      // 1. 先检查本地认证状态（token 是否有效）
      const checkPromise = authStore.checkAuthStatus()
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('认证检查超时')), 5000)
      })

      try {
        await Promise.race([checkPromise, timeoutPromise])
        console.log('✅ 认证状态初始化完成')
      } catch (e) {
        console.warn('⚠️ 认证检查超时或失败:', e)
      }

      // 2. 如果用户已登录，启动 token 自动刷新定时器
      if (authStore.isAuthenticated) {
        setupTokenRefreshTimer()

        // 登录状态访问埋点：一次会话（sessionStorage）内只上报一次
        if (!sessionStorage.getItem('login_track_reported')) {
          const { trackLogin } = await import('@/api/admin')
          trackLogin()
            .then(() => {
              sessionStorage.setItem('login_track_reported', '1')
              console.log('✅ 登录访问埋点上报成功')
            })
            .catch((err) => {
              // 埋点失败不影响主流程
              console.warn('⚠️ 登录访问埋点上报失败:', err)
            })
        }
      }

      // 3. 再检查微信登录（内部会判断是否已登录，已登录则跳过）
      await checkWechatLogin()
    } else {
      console.log('⚠️ API连接失败，跳过认证检查')
    }
  } catch (error: any) {
    console.warn('⚠️ 应用初始化失败，但应用将继续启动:', error)
    // 如果是网络错误，不影响应用启动
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.log('📱 离线模式：应用将在没有后端连接的情况下启动')
    }
  } finally {
    // 无论认证状态如何，都挂载应用
    app.mount('#app')
    console.log('🚀 应用已挂载')
  }
}

/**
 * 检查并处理微信登录
 */
async function checkWechatLogin(): Promise<boolean> {
  try {
    // 初始化微信登录配置
    wechatLogin.init({
      appId: import.meta.env.VITE_WECHAT_APP_ID || 'wx183521434338da29',
      redirectUri: window.location.origin + window.location.pathname,
      onSuccess: () => {
        // 登录成功后跳转到首页
        console.log('🏠 微信登录成功，跳转到首页')
        const redirectPath = useAuthStore().getAndClearRedirectPath()
        console.log('🔄 重定向到:', redirectPath)
        router.push(redirectPath)
      }
    })

    // 检查并处理微信登录
    const success = await wechatLogin.checkAndLogin()
    
    if (success) {
      console.log('✅ 微信登录处理完成')
      return true
    }
    
    return false
  } catch (error) {
    console.error('❌ 微信登录检查失败:', error)
    return false
  }
}

// 启动应用
initApp()

// 开发环境下的调试信息
if (import.meta.env.DEV) {
  console.log('🚀 TradingAgents-CN v1.0.0-preview 前端应用已启动')
  console.log('📊 当前环境:', import.meta.env.MODE)
  console.log('🔗 API地址:', import.meta.env.VITE_API_BASE_URL || '/api')
}
