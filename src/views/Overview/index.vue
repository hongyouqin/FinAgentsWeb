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
import { Calendar, Search, Refresh, TrendCharts, ArrowRight } from '@element-plus/icons-vue'
import { getDisclosureCalendarList, getDisclosureByStock } from '@/api/disclosureCalendar'
import { getStockHotByCategory, getStockHotDeal, getStockHotRank } from '@/api/stockHot'
import type { DisclosureCalendarItem } from '@/api/disclosureCalendar'
import type { StockHotItem, StockHotDealItem, StockHotRankItem } from '@/api/stockHot'

defineOptions({ name: 'Overview' })

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
.rank-section {
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
