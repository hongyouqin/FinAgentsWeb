<template>
  <div class="user-profile" :class="{ collapsed: appStore.sidebarCollapsed }">
    <el-dropdown trigger="click" @command="handleCommand">
      <div class="profile-trigger">
        <!-- 展开态 -->
        <template v-if="!appStore.sidebarCollapsed">
          <el-avatar :size="36" :src="userAvatar" class="user-avatar">
            <el-icon><User /></el-icon>
          </el-avatar>
          <div class="user-info">
            <div class="username">{{ userDisplayName }}</div>
            <div class="points-row">
              <el-icon class="coin-icon"><Coin /></el-icon>
              <span class="points-num">{{ userPoints.toLocaleString() }}</span>
              <span class="points-unit">积分</span>
            </div>
          </div>
          <el-icon class="arrow-icon"><ArrowRight /></el-icon>
        </template>
        <!-- 折叠态 -->
        <template v-else>
          <div class="collapsed-wrap">
            <el-avatar :size="34" :src="userAvatar" class="user-avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <div class="collapsed-points">
              <el-icon><Coin /></el-icon>
              <span>{{ shortPoints }}</span>
            </div>
          </div>
        </template>
      </div>

      <template #dropdown>
        <el-dropdown-menu>
          <!-- 用户信息头 -->
          <div class="dropdown-header">
            <el-avatar :size="40" :src="userAvatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <div class="dropdown-user">
              <div class="dropdown-name">{{ userDisplayName }}</div>
              <div class="dropdown-points">
                <el-icon><Coin /></el-icon>
                {{ userPoints }} 算力
              </div>
            </div>
          </div>
          <el-divider style="margin: 6px 0" />
          <el-dropdown-item command="recharge">
            <el-icon><Wallet /></el-icon>
            算力充值
          </el-dropdown-item>
          <el-dropdown-item command="tx">
            <el-icon><List /></el-icon>
            算力记录
          </el-dropdown-item>
          <el-dropdown-item command="invite">
            <el-icon><Ticket /></el-icon>
            邀请码
          </el-dropdown-item>
          <el-dropdown-item command="settings">
            <el-icon><Setting /></el-icon>
            系统设置
          </el-dropdown-item>
          <el-dropdown-item divided command="logout">
            <el-icon><SwitchButton /></el-icon>
            退出登录
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { User, Setting, SwitchButton, Coin, Wallet, ArrowRight, List, Ticket } from '@element-plus/icons-vue'
import { useTxDialog } from '@/composables/useTxDialog'
import wechatLogin from '@/utils/wechatLogin'

const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const { openTxDialog } = useTxDialog()

const userAvatar = computed(() => authStore.user?.avatar || undefined)
const userDisplayName = computed(() => authStore.user?.username || '未登录')

// 积分（实际项目中从后端/store获取）
const userPoints = computed(() => authStore.points || 0) 

// 折叠态积分简写：超过1000显示 1.2k 等
const shortPoints = computed(() => {
  const v = userPoints.value
  if (v >= 10000) return `${(v / 10000).toFixed(1)}w`
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`
  return String(v)
})

const handleCommand = async (command: string) => {
  switch (command) {
    case 'recharge':
      router.push('/recharge')
      break
    case 'tx':
      openTxDialog()
      break
    case 'invite':
      router.push('/invite-codes')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      await authStore.logout()
      ElMessage.success('已退出登录')
      
      // 判断是否在微信环境
      if (wechatLogin.isWechat()) {
        // 微信环境：跳转到首页，会自动触发微信授权登录
        console.log('📱 微信环境，跳转到首页')
        router.push('/')
      } else {
        // 非微信环境：跳转到登录页
        console.log('💻 非微信环境，跳转到登录页')
        router.push('/login')
      }
      break
  }
}
</script>

<style lang="scss" scoped>
.user-profile {
  padding: 8px 10px;

  &.collapsed {
    padding: 8px 6px;
    display: flex;
    justify-content: center;
  }
}

.profile-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 10px;
  border-radius: 12px;
  transition: background 0.2s ease;
  outline: none;

  &:hover {
    background: rgba(6, 182, 212, 0.07);
  }

  &:active {
    background: rgba(6, 182, 212, 0.12);
  }
}

.user-avatar {
  flex-shrink: 0;
  background: linear-gradient(135deg, #059669, #06b6d4) !important;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(6, 182, 212, 0.3);
}

.user-info {
  flex: 1;
  min-width: 0;

  .username {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 3px;
  }

  .points-row {
    display: flex;
    align-items: center;
    gap: 3px;

    .coin-icon {
      font-size: 12px;
      color: #f59e0b;
    }

    .points-num {
      font-size: 12px;
      font-weight: 700;
      color: #059669;
      line-height: 1;
    }

    .points-unit {
      font-size: 11px;
      color: #94a3b8;
    }
  }
}

.arrow-icon {
  font-size: 12px;
  color: #cbd5e1;
  flex-shrink: 0;
  transition: transform 0.2s;
}

// 折叠态
.collapsed-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.collapsed-points {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 10px;
  font-weight: 600;
  color: #059669;
  background: rgba(5, 150, 105, 0.08);
  border-radius: 6px;
  padding: 1px 5px;

  .el-icon {
    font-size: 10px;
    color: #f59e0b;
  }
}

// 下拉菜单头部
.dropdown-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px 6px;

  .dropdown-user {
    .dropdown-name {
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 3px;
    }

    .dropdown-points {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
      color: #059669;

      .el-icon {
        color: #f59e0b;
        font-size: 12px;
      }
    }
  }
}
</style>
