<template>
  <div class="strategy-page">
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
          <el-icon><Cpu /></el-icon>
          <span>AI量化策略分析</span>
        </div>
        <h1 class="hero-title">全市场标的多维度扫描</h1>
        <p class="hero-subtitle">基于Trend-Emotion-Timing量化框架，客观呈现标的趋势、情绪、时机数据，仅作参考，不构成投资建议</p>
      </div>
    </div>

    <div class="content-wrapper">
      <!-- 顶部 Tab：推荐策略 / 查询计算 / 回测 / 组合构建 -->
      <div class="tab-switch">
        <el-radio-group v-model="activeTab" size="large" class="tab-group">
          <el-radio-button :value="'pitch'">
            <el-icon><Star /></el-icon>
            <span class="tab-label">推荐策略</span>
          </el-radio-button>
          <el-radio-button :value="'calc'">
            <el-icon><DataAnalysis /></el-icon>
            <span class="tab-label">查询计算</span>
          </el-radio-button>
          <el-radio-button :value="'backtest'">
            <el-icon><Histogram /></el-icon>
            <span class="tab-label">策略回测</span>
          </el-radio-button>
          <el-radio-button :value="'portfolio'">
            <el-icon><PieChart /></el-icon>
            <span class="tab-label">组合构建</span>
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 查询计算面板 -->
      <TetCalc v-if="activeTab === 'calc'" :initial-code="calcInitCode" />

      <!-- 回测面板 -->
      <TetBacktest v-if="activeTab === 'backtest'" />

      <!-- 组合分析面板 -->
      <TetPortfolio v-if="activeTab === 'portfolio'" :recommended-stocks="stockList" />

      <!-- 推荐策略面板（原内容，仅在 pitch 时展示） -->
      <template v-if="activeTab === 'pitch'">
      <!-- 指标说明卡片 -->
      <div class="indicators-guide">
        <div class="guide-header">
          <div class="guide-title">
            <el-icon><InfoFilled /></el-icon>
            <span>指标说明</span>
          </div>
          <el-button type="text" size="small" @click="showGuide = !showGuide">
            {{ showGuide ? '收起' : '展开' }}
            <el-icon><component :is="showGuide ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
          </el-button>
        </div>
        <el-collapse-transition>
          <div v-show="showGuide" class="guide-items">
            <div class="guide-item">
              <span class="indicator-badge trend">趋势得分</span>
              <div class="indicator-info">
                <span class="indicator-desc">由40类趋势指标综合投票得出，数值范围 <strong>[-1.0, 1.0]</strong></span>
                <div class="color-legend">
                  <span class="legend-item"><i class="dot trend-positive"></i>&gt; 0 偏多</span>
                  <span class="legend-item"><i class="dot trend-negative"></i>&lt; 0 偏空</span>
                  <span class="legend-item">绝对值越大，趋势一致性越强</span>
                </div>
              </div>
            </div>
            <div class="guide-item" style="margin-top: 10px;">
              <span class="indicator-badge emotion">情绪指数</span>
              <div class="indicator-info">
                <span class="indicator-desc">
                  <el-icon class="tip-icon"><Warning /></el-icon>
                  反映短期市场情绪与超买超卖，范围 <strong>[-1.0, 1.0]</strong>
                </span>
                <div class="color-legend">
                  <span class="legend-item"><i class="dot emotion-high"></i>接近 1.0 过热(超买)</span>
                  <span class="legend-item"><i class="dot emotion-low"></i>接近 -1.0 低迷(超卖)</span>
                  <span class="legend-item">情绪越低，短期修复概率越高</span>
                </div>
              </div>
            </div>
            <div class="guide-item" style="margin-top: 10px;">
              <span class="indicator-badge anchored">锚定趋势得分</span>
              <div class="indicator-info">
                <span class="indicator-desc">在情绪最平稳时计算的趋势得分，过滤暴涨暴跌干扰，更真实稳健</span>
                <div class="color-legend">
                  <span class="legend-item">代表标的"去情绪化"的核心趋势</span>
                </div>
              </div>
            </div>
            <div class="guide-item" style="margin-top: 10px;">
              <span class="indicator-badge timing">时机指标</span>
              <div class="indicator-info">
                <span class="indicator-desc">计算公式：<strong>锚定趋势得分 − 情绪指数</strong>，范围 <strong>[-2.0, 2.0]</strong></span>
                <div class="color-legend">
                  <span class="legend-item"><i class="dot timing-strong"></i>&gt; 1.0 趋势向上 + 情绪偏低，优势显著</span>
                  <span class="legend-item"><i class="dot timing-weak"></i>&lt; -1.0 趋势向下 + 情绪偏高，需警惕</span>
                </div>
              </div>
            </div>
          </div>
        </el-collapse-transition>
      </div>

      <!-- 筛选区 -->
      <div class="filter-section">
        <div class="filter-left">
          <span class="filter-label">选择日期</span>
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :disabled-date="disabledDate"
            :clearable="false"
            class="date-picker"
            popper-class="strategy-date-popper"
            @change="onDateChange"
          >
            <template #default="cell">
              <div class="date-cell" :class="{ 'has-data': isDateAvailable(cell.date) }">
                <span class="date-text">{{ cell.text }}</span>
                <span v-if="isDateAvailable(cell.date)" class="date-dot"></span>
              </div>
            </template>
          </el-date-picker>
          <span class="date-legend">
            <el-icon class="legend-icon"><Warning /></el-icon>
            <i class="legend-dot"></i>
            <span>绿点表示当日有推荐数据</span>
          </span>
        </div>
        <div class="filter-right">
          <el-button type="primary" :loading="loading" @click="loadStockList">
            <el-icon><Refresh /></el-icon>
            <span>刷新</span>
          </el-button>
        </div>
      </div>

      <!-- 列表区 -->
      <div class="list-section">
        <div class="list-header">
          <div class="header-left">
            <span class="section-title">推荐列表</span>
            <el-tag type="info" size="small" effect="plain">共 {{ stockList.length }} 只</el-tag>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <el-icon class="rotating"><Loading /></el-icon>
          <span>加载中...</span>
        </div>

        <!-- 空状态 -->
        <div v-else-if="stockList.length === 0" class="empty-state">
          <el-icon class="empty-icon"><DocumentDelete /></el-icon>
          <h3>暂无推荐</h3>
          <p>{{ selectedDate }} 暂无策略推荐数据</p>
        </div>

        <!-- 桌面端表格 -->
        <div v-else class="desktop-table">
          <el-table :data="stockList" style="width: 100%">
            <el-table-column label="排名" width="70" align="center">
              <template #default="{ $index }">
                <span class="rank-badge" :class="{ 'top': $index < 3 }">{{ $index + 1 }}</span>
              </template>
            </el-table-column>

            <el-table-column label="股票" min-width="160">
              <template #default="{ row }">
                <div class="stock-cell">
                  <div class="stock-code clickable" @click.stop="openStockPage(row.stock_code)">{{ row.stock_code }}</div>
                  <div class="stock-name">{{ row.stock_name }}</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="行业" min-width="100">
              <template #default="{ row }">
                <el-tag v-if="row.industry" size="small" type="info" effect="plain">
                  {{ row.industry }}
                </el-tag>
                <span v-else class="text-muted">—</span>
              </template>
            </el-table-column>

            <el-table-column min-width="150">
              <template #header>
                <div class="column-header">
                  <span>趋势得分</span>
                  <el-tooltip content="由40类趋势指标综合投票得出，范围[-1.0, 1.0]" placement="top">
                    <el-icon class="help-icon"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
              </template>
              <template #default="{ row }">
                <div class="indicator-cell trend">
                  <span class="indicator-value" :class="getTrendClass(row.trend_score)">
                    {{ formatIndicator(row.trend_score) }}
                  </span>
                  <el-progress 
                    :percentage="normalizeTrendScore(row.trend_score)" 
                    :stroke-width="4"
                    :show-text="false"
                    :color="getTrendColor(row.trend_score)"
                    class="indicator-progress"
                  />
                </div>
              </template>
            </el-table-column>

            <el-table-column min-width="150">
              <template #header>
                <div class="column-header">
                  <span>锚定趋势</span>
                  <el-tooltip content="在情绪最平稳时计算的趋势得分，过滤暴涨暴跌干扰" placement="top">
                    <el-icon class="help-icon"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
              </template>
              <template #default="{ row }">
                <div class="indicator-cell anchored">
                  <span class="indicator-value" :class="getAnchoredClass(row.anchored_trend_score)">
                    {{ formatIndicator(row.anchored_trend_score) }}
                  </span>
                  <el-progress 
                    :percentage="normalizeAnchoredScore(row.anchored_trend_score)" 
                    :stroke-width="4"
                    :show-text="false"
                    :color="getAnchoredColor(row.anchored_trend_score)"
                    class="indicator-progress"
                  />
                </div>
              </template>
            </el-table-column>

            <el-table-column min-width="150">
              <template #header>
                <div class="column-header">
                  <span>情绪指数</span>
                  <el-tooltip content="反映短期市场情绪，接近-1.0超卖，接近1.0超买" placement="top">
                    <el-icon class="help-icon warning"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
              </template>
              <template #default="{ row }">
                <div class="indicator-cell emotion">
                  <span class="indicator-value" :class="getEmotionClass(row.emotion_index)">
                    {{ formatIndicator(row.emotion_index) }}
                  </span>
                  <el-progress 
                    :percentage="normalizeEmotionScore(row.emotion_index)" 
                    :stroke-width="4"
                    :show-text="false"
                    :color="getEmotionColor(row.emotion_index)"
                    class="indicator-progress"
                  />
                </div>
              </template>
            </el-table-column>

            <el-table-column min-width="150">
              <template #header>
                <div class="column-header">
                  <span>时机指标</span>
                  <el-tooltip content="锚定趋势得分 − 情绪指数，>1.0优势显著，<-1.0需警惕" placement="top">
                    <el-icon class="help-icon"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
              </template>
              <template #default="{ row }">
                <div class="indicator-cell timing">
                  <span class="indicator-value" :class="getTimingClass(row.timing_indicator)">
                    {{ formatIndicator(row.timing_indicator) }}
                  </span>
                  <el-progress 
                    :percentage="normalizeTimingScore(row.timing_indicator)" 
                    :stroke-width="4"
                    :show-text="false"
                    :color="getTimingColor(row.timing_indicator)"
                    class="indicator-progress"
                  />
                </div>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" text @click="goToCalc(row.stock_code)">
                  <el-icon><DataAnalysis /></el-icon>
                  计算
                </el-button>
                <el-button type="primary" size="small" text @click="goToAnalysis(row.stock_code)">
                  <el-icon><TrendCharts /></el-icon>
                  分析
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 移动端卡片 -->
        <div v-if="stockList.length > 0" class="mobile-list">
          <div 
            v-for="(stock, index) in stockList" 
            :key="stock.stock_code"
            class="stock-card"
           
          >
            <div class="card-header">
              <span class="stock-rank" :class="{ 'top': index < 3 }">{{ index + 1 }}</span>
              <div class="stock-info">
                <span class="stock-code clickable" @click.stop="openStockPage(stock.stock_code)">{{ stock.stock_code }}</span>
                <span class="stock-name">{{ stock.stock_name }}</span>
              </div>
              <el-tag v-if="stock.industry" size="small" type="info" effect="plain">
                {{ stock.industry }}
              </el-tag>
            </div>

            <div class="card-indicators">
              <div class="indicator-row">
                <span class="indicator-label">趋势得分</span>
                <div class="indicator-cell-mobile">
                  <span class="indicator-value trend" :class="getTrendClass(stock.trend_score)">
                    {{ formatIndicator(stock.trend_score) }}
                  </span>
                  <el-progress 
                    :percentage="normalizeTrendScore(stock.trend_score)" 
                    :stroke-width="4"
                    :show-text="false"
                    :color="getTrendColor(stock.trend_score)"
                    class="indicator-progress-mobile"
                  />
                </div>
              </div>
              <div class="indicator-row">
                <span class="indicator-label">锚定趋势</span>
                <div class="indicator-cell-mobile">
                  <span class="indicator-value anchored" :class="getAnchoredClass(stock.anchored_trend_score)">
                    {{ formatIndicator(stock.anchored_trend_score) }}
                  </span>
                  <el-progress 
                    :percentage="normalizeAnchoredScore(stock.anchored_trend_score)" 
                    :stroke-width="4"
                    :show-text="false"
                    :color="getAnchoredColor(stock.anchored_trend_score)"
                    class="indicator-progress-mobile"
                  />
                </div>
              </div>
              <div class="indicator-row">
                <span class="indicator-label">情绪指数</span>
                <div class="indicator-cell-mobile">
                  <span class="indicator-value emotion" :class="getEmotionClass(stock.emotion_index)">
                    {{ formatIndicator(stock.emotion_index) }}
                  </span>
                  <el-progress 
                    :percentage="normalizeEmotionScore(stock.emotion_index)" 
                    :stroke-width="4"
                    :show-text="false"
                    :color="getEmotionColor(stock.emotion_index)"
                    class="indicator-progress-mobile"
                  />
                </div>
              </div>
              <div class="indicator-row">
                <span class="indicator-label">时机指标</span>
                <div class="indicator-cell-mobile">
                  <span class="indicator-value timing" :class="getTimingClass(stock.timing_indicator)">
                    {{ formatIndicator(stock.timing_indicator) }}
                  </span>
                  <el-progress 
                    :percentage="normalizeTimingScore(stock.timing_indicator)" 
                    :stroke-width="4"
                    :show-text="false"
                    :color="getTimingColor(stock.timing_indicator)"
                    class="indicator-progress-mobile"
                  />
                </div>
              </div>
            </div>

            <div class="card-footer">
              <el-button type="primary" size="small" @click.stop="goToCalc(stock.stock_code)">
                <el-icon><DataAnalysis /></el-icon>
                计算
              </el-button>
              <el-button type="primary" size="small" @click.stop="goToAnalysis(stock.stock_code)">
                <el-icon><TrendCharts /></el-icon>
                去分析
              </el-button>
            </div>
          </div>
        </div>
      </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Cpu,
  InfoFilled,
  Warning,
  Loading,
  DocumentDelete,
  QuestionFilled,
  TrendCharts,
  Refresh,
  ArrowUp,
  ArrowDown,
  Star,
  DataAnalysis,
  Histogram,
  PieChart
} from '@element-plus/icons-vue'
import { strategyApi } from '@/api/strategy'
import TetCalc from './TetCalc.vue'
import TetBacktest from './TetBacktest.vue'
import TetPortfolio from './TetPortfolio.vue'

