import { defineStore } from 'pinia'
import { getSignStatus, submitSign, type SignStatus, type SignResult } from '@/api/sign'

interface SignState {
  /** 签到状态 */
  status: SignStatus | null
  /** 加载中 */
  loading: boolean
  /** 签到弹窗可见 */
  dialogVisible: boolean
  /** 签到结果（用于弹窗动画） */
  lastResult: SignResult | null
  /** 签到按钮动画中 */
  animating: boolean
  /** 已初始化（首次 fetchStatus 后标记） */
  initialized: boolean
  /** 登录后引导提示是否已展示过（本次会话） */
  guideShown: boolean
}

export const useSignStore = defineStore('sign', {
  state: (): SignState => ({
    status: null,
    loading: false,
    dialogVisible: false,
    lastResult: null,
    animating: false,
    initialized: false,
    guideShown: false
  }),

  getters: {
    /** 今日是否已签到 */
    signed: (state): boolean => state.status?.has_signed ?? false,
    /** 今日是否可以签到 */
    canSign: (state): boolean => state.status?.can_sign_today ?? false,
    /** 当前积分余额 */
    balance: (state): number => state.status?.current_power?.available ?? 0,
    /** 是否应该引导提示（可签到 + 未引导过） */
    shouldGuide: (state): boolean => (state.status?.can_sign_today ?? false) && !state.status?.has_signed && !state.guideShown && state.initialized
  },

  actions: {
    /** 获取签到状态 */
    async fetchStatus() {
      this.loading = true
      try {
        const res = await getSignStatus()
        if (res.success && res.data) {
          this.status = res.data
        }
      } catch (err) {
        console.error('获取签到状态失败:', err)
      } finally {
        this.loading = false
        this.initialized = true
      }
    },

    /** 提交签到 */
    async doSign() {
      if (this.signed || !this.canSign || this.animating) return false
      this.animating = true
      try {
        const res = await submitSign()
        if (res.success) {
          this.lastResult = res.data ?? null
          // 更新本地状态为已签到
          if (this.status) {
            this.status.has_signed = true
            this.status.can_sign_today = false
            // 如果返回了新的积分快照，更新
            if (res.data?.current_power) {
              this.status.current_power = res.data.current_power
            }
          }
          return true
        }
        return false
      } catch (err) {
        console.error('签到失败:', err)
        return false
      } finally {
        this.animating = false
      }
    },

    /** 打开签到弹窗 */
    openDialog() {
      this.dialogVisible = true
      // 每次打开弹窗刷新一下状态
      if (!this.status) {
        this.fetchStatus()
      }
    },

    /** 关闭签到弹窗 */
    closeDialog() {
      this.dialogVisible = false
      this.lastResult = null
    },

    /** 标记引导已展示 */
    markGuideShown() {
      this.guideShown = true
    },

    /** 重置（登出时调用） */
    reset() {
      this.status = null
      this.loading = false
      this.dialogVisible = false
      this.lastResult = null
      this.animating = false
      this.initialized = false
      this.guideShown = false
    }
  }
})
