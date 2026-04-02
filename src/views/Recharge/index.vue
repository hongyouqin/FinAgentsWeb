<template>
  <div class="recharge-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-bg">
        <div class="particles-container">
          <div
            v-for="(p, i) in particles"
            :key="i"
            class="particle"
            :style="{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.size}px`, height: `${p.size}px`, opacity: p.opacity }"
          />
        </div>
        <div class="grid-overlay" />
        <div class="scan-line" />
        <div class="glow-effect glow-1" />
        <div class="glow-effect glow-2" />
      </div>
      <div class="hero-content">
        

      <!-- 算力余额卡片 -->
        <div class="balance-card">
          <div class="balance-main" style="position: relative;">
            <div class="balance-icon-wrap">
              <el-icon><Coin /></el-icon>
            </div>
            <div class="balance-info">
              <div class="balance-label">当前算力余额</div>
              <div class="balance-value">{{ userPoints.toLocaleString() }}</div>
              <div class="balance-unit">算力 · 立即可用</div>
            </div>
            <!-- 算力记录按钮 -->
            <div class="tx-btn-row" style="position: absolute; right: 0; top: 0;">
            <el-button
              class="tx-btn"
              size="small"
              @click="openTxDialog"
            >
              <el-icon><List /></el-icon>
              算力记录
            </el-button>
          </div>
          </div>
          <div class="balance-stats">
            <div class="stat-item">
              <span class="stat-num">{{ authStore.totalRecharged.toLocaleString() }}</span>
              <span class="stat-label">累计充值(⚡)</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-num">{{ authStore.totalConsumed.toLocaleString() }}</span>
              <span class="stat-label">累计消耗(⚡)</span>
            </div>
            <div class="stat-divider"></div>
            <!-- <div class="stat-item">
              <span class="stat-num">{{ rechargeCount }}</span>
              <span class="stat-label">充值次数</span>
            </div> -->
          </div>
        </div>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="main-body">

      <!-- 充值套餐 -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-title">
            <el-icon><Wallet /></el-icon>
            <span>选择充值套餐</span>
          </div>
          <span class="section-tip">算力可用于 AI 分析任务消耗</span>
        </div>

        <div v-loading="packagesLoading" class="packages-grid">
          <div
            v-for="pkg in packages"
            :key="pkg.id"
            class="package-card"
            :class="{ active: selectedPackage === pkg.id, popular: pkg.popular }"
            @click="selectedPackage = pkg.id"
          >
            <div v-if="pkg.popular" class="pkg-badge popular-badge">热门</div>
            <div v-if="pkg.best" class="pkg-badge best-badge">超值</div>
            <div class="pkg-name">{{ pkg.name }}</div>
            <div class="pkg-price">
              <span class="price-symbol">¥</span>
              <span class="price-num">{{ pkg.price }}</span>
            </div>
            <div class="pkg-points">
              <el-icon><Coin /></el-icon>
              {{ pkg.total_power }} ⚡
            </div>
            <div v-if="pkg.bonus > 0" class="pkg-bonus">+{{ pkg.bonus }} 赠送</div>
            <div class="pkg-unit">¥{{ pkg.unit_price }}/⚡</div>
          </div>
        </div>

        <!-- 支付方式 -->
        <div class="payment-section">
          <div class="payment-label">支付方式</div>
          <div class="payment-methods">
            <div
              v-for="method in paymentMethods"
              :key="method.id"
              class="payment-method"
              :class="{ active: selectedPayment === method.id }"
              @click="selectedPayment = method.id"
            >
              <el-icon><component :is="method.icon" /></el-icon>
              <span>{{ method.label }}</span>
            </div>
          </div>
        </div>

        <!-- 确认充值 -->
        <div class="confirm-section">
          <div class="confirm-amount">
            <span class="amount-label">应付金额：</span>
            <span class="amount-value">¥ {{ confirmAmount }}</span>
            <span class="amount-points">获得 <em>{{ confirmPoints }}</em> ⚡</span>
          </div>
          <el-button
            type="primary"
            size="large"
            class="recharge-btn"
            :disabled="!canRecharge"
            @click="handleRecharge"
          >
            <el-icon><CreditCard /></el-icon>
            立即充值
          </el-button>
        </div>
      </div>

      <!-- 充值记录 -->
      <div class="section-card history-card">
        <div class="section-header">
          <div class="section-title">
            <el-icon><Document /></el-icon>
            <span>充值记录</span>
          </div>
          <el-button text size="small" @click="loadHistory" :loading="historyLoading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>

        <!-- 桌面端表格 -->
        <el-table
          v-if="!isMobile"
          :data="historyList"
          v-loading="historyLoading"
          class="history-table"
          stripe
        >
          <el-table-column label="充值时间" prop="created_at" width="180">
            <template #default="{ row }">
              <span class="time-text">{{ row.created_at }}</span>
            </template>
          </el-table-column>
          <el-table-column label="套餐" prop="package_name" min-width="120" />
          <el-table-column label="充值金额" width="120" align="right">
            <template #default="{ row }">
              <span class="amount-cell">¥{{ row.amount }}</span>
            </template>
          </el-table-column>
          <el-table-column label="获得算力" width="120" align="right">
            <template #default="{ row }">
              <span class="points-cell">+{{ row.points.toLocaleString() }}</span>
            </template>
          </el-table-column>
          <el-table-column label="支付方式" prop="payment_method" width="100" />
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small" round>
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="交易号" prop="order_no" min-width="180">
            <template #default="{ row }">
              <span class="order-no">{{ row.order_no }}</span>
            </template>
          </el-table-column>
        </el-table>

        <!-- 移动端卡片 -->
        <div v-else class="history-mobile">
          <div
            v-for="record in historyList"
            :key="record.id"
            class="history-item"
          >
            <div class="history-item-top">
              <span class="history-pkg">{{ record.package_name }}</span>
              <el-tag :type="getStatusType(record.status)" size="small" round>
                {{ getStatusText(record.status) }}
              </el-tag>
            </div>
            <div class="history-item-mid">
              <span class="history-amount">¥{{ record.amount }}</span>
              <span class="history-points">+{{ record.points.toLocaleString() }} 算力</span>
            </div>
            <div class="history-item-bot">
              <span class="history-time">{{ record.created_at }}</span>
              <span class="history-method">{{ record.payment_method }}</span>
            </div>
          </div>
          <div v-if="historyList.length === 0 && !historyLoading" class="empty-state">
            <el-icon class="empty-icon"><Document /></el-icon>
            <p>暂无充值记录</p>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="historyList.length === 0 && !historyLoading && !isMobile" class="empty-state">
          <el-icon class="empty-icon"><Document /></el-icon>
          <p>暂无充值记录</p>
        </div>

        <!-- 分页 -->
        <div v-if="historyTotal > 0" class="pagination-wrap">
          <el-pagination
            v-model:current-page="historyPage"
            v-model:page-size="historyPageSize"
            :total="historyTotal"
            :layout="isMobile ? 'prev, pager, next' : 'total, prev, pager, next'"
            :pager-count="isMobile ? 5 : 7"
            :small="isMobile"
            @current-change="loadHistory"
          />
        </div>
      </div>
    </div>

    <!-- 算力记录弹框已移至全局 TxDialog.vue，由 useTxDialog 控制 -->

    <!-- 支付对话框 -->
    <el-dialog
      v-model="showPayDialog"
      title="微信扫码支付"
      width="400px"
      align-center
      :close-on-click-modal="false"
      @close="stopPolling"
    >
      <div class="pay-dialog">
        <!-- 订单信息 -->
        <div class="pay-info-list">
          <div class="pay-info">
            <span class="pay-label">套餐：</span>
            <span class="pay-val">{{ pendingPackageName }}</span>
          </div>
          <div class="pay-info">
            <span class="pay-label">金额：</span>
            <span class="pay-val pay-price">¥ {{ confirmAmount }}</span>
          </div>
          <div class="pay-info">
            <span class="pay-label">获得算力：</span>
            <span class="pay-val pay-points">{{ confirmPoints }} ⚡</span>
          </div>
        </div>

        <!-- 加载中 -->
        <div v-if="payLoading" class="qr-area qr-loading">
          <el-icon class="qr-spin"><Refresh /></el-icon>
          <p>正在发起支付...</p>
        </div>

        <!-- PC: 二维码显示 -->
        <div v-else-if="payScene === 'NATIVE' && qrDataUrl && payStatus === 'pending'" class="qr-area">
          <div class="qr-wrap">
            <img :src="qrDataUrl" alt="支付二维码" class="qr-img" />
          </div>
          <p class="qr-tip">
            <el-icon><component :is="'ChatRound'" /></el-icon>
            请使用微信扫描二维码完成支付
          </p>
          <div v-if="currentOrderNo" class="qr-order">订单号：{{ currentOrderNo }}</div>
          <div v-if="countdownSec > 0" class="qr-countdown" :class="{ 'urgent': countdownSec <= 60 }">
            二维码有效期：{{ countdownDisplay }}
          </div>
        </div>

        <!-- 手机端（MWEB/JSAPI）: 支付链接跳转 -->
        <div v-else-if="(payScene === 'H5' || payScene === 'JSAPI') && payStatus === 'pending'" class="qr-area qr-mweb">
          <el-icon size="48"><Promotion /></el-icon>
          <p class="mweb-tip">请点击下方按钮前往支付</p>
          <el-button
            type="primary"
            size="large"
            class="mweb-pay-btn"
            @click="openMwebPay"
          >前往支付</el-button>
          <p class="mweb-sub">支付完成后点击「我已完成支付」确认</p>
          <div v-if="countdownSec > 0" class="qr-countdown" :class="{ 'urgent': countdownSec <= 60 }">
            有效期：{{ countdownDisplay }}
          </div>
        </div>

        <!-- 过期提示 -->
        <div v-else-if="payStatus === 'expired'" class="qr-area qr-expired">
          <el-icon size="48"><CreditCard /></el-icon>
          <p>支付已过期</p>
          <el-button type="primary" size="small" @click="refreshQrCode">重新发起</el-button>
        </div>

        <!-- 失败提示 -->
        <div v-else-if="payStatus === 'failed'" class="qr-area qr-failed">
          <el-icon size="48"><CreditCard /></el-icon>
          <p>支付失败，请重试</p>
          <el-button type="primary" size="small" @click="refreshQrCode">重新支付</el-button>
        </div>
      </div>

      <template #footer>
        <el-button @click="showPayDialog = false; stopPolling()">取消</el-button>
        <el-button type="primary" :disabled="!currentOrderNo" @click="handlePaidManually">我已完成支付</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useWindowSize } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import paymentApi from '@/api/payment'
