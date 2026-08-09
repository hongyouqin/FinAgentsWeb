<template>
  <div class="overview-page">
    <!-- 顶部导航栏 -->
    <header class="page-header">
      <div class="header-inner">
        <div class="header-title">
          <el-icon class="header-icon"><Calendar /></el-icon>
          <div>
            <h1 style="color: white;">数据概览</h1>
            <p>预约披露日 · 排行榜</p>
          </div>
        </div>
        <div class="header-actions">
          <el-button type="primary" :icon="Search" @click="openDetailDialog">查询披露明细</el-button>
        </div>
      </div>
    </header>

    <div class="content-wrapper">
      <!-- 统计概览 -->
      <!-- <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-value">{{ total }}</span>
          <span class="stat-label">预约披露</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ upcomingCount }}</span>
          <span class="stat-label">即将披露</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ todayCount }}</span>
          <span class="stat-label">今日披露</span>
        </div>
      </div> -->

      <!-- 板块轮动 -->
      <div class="sector-section">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon><Grid /></el-icon>
            板块轮动
          </h2>
          <span class="section-subtitle">点击板块查看成分股</span>
        </div>

        <div v-loading="sectorLoading" class="sector-panel">
          <div v-if="sectorList.length === 0" class="sector-empty">
            <el-icon><Grid /></el-icon>
            <span>暂无板块动能数据</span>
          </div>

          <template v-else>
            <!-- 板块卡片列表 -->
            <div class="sector-grid">
              <div
                v-for="item in visibleSectorList"
                :key="item.industry"
                class="sector-card"
                :class="{ active: activeIndustry === item.industry }"
                @click="selectIndustry(item.industry)"
              >
                <div class="sector-card-top">
                  <span class="sector-rank" :class="{ top: item.rank <= 3 }">{{ item.rank }}</span>
                  <span class="sector-name">{{ item.industry }}</span>
                  <span class="sector-signal" :class="signalClass(item.signal)">{{ item.signal }}</span>
                </div>
                <div class="sector-card-mid">
                  <div class="sector-metric">
                    <span class="metric-label">动能评分</span>
                    <span class="metric-value score">{{ formatScore(item.composite_score) }}</span>
                  </div>
                  <div class="sector-metric">
                    <span class="metric-label">主力净买入</span>
                    <span
                      class="metric-value"
                      :class="{ up: item.total_main_force_net > 0, down: item.total_main_force_net < 0 }"
                    >
                      {{ formatMoneyWan(item.total_main_force_net) }}
                    </span>
                  </div>
                  <div class="sector-metric">
                    <span class="metric-label">成分股</span>
                    <span class="metric-value">{{ item.stock_count }}只</span>
                  </div>
                </div>
                <div class="sector-card-detail">{{ item.signal_detail }}</div>
              </div>
            </div>

            <div v-if="sectorList.length > sectorPreviewCount" class="sector-toggle">
              <el-button link type="primary" @click="sectorExpanded = !sectorExpanded">
                {{ sectorExpanded ? '收起' : `展开全部 ${sectorList.length} 个板块` }}
                <el-icon>
                  <ArrowUp v-if="sectorExpanded" />
                  <ArrowDown v-else />
                </el-icon>
              </el-button>
            </div>

            <!-- 选中板块的成分股 -->
            <div v-if="activeIndustry" class="sector-stock-block">
              <div class="sector-stock-header">
                <span class="stock-header-title">{{ activeIndustry }}</span>
                <span class="stock-header-count">共 {{ sectorStockTotal }} 只</span>
              </div>

              <div v-loading="sectorStockLoading" class="sector-stock-body">
                <div v-if="sectorStockList.length === 0 && !sectorStockLoading" class="sector-empty small">
                  <span>该板块暂无成分股数据</span>
                </div>
                <div v-else class="sector-stock-grid">
                  <div
                    v-for="stock in sectorStockList"
                    :key="stock.symbol"
                    class="sector-stock-card"
                  >
                    <div class="sector-stock-info">
                      <span class="sector-stock-name">{{ stock.name }}</span>
                      <span class="sector-stock-code">{{ normalizeSymbol(stock.symbol) }}</span>
                    </div>
                    <el-button
                      type="primary"
                      size="small"
                      class="sector-analyze-btn"
                      @click="goToAnalysis(stock.symbol)"
                    >
                      分析
                    </el-button>
                  </div>
                </div>
              </div>

              <div v-if="sectorStockTotal > sectorStockPageSize" class="sector-stock-pagination">
                <el-pagination
                  v-model:current-page="sectorStockPage"
                  :page-size="sectorStockPageSize"
                  :total="sectorStockTotal"
                  layout="prev, pager, next"
                  background
                  small
                  @current-change="fetchSectorStocks"
                />
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- 财报日历 -->
      <div v-loading="loading" class="calendar-section">
        <div class="section-header">
          <h2 class="section-title">财报日历</h2>
          <span class="section-subtitle">点击日期查看当天预约披露</span>
        </div>

        <div v-if="groupedList.length === 0" class="empty-state">
          <el-icon><Calendar /></el-icon>
          <span>暂无预约披露数据</span>
        </div>

        <div v-else class="calendar-panel">
          <!-- 横向日期导航 -->
          <div class="calendar-date-bar">
            <button
              v-for="group in groupedList"
              :key="group.date"
              class="date-pill"
              :class="{ active: activeDate === group.date }"
              @click="activeDate = group.date"
            >
              <span class="pill-day">{{ group.day }}</span>
              <span class="pill-week">{{ group.week }}</span>
              <span class="pill-count">{{ group.items.length }}家</span>
            </button>
          </div>

          <!-- 选中日期股票列表 -->
          <div class="calendar-stock-list">
            <div
              v-for="item in activeGroup?.items || []"
              :key="item.stock_code"
              class="calendar-stock-card"
            >
              <div class="stock-main">
                <div class="stock-code-block">{{ item.stock_code }}</div>
                <div class="stock-name-row">
                  <span class="stock-name">{{ item.stock_name }}</span>
                  <span class="stock-tag">财报截止 {{ formatDate(item.data_date) }}</span>
                </div>
              </div>
              <div class="stock-meta">
                <div class="meta-item">
                  <span class="meta-label">首次预约</span>
                  <span class="meta-value">{{ formatDateTime(item.first_schedule) }}</span>
                </div>
                <div class="meta-divider"></div>
                <div class="meta-item">
                  <span class="meta-label">最新预约</span>
                  <span class="meta-value highlight">{{ formatDateTime(item.latest_date) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="calendar-footer">
            <el-button link type="primary" @click="openDetailDialog">
              查看更多 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- 股票热度排行 -->
      <div class="hot-section">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon><TrendCharts /></el-icon>
            热股榜
          </h2>
          <span class="section-subtitle">雪球关注度排行</span>
        </div>
        <div v-loading="hotLoading" class="hot-card">
          <el-radio-group v-model="hotCategory" size="default" class="hot-tabs" @change="onHotCategoryChange">
            <el-radio-button label="最热门">最热门</el-radio-button>
            <el-radio-button label="本周新增">本周新增</el-radio-button>
          </el-radio-group>
          <div v-if="currentHotList.length === 0" class="empty-state">
            <el-icon><TrendCharts /></el-icon>
            <span>暂无热度数据</span>
          </div>
          <div v-else class="hot-grid">
            <div
              v-for="(item, idx) in currentHotList"
              :key="item.stock_code"
              class="hot-item"
            >
              <span class="hot-rank" :class="{ top: idx < 3 }">{{ item.rank }}</span>
              <div class="hot-stock">
                <span class="hot-name">{{ item.stock_name }}</span>
                <span class="hot-code">{{ item.stock_code }}</span>
              </div>
              <div class="hot-info">
                <span class="hot-price">{{ formatPrice(item.current_price) }}</span>
                <span class="hot-followers">{{ formatFollowers(item.followers) }}关注</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 雪球交易排行 -->
      <div class="deal-section">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon><TrendCharts /></el-icon>
            雪球交易排行
          </h2>
          <span class="section-subtitle">交易关注度排行</span>
        </div>
        <div v-loading="dealLoading" class="deal-card">
          <div v-if="dealList.length === 0" class="empty-state">
            <el-icon><TrendCharts /></el-icon>
            <span>暂无交易排行数据</span>
          </div>
          <div v-else class="deal-grid">
            <div
              v-for="(item, idx) in dealList"
              :key="item.stock_code"
              class="deal-item"
            >
              <span class="deal-rank" :class="{ top: idx < 3 }">{{ item.rank }}</span>
              <div class="deal-stock">
                <span class="deal-name">{{ item.stock_name }}</span>
                <span class="deal-code">{{ item.stock_code }}</span>
              </div>
              <div class="deal-info">
                <span class="deal-price">{{ formatPrice(item.current_price) }}</span>
                <span class="deal-attention">{{ formatDealAttention(item.deal_attention) }}人关注</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 东方财富人气榜 -->
      <!-- <div class="rank-section">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon><TrendCharts /></el-icon>
            东方财富人气榜
          </h2>
          <span class="section-subtitle">实时人气排行</span>
        </div>
        <div v-loading="rankLoading" class="rank-card">
          <div v-if="rankList.length === 0" class="empty-state">
            <el-icon><TrendCharts /></el-icon>
            <span>暂无人气榜数据</span>
          </div>
          <div v-else class="rank-grid">
            <div
              v-for="(item, idx) in rankList"
              :key="item.stock_code"
              class="rank-item"
            >
              <span class="rank-rank" :class="{ top: idx < 3 }">{{ item.rank }}</span>
              <div class="rank-stock">
                <span class="rank-name">{{ item.stock_name }}</span>
                <span class="rank-code">{{ item.stock_code }}</span>
              </div>
              <div class="rank-info">
                <span class="rank-price">{{ formatPrice(item.current_price) }}</span>
                <span class="rank-change" :class="{ up: item.change_percent > 0, down: item.change_percent < 0 }">
                  {{ formatChangePercent(item.change_percent) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div> -->

      <!-- 东方财富人气榜 -->
      <div class="rank-section">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon><TrendCharts /></el-icon>
            东方财富人气榜
          </h2>
          <span class="section-subtitle">实时人气排行</span>
        </div>
        <div v-loading="rankLoading" class="rank-card">
          <div v-if="rankList.length === 0" class="empty-state">
            <el-icon><TrendCharts /></el-icon>
            <span>暂无人气榜数据</span>
          </div>
          <div v-else class="rank-grid">
            <div
              v-for="(item, idx) in rankList"
              :key="item.stock_code"
              class="rank-item"
            >
              <span class="rank-rank" :class="{ top: idx < 3 }">{{ item.rank }}</span>
              <div class="rank-stock">
                <span class="rank-name">{{ item.stock_name }}</span>
                <span class="rank-code">{{ item.stock_code }}</span>
              </div>
              <div class="rank-info">
                <span class="rank-price">{{ formatPrice(item.current_price) }}</span>
                <span class="rank-change" :class="{ up: item.change_percent > 0, down: item.change_percent < 0 }">
                  {{ formatChangePercent(item.change_percent) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 披露明细弹框 -->
      <el-dialog
        v-model="detailDialogVisible"
        title="披露明细查询"
        width="900px"
        destroy-on-close
        class="detail-dialog"
      >
        <div class="dialog-toolbar">
          <el-input
            v-model="dialogSearchCode"
            placeholder="输入股票代码"
            clearable
            size="default"
            class="search-input"
            @keyup.enter="handleDialogSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" :icon="Search" @click="handleDialogSearch">查询</el-button>
          <el-button :icon="Refresh" @click="resetDialogSearch">重置</el-button>
        </div>

        <div v-loading="dialogLoading" class="dialog-table">
          <el-table :data="dialogList" stripe style="width: 100%">
            <el-table-column prop="stock_code" label="股票代码" width="110">
              <template #default="{ row }">
                <span class="table-code">{{ row.stock_code }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="stock_name" label="股票名称" width="120" />
            <el-table-column label="财报截止日期" width="130">
              <template #default="{ row }">
                {{ formatDate(row.data_date) }}
              </template>
            </el-table-column>
            <el-table-column label="首次预约披露日" width="140">
              <template #default="{ row }">
                {{ formatDateTime(row.first_schedule) }}
              </template>
            </el-table-column>
            <el-table-column label="最新预约披露日" min-width="140">
              <template #default="{ row }">
                <span class="table-highlight">{{ formatDateTime(row.latest_date) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="dialog-pagination">
          <el-pagination
            v-model:current-page="dialogPage"
            v-model:page-size="dialogPageSize"
            :total="dialogTotal"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            @size-change="handleDialogSizeChange"
            @current-change="handleDialogCurrentChange"
          />
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Calendar, Search, Refresh, TrendCharts, ArrowRight, Grid, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { getDisclosureCalendarList, getDisclosureByStock } from '@/api/disclosureCalendar'
import { getStockHotByCategory, getStockHotDeal, getStockHotRank } from '@/api/stockHot'
import { getSectorMomentumRanking, getSectorStocks } from '@/api/sectorRotation'
import type { DisclosureCalendarItem } from '@/api/disclosureCalendar'
import type { StockHotItem, StockHotDealItem, StockHotRankItem } from '@/api/stockHot'
import type { SectorMomentumItem, SectorStockItem } from '@/api/sectorRotation'

defineOptions({ name: 'Overview' })

const router = useRouter()

const loading = ref(false)
const list = ref<DisclosureCalendarItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const searchCode = ref('')

// 披露明细弹框
const detailDialogVisible = ref(false)
const dialogLoading = ref(false)
const dialogList = ref<DisclosureCalendarItem[]>([])
const dialogTotal = ref(0)
const dialogPage = ref(1)
const dialogPageSize = ref(20)
const dialogSearchCode = ref('')

// 股票热度
const hotLoading = ref(false)
const hotCategory = ref<'最热门' | '本周新增'>('最热门')
const hotCategories = ref<Record<string, StockHotItem[]>>({})
const currentHotList = computed(() => hotCategories.value[hotCategory.value] || [])

// 雪球交易排行
const dealLoading = ref(false)
const dealList = ref<StockHotDealItem[]>([])

// 东方财富人气榜
const rankLoading = ref(false)
const rankList = ref<StockHotRankItem[]>([])

// 板块轮动
const sectorLoading = ref(false)
const sectorList = ref<SectorMomentumItem[]>([])
const sectorExpanded = ref(false)
const sectorPreviewCount = 6
const visibleSectorList = computed(() =>
  sectorExpanded.value ? sectorList.value : sectorList.value.slice(0, sectorPreviewCount)
)

// 板块成分股
const activeIndustry = ref('')
const sectorStockLoading = ref(false)
const sectorStockList = ref<SectorStockItem[]>([])
const sectorStockTotal = ref(0)
const sectorStockPage = ref(1)
const sectorStockPageSize = ref(20)

function formatDate(val: string) {
  if (!val || val.length !== 8) return val || '-'
  return `${val.slice(0, 4)}-${val.slice(4, 6)}-${val.slice(6, 8)}`
}

function formatDateTime(val: string) {
  if (!val) return '-'
  const d = new Date(val)
  if (isNaN(d.getTime())) return val
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function parseScheduleDate(val: string): Date | null {
  if (!val) return null
  const d = new Date(val)
  return isNaN(d.getTime()) ? null : d
}

const groupedList = computed(() => {
  const map = new Map<string, DisclosureCalendarItem[]>()
  list.value.forEach((item: DisclosureCalendarItem) => {
    const d = parseScheduleDate(item.latest_date || item.first_schedule)
    if (!d) return
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(item)
  })
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, items]) => {
      const d = new Date(date)
      return {
        date,
        day: String(d.getDate()).padStart(2, '0'),
        week: weekDays[d.getDay()],
        yearMonth: `${d.getFullYear()}年${d.getMonth() + 1}月`,
        items: items.sort((a, b) => a.stock_code.localeCompare(b.stock_code))
      }
    })
})

const upcomingCount = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return list.value.filter((item: DisclosureCalendarItem) => {
    const d = parseScheduleDate(item.latest_date || item.first_schedule)
    return d && d.getTime() >= today.getTime()
  }).length
})

const todayCount = computed(() => {
  const today = new Date()
  const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  return groupedList.value.find((g: any) => g.date === key)?.items.length || 0
})

const activeDate = ref<string>('')
const activeGroup = computed(() => {
  return groupedList.value.find((g: any) => g.date === activeDate.value) || null
})

async function fetchList() {
  loading.value = true
  try {
    const res = await getDisclosureCalendarList({
      page: page.value,
      page_size: pageSize.value
    })
    if (res.success && res.data) {
      list.value = res.data.data || res.data || []
      total.value = res.data.total || 0
    }
  } catch (e) {
    console.error('获取预约披露日失败:', e)
  } finally {
    loading.value = false
  }
}

async function fetchDialogList() {
  dialogLoading.value = true
  try {
    const code = dialogSearchCode.value.trim()
    if (code) {
      const res = await getDisclosureByStock(code)
      if (res.success && res.data) {
        dialogList.value = [res.data]
        dialogTotal.value = 1
      } else {
        dialogList.value = []
        dialogTotal.value = 0
      }
    } else {
      const res = await getDisclosureCalendarList({
        page: dialogPage.value,
        page_size: dialogPageSize.value
      })
      if (res.success && res.data) {
        dialogList.value = res.data.data || res.data || []
        dialogTotal.value = res.data.total || 0
      }
    }
  } catch (e) {
    console.error('获取披露明细失败:', e)
  } finally {
    dialogLoading.value = false
  }
}

function openDetailDialog() {
  detailDialogVisible.value = true
  dialogPage.value = 1
  dialogPageSize.value = 20
  dialogSearchCode.value = searchCode.value
  fetchDialogList()
}

async function handleDialogSearch() {
  dialogPage.value = 1
  await fetchDialogList()
}

function resetDialogSearch() {
  dialogSearchCode.value = ''
  dialogPage.value = 1
  fetchDialogList()
}

function handleDialogSizeChange(val: number) {
  dialogPageSize.value = val
  dialogPage.value = 1
  fetchDialogList()
}

function handleDialogCurrentChange(val: number) {
  dialogPage.value = val
  fetchDialogList()
}

async function handleSearch() {
  const code = searchCode.value.trim()
  if (!code) {
    fetchList()
    return
  }
  loading.value = true
  try {
    const res = await getDisclosureByStock(code)
    if (res.success && res.data) {
      list.value = [res.data]
      total.value = 1
      page.value = 1
    }
  } catch (e) {
    console.error('查询股票预约披露日失败:', e)
  } finally {
    loading.value = false
  }
}

function resetSearch() {
  searchCode.value = ''
  page.value = 1
  fetchList()
}

function handleSizeChange(val: number) {
  pageSize.value = val
  page.value = 1
  fetchList()
}

function handleCurrentChange(val: number) {
  page.value = val
  fetchList()
}

async function fetchStockHot() {
  hotLoading.value = true
  try {
    const [hotRes, newRes] = await Promise.all([
      getStockHotByCategory('最热门', 10),
      getStockHotByCategory('本周新增', 10)
    ])
    if (hotRes.success && hotRes.data) {
      hotCategories.value['最热门'] = Array.isArray(hotRes.data) ? hotRes.data : (hotRes.data.data || [])
    }
    if (newRes.success && newRes.data) {
      hotCategories.value['本周新增'] = Array.isArray(newRes.data) ? newRes.data : (newRes.data.data || [])
    }
  } catch (e) {
    console.error('获取股票热度失败:', e)
  } finally {
    hotLoading.value = false
  }
}

function onHotCategoryChange(val: string | number | boolean | undefined) {
  if (val === '最热门' || val === '本周新增') {
    hotCategory.value = val
  }
}

function formatPrice(val: number) {
  if (val == null) return '-'
  return `¥${val.toFixed(2)}`
}

function formatFollowers(val: number) {
  if (val == null) return '-'
  if (val >= 10000) {
    return `${(val / 10000).toFixed(1)}万`
  }
  return val.toString()
}

function formatDealAttention(val: number) {
  if (val == null) return '-'
  if (val >= 10000) {
    return `${(val / 10000).toFixed(1)}万`
  }
  return val.toString()
}

async function fetchStockHotDeal() {
  dealLoading.value = true
  try {
    const res = await getStockHotDeal(10)
    if (res.success && res.data) {
      dealList.value = Array.isArray(res.data) ? res.data : (res.data.data || [])
    }
  } catch (e) {
    console.error('获取雪球交易排行失败:', e)
  } finally {
    dealLoading.value = false
  }
}

function formatChangePercent(val: number) {
  if (val == null) return '-'
  const sign = val > 0 ? '+' : ''
  return `${sign}${val.toFixed(2)}%`
}

function formatScore(val: number) {
  if (val == null) return '-'
  return val.toFixed(1)
}

/** 接口返回的资金金额单位为万元 */
function formatMoneyWan(val: number) {
  if (val == null) return '-'
  const sign = val > 0 ? '+' : val < 0 ? '-' : ''
  const abs = Math.abs(val)
  if (abs >= 10000) return `${sign}${(abs / 10000).toFixed(2)}亿`
  return `${sign}${abs.toFixed(0)}万`
}

function signalClass(signal: string) {
  const map: Record<string, string> = {
    '真上涨': 'signal-strong',
    '低位启动': 'signal-start',
    '假上涨': 'signal-fake',
    '高位出货': 'signal-exit',
    '观望': 'signal-wait',
    '中性': 'signal-neutral'
  }
  return map[signal] || 'signal-neutral'
}

/** 兼容 "000001.SZ" 与 "000001" 两种代码形式 */
function normalizeSymbol(symbol: string) {
  if (!symbol) return '-'
  return symbol.split('.')[0]
}

async function fetchSectorRanking() {
  sectorLoading.value = true
  try {
    const res = await getSectorMomentumRanking({ top_n: 30, days: 10 })
    if (res.success && res.data) {
      const ranking = res.data.ranking || (Array.isArray(res.data) ? res.data : [])
      sectorList.value = ranking
    }
  } catch (e) {
    console.error('获取板块动能排行失败:', e)
  } finally {
    sectorLoading.value = false
  }
}

async function fetchSectorStocks() {
  if (!activeIndustry.value) return
  sectorStockLoading.value = true
  try {
    const res = await getSectorStocks({
      industry: activeIndustry.value,
      page: sectorStockPage.value,
      page_size: sectorStockPageSize.value
    })
    const body = res.success && res.data ? res.data : res
    sectorStockList.value = body?.items || []
    sectorStockTotal.value = body?.total || 0
  } catch (e) {
    console.error('获取板块成分股失败:', e)
    sectorStockList.value = []
    sectorStockTotal.value = 0
  } finally {
    sectorStockLoading.value = false
  }
}

function selectIndustry(industry: string) {
  // 重复点击当前板块则收起成分股
  if (activeIndustry.value === industry) {
    activeIndustry.value = ''
    sectorStockList.value = []
    sectorStockTotal.value = 0
    return
  }
  activeIndustry.value = industry
  sectorStockPage.value = 1
  fetchSectorStocks()
}

function goToAnalysis(symbol: string) {
  router.push({
    path: '/analysis/single',
    query: { symbol: normalizeSymbol(symbol) }
  })
}

async function fetchStockHotRank() {
  rankLoading.value = true
  try {
    const res = await getStockHotRank(10)
    if (res.success && res.data) {
      rankList.value = Array.isArray(res.data) ? res.data : (res.data.data || [])
    }
  } catch (e) {
    console.error('获取东方财富人气榜失败:', e)
  } finally {
    rankLoading.value = false
  }
}

onMounted(() => {
  fetchList().then(() => {
    if (groupedList.value.length > 0) {
      activeDate.value = groupedList.value[0].date
    }
  })
  fetchStockHot()
  fetchStockHotDeal()
  fetchStockHotRank()
  fetchSectorRanking()
})
</script>

<style scoped lang="scss">
.overview-page {
  min-height: 100%;
  background: #f8fafc;
}

.page-header {
  background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);
  border-bottom: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px);
    background-size: 40px 40px;
  }
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

.header-title {
  display: flex;
  align-items: center;
  gap: 14px;
  color: #fff;

  .header-icon {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
  }

  h1 {
    font-size: 22px;
    font-weight: 700;
    margin: 0 0 2px;
  }

  p {
    font-size: 13px;
    color: #94a3b8;
    margin: 0;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input {
  width: 220px;

  :deep(.el-input__wrapper) {
    border-radius: 8px;
  }
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
}

.stats-bar {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
}

.stat-item {
  background: #fff;
  border-radius: 12px;
  padding: 18px 20px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 4px;

  .stat-value {
    font-size: 26px;
    font-weight: 700;
    color: #1e293b;
  }

  .stat-label {
    font-size: 13px;
    color: #64748b;
  }

  &:first-child .stat-value {
    color: #3b82f6;
  }

  &:nth-child(2) .stat-value {
    color: #f59e0b;
  }

  &:nth-child(3) .stat-value {
    color: #10b981;
  }
}

.calendar-section,
.hot-section,
.deal-section,
.rank-section,
.sector-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 16px;

  .section-title {
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }

  .section-subtitle {
    font-size: 13px;
    color: #94a3b8;
  }
}

.empty-state {
  background: #fff;
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
  color: #94a3b8;
  border: 1px solid #e2e8f0;

  .el-icon {
    font-size: 40px;
    margin-bottom: 12px;
    display: block;
  }
}

.calendar-panel {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

// ─── 板块轮动 ──────────────────────────────
.sector-panel {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 16px;

  @media (max-width: 768px) {
    padding: 12px;
  }
}

.sector-empty {
  padding: 48px 20px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;

  .el-icon {
    font-size: 36px;
    margin-bottom: 10px;
    display: block;
  }

  &.small {
    padding: 28px 20px;
  }
}

.sector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}

.sector-card {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 14px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;

  &:hover {
    border-color: #93c5fd;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08);
  }

  &.active {
    border-color: #3b82f6;
    background: #f5faff;
    box-shadow: 0 2px 10px rgba(59, 130, 246, 0.14);
  }
}

.sector-card-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.sector-rank {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  line-height: 22px;
  text-align: center;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  background: #f1f5f9;

  &.top {
    color: #fff;
    background: linear-gradient(135deg, #f59e0b, #ef4444);
  }
}

.sector-name {
  flex: 1;
  min-width: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sector-signal {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 6px;

  &.signal-strong {
    color: #dc2626;
    background: #fef2f2;
  }

  &.signal-start {
    color: #d97706;
    background: #fffbeb;
  }

  &.signal-fake {
    color: #7c3aed;
    background: #f5f3ff;
  }

  &.signal-exit {
    color: #059669;
    background: #ecfdf5;
  }

  &.signal-wait,
  &.signal-neutral {
    color: #64748b;
    background: #f1f5f9;
  }
}

.sector-card-mid {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 8px;
}

.sector-metric {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;

  .metric-label {
    font-size: 11px;
    color: #94a3b8;
    white-space: nowrap;
  }

  .metric-value {
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    white-space: nowrap;

    &.score {
      color: #2563eb;
    }

    &.up {
      color: #dc2626;
    }

    &.down {
      color: #059669;
    }
  }
}

.sector-card-detail {
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.sector-toggle {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

.sector-stock-block {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.sector-stock-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;

  .stock-header-title {
    font-size: 15px;
    font-weight: 700;
    color: #1e293b;
  }

  .stock-header-count {
    font-size: 12px;
    color: #94a3b8;
  }
}

.sector-stock-body {
  min-height: 60px;
}

.sector-stock-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.sector-stock-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  transition: all 0.2s;

  &:hover {
    border-color: #93c5fd;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.08);
  }
}

.sector-stock-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;

  .sector-stock-name {
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sector-stock-code {
    font-size: 12px;
    color: #94a3b8;
    font-family: 'Roboto Mono', monospace;
  }
}

.sector-analyze-btn {
  flex-shrink: 0;
  border-radius: 6px;
}

.sector-stock-pagination {
  display: flex;
  justify-content: center;
  margin-top: 14px;
}

.calendar-date-bar {
  display: flex;
  gap: 10px;
  padding: 14px 16px;
  overflow-x: auto;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
  }
}

.date-pill {
  flex-shrink: 0;
  min-width: 76px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;

  .pill-day {
    font-size: 20px;
    font-weight: 700;
    color: #1e293b;
    line-height: 1;
  }

  .pill-week {
    font-size: 12px;
    color: #64748b;
  }

  .pill-count {
    font-size: 11px;
    color: #3b82f6;
    background: #eff6ff;
    padding: 2px 6px;
    border-radius: 8px;
  }

  &:hover {
    border-color: #93c5fd;
  }

  &.active {
    border-color: #3b82f6;
    background: #eff6ff;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.12);

    .pill-day {
      color: #2563eb;
    }
  }
}

.calendar-stock-list {
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.calendar-stock-card {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px;
  transition: all 0.2s;

  &:hover {
    border-color: #93c5fd;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08);
  }
}

.stock-main {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.stock-code-block {
  width: 70px;
  text-align: center;
  padding: 6px 8px;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 700;
  font-family: 'Roboto Mono', monospace;
}

.stock-name-row {
  display: flex;
  flex-direction: column;
  gap: 2px;

  .stock-name {
    font-size: 15px;
    font-weight: 600;
    color: #1e293b;
  }

  .stock-tag {
    font-size: 12px;
    color: #94a3b8;
  }
}

.stock-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;

  .meta-label {
    font-size: 11px;
    color: #94a3b8;
  }

  .meta-value {
    font-size: 13px;
    color: #475569;
    font-weight: 500;

    &.highlight {
      color: #2563eb;
    }
  }
}

.meta-divider {
  width: 1px;
  height: 24px;
  background: #e2e8f0;
}

.list-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.table-code {
  color: #2563eb;
  font-weight: 600;
  font-family: 'Roboto Mono', monospace;
}

.table-highlight {
  color: #2563eb;
  font-weight: 500;
}

.calendar-footer {
  display: flex;
  justify-content: center;
  padding: 12px 16px 4px;
  border-top: 1px solid #f1f5f9;
}

.detail-dialog {
  .dialog-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .dialog-table {
    margin-bottom: 16px;
  }

  .dialog-pagination {
    display: flex;
    justify-content: flex-end;
  }
}

.pagination-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.deal-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.deal-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background: #e2e8f0;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.deal-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  transition: background 0.15s;

  &:hover {
    background: #f8fafc;
  }
}

.deal-rank {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  background: #f1f5f9;
  flex-shrink: 0;

  &.top {
    color: #fff;
    background: #3b82f6;
  }
}

.deal-stock {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;

  .deal-name {
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
  }

  .deal-code {
    font-size: 12px;
    color: #94a3b8;
    font-family: 'Roboto Mono', monospace;
  }
}

.deal-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;

  .deal-price {
    font-size: 14px;
    font-weight: 700;
    color: #dc2626;
  }

  .deal-attention {
    font-size: 11px;
    color: #94a3b8;
  }
}

.hot-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.hot-tabs {
  margin-bottom: 16px;
}

.hot-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background: #e2e8f0;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.hot-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  transition: background 0.15s;

  &:hover {
    background: #f8fafc;
  }
}

.hot-rank {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  background: #f1f5f9;
  flex-shrink: 0;

  &.top {
    color: #fff;
    background: #3b82f6;
  }
}

.hot-stock {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;

  .hot-name {
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
  }

  .hot-code {
    font-size: 12px;
    color: #94a3b8;
    font-family: 'Roboto Mono', monospace;
  }
}

.hot-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;

  .hot-price {
    font-size: 14px;
    font-weight: 700;
    color: #dc2626;
  }

  .hot-followers {
    font-size: 11px;
    color: #94a3b8;
  }
}

.rank-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.rank-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background: #e2e8f0;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  transition: background 0.15s;

  &:hover {
    background: #f8fafc;
  }
}

.rank-rank {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  background: #f1f5f9;
  flex-shrink: 0;

  &.top {
    color: #fff;
    background: #3b82f6;
  }
}

.rank-stock {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;

  .rank-name {
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
  }

  .rank-code {
    font-size: 12px;
    color: #94a3b8;
    font-family: 'Roboto Mono', monospace;
  }
}

.rank-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;

  .rank-price {
    font-size: 14px;
    font-weight: 700;
    color: #1e293b;
  }

  .rank-change {
    font-size: 11px;
    font-weight: 600;

    &.up {
      color: #dc2626;
    }

    &.down {
      color: #16a34a;
    }
  }
}
</style>