defineOptions({ name: 'Strategy' })

const router = useRouter()

// Tab 切换：pitch=推荐策略，calc=查询计算，backtest=回测，portfolio=组合分析
const activeTab = ref<'pitch' | 'calc' | 'backtest' | 'portfolio'>('pitch')
const calcInitCode = ref<string>('')

// 日期选择
const selectedDate = ref<string>(formatDate(new Date()))
const loading = ref(false)
const showGuide = ref(true)

// 有数据的日期集合
const availableDatesSet = ref<Set<string>>(new Set())

// 股票列表
const stockList = ref<Array<{
  stock_code: string
  stock_name: string
  industry: string
  trend_score: number
  anchored_trend_score: number
  emotion_index: number
  timing_indicator: number
}>>([])

// 背景粒子
const particles = ref<Array<{ x: number; y: number; size: number; opacity: number }>>([])
const initParticles = () => {
  particles.value = Array.from({ length: 25 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    opacity: Math.random() * 0.5 + 0.15
  }))
}

// 格式化日期
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 禁用未来日期
const disabledDate = (time: Date) => {
  return time.getTime() > Date.now()
}

// 加载有数据的日期列表
const loadAvailableDates = async () => {
  try {
    const res: any = await strategyApi.getAvailableDates()
    const data = res.data || res
    const dates = data.dates || []
    availableDatesSet.value = new Set(dates.map((d: any) => d.date))
    
    // 设置为最新有数据的日期
    if (dates.length > 0) {
      // 日期按降序排列，取第一个（最新的）
      const sortedDates = dates.map((d: any) => d.date).sort((a: string, b: string) => b.localeCompare(a))
      selectedDate.value = sortedDates[0]
    }
  } catch (error) {
    console.error('加载可用日期失败:', error)
  }
}

