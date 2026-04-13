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
          <el-icon><Share /></el-icon>
          <span>邀请好友</span>
        </div>
        <h1 class="hero-title">邀请有礼</h1>
        <p class="hero-subtitle">分享二维码，邀请好友加入</p>
      </div>
    </div>

    <div class="content-wrapper">
      <!-- 二维码展示区 -->
      <div class="qrcode-section">
        <div class="qrcode-card">
          <div class="qrcode-header">
            <el-icon class="header-icon"><Share /></el-icon>
            <h3>我的邀请二维码</h3>
          </div>
          
          <!-- 加载状态 -->
          <div v-if="qrcodeLoading" class="qrcode-loading">
            <el-icon class="rotating"><Loading /></el-icon>
            <p>正在生成二维码...</p>
          </div>
          
          <!-- 二维码展示 -->
          <div v-else-if="qrcodeUrl" class="qrcode-display">
            <img :src="qrcodeUrl" alt="邀请二维码" class="qrcode-image" />
            <div class="qrcode-tip">
              <p v-if="isMobile">💾 长按图片保存到相册</p>
              <p v-else>💾 右键点击图片，选择“另存为”保存图片</p>
            </div>
          </div>
          
          <!-- 错误状态 -->
          <div v-else class="qrcode-error">
            <el-icon class="error-icon"><CircleClose /></el-icon>
            <p>二维码加载失败</p>
            <el-button type="primary" size="small" @click="loadQrcode">重试</el-button>
          </div>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-icon total">
            <el-icon><UserFilled /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.total_invites || 0 }}</div>
            <div class="stat-label">总邀请人数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon today">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.today_invites || 0 }}</div>
            <div class="stat-label">今日邀请</div>
          </div>
        </div>
      </div>

      <!-- 奖励规则 -->
      <div class="reward-section">
        <el-button
          type="info"
          size="small"
          @click="showRewardDialog = true"
          icon="InfoFilled"
        >
          邀请奖励规则
        </el-button>
      </div>

      <!-- 奖励规则弹窗 -->
      <el-dialog
        v-model="showRewardDialog"
        title="邀请奖励规则"
        width="400px"
        :close-on-click-modal="true"
      >
        <div class="reward-rules">
          <h4>新用户注册奖励</h4>
          <p>新用户注册送5算力</p>

          <h4>邀请奖励</h4>
          <p>邀请人获得3算力</p>

          <!-- <h4>阶梯奖励</h4>
          <p>0-9人: 10算力</p>
          <p>5-14人: 15算力</p>
          <p>15-29人: 18算力</p>
          <p>30人以上: 36算力</p> -->
        </div>
      </el-dialog>

      <!-- 邀请明细列表 -->
      <div class="list-section">
        <div class="list-header">
          <span class="section-title">邀请明细</span>
          <el-tag type="info" size="small" effect="plain">共 {{ inviteList.length }} 人</el-tag>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <el-icon class="rotating"><Loading /></el-icon>
          <span>加载中...</span>
        </div>

        <!-- 空状态 -->
        <div v-else-if="inviteList.length === 0" class="empty-state">
          <el-icon class="empty-icon"><User /></el-icon>
          <h3>暂无邀请记录</h3>
          <p>分享您的邀请二维码，邀请好友加入</p>
        </div>

        <!-- 桌面端表格 -->
        <div v-else class="desktop-table">
          <el-table :data="inviteList" style="width: 100%">
            <el-table-column label="序号" width="70" align="center">
              <template #default="{ $index }">
                <span class="index-badge">{{ $index + 1 }}</span>
              </template>
            </el-table-column>

            <el-table-column label="用户" min-width="180">
              <template #default="{ row }">
                <div class="user-cell">
                  <el-avatar :size="32" :src="row.avatar || undefined" class="user-avatar">
                    {{ row.nickname?.charAt(0) || '?' }}
                  </el-avatar>
                  <div class="user-info">
                    <span class="username-text">{{ row.nickname }}</span>
                    <span class="user-id">ID: {{ row.user_id }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="邀请来源" min-width="120">
              <template #default="{ row }">
                <el-tag v-if="row.invite_source" size="small" type="info" effect="plain">
                  {{ row.invite_source }}
                </el-tag>
                <span v-else class="text-muted">—</span>
              </template>
            </el-table-column>

            <el-table-column label="邀请时间" width="180">
              <template #default="{ row }">
                <span class="time-text">{{ formatTime(row.created_at) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 移动端卡片 -->
        <div v-if="inviteList.length > 0" class="mobile-list">
          <div
            v-for="(item, index) in inviteList"
            :key="item.user_id"
            class="user-card"
          >
            <div class="card-header">
              <div class="user-info-header">
                <el-avatar :size="40" :src="item.avatar || undefined" class="user-avatar-mobile">
                  {{ item.nickname?.charAt(0) || '?' }}
                </el-avatar>
                <div class="user-details">
                  <span class="nickname">{{ item.nickname }}</span>
                  <span class="user-id-mobile">ID: {{ item.user_id }}</span>
                </div>
              </div>
              <span class="card-index">#{{ index + 1 }}</span>
            </div>
            <div class="card-body">
              <div class="user-info">
                <div class="user-row">
                  <span class="info-label">邀请来源</span>
                  <span class="info-value">{{ item.invite_source || '—' }}</span>
                </div>
                <div class="user-row">
                  <span class="info-label">邀请时间</span>
                  <span class="info-value">{{ formatTime(item.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Share,
  User,
  UserFilled,
  Calendar,
  InfoFilled,
  Loading,
  CircleClose
} from '@element-plus/icons-vue'
import { inviteApi } from '@/api/invite'
import weixin from '@/utils/weixin'

defineOptions({ name: 'InviteCodes' })

const loading = ref(false)
const qrcodeLoading = ref(false)
const qrcodeUrl = ref('')
const showRewardDialog = ref(false)

// 判断是否在微信环境
const isWechat = computed(() => weixin.isWechatEnv())

// 判断是否是移动端
const isMobile = computed(() => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768
})

// 统计数据
const stats = ref({
  total_invites: 0,
  today_invites: 0
})

// 邀请列表
const inviteList = ref<Array<{
  user_id: string
  created_at: string
  nickname: string
  avatar: string
  invite_source: string
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

// 加载二维码
const loadQrcode = async () => {
  qrcodeLoading.value = true
  try {
    const res = await inviteApi.getInviteQrcode()
    const data = (res as any)?.data || res
    if (data.qrcode_url) {
      qrcodeUrl.value = data.qrcode_url
    } else {
      ElMessage.error('获取二维码失败')
    }
  } catch (error: any) {
    console.error('加载二维码失败:', error)
    ElMessage.error(error.message || '加载二维码失败')
  } finally {
    qrcodeLoading.value = false
  }
}

// 加载统计数据
const loadStats = async () => {
  loading.value = true
  try {
    const res = await inviteApi.getInviteStats()
    const data = (res as any)?.data || res
    if (data) {
      inviteList.value = data.list || []
      
      // 更新统计数据
      stats.value = {
        total_invites: data.total || data.list?.length || 0,
        today_invites: data.today_count || 0
      }
    }
  } catch (error: any) {
    console.error('加载统计数据失败:', error)
    ElMessage.error(error.message || '加载统计数据失败')
  } finally {
    loading.value = false
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

onMounted(() => {
  initParticles()
  loadQrcode()
  loadStats()
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

// 二维码区域
.qrcode-section {
  margin-bottom: 24px;
}

.qrcode-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(6, 182, 212, 0.1);

  .qrcode-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;

    .header-icon {
      font-size: 24px;
      color: #06b6d4;
    }

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
    }
  }

  .qrcode-loading {
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

    p {
      margin: 0;
      font-size: 14px;
    }
  }

  .qrcode-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;

    .qrcode-image {
      width: 250px;
      height: 250px;
      object-fit: contain;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      user-select: none;
      -webkit-user-select: none;
      -webkit-touch-callout: default;
    }

    .qrcode-tip {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      color: #06b6d4;
      text-align: center;
      padding: 12px 20px;
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.05), rgba(59, 130, 246, 0.05));
      border-radius: 8px;
      border: 1px solid rgba(6, 182, 212, 0.15);

      p {
        margin: 0;
      }
    }
  }

  .qrcode-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    gap: 12px;
    color: #64748b;

    .error-icon {
      font-size: 48px;
      color: #ef4444;
    }

    p {
      margin: 0;
      font-size: 14px;
    }
  }
}

// 统计卡片
.stats-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid rgba(6, 182, 212, 0.1);

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;

    &.total {
      background: linear-gradient(135deg, rgba(5, 150, 105, 0.1), rgba(6, 182, 212, 0.12));
      color: #06b6d4;
    }

    &.today {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.12));
      color: #3b82f6;
    }
  }

  .stat-info {
    flex: 1;

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
      line-height: 1.2;
    }

    .stat-label {
      font-size: 13px;
      color: #64748b;
      margin-top: 4px;
    }
  }
}

