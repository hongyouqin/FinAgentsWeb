<template>
  <div class="tet-backtest">
    <!-- 查询条 -->
    <div class="backtest-search">
      <div class="search-row">
        <el-input
          v-model="stockCode"
          placeholder="输入 6 位股票代码，如 600519"
          size="large"
          clearable
          class="code-input"
          @keyup.enter="handleRun"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          size="large"
          class="date-range-input"
          :disabled-date="disabledDate"
        />

        <el-button type="primary" size="large" :loading="loading" class="run-btn" @click="handleRun">
          <el-icon><VideoPlay /></el-icon>
          <span>运行回测</span>
        </el-button>
      </div>
      <div class="search-hint">
        支持沪深A股 · TET 策略回测 · 策略 vs 沪深300基准对比 · 默认近 1 年
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!hasData && !loading" class="empty-placeholder">
      <el-icon class="empty-icon"><Histogram /></el-icon>
      <h3>输入股票代码运行回测</h3>
      <p>系统将基于 TET 择时策略生成回测报告，对比沪深 300 基准表现</p>
    </div>

    <!-- 加载 -->
    <div v-else-if="loading" class="loading-block">
      <el-icon class="rotating"><Loading /></el-icon>
      <span>正在执行回测...</span>
    </div>

    <!-- 结果 -->
    <template v-else-if="result">
      <!-- 核心指标卡片 -->
      <div class="section-header">
        <div class="section-indicator" />
        <div class="section-title-group">
          <span class="section-title">回测报告</span>
          <span class="section-sub">{{ stockCode }} · {{ dateRange[0] }} 至 {{ dateRange[1] }}</span>
        </div>
        <div class="section-badge">
          <el-icon><DataLine /></el-icon>
          <span>BACKTEST</span>
        </div>
      </div>

      <div class="metrics-grid">
        <div class="metric-card return" :class="{ negative: result.total_return < 0 }">
          <div class="metric-icon-wrap"><el-icon><TrendCharts /></el-icon></div>
          <div class="metric-body">
            <span class="metric-value">{{ formatPercent(result.total_return) }}</span>
            <span class="metric-label">总收益率</span>
          </div>
        </div>
        <div class="metric-card annual" :class="{ negative: result.annual_return < 0 }">
          <div class="metric-icon-wrap"><el-icon><Calendar /></el-icon></div>
          <div class="metric-body">
            <span class="metric-value">{{ formatPercent(result.annual_return) }}</span>
            <span class="metric-label">年化收益率</span>
          </div>
        </div>
        <div class="metric-card sharpe">
          <div class="metric-icon-wrap"><el-icon><Aim /></el-icon></div>
          <div class="metric-body">
            <span class="metric-value">{{ formatNum(result.sharpe_ratio) }}</span>
            <span class="metric-label">夏普比率</span>
          </div>
        </div>
        <div class="metric-card drawdown">
          <div class="metric-icon-wrap"><el-icon><Bottom /></el-icon></div>
          <div class="metric-body">
            <span class="metric-value negative">{{ formatPercent(result.max_drawdown) }}</span>
            <span class="metric-label">最大回撤</span>
          </div>
        </div>
        <div class="metric-card trades">
          <div class="metric-icon-wrap"><el-icon><Switch /></el-icon></div>
          <div class="metric-body">
            <span class="metric-value">{{ result.trade_count }}</span>
            <span class="metric-label">交易次数</span>
          </div>
        </div>
        <div class="metric-card winrate">
          <div class="metric-icon-wrap"><el-icon><CircleCheckFilled /></el-icon></div>
          <div class="metric-body">
            <span class="metric-value" :class="{ positive: result.win_rate >= 0.5 }">{{ formatPercent(result.win_rate) }}</span>
            <span class="metric-label">胜率</span>
          </div>
        </div>
      </div>

      <!-- 净值曲线图 -->
      <div v-if="hasCurve" class="chart-card">
        <div class="chart-header">
          <span class="chart-dot" />
          <span class="chart-title">净值曲线</span>
          <span class="chart-sub">TET策略 vs 持股不动</span>
        </div>
        <div ref="equityChartRef" class="chart-body" />
      </div>
      <div v-else class="no-curve-tip">
        <el-icon><InfoFilled /></el-icon>
        <span>净值曲线数据暂不可用（后端待完善）</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onBeforeUnmount, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search,
  VideoPlay,
  Histogram,
  Loading,
  DataLine,
  TrendCharts,
  Calendar,
  Aim,
  Bottom,
  Switch,
  CircleCheckFilled,
  InfoFilled
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { strategyApi, type TetBacktestResult, type EquityCurveColumnar } from '@/api/strategy'

