<template>
  <div class="tet-portfolio">
    <!-- 查询条 -->
    <div class="portfolio-search">
      <div class="search-form">
        <div class="form-row">
          <div class="form-item stock-codes-item">
            <label class="form-label">股票代码（至少 2 只，可从推荐列表选择或手动输入）</label>
            <el-select
              v-model="stockCodes"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="选择推荐股票 / 输入 6 位代码回车"
              size="large"
              class="stock-select"
              :reserve-keyword="false"
            >
              <el-option-group v-if="recommendedStocks.length" label="推荐股票">
                <el-option
                  v-for="s in recommendedStocks"
                  :key="s.stock_code"
                  :label="`${cleanCode(s.stock_code)} ${s.stock_name}`"
                  :value="cleanCode(s.stock_code)"
                />
              </el-option-group>
            </el-select>
            <span class="form-hint">已选 {{ stockCodes.length }} 只，最多 20 只 · 推荐列表来自「推荐策略」Tab</span>
          </div>
        </div>
        <div class="form-row params-row">
          <div class="form-item">
            <label class="form-label">最大持仓数</label>
            <el-input-number
              v-model="topN"
              :min="2"
              :max="10"
              size="large"
              :controls="false"
              class="topn-input"
            />
          </div>
          <div class="form-item date-item">
            <label class="form-label">回测区间</label>
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
          </div>
          <div class="form-item btn-item">
            <el-button type="primary" size="large" :loading="loading" class="run-btn" @click="handleRun">
              <el-icon><DataAnalysis /></el-icon>
              <span>开始分析</span>
            </el-button>
          </div>
        </div>
      </div>
      <div class="search-hint">
        支持沪深A股 · 组合 TET 指标筛选 + 多种配权方式 + 组合回测净值曲线
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!hasData && !loading" class="empty-placeholder">
      <el-icon class="empty-icon"><PieChart /></el-icon>
      <h3>构建投资组合并分析</h3>
      <p>添加至少 2 只股票，系统将基于 TET 指标筛选并构建最优权重组合</p>
    </div>

    <!-- 加载 -->
    <div v-else-if="loading" class="loading-block">
      <el-icon class="rotating"><Loading /></el-icon>
      <span>正在分析组合...</span>
    </div>

    <!-- 结果 -->
    <template v-else-if="result">
      <!-- 回测概览 -->
      <div class="section-header">
        <div class="section-indicator" />
        <div class="section-title-group">
          <span class="section-title">组合回测概览</span>
          <span class="section-sub">{{ stockCodes.join(', ') }} · {{ dateRange[0] }} 至 {{ dateRange[1] }}</span>
        </div>
        <div class="section-badge">
          <el-icon><DataLine /></el-icon>
          <span>PORTFOLIO</span>
        </div>
      </div>

      <div class="metrics-grid">
        <div class="metric-card return" :class="{ negative: result.backtest.total_return < 0 }">
          <div class="metric-icon-wrap"><el-icon><TrendCharts /></el-icon></div>
          <div class="metric-body">
            <span class="metric-value">{{ formatPercent(result.backtest.total_return) }}</span>
            <span class="metric-label">总收益率</span>
          </div>
        </div>
        <div class="metric-card annual" :class="{ negative: result.backtest.annual_return < 0 }">
          <div class="metric-icon-wrap"><el-icon><Calendar /></el-icon></div>
          <div class="metric-body">
            <span class="metric-value">{{ formatPercent(result.backtest.annual_return) }}</span>
            <span class="metric-label">年化收益率</span>
          </div>
        </div>
        <div class="metric-card sharpe">
          <div class="metric-icon-wrap"><el-icon><Aim /></el-icon></div>
          <div class="metric-body">
            <span class="metric-value">{{ formatNum(result.backtest.sharpe_ratio) }}</span>
            <span class="metric-label">夏普比率</span>
          </div>
        </div>
        <div class="metric-card drawdown">
          <div class="metric-icon-wrap"><el-icon><Bottom /></el-icon></div>
          <div class="metric-body">
            <span class="metric-value negative">{{ formatPercent(result.backtest.max_drawdown) }}</span>
            <span class="metric-label">最大回撤</span>
          </div>
        </div>
      </div>

      <!-- 组合持仓明细 -->
      <div class="section-header" style="margin-top: 8px;">
        <div class="section-indicator green" />
        <div class="section-title-group">
          <span class="section-title">持仓明细</span>
          <span class="section-sub">筛选 {{ result.portfolio.top_n }} / {{ result.portfolio.total_count }} 只入选</span>
        </div>
      </div>

      <div class="holdings-table">
        <el-table :data="result.portfolio.stocks" stripe style="width: 100%">
          <el-table-column label="股票代码" prop="code" width="110" />
          <el-table-column label="操作" width="80">
            <template #default="{ row }">
              <el-tag :type="row.action === 'BUY' ? 'success' : 'danger'" size="small" effect="plain">{{ row.action }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="锚定趋势" width="100">
            <template #default="{ row }">
              <span class="td-value" :class="getScoreClass(row.anchored_trend_score)">{{ formatNum(row.anchored_trend_score) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="择时信号" width="100">
            <template #default="{ row }">
              <span class="td-value" :class="getTimingClass(row.timing_indicator)">{{ formatNum(row.timing_indicator) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="情绪指数" width="100">
            <template #default="{ row }">
              <span class="td-value">{{ formatNum(row.emotion_index) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="历史波动" width="100">
            <template #default="{ row }">
              <span class="td-value">{{ formatPercent(row.hist_volatility) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="等权" width="80">
            <template #default="{ row }">
              <span class="td-weight">{{ formatPercent(row.weight_equal) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Timing权" width="90">
            <template #default="{ row }">
              <span class="td-weight highlight">{{ formatPercent(row.weight_timing) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="波动趋势权" width="100">
            <template #default="{ row }">
              <span class="td-weight">{{ formatPercent(row.weight_vol_trend) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 净值曲线 -->
      <div v-if="result.backtest.equity_curve?.length" class="chart-card">
        <div class="chart-header">
          <span class="chart-dot" />
          <span class="chart-title">组合净值曲线</span>
          <span class="chart-sub">Cumulative Return</span>
        </div>
        <div ref="equityChartRef" class="chart-body" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onBeforeUnmount, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  DataAnalysis,
  DataLine,
  Loading,
  TrendCharts,
  Calendar,
  Aim,
  Bottom,
  PieChart
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { strategyApi, type PortfolioResult, type PortfolioCurveItem } from '@/api/strategy'

defineOptions({ name: 'TetPortfolio' })

interface RecommendedStock {
  stock_code: string
  stock_name: string
  industry: string
  trend_score: number
  anchored_trend_score: number
  emotion_index: number
  timing_indicator: number
}

const props = defineProps<{
  recommendedStocks?: RecommendedStock[]
}>()

const recommendedStocks = computed(() => props.recommendedStocks || [])

function cleanCode(code: string): string {
  return code.replace(/\.(SH|SZ|BJ)$/i, '')
}

function fmt(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
const today = new Date()
const oneYearAgo = new Date()
oneYearAgo.setFullYear(today.getFullYear() - 1)

const stockCodes = ref<string[]>([])
const topN = ref(3)
const dateRange = ref<[string, string]>([fmt(oneYearAgo), fmt(today)])
const loading = ref(false)
const result = ref<PortfolioResult | null>(null)

const hasData = computed(() => !!result.value)
const disabledDate = (time: Date) => time.getTime() > Date.now()

function validate(): boolean {
  // 过滤非法值（allow-create 可能产生非 6 位输入）
  stockCodes.value = stockCodes.value.filter((c: string) => /^\d{6}$/.test(c))
  if (stockCodes.value.length > 20) {
    stockCodes.value = stockCodes.value.slice(0, 20)
  }
  if (stockCodes.value.length < 2) {
    ElMessage.warning('请至少选择 2 只股票')
    return false
  }
  if (!dateRange.value || !dateRange.value[0] || !dateRange.value[1]) {
    ElMessage.warning('请选择回测日期范围')
    return false
  }
  if (topN.value < 2 || topN.value > 10) {
    ElMessage.warning('最大持仓数需在 2~10 之间')
    return false
  }
  return true
}

async function handleRun() {
  if (!validate()) return
  loading.value = true
  result.value = null
  try {
    const res: any = await strategyApi.getPortfolio(
      {
        start_date: dateRange.value[0],
        end_date: dateRange.value[1],
        top_n: topN.value,
        return_equity_curve: true
      },
      stockCodes.value
    )
    const data = res?.data || res
    if (data?.portfolio && data?.backtest) {
      result.value = data
    } else {
      ElMessage.warning('组合分析无数据，请检查股票或日期范围')
    }
  } catch (e: any) {
    console.error('组合分析失败', e)
    ElMessage.error(e?.message || '分析失败，请稍后重试')
  } finally {
    loading.value = false
  }
  if (result.value?.backtest?.equity_curve?.length) {
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
function getScoreClass(v: number) {
  if (v > 0.5) return 'strong-pos'
  if (v > 0) return 'pos'
  if (v < -0.5) return 'strong-neg'
  if (v < 0) return 'neg'
  return ''
}
function getTimingClass(v: number) {
  if (v >= 1.0) return 'strong-pos'
  if (v >= 0.5) return 'pos'
  return ''
}

// 图表
const equityChartRef = ref<HTMLDivElement>()
let equityChart: echarts.ECharts | null = null

function renderChart() {
  if (!equityChartRef.value || !result.value?.backtest?.equity_curve?.length) return
  if (equityChart) equityChart.dispose()
  equityChart = echarts.init(equityChartRef.value)

  const curve = result.value.backtest.equity_curve
  const dates = curve.map((i: PortfolioCurveItem) => i.date.slice(0, 10))
  const cumReturns = curve.map((i: PortfolioCurveItem) => i.cum_return)
  const isNarrow = (equityChartRef.value?.clientWidth || 800) < 600

  equityChart.setOption({
    tooltip: {
      trigger: 'axis',
      confine: true,
      valueFormatter: (v: any) => typeof v === 'number' ? v.toFixed(4) : '--'
    },
    legend: {
      data: ['组合净值'],
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
        name: '组合净值',
        type: 'line',
        data: cumReturns,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#06b6d4', width: 2.5 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(6, 182, 212, 0.2)' },
            { offset: 1, color: 'rgba(6, 182, 212, 0.01)' }
          ])
        },
        itemStyle: { color: '#06b6d4' },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: '#f59e0b', width: 1.5, type: 'dashed' },
          label: { formatter: '基准 1.0', color: '#f59e0b', fontSize: 11 },
          data: [{ yAxis: 1 }]
        }
      }
    ]
  })
}

watch(result, async () => {
  if (result.value?.backtest?.equity_curve?.length) {
    await nextTick()
    renderChart()
  }
}, { flush: 'post' })

let resizeTimer: ReturnType<typeof setTimeout> | null = null
function handleResize() {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => { equityChart?.resize() }, 150)
}
if (typeof window !== 'undefined') {
  window.addEventListener('resize', handleResize)
}
onBeforeUnmount(() => {
  if (typeof window !== 'undefined') window.removeEventListener('resize', handleResize)
  equityChart?.dispose()
  equityChart = null
})
</script>

<style lang="scss" scoped>
@keyframes pf-rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.rotating { animation: pf-rotating 1.2s linear infinite; }

.tet-portfolio {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ===== 查询条 ===== */
.portfolio-search {
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

  .search-form {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .form-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: flex-end;
  }
  .form-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .form-label {
    font-size: 12px;
    font-weight: 600;
    color: rgba(226, 232, 240, 0.85);
    letter-spacing: 0.3px;
  }
  .form-hint {
    font-size: 11px;
    color: rgba(148, 163, 184, 0.8);
    margin-top: 4px;
  }
  .stock-codes-item { flex: 1 1 100%; }
  .date-item {  }
  .btn-item { align-self: flex-end; }

  .stock-select {
    width: 100%;
    :deep(.el-select__wrapper) {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      box-shadow: 0 0 0 1px rgba(6, 182, 212, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.6);
      min-height: 42px;
      padding: 4px 12px;
      transition: box-shadow 0.25s;
      &:hover { box-shadow: 0 0 0 1px rgba(6, 182, 212, 0.6); }
    }
    :deep(.el-select__wrapper.is-focused) {
      box-shadow: 0 0 0 2px #06b6d4;
    }
    :deep(.el-tag) {
      background: linear-gradient(135deg, #06b6d4, #0891b2);
      border: none;
      color: white;
      font-weight: 600;
      font-family: 'SF Mono', monospace;
    }
    :deep(.el-tag .el-tag__close) {
      color: rgba(255, 255, 255, 0.8);
      &:hover { color: white; background: rgba(255, 255, 255, 0.2); }
    }
  }

  .topn-input {
    width: 120px;
    :deep(.el-input__wrapper) {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      box-shadow: 0 0 0 1px rgba(6, 182, 212, 0.25);
    }
  }
  .date-range-input {
    :deep(.el-range-input) { font-weight: 500; }
    :deep(.el-input__wrapper),
    :deep(.el-range-editor) {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      box-shadow: 0 0 0 1px rgba(6, 182, 212, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.6);
      height: 40px !important;
      max-height: 40px !important;
      min-height: unset !important;
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
    background: linear-gradient(135deg, #ecfeff, #e0f2fe);
    color: #06b6d4;
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
  .el-icon { font-size: 34px; color: #06b6d4; }
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
    background: linear-gradient(180deg, #06b6d4, #0891b2);
    box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.12);
    &.green {
      background: linear-gradient(180deg, #10b981, #059669);
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
    }
  }
  .section-title-group { flex: 1; display: flex; flex-direction: column; gap: 2px; }
  .section-title { font-size: 16px; font-weight: 700; color: #1e293b; }
  .section-sub {
    font-size: 12px; color: #94a3b8;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
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
    background: rgba(6, 182, 212, 0.1);
    color: #0891b2;
    border: 1px solid rgba(6, 182, 212, 0.3);
    .el-icon { font-size: 13px; }
  }
}

/* ===== 指标卡片 ===== */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
  &:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(15, 23, 42, 0.1); }

  .metric-icon-wrap {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; color: white; flex-shrink: 0;
  }
  .metric-body { display: flex; flex-direction: column; gap: 4px; }
  .metric-value {
    font-size: 22px; font-weight: 800; color: #1e293b;
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
}

/* ===== 持仓表格 ===== */
.holdings-table {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
  border: 1px solid #f1f5f9;
  overflow-x: auto;

  :deep(.el-table) { font-size: 13px; }
  :deep(.el-table thead th) {
    background: #f8fafc;
    font-weight: 600;
    color: #334155;
  }

  .td-value {
    font-weight: 700;
    font-size: 13px;
    &.strong-pos { color: #059669; }
    &.pos { color: #16a34a; }
    &.strong-neg { color: #dc2626; }
    &.neg { color: #ea580c; }
  }
  .td-weight {
    font-weight: 700;
    font-size: 13px;
    color: #475569;
    &.highlight { color: #0891b2; }
  }
}

/* ===== 图表 ===== */
.chart-card {
  background: white;
  border-radius: 18px;
  padding: 18px 22px 20px;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06);
  border: 1px solid #f1f5f9;

  .chart-header {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 14px; padding-bottom: 12px;
    border-bottom: 1px solid #f1f5f9;
  }
  .chart-dot { width: 8px; height: 8px; border-radius: 50%; background: #06b6d4; }
  .chart-title { font-size: 15px; font-weight: 700; color: #1e293b; }
  .chart-sub { margin-left: auto; font-size: 12px; color: #94a3b8; font-weight: 500; letter-spacing: 0.5px; }
  .chart-body { width: 100%; height: 380px; }
}

@media (max-width: 768px) {
  .portfolio-search { padding: 18px 16px 14px; }
  .params-row {
    flex-direction: column;
    gap: 10px;
    .form-item { width: 100%; }
    .topn-input { width: 100%; :deep(.el-input) { width: 100%; } }
    .date-range-input { width: 100%; }
    .btn-item { width: 100%; .run-btn { width: 100%; justify-content: center; } }
  }
  .section-header {
    .section-title { font-size: 14px; }
    .section-badge { display: none; }
  }
  .holdings-table {
    padding: 12px 8px;
    :deep(.el-table) { font-size: 12px; }
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
