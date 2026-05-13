<template>
  <div class="statistics-page">
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
        <div class="hero-badge">
          <el-icon><DataAnalysis /></el-icon>
          <span>管理员面板</span>
        </div>
        <h1 class="hero-title">数据统计</h1>
        <p class="hero-subtitle">平台运行数据概览与分析，实时掌握系统运营状态</p>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      

      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="6" animated />
      </div>

      <template v-else>
        <div class="overview-cards">
          <div class="stat-card">
            <div class="card-icon users">
              <el-icon><User /></el-icon>
            </div>
            <div class="card-info">
              <span class="card-value">{{ formatNumber(stats?.total_users) }}</span>
              <span class="card-label">用户总数</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="card-icon register">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="card-info">
              <span class="card-value">{{ formatNumber(stats?.daily_register) }}</span>
              <span class="card-label">今日注册</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="card-icon active">
              <el-icon><Odometer /></el-icon>
            </div>
            <div class="card-info">
              <span class="card-value">{{ formatNumber(stats?.dau) }}</span>
              <span class="card-label">日活跃用户 (DAU)</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="card-icon mau">
              <el-icon><Connection /></el-icon>
            </div>
            <div class="card-info">
              <span class="card-value">{{ formatNumber(stats?.mau) }}</span>
              <span class="card-label">月活用户 (MAU)</span>
            </div>
          </div>
        </div>

        <div class="overview-cards">
          <div class="stat-card">
            <div class="card-icon analysis">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="card-info">
              <span class="card-value">{{ formatNumber(stats?.daily_reports) }}</span>
              <span class="card-label">今日报告</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="card-icon reports">
              <el-icon><Document /></el-icon>
            </div>
            <div class="card-info">
              <span class="card-value">{{ formatNumber(stats?.monthly_reports) }}</span>
              <span class="card-label">本月报告</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="card-icon daily-recharge">
              <el-icon><Money /></el-icon>
            </div>
            <div class="card-info">
              <span class="card-value">{{ formatMoney(stats?.daily_recharge) }}</span>
              <span class="card-label">今日充值</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="card-icon recharge">
              <el-icon><Coin /></el-icon>
            </div>
            <div class="card-info">
              <span class="card-value">{{ formatMoney(stats?.monthly_recharge) }}</span>
              <span class="card-label">本月充值</span>
            </div>
          </div>
        </div>

        <div class="extra-info">
          <div class="extra-card">
            <div class="extra-card-header">
              <el-icon><WarningFilled /></el-icon>
              <span>7天不活跃用户</span>
            </div>
            <span class="extra-value warning">{{ formatNumber(stats?.['7d_inactive']) }}</span>
          </div>
          <div class="extra-card">
            <div class="extra-card-header">
              <el-icon><Clock /></el-icon>
              <span>数据更新时间</span>
            </div>
            <span class="extra-value time">{{ formatTime(stats?.generated_at) }}</span>
          </div>
        </div>

        <!-- 操作栏 -->
      <div class="toolbar-row">
        <el-button
          type="primary"
          :loading="generating"
          :icon="Refresh"
          @click="handleGenerate"
          round
        >
          更新统计数据
        </el-button>
        <span v-if="generateMsg" class="generate-msg">{{ generateMsg }}</span>
      </div>

        <!-- 历史趋势 -->
        <div class="history-section">
          <div class="section-header">
            <h3 class="section-title">
              <el-icon><TrendCharts /></el-icon>
              历史趋势
            </h3>
            <div class="day-selector">
              <el-radio-group v-model="selectedDays" size="small" @change="onDaysChange">
                <el-radio-button :value="7">7天</el-radio-button>
                <el-radio-button :value="14">14天</el-radio-button>
                <el-radio-button :value="30">30天</el-radio-button>
                <el-radio-button :value="60">60天</el-radio-button>
                <el-radio-button :value="90">90天</el-radio-button>
                <el-radio-button :value="180">180天</el-radio-button>
              </el-radio-group>
            </div>
          </div>

          <div v-if="historyLoading" class="chart-loading">
            <el-skeleton :rows="4" animated />
          </div>

          <template v-else>
            <div class="charts-grid">
              <div class="chart-card">
                <h4 class="chart-title">用户活跃趋势</h4>
                <div ref="userChartRef" class="chart-container"></div>
              </div>
              <div class="chart-card">
                <h4 class="chart-title">报告与充值趋势</h4>
                <div ref="reportChartRef" class="chart-container"></div>
              </div>
            </div>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue'