// 判断日期是否有数据
const isDateAvailable = (date: Date): boolean => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const dateStr = `${year}-${month}-${day}`
  return availableDatesSet.value.has(dateStr)
}

// 日期变更
const onDateChange = () => {
  loadStockList()
}

// 加载股票列表
const loadStockList = async () => {
  loading.value = true
  try {
    const res = await strategyApi.getDailyPitch({
      date: selectedDate.value,
      limit: 100,
      include_stats: true
    })
    
    const data = res.data || res
    let recommendations = []
    
    if (data.recommendations?.data) {
      recommendations = data.recommendations.data
    } else if (data.recommendations && Array.isArray(data.recommendations)) {
      recommendations = data.recommendations
    } else if (Array.isArray(data)) {
      recommendations = data
    }

    stockList.value = recommendations.map((item: any) => ({
      stock_code: String(item.stock_code || item.symbol || ''),
      stock_name: String(item.stock_name || item.name || ''),
      industry: String(item.industry || ''),
      trend_score: item.trend_score ?? 0,
      anchored_trend_score: item.anchored_trend_score ?? 0,
      emotion_index: item.emotion_index ?? 0,
      timing_indicator: item.timing_indicator ?? 0
    }))
  } catch (error: any) {
    console.error('加载策略数据失败:', error)
    ElMessage.error(error.message || '加载数据失败')
    stockList.value = []
  } finally {
    loading.value = false
  }
}

