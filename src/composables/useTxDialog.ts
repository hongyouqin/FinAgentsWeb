import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import paymentApi from '@/api/payment'

// ─── 模块级单例状态，全局共享 ──────────────────────────
const showTxDialog = ref(false)
const txLoading = ref(false)
const txType = ref<'ALL' | 'RECHARGE' | 'CONSUME'>('ALL')
const txLimit = ref(50)
const txList = ref<any[]>([])

export const txTypeTabs = [
  { label: '全部', value: 'ALL' },
  { label: '充值', value: 'RECHARGE' },
  { label: '消耗', value: 'CONSUME' },
]

export const loadTransactions = async () => {
  txLoading.value = true
  try {
    const res = await paymentApi.getTransactions({
      limit: txLimit.value,
      transaction_type: txType.value,
    })
    const d = res?.data ?? res
    const list = d?.transactions ?? d?.items ?? d?.list ?? (Array.isArray(d) ? d : [])
    txList.value = list.map((item: any) => ({
      id: item.id ?? item.transaction_id ?? item.order_no ?? '',
      type: (item.transaction_type ?? item.type ?? '').toUpperCase(),
      amount: item.power_amount ?? item.amount ?? item.points ?? 0,
      after_balance: item.after_balance ?? null,
      description: item.description ?? item.remark ?? item.note ?? '',
      created_at: item.created_at
        ? new Date(item.created_at).toLocaleString('zh-CN', { hour12: false })
        : (item.time ?? ''),
      order_no: item.order_no ?? item.ref_id ?? item.id ?? '',
    }))
  } catch {
    ElMessage.error('获取算力记录失败')
  } finally {
    txLoading.value = false
  }
}

export function useTxDialog() {
  const openTxDialog = () => {
    showTxDialog.value = true
    loadTransactions()
  }

  const selectTxType = (val: string) => {
    txType.value = val as 'ALL' | 'RECHARGE' | 'CONSUME'
    loadTransactions()
  }

  const getTxTypeTag = (type: string): 'success' | 'danger' | 'info' => {
    if (type === 'RECHARGE') return 'success'
    if (type === 'CONSUME') return 'danger'
    return 'info'
  }

  const getTxTypeText = (type: string) => {
    if (type === 'RECHARGE') return '充值'
    if (type === 'CONSUME') return '消耗'
    return type
  }

  return {
    showTxDialog,
    txLoading,
    txType,
    txList,
    txTypeTabs,
    loadTransactions,
    openTxDialog,
    selectTxType,
    getTxTypeTag,
    getTxTypeText,
  }
}
