import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

let refreshTimer: ReturnType<typeof setInterval> | null = null
let lastFetchTime = 0
const MIN_FETCH_INTERVAL = 3000

export function useBalance() {
  const authStore = useAuthStore()
  const isRefreshing = ref(false)

  const balance = computed(() => ({
    points: authStore.points,
    frozen: authStore.frozen,
    available: authStore.available,
    totalRecharged: authStore.totalRecharged,
    totalConsumed: authStore.totalConsumed,
    symbol: authStore.balanceSymbol
  }))

  const formattedBalance = computed(() => ({
    points: `${authStore.points} ${authStore.balanceSymbol}`,
    available: `${authStore.available} ${authStore.balanceSymbol}`,
    frozen: `${authStore.frozen} ${authStore.balanceSymbol}`
  }))

  const refreshBalance = async (force = false) => {
    const now = Date.now()
    if (!force && now - lastFetchTime < MIN_FETCH_INTERVAL) {
      return
    }

    if (isRefreshing.value) {
      return
    }

    isRefreshing.value = true
    try {
      await authStore.fetchUserBalance()
      lastFetchTime = now
    } finally {
      isRefreshing.value = false
    }
  }

  const startAutoRefresh = (interval = 60000) => {
    if (refreshTimer) {
      clearInterval(refreshTimer)
    }
    refreshTimer = setInterval(() => {
      if (authStore.isAuthenticated) {
        refreshBalance()
      }
    }, interval)
  }

  const stopAutoRefresh = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }

  return {
    balance,
    formattedBalance,
    isRefreshing,
    refreshBalance,
    startAutoRefresh,
    stopAutoRefresh
  }
}

export function useBalanceAutoRefresh(interval = 60000) {
  const { refreshBalance, startAutoRefresh, stopAutoRefresh } = useBalance()

  onMounted(() => {
    refreshBalance(true)
    startAutoRefresh(interval)
  })

  onUnmounted(() => {
    stopAutoRefresh()
  })

  return useBalance()
}
