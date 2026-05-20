import { defineStore } from 'pinia'
import { getSignStatus, submitSign, type SignStatus, type SignResult } from '@/api/sign'

/**
 * 签到余额阈值（前端成本控制）
 * 可用算力 ≥ 该阈值时，不予签到，鼓励用户先消耗现有算力。
 */
export const SIGN_BALANCE_THRESHOLD = 10

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
    /** 当前积分余额 */
    balance: (state): number => state.status?.current_power?.available ?? 0,
    /** 余额是否已足够（达阈值 → 无需签到领取） */
    isBalanceSufficient: (state): boolean =>
      (state.status?.current_power?.available ?? 0) >= SIGN_BALANCE_THRESHOLD,
    /** 余额阈值（供 UI 展示） */
    balanceThreshold: (): number => SIGN_BALANCE_THRESHOLD,
    /** 今日是否可以签到（同时考虑后端授权与前端余额阈值） */
    canSign: (state): boolean => {
      if (!state.status?.can_sign_today) return false
      if ((state.status?.current_power?.available ?? 0) >= SIGN_BALANCE_THRESHOLD) return false
      return true
    },
    /** 是否应该引导提示（可签到 + 未引导过） */
    shouldGuide: (state): boolean => {
      if (!state.initialized) return false
      if (state.guideShown) return false
      if (state.status?.has_signed) return false
      if (!state.status?.can_sign_today) return false
      if ((state.status?.current_power?.available ?? 0) >= SIGN_BALANCE_THRESHOLD) return false
      return true
    }
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
