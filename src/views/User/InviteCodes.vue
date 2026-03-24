<template>
  <div class="invite-codes-page">
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
          <el-icon><Ticket /></el-icon>
          <span>邀请码管理</span>
        </div>
        <h1 class="hero-title">我的邀请码</h1>
        <p class="hero-subtitle">生成邀请码，邀请好友加入</p>
      </div>
    </div>

    <div class="content-wrapper">
      <!-- Tab 切换 -->
      <div class="tab-container">
        <div
          v-for="tab in tabs"
          :key="tab.name"
          class="tab-item"
          :class="{ active: activeTab === tab.name }"
          @click="activeTab = tab.name; loadData()"
        >
          <el-icon :size="16">
            <component :is="tab.icon" />
          </el-icon>
          <span>{{ tab.label }}</span>
        </div>
      </div>

      <!-- 警告提示 -->
      <el-alert
        v-if="activeTab === 'codes'"
        type="warning"
        :closable="false"
        show-icon
        class="warning-alert"
      >
        <template #title>
          <span class="alert-title">重要提示</span>
        </template>
        <div class="alert-content">
          <p>当邀请码被使用后才可以再次生成新的邀请码。</p>
          <!-- <p class="warning-text">
            <el-icon><Warning /></el-icon>
            请不要在公开的论坛、聊天群发送邀请码或网址。我们禁止买卖邀请码，一经发现将会导致您的账号被注销。
          </p> -->
        </div>
      </el-alert>

      <!-- 操作区域 -->
      <div class="action-section" v-if="activeTab === 'codes'" >
        <div class="action-left">
          <el-button
            type="primary"
            size="large"
            :loading="generating"
            :disabled="!canGenerate"
            @click="handleGenerate"
          >
            <el-icon><Plus /></el-icon>
            <span>生成邀请码</span>
          </el-button>
          <!-- <span v-if="!canGenerate && codeList.length > 0" class="generate-tip">
            <el-icon><InfoFilled /></el-icon>
            当前邀请码未被使用，无法生成新邀请码
          </span> -->
        </div>
        <el-button
    :loading="loading"
    @click="loadData"
    circle
    class="refresh-btn"
  >
    <el-icon><Refresh /></el-icon>
  </el-button>
</div>

