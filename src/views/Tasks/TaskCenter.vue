<template>
  <div class="task-center">
    <!-- Hero Section -->
    <div class="hero-section">
      <!-- 背景装饰（参考 Login.vue）-->
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
          <el-icon><List /></el-icon>
          <span>任务管理中心</span>
        </div>
        <h1 class="hero-title">分析任务管理</h1>
        <p class="hero-subtitle">统一查看并管理所有分析任务，实时追踪进度</p>
      </div>
    </div>

    <div class="content-wrapper">
      <!-- 统计卡片 -->
      <div class="stats-section">
        <div class="stat-card total">
          <div class="stat-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">总任务</div>
          </div>
        </div>
        <div class="stat-card success">
          <div class="stat-icon">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.completed }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </div>
        <div class="stat-card warning">
          <div class="stat-icon">
            <el-icon><Loading /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.running }}</div>
            <div class="stat-label">进行中</div>
          </div>
        </div>
        <div class="stat-card danger">
          <div class="stat-icon">
            <el-icon><CircleClose /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.failed }}</div>
            <div class="stat-label">失败</div>
          </div>
        </div>
      </div>

      <!-- 筛选和标签页 -->
      <div class="filter-section">
        <div class="filter-tabs">
          <div
            v-for="tab in tabs"
            :key="tab.name"
            class="filter-tab"
            :class="{ active: activeTab === tab.name }"
            @click="activeTab = tab.name; onTabChange()"
          >
            <el-icon><component :is="tab.icon" /></el-icon>
            <span>{{ tab.label }}</span>
            <!-- <el-tag v-if="tab.count > 0" size="small" :type="tab.type" class="tab-badge">
              {{ tab.count }}
            </el-tag> -->
          </div>
        </div>

        <div class="filter-actions">
          <el-button type="primary" :loading="loading" @click="refreshList">
            <el-icon><Refresh /></el-icon>
            <span>刷新</span>
          </el-button>
          <el-button v-if="selectedRows.length > 0" @click="exportSelected">
            <el-icon><Download /></el-icon>
            <span>导出 ({{ selectedRows.length }})</span>
          </el-button>
        </div>
      </div>

      <!-- 高级筛选 -->
      <div class="advanced-filter">
        <el-collapse-transition>
          <div v-show="showAdvancedFilter" class="filter-form">
            <el-form :inline="true" @submit.prevent>
              <el-form-item label="时间范围">
                <el-date-picker
                  v-model="filters.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 260px"
                />
              </el-form-item>
              <el-form-item label="市场">
                <el-select v-model="filters.market" clearable placeholder="全部" style="width: 120px">
                  <el-option label="全部" value="" />
                  <el-option label="美股" value="美股" />
                  <el-option label="A股" value="A股" />
                  <el-option label="港股" value="港股" />
                </el-select>
              </el-form-item>
              <el-form-item label="股票">
                <el-input v-model="filters.stock" placeholder="代码或名称" style="width: 160px" clearable />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="applyFilters" :loading="loading">
                  <el-icon><Search /></el-icon>
                  查询
                </el-button>
                <el-button @click="resetFilters">
                  <el-icon><RefreshRight /></el-icon>
                  重置
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-transition>
        <div class="filter-toggle" @click="showAdvancedFilter = !showAdvancedFilter">
          <el-icon><component :is="showAdvancedFilter ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
          <span>{{ showAdvancedFilter ? '收起筛选' : '高级筛选' }}</span>
        </div>
      </div>

      <!-- 任务列表 -->
      <div class="list-section">
        <div class="list-header">
          <div class="header-left">
            <el-input
              v-model="keyword"
              placeholder="搜索股票代码/名称/任务ID"
              clearable
              style="width: 280px"
              class="search-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <div class="header-right">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50]"
              :total="total"
              layout="sizes, prev, pager, next"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>

        <!-- 桌面端表格 -->
        <div class="desktop-table">
          <el-table
            :data="filteredList"
            v-loading="loading"
            style="width: 100%"
            @selection-change="onSelectionChange"
            row-key="task_id"
          >
            <el-table-column type="selection" width="50" reserve-selection />
            <el-table-column prop="task_id" label="任务ID" width="150">
              <template #default="{ row }">
                <div class="task-id">
                  <el-icon class="task-icon"><Document /></el-icon>
                  <el-tooltip :content="row.task_id" placement="top">
                    <span class="id-text">{{ truncateId(row.task_id) }}</span>
                  </el-tooltip>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="stock_code" label="股票" width="90">
              <template #default="{ row }">
                <div class="stock-info">
                  <div class="stock-code clickable" @click.stop="openStockPage(row.stock_code || row.stock_symbol)">{{ row.stock_code || row.stock_symbol }}</div>
                  <div v-if="row.stock_name" class="stock-name">{{ row.stock_name }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <div class="status-cell">
                  <el-tag :type="getStatusType(row.status)" effect="light" class="status-tag">
                    <el-icon v-if="row.status === 'processing' || row.status === 'running'" class="rotating">
                      <Loading />
                    </el-icon>
                    {{ getStatusText(row.status) }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="进度" width="200">
              <template #default="{ row }">
                <div class="progress-cell">
                  <el-progress
                    :percentage="row.progress || 0"
                    :status="row.status==='failed'?'exception':(row.status==='completed'?'success':undefined)"
                    :stroke-width="6"
                    class="progress-bar"
                  />
                  <span class="progress-text">{{ row.progress || 0 }}%</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="start_time" label="开始时间" >
              <template #default="{ row }">
                <div class="time-cell">
                  <el-icon><Clock /></el-icon>
                  <span>{{ formatTime(row.start_time || row.created_at) }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="240" fixed="right">
              <template #default="{ row }">
                <div class="action-cell">
                  <el-button
                    v-if="row.status==='completed'"
                    type="primary"
                    size="small"
                    text
                    style="margin: 0; padding: 0;"
                    @click="openResult(row)"
                  >
                    <el-icon><View /></el-icon>
                    查看
                  </el-button>
                  <el-button
                    v-if="row.status==='completed'"
                    type="primary"
                    size="small"
                    text
                    style="margin: 0; padding: 0;"
                    @click="openReport(row)"
                  >
                    <el-icon><Document /></el-icon>
                    报告
                  </el-button>
                  <el-button
                    v-if="row.status==='completed'"
                    type="success"
                    size="small"
                    text
                    style="margin: 0; padding: 0;"
                    @click="goToChat(row)"
                  >
                    <el-icon><ChatDotRound /></el-icon>
                    对话
                  </el-button>
                  <el-button
                    v-if="row.status==='failed'"
                    type="danger"
                    size="small"
                    text
                    style="margin: 0; padding: 0;"
                    @click="showErrorDetail(row)"
                  >
                    <el-icon><Warning /></el-icon>
                    错误
                  </el-button>
                  <el-button
                    v-if="row.status==='failed'"
                    type="primary"
                    size="small"
                    text
                    style="margin: 0; padding: 0;"
                    @click="retryTask(row)"
                  >
                    <el-icon><Refresh /></el-icon>
                    重试
                  </el-button>
                  <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, row)">
                    <el-button size="small" text>
                      <el-icon><More /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="delete" :icon="Delete" class="danger-item">
                          删除任务
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 移动端卡片列表 -->
        <div class="mobile-list">
          <div
            v-for="row in filteredList"
            :key="row.task_id"
            class="task-card"
            :class="getStatusClass(row.status)"
          >
            <div class="card-header">
              <div class="stock-info">
                <div class="stock-code clickable" @click.stop="openStockPage(row.stock_code || row.stock_symbol)">{{ row.stock_code || row.stock_symbol }}</div>
                <div v-if="row.stock_name" class="stock-name">{{ row.stock_name }}</div>
              </div>
              <el-tag :type="getStatusType(row.status)" size="small" effect="light">
                {{ getStatusText(row.status) }}
              </el-tag>
            </div>
            <div class="card-body">
              <div class="progress-row">
                <el-progress
                  :percentage="row.progress || 0"
                  :status="row.status==='failed'?'exception':(row.status==='completed'?'success':undefined)"
                  :stroke-width="8"
                />
                <span class="progress-value">{{ row.progress || 0 }}%</span>
              </div>
              <div class="meta-row">
                <span class="meta-item">
                  <el-icon><Clock /></el-icon>
                  {{ formatTime(row.start_time || row.created_at) }}
                </span>
              </div>
            </div>
            <div class="card-footer">
              <el-button
                v-if="row.status==='completed'"
                type="primary"
                size="small"
                
                @click="openResult(row)"
              >
                查看结果
              </el-button>
              <el-button
                v-if="row.status==='completed'"
                type="primary"
                size="small"
                plain
                @click="openReport(row)"
              >
                报告
              </el-button>
              <el-button
                v-if="row.status==='completed'"
                type="success"
                size="small"
                plain
                @click="goToChat(row)"
              >
                对话
              </el-button>
              <el-button
                v-if="row.status==='failed'"
                type="danger"
                size="small"
                @click="showErrorDetail(row)"
              >
                查看错误
              </el-button>
              <el-button
                v-if="row.status==='failed'"
                type="primary"
                size="small"
                @click="retryTask(row)"
              >
                重试
              </el-button>
              <el-button size="small" text @click="deleteTask(row)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredList.length === 0 && !loading" class="empty-state">
          <el-icon class="empty-icon"><Document /></el-icon>
          <h3>暂无任务</h3>
          <p>当前条件下没有找到任何分析任务</p>
          <el-button type="primary" @click="goToAnalysis">
            <el-icon><Plus /></el-icon>
            新建分析
          </el-button>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50]"
            :total="total"
            :layout="isMobile ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper'"
            :pager-count="isMobile ? 5 : 7"
            :small="isMobile"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 结果弹窗 -->
    <TaskResultDialog
      v-model="resultVisible"
      :result="currentResult"
      @close="resultVisible=false"
      @view-report="openReport(currentRow)"
    />

    <!-- 报告详情弹窗 -->
    <TaskReportDialog v-model="reportVisible" :sections="reportSections" @close="reportVisible=false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  List,
  Refresh,
  Download,
  Document,
  CircleCheck,
  CircleClose,
  Loading,
  Clock,
  Search,
  View,
  Warning,
  More,
  Delete,
  Plus,
  RefreshRight,
  ArrowUp,
  ArrowDown,
  ChatDotRound
} from '@element-plus/icons-vue'
import { analysisApi, type SingleAnalysisRequest } from '@/api/analysis'
import { marked } from 'marked'
import { convertAnalystNamesToIds } from '@/constants/analysts'
import TaskResultDialog from '@/components/Global/TaskResultDialog.vue'
import TaskReportDialog from '@/components/Global/TaskReportDialog.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