// 格式化指标值
const formatIndicator = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '--'
  return value.toFixed(2)
}

// 归一化最佳时机指标（绝对值，1.0为阈值，2.0为满值）
const normalizeTimingScore = (value: number | null | undefined): number => {
  if (value === null || value === undefined) return 0
  const absValue = Math.abs(value)
  return Math.min(100, (absValue / 2.0) * 100)
}

// 归一化趋势得分（范围-1到1）
const normalizeTrendScore = (value: number | null | undefined): number => {
  if (value === null || value === undefined) return 0
  // 范围 -1 到 1，转换为 0-100 的百分比
  const clamped = Math.min(1, Math.max(-1, value))
  return ((clamped + 1) / 2) * 100
}

// 归一化锚定趋势得分（范围-1到1）
const normalizeAnchoredScore = (value: number | null | undefined): number => {
  if (value === null || value === undefined) return 0
  const clamped = Math.min(1, Math.max(-1, value))
  return ((clamped + 1) / 2) * 100
}

// 归一化情绪指数（反向，值越低越好，范围-1到1）
const normalizeEmotionScore = (value: number | null | undefined): number => {
  if (value === null || value === undefined) return 0
  // 范围 -1 到 1，转换为 0-100 的百分比
  // -1 -> 100% (最好), 0 -> 50%, 1 -> 0% (最差)
  const clamped = Math.min(1, Math.max(-1, value))
  return ((1 - clamped) / 2) * 100
}