import QRCode from 'qrcode'
import { useTxDialog } from '@/composables/useTxDialog'
import weixin from '@/utils/weixin'
import {
  Coin, Wallet, CreditCard, Document, Refresh, Promotion, List
} from '@element-plus/icons-vue'

const authStore = useAuthStore()
const { width: windowWidth } = useWindowSize()
const isMobile = computed(() => windowWidth.value <= 768)

const wechatCode = ref<string | null>(null)
const isWxConfigured = ref(false)

// 粒子背景
const particles = ref<Array<{ x: number; y: number; size: number; opacity: number }>>([])
const initParticles = () => {
  particles.value = Array.from({ length: 25 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    opacity: Math.random() * 0.5 + 0.15
  }))
}

// 算力余额（从后端获取）
const userPoints = computed(() => authStore.points)

// 充值套餐
interface RechargePackage {
  id: string
  name: string
  price: number
  power: number
  bonus: number
  total_power: number
  popular: boolean
  best?: boolean
  description: string
  unit_price: number
}

const packagesLoading = ref(false)
const packages = ref<RechargePackage[]>([])
const fetchPackages = async () => {
  packagesLoading.value = true
  try {
    const res = await fetch('/api/payment/recharge/packages', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const result = await res.json()
    const list = result.data || result.packages || result || []
    packages.value = (Array.isArray(list) ? list : []).map((item: any): RechargePackage => ({
      id: String(item.id),
      name: item.name ?? '',
      price: item.price,
      power: item.power,
      bonus: item.bonus ?? 0,
      total_power: item.total_power ?? item.power,
      popular: item.popular ?? false,
      description: item.description ?? '',
      unit_price: item.unit_price ?? 0
    }))
    // 默认选中第一个热门套餐，否则选第一个
    if (packages.value.length > 0) {
      const popular = packages.value.find(p => p.popular)
      selectedPackage.value = popular ? popular.id : packages.value[0].id
    }
  } catch (e: any) {
    ElMessage.error('获取套餐列表失败，使用默认套餐')
    packages.value = [
      { id: 'PACK_001', name: '体验包', price: 9.9, power: 10, bonus: 0, total_power: 10, popular: false, description: '9.9元充值10⚡', unit_price: 0.99 },
      { id: 'PACK_002', name: '标准包', price: 19.8, power: 20, bonus: 0, total_power: 20, popular: true, description: '19.8元充值20⚡', unit_price: 0.99 },
      { id: 'PACK_003', name: '畅享包', price: 49, power: 50, bonus: 2, total_power: 52, popular: false, description: '49元充值50⚡+赠送2⚡', unit_price: 0.94 },
      { id: 'PACK_004', name: '尊享包', price: 98, power: 100, bonus: 5, total_power: 105, popular: true, description: '98元充值100⚡+赠送5⚡', unit_price: 0.93 },
      { id: 'PACK_005', name: '企业包', price: 198, power: 200, bonus: 15, total_power: 215, popular: false, description: '198元充值200⚡+赠倁15⚡', unit_price: 0.92 },
    ]
    selectedPackage.value = 'PACK_002'
  } finally {
    packagesLoading.value = false
  }
}

const selectedPackage = ref<string | null>(null)
// 支付方式
const paymentMethods = [
  { id: 'wechat', label: '微信支付', icon: 'ChatRound' },
  // { id: 'alipay', label: '支付宝', icon: 'Wallet' },
]
const selectedPayment = ref('wechat')

// 计算确认金额
const confirmAmount = computed(() => {
  if (selectedPackage.value) {
    const pkg = packages.value.find((p: RechargePackage) => p.id === selectedPackage.value)
    return pkg ? pkg.price.toFixed(2) : '0.00'
  }
  return '0.00'
})

const confirmPoints = computed(() => {
  if (selectedPackage.value) {
    const pkg = packages.value.find((p: RechargePackage) => p.id === selectedPackage.value)
    return pkg ? pkg.total_power : 0
  }
  return 0
})

const canRecharge = computed(() => {
  return confirmPoints.value > 0 && selectedPayment.value
})

const pendingPackageName = computed(() => {
  const pkg = packages.value.find((p: RechargePackage) => p.id === selectedPackage.value)
  return pkg ? pkg.name : ''
})

// ─── 支付对话框 ─────────────────────────────────────────
const showPayDialog = ref(false)
const payLoading = ref(false)          // 下单中
const payScene = ref<'NATIVE' | 'JSAPI' | 'H5'>('NATIVE')  // 支付场景
const qrDataUrl = ref('')              // 二维码图片 base64
const mwebPayUrl = ref('')             // MWEB 支付跳转链接
const currentOrderNo = ref('')         // 当前订单号
const payStatus = ref<'pending' | 'paid' | 'failed' | 'expired'>('pending')
const countdownSec = ref(0)            // 倒计时秒数
let pollTimer: ReturnType<typeof setInterval> | null = null
let countdownTimer: ReturnType<typeof setInterval> | null = null

// ─── 支付环境检测 & 场景判断 ─────────────────────
const getPayEnv = (): 'wechat' | 'mobile' | 'pc' => {
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes('micromessenger')) return 'wechat'
  if (/android|iphone|ipad|ipod|mobile/.test(ua)) return 'mobile'
  return 'pc'
}

