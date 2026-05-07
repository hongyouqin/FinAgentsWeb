<template>
  <div class="tet-calc">
    <!-- 查询条 -->
    <div class="calc-search">
      <div class="search-row">
        <el-input
          v-model="stockCode"
          placeholder="输入 6 位股票代码，如 600519、000858、300750"
          size="large"
          clearable
          class="code-input"
          @keyup.enter="handleCalc"
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
          :disabled-date="disabledDate"
          class="date-range"
          size="large"
        />
        <el-button type="primary" size="large" :loading="loading" class="calc-btn" @click="handleCalc">
          <el-icon><DataAnalysis /></el-icon>
          <span>计算指标</span>
        </el-button>
      </div>
      <div class="search-hint">
        支持沪深A股 · 开始时间默认近两年 · 基准指数 000300（沪深300）
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!hasData && !loading" class="empty-placeholder">
      <el-icon class="empty-icon"><DataLine /></el-icon>
      <h3>输入股票代码开始计算</h3>
      <p>系统将基于 Anchored-Trend-Score 与 Emotion-Index 计算 TET 指标时序</p>
    </div>

    <!-- 加载 -->
    <div v-else-if="loading" class="loading-block">
      <el-icon class="rotating"><Loading /></el-icon>
      <span>正在计算 TET 指标...</span>
    </div>

    <!-- 结果 -->
    <template v-else>
      <!-- 区域标题：实时快照 -->
      <div class="section-header latest">
        <div class="section-indicator" />
        <div class="section-title-group">
          <span class="section-title">实时快照</span>
          <span class="section-sub">基于最新交易日 <strong>{{ lastDate }}</strong> 的指标结果</span>
        </div>
        <div class="section-badge latest-badge">
          <el-icon><CircleCheckFilled /></el-icon>
          <span>LATEST</span>
        </div>
      </div>
      <div class="metric-grid">
        <div class="metric-card anchored">
          <div class="metric-head">
            <div class="metric-icon"><el-icon><TrendCharts /></el-icon></div>
            <div class="metric-meta">
              <span class="metric-label-cn">锚定趋势</span>
              <span class="metric-label-en">ANCHORED-TREND-SCORE</span>
            </div>
            <el-tooltip content="在情绪最平稳时计算的趋势得分，过滤暴涨暴跌干扰" placement="top">
              <el-icon class="metric-help"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
          <div class="metric-main">
            <div class="metric-value" :class="anchoredClass">{{ formatNum(lastItem?.anchored_trend_score) }}</div>
            <div class="metric-trend" :class="anchoredTrend.cls">
              <el-icon>
                <CaretTop v-if="anchoredTrend.dir === 'up'" />
                <CaretBottom v-else-if="anchoredTrend.dir === 'down'" />
                <Minus v-else />
              </el-icon>
              <span>{{ anchoredTrend.text }}</span>
            </div>
          </div>
          <div class="metric-foot">值域 [-1, 1]，绝对值越大趋势越稳健</div>
        </div>

        <div class="metric-card emotion">
          <div class="metric-head">
            <div class="metric-icon"><el-icon><Cpu /></el-icon></div>
            <div class="metric-meta">
              <span class="metric-label-cn">情绪指数</span>
              <span class="metric-label-en">EMOTION-INDEX</span>
            </div>
            <el-tooltip content="短期情绪与超买超卖，接近 -1.0 超卖，接近 1.0 超买" placement="top">
              <el-icon class="metric-help"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
          <div class="metric-main">
            <div class="metric-value" :class="emotionClass">{{ formatNum(lastItem?.emotion_index) }}</div>
            <div class="metric-trend" :class="emotionTrend.cls">
              <el-icon>
                <CaretTop v-if="emotionTrend.dir === 'up'" />
                <CaretBottom v-else-if="emotionTrend.dir === 'down'" />
                <Minus v-else />
              </el-icon>
              <span>{{ emotionTrend.text }}</span>
            </div>
          </div>
          <div class="metric-foot">值域 [-1, 1]，负值超卖悲观，正值超买亢奋</div>
        </div>

        <div class="metric-card timing">
          <div class="metric-head">
            <div class="metric-icon"><el-icon><Aim /></el-icon></div>
            <div class="metric-meta">
              <span class="metric-label-cn">择时信号</span>
              <span class="metric-label-en">TIMING-INDICATOR</span>
            </div>
            <el-tooltip content="公式：锚定趋势 − 情绪指数，>1.0 做多信号，<-1.0 做空信号" placement="top">
              <el-icon class="metric-help"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
          <div class="metric-main">
            <div class="metric-value" :class="timingClass">{{ formatNum(lastItem?.timing_indicator) }}</div>
            <div class="metric-trend" :class="timingTrend.cls">
              <el-icon>
                <CaretTop v-if="timingTrend.dir === 'up'" />
                <CaretBottom v-else-if="timingTrend.dir === 'down'" />
                <Minus v-else />
              </el-icon>
              <span>{{ timingTrend.text }}</span>
            </div>
          </div>
          <div class="metric-foot">值域 [-2, 2]，&gt;1 做多 / &lt;-1 做空</div>
        </div>

        <div class="metric-card joint">
          <div class="metric-head">
            <div class="metric-icon"><el-icon><Connection /></el-icon></div>
            <div class="metric-meta">
              <span class="metric-label-cn">联合趋势</span>
              <span class="metric-label-en">JOINT TREND SCORE</span>
            </div>
            <el-tooltip content="TS_joint = sign × min(|TS_stock|, |TS_ratio|)，同方向取双向较弱者" placement="top">
              <el-icon class="metric-help"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
          <div class="metric-main">
            <div class="metric-value" :class="jointClass">{{ formatNum(lastItem?.trend_score) }}</div>
            <div class="metric-trend" :class="jointTrend.cls">
              <el-icon>
                <CaretTop v-if="jointTrend.dir === 'up'" />
                <CaretBottom v-else-if="jointTrend.dir === 'down'" />
                <Minus v-else />
              </el-icon>
              <span>{{ jointTrend.text }}</span>
            </div>
          </div>
          <div class="metric-foot">当前值（未锚定），同向取双向较弱者</div>
        </div>
      </div>

      <div class="summary-bar">
        <div class="summary-item">
          <span class="summary-label">股票代码</span>
          <strong class="summary-value code">{{ stockCode }}</strong>
        </div>
        <div class="summary-item">
          <span class="summary-label">基准指数</span>
          <strong class="summary-value">000300</strong>
        </div>
        <div class="summary-item">
          <span class="summary-label">数据日期</span>
          <strong class="summary-value">{{ lastDate }}</strong>
        </div>
        <div class="summary-item">
          <span class="summary-label">历史数据</span>
          <strong class="summary-value">{{ chartData.length }} 条</strong>
        </div>
      </div>

      <!-- 区域标题：历史走势 -->
      <div class="section-header history">
        <div class="section-indicator" />
        <div class="section-title-group">
          <span class="section-title">历史走势</span>
          <span class="section-sub">查询区间内 <strong>{{ chartData.length }}</strong> 条时序数据回溯</span>
        </div>
        <div class="section-badge history-badge">
          <el-icon><Clock /></el-icon>
          <span>HISTORY</span>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-dot trend" />
          <span class="chart-title">TET 指标走势</span>
          <span class="chart-sub">Trend · Emotion · Timing</span>
        </div>
        <div ref="tetChartRef" class="chart-body" />
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-dot price" />
          <span class="chart-title">收盘价走势</span>
          <span class="chart-sub">Close Price</span>
        </div>
        <div ref="priceChartRef" class="chart-body" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onBeforeUnmount, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search,
  DataAnalysis,
  DataLine,
  Loading,
  QuestionFilled,
  TrendCharts,
  Cpu,
  Aim,
  Connection,
  CaretTop,
  CaretBottom,
  Minus,
  CircleCheckFilled,
  Clock
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { strategyApi, type TetChartItem } from '@/api/strategy'