// 获取最佳时机指标样式类（绝对值 >= 1.0 为信号）
const getTimingClass = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return ''
  const absValue = Math.abs(value)
  if (absValue >= 1.0) return 'strong'
  if (absValue >= 0.5) return 'medium'
  return 'weak'
}

// 获取趋势得分样式类（范围-1到1）
const getTrendClass = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return ''
  if (value > 0) return 'positive'
  return 'negative'
}

// 获取锚定趋势样式类（范围-1到1）
const getAnchoredClass = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return ''
  if (value > 0.5) return 'strong'
  if (value > 0.25) return 'medium'
  return 'weak'
}

// 获取情绪指数样式类（值越低越好，范围-1到1）
const getEmotionClass = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return ''
  if (value <= -0.3) return 'low'      // 低=好=绿色
  if (value < 0.3) return 'medium'     // 中=橙色
  return 'high'                         // 高=不好=红色
}

// 获取最佳时机指标颜色
const getTimingColor = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '#94a3b8'
  const absValue = Math.abs(value)
  if (absValue >= 1.0) return '#10b981'  // 强信号=绿色
  if (absValue >= 0.5) return '#f59e0b'  // 中等=橙色
  return '#94a3b8'                        // 弱=灰色
}

// 获取趋势得分颜色（范围-1到1）
const getTrendColor = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '#94a3b8'
  if (value > 0) return '#10b981'  // 偏多=绿色
  return '#ef4444'                  // 偏空=红色
}

// 获取锚定趋势颜色（范围-1到1）
const getAnchoredColor = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '#94a3b8'
  if (value > 0.5) return '#8b5cf6'  // 强=紫色
  if (value > 0.25) return '#a78bfa' // 中=浅紫
  return '#94a3b8'                    // 弱=灰色
}

// 获取情绪指数颜色（值越低越好，范围-1到1）
const getEmotionColor = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '#94a3b8'
  if (value <= -0.3) return '#10b981'   // 低=好=绿色
  if (value < 0.3) return '#f59e0b'    // 中=橙色
  return '#ef4444'                      // 高=不好=红色
}

// 跳转到分析页面
const goToAnalysis = (stockCode: string) => {
  router.push({
    path: '/analysis/single',
    query: { symbol: stockCode }
  })
}

// 切换到查询计算 Tab 并传入股票代码
const goToCalc = (stockCode: string) => {
  // 去掉可能的后缀（如 .SH, .SZ）
  const code = stockCode.replace(/\.(SH|SZ|BJ)$/i, '')
  calcInitCode.value = code
  activeTab.value = 'calc'
}

// 打开同花顺股票详情页
const openStockPage = (stockCode: string) => {
  // 去掉后缀（如 .SH, .SZ），只保留数字部分
  const code = stockCode.replace(/\.(SH|SZ|BJ)$/i, '')
  window.open(`https://stockpage.10jqka.com.cn/${code}`, '_blank')
}

onMounted(async () => {
  initParticles()
  await loadAvailableDates()
  loadStockList()
})
</script>