const getPaymentScene = (): 'NATIVE' | 'JSAPI' | 'H5' => {
  // const env = getPayEnv()
  // if (env === 'wechat') return 'JSAPI'
  // if (env === 'mobile') return 'H5'
  const env = getPayEnv()
  if (env === 'wechat') return 'JSAPI'
  if (env === 'mobile') return 'NATIVE'
  return 'NATIVE'
}



/** 解析 prepare 返回中的支付 URL，兆容多种字段名 */
const resolveQrUrl = (data: any): string => {
  return data?.code_url || data?.qr_code_url || data?.url || data?.qrcode_url || ''
}

/** 启动订单状态轮询 */
const startPolling = (orderNo: string) => {
  stopPolling()
  pollTimer = setInterval(async () => {
    try {
      const res = await paymentApi.queryStatus(orderNo)
      const d = res?.data ?? res
      const status = d?.status ?? d?.pay_status ?? ''
      if (status === 'paid' || status === 'success') {
        stopPolling()
        payStatus.value = 'paid'
        showPayDialog.value = false
        ElMessage.success('支付成功！算力已到账 🎉')
        authStore.fetchUserBalance()
        loadHistory()
      } else if (status === 'failed' || status === 'expired') {
        stopPolling()
        payStatus.value = status as 'failed' | 'expired'
        ElMessage.error(status === 'expired' ? '二维码已过期，请重新发起支付' : '支付失败，请重试')
      }
    } catch {
      // 轮询失败不中断，继续等待
    }
  }, 3000)
}