marked.setOptions({ breaks: true, gfm: true })

const router = useRouter()
const route = useRoute()

const activeTab = ref<'running'|'completed'|'failed'|'all'>('all')
const loading = ref(false)
const keyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const list = ref<any[]>([])
const selectedRows = ref<any[]>([])
const showAdvancedFilter = ref(false)

// 筛选
const filters = ref<{ dateRange: string[]; market: string; stock: string }>({
  dateRange: [],
  market: '',
  stock: ''
})

// 统计
const stats = ref({
  total: 0,
  completed: 0,
  running: 0,
  failed: 0
})

// 标签页配置
const tabs = computed(() => [
  { name: 'running', label: '进行中', icon: 'Loading', type: 'warning', count: stats.value.running },
  { name: 'completed', label: '已完成', icon: 'CircleCheck', type: 'success', count: stats.value.completed },
  { name: 'failed', label: '失败', icon: 'CircleClose', type: 'danger', count: stats.value.failed },
  { name: 'all', label: '全部', icon: 'Document', type: 'info', count: stats.value.total }
])

// WebSocket
let wsConnections: Map<string, WebSocket> = new Map()
let timer: any = null

const statusParam = computed(() => {
  if (activeTab.value === 'all') return undefined
  if (activeTab.value === 'running') return 'processing'
  return activeTab.value
})