<style lang="scss" scoped>
// 动画
@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes particle-float {
  0%, 100% { transform: translateY(0) translateX(0); }
  25% { transform: translateY(-18px) translateX(8px); }
  50% { transform: translateY(-8px) translateX(-8px); }
  75% { transform: translateY(-26px) translateX(4px); }
}

@keyframes grid-move {
  0% { background-position: 0 0, 0 0; }
  100% { background-position: 50px 50px, 50px 50px; }
}

@keyframes scan-move {
  0% { transform: translateY(0); opacity: 0; }
  10% { opacity: 0.5; }
  90% { opacity: 0.5; }
  100% { transform: translateY(100%); opacity: 0; }
}

@keyframes glow-pulse {
  0%, 100% { transform: scale(1); opacity: 0.25; }
  50% { transform: scale(1.2); opacity: 0.45; }
}

.rotating {
  animation: rotating 1.5s linear infinite;
}

// 页面容器
.strategy-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f9ff 0%, #f8fafc 60%, #f1f5f9 100%);
  padding-bottom: 48px;
  overflow-x: hidden;
  width: 100%;
  max-width: 100vw;
}

// Hero Section
.hero-section {
  background: radial-gradient(ellipse at top, #164e63 0%, #0f172a 55%, #020617 100%);
  padding: 52px 24px 76px;
  position: relative;
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
  }
}

.hero-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.particles-container {
  position: absolute;
  inset: 0;
}

.particle {
  position: absolute;
  background: radial-gradient(circle, #06b6d4 0%, transparent 70%);
  border-radius: 50%;
  animation: particle-float 20s infinite ease-in-out;
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(6, 182, 212, 0.07) 1.5px, transparent 1.5px),
    linear-gradient(90deg, rgba(6, 182, 212, 0.07) 1.5px, transparent 1.5px);
  background-size: 50px 50px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
  animation: grid-move 30s linear infinite;
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(6, 182, 212, 0.7) 20%,
    rgba(6, 182, 212, 1) 50%,
    rgba(6, 182, 212, 0.7) 80%,
    transparent 100%
  );
  box-shadow: 0 0 16px rgba(6, 182, 212, 0.7);
  animation: scan-move 8s linear infinite;
}

.glow-effect {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  animation: glow-pulse 8s ease-in-out infinite;
}

.glow-1 {
  top: -10%;
  left: 10%;
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, #06b6d4 0%, transparent 70%);
}

.glow-2 {
  bottom: -10%;
  right: 10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
  animation-delay: 4s;
}

.hero-content {
  position: relative;
  z-index: 1;
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

// 内容包装器
.content-wrapper {
  max-width: 1200px;
  margin: -32px auto 0;
  padding: 0 8px;
  position: relative;
  z-index: 2;
}

// 顶部 Tab 切换
.tab-switch {
  background: white;
  border-radius: 16px;
  padding: 10px 14px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: center;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }

  :deep(.el-radio-button__inner) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 22px;
    font-weight: 600;
    border-color: #e2e8f0;
    color: #475569;
    background: #f8fafc;
    transition: all 0.25s ease;
    white-space: nowrap;
  }
  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background: linear-gradient(135deg, #06b6d4, #0891b2);
    border-color: #06b6d4;
    color: white;
    box-shadow: 0 4px 14px rgba(6, 182, 212, 0.35);
  }
  .tab-label { font-size: 14px; }

  @media (max-width: 640px) {
    justify-content: flex-start;
    padding: 8px 10px;
    :deep(.el-radio-button__inner) {
      padding: 8px 13px;
      gap: 4px;
      .tab-label { font-size: 12px; }
    }
  }

  @media (max-width: 480px) {
    :deep(.el-radio-button__inner) {
      padding: 7px 11px;
      .tab-label { font-size: 11px; }
    }
  }
}