// 奖励规则
.reward-section {
  margin-bottom: 20px;
  text-align: right;
}

.reward-rules {
  h4 {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    margin: 16px 0 8px 0;
  }

  p {
    font-size: 14px;
    color: #475569;
    margin: 4px 0;
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

.time-text {
  font-size: 13px;
  color: #64748b;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;

  .user-avatar {
    flex-shrink: 0;
    background: linear-gradient(135deg, #06b6d4, #3b82f6);
    color: white;
    font-weight: 600;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;

    .username-text {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-id {
      font-size: 11px;
      color: #94a3b8;
      font-family: monospace;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.text-muted {
  color: #cbd5e1;
}

// 移动端卡片
.mobile-list {
  display: none;
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
    padding-bottom: 12px;
    border-bottom: 1px solid #e2e8f0;

    .user-info-header {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      min-width: 0;

      .user-avatar-mobile {
        flex-shrink: 0;
        background: linear-gradient(135deg, #06b6d4, #3b82f6);
        color: white;
        font-weight: 600;
      }

      .user-details {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;

        .nickname {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .user-id-mobile {
          font-size: 11px;
          color: #94a3b8;
          font-family: monospace;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    .card-index {
      font-size: 13px;
      font-weight: 600;
      color: #64748b;
      flex-shrink: 0;
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

  .qrcode-card {
    padding: 20px;

    .qrcode-display {
      .qrcode-image {
        width: 200px;
        height: 200px;
      }
    }
  }

  .stats-section {
    grid-template-columns: 1fr;
    gap: 12px;
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

  .stat-card {
    padding: 16px;

    .stat-icon {
      width: 40px;
      height: 40px;
      font-size: 20px;
    }

    .stat-info {
      .stat-value {
        font-size: 24px;
      }
    }
  }

  .qrcode-card {
    .qrcode-display {
      .qrcode-image {
        width: 180px;
        height: 180px;
      }
    }
  }
}
</style>