defineOptions({ name: 'TetBacktest' })

// 默认近 1 年
function fmt(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
const today = new Date()
const oneYearAgo = new Date()
oneYearAgo.setFullYear(today.getFullYear() - 1)

const stockCode = ref('')
const dateRange = ref<[string, string]>([fmt(oneYearAgo), fmt(today)])
const loading = ref(false)
const result = ref<TetBacktestResult | null>(null)

const hasData = computed(() => !!result.value)
const hasCurve = computed(() => {
  const c = result.value?.equity_curve
  return c && c.date?.length > 0
})

const disabledDate = (time: Date) => time.getTime() > Date.now()

function validateCode(): boolean {
  const code = stockCode.value.trim()
  if (!/^\d{6}$/.test(code)) {
    ElMessage.warning('请输入 6 位股票数字代码')
    return false
  }
  if (!dateRange.value || !dateRange.value[0] || !dateRange.value[1]) {
    ElMessage.warning('请选择回测日期范围')
    return false
  }
  return true
}

async function handleRun() {
  if (!validateCode()) return
  loading.value = true
  result.value = null
  try {
    const res: any = await strategyApi.getBacktest({
      stock_code: stockCode.value.trim(),
      start_date: dateRange.value[0],
      end_date: dateRange.value[1],
      return_equity_curve: true
    })
    const data = res?.data || res
    if (data && typeof data.total_return === 'number') {
      result.value = data
    } else {
      ElMessage.warning('回测无数据，请检查代码或日期范围')
    }
  } catch (e: any) {
    console.error('回测失败', e)
    ElMessage.error(e?.message || '回测失败，请稍后重试')
  } finally {
    loading.value = false
  }
  if (result.value?.equity_curve?.date?.length) {
    await nextTick()
    renderChart()
  }
}

// 格式化
function formatPercent(v: number | null | undefined): string {
  if (v === null || v === undefined) return '--'
  return (v * 100).toFixed(2) + '%'
}
function formatNum(v: number | null | undefined): string {
  if (v === null || v === undefined) return '--'
  return Number(v).toFixed(3)
}

// 图表
const equityChartRef = ref<HTMLDivElement>()
let equityChart: echarts.ECharts | null = null

function renderChart() {
  if (!equityChartRef.value || !result.value?.equity_curve?.date?.length) return
  if (equityChart) equityChart.dispose()
  equityChart = echarts.init(equityChartRef.value)

  const curve = result.value.equity_curve as EquityCurveColumnar
  const dates = curve.date.map((d: string) => d.slice(0, 10))
  const strategyData = curve.strategy
  const benchmarkData = curve.benchmark
  const isNarrow = (equityChartRef.value?.clientWidth || 800) < 600

  equityChart.setOption({
    tooltip: {
      trigger: 'axis',
      confine: true,
      valueFormatter: (v: any) => typeof v === 'number' ? v.toFixed(4) : '--'
    },
    legend: {
      data: ['TET 策略净值', '持股不动净值'],
      top: isNarrow ? 4 : 8,
      textStyle: { color: '#475569', fontSize: isNarrow ? 11 : 12 }
    },
    grid: isNarrow
      ? { left: 14, right: 14, top: 40, bottom: 32, containLabel: true }
      : { left: 16, right: 24, top: 44, bottom: 36, containLabel: true },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#cbd5e1' } },
      axisLabel: { color: '#64748b', fontSize: isNarrow ? 10 : 11, hideOverlap: true }
    },
    yAxis: {
      type: 'value',
      scale: true,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' } },
      axisLabel: { color: '#64748b', fontSize: 11, formatter: (v: number) => v.toFixed(2) }
    },
    series: [
      {
        name: 'TET 策略净值',
        type: 'line',
        data: strategyData,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#8b5cf6', width: 2.5 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(139, 92, 246, 0.18)' },
            { offset: 1, color: 'rgba(139, 92, 246, 0.01)' }
          ])
        },
        itemStyle: { color: '#8b5cf6' }
      },
      {
        name: '持股不动净值',
        type: 'line',
        data: benchmarkData,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#f59e0b', width: 2, type: 'dashed' },
        itemStyle: { color: '#f59e0b' }
      }
    ]
  })
}