defineOptions({ name: 'TetCalc' })

function fmt(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
const today = new Date()
const twoYearsAgo = new Date()
twoYearsAgo.setFullYear(today.getFullYear() - 2)

const stockCode = ref('')
const dateRange = ref<[string, string]>([fmt(twoYearsAgo), fmt(today)])
const loading = ref(false)
const chartData = ref<TetChartItem[]>([])

const disabledDate = (d: Date) => d.getTime() > Date.now()

const hasData = computed(() => chartData.value.length > 0)
const lastItem = computed<TetChartItem | null>(() =>
  chartData.value.length > 0 ? chartData.value[chartData.value.length - 1] : null
)
const lastDate = computed(() => {
  if (!lastItem.value) return '--'
  return String(lastItem.value.date).slice(0, 10)
})

const anchoredClass = computed(() => {
  const v = lastItem.value?.anchored_trend_score ?? 0
  if (v > 0.5) return 'strong-pos'
  if (v > 0) return 'pos'
  if (v < -0.5) return 'strong-neg'
  if (v < 0) return 'neg'
  return 'neutral'
})
const emotionClass = computed(() => {
  const v = lastItem.value?.emotion_index ?? 0
  if (v <= -0.3) return 'strong-pos'
  if (v >= 0.3) return 'strong-neg'
  return 'neutral'
})
const timingClass = computed(() => {
  const v = lastItem.value?.timing_indicator ?? 0
  if (v >= 1.0) return 'strong-pos'
  if (v <= -1.0) return 'strong-neg'
  if (v >= 0.5) return 'pos'
  if (v <= -0.5) return 'neg'
  return 'neutral'
})
const jointClass = computed(() => {
  const v = lastItem.value?.trend_score ?? 0
  if (v > 0) return 'pos'
  if (v < 0) return 'neg'
  return 'neutral'
})
type Trend = { cls: string; dir: 'up' | 'down' | 'flat'; text: string }

const anchoredTrend = computed<Trend>(() => {
  const v = lastItem.value?.anchored_trend_score ?? 0
  if (v >= 0.5) return { cls: 'strong-pos', dir: 'up', text: '强势上升' }
  if (v > 0) return { cls: 'pos', dir: 'up', text: '温和上升' }
  if (v <= -0.5) return { cls: 'strong-neg', dir: 'down', text: '深度下行' }
  if (v < 0) return { cls: 'neg', dir: 'down', text: '温和下行' }
  return { cls: 'neutral', dir: 'flat', text: '震荡盘整' }
})
const emotionTrend = computed<Trend>(() => {
  const v = lastItem.value?.emotion_index ?? 0
  if (v >= 0.3) return { cls: 'strong-neg', dir: 'up', text: '情绪亢奋' }
  if (v <= -0.3) return { cls: 'strong-pos', dir: 'down', text: '情绪低迷' }
  return { cls: 'neutral', dir: 'flat', text: '情绪平稳' }
})
const timingTrend = computed<Trend>(() => {
  const v = lastItem.value?.timing_indicator ?? 0
  if (v >= 1.0) return { cls: 'strong-pos', dir: 'up', text: '做多信号' }
  if (v <= -1.0) return { cls: 'strong-neg', dir: 'down', text: '做空信号' }
  return { cls: 'neutral', dir: 'flat', text: '未触发' }
})
const jointTrend = computed<Trend>(() => {
  const v = lastItem.value?.trend_score ?? 0
  if (v > 0) return { cls: 'pos', dir: 'up', text: '联合多头' }
  if (v < 0) return { cls: 'neg', dir: 'down', text: '联合空头' }
  return { cls: 'neutral', dir: 'flat', text: '方向不明' }
})

function validateCode(): boolean {
  const code = stockCode.value.trim()
  if (!/^\d{6}$/.test(code)) {
    ElMessage.warning('请输入 6 位股票数字代码')
    return false
  }
  return true
}

async function handleCalc() {
  if (!validateCode()) return
  if (!dateRange.value || dateRange.value.length !== 2) {
    ElMessage.warning('请选择查询起止日期')
    return
  }
  loading.value = true
  try {
    const res: any = await strategyApi.getTetChart({
      stock_code: stockCode.value.trim(),
      start_date: dateRange.value[0],
      end_date: dateRange.value[1]
    })
    const list: TetChartItem[] = res?.data || []
    if (!Array.isArray(list) || list.length === 0) {
      chartData.value = []
      ElMessage.warning('该股票在所选区间暂无数据')
    } else {
      chartData.value = list
    }
  } catch (e: any) {
    console.error('TET 查询失败', e)
    ElMessage.error(e?.message || '查询失败，请稍后重试')
    chartData.value = []
  } finally {
    loading.value = false
  }
  // 等 loading=false 后，chart-body 容器才会挂载（之前在 loading 分支）
  if (chartData.value.length > 0) {
    await nextTick()
    renderCharts()
  }
}

const tetChartRef = ref<HTMLDivElement>()
const priceChartRef = ref<HTMLDivElement>()
let tetChart: echarts.ECharts | null = null
let priceChart: echarts.ECharts | null = null

function formatNum(v: number | null | undefined, d = 4): string {
  if (v === null || v === undefined || Number.isNaN(v)) return '--'
  return Number(v).toFixed(d)
}

function renderCharts() {
  if (!tetChartRef.value || !priceChartRef.value) return
  if (tetChart) tetChart.dispose()
  if (priceChart) priceChart.dispose()
  tetChart = echarts.init(tetChartRef.value)
  priceChart = echarts.init(priceChartRef.value)

  const dates = chartData.value.map((i: TetChartItem) => String(i.date).slice(0, 10))
  const isNarrow = (tetChartRef.value?.clientWidth || 800) < 600

  const tetOption: EChartsOption = {
    grid: isNarrow
      ? { left: 18, right: 14, top: 28, bottom: 52, containLabel: true }
      : { left: 18, right: 24, top: 36, bottom: 56, containLabel: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'line' } },
    legend: {
      bottom: isNarrow ? 4 : 8,
      type: 'scroll',
      itemWidth: isNarrow ? 12 : 16,
      itemHeight: isNarrow ? 8 : 10,
      itemGap: isNarrow ? 8 : 14,
      pageIconSize: 10,
      pageTextStyle: { color: '#64748b', fontSize: isNarrow ? 10 : 11 },
      data: ['择时信号 Timing', '锚定趋势 Anchored', '情绪指数 Emotion', '阈值 ±1.0'],
      textStyle: { color: '#475569', fontSize: isNarrow ? 10 : 12 }
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#cbd5e1' } },
      axisLabel: { color: '#64748b', fontSize: isNarrow ? 10 : 11, hideOverlap: true }
    },
    yAxis: {
      type: 'value',
      min: -2,
      max: 2,
      interval: 0.5,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' } },
      axisLabel: { color: '#64748b', fontSize: 11 }
    },
    series: [
      {
        name: '择时信号 Timing',
        type: 'line',
        data: chartData.value.map((i: TetChartItem) => i.timing_indicator),
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#06b6d4', width: 2 },
        itemStyle: { color: '#06b6d4' }
      },
      {
        name: '锚定趋势 Anchored',
        type: 'line',
        data: chartData.value.map((i: TetChartItem) => i.anchored_trend_score),
        step: 'end',
        symbol: 'none',
        lineStyle: { color: '#10b981', width: 2 },
        itemStyle: { color: '#10b981' }
      },
      {
        name: '情绪指数 Emotion',
        type: 'line',
        data: chartData.value.map((i: TetChartItem) => i.emotion_index),
        symbol: 'none',
        lineStyle: { color: '#ef4444', width: 1.2, type: 'dashed' },
        itemStyle: { color: '#ef4444' }
      },
      {
        name: '阈值 ±1.0',
        type: 'line',
        data: [],
        lineStyle: { color: '#f59e0b' },
        itemStyle: { color: '#f59e0b' },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: '#f59e0b', width: 1.5 },
          label: { formatter: '{c}', color: '#f59e0b', fontSize: 10 },
          data: [{ yAxis: 1 }, { yAxis: -1 }]
        }
      }
    ]
  }

  const priceOption: EChartsOption = {
    grid: isNarrow
      ? { left: 14, right: 14, top: 20, bottom: 32, containLabel: true }
      : { left: 16, right: 24, top: 24, bottom: 40, containLabel: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'line' } },
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
      axisLabel: { color: '#64748b', fontSize: 11 }
    },
    series: [
      {
        name: '收盘价',
        type: 'line',
        data: chartData.value.map((i: TetChartItem) => i.close_stock),
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#8b5cf6', width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(139, 92, 246, 0.25)' },
            { offset: 1, color: 'rgba(139, 92, 246, 0.02)' }
          ])
        },
        itemStyle: { color: '#8b5cf6' }
      }
    ]
  }

  tetChart.setOption(tetOption)
  priceChart.setOption(priceOption)
}