const loadList = async () => {
  // loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      page_size: pageSize.value,
      status: statusParam.value,
      stock_code: filters.value.stock || undefined
    }
    if (filters.value.market) params.market_type = filters.value.market
    if (filters.value.dateRange && filters.value.dateRange.length === 2) {
      params.start_date = filters.value.dateRange[0]
      params.end_date = filters.value.dateRange[1]
    }

    const res = await analysisApi.getHistory(params)
    const body = (res as any)?.data?.data || (res as any)?.data || {}
    let tasks = body.tasks || body.analyses || []

    const noExtraFilters = !filters.value.market && !filters.value.stock && (!filters.value.dateRange || filters.value.dateRange.length === 0)
    if (tasks.length === 0 && noExtraFilters) {
      try {
        const res2 = await analysisApi.getTaskList({
          status: statusParam.value,
          limit: pageSize.value,
          offset: (currentPage.value - 1) * pageSize.value
        })
        const body2 = (res2 as any)?.data?.data || {}
        tasks = body2.tasks || []
        total.value = body2.total ?? tasks.length
      } catch {}
    } else {
      total.value = body.total ?? tasks.length
    }

    list.value = tasks

    // 更新统计
    const completed = tasks.filter((x: any) => x.status === 'completed').length
    const failed = tasks.filter((x: any) => x.status === 'failed').length
    const running = tasks.filter((x: any) => ['processing', 'running', 'pending'].includes(x.status)).length
    stats.value = { total: tasks.length, completed, running, failed }

    // WebSocket 连接
    tasks.forEach((task: any) => {
      if (task.status === 'processing' || task.status === 'running' || task.status === 'pending') {
        connectTaskWebSocket(task.task_id)
      }
    })
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const connectTaskWebSocket = (taskId: string) => {
  if (wsConnections.has(taskId)) return

  try {
    const token = localStorage.getItem('token') || ''
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const wsUrl = `${wsProtocol}//${host}/api/ws/task/${taskId}`

    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log(`✅ WebSocket 连接成功: ${taskId}`)
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        if (message.type === 'progress_update') {
          const taskIndex = list.value.findIndex(t => t.task_id === taskId)
          if (taskIndex >= 0) {
            list.value[taskIndex].progress = message.progress
            list.value[taskIndex].status = message.status
            list.value[taskIndex].message = message.message
          }
        }
      } catch (e) {
        console.error('WebSocket 消息解析失败:', e)
      }
    }

    ws.onerror = (error) => {
      console.error(`❌ WebSocket 错误: ${taskId}`, error)
    }

    ws.onclose = () => {
      wsConnections.delete(taskId)
    }

    wsConnections.set(taskId, ws)
  } catch (e) {
    console.error('WebSocket 连接失败:', e)
  }
}