<!-- 邀请码列表 -->
<div v-if="activeTab === 'codes'" class="list-section">
  <div class="list-header">
    <span class="section-title">邀请码列表</span>
    <el-tag type="info" size="small" effect="plain">共 {{ codeList.length }} 个</el-tag>
  </div>

  <!-- 加载状态 -->
  <div v-if="loading" class="loading-container">
    <el-icon class="rotating"><Loading /></el-icon>
    <span>加载中...</span>
  </div>

  <!-- 空状态 -->
  <div v-else-if="codeList.length === 0" class="empty-state">
    <el-icon class="empty-icon"><Ticket /></el-icon>
    <h3>暂无邀请码</h3>
    <p>点击上方按钮生成您的第一个邀请码</p>
  </div>

  <!-- 桌面端表格 -->
  <div v-else class="desktop-table">
    <el-table :data="codeList" style="width: 100%">
      <el-table-column label="序号" width="70" align="center">
        <template #default="{ $index }">
          <span class="index-badge">{{ $index + 1 }}</span>
        </template>
      </el-table-column>

      <el-table-column label="邀请码" min-width="200">
        <template #default="{ row }">
          <div class="code-cell">
            <span class="code-text">{{ row.code }}</span>
            <el-button size="small" text type="primary" @click="copyCode(row.code)">
              <el-icon><CopyDocument /></el-icon>
            </el-button>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="生成时间" width="180">
        <template #default="{ row }">
          <span class="time-text">{{ formatTime(row.created_at_datetime) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="过期时间" width="180">
        <template #default="{ row }">
          <span class="time-text">{{ formatTime(row.expire_at_datetime) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="120" align="center">
        <template #default="{ row }">
          <el-tag
            :type="getStatusType(row)"
            size="small"
            effect="light"
          >
            {{ getStatusText(row) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="使用情况" width="120" align="center">
        <template #default="{ row }">
          <span class="usage-text">{{ row.used_count }} / {{ row.max_uses }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <!-- 分页 -->
  <div v-if="pagination.total > 0" class="pagination-wrapper desktop-pagination">
    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    />
  </div>

  <!-- 移动端卡片 -->
  <div v-if="codeList.length > 0" class="mobile-list">
    <div
      v-for="(item, index) in codeList"
      :key="item.code"
      class="code-card"
      :class="{ 'is-valid': item.is_valid, 'is-invalid': !item.is_valid }"
    >
      <div class="card-header">
        <span class="card-index">#{{ index + 1 }}</span>
        <el-tag
          :type="getStatusType(item)"
          size="small"
          effect="light"
        >
          {{ getStatusText(item) }}
        </el-tag>
      </div>
      <div class="card-body">
        <div class="code-row">
          <span class="code-value">{{ item.code }}</span>
          <el-button size="small" text type="primary" @click="copyCode(item.code)">
            <el-icon><CopyDocument /></el-icon>
          </el-button>
        </div>
        <div class="info-row">
          <span class="info-label">生成时间</span>
          <span class="info-value">{{ formatTime(item.created_at_datetime) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">过期时间</span>
          <span class="info-value">{{ formatTime(item.expire_at_datetime) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">使用情况</span>
          <span class="info-value">{{ item.used_count }} / {{ item.max_uses }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- 移动端分页 -->
  <div v-if="pagination.total > 0" class="pagination-wrapper mobile-pagination">
    <el-pagination
      v-model:current-page="pagination.page"
      :total="pagination.total"
      :page-size="pagination.pageSize"
      layout="prev, pager, next"
      small
      @current-change="handlePageChange"
    />
  </div>
</div>

<!-- 已邀请用户列表 -->
<div v-if="activeTab === 'invited'" class="list-section">
  <div class="list-header">
    <span class="section-title">已邀请用户</span>
    <el-tag type="info" size="small" effect="plain">共 {{ invitedUsers.length }} 人</el-tag>
  </div>

  <!-- 加载状态 -->
  <div v-if="loading" class="loading-container">
    <el-icon class="rotating"><Loading /></el-icon>
    <span>加载中...</span>
  </div>

  <!-- 空状态 -->
  <div v-else-if="invitedUsers.length === 0" class="empty-state">
    <el-icon class="empty-icon"><User /></el-icon>
    <h3>暂无邀请用户</h3>
    <p>生成邀请码并分享给好友，邀请他们加入</p>
  </div>

  <!-- 桌面端表格 -->
  <div v-else class="desktop-table">
    <el-table :data="invitedUsers" style="width: 100%">
      <el-table-column label="序号" width="70" align="center">
        <template #default="{ $index }">
          <span class="index-badge">{{ $index + 1 }}</span>
        </template>
      </el-table-column>

      <el-table-column label="用户名" min-width="150">
        <template #default="{ row }">
          <span class="username-text">{{ row.username }}</span>
        </template>
      </el-table-column>

      <el-table-column label="手机号" min-width="150">
        <template #default="{ row }">
          <span class="phone-text">{{ row.phone }}</span>
        </template>
      </el-table-column>

      <el-table-column label="邀请时间" width="180">
        <template #default="{ row }">
          <span class="time-text">{{ formatTime(row.invited_at) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="奖励算力" width="120" align="center">
        <template #default="{ row }">
          <el-tag type="primary" size="small" effect="light">
            {{ row.reward_granted }} ⚡
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="120" align="center">
        <template #default="{ row }">
          <el-tag
            :type="row.status === 'active' ? 'success' : 'warning'"
            size="small"
            effect="light"
          >
            {{ row.status === 'active' ? '活跃' : '未激活' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <!-- 分页 -->
  <div v-if="pagination.total > 0" class="pagination-wrapper desktop-pagination">
    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    />
  </div>

  <!-- 移动端卡片 -->
  <div v-if="invitedUsers.length > 0" class="mobile-list">
    <div
      v-for="(item, index) in invitedUsers"
      :key="item.user_id"
      class="user-card"
    >
      <div class="card-header">
        <span class="card-index">#{{ index + 1 }}</span>
        <el-tag
          :type="item.status === 'active' ? 'success' : 'warning'"
          size="small"
          effect="light"
        >
          {{ item.status === 'active' ? '活跃' : '未激活' }}
        </el-tag>
      </div>
      <div class="card-body">
        <div class="user-info">
          <div class="user-row">
            <span class="info-label">用户名</span>
            <span class="info-value">{{ item.username }}</span>
          </div>
          <div class="user-row">
            <span class="info-label">手机号</span>
            <span class="info-value">{{ item.phone }}</span>
          </div>
          <div class="user-row">
            <span class="info-label">邀请时间</span>
            <span class="info-value">{{ formatTime(item.invited_at) }}</span>
          </div>
          <div class="user-row">
            <span class="info-label">奖励算力</span>
            <span class="info-value">{{ item.reward_granted }} ⚡</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 移动端分页 -->
  <div v-if="pagination.total > 0" class="pagination-wrapper mobile-pagination">
    <el-pagination
      v-model:current-page="pagination.page"
      :total="pagination.total"
      :page-size="pagination.pageSize"
      layout="prev, pager, next"
      small
      @current-change="handlePageChange"
    />
  </div>
</div>
</div>
</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Ticket,
  User,
  Warning,
  Plus,
  InfoFilled,
  Loading,
  CopyDocument,
  Refresh
} from '@element-plus/icons-vue'
import { inviteApi, type InviteCode } from '@/api/invite'

defineOptions({ name: 'InviteCodes' })

const activeTab = ref<'codes'|'invited'>('codes')
const loading = ref(false)
const generating = ref(false)
const codeList = ref<InviteCode[]>([])
const invitedUsers = ref<any[]>([])

const tabs = ref([
  { name: 'codes', label: '邀请码', icon: Ticket },
  { name: 'invited', label: '已邀请用户', icon: User }
])

// 分页
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

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

// 是否可以生成新邀请码（所有邀请码都已使用或没有邀请码）
const canGenerate = computed(() => {
  if (codeList.value.length === 0) return true
  // 检查是否所有有效邀请码都已被使用
  return codeList.value.every(code => code.is_used_up || code.is_expired || !code.is_valid)
})

// 加载数据
const loadData = async () => {
  if (activeTab.value === 'codes') {
    await loadCodes()
  } else {
    await loadInvitedUsers()
  }
}

// 加载邀请码列表
const loadCodes = async () => {
  loading.value = true
  try {
    const res = await inviteApi.getMyCodes({ 
      page: pagination.value.page, 
      page_size: pagination.value.pageSize 
    })
    const data = (res as any)?.data?.data || (res as any)?.data || {}
    codeList.value = data.items || []
    pagination.value.total = data.total || 0
  } catch (error: any) {
    console.error('加载邀请码失败:', error)
    ElMessage.error(error.message || '加载邀请码失败')
  } finally {
    loading.value = false
  }
}

// 加载已邀请用户列表
const loadInvitedUsers = async () => {
  loading.value = true
  try {
    const res = await inviteApi.getInvitedUsers({ 
      page: pagination.value.page, 
      page_size: pagination.value.pageSize 
    })
    const data = (res as any)?.data?.data || (res as any)?.data || {}
    invitedUsers.value = data.items || []
    pagination.value.total = data.total || 0
  } catch (error: any) {
    console.error('加载已邀请用户失败:', error)
    ElMessage.error(error.message || '加载已邀请用户失败')
  } finally {
    loading.value = false
  }
}

// 分页变化
const handlePageChange = (page: number) => {
  pagination.value.page = page
  loadData()
}

const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.page = 1
  loadData()
}

// 生成邀请码
const handleGenerate = async () => {
  if (!canGenerate.value) {
    ElMessage.warning('当前邀请码未被使用，无法生成新邀请码')
    return
  }

  generating.value = true
  try {
    const res = await inviteApi.create()
    if ((res as any).success) {
      ElMessage.success('邀请码生成成功')
      await loadCodes()
    } else {
      ElMessage.error((res as any).message || '生成失败')
    }
  } catch (error: any) {
    console.error('生成邀请码失败:', error)
    ElMessage.error(error.message || '生成邀请码失败')
  } finally {
    generating.value = false
  }
}

// 复制邀请码
const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
    ElMessage.success('邀请码已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 格式化时间
const formatTime = (dateStr: string) => {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateStr
  }
}

// 获取状态类型
const getStatusType = (item: InviteCode): 'success' | 'warning' | 'danger' | 'info' => {
  if (item.is_used_up) return 'info'
  if (item.is_expired) return 'danger'
  if (item.is_valid) return 'success'
  return 'warning'
}

// 获取状态文字
const getStatusText = (item: InviteCode): string => {
  if (item.is_used_up) return '已用完'
  if (item.is_expired) return '已过期'
  if (item.is_valid) return '有效'
  return '无效'
}

onMounted(() => {
  initParticles()
  loadData()
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
.invite-codes-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f9ff 0%, #f8fafc 60%, #f1f5f9 100%);
  padding-bottom: 48px;
  overflow-x: hidden;
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
  max-width: 1000px;
  margin: -32px auto 0;
  padding: 0 24px;
  position: relative;
  z-index: 2;
}

// Tab 切换
.tab-container {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  background: white;
  border-radius: 12px;
  padding: 4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);

  .tab-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 20px;
    border-radius: 8px;
    cursor: pointer;
    color: #64748b;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;

    &:hover {
      background: #f1f5f9;
      color: #334155;
    }

    &.active {
      background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(6, 182, 212, 0.3);
    }

    .el-icon {
      font-size: 16px;
    }
  }
}

// 警告提示
.warning-alert {
  border-radius: 16px;
  margin-bottom: 20px;
  border: 1px solid rgba(245, 158, 11, 0.3);

  :deep(.el-alert__content) {
    width: 100%;
  }

  .alert-title {
    font-weight: 600;
    font-size: 15px;
  }

  .alert-content {
    margin-top: 8px;
    
    p {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #92400e;
      line-height: 1.6;
    }

    .warning-text {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      color: #b45309;
      font-weight: 500;

      .el-icon {
        margin-top: 3px;
        flex-shrink: 0;
      }
    }
  }
}

// 操作区域
.action-section {
  background: white;
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  .action-left {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    flex: 1;
  }

  .generate-tip {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #94a3b8;

    .el-icon {
      color: #f59e0b;
    }
  }

  .refresh-btn {
    flex-shrink: 0;
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
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;

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
    }

    td {
      padding: 14px 0;
      border-bottom-color: #f1f5f9;
    }
  }
}

.index-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}

.code-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .code-text {
    font-family: 'SF Mono', 'Monaco', monospace;
    font-weight: 600;
    color: #0891b2;
    font-size: 14px;
  }
}

.time-text {
  font-size: 13px;
  color: #64748b;
}

.usage-text {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.username-text {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.phone-text {
  font-size: 13px;
  color: #64748b;
}

// 分页
.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.desktop-pagination {
  display: flex;
}

.mobile-pagination {
  display: none;
}

// 移动端卡片
.mobile-list {
  display: none;
}

.code-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border: 2px solid #e2e8f0;

  &.is-valid {
    border-color: #10b981;
    background: linear-gradient(135deg, #ecfdf5 0%, #f8fafc 100%);
  }

  &.is-invalid {
    border-color: #94a3b8;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .card-index {
      font-size: 13px;
      font-weight: 600;
      color: #64748b;
    }
  }

  .card-body {
    .code-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;

      .code-value {
        font-family: 'SF Mono', 'Monaco', monospace;
        font-weight: 600;
        color: #0891b2;
        font-size: 15px;
        flex: 1;
        word-break: break-all;
      }
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;

      .info-label {
        font-size: 13px;
        color: #64748b;
      }

      .info-value {
        font-size: 13px;
        color: #1e293b;
        font-weight: 500;
      }
    }
  }
}

.user-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border: 2px solid #e2e8f0;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .card-index {
      font-size: 13px;
      font-weight: 600;
      color: #64748b;
    }
  }

  .card-body {
    .user-info {
      .user-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 0;

        .info-label {
          font-size: 13px;
          color: #64748b;
        }

        .info-value {
          font-size: 13px;
          color: #1e293b;
          font-weight: 500;
        }
      }
    }
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
    padding: 0 12px;
  }

  .tab-container {
    margin-bottom: 16px;

    .tab-item {
      padding: 10px 16px;
      font-size: 13px;

      .el-icon {
        font-size: 14px;
      }
    }
  }

  .warning-alert {
    border-radius: 12px;

    .alert-content p {
      font-size: 13px;
    }
  }

  .action-section {
    padding: 16px;
    position: relative;

    .action-left {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      padding-right: 50px;

      .el-button {
        width: 100%;
      }

      .generate-tip {
        text-align: center;
        justify-content: center;
      }
    }

    .refresh-btn {
      position: absolute;
      top: 16px;
      right: 16px;
    }
  }

  .desktop-pagination {
    display: none;
  }

  .mobile-pagination {
    display: flex;
  }

  .list-section {
    padding: 16px;
  }

  .desktop-table {
    display: none;
  }

  .mobile-list {
    display: block;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 24px;
  }

  .content-wrapper {
    padding: 0 10px;
  }

  .code-card {
    padding: 14px;

    .card-body .code-value {
      font-size: 13px;
    }
  }
}
</style>