import {
  DataAnalysis,
  User,
  UserFilled,
  TrendCharts,
  Coin,
  Money,
  Odometer,
  Connection,
  Document,
  WarningFilled,
  Clock,
  Refresh
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getDashboardStats, getStatsHistory, generateStats, type TodayStats, type DailyHistoryItem } from '@/api/admin'

defineOptions({ name: 'Statistics' })

const loading = ref(true)
const stats = ref<TodayStats | null>(null)

const historyLoading = ref(false)
const historyData = ref<DailyHistoryItem[]>([])
const selectedDays = ref(30)

// ─── 更新按钮状态 ──────────────────────────────
const generating = ref(false)
const generateMsg = ref('')

const userChartRef = ref<HTMLDivElement | null>(null)
const reportChartRef = ref<HTMLDivElement | null>(null)
let userChart: echarts.ECharts | null = null
let reportChart: echarts.ECharts | null = null

const particles = ref<Array<{ x: number; y: number; size: number; opacity: number }>>([])
const initParticles = () => {
  particles.value = Array.from({ length: 28 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    opacity: Math.random() * 0.5 + 0.15
  }))
}

// ─── 图表 dataZoom 配置（数据 > 30 条时默认聚焦末尾）──
const makeDataZoom = (dataLength: number) => {
  const showAll = dataLength <= 30
  return [
    {
      type: 'slider' as const,
      start: showAll ? 0 : ((dataLength - 30) / dataLength) * 100,
      end: 100,
      bottom: 6,
      height: 20,
      borderColor: '#e2e8f0',
      fillerColor: 'rgba(6, 182, 212, 0.08)',
      handleStyle: { color: '#06b6d4', borderColor: '#06b6d4' },
      textStyle: { color: '#94a3b8', fontSize: 12 }
    },
    { type: 'inside' as const }
  ]
}

// ─── 更新统计数据 ──────────────────────────────
const handleGenerate = async () => {
  generating.value = true
  generateMsg.value = ''
  try {
    const res = await generateStats()
    if (res.success) {
      generateMsg.value = res.data?.message || '数据更新成功'
      // 重新加载所有数据
      await fetchDashboard()
    } else {
      generateMsg.value = '更新失败，请重试'
    }
  } catch (err) {
    console.error('更新统计数据失败:', err)
    generateMsg.value = '更新失败，请检查网络'
  } finally {
    generating.value = false
    // 3 秒后自动清除提示消息
    setTimeout(() => {
      generateMsg.value = ''
    }, 3000)
  }
}

// ─── fetchHistory 必须在 fetchDashboard 之前声明 ──
const fetchHistory = async () => {
  // ★ 先销毁旧图表实例，因为 v-if 切换会重建 DOM
  userChart?.dispose()
  userChart = null
  reportChart?.dispose()
  reportChart = null

  historyLoading.value = true
  try {
    const res = await getStatsHistory(selectedDays.value)
    console.log('History Data:', res.data)
    if (res.success && Array.isArray(res.data)) {
      historyData.value = res.data
    }
  } catch (err) {
    console.error('获取历史数据失败:', err)
    historyData.value = []
  } finally {
    historyLoading.value = false
    await nextTick()
    if (historyData.value.length > 0) {
      renderCharts()
    }
  }
}

const fetchDashboard = async () => {
  loading.value = true
  try {
    const res = await getDashboardStats()
    if (res.success && res.data?.today) {
      stats.value = res.data.today
    }
  } catch (err) {
    console.error('获取统计数据失败:', err)
  } finally {
    loading.value = false
    await nextTick()
    fetchHistory()
  }
}

const onDaysChange = () => {
  fetchHistory()
}

const renderCharts = () => {
  renderUserChart()
  renderReportChart()
}