const disconnectAllWebSockets = () => {
  wsConnections.forEach((ws) => {
    try {
      ws.close()
    } catch (e) {}
  })
  wsConnections.clear()
}

const setupPolling = () => {
  clearInterval(timer)
  if (activeTab.value === 'running') {
    timer = setInterval(() => loadList(), 5000)
  }
}

// 筛选操作
const applyFilters = () => { currentPage.value = 1; loadList() }
const resetFilters = () => {
  filters.value = { dateRange: [], market: '', stock: '' }
  currentPage.value = 1
  loadList()
}

// 分页
const handleSizeChange = (size: number) => { pageSize.value = size; currentPage.value = 1; loadList() }
const handleCurrentChange = (page: number) => { currentPage.value = page; loadList() }

const onTabChange = () => {
  nextTick(() => {
    currentPage.value = 1
    loadList()
    setupPolling()
  })
}

const refreshList = () => loadList()
const onSelectionChange = (rows: any[]) => { selectedRows.value = rows }

// 搜索过滤
const filteredList = computed(() => {
  let arr = list.value
  if (keyword.value) {
    const k = keyword.value.toLowerCase()
    arr = arr.filter((x: any) =>
      (x.stock_code || '').toLowerCase().includes(k) ||
      (x.stock_name || '').toLowerCase().includes(k) ||
      (x.task_id || '').toLowerCase().includes(k)
    )
  }
  return arr
})

// 结果与报告
const resultVisible = ref(false)
const reportVisible = ref(false)
const currentResult = ref<any>(null)
const currentRow = ref<any>(null)
const reportSections = ref<Array<{ key?: string; title: string; content: any }>>([])

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

const openResult = (row: any) => {
  const id = row?.task_id || row?.analysis_id || row?.id
  if (!id) return ElMessage.warning('未找到任务ID')
  router.push({
    name: 'AnalysisReport',
    params: { id },
    query: {
      symbol: row.stock_code || row.stock_symbol || '',
      name: row.stock_name || '',
      date: row.created_at ? row.created_at.slice(0, 10) : (row.start_time ? row.start_time.slice(0, 10) : '')
    }
  })
}

// const openResult1 = async (row: any) => {
//   currentRow.value = row
//   try {
//     const res = await analysisApi.getTaskResult(row.task_id)
//     const body = (res as any)?.data?.data || {}
//     currentResult.value = body
//     resultVisible.value = true
//   } catch (e: any) {
//     ElMessage.error('获取结果失败')
//   }
// }