/** 停止轮询 & 倒计时 */
const stopPolling = () => {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null }
}

/** 启动倒计时 */
const startCountdown = (seconds: number) => {
  countdownSec.value = seconds
  if (countdownTimer) clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    countdownSec.value -= 1
    if (countdownSec.value <= 0) {
      clearInterval(countdownTimer!)
      countdownTimer = null
      if (payStatus.value === 'pending') {
        payStatus.value = 'expired'
        stopPolling()
      }
    }
  }, 1000)
}

const countdownDisplay = computed(() => {
  const m = Math.floor(countdownSec.value / 60).toString().padStart(2, '0')
  const s = (countdownSec.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

/** 从 URL 中获取微信授权 code */
const getWechatCodeFromUrl = (): string | null => {
  const params = new URLSearchParams(window.location.search)
  return params.get('code')
}

/** 清理 URL 中的 code 参数 */
const clearWechatCodeFromUrl = () => {
  const url = new URL(window.location.href)
  url.searchParams.delete('code')
  url.searchParams.delete('state')
  window.history.replaceState({}, '', url.toString())
}

/** 点击「立即充值」- 下单 + 准备支付 */
const handleRecharge = async () => {
  if (!canRecharge.value) {
    ElMessage.warning('请选择充值套餐')
    return
  }
  const scene = getPaymentScene()
  const mscene = scene === 'JSAPI' ? 'JSAPI' : 'NATIVE'
  payScene.value = scene
  payLoading.value = true
  qrDataUrl.value = ''
  currentOrderNo.value = ''
  payStatus.value = 'pending'
  showPayDialog.value = true

  try {
    if (scene === 'JSAPI') {
      await handleJSAPIPayment()
      return
    }

    await handleNormalPayment(mscene)
  } catch (e: any) {
    showPayDialog.value = false
    ElMessage.error(e?.message || '发起支付失败，请重试')
  } finally {
    payLoading.value = false
  }
}

/** 调用微信支付 JSBridge */
const invokeWeixinPay = (payParams: {
  appId: string
  timeStamp: string
  nonceStr: string
  packageValue: string
  signType: string
  paySign: string
}): Promise<void> => {
  return new Promise((resolve, reject) => {
    const onBridgeReady = () => {
      // @ts-ignore
      WeixinJSBridge.invoke(
        'getBrandWCPayRequest',
        {
          appId: payParams.appId,
          timeStamp: payParams.timeStamp,
          nonceStr: payParams.nonceStr,
          package: payParams.packageValue,  // 映射到微信支付 API 的 package 字段
          signType: payParams.signType,
          paySign: payParams.paySign
        },
        (res: any) => {
          if (res.err_msg === 'get_brand_wcpay_request:ok') {
            ElMessage.success('支付成功！')
            resolve()
          } else if (res.err_msg === 'get_brand_wcpay_request:cancel') {
            ElMessage.info('支付已取消')
            reject(new Error('用户取消支付'))
          } else {
            ElMessage.error(res.err_desc || '支付失败')
            reject(new Error(res.err_desc || '支付失败'))
          }
        }
      )
    }

    // @ts-ignore
    if (typeof WeixinJSBridge === 'undefined') {
      // @ts-ignore
      if (document.addEventListener) {
        // @ts-ignore
        document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false)
      } else if ((document as any).attachEvent) {
        // @ts-ignore
        document.attachEvent('WeixinJSBridgeReady', onBridgeReady)
        // @ts-ignore
        document.attachEvent('onWeixinJSBridgeReady', onBridgeReady)
      }
    } else {
      onBridgeReady()
    }
  })
}

/** 初始化微信 SDK 配置 */
const initWxConfig = async () => {
  if (!wechatCode.value || !weixin.isWechatEnv()) {
    return
  }

  try {
    const configRes = await paymentApi.configcallback(wechatCode.value!)
    const configData = configRes?.data ?? configRes
    const wxConfig = configData?.wxConfig
    if (wxConfig) {
      // await weixin.config(wxConfig)
      isWxConfigured.value = true
      console.log('微信 SDK 配置成功')
    }
  } catch (e: any) {
    console.warn('初始化 wxConfig 失败:', e)
  }
}

/** 处理 JSAPI 微信支付 */
const handleJSAPIPayment = async () => {
  if (!wechatCode.value) {
    showPayDialog.value = false
    payLoading.value = false
    const redirectUri = window.location.href
    const state = 'recharge'
    weixin.getWechatCode('wx183521434338da29', redirectUri, state)
    return
  }
  await initWxConfig()

  const createRes = await paymentApi.createOrder({
    package_id: selectedPackage.value!,
    payment_scene: 'JSAPI',
  })
  const createData = createRes?.data ?? createRes
  const orderNo = createData?.order_no
  if (!orderNo) throw new Error('未获取到订单号')
  currentOrderNo.value = orderNo

  const prepareRes = await paymentApi.prepareOrder(orderNo)
  const prepareData = prepareRes?.data ?? prepareRes
  const expireSec = prepareData?.expire_seconds ?? 300

  // 使用字符串访问避免 package 保留字冲突
  const appId = prepareData.appId
  const timeStamp = prepareData.timeStamp
  const nonceStr = prepareData.nonceStr
  const packageValue = prepareData['package']  // 使用字符串访问
  const signType = prepareData.signType
  const paySign = prepareData.paySign

  if (!appId || !timeStamp || !nonceStr || !packageValue || !signType || !paySign) {
    throw new Error('支付参数不完整')
  }

  startCountdown(expireSec)
  startPolling(orderNo)

  // 使用 WeixinJSBridge 原生调用
  await invokeWeixinPay({
    appId,
    timeStamp,
    nonceStr,
    packageValue,
    signType,
    paySign
  })
}

/** 处理普通支付（NATIVE/H5） */
const handleNormalPayment = async (paymentScene: string) => {
  const createRes = await paymentApi.createOrder({
    package_id: selectedPackage.value!,
    payment_scene: paymentScene as any
  })
  const createData = createRes?.data ?? createRes
  const orderNo = createData?.order_no
  if (!orderNo) throw new Error('未获取到订单号')
  currentOrderNo.value = orderNo

  const prepareRes = await paymentApi.prepareOrder(orderNo)
  const prepareData = prepareRes?.data ?? prepareRes
  const expireSec = prepareData?.expire_seconds ?? 300

  if (payScene.value === 'NATIVE') {
    const qrUrl = resolveQrUrl(prepareData)
    if (!qrUrl) throw new Error('未获取到支付二维码链接')
    qrDataUrl.value = await QRCode.toDataURL(qrUrl, {
      width: 220, margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' }
    })
    startCountdown(expireSec)
    startPolling(orderNo)
  } else if (payScene.value === 'H5') {
    const payUrl = resolveQrUrl(prepareData) || prepareData?.mweb_url || prepareData?.h5_url
    if (!payUrl) throw new Error('未获取到支付链接')
    mwebPayUrl.value = payUrl
    startCountdown(expireSec)
    startPolling(orderNo)
    const handleVisibility = () => {
      if (!document.hidden && payStatus.value === 'pending') {
        startPolling(orderNo)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility, { once: true })
  }
}

/** 重新获取二维码 */
const refreshQrCode = () => {
  stopPolling()
  mwebPayUrl.value = ''
  handleRecharge()
}

/** MWEB: 跳转到支付页面 */
const openMwebPay = () => {
  if (mwebPayUrl.value) {
    window.open(mwebPayUrl.value, '_blank')
  }
}

/** 用户手动确认已支付 */
const handlePaidManually = async () => {
  stopPolling()
  showPayDialog.value = false
  ElMessage.info('正在查询支付结果...')
  await authStore.fetchUserBalance()
  await loadHistory()
}

// 充值记录
const historyLoading = ref(false)
const historyPage = ref(1)
const historyPageSize = ref(20)
const historyTotal = ref(0)
const historyList = ref<any[]>([])

const loadHistory = async () => {
  historyLoading.value = true
  try {
    const skip = (historyPage.value - 1) * historyPageSize.value
    const res = await paymentApi.getHistory({ skip, limit: historyPageSize.value })
    const d = res?.data ?? res
    // 兑容多种返回结构
    const list = d?.orders ?? d?.items ?? d?.list ?? (Array.isArray(d) ? d : [])
    const total = d?.total ?? d?.count ?? list.length
    historyList.value = list.map((item: any) => ({
      id: item.id ?? item.order_no,
      created_at: item.created_timestamp
        ? new Date(item.created_timestamp).toLocaleString('zh-CN', { hour12: false })
        : (item.created_at ?? item.pay_time ?? ''),
      package_name: item.package_name ?? item.pkg_name ?? item.name ?? '',
      amount: item.price ?? item.amount ?? item.pay_amount ?? 0,
      points: item.total_power ?? item.points ?? item.power_amount ?? item.credits ?? 0,
      payment_method: item.payment_method ?? item.pay_method ?? '微信支付',
      status: (item.status ?? 'SUCCESS').toUpperCase(),
      order_no: item.order_no ?? item.order_id ?? item.id ?? ''
    }))
    historyTotal.value = total
  } catch {
    ElMessage.error('获取充值记录失败')
  } finally {
    historyLoading.value = false
  }
}

const getStatusType = (status: string): 'success' | 'info' | 'warning' | 'danger' => {
  const map: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
    SUCCESS: 'success', success: 'success',
    PENDING: 'warning', pending: 'warning',
    FAILED: 'danger',   failed: 'danger',
    EXPIRED: 'info',    expired: 'info',
    REFUNDED: 'info',   refunded: 'info',
    PAID: 'success'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    SUCCESS: '已到账', success: '已到账',
    PENDING: '处理中', pending: '处理中',
    FAILED:  '失败',   failed:  '失败',
    EXPIRED: '已过期', expired: '已过期',
    REFUNDED:'已退款', refunded:'已退款',
    PAID: '已支付'
  }
  return map[status] || status
}

onMounted(() => {
  initParticles()
  authStore.fetchUserBalance()
  fetchPackages()
  loadHistory()
  
  if (weixin.isWechatEnv()) {
    const code = getWechatCodeFromUrl()
    if (code) {
      wechatCode.value = code
      clearWechatCodeFromUrl()
      initWxConfig()
    } else {
      const redirectUri = window.location.href
      const state = 'recharge'
      weixin.getWechatCode('wx183521434338da29', redirectUri, state)
    }
  }
})

onUnmounted(() => {
  stopPolling()
})

// ─── 算力流水记录（逻辑已提取至 useTxDialog composable）─────
const { openTxDialog } = useTxDialog()
</script>

<style lang="scss" scoped>
@keyframes grid-move {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}
@keyframes scan-move {
  0% { top: -2px; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
@keyframes glow-pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.15); }
}
@keyframes float-up {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.recharge-page {
  min-height: 100vh;
  background: #f0f9ff;
  padding-bottom: 48px;
}

// ─── Hero ───────────────────────────────────────────
.hero-section {
  position: relative;
  padding: 44px 24px 80px;
  background: radial-gradient(ellipse at top, #164e63 0%, #0f172a 55%, #020617 100%);
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    bottom: -1px; left: 0; right: 0;
    height: 48px;
    background: #f0f9ff;
    clip-path: ellipse(55% 100% at 50% 100%);
    z-index: 3;
  }
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}
.particles-container { position: absolute; inset: 0; }
.particle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, #06b6d4 0%, transparent 70%);
  pointer-events: none;
}
.grid-overlay {
  position: absolute;
  inset: -50px;
  background-image:
    linear-gradient(rgba(6, 182, 212, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(6, 182, 212, 0.08) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: grid-move 20s linear infinite;
}
.scan-line {
  position: absolute;
  left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.6), transparent);
  animation: scan-move 8s ease-in-out infinite;
  z-index: 1;
}
.glow-effect {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  animation: glow-pulse 4s ease-in-out infinite;
  pointer-events: none;
  &.glow-1 { width: 400px; height: 400px; background: rgba(6, 182, 212, 0.15); top: -100px; left: -100px; }
  &.glow-2 { width: 350px; height: 350px; background: rgba(59, 130, 246, 0.12); bottom: -80px; right: -80px; animation-delay: 2s; }
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
}

// ─── 余额卡片 ────────────────────────────────────────
.balance-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 32px 40px;
  max-width: 680px;
  width: 100%;
//   animation: float-up 4s ease-in-out infinite;
}