const renderUserChart = () => {
  if (!userChartRef.value) return
  // 🔥 P0 修复：init 前先 dispose 旧实例，避免 v-if / watch 连续触发时 DOM 重建导致旧实例泄漏。
  if (userChart) {
    userChart.dispose()
    userChart = null
  }
  userChart = echarts.init(userChartRef.value)

  const data = historyData.value as DailyHistoryItem[]

  const dates = data.map((d: DailyHistoryItem) => d.date.slice(5))
  const dauValues = data.map((d: DailyHistoryItem) => d.dau)
  const registerValues = data.map((d: DailyHistoryItem) => d.daily_register)
  const mauValues = data.map((d: DailyHistoryItem) => d.mau)

  userChart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: '#334155',
      textStyle: { color: '#e2e8f0', fontSize: 12 }
    },
    legend: {
      data: ['日活DAU', '月活MAU', '新注册'],
      textStyle: { color: '#64748b', fontSize: 12 },
      top: 0
    },
    grid: { left: 50, right: 20, top: 40, bottom: 46 },
    dataZoom: makeDataZoom(data.length),
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#cbd5e1' } },
      axisLabel: { color: '#94a3b8', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f1f5f9' } },
      axisLabel: { color: '#94a3b8', fontSize: 12 }
    },
    series: [
      {
        name: '日活DAU',
        type: 'line',
        data: dauValues,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#8b5cf6', width: 2 },
        itemStyle: { color: '#8b5cf6' }
      },
      {
        name: '月活MAU',
        type: 'line',
        data: mauValues,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#06b6d4', width: 2 },
        itemStyle: { color: '#06b6d4' }
      },
      {
        name: '新注册',
        type: 'bar',
        data: registerValues,
        barWidth: data.length > 60 ? 6 : 8,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#3b82f6' },
            { offset: 1, color: 'rgba(59,130,246,0.2)' }
          ])
        }
      }
    ]
  })
}

const renderReportChart = () => {
  if (!reportChartRef.value) return
  // 🔥 P0 修复：init 前先 dispose 旧实例，避免 v-if / watch 连续触发时 DOM 重建导致旧实例泄漏。
  if (reportChart) {
    reportChart.dispose()
    reportChart = null
  }
  reportChart = echarts.init(reportChartRef.value)

  const data = historyData.value as DailyHistoryItem[]
  const dates = data.map((d: DailyHistoryItem) => d.date.slice(5))
  const reportValues = data.map((d: DailyHistoryItem) => d.daily_reports)
  const rechargeValues = data.map((d: DailyHistoryItem) => d.daily_recharge)

  reportChart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: '#334155',
      textStyle: { color: '#e2e8f0', fontSize: 12 }
    },
    legend: {
      data: ['报告数', '充值金额'],
      textStyle: { color: '#64748b', fontSize: 12 },
      top: 0
    },
    grid: { left: 50, right: 60, top: 40, bottom: 46 },
    dataZoom: makeDataZoom(data.length),
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#cbd5e1' } },
      axisLabel: { color: '#94a3b8', fontSize: 12 }
    },
    yAxis: [
      {
        type: 'value',
        name: '报告数',
        nameTextStyle: { color: '#94a3b8', fontSize: 12 },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
        axisLabel: { color: '#94a3b8', fontSize: 12 }
      },
      {
        type: 'value',
        name: '元',
        nameTextStyle: { color: '#94a3b8', fontSize: 12 },
        splitLine: { show: false },
        axisLabel: { color: '#94a3b8', fontSize: 12 }
      }
    ],
    series: [
      {
        name: '报告数',
        type: 'bar',
        data: reportValues,
        barWidth: data.length > 60 ? 8 : 12,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#f59e0b' },
            { offset: 1, color: 'rgba(245,158,11,0.2)' }
          ]),
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: '充值金额',
        type: 'line',
        yAxisIndex: 1,
        data: rechargeValues,
        smooth: true,
        symbol: 'circle',
        symbolSize: data.length > 60 ? 2 : 4,
        lineStyle: { color: '#059669', width: 2 },
        itemStyle: { color: '#059669' }
      }
    ]
  })
}

const handleResize = () => {
  userChart?.resize()
  reportChart?.resize()
}

const formatNumber = (val: number | undefined): string => {
  if (val === null || val === undefined) return '--'
  return val.toLocaleString()
}

const formatMoney = (val: number | undefined): string => {
  if (val === null || val === undefined) return '--'
  return '¥' + val.toFixed(2)
}

const formatTime = (val: string | undefined): string => {
  if (!val) return '--'
  try {
    const d = new Date(val)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  } catch {
    return val
  }
}

onMounted(() => {
  initParticles()
  fetchDashboard()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  userChart?.dispose()
  reportChart?.dispose()
})
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

.statistics-page {
  min-height: 100vh;
  background: #f0f9ff;
  padding-bottom: 48px;
  overflow-x: hidden;
}

