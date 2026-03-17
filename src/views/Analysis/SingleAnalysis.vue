<template>
  <div class="single-analysis">
    <!-- Hero Section - 简洁吸引人的头部 -->
    <div class="hero-section">
      <!-- 暗色科技感背景层 -->
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
          <el-icon><Star /></el-icon>
          <span>AI 驱动的智能分析</span>
        </div>
        <h1 class="hero-title">
          发现投资机会
          <span class="gradient-text">洞察市场趋势</span>
        </h1>
        <p class="hero-subtitle">
          多维度股票分析，AI 智能体协同工作，助您做出更明智的投资决策
        </p>
      </div>
      
      <!-- 装饰性背景元素 -->
      <div class="hero-decoration">
        <div class="floating-card card-1">
          <el-icon><TrendCharts /></el-icon>
          <span>技术分析</span>
        </div>
        <div class="floating-card card-2">
          <el-icon><DataAnalysis /></el-icon>
          <span>基本面</span>
        </div>
        <div class="floating-card card-3">
          <el-icon><Warning /></el-icon>
          <span>风险评估</span>
        </div>
      </div>
    </div>

    <!-- 主分析区域 -->
    <div class="analysis-wrapper">
      <!-- 核心输入区域 -->
      <div class="core-input-section">
        <div class="input-card">
          <!-- 股票代码输入 -->
          <div class="stock-input-wrapper">
            <div class="input-group">
              <el-input
                v-model="analysisForm.stockCode"
                placeholder="输入股票代码，如 000001、AAPL、00700"
                size="large"
                class="stock-input"
                :class="{ 'is-error': stockCodeError }"
                @blur="validateStockCodeInput"
                @input="onStockCodeInput"
                @keyup.enter="submitAnalysis"
              >
                <template #prefix>
                  <el-icon class="input-icon"><Search /></el-icon>
                </template>
                <template #suffix>
                  <el-button
                    v-if="analysisForm.stockCode"
                    type="primary"
                    :loading="submitting"
                    :disabled="!analysisForm.stockCode.trim() || analysisStatus === 'running'"
                    @click="submitAnalysis"
                    class="analyze-btn"
                  >
                    <el-icon v-if="!submitting"><MagicStick /></el-icon>
                    <span>{{ submitting ? '分析中' : '开始分析' }}</span>
                  </el-button>
                </template>
              </el-input>
            </div>
            
            <!-- 市场选择标签 -->
            <!-- <div class="market-tabs">
              <div
                v-for="market in marketOptions"
                :key="market.value"
                class="market-tab"
                :class="{ active: analysisForm.market === market.value }"
                @click="analysisForm.market = market.value; onMarketChange()"
              >
                <span class="market-flag">{{ market.flag }}</span>
                <span class="market-name">{{ market.label }}</span>
              </div>
            </div> -->

            <!-- 错误/帮助提示 -->
            <div v-if="stockCodeError" class="input-message error">
              <el-icon><CircleClose /></el-icon>
              {{ stockCodeError }}
            </div>
            <div v-else-if="stockCodeHelp" class="input-message help">
              <el-icon><InfoFilled /></el-icon>
              {{ stockCodeHelp }}
            </div>

            <!-- 股票信息展示 -->
            <div v-if="fetchingStock" class="stock-info-bar loading">
              <el-icon class="rotating"><Loading /></el-icon>
              <span>查询股票信息中...</span>
            </div>
            <div v-else-if="stockInfo" class="stock-info-bar">
              <span class="stock-name">{{ stockInfo.name }}</span>
              <span class="stock-market">{{ stockInfo.market }}</span>
              <span class="stock-price">¥{{ stockInfo.price }}</span>
              <span
                class="stock-change"
                :class="stockInfo.change_percent >= 0 ? 'up' : 'down'"
              >
                {{ stockInfo.change_percent >= 0 ? '+' : '' }}{{ stockInfo.change_percent.toFixed(2) }}%
              </span>
            </div>
          </div>

          <!-- 快速配置栏 -->
          <div class="quick-config">
            <!-- <div class="config-item">
              <span class="config-label">分析师</span>
              <el-dropdown trigger="click" @command="handleAnalystCommand">
                <el-button type="default" size="default" class="analyst-btn">
                  <el-icon><User /></el-icon>
                  <span>已选 {{ analysisForm.selectedAnalysts.length }} 位</span>
                  <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu class="analyst-dropdown">
                    <el-dropdown-item v-for="analyst in ANALYSTS" :key="analyst.id" :command="analyst.name">
                      <div class="dropdown-analyst-item" :class="{ 
                        selected: analysisForm.selectedAnalysts.includes(analyst.name),
                        disabled: analyst.name === '社媒分析师' && analysisForm.market === 'A股'
                      }">
                        <el-icon><component :is="analyst.icon" /></el-icon>
                        <div class="analyst-info">
                          <span class="analyst-name">{{ analyst.name }}</span>
                          <span class="analyst-desc">{{ analyst.description }}</span>
                        </div>
                        <el-icon v-if="analysisForm.selectedAnalysts.includes(analyst.name)" class="check-icon"><Check /></el-icon>
                      </div>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div> -->

            <!-- 高级配置开关 -->
            <!-- <div class="config-item advanced-toggle">
              <el-button 
                type="default" 
                size="default" 
                text
                @click="showAdvanced = !showAdvanced"
                class="toggle-btn"
              >
                <el-icon><Setting /></el-icon>
                <span>高级配置</span>
                <el-icon class="toggle-icon" :class="{ 'is-open': showAdvanced }"><ArrowDown /></el-icon>
              </el-button>
            </div> -->
          </div>

          <!-- 高级配置面板（可折叠） -->
          <el-collapse-transition>
            <div v-show="showAdvanced" class="advanced-panel">
              <el-divider />
              <div class="advanced-content">
                <div class="advanced-row">
                  <div class="advanced-item">
                    <span class="item-label">分析日期</span>
                    <el-date-picker
                      v-model="analysisForm.analysisDate"
                      type="date"
                      placeholder="选择日期"
                      size="default"
                      :disabled-date="disabledDate"
                      class="date-picker"
                    />
                  </div>
                  <div class="advanced-item">
                    <span class="item-label">语言</span>
                    <el-radio-group v-model="analysisForm.language" size="default">
                      <el-radio-button label="zh-CN">中文</el-radio-button>
                      <el-radio-button label="en-US">English</el-radio-button>
                    </el-radio-group>
                  </div>
                </div>
                <div class="advanced-row">
                  <div class="advanced-item">
                    <span class="item-label">情绪分析</span>
                    <el-switch v-model="analysisForm.includeSentiment" />
                  </div>
                  <div class="advanced-item">
                    <span class="item-label">风险评估</span>
                    <el-switch v-model="analysisForm.includeRisk" />
                  </div>
                </div>
              </div>
            </div>
          </el-collapse-transition>

          <!-- 费用与余额提示 -->
          <div v-if="analysisPrice.price > 0" class="cost-bar" :class="{ 'cost-insufficient': authStore.points < analysisPrice.price }">
            <div class="cost-left">
              <el-icon><Coin /></el-icon>
              <span>本次分析消耗 <em>{{ analysisPrice.price }}</em> ⚡</span>
              <span v-if="analysisPrice.desc" class="cost-desc">· {{ analysisPrice.desc }}</span>
            </div>
            <div class="cost-right">
              <span class="balance-text">余额 {{ authStore.points }} ⚡</span>
              <el-tag v-if="authStore.points < analysisPrice.price" type="danger" size="small" effect="light">算力不足</el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 分析进度 -->
      <transition name="fade">
        <div v-if="analysisStatus === 'running'" class="progress-section">
          <div class="progress-card">
            <div class="progress-header">
              <div class="progress-title">
                <el-icon class="rotating"><Loading /></el-icon>
                <span>正在分析 {{ analysisForm.stockCode }}</span>
              </div>
              <div class="progress-stats">
                <span class="stat-item">
                  <el-icon><Timer /></el-icon>
                  {{ formatTime(progressInfo.elapsedTime) }}
                </span>
              </div>
            </div>
            <el-progress 
              :percentage="Math.round(progressInfo.progress)" 
              :stroke-width="8"
              :show-text="true"
              :status="getProgressStatus()"
              class="progress-bar"
            />
            <div class="progress-step">
              <el-icon><Loading /></el-icon>
              <span>{{ progressInfo.currentStepDescription || '正在初始化...' }}</span>
            </div>
          </div>
        </div>
      </transition>

      <!-- 信息卡片区域 - 仅在未显示结果时展示 -->
      <transition name="fade">
        <div class="info-section">
          <div class="info-grid">
            <!-- 最近分析 -->
            <div class="info-card recent-analyses">
              <div class="card-header">
                <div class="header-title">
                  <el-icon><Clock /></el-icon>
                  <span>最近分析</span>
                </div>
                <el-button type="text" size="small" @click="goToHistory">
                  查看全部 <el-icon><ArrowRight /></el-icon>
                </el-button>
              </div>
              <div class="card-content">
                <div v-if="recentAnalyses.length === 0" class="empty-state">
                  <el-icon class="empty-icon"><Document /></el-icon>
                  <p>暂无分析记录</p>
                </div>
                <div v-else class="analysis-list">
                  <div
                    v-for="analysis in recentAnalyses.slice(0, 5)"
                    :key="analysis.task_id"
                    class="analysis-item"
                    @click="viewAnalysis(analysis)"
                  >
                    <div class="analysis-info">
                      <div class="stock-code">{{ analysis.stock_code || analysis.symbol }}</div>
                      <div class="analysis-time">{{ formatTime1(analysis.start_time) }}</div>
                    </div>
                    <el-tag :type="getStatusType(analysis.status)" size="small">
                      {{ getStatusText(analysis.status) }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>

            <!-- 市场快讯 -->
            <div class="info-card market-news">
              <div class="card-header">
                <div class="header-title">
                  <el-icon><Bell /></el-icon>
                  <span>市场快讯</span>
                </div>
                <el-button type="text" size="small" @click="syncMarketNews" :loading="syncingNews">
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </div>
              <div class="card-content">
                <div v-if="marketNews.length === 0" class="empty-state">
                  <el-icon class="empty-icon"><Bell /></el-icon>
                  <p>暂无市场快讯</p>
                </div>
                <div v-else class="news-list">
                  <div
                    v-for="news in marketNews.slice(0, 5)"
                    :key="news.id"
                    class="news-item"
                    @click="openNewsUrl(news.url)"
                  >
                    <div class="news-dot"></div>
                    <div class="news-content">
                      <div class="news-title">{{ news.title }}</div>
                      <div class="news-meta">
                        <span class="news-source">{{ news.source }}</span>
                        <span class="news-time">{{ formatTime1(news.time) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- 分析结果 -->
      <transition name="fade">
        <div v-if="showResults && analysisResults" class="results-section">
          <div class="results-card">
            <div class="results-header">
              <div class="header-left">
                <h3>📊 分析报告</h3>
                <div class="result-tags">
                  <el-tag size="small" type="primary">{{ analysisResults.symbol || analysisForm.stockCode }}</el-tag>
                  <el-tag size="small">{{ analysisResults.analysis_date }}</el-tag>
                </div>
              </div>
              <div class="header-actions">
                <el-button type="primary" size="default" @click="restartAnalysis">
                  <el-icon><Refresh /></el-icon>
                  重新分析
                </el-button>
              </div>
            </div>

            <!-- 风险提示 -->
            <el-alert
              type="warning"
              :closable="false"
              show-icon
              class="risk-alert"
            >
              <template #title>
                <strong>风险提示</strong>：本分析仅供参考，不构成投资建议。投资有风险，入市需谨慎。
              </template>
            </el-alert>

            <!-- 决策结果 -->
            <div v-if="analysisResults.decision" class="decision-section">
              <div class="decision-card" :class="getDecisionClass(analysisResults.decision.action)">
                <div class="decision-main">
                  <div class="decision-action">
                    <span class="action-label">分析倾向</span>
                    <span class="action-value">{{ analysisResults.decision.action }}</span>
                  </div>
                  <div class="decision-metrics">
                    <div class="metric">
                      <span class="metric-label">参考价格</span>
                      <span class="metric-value">{{ analysisResults.decision.target_price }}</span>
                    </div>
                    <div class="metric">
                      <span class="metric-label">置信度</span>
                      <span class="metric-value">{{ (analysisResults.decision.confidence * 100).toFixed(1) }}%</span>
                    </div>
                    <div class="metric">
                      <span class="metric-label">风险评分</span>
                      <span class="metric-value">{{ (analysisResults.decision.risk_score * 100).toFixed(1) }}%</span>
                    </div>
                  </div>
                </div>
                <div v-if="analysisResults.decision.reasoning" class="decision-reason">
                  <p>{{ analysisResults.decision.reasoning }}</p>
                </div>
              </div>
            </div>

            <!-- 详细报告 -->
            <div v-if="analysisResults.state || analysisResults.reports" class="reports-section">
              <el-tabs v-model="activeReportTab" type="border-card" class="report-tabs">
                <el-tab-pane 
                  v-for="(report, key) in analysisResults.reports || analysisResults.state?.reports" 
                  :key="key" 
                  :label="getReportLabel(String(key))"
                  :name="String(key)"
                >
                  <div class="report-content" v-html="renderMarkdown(report)"></div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, onActivated, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  TrendCharts,
  Search,
  Coin,
  CircleClose,
  InfoFilled,
  Check,
  Loading,
  Refresh,
  ArrowDown,
  User,
  Setting,
  Timer,
  DataAnalysis,
  Warning,
  Star,
  Clock,
  ArrowRight,
  Bell,
  Document
} from '@element-plus/icons-vue'
import { analysisApi, type SingleAnalysisRequest } from '@/api/analysis'
import { stocksApi } from '@/api/stocks'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { ANALYSTS, convertAnalystNamesToIds } from '@/constants/analysts'
import { marked } from 'marked'
import { validateStockCode, getStockCodeFormatHelp } from '@/utils/stockValidator'
import { newsApi } from '@/api/news'
import type { AnalysisTask } from '@/types/analysis'
import { formatDateTime } from '@/utils/datetime'

// 配置marked选项
marked.setOptions({
  breaks: true,
  gfm: true
})

// 市场类型定义
type MarketType = 'A股' | '美股' | '港股'

// 表单类型定义
interface AnalysisForm {
  stockCode: string
  symbol: string
  market: MarketType
  analysisDate: Date
  researchDepth: number
  selectedAnalysts: string[]
  includeSentiment: boolean
  includeRisk: boolean
  language: 'zh-CN' | 'en-US'
}

// 使用store
const appStore = useAppStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// 声明组件名，供 keep-alive 按名缓存
defineOptions({ name: 'SingleAnalysis' })

const submitting = ref(false)
const showAdvanced = ref(false)

// 粒子背景
const particles = ref<Array<{ x: number; y: number; size: number; opacity: number }>>([])
const initParticles = () => {
  particles.value = Array.from({ length: 28 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    opacity: Math.random() * 0.5 + 0.15
  }))
}

// 市场选项
const marketOptions = [
  { value: 'A股' as MarketType, label: 'A股', flag: '🇨🇳' },
  // { value: '美股' as MarketType, label: '美股', flag: '🇺🇸' },
  // { value: '港股' as MarketType, label: '港股', flag: '🇭🇰' },
]

// 分析表单
const analysisForm = reactive<AnalysisForm>({
  stockCode: '',
  symbol: '',
  market: 'A股',
  analysisDate: new Date(),
  researchDepth: 4,
  selectedAnalysts: ['市场分析师', '基本面分析师', '新闻分析师'],
  includeSentiment: true,
  includeRisk: true,
  language: 'zh-CN'
})

// 股票代码验证相关
const stockCodeError = ref<string>('')
const stockCodeHelp = ref<string>('')

// 股票信息（验证通过后查询）
const stockInfo = ref<{ name: string; price: number; change_percent: number; market: string } | null>(null)
const fetchingStock = ref(false)

// 深度选项
const depthOptions = [
  { icon: '⚡', name: '快速分析', description: '基础数据概览，快速决策', time: '2-5分钟' },
  { icon: '📈', name: '基础分析', description: '常规投资决策', time: '3-6分钟' },
  { icon: '🎯', name: '标准分析', description: '技术+基本面，推荐', time: '4-8分钟' },
  { icon: '🔍', name: '深度分析', description: '多轮辩论，深度研究', time: '6-11分钟' },
  { icon: '🏆', name: '全面分析', description: '最全面的分析报告', time: '8-16分钟' }
]

// 分析进度和结果相关状态
const currentTaskId = ref('')
const analysisStatus = ref('idle') // 'idle', 'running', 'completed', 'failed'
const showResults = ref(false)
const analysisResults = ref<any>(null)
const activeReportTab = ref('')
const progressInfo = ref({
  progress: 0,
  currentStep: '',
  currentStepDescription: '',
  message: '',
  elapsedTime: 0,
  remainingTime: 0,
  totalTime: 0
})
const pollingTimer = ref<any>(null)

// ─── sessionStorage 持久化：记录进行中的任务 ────────────────────
const SA_TASK_KEY = 'sa_current_task_id'

// taskId 变化时同步到 sessionStorage
watch(currentTaskId, (id: string) => {
  if (id) {
    sessionStorage.setItem(SA_TASK_KEY, id)
  } else {
    sessionStorage.removeItem(SA_TASK_KEY)
  }
})

// 恢复进行中/已完成的任务状态
const tryRestoreTask = async () => {
  const savedId = sessionStorage.getItem(SA_TASK_KEY)
  if (!savedId) return

  try {
    const response = await analysisApi.getTaskStatus(savedId)
    const data = response.data
    if (!data) {
      sessionStorage.removeItem(SA_TASK_KEY)
      return
    }

    currentTaskId.value = savedId

    if (data.status === 'running' || data.status === 'processing' || data.status === 'pending') {
      // 任务还在跑，恢复进度并继续轮询
      analysisStatus.value = 'running'
      progressInfo.value = {
        progress: data.progress || 0,
        currentStep: data.current_step_name || data.stage || '处理中...',
        currentStepDescription: data.current_step_description || '',
        message: data.message || '',
        elapsedTime: data.elapsed_time || 0,
        remainingTime: data.estimated_remaining || 0,
        totalTime: (data.elapsed_time || 0) + (data.estimated_remaining || 0)
      }
      startPollingTaskStatus()
    } else if (data.status === 'completed') {
      // 任务已完成，直接展示结果
      analysisStatus.value = 'completed'
      showResults.value = true
      analysisResults.value = data.result
      sessionStorage.removeItem(SA_TASK_KEY)
    } else {
      // failed / cancelled，清除记录
      sessionStorage.removeItem(SA_TASK_KEY)
    }
  } catch {
    sessionStorage.removeItem(SA_TASK_KEY)
  }
}

// 最近分析数据
const recentAnalyses = ref<AnalysisTask[]>([])

// 市场快讯数据
const marketNews = ref<any[]>([])
const syncingNews = ref(false)

// 分析费用
const analysisPrice = ref({ price: 0, unit: '⚡', desc: '' })
const fetchAnalysisPrice = async () => {
  try {
    const res = await analysisApi.getConsumePrice()
    
  
    const d = res.data ?? res
    console.log('获取分析费用结果:', d)
    analysisPrice.value = {
      price: d.price ?? 0,
      unit: d.unit || '⚡',
      desc: d.desc ?? ''
    }
  } catch (e) {
    console.error('获取分析费用失败:', e)
  }
}

// 禁用日期
const disabledDate = (time: Date) => {
  return time.getTime() > Date.now()
}

// 防抖定时器
const debounceTimer = ref<any>(null)

// 股票代码输入时的处理
const onStockCodeInput = () => {
  stockCodeError.value = ''
  stockCodeHelp.value = ''
  stockInfo.value = null
  fetchingStock.value = false

  if (debounceTimer.value) clearTimeout(debounceTimer.value)

  if (analysisForm.stockCode.trim()) {
    debounceTimer.value = setTimeout(() => {
      validateStockCodeInput()
    }, 500)
  }
}

// 市场类型变更时的处理
const onMarketChange = () => {
  if (analysisForm.stockCode.trim()) {
    validateStockCodeInput()
  } else {
    stockCodeHelp.value = getStockCodeFormatHelp(analysisForm.market)
  }
}

// 验证股票代码输入
const validateStockCodeInput = () => {
  const code = analysisForm.stockCode.trim()

  if (!code) {
    stockCodeError.value = ''
    stockCodeHelp.value = ''
    stockInfo.value = null
    return
  }

  const validation = validateStockCode(code, analysisForm.market)

  if (!validation.valid) {
    stockCodeError.value = validation.message || '股票代码格式不正确'
    stockCodeHelp.value = ''
    stockInfo.value = null
  } else {
    stockCodeError.value = ''
    stockCodeHelp.value = `✓ ${validation.market}代码格式正确`

    if (validation.market && validation.market !== analysisForm.market) {
      analysisForm.market = validation.market
      ElMessage.success(`已自动识别为${validation.market}`)
    }

    if (validation.normalizedCode) {
      analysisForm.stockCode = validation.normalizedCode
    }

    // 格式正确，查询股票信息
    fetchStockInfo(validation.normalizedCode || code)
  }
}

// 查询股票行情（用于显示股票名称）
const fetchStockInfo = async (code: string) => {
  fetchingStock.value = true
  stockInfo.value = null
  try {
    const res = await stocksApi.getQuote(code)
    const d = (res as any)?.data
    if (d && d.name) {
      stockInfo.value = {
        name: d.name,
        price: d.price ?? d.close ?? 0,
        change_percent: d.change_percent ?? d.pct_chg ?? 0,
        market: d.market || ''
      }
    }
  } catch (err: any) {
    // 404 表示股票不存在
    const status = err?.response?.status ?? err?.status
    if (status === 404) {
      stockCodeError.value = '该股票不存在'
      stockCodeHelp.value = ''
    }
    // 其他错误静默忽略，不影响主流程
  } finally {
    fetchingStock.value = false
  }
}

// 处理分析师选择
const handleAnalystCommand = (analystName: string) => {
  if (analystName === '社媒分析师' && analysisForm.market === 'A股') {
    ElMessage.warning('A股市场暂不支持社媒分析')
    return
  }

  const index = analysisForm.selectedAnalysts.indexOf(analystName)
  if (index > -1) {
    if (analysisForm.selectedAnalysts.length > 1) {
      analysisForm.selectedAnalysts.splice(index, 1)
    } else {
      ElMessage.warning('请至少选择一个分析师')
    }
  } else {
    analysisForm.selectedAnalysts.push(analystName)
  }
}

// 获取深度描述
const getDepthDescription = (depth: number): string => {
  const descriptions = ['快速分析', '基础分析', '标准分析', '深度分析', '全面分析']
  return descriptions[depth - 1] || '标准分析'
}

// 提交分析
const submitAnalysis = async () => {
  const stockCode = analysisForm.stockCode.trim()
  if (!stockCode) {
    ElMessage.warning('请输入股票代码')
    return
  }

  const validation = validateStockCode(stockCode, analysisForm.market)
  if (!validation.valid) {
    ElMessage.error(validation.message || '股票代码格式不正确')
    stockCodeError.value = validation.message || '股票代码格式不正确'
    return
  }

  analysisForm.symbol = validation.normalizedCode || stockCode.toUpperCase()

  if (analysisForm.selectedAnalysts.length === 0) {
    ElMessage.warning('请至少选择一个分析师')
    return
  }

  // 检查积分是否足够
  if (analysisPrice.value.price > 0 && authStore.points < analysisPrice.value.price) {
    ElMessage.error(`算力不足！本次分析需要 ${analysisPrice.value.price} ⚡，当前余额 ${authStore.points} ⚡，请先前往充値`)
    router.push('/recharge')
    return
  }

  submitting.value = true

  try {
    const analysisDate = analysisForm.analysisDate instanceof Date
      ? analysisForm.analysisDate
      : new Date(analysisForm.analysisDate)

    const request: SingleAnalysisRequest = {
      symbol: analysisForm.symbol,
      stock_code: analysisForm.symbol,
      parameters: {
        market_type: analysisForm.market,
        analysis_date: analysisDate.toISOString().split('T')[0],
        research_depth: getDepthDescription(analysisForm.researchDepth),
        selected_analysts: convertAnalystNamesToIds(analysisForm.selectedAnalysts),
        include_sentiment: analysisForm.includeSentiment,
        include_risk: analysisForm.includeRisk,
        language: analysisForm.language,
        quick_analysis_model: 'deepseek-chat',
        deep_analysis_model: 'deepseek-chat'
      }
    }

    const response = await analysisApi.startSingleAnalysis(request)
    ElMessage.success('分析任务已提交')

    currentTaskId.value = response.data.task_id

    if (!currentTaskId.value) {
      ElMessage.error('任务ID获取失败')
      return
    }

    analysisStatus.value = 'running'
    showResults.value = false
    progressInfo.value = {
      progress: 0,
      currentStep: '正在初始化分析...',
      currentStepDescription: '分析任务已提交',
      message: '分析任务已提交',
      elapsedTime: 0,
      remainingTime: 0,
      totalTime: 0
    }

    startPollingTaskStatus()
  } catch (error: any) {
    console.error('提交分析失败:', error)
    ElMessage.error(error.message || '提交分析失败')
  } finally {
    submitting.value = false
  }
}

// 轮询任务状态
const startPollingTaskStatus = () => {
  if (pollingTimer.value) {
    clearInterval(pollingTimer.value)
  }

  pollingTimer.value = setInterval(async () => {
    if (!currentTaskId.value) return

    try {
      const response = await analysisApi.getTaskStatus(currentTaskId.value)
      const data = response.data

      if (data) {
        progressInfo.value = {
          progress: data.progress || 0,
          currentStep: data.current_step_name || data.stage || '处理中...',
          currentStepDescription: data.current_step_description || '',
          message: data.message || '',
          elapsedTime: data.elapsed_time || 0,
          remainingTime: data.estimated_remaining || 0,
          totalTime: (data.elapsed_time || 0) + (data.estimated_remaining || 0)
        }
 
        if (data.status === 'completed') {
          analysisStatus.value = 'completed'
          showResults.value = true
          analysisResults.value = data.result
          clearInterval(pollingTimer.value)
          sessionStorage.removeItem(SA_TASK_KEY)
          ElMessage.success('分析完成')
          // 刷新最近分析列表，确保数据最新
          loadRecentAnalyses()
        } else if (data.status === 'failed') {
          analysisStatus.value = 'failed'
          clearInterval(pollingTimer.value)
          sessionStorage.removeItem(SA_TASK_KEY)
          ElMessage.error(data.error || '分析失败')
          loadRecentAnalyses()
        }
      }
    } catch (error) {
      console.error('获取任务状态失败:', error)
    }
  }, 2000)
}

// 重新开始分析
const restartAnalysis = () => {
  analysisStatus.value = 'idle'
  showResults.value = false
  analysisResults.value = null
  currentTaskId.value = ''
  progressInfo.value = {
    progress: 0,
    currentStep: '',
    currentStepDescription: '',
    message: '',
    elapsedTime: 0,
    remainingTime: 0,
    totalTime: 0
  }
  if (pollingTimer.value) {
    clearInterval(pollingTimer.value)
  }
}
const formatTime1 = (time: string) => {
  return formatDateTime(time)
}
// 格式化时间
const formatTime = (seconds: number): string => {
  if (!seconds || seconds < 0) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 获取进度状态
const getProgressStatus = () => {
  if (progressInfo.value.progress >= 100) return 'success'
  if (analysisStatus.value === 'failed') return 'exception'
  return ''
}

// 获取决策样式类
const getDecisionClass = (action: string): string => {
  const actionMap: Record<string, string> = {
    '买入': 'buy',
    '卖出': 'sell',
    '持有': 'hold',
    '观望': 'neutral',
    'Buy': 'buy',
    'Sell': 'sell',
    'Hold': 'hold',
    'Neutral': 'neutral'
  }
  return actionMap[action] || 'neutral'
}

// 渲染Markdown
const renderMarkdown = (content: string): string => {
  if (!content) return ''
  try {
    return marked(content)
  } catch (e) {
    return content
  }
}

// 获取报告标签
const getReportLabel = (key: string): string => {
  const labelMap: Record<string, string> = {
    'market_analyst': '📈 市场分析',
    'fundamental_analyst': '📊 基本面分析',
    'sentiment_analyst': '😊 情绪分析',
    'risk_manager': '⚠️ 风险评估',
    'research_manager': '🎯 研究总结',
    'final_decision': '🏆 最终决策'
  }
  return labelMap[key] || key
}

// 加载最近分析
const loadRecentAnalyses = async () => {
  try {
    const res = await analysisApi.getTaskList({
      limit: 5,
      offset: 0,
      status: undefined
    })
    const body: any = (res as any)?.data?.data || (res as any)?.data || res || {}
    recentAnalyses.value = body.tasks || []
  } catch (error) {
    console.error('加载最近分析失败:', error)
  }
}

// 加载市场快讯
const loadMarketNews = async () => {
  try {
    let response = await newsApi.getLatestNews(undefined, 5, 24)
    if (response.success && response.data && response.data.news.length === 0) {
      response = await newsApi.getLatestNews(undefined, 5, 24 * 365)
    }
    if (response.success && response.data) {
      marketNews.value = response.data.news.map((item: any) => ({
        id: item.id || item.title,
        title: item.title,
        time: item.publish_time,
        url: item.url,
        source: item.source
      }))
    }
  } catch (error) {
    console.error('加载市场快讯失败:', error)
  }
}

// 同步市场新闻
const syncMarketNews = async () => {
  try {
    syncingNews.value = true
    const response = await newsApi.syncMarketNews(24, 50)
    if (response.success) {
      setTimeout(async () => {
        await loadMarketNews()
      }, 3000)
    }
  } catch (error) {
    console.error('同步市场快讯失败:', error)
  } finally {
    syncingNews.value = false
  }
}

// 查看分析详情
const viewAnalysis = (analysis: AnalysisTask) => {
  if (analysis.status === 'completed') {
    router.push({
      name: 'AnalysisReport',
      params: { id: analysis.task_id },
      query: {
        symbol: analysis.stock_code || analysis.symbol || '',
        date: analysis.created_at ? analysis.created_at.slice(0, 10) : ''
      }
    })
  } else {
    router.push('/tasks?tab=failed')
  }
}

// const viewAnalysis1 = (analysis: AnalysisTask) => {
//   if (analysis.status === 'completed') {
//     router.push({ name: 'ReportDetail', params: { id: analysis.task_id } })
//   } else {
//     router.push('/tasks?tab=running')
//   }
// }

// 跳转到历史记录
const goToHistory = () => {
  router.push('/tasks?tab=completed')
}

// 获取状态类型
const getStatusType = (status: string): 'success' | 'info' | 'warning' | 'danger' => {
  const statusMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
    pending: 'info',
    processing: 'warning',
    running: 'warning',
    completed: 'success',
    failed: 'danger',
    cancelled: 'info'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '等待中',
    processing: '处理中',
    running: '处理中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

// 打开新闻链接
const openNewsUrl = (url?: string) => {
  if (url) {
    window.open(url, '_blank')
  } else {
    ElMessage.info('该新闻暂无详情链接')
  }
}

// 组件挂载
onMounted(() => {
  // 从路由参数获取股票代码
  const { symbol } = route.query
  if (symbol) {
    analysisForm.stockCode = symbol as string
    validateStockCodeInput()
  }
  // 初始化粒子
  initParticles()
  fetchAnalysisPrice()
  // 加载最近分析和市场快讯
  loadRecentAnalyses()
  loadMarketNews()
  // 尝试从 sessionStorage 恢复上次未完成/已完成的任务
  tryRestoreTask()
})

// keep-alive 激活时（从其他页面切回来）
onActivated(() => {
  // 刷新最近分析列表，确保数据最新
  loadRecentAnalyses()
})

// 组件卸载
onUnmounted(() => {
  if (pollingTimer.value) {
    clearInterval(pollingTimer.value)
  }
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }
})
</script>

<style lang="scss" scoped>
// 变量定义
:root {
  --primary-gradient: linear-gradient(135deg, #059669 0%, #06b6d4 100%);
  --success-gradient: linear-gradient(135deg, #10b981 0%, #059669 100%);
  --warning-gradient: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  --danger-gradient: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

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

// 动画定义
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.4); }
  50% { box-shadow: 0 0 40px rgba(6, 182, 212, 0.6); }
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// 页面容器
.single-analysis {
  min-height: 100vh;
  background: #f0f9ff;
  padding-bottom: 48px;
}

// Hero Section
.hero-section {
  position: relative;
  padding: 60px 24px 80px;
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

// 背景效果层
.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
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
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  color: white;
  margin: 0 0 16px 0;
  line-height: 1.2;
  
  .gradient-text {
    background: linear-gradient(135deg, #ffd700 0%, #ffed4a 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.hero-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  line-height: 1.6;
}

// 装饰性浮动卡片
.hero-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 2;
}

.floating-card {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: float 3s ease-in-out infinite;
  
  &.card-1 {
    top: 20%;
    left: 5%;
    animation-delay: 0s;
  }
  
  &.card-2 {
    top: 60%;
    right: 5%;
    animation-delay: 1s;
  }
  
  &.card-3 {
    bottom: 20%;
    left: 10%;
    animation-delay: 2s;
  }
}

// 分析区域包装器
.analysis-wrapper {
  max-width: 900px;
  margin: -40px auto 0;
  padding: 0 24px;
  position: relative;
  z-index: 3;
}

// 核心输入区域
.core-input-section {
  margin-bottom: 24px;
}

.input-card {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.stock-input-wrapper {
  margin-bottom: 24px;
}

.input-group {
  position: relative;
  
  .stock-input {
    :deep(.el-input__wrapper) {
      padding: 4px;
      box-shadow: 0 0 0 1px #e2e8f0 inset;
      border-radius: 16px;
      transition: all 0.3s ease;
      
      &:hover, &:focus-within {
        box-shadow: 0 0 0 2px #06b6d4 inset;
      }
    }
    
    :deep(.el-input__inner) {
      height: 56px;
      font-size: 18px;
      font-weight: 500;
      padding-left: 8px;
      
      &::placeholder {
        color: #94a3b8;
        font-weight: 400;
      }
    }
    
    .input-icon {
      font-size: 20px;
      color: #64748b;
      margin-left: 8px;
    }
    
    &.is-error {
      :deep(.el-input__wrapper) {
        box-shadow: 0 0 0 2px #ef4444 inset;
      }
    }
  }
  
  .analyze-btn {
    height: 48px;
    padding: 0 24px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    background: linear-gradient(135deg, #059669 0%, #06b6d4 100%);
    border: none;
    margin-right: 4px;
    
    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(6, 182, 212, 0.4);
    }
    
    &:disabled {
      opacity: 0.6;
    }
    
    .el-icon {
      margin-right: 6px;
    }
  }
}

// 市场标签
.market-tabs {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.market-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f1f5f9;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  
  &:hover {
    background: #e2e8f0;
  }
  
  &.active {
    background: linear-gradient(135deg, #059669 0%, #06b6d4 100%);
    color: white;
    border-color: transparent;
  }
  
  .market-flag {
    font-size: 16px;
  }
  
  .market-name {
    font-size: 14px;
    font-weight: 500;
  }
}

// 输入消息提示
.input-message {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  font-size: 13px;
  
  &.error {
    color: #ef4444;
  }
  
  &.help {
    color: #10b981;
  }
  
  .el-icon {
    font-size: 14px;
  }
}

// 股票信息展示栏
.stock-info-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  padding: 8px 14px;
  background: linear-gradient(135deg, rgba(5,150,105,0.05), rgba(6,182,212,0.07));
  border: 1px solid #cffafe;
  border-radius: 10px;
  font-size: 13px;
  flex-wrap: wrap;

  &.loading {
    color: #64748b;
    .el-icon { color: #06b6d4; font-size: 14px; }
  }

  .stock-name {
    font-weight: 700;
    font-size: 14px;
    color: #1e293b;
  }

  .stock-market {
    padding: 1px 7px;
    background: rgba(6,182,212,0.1);
    border-radius: 20px;
    color: #0891b2;
    font-size: 12px;
  }

  .stock-price {
    font-weight: 600;
    color: #1e293b;
    font-size: 14px;
    margin-left: auto;
  }

  .stock-change {
    font-weight: 600;
    font-size: 13px;
    &.up { color: #ef4444; }
    &.down { color: #10b981; }
  }
}

// 快速配置栏
.quick-config {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.config-item {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .config-label {
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
  }
}

.depth-select {
  width: 160px;
}

.depth-option-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .depth-time {
    font-size: 12px;
    color: #94a3b8;
  }
}

.analyst-btn {
  .el-icon {
    margin-right: 4px;
  }
}

.analyst-dropdown {
  min-width: 240px;
}

.dropdown-analyst-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
  
  &.selected {
    .analyst-name {
      color: #06b6d4;
      font-weight: 600;
    }
  }
  
  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .analyst-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    
    .analyst-name {
      font-size: 14px;
      font-weight: 500;
    }
    
    .analyst-desc {
      font-size: 12px;
      color: #94a3b8;
    }
  }
  
  .check-icon {
    color: #06b6d4;
  }
}

.toggle-btn {
  .toggle-icon {
    margin-left: 4px;
    transition: transform 0.3s ease;
    
    &.is-open {
      transform: rotate(180deg);
    }
  }
}

// 高级配置面板
.advanced-panel {
  margin-top: 20px;
}

.advanced-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.advanced-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.advanced-item {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .item-label {
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
    min-width: 70px;
  }
  
  .date-picker {
    width: 150px;
  }
}

// 费用余额提示栏
.cost-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding: 10px 16px;
  background: linear-gradient(135deg, rgba(5,150,105,0.06), rgba(6,182,212,0.08));
  border: 1px solid #cffafe;
  border-radius: 12px;
  flex-wrap: wrap;
  gap: 8px;
  transition: all 0.3s;

  &.cost-insufficient {
    background: rgba(239,68,68,0.06);
    border-color: #fca5a5;
  }

  .cost-left {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #475569;
    .el-icon { color: #059669; font-size: 15px; }
    em { color: #059669; font-style: normal; font-weight: 700; font-size: 15px; }
    .cost-desc { color: #94a3b8; }
  }

  .cost-right {
    display: flex;
    align-items: center;
    gap: 8px;
    .balance-text { font-size: 13px; color: #64748b; font-weight: 500; }
  }
}

// 进度区域
.progress-section {
  margin-bottom: 24px;
}

.progress-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.progress-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  
  .rotating {
    animation: rotating 2s linear infinite;
    color: #06b6d4;
  }
}

.progress-stats {
  .stat-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #64748b;
    
    .el-icon {
      color: #94a3b8;
    }
  }
}

.progress-bar {
  margin-bottom: 12px;
}

.progress-step {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #64748b;
  
  .el-icon {
    color: #06b6d4;
    animation: rotating 2s linear infinite;
  }
}

// 结果区域
.results-section {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.results-card {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
  
  .header-left {
    h3 {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 8px 0;
    }
    
    .result-tags {
      display: flex;
      gap: 8px;
    }
  }
}

.risk-alert {
  margin-bottom: 24px;
}

// 决策卡片
.decision-section {
  margin-bottom: 24px;
}

.decision-card {
  border-radius: 16px;
  padding: 24px;
  border: 2px solid;
  
  &.buy {
    background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
    border-color: #10b981;
  }
  
  &.sell {
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    border-color: #ef4444;
  }
  
  &.hold, &.neutral {
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    border-color: #3b82f6;
  }
}

.decision-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 16px;
}

.decision-action {
  .action-label {
    display: block;
    font-size: 14px;
    color: #64748b;
    margin-bottom: 4px;
  }
  
  .action-value {
    font-size: 28px;
    font-weight: 800;
    color: #1e293b;
  }
}

.decision-metrics {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.metric {
  text-align: center;
  
  .metric-label {
    display: block;
    font-size: 12px;
    color: #64748b;
    margin-bottom: 4px;
  }
  
  .metric-value {
    font-size: 20px;
    font-weight: 700;
    color: #1e293b;
  }
}

.decision-reason {
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  
  p {
    margin: 0;
    font-size: 14px;
    color: #475569;
    line-height: 1.6;
  }
}

// 报告区域
.reports-section {
  .report-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 0;
    }
  }
}

// 信息卡片区域
.info-section {
  margin-top: 24px;
}

.info-grid {
  display: flex;
  gap: 24px;
  
  @media (max-width: 768px) {
    gap: 10px;
    flex-direction: column;
  }
}

.info-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  flex: 1;
  
  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f1f5f9;
    
    .header-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      
      .el-icon {
        color: #06b6d4;
        font-size: 18px;
      }
    }
  }
  
  .card-content {
    min-height: 200px;
  }
}

// 最近分析样式
.recent-analyses {
  .analysis-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .analysis-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f8fafc;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid transparent;
    
    &:hover {
      background: #f1f5f9;
      border-color: #e2e8f0;
      transform: translateX(4px);
    }
    
    .analysis-info {
      .stock-code {
        font-size: 15px;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 4px;
      }
      
      .analysis-time {
        font-size: 12px;
        color: #94a3b8;
      }
    }
  }
}

// 市场快讯样式
.market-news {
  .news-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .news-item {
    display: flex;
    gap: 12px;
    padding: 12px;
    background: #f8fafc;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid transparent;
    
    &:hover {
      background: #f1f5f9;
      border-color: #e2e8f0;
    }
    
    .news-dot {
      width: 8px;
      height: 8px;
      background: #06b6d4;
      border-radius: 50%;
      margin-top: 6px;
      flex-shrink: 0;
    }
    
    .news-content {
      flex: 1;
      min-width: 0;
      
      .news-title {
        font-size: 14px;
        color: #1e293b;
        line-height: 1.5;
        margin-bottom: 6px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .news-meta {
        display: flex;
        gap: 12px;
        font-size: 12px;
        color: #94a3b8;
        
        .news-source {
          color: #06b6d4;
          font-weight: 500;
        }
      }
    }
  }
}

// 空状态样式
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #94a3b8;
  
  .empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
    color: #cbd5e1;
  }
  
  p {
    margin: 0;
    font-size: 14px;
  }
}

.report-content {
  padding: 20px;
  font-size: 14px;
  line-height: 1.8;
  color: #334155;
  
  :deep(h1), :deep(h2), :deep(h3), :deep(h4) {
    color: #1e293b;
    margin-top: 24px;
    margin-bottom: 12px;
  }
  
  :deep(p) {
    margin-bottom: 12px;
  }
  
  :deep(ul), :deep(ol) {
    padding-left: 20px;
    margin-bottom: 12px;
  }
  
  :deep(li) {
    margin-bottom: 6px;
  }
  
  :deep(strong) {
    color: #1e293b;
  }
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

// 移动端适配
@media (max-width: 768px) {
  .hero-section {
    padding: 40px 16px 60px;
  }
  
  .hero-title {
    font-size: 32px;
  }
  
  .hero-subtitle {
    font-size: 16px;
  }
  
  .floating-card {
    display: none;
  }
  
  .analysis-wrapper {
    margin-top: -30px;
    padding: 0 16px;
  }
  
  .input-card {
    padding: 20px;
  }
  
  .input-group {
    .stock-input {
      :deep(.el-input__inner) {
        height: 48px;
        font-size: 16px;
      }
    }
    
    .analyze-btn {
      height: 40px;
      padding: 0 16px;
      font-size: 14px;
    }
  }
  
  .market-tabs {
    gap: 8px;
  }
  
  .market-tab {
    padding: 6px 12px;
    
    .market-name {
      font-size: 13px;
    }
  }
  
  .quick-config {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .advanced-row {
    flex-direction: column;
    gap: 16px;
  }

  .cost-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding: 10px 12px;

    .cost-left {
      font-size: 12px;
      flex-wrap: wrap;
      em { font-size: 14px; }
    }

    .cost-right {
      width: 100%;
      justify-content: space-between;
      .balance-text { font-size: 12px; }
    }
  }
  
  .results-card {
    padding: 20px;
  }
  
  .results-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .decision-main {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .decision-metrics {
    width: 100%;
    justify-content: space-between;
  }
  
  .metric {
    flex: 1;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 28px;
  }
  
  .input-group .analyze-btn span {
    display: none;
  }
  
  .decision-action .action-value {
    font-size: 24px;
  }
  
  .metric .metric-value {
    font-size: 16px;
  }
}
</style>