.balance-main {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 28px;
}

.balance-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: linear-gradient(135deg, #059669, #06b6d4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 8px 24px rgba(6, 182, 212, 0.4);
}

.balance-info {
  .balance-label { font-size: 14px; color: rgba(255,255,255,0.6); margin-bottom: 4px; }
  .balance-value {
    font-size: 52px;
    font-weight: 800;
    color: white;
    line-height: 1;
    margin-bottom: 6px;
    background: linear-gradient(135deg, #fff 0%, #a5f3fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .balance-unit { font-size: 13px; color: rgba(255,255,255,0.5); }
}

.balance-stats {
  display: flex;
  align-items: center;
  gap: 0;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
}
.stat-item {
  flex: 1;
  text-align: center;
  .stat-num { display: block; font-size: 22px; font-weight: 700; color: white; }
  .stat-label { display: block; font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 4px; }
}
.stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.12); }

// ─── 主体 ────────────────────────────────────────────
.main-body {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-card {
  background: white;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid #e0f2fe;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  .el-icon { color: #06b6d4; font-size: 18px; }
}
.section-tip { font-size: 13px; color: #94a3b8; }

// ─── 套餐卡片 ─────────────────────────────────────────
.packages-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.package-card {
  position: relative;
  border: 2px solid #e8f4fd;
  border-radius: 16px;
  padding: 20px 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s ease;
  background: #f8fafc;

  &:hover { border-color: #06b6d4; transform: translateY(-3px); box-shadow: 0 6px 20px rgba(6,182,212,0.15); }
  &.active { border-color: #06b6d4; background: linear-gradient(135deg, rgba(5,150,105,0.06), rgba(6,182,212,0.08)); box-shadow: 0 4px 16px rgba(6,182,212,0.2); }
  &.popular { border-color: #f59e0b; }
  &.popular.active { border-color: #f59e0b; }
  &.best { border-color: #ef4444; }
  &.best.active { border-color: #ef4444; }
}

.pkg-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 10px;
  white-space: nowrap;
  &.popular-badge { background: #f59e0b; color: white; }
  &.best-badge { background: linear-gradient(135deg, #ef4444, #f97316); color: white; }
}

.pkg-name {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 8px;
}
.pkg-price {
  margin-bottom: 8px;
  .price-symbol { font-size: 14px; color: #64748b; vertical-align: top; margin-top: 4px; display: inline-block; }
  .price-num { font-size: 28px; font-weight: 800; color: #1e293b; }
}
.pkg-points {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #059669;
  margin-bottom: 4px;
  .el-icon { font-size: 13px; }
}
.pkg-bonus { font-size: 11px; color: #f59e0b; font-weight: 500; margin-bottom: 4px; }
.pkg-unit { font-size: 11px; color: #94a3b8; }

// ─── 支付方式 ─────────────────────────────────────────
.payment-section {
  margin-bottom: 20px;
  .payment-label { font-size: 14px; color: #64748b; font-weight: 500; margin-bottom: 10px; }
}
.payment-methods {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.payment-method {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  color: #475569;
  transition: all 0.2s;
  &:hover { border-color: #06b6d4; color: #06b6d4; }
  &.active { border-color: #06b6d4; background: rgba(6,182,212,0.05); color: #06b6d4; font-weight: 600; }
  .el-icon { font-size: 18px; }
}

// ─── 确认充值 ─────────────────────────────────────────
.confirm-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: linear-gradient(135deg, rgba(5,150,105,0.04), rgba(6,182,212,0.04));
  border-radius: 14px;
  border: 1px solid #cffafe;
  gap: 16px;
  flex-wrap: wrap;
}
.confirm-amount {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  .amount-label { font-size: 14px; color: #64748b; }
  .amount-value { font-size: 28px; font-weight: 800; color: #0f172a; }
  .amount-points { font-size: 14px; color: #64748b; em { color: #059669; font-style: normal; font-weight: 700; } }
}

.recharge-btn {
  height: 48px;
  padding: 0 36px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #059669, #06b6d4);
  border: none;
  box-shadow: 0 4px 16px rgba(6,182,212,0.3);
  flex-shrink: 0;
  &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(6,182,212,0.4); }
}

// ─── 充值记录 ─────────────────────────────────────────
.history-table {
  border-radius: 12px;
  overflow: hidden;
  :deep(th) { background: #f8fafc !important; color: #475569; font-weight: 600; }
}
.time-text { font-size: 13px; color: #64748b; }
.amount-cell { font-size: 14px; font-weight: 600; color: #ef4444; }
.points-cell { font-size: 14px; font-weight: 600; color: #059669; }
.order-no { font-size: 12px; color: #94a3b8; font-family: monospace; }

.history-mobile {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.history-item {
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}
.history-item-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.history-pkg { font-size: 14px; font-weight: 600; color: #1e293b; }
.history-item-mid { display: flex; gap: 16px; margin-bottom: 6px; align-items: baseline; }
.history-amount { font-size: 18px; font-weight: 700; color: #ef4444; }
.history-points { font-size: 13px; color: #059669; font-weight: 600; }
.history-item-bot { display: flex; justify-content: space-between; }
.history-time, .history-method { font-size: 12px; color: #94a3b8; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #94a3b8;
  .empty-icon { font-size: 48px; color: #cbd5e1; margin-bottom: 12px; }
  p { margin: 0; font-size: 14px; }
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

// ─── 算力记录按钮（弹框样式在 TxDialog.vue）──────────────
.tx-btn-row {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  max-width: 680px;
  margin-bottom: 12px;
}
.tx-btn {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.85);
  border-radius: 20px;
  padding: 6px 16px;
  backdrop-filter: blur(8px);
  transition: all 0.2s;
  &:hover { background: rgba(6, 182, 212, 0.2); border-color: #06b6d4; color: #a5f3fc; }
  .el-icon { font-size: 14px; margin-right: 4px; }
}

// ─── 支付对话框 ───────────────────────────────────────
.pay-dialog {
  .pay-info-list {
    margin-bottom: 16px;
  }
  .pay-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
    border-bottom: 1px solid #f1f5f9;
    &:last-of-type { border-bottom: none; }
    .pay-label { font-size: 14px; color: #64748b; min-width: 80px; }
    .pay-val { font-size: 14px; font-weight: 500; color: #1e293b; }
    .pay-price { font-size: 22px; font-weight: 700; color: #ef4444; }
    .pay-points { font-size: 16px; font-weight: 700; color: #059669; }
  }

  .qr-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 16px;
    background: #f8fafc;
    border-radius: 16px;
    border: 2px dashed #e2e8f0;
    gap: 10px;
    min-height: 180px;
    justify-content: center;
    p { margin: 0; font-size: 14px; color: #475569; text-align: center; }
  }

  .qr-loading {
    .qr-spin {
      font-size: 36px;
      color: #06b6d4;
      animation: spin 1s linear infinite;
    }
    p { color: #64748b; font-size: 13px; }
  }

  .qr-wrap {
    padding: 8px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    .qr-img { display: block; width: 200px; height: 200px; }
  }

  .qr-tip {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #1a7a3c;
    font-weight: 500;
    .el-icon { color: #09b43a; }
  }

  .qr-order {
    font-size: 11px;
    color: #94a3b8;
    font-family: monospace;
    word-break: break-all;
    text-align: center;
  }

  .qr-countdown {
    font-size: 13px;
    color: #059669;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 20px;
    background: rgba(5, 150, 105, 0.08);
    &.urgent { color: #ef4444; background: rgba(239, 68, 68, 0.08); }
  }

  .qr-mweb, .qr-jsapi {
    .el-icon { color: #07c160; margin-bottom: 4px; }
    .mweb-tip { font-size: 15px; font-weight: 600; color: #1e293b; margin: 0; }
    .mweb-sub { font-size: 12px; color: #94a3b8; margin: 0; text-align: center; }
    .mweb-pay-btn {
      width: 160px;
      border-radius: 24px;
      font-size: 15px;
      font-weight: 600;
      background: linear-gradient(135deg, #07c160, #06b6d4);
      border: none;
      box-shadow: 0 4px 14px rgba(7, 193, 96, 0.35);
    }
  }

  .qr-expired, .qr-failed {
    .el-icon { color: #94a3b8; }
    p { color: #64748b; }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// ─── 响应式 ──────────────────────────────────────────
@media (max-width: 1024px) {
  .packages-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .hero-section { padding: 32px 16px 60px; }
  .balance-card { padding: 20px; }
  .balance-main { gap: 16px; }
  .balance-icon-wrap { width: 56px; height: 56px; font-size: 24px; }
  .balance-info .balance-value { font-size: 38px; }
  .packages-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .main-body { padding: 20px 16px 0; }
  .section-card { padding: 20px; }
  .confirm-section { flex-direction: column; align-items: flex-start; }
  .recharge-btn { width: 100%; }
}

@media (max-width: 480px) {
  .balance-main { flex-direction: column; text-align: center; gap: 12px; }
  .balance-stats { flex-wrap: wrap; gap: 12px; .stat-divider { display: none; } .stat-item { flex: 0 0 45%; } }
  .packages-grid { grid-template-columns: repeat(2, 1fr); }
  .balance-info .balance-value { font-size: 32px; }
}
</style>