.hero-section {
  position: relative;
  padding: 52px 24px 76px;
  background: radial-gradient(ellipse at top, #164e63 0%, #0f172a 55%, #020617 100%);
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
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
  pointer-events: none;
}

.particles-container {
  position: absolute;
  inset: 0;
}

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
  left: 0;
  right: 0;
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

  &.glow-1 {
    width: 400px;
    height: 400px;
    background: rgba(6, 182, 212, 0.15);
    top: -100px;
    left: -100px;
    animation-delay: 0s;
  }

  &.glow-2 {
    width: 350px;
    height: 350px;
    background: rgba(59, 130, 246, 0.12);
    bottom: -80px;
    right: -80px;
    animation-delay: 2s;
  }
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.hero-title {
  font-size: 36px;
  font-weight: 700;
  color: white;
  margin: 0 0 12px 0;
}

.hero-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

.content-wrapper {
  max-width: 1100px;
  margin: -32px auto 0;
  padding: 0 24px;
  position: relative;
  z-index: 4;
}

// ─── 操作栏 ────────────────────────────────────
.toolbar-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  .generate-msg {
    font-size: 13px;
    color: #059669;
  }
}

.loading-container {
  background: white;
  border-radius: 20px;
  padding: 40px 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid #e0f2fe;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  border: 1px solid #e0f2fe;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  }

  .card-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    flex-shrink: 0;

    &.users {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(59, 130, 246, 0.06));
      color: #3b82f6;
    }

    &.register {
      background: linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(14, 165, 233, 0.06));
      color: #0ea5e9;
    }

    &.analysis {
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(6, 182, 212, 0.06));
      color: #06b6d4;
    }

    &.reports {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(245, 158, 11, 0.06));
      color: #f59e0b;
    }

    &.recharge {
      background: linear-gradient(135deg, rgba(5, 150, 105, 0.12), rgba(5, 150, 105, 0.06));
      color: #059669;
    }

    &.daily-recharge {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(16, 185, 129, 0.06));
      color: #10b981;
    }

    &.active {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(139, 92, 246, 0.06));
      color: #8b5cf6;
    }

    &.mau {
      background: linear-gradient(135deg, rgba(236, 72, 153, 0.12), rgba(236, 72, 153, 0.06));
      color: #ec4899;
    }
  }

  .card-info {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .card-value {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
    }

    .card-label {
      font-size: 13px;
      color: #64748b;
    }
  }
}

.extra-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.extra-card {
  background: white;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid #e0f2fe;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .extra-card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #64748b;

    .el-icon {
      font-size: 18px;
    }
  }

  .extra-value {
    font-size: 20px;
    font-weight: 700;

    &.warning {
      color: #f59e0b;
    }

    &.time {
      font-size: 14px;
      color: #475569;
      font-weight: 500;
    }
  }
}

.history-section {
  margin-top: 8px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;

    .el-icon {
      color: #06b6d4;
    }
  }
}

.day-selector {
  :deep(.el-radio-button) {
    --el-radio-button-checked-bg-color: #0f172a;
    --el-radio-button-checked-border-color: #0f172a;
    --el-radio-button-checked-text-color: #fff;
  }
}

.chart-loading {
  background: white;
  border-radius: 20px;
  padding: 32px 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid #e0f2fe;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
}

.chart-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid #e0f2fe;

  .chart-title {
    font-size: 15px;
    font-weight: 600;
    color: #334155;
    margin: 0 0 16px 0;
  }

  .chart-container {
    width: 100%;
    height: 320px;
  }
}

@media (max-width: 1024px) {
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 32px 16px 56px;
  }

  .hero-title {
    font-size: 28px;
  }

  .hero-subtitle {
    font-size: 14px;
  }

  .content-wrapper {
    margin-top: -28px;
    // padding: 0 16px;
  }

  .extra-info {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .chart-card .chart-container {
    height: 260px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 24px;
  }

  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .stat-card {
    padding: 16px;
    gap: 10px;

    .card-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      font-size: 18px;
    }

    .card-info .card-value {
      font-size: 20px;
    }
  }

  .extra-card {
    padding: 16px;

    .extra-value {
      font-size: 16px;

      &.time {
        font-size: 12px;
      }
    }
  }

  .chart-card {
    padding: 16px;

    .chart-container {
      height: 240px;
    }
  }
}
</style>