const openReport = (row: any) => {
  const id = row?.task_id || row?.analysis_id || row?.id
  if (!id) return ElMessage.warning('未找到报告ID')
  router.push({ name: 'ReportDetail', params: { id } })
}

const goToChat = (row: any) => {
  const id = row.result_data?.analysis_id || row?.analysis_id || row?.id
  if (!id) return ElMessage.warning('未找到任务ID')
  router.push({ path: '/chat', query: { analysis_id: id, stock_name: row.stock_name || row.stock_code || '' } })
}

const retryTask = (row: any) => {
  const symbol = row.stock_code || row.stock_symbol || row.symbol
  if (!symbol) {
    ElMessage.warning('无法获取股票代码')
    return
  }
  router.push({
    path: '/analysis/single',
    query: { symbol }
  })
}

// const retryTask = async (row: any) => {
//   try {
//     const symbol = row.stock_code || row.stock_symbol || row.symbol
//     if (!symbol) {
//       ElMessage.error('无法获取股票代码，无法重试')
//       return
//     }

//     await ElMessageBox.confirm(
//       `确定要重试分析 "${row.stock_name || symbol}" 吗？`,
//       '确认重试',
//       {
//         confirmButtonText: '确定',
//         cancelButtonText: '取消',
//         type: 'info'
//       }
//     )

//     loading.value = true
//     await fetchAnalysisPrice()
    
//     const marketType = row.market_type || 'A股'
//     const request: SingleAnalysisRequest = {
//       symbol,
//       stock_code: symbol,
//       price: analysisPrice.value.price,
//       parameters: {
//         market_type: marketType,
//         analysis_date: new Date().toISOString().split('T')[0],
//         research_depth: '深度分析',
//         selected_analysts: convertAnalystNamesToIds(['市场分析师', '基本面分析师', '新闻分析师']),
//         include_sentiment: true,
//         include_risk: true,
//         language: 'zh-CN',
//         quick_analysis_model: 'deepseek-reasoner',
//         deep_analysis_model: 'deepseek-reasoner'
//       }
//     }

//     const retryRes = await analysisApi.startSingleAnalysis(request)

//     if ((retryRes as any)?.success || (retryRes as any)?.data?.task_id || (retryRes as any)?.task_id) {
//       const taskId = row.task_id || row.analysis_id || row.id
//       if (taskId) {
//         try {
//           await analysisApi.deleteTask(taskId)
//         } catch (deleteError) {
//           console.warn('删除原任务失败:', deleteError)
//         }
//       }
//       ElMessage.success('任务已重新提交')
//       activeTab.value = 'running'
//       // 刷新积分余额
//       await loadList()
//       authStore.forceRefreshBalance()
//       setupPolling()
//     } else {
//       ElMessage.error((retryRes as any)?.message || '重试失败')
//     }
//   } catch (e: any) {
//     if (e !== 'cancel' && e !== 'close') {
//       console.error('重试任务失败:', e)
//       ElMessage.error(e?.message || '重试失败')
//     }
//   } finally {
//     loading.value = false
//   }
// }

const showErrorDetail = async (row: any) => {
  try {
    const taskId = row.task_id || row.analysis_id || row.id
    if (!taskId) {
      ElMessage.error('任务ID不存在')
      return
    }
    const res = await analysisApi.getTaskStatus(taskId)
    const task = (res as any)?.data?.data || row
    const errorMessage = task.error_message || task.message || '未知错误'

    await ElMessageBox.alert(
      errorMessage.replace(/\n/g, '<br>'),
      '错误详情',
      {
        confirmButtonText: '确定',
        type: 'error',
        dangerouslyUseHTMLString: true,
        customStyle: { width: '600px' }
      }
    )
  } catch (e: any) {
    if (e !== 'cancel' && e !== 'close') {
      ElMessage.error(e?.message || '获取错误详情失败')
    }
  }
}

const deleteTask = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除任务 "${row.stock_name || row.stock_code}" 吗？此操作不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )

    const taskId = row.task_id || row.analysis_id || row.id
    if (!taskId) {
      ElMessage.error('任务ID不存在')
      return
    }

    loading.value = true
    await analysisApi.deleteTask(taskId)
    ElMessage.success('任务已删除')
    await loadList()
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error(e?.message || '删除失败')
    }
  } finally {
    loading.value = false
  }
}