// 指标说明
.indicators-guide {
  background: white;
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(6, 182, 212, 0.1);

  .guide-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .guide-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    color: #0d9488;

    .el-icon {
      font-size: 18px;
    }
  }

  .guide-items {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #f1f5f9;
  }

  .guide-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-size: 13px;
  }

  .indicator-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .color-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 12px;
    padding: 8px 12px;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    max-width: 100%;
    box-sizing: border-box;
  }

  .legend-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #64748b;
    white-space: nowrap;

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;

      // 趋势得分
      &.trend-positive { background: #10b981; }
      &.trend-negative { background: #ef4444; }

      // 锚定趋势
      &.trend-strong { background: #3b82f6; }
      &.trend-medium { background: #60a5fa; }
      &.trend-weak { background: #94a3b8; }

      // 情绪指数
      &.emotion-low { background: #10b981; }
      &.emotion-medium { background: #f59e0b; }
      &.emotion-high { background: #ef4444; }

      // 时机指标
      &.timing-strong { background: #10b981; }
      &.timing-medium { background: #f59e0b; }
      &.timing-weak { background: #ef4444; }
    }
  }

  .indicator-badge {
    flex-shrink: 0;
    padding: 4px 10px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 12px;
    min-width: 90px;
    text-align: center;

    &.timing {
      background: rgba(16, 185, 129, 0.12);
      color: #059669;
    }

    &.trend {
      background: rgba(59, 130, 246, 0.12);
      color: #2563eb;
    }

    &.emotion {
      background: rgba(245, 158, 11, 0.12);
      color: #d97706;
    }

    &.anchored {
      background: rgba(139, 92, 246, 0.12);
      color: #7c3aed;
    }
  }

  .indicator-desc {
    color: #475569;
    line-height: 1.6;
    gap: 4px;
    word-break: break-word;

    .tip-icon {
      color: #f59e0b;
      font-size: 14px;
    }
  }
}

// 筛选区
.filter-section {
  background: white;
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;

  .filter-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .filter-label {
      font-size: 14px;
      font-weight: 500;
      color: #475569;
    }
  }

  .date-picker {
    width: 160px;

    :deep(.el-input__wrapper) {
      border-radius: 10px;
      box-shadow: 0 0 0 1px #e2e8f0;
      &:hover { box-shadow: 0 0 0 1px #06b6d4; }
    }
  }

  .date-legend {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #64748b;
    margin-left: 8px;
    padding: 4px 10px;
    background: rgba(245, 158, 11, 0.08);
    border-radius: 6px;
    border: 1px solid rgba(245, 158, 11, 0.2);

    .legend-icon {
      color: #f59e0b;
      font-size: 14px;
    }

    .legend-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
    }
  }
}

// 日期单元格样式
</style>

<style lang="scss">
// 日期选择器弹框样式（全局，因为 popper 挂载到 body）
.strategy-date-popper {
  .date-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    position: relative;

    .date-text {
      line-height: 1;
    }

    .date-dot {
      position: absolute;
      bottom: 0;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #10b981;
    }
  }
}

// 列表区
.list-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
  }
}

// 加载状态
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #64748b;
  gap: 12px;

  .el-icon {
    font-size: 32px;
    color: #06b6d4;
  }
}

// 空状态
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;

  .empty-icon {
    font-size: 56px;
    color: #cbd5e1;
    margin-bottom: 16px;
  }

  h3 {
    font-size: 18px;
    color: #475569;
    margin: 0 0 8px 0;
    font-weight: 600;
  }

  p {
    font-size: 14px;
    margin: 0;
  }
}

// 桌面端表格
.desktop-table {
  :deep(.el-table) {
    border-radius: 12px;
    overflow: hidden;
    font-size: 14px;

    thead th {
      background: linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%);
      font-weight: 600;
      color: #334155;
      border-bottom: 2px solid rgba(6, 182, 212, 0.15);
    }

    tbody tr {
      transition: background 0.2s;
      cursor: pointer;

      &:hover td {
        background: #f0fffe;
      }
    }

    td {
      padding: 14px 0;
      border-bottom-color: #f1f5f9;
    }
  }
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;

  &.top {
    background: linear-gradient(135deg, #059669, #06b6d4);
    color: white;
  }
}

.stock-cell {
  .stock-code {
    font-weight: 600;
    color: #1e293b;
    font-size: 14px;
    font-family: 'SF Mono', 'Monaco', monospace;

    &.clickable {
      cursor: pointer;
      color: #0891b2;
      text-decoration: underline;
      text-decoration-color: rgba(8, 145, 178, 0.3);
      text-underline-offset: 2px;
      transition: all 0.2s;

      &:hover {
        color: #0e7490;
        text-decoration-color: #0e7490;
      }
    }
  }

  .stock-name {
    font-size: 12px;
    color: #94a3b8;
    margin-top: 2px;
  }
}

.text-muted {
  color: #cbd5e1;
}

.column-header {
  display: flex;
  align-items: center;
  gap: 4px;

  .help-icon {
    font-size: 14px;
    color: #94a3b8;
    cursor: help;

    &.warning {
      color: #f59e0b;
    }
  }
}

.indicator-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .indicator-value {
    font-size: 16px;
    font-weight: 700;

    &.trend {
      &.positive { color: #10b981; }
      &.negative { color: #ef4444; }
    }
    &.anchored {
      &.strong { color: #8b5cf6; }
      &.medium { color: #a78bfa; }
      &.weak { color: #94a3b8; }
    }
    &.emotion {
      &.low { color: #10b981; }
      &.medium { color: #f59e0b; }
      &.high { color: #ef4444; }
    }
    &.timing {
      &.strong { color: #10b981; }
      &.medium { color: #f59e0b; }
      &.weak { color: #ef4444; }
    }
  }

  .indicator-progress {
    width: 80px;
  }
}

// 移动端卡片
.mobile-list {
  display: none;
}

.stock-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1.5px solid #e2e8f0;
  transition: all 0.25s ease;
  cursor: pointer;

  &:hover {
    border-color: #06b6d4;
    background: #f0fffe;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e2e8f0;

    .stock-rank {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f1f5f9;
      color: #64748b;
      font-size: 13px;
      font-weight: 700;
      border-radius: 8px;

      &.top {
        background: linear-gradient(135deg, #059669, #06b6d4);
        color: white;
      }
    }

    .stock-info {
      flex: 1;
      min-width: 0;
      overflow: hidden;

      .stock-code {
        font-size: 15px;
        font-weight: 700;
        color: #1e293b;
        font-family: 'SF Mono', 'Monaco', monospace;
        margin-right: 6px;

        &.clickable {
          cursor: pointer;
          color: #0891b2;
          text-decoration: underline;
          text-decoration-color: rgba(8, 145, 178, 0.3);
          text-underline-offset: 2px;
          transition: all 0.2s;

          &:hover {
            color: #0e7490;
            text-decoration-color: #0e7490;
          }
        }
      }

      .stock-name {
        font-size: 12px;
        color: #64748b;
        margin-top: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .card-indicators {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
    width: 100%;
    box-sizing: border-box;

    .indicator-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      .indicator-label {
        font-size: 13px;
        color: #64748b;
        flex-shrink: 0;
      }

      .indicator-cell-mobile {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      }

      .indicator-value {
        font-size: 14px;
        font-weight: 700;
        min-width: 40px;
        text-align: right;

        &.trend {
          &.positive { color: #10b981; }
          &.negative { color: #ef4444; }
        }
        &.anchored {
          &.strong { color: #8b5cf6; }
          &.medium { color: #a78bfa; }
          &.weak { color: #94a3b8; }
        }
        &.emotion {
          &.low { color: #10b981; }
          &.medium { color: #f59e0b; }
          &.high { color: #ef4444; }
        }
        &.timing {
          &.strong { color: #10b981; }
          &.medium { color: #f59e0b; }
          &.weak { color: #ef4444; }
        }
      }

      .indicator-progress-mobile {
        width: 50px;
        flex-shrink: 0;
      }
    }
  }

  .card-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 12px;
    border-top: 1px solid #e2e8f0;
  }
}

// 移动端适配
@media (max-width: 768px) {
  .hero-section {
    padding: 32px 16px 56px;
  }

  .hero-title {
    font-size: 28px;
  }

  .hero-subtitle {
    font-size: 14px;
    padding: 0 8px;
  }

  .content-wrapper {
    margin-top: -28px;
    // padding: 0 12px;
  }

  .indicators-guide {
    padding: 14px 16px;

    .guide-item {
      flex-direction: column;
      gap: 6px;

      .indicator-badge {
        align-self: flex-start;
      }
    }

    .color-legend {
      gap: 6px 10px;
      padding: 6px 10px;
    }

    .legend-item {
      font-size: 11px;
    }
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;
    padding: 14px 16px;

    .filter-left {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;

      .date-picker {
        width: 100%;
      }
    }

    .date-legend {
      margin-left: 0;
      margin-top: 4px;
    }

    .filter-right {
      display: flex;
      justify-content: flex-end;
    }
  }

  .list-section {
    padding: 14px 12px;
  }

  .desktop-table {
    display: none;
  }

  .mobile-list {
    display: block;
  }

  .stock-card {
    padding: 14px 12px;

    .card-header {
      gap: 10px;
    }
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 24px;
  }

  .content-wrapper {
    // padding: 0 10px;
  }

  .indicators-guide {
    padding: 12px 14px;
  }

  .filter-section {
    padding: 12px 14px;
  }

  .list-section {
    padding: 12px 10px;
  }

  .stock-card {
    padding: 12px 10px;

    .card-indicators {
      .indicator-row {
        .indicator-cell-mobile {
          gap: 4px;
        }

        .indicator-value {
          font-size: 13px;
          min-width: 36px;
        }

        .indicator-progress-mobile {
          width: 45px;
        }
      }
    }
  }
}
</style>
