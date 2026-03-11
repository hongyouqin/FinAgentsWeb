<template>
  <div class="reports-page">
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
          <el-icon><Document /></el-icon>
          <span>报告中心</span>
        </div>
        <h1 class="hero-title">分析报告</h1>
        <p class="hero-subtitle">查看和管理所有股票分析报告，支持多种格式导出</p>
      </div>
    </div>

    <div class="content-wrapper">
      <!-- 筛选区 -->
      <div class="filter-section">
        <div class="filter-row">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索股票代码或名称"
            clearable
            class="search-input"
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-select
            v-model="marketFilter"
            placeholder="市场"
            clearable
            class="market-select"
            @change="handleMarketChange"
          >
            <el-option label="A股" value="A股" />
            <el-option label="港股" value="港股" />
            <el-option label="美股" value="美股" />
          </el-select>

          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="date-picker"
            @change="handleDateChange"
          />

          <div class="filter-actions">
            <el-button :loading="loading" @click="refreshReports">
              <el-icon><Refresh /></el-icon>
              <span class="btn-text">刷新</span>
            </el-button>
            <el-button
              :disabled="selectedReports.length === 0"
              @click="exportSelected"
            >
              <el-icon><Download /></el-icon>
              <span class="btn-text">导出{{ selectedReports.length > 0 ? ` (${selectedReports.length})` : '' }}</span>
            </el-button>
          </div>
        </div>
      </div>

      <!-- 列表区 -->
      <div class="list-section">
        <!-- 桌面端表格 -->
        <div class="desktop-table">
          <el-table
            :data="filteredReports"
            v-loading="loading"
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="50" />

            <el-table-column label="报告标题" min-width="220">
              <template #default="{ row }">
                <div class="report-title-cell">
                  <div class="report-name" @click="viewReport(row)">{{ row.title }}</div>
                  <div class="report-sub">{{ row.stock_code }} · {{ row.stock_name }}</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="类型" width="110">
              <template #default="{ row }">
                <el-tag :type="getTypeColor(row.type)" effect="light" size="small">
                  {{ getTypeText(row.type) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <div class="status-cell">
                  <span class="status-dot" :class="`dot-${row.status}`" />
                  <el-tag :type="getStatusType(row.status)" effect="light" size="small">
                    {{ getStatusText(row.status) }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="分析模型" width="160">
              <template #default="{ row }">
                <el-tag
                  v-if="row.model_info && row.model_info !== 'Unknown'"
                  type="info"
                  size="small"
                  effect="plain"
                >
                  {{ row.model_info }}
                </el-tag>
                <span v-else class="text-muted">—</span>
              </template>
            </el-table-column>

            <el-table-column label="创建时间" width="170">
              <template #default="{ row }">
                <div class="time-cell">
                  <el-icon><Clock /></el-icon>
                  <span>{{ formatTime(row.created_at) }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <div class="action-cell">
                  <el-button type="primary" size="small" text @click="viewReport(row)">
                    <el-icon><View /></el-icon>
                    查看
                  </el-button>
                  <el-dropdown
                    v-if="row.status === 'completed'"
                    trigger="click"
                    @command="(format) => downloadReport(row, format)"
                  >
                    <el-button type="primary" size="small" text>
                      <el-icon><Download /></el-icon>
                      下载
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="markdown">Markdown</el-dropdown-item>
                        <el-dropdown-item command="docx">Word 文档</el-dropdown-item>
                        <el-dropdown-item command="pdf">PDF</el-dropdown-item>
                        <el-dropdown-item command="json" divided>JSON 原始数据</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                  <el-button size="small" text type="danger" @click="deleteReport(row)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 移动端卡片 -->
        <div class="mobile-list">
          <div
            v-for="row in filteredReports"
            :key="row.id"
            class="report-card"
            :class="`card-${row.status}`"
          >
            <div class="card-header">
              <div class="card-title" @click="viewReport(row)">{{ row.title }}</div>
              <el-tag :type="getStatusType(row.status)" size="small" effect="light">
                {{ getStatusText(row.status) }}
              </el-tag>
            </div>
            <div class="card-meta">
              <span class="meta-badge">{{ row.stock_code }}</span>
              <span class="meta-text" v-if="row.stock_name">{{ row.stock_name }}</span>
              <el-tag :type="getTypeColor(row.type)" size="small" effect="plain" class="type-tag">
                {{ getTypeText(row.type) }}
              </el-tag>
            </div>
            <div class="card-time">
              <el-icon><Clock /></el-icon>
              {{ formatTime(row.created_at) }}
            </div>
            <div class="card-footer">
              <el-button type="primary" size="small" @click="viewReport(row)">
                <el-icon><View /></el-icon>
                查看
              </el-button>
              <el-dropdown
                v-if="row.status === 'completed'"
                trigger="click"
                @command="(format) => downloadReport(row, format)"
              >
                <el-button size="small">
                  <el-icon><Download /></el-icon>
                  下载
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="markdown">Markdown</el-dropdown-item>
                    <el-dropdown-item command="docx">Word</el-dropdown-item>
                    <el-dropdown-item command="pdf">PDF</el-dropdown-item>
                    <el-dropdown-item command="json" divided>JSON</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-button type="danger" size="small" plain @click="deleteReport(row)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredReports.length === 0 && !loading" class="empty-state">
          <el-icon class="empty-icon"><Document /></el-icon>
          <h3>暂无报告</h3>
          <p>还没有生成任何分析报告，去发起一次分析吧</p>
        </div>

        <!-- 分页 -->
        <div v-if="totalReports > 0" class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[20, 50, 100]"
            :total="totalReports"
            :layout="isMobile ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper'"
            :pager-count="isMobile ? 5 : 7"
            :small="isMobile"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  Search,
  Download,
  Refresh,
  Delete,
  View,
  Clock
} from '@element-plus/icons-vue'
import { useWindowSize } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import { formatDateTime } from '@/utils/datetime'

const router = useRouter()
const authStore = useAuthStore()

const { width: windowWidth } = useWindowSize()
const isMobile = computed(() => windowWidth.value <= 768)

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const marketFilter = ref('')
const dateRange = ref<[string, string] | null>(null)
const selectedReports = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const totalReports = ref(0)
const reports = ref<any[]>([])

const filteredReports = computed(() => reports.value)

const formatTime = (time: string) => time ? formatDateTime(time) : '—'

// API
const fetchReports = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      page_size: pageSize.value.toString()
    })
    if (searchKeyword.value) params.append('search_keyword', searchKeyword.value)
    if (marketFilter.value) params.append('market_filter', marketFilter.value)
    if (dateRange.value) {
      params.append('start_date', dateRange.value[0])
      params.append('end_date', dateRange.value[1])
    }

    const response = await fetch(`/api/reports/list?${params}`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const result = await response.json()
    if (result.success) {
      reports.value = result.data.reports
      totalReports.value = result.data.total
    } else {
      throw new Error(result.message || '获取报告列表失败')
    }
  } catch (error) {
    ElMessage.error('获取报告列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { currentPage.value = 1; fetchReports() }
const handleDateChange = () => { currentPage.value = 1; fetchReports() }
const handleMarketChange = () => { currentPage.value = 1; fetchReports() }
const handleSelectionChange = (selection: any[]) => { selectedReports.value = selection }
const handleSizeChange = (size: number) => { pageSize.value = size; currentPage.value = 1; fetchReports() }
const handleCurrentChange = (page: number) => { currentPage.value = page; fetchReports() }

const refreshReports = () => fetchReports()

const viewReport = (report: any) => {
  router.push(`/reports/view/${report.id}`)
}

const downloadReport = async (report: any, format: string = 'markdown') => {
  try {
    const formatNames: Record<string, string> = { markdown: 'Markdown', docx: 'Word', pdf: 'PDF', json: 'JSON' }
    const msg = ElMessage({ message: `正在生成 ${formatNames[format] || format} 格式报告...`, type: 'info', duration: 0 })

    const response = await fetch(`/api/reports/${report.id}/download?format=${format}`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    msg.close()

    if (!response.ok) throw new Error(await response.text() || `HTTP ${response.status}`)

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const exts: Record<string, string> = { markdown: 'md', docx: 'docx', pdf: 'pdf', json: 'json' }
    a.download = `${report.stock_code}_分析报告_${report.analysis_date}.${exts[format] || 'txt'}`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    ElMessage.success(`${formatNames[format]} 下载成功`)
  } catch (error: any) {
    if (error.message?.includes('pandoc')) {
      ElMessage.error({ message: 'PDF/Word 导出需要安装 pandoc 工具', duration: 5000 })
    } else {
      ElMessage.error(`下载失败: ${error.message || '未知错误'}`)
    }
  }
}

const deleteReport = async (report: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除报告 "${report.title}" 吗？`,
      '确认删除',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )

    const response = await fetch(`/api/reports/${report.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.token}`, 'Content-Type': 'application/json' }
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const result = await response.json()
    if (result.success) {
      ElMessage.success('报告已删除')
      refreshReports()
    } else {
      throw new Error(result.message || '删除失败')
    }
  } catch (error: unknown) {
    const msg = (error as any)?.message ?? ''
    if (msg !== 'cancel' && error !== 'cancel') {
      ElMessage.error('删除报告失败')
    }
  }
}

const exportSelected = () => {
  ElMessage.info('批量导出功能开发中...')
}

const getTypeColor = (type: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    single: 'primary', batch: 'success', portfolio: 'warning'
  }
  return map[type] || 'info'
}

const getTypeText = (type: string) => {
  const map: Record<string, string> = { single: '单股分析', batch: '批量分析', portfolio: '投资组合' }
  return map[type] || type
}

const getStatusType = (status: string): 'success' | 'warning' | 'danger' | 'info' => {
  const map: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    completed: 'success', processing: 'warning', failed: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = { completed: '已完成', processing: '生成中', failed: '失败' }
  return map[status] || status
}

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

onMounted(() => {
  fetchReports()
  initParticles()
})
</script>

<style lang="scss" scoped>
// ========== 动画 ==========
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
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

// ========== 页面容器 ==========
.reports-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f9ff 0%, #f8fafc 60%, #f1f5f9 100%);
  padding-bottom: 48px;
}

// ========== Hero Section ==========
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
  animation: fadeInUp 0.6s ease;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 16px;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.hero-title {
  font-size: 36px;
  font-weight: 700;
  color: white;
  margin: 0 0 10px 0;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

// ========== 内容容器 ==========
.content-wrapper {
  max-width: 1200px;
  margin: -32px auto 0;
  padding: 0 24px;
  position: relative;
  z-index: 2;
}

// ========== 筛选区 ==========
.filter-section {
  background: white;
  border-radius: 16px;
  padding: 18px 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(6, 182, 212, 0.08);
  animation: fadeInUp 0.5s ease 0.1s both;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;

  :deep(.el-input__wrapper) {
    border-radius: 10px;
    box-shadow: 0 0 0 1px #e2e8f0;

    &:hover { box-shadow: 0 0 0 1px #06b6d4; }
    &.is-focus { box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.2), 0 0 0 1px #06b6d4; }
  }
}

.market-select {
  width: 120px;

  :deep(.el-input__wrapper) {
    border-radius: 10px;
    box-shadow: 0 0 0 1px #e2e8f0;
    &:hover { box-shadow: 0 0 0 1px #06b6d4; }
  }
}

.date-picker {
  width: 240px;

  :deep(.el-input__wrapper) {
    border-radius: 10px;
    box-shadow: 0 0 0 1px #e2e8f0;
    &:hover { box-shadow: 0 0 0 1px #06b6d4; }
  }
}

.filter-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

// ========== 列表区 ==========
.list-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(6, 182, 212, 0.08);
  animation: fadeInUp 0.5s ease 0.2s both;
}

// ========== 桌面端表格 ==========
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

.report-title-cell {
  .report-name {
    font-weight: 600;
    color: #0891b2;
    cursor: pointer;
    transition: color 0.2s;
    font-size: 14px;

    &:hover { color: #06b6d4; text-decoration: underline; }
  }

  .report-sub {
    font-size: 12px;
    color: #94a3b8;
    margin-top: 2px;
  }
}

.status-cell {
  display: flex;
  align-items: center;
  gap: 6px;

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;

    &.dot-completed { background: #10b981; }
    &.dot-processing { background: #f59e0b; animation: pulse 1.5s infinite; }
    &.dot-failed { background: #ef4444; }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.time-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 13px;

  .el-icon { color: #94a3b8; }
}

.action-cell {
  display: flex;
  align-items: center;
  gap: 2px;
}

.text-muted { color: #cbd5e1; }

// ========== 移动端卡片 ==========
.mobile-list {
  display: none;
}

.report-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1.5px solid #e2e8f0;
  transition: all 0.25s ease;

  &:hover { border-color: #06b6d4; background: #f0fffe; }

  &.card-completed { border-color: rgba(16, 185, 129, 0.3); }
  &.card-failed { border-color: rgba(239, 68, 68, 0.3); }
  &.card-processing { border-color: rgba(245, 158, 11, 0.3); }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 10px;
  }

  .card-title {
    font-weight: 600;
    color: #0891b2;
    cursor: pointer;
    font-size: 14px;
    flex: 1;
    line-height: 1.4;

    &:hover { color: #06b6d4; }
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 8px;

    .meta-badge {
      background: rgba(6, 182, 212, 0.1);
      color: #0891b2;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
    }

    .meta-text {
      font-size: 12px;
      color: #64748b;
    }

    .type-tag { font-size: 11px; }
  }

  .card-time {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #94a3b8;
    margin-bottom: 12px;

    .el-icon { font-size: 12px; }
  }

  .card-footer {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}

// ========== 空状态 ==========
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;

  .empty-icon {
    font-size: 56px;
    color: #cbd5e1;
    margin-bottom: 16px;
    display: block;
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
    color: #94a3b8;
  }
}

// ========== 分页 ==========
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

    .el-pager li.is-active {
      background: linear-gradient(135deg, #059669 0%, #06b6d4 100%);
      color: white;
      border-radius: 6px;
    }

    button:hover, .el-pager li:hover {
      color: #06b6d4;
    }
  }
}

// ========== 移动端 ==========
@media (max-width: 768px) {
  .hero-section {
    padding: 32px 16px 56px;
  }

  .hero-title { font-size: 26px; }
  .hero-subtitle { font-size: 13px; }

  .content-wrapper {
    margin-top: -24px;
    padding: 0 12px;
  }

  .filter-section { padding: 14px 16px; }

  .filter-row {
    flex-direction: column;
    align-items: stretch;

    .search-input { min-width: unset; }
    .market-select { width: 100%; }
    .date-picker { width: 100%; }
  }

  .filter-actions {
    justify-content: flex-end;

    .btn-text { display: none; }
  }

  .list-section { padding: 16px; }

  .desktop-table { display: none; }
  .mobile-list { display: block; }

  .pagination-wrapper {
    :deep(.el-pagination) {
      width: 100%;

      .el-pagination__total,
      .el-pagination__sizes,
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
}

@media (max-width: 480px) {
  .hero-title { font-size: 22px; }
}
</style>