const handleCommand = (cmd: string, row: any) => {
  if (cmd === 'delete') {
    deleteTask(row)
  }
}

const exportSelected = () => {
  try {
    const data = JSON.stringify(selectedRows.value, null, 2)
    const blob = new Blob([data], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tasks_selected_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch {
    ElMessage.error('导出失败')
  }
}

const goToAnalysis = () => {
  router.push('/analysis/single')
}

// 打开股票详情页
const openStockPage = (stockCode: string) => {
  if (!stockCode) return
  // 去掉后缀（如 .SH, .SZ, .BJ），只保留数字部分
  // const code = stockCode.replace(/\.(SH|SZ|BJ)$/i, '')
  // window.open(`/stocks/${code}`, '_blank')
  const code = stockCode.replace(/\.(SH|SZ|BJ)$/i, '')
  window.open(`https://stockpage.10jqka.com.cn/${code}`, '_blank')
}

// 工具函数
const truncateId = (id: string) => {
  if (!id) return ''
  if (id.length <= 12) return id
  return id.substring(0, 6) + '...' + id.substring(id.length - 6)
}

const getStatusType = (status: string): 'success' | 'info' | 'warning' | 'danger' => {
  const map: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
    pending: 'info',
    processing: 'warning',
    running: 'warning',
    completed: 'success',
    failed: 'danger',
    cancelled: 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '等待中',
    processing: '处理中',
    running: '处理中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消'
  }
  return map[status] || status
}

const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    completed: 'status-success',
    failed: 'status-failed',
    processing: 'status-running',
    running: 'status-running',
    pending: 'status-pending'
  }
  return map[status] || ''
}

import { useWindowSize } from '@vueuse/core'
import { formatDateTime } from '@/utils/datetime'

const { width: windowWidth } = useWindowSize()
const isMobile = computed(() => windowWidth.value <= 768)

const formatTime = (t: string) => t ? formatDateTime(t) : '-'

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

// 生命周期
onMounted(() => {
  const tab = String((route.query as any)?.tab || '').toLowerCase()
  const validTabs = ['running', 'completed', 'failed', 'all']
  if (validTabs.includes(tab)) {
    activeTab.value = tab as any
  }
  fetchAnalysisPrice()
  loadList()
  setupPolling()
  initParticles()
})

watch(() => (route.query as any)?.tab, (newVal) => {
  const tab = String(newVal || '').toLowerCase()
  const validTabs = ['running', 'completed', 'failed', 'all']
  if (validTabs.includes(tab)) {
    activeTab.value = tab as any
    currentPage.value = 1
    fetchAnalysisPrice()
    loadList()
    setupPolling()
  }
})

onUnmounted(() => {
  clearInterval(timer)
  disconnectAllWebSockets()
})
</script>

<style lang="scss" scoped>
// 动画
@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
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
  animation: rotating 2s linear infinite;
}

// 页面容器
.task-center {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f9ff 0%, #f8fafc 60%, #f1f5f9 100%);
  padding-bottom: 48px;
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

// 背景层
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
  padding: 0 24px;
  position: relative;
  z-index: 2;
}