watch(result, async () => {
  if (result.value?.equity_curve?.date?.length) {
    await nextTick()
    renderChart()
  }
}, { flush: 'post' })

let resizeTimer: ReturnType<typeof setTimeout> | null = null
function handleResize() {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    equityChart?.resize()
  }, 150)
}
if (typeof window !== 'undefined') {
  window.addEventListener('resize', handleResize)
}
onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize)
  }
  equityChart?.dispose()
  equityChart = null
})
</script>

<style lang="scss" scoped>
@keyframes bt-rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.rotating { animation: bt-rotating 1.2s linear infinite; }

.tet-backtest {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ===== 查询条 ===== */
.backtest-search {
  position: relative;
  background: linear-gradient(135deg, #0f172a 0%, #164e63 100%);
  border-radius: 18px;
  padding: 22px 24px 18px;
  box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.35);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at top right, rgba(6, 182, 212, 0.25) 0%, transparent 45%),
      radial-gradient(ellipse at bottom left, rgba(139, 92, 246, 0.2) 0%, transparent 50%);
    pointer-events: none;
  }

  .search-row {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }
  .code-input {
    flex: 0 1 400px;
    min-width: 180px;
    :deep(.el-input__wrapper) {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      box-shadow: 0 0 0 1px rgba(6, 182, 212, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.6);
      padding: 0 14px;
      transition: box-shadow 0.25s;
      &:hover { box-shadow: 0 0 0 1px rgba(6, 182, 212, 0.6); }
      &.is-focus { box-shadow: 0 0 0 2px #06b6d4; }
    }
    :deep(.el-input__inner) { font-weight: 600; color: #0f172a; }
  }
  .date-range-input {
    flex: 1 1 280px;
    :deep(.el-range-input) { font-weight: 500; }
    :deep(.el-input__wrapper) {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      box-shadow: 0 0 0 1px rgba(6, 182, 212, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.6);
      transition: box-shadow 0.25s;
      &:hover { box-shadow: 0 0 0 1px rgba(6, 182, 212, 0.6); }
    }
  }
  .run-btn {
    height: 40px;
    padding: 0 22px;
    background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
    border: none;
    border-radius: 12px;
    font-weight: 600;
    box-shadow: 0 6px 18px -4px rgba(6, 182, 212, 0.55);
    transition: all 0.25s;
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 10px 22px -4px rgba(6, 182, 212, 0.7);
    }
    .el-icon { margin-right: 4px; }
  }
  .search-hint {
    position: relative;
    margin-top: 12px;
    font-size: 12px;
    color: rgba(226, 232, 240, 0.7);
    letter-spacing: 0.3px;
  }
}