let resizeTimer: ReturnType<typeof setTimeout> | null = null
let lastWidth = 0
function handleResize() {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    const w = tetChartRef.value?.clientWidth || 0
    // 跨越移动端阈值时重新构建配置，其余情况只 resize
    const cross = (lastWidth < 600) !== (w < 600)
    lastWidth = w
    if (cross && chartData.value.length > 0) {
      renderCharts()
    } else {
      tetChart?.resize()
      priceChart?.resize()
    }
  }, 150)
}
if (typeof window !== 'undefined') {
  window.addEventListener('resize', handleResize)
}
onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize)
  }
  tetChart?.dispose()
  priceChart?.dispose()
  tetChart = null
  priceChart = null
})

watch(chartData, async () => {
  if (chartData.value.length > 0) {
    await nextTick()
    renderCharts()
  }
}, { flush: 'post' })
</script>

<style lang="scss" scoped>
@keyframes tet-rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.45); }
  70% { box-shadow: 0 0 0 8px rgba(6, 182, 212, 0); }
}
.rotating { animation: tet-rotating 1.2s linear infinite; }

.tet-calc {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ===== 查询条 ===== */
.calc-search {
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
    flex: 1 1 260px;
    min-width: 220px;
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
  .date-range {
    flex: 1 1 320px;
    min-width: 260px;
    :deep(.el-range-editor) {
      background: rgba(255, 255, 255, 0.95) !important;
      border-radius: 12px;
      box-shadow: 0 0 0 1px rgba(6, 182, 212, 0.25);
      border: none;
      height: 40px;
      &:hover { box-shadow: 0 0 0 1px rgba(6, 182, 212, 0.6); }
      &.is-active { box-shadow: 0 0 0 2px #06b6d4; }
    }
    :deep(.el-range-separator) { color: #64748b; }
  }
  .calc-btn {
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
    background: linear-gradient(135deg, #ecfeff, #e0f2fe);
    color: #06b6d4;
    font-size: 38px;
    margin-bottom: 18px;
    box-shadow: inset 0 0 0 1px rgba(6, 182, 212, 0.15);
  }
  h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: #334155;
    letter-spacing: 0.2px;
  }
  p { margin: 0; font-size: 13px; color: #94a3b8; }
}
.loading-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  .el-icon { font-size: 34px; color: #06b6d4; }
  span { font-size: 14px; color: #475569; font-weight: 500; }
}

/* ===== 分区标题 ===== */
.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 4px 4px 0;
  margin-top: 2px;

  .section-indicator {
    width: 4px;
    height: 24px;
    border-radius: 2px;
    flex-shrink: 0;
  }
  .section-title-group {
    display: flex;
    flex-direction: column;
    line-height: 1.25;
    min-width: 0;
    flex: 1;
  }
  .section-title {
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
    letter-spacing: 0.3px;
  }
  .section-sub {
    font-size: 12px;
    color: #94a3b8;
    margin-top: 3px;
    strong {
      color: #475569;
      font-weight: 600;
      margin: 0 2px;
    }
  }
  .section-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    border: 1px solid;
    flex-shrink: 0;
    .el-icon { font-size: 13px; }
  }

  &.latest {
    .section-indicator {
      background: linear-gradient(180deg, #10b981, #06b6d4);
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }
    .latest-badge {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.12));
      color: #059669;
      border-color: rgba(16, 185, 129, 0.3);
      position: relative;
      &::before {
        content: '';
        position: absolute;
        top: -2px;
        right: -2px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6);
        animation: pulse-dot 1.8s infinite;
      }
    }
  }
  &.history {
    .section-indicator {
      background: linear-gradient(180deg, #8b5cf6, #6366f1);
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
    }
    .history-badge {
      background: rgba(139, 92, 246, 0.1);
      color: #7c3aed;
      border-color: rgba(139, 92, 246, 0.3);
    }
  }
}

/* ===== 四大指标卡 ===== */
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}
.metric-card {
  position: relative;
  border-radius: 18px;
  padding: 18px 20px 16px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: -60px;
    right: -60px;
    width: 160px;
    height: 160px;
    border-radius: 50%;
    opacity: 0.1;
    pointer-events: none;
    transition: transform 0.4s ease;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 18px 40px -12px rgba(15, 23, 42, 0.18);
    &::before { transform: scale(1.15); }
  }

  /* 主题色 */
  &.anchored {
    background: linear-gradient(135deg, #ecfdf5 0%, #ffffff 55%);
    box-shadow: 0 6px 22px -10px rgba(16, 185, 129, 0.35);
    &::before { background: #10b981; }
    .metric-icon {
      background: linear-gradient(135deg, #10b981, #34d399);
      box-shadow: 0 8px 18px -6px rgba(16, 185, 129, 0.6);
    }
  }
  &.emotion {
    background: linear-gradient(135deg, #fffbeb 0%, #ffffff 55%);
    box-shadow: 0 6px 22px -10px rgba(245, 158, 11, 0.35);
    &::before { background: #f59e0b; }
    .metric-icon {
      background: linear-gradient(135deg, #f59e0b, #fbbf24);
      box-shadow: 0 8px 18px -6px rgba(245, 158, 11, 0.6);
    }
  }
  &.timing {
    background: linear-gradient(135deg, #ecfeff 0%, #ffffff 55%);
    box-shadow: 0 6px 22px -10px rgba(6, 182, 212, 0.35);
    &::before { background: #06b6d4; }
    .metric-icon {
      background: linear-gradient(135deg, #06b6d4, #22d3ee);
      box-shadow: 0 8px 18px -6px rgba(6, 182, 212, 0.6);
    }
  }
  &.joint {
    background: linear-gradient(135deg, #faf5ff 0%, #ffffff 55%);
    box-shadow: 0 6px 22px -10px rgba(139, 92, 246, 0.35);
    &::before { background: #8b5cf6; }
    .metric-icon {
      background: linear-gradient(135deg, #8b5cf6, #a78bfa);
      box-shadow: 0 8px 18px -6px rgba(139, 92, 246, 0.6);
    }
  }

  .metric-head {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  .metric-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 21px;
    flex-shrink: 0;
  }
  .metric-meta {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    padding-top: 1px;
  }
  .metric-label-cn {
    font-size: 14px;
    font-weight: 700;
    color: #1e293b;
    letter-spacing: 0.5px;
    line-height: 1.25;
  }
  .metric-label-en {
    font-size: 10px;
    font-weight: 600;
    color: #94a3b8;
    letter-spacing: 0.7px;
    line-height: 1.2;
  }
  .metric-help {
    font-size: 14px;
    color: #cbd5e1;
    cursor: help;
    margin-top: 6px;
    transition: color 0.2s;
    &:hover { color: #06b6d4; }
  }

  .metric-main {
    position: relative;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
  }
  .metric-value {
    font-size: 32px;
    font-weight: 800;
    line-height: 1;
    
    letter-spacing: -0.8px;
    &.strong-pos { color: #059669; }
    &.pos { color: #16a34a; }
    &.neutral { color: #475569; }
    &.neg { color: #ea580c; }
    &.strong-neg { color: #dc2626; }
  }
  .metric-trend {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 11px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid;
    line-height: 1.2;
    white-space: nowrap;

    .el-icon { font-size: 13px; }

    &.strong-pos { background: rgba(16, 185, 129, 0.12); color: #059669; border-color: rgba(16, 185, 129, 0.35); }
    &.pos { background: rgba(34, 197, 94, 0.1); color: #16a34a; border-color: rgba(34, 197, 94, 0.3); }
    &.neutral { background: rgba(100, 116, 139, 0.1); color: #475569; border-color: rgba(100, 116, 139, 0.25); }
    &.neg { background: rgba(249, 115, 22, 0.1); color: #ea580c; border-color: rgba(249, 115, 22, 0.3); }
    &.strong-neg { background: rgba(239, 68, 68, 0.12); color: #dc2626; border-color: rgba(239, 68, 68, 0.35); }
  }

  .metric-foot {
    position: relative;
    font-size: 11.5px;
    color: #94a3b8;
    line-height: 1.5;
    padding-top: 10px;
    border-top: 1px dashed rgba(148, 163, 184, 0.3);
  }
}

/* ===== 摘要条 ===== */
.summary-bar {
  background: white;
  border-radius: 14px;
  padding: 14px 18px;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.05);
  display: flex;
  flex-wrap: wrap;
  gap: 8px 28px;
  align-items: center;
  border: 1px solid #f1f5f9;

  .summary-item {
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;

    & + .summary-item::before {
      content: '';
      position: absolute;
      left: -14px;
      top: 4px;
      bottom: 4px;
      width: 1px;
      background: #e2e8f0;
    }
  }
  .summary-label {
    font-size: 12px;
    color: #94a3b8;
    letter-spacing: 0.3px;
  }
  .summary-value {
    font-size: 14px;
    font-weight: 700;
    color: #1e293b;
    &.code {
      font-family: 'SF Mono', 'Monaco', monospace;
      color: #0891b2;
    }
  }
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
    flex-shrink: 0;
    &.trend {
      background: #06b6d4;
      animation: pulse-dot 2s infinite;
    }
    &.price { background: #8b5cf6; }
  }
  .chart-title {
    font-size: 15px;
    font-weight: 700;
    color: #1e293b;
    letter-spacing: 0.3px;
  }
  .chart-sub {
    margin-left: auto;
    font-size: 12px;
    color: #94a3b8;
    font-weight: 500;
    letter-spacing: 0.8px;
    text-transform: uppercase;
  }
  .chart-body {
    width: 100%;
    height: 380px;
  }
}

@media (max-width: 768px) {
  .section-header {
    gap: 10px;
    .section-title { font-size: 14px; }
    .section-sub { font-size: 11px; }
    .section-badge { padding: 3px 8px; font-size: 10px; }
  }
  .calc-search { padding: 18px 16px 14px; }
  .chart-card {
    padding: 14px 14px 16px;
    .chart-body { height: 300px; }
    .chart-sub { display: none; }
  }
  .metric-card {
    padding: 14px 16px 14px;
    .metric-value { font-size: 26px; }
    .metric-icon { width: 36px; height: 36px; font-size: 19px; }
    .metric-label-cn { font-size: 13px; }
  }
  .summary-bar {
    gap: 6px 20px;
    padding: 12px 14px;
    .summary-item + .summary-item::before { display: none; }
  }
}
</style>