// 统计卡片
.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;

    .el-icon {
      color: white;
    }
  }

  .stat-info {
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
      line-height: 1;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 14px;
      color: #64748b;
    }
  }

  &.total .stat-icon { background: linear-gradient(135deg, #059669 0%, #06b6d4 100%); }
  &.success .stat-icon { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
  &.warning .stat-icon { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
  &.danger .stat-icon { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
}

// 筛选区域
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
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #f1f5f9;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  font-size: 14px;
  color: #64748b;

  &:hover {
    background: #e2e8f0;
  }

  &.active {
    background: linear-gradient(135deg, #059669 0%, #06b6d4 100%);
    color: white;
    border-color: transparent;

    .tab-badge {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }
  }

  .el-icon {
    font-size: 16px;
  }

  .tab-badge {
    margin-left: 4px;
  }
}

.filter-actions {
  display: flex;
  gap: 8px;
}

// 高级筛选
.advanced-filter {
  background: white;
  border-radius: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.filter-form {
  padding: 20px 20px 0;
}

.filter-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-top: 1px solid #f1f5f9;

  &:hover {
    background: #f1f5f9;
    color: #06b6d4;
  }
}

// 列表区域
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
  flex-wrap: wrap;
  gap: 16px;
}

.search-input {
  :deep(.el-input__wrapper) {
    border-radius: 10px;
  }
}

// 表格样式
.desktop-table {
  :deep(.el-table) {
    border-radius: 12px;
    overflow: hidden;

    th {
      background: #f8fafc;
      font-weight: 600;
      color: #475569;
    }

    td {
      padding: 12px 0;
    }
  }
}

.task-id {
  display: flex;
  align-items: center;
  gap: 8px;

  .task-icon {
    color: #94a3b8;
  }

  .id-text {
    font-family: monospace;
    font-size: 13px;
    color: #64748b;
  }
}

.stock-info {
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

.status-cell {
  .status-tag {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.progress-cell {
  display: flex;
  align-items: center;
  gap: 12px;

  .progress-bar {
    flex: 1;
  }

  .progress-text {
    font-size: 12px;
    color: #64748b;
    min-width: 36px;
  }
}

.time-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 13px;

  .el-icon {
    color: #94a3b8;
  }
}

.action-cell {
  display: flex;
  gap: 10px;
}

// 移动端列表
.mobile-list {
  display: none;
}

.task-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border: 2px solid transparent;
  transition: all 0.3s ease;

  &:hover {
    background: #f1f5f9;
  }

  &.status-success {
    border-color: #10b981;
    background: linear-gradient(135deg, #ecfdf5 0%, #f8fafc 100%);
  }

  &.status-failed {
    border-color: #ef4444;
    background: linear-gradient(135deg, #fef2f2 0%, #f8fafc 100%);
  }

  &.status-running {
    border-color: #f59e0b;
    background: linear-gradient(135deg, #fffbeb 0%, #f8fafc 100%);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }

  .card-body {
    margin-bottom: 12px;

    .progress-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;

      :deep(.el-progress) {
        flex: 1;
      }

      .progress-value {
        font-size: 14px;
        font-weight: 600;
        color: #64748b;
        min-width: 40px;
      }
    }

    .meta-row {
      display: flex;
      gap: 16px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #94a3b8;
      }
    }
  }

  .card-footer {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}

// 空状态
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;

  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
    color: #cbd5e1;
  }

  h3 {
    font-size: 18px;
    color: #475569;
    margin: 0 0 8px 0;
  }

  p {
    margin: 0 0 20px 0;
    font-size: 14px;
  }
}

// 分页
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;

  :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 4px;
  }
}

// 下拉菜单危险项
:deep(.danger-item) {
  color: #ef4444;

  &:hover {
    background: #fef2f2;
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
  }

  .content-wrapper {
    margin-top: -28px;
    // padding: 0 16px;
  }

  .stats-section {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-card {
    padding: 16px;

    .stat-icon {
      width: 40px;
      height: 40px;
      font-size: 20px;
    }

    .stat-info {
      .stat-value {
        font-size: 22px;
      }

      .stat-label {
        font-size: 12px;
      }
    }
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;
    padding: 12px 16px;
  }

  .filter-tabs {
    justify-content: center;
  }

  .filter-tab {
    padding: 8px 12px;
    font-size: 13px;
  }

  .filter-actions {
    justify-content: center;
  }

  .pagination-wrapper {
    padding: 0;

    :deep(.el-pagination) {
      width: 100%;
      justify-content: center;
      flex-wrap: wrap;
      gap: 4px;

      .el-pagination__total,
      .el-pagination__sizes {
        display: none !important;
      }

      .el-pagination__jump {
        display: none !important;
      }

      button.btn-prev,
      button.btn-next {
        min-width: 32px;
        height: 32px;
        padding: 0 6px;
      }

      .el-pager li {
        min-width: 30px;
        height: 30px;
        line-height: 30px;
        font-size: 13px;
        margin: 0 1px;
      }
    }
  }

  .list-section {
    padding: 16px;
  }

  .list-header {
    flex-direction: column;
    align-items: stretch;

    .search-input {
      width: 100% !important;
    }

    .header-right {
      display: none;
    }
  }

  .desktop-table {
    display: none;
  }

  .mobile-list {
    display: block;
  }
}

@media (max-width: 480px) {
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }

  .filter-tabs {
    gap: 6px;
  }

  .filter-tab {
    padding: 6px 10px;
    font-size: 12px;

    .el-icon {
      font-size: 14px;
    }
  }
}
</style>