/* ===== 空状态 / 加载 ===== */
.empty-placeholder,
.loading-block {
  background: white;
  border-radius: 18px;
  padding: 72px 24px;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06);
  text-align: center;
  color: #94a3b8;
  border: 1px solid #f1f5f9;
}
.empty-placeholder {
  .empty-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 78px;
    height: 78px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ede9fe, #ddd6fe);
    color: #8b5cf6;
    font-size: 38px;
    margin-bottom: 18px;
  }
  h3 { margin: 0 0 8px; font-size: 18px; font-weight: 600; color: #334155; }
  p { margin: 0; font-size: 13px; }
}
.loading-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  .el-icon { font-size: 34px; color: #8b5cf6; }
  span { font-size: 14px; color: #475569; font-weight: 500; }
}

/* ===== 分区标题 ===== */
.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;

  .section-indicator {
    width: 4px;
    height: 24px;
    border-radius: 2px;
    background: linear-gradient(180deg, #8b5cf6, #6366f1);
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12);
  }
  .section-title-group { flex: 1; display: flex; flex-direction: column; gap: 2px; }
  .section-title { font-size: 16px; font-weight: 700; color: #1e293b; }
  .section-sub { font-size: 12px; color: #94a3b8; }
  .section-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    background: rgba(139, 92, 246, 0.1);
    color: #7c3aed;
    border: 1px solid rgba(139, 92, 246, 0.3);
    .el-icon { font-size: 13px; }
  }
}

/* ===== 指标卡片网格 ===== */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;

  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px) { grid-template-columns: 1fr; }
}

.metric-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
  transition: transform 0.25s, box-shadow 0.25s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.1);
  }

  .metric-icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    color: white;
    flex-shrink: 0;
  }
  .metric-body { display: flex; flex-direction: column; gap: 4px; }
  .metric-value {
    font-size: 22px;
    font-weight: 800;
    color: #1e293b;
    &.negative { color: #dc2626; }
    &.positive { color: #059669; }
  }
  .metric-label { font-size: 12px; color: #94a3b8; font-weight: 500; }

  &.return .metric-icon-wrap { background: linear-gradient(135deg, #10b981, #059669); }
  &.return.negative .metric-icon-wrap { background: linear-gradient(135deg, #ef4444, #dc2626); }
  &.annual .metric-icon-wrap { background: linear-gradient(135deg, #06b6d4, #0891b2); }
  &.annual.negative .metric-icon-wrap { background: linear-gradient(135deg, #f97316, #ea580c); }
  &.sharpe .metric-icon-wrap { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
  &.drawdown .metric-icon-wrap { background: linear-gradient(135deg, #ef4444, #b91c1c); }
  &.trades .metric-icon-wrap { background: linear-gradient(135deg, #3b82f6, #2563eb); }
  &.winrate .metric-icon-wrap { background: linear-gradient(135deg, #f59e0b, #d97706); }
}

/* ===== 图表卡 ===== */
.chart-card {
  background: white;
  border-radius: 18px;
  padding: 18px 22px 20px;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06);
  border: 1px solid #f1f5f9;

  .chart-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f1f5f9;
  }
  .chart-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #8b5cf6;
  }
  .chart-title { font-size: 15px; font-weight: 700; color: #1e293b; }
  .chart-sub { margin-left: auto; font-size: 12px; color: #94a3b8; font-weight: 500; letter-spacing: 0.5px; }
  .chart-body { width: 100%; height: 380px; }
}

/* ===== 净值曲线不可用提示 ===== */
.no-curve-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  background: white;
  border-radius: 14px;
  border: 1px dashed #e2e8f0;
  color: #94a3b8;
  font-size: 13px;

  .el-icon { font-size: 16px; color: #cbd5e1; }
}

@media (max-width: 768px) {
  .backtest-search {
    padding: 18px 16px 14px;
    .search-row {
      flex-direction: column;
      gap: 10px;
    }
    .code-input {
      flex: none;
      width: 100%;
      min-width: unset;
    }
    .date-range-input {
      flex: none;
      width: 100%;
      :deep(.el-input__wrapper),
      :deep(.el-range-editor) {
        height: 40px !important;
        max-height: 40px !important;
        min-height: unset !important;
      }
    }
    .run-btn {
      width: 100%;
      justify-content: center;
    }
  }
  .section-header {
    .section-title { font-size: 14px; }
    .section-badge { display: none; }
  }
  .chart-card {
    padding: 14px 14px 16px;
    .chart-body { height: 300px; }
    .chart-sub { display: none; }
  }
  .metric-card {
    padding: 16px;
    .metric-value { font-size: 18px; }
    .metric-icon-wrap { width: 38px; height: 38px; font-size: 19px; }
  }
  .empty-placeholder,
  .loading-block { padding: 48px 16px; }
}
</style>
