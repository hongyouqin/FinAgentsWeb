<template>
  <div class="basic-layout">
    <!-- 侧边栏 -->
    <aside
      class="sidebar"
      :class="{ collapsed: appStore.sidebarCollapsed }"
      :style="{ width: appStore.actualSidebarWidth + 'px' }"
    >
      <div class="sidebar-header">
        <div class="logo">
          <Logo :size="32" />
          
          <span v-show="!appStore.sidebarCollapsed" class="logo-text">
              NB.STOCK
          </span>
        </div>

        <!-- 移动端关闭按钮 -->
        <button
          v-if="isMobile && !appStore.sidebarCollapsed"
          class="sidebar-close-btn"
          @click="appStore.setSidebarCollapsed(true)"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      
      <nav class="sidebar-nav">
        <SidebarMenu />
      </nav>
      
      <div class="sidebar-footer">
        <UserProfile />
      </div>
    </aside>

    <!-- 点击蒙层：移动端展开时，点击空白处收起侧边栏 -->
    <div
      v-if="isMobile && !appStore.sidebarCollapsed"
      class="sidebar-overlay"
      @click="appStore.setSidebarCollapsed(true)"
    ></div>

    <!-- 主内容区 -->
    <div class="main-container" :style="{ marginLeft: appStore.actualSidebarWidth + 'px' }" @click="handleMainClick">
      <!-- 顶部导航栏 -->
      <header class="header">
        <div class="header-left">
          <el-button
            type="text"
            @click.stop="appStore.toggleSidebar()"
            class="sidebar-toggle"
          >
            <el-icon><Expand v-if="appStore.sidebarCollapsed" /><Fold v-else /></el-icon>
          </el-button>
          
          <Breadcrumb />
        </div>
        
        <div class="header-right">
          <HeaderActions />
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="main-content">
        <div class="content-wrapper">
          <router-view v-slot="{ Component, route }">
            <transition
              :name="route.meta.transition || 'fade'"
              mode="out-in"
              appear
            >
              <keep-alive :include="keepAliveComponents">
                <component :is="Component" :key="route.fullPath" />
              </keep-alive>
            </transition>
          </router-view>
        </div>
      </main>

      <!-- 页脚 -->
      <footer v-if="!route.meta.hideFooter" class="footer">
        <AppFooter />
      </footer>
    </div>

    <!-- 签到弹窗（全局挂载） -->
    <SignDialog />

    <!-- 企业微信客服弹框（全局挂载） -->
    <WechatServiceDialog ref="wechatServiceRef" />

    <!-- 右下角悬浮客服按钮 -->
    <el-backtop :right="40" :bottom="40" />
    <button class="float-service-btn" @click="openWechatService" title="联系客服">
      <el-icon><Service /></el-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import SidebarMenu from '@/components/Layout/SidebarMenu.vue'
import UserProfile from '@/components/Layout/UserProfile.vue'
import Breadcrumb from '@/components/Layout/Breadcrumb.vue'
import HeaderActions from '@/components/Layout/HeaderActions.vue'
import AppFooter from '@/components/Layout/AppFooter.vue'
import Logo from '@/components/Logo.vue'
import TxDialog from '@/components/TxDialog.vue'
import SignDialog from '@/components/Global/SignDialog.vue'
import WechatServiceDialog from '@/components/WechatServiceDialog.vue'
import { Expand, Fold, Service } from '@element-plus/icons-vue'

const appStore = useAppStore()
const route = useRoute()
const { width } = useWindowSize()

// 企业微信客服弹框
const wechatServiceRef = ref<InstanceType<typeof import('@/components/WechatServiceDialog.vue').default> | null>(null)
const openWechatService = () => {
  wechatServiceRef.value?.open()
}

// 需要缓存的组件
const keepAliveComponents = computed(() => [
  'Dashboard',
  'SingleAnalysis',
  'StockScreening',
  'AnalysisHistory',
  'QueueManagement'
])

// 移动端判断
const isMobile = computed(() => width.value < 768)

// 点击主内容时，若移动端且侧边栏已展开，则收起
const handleMainClick = () => {
  if (isMobile.value && !appStore.sidebarCollapsed) {
    appStore.setSidebarCollapsed(true)
  }
}

// 挂载时：移动端默认收起侧边栏
onMounted(() => {
  if (isMobile.value) {
    appStore.setSidebarCollapsed(true)
  }
})

// 监听窗口大小变化：在小屏幕上自动折叠侧边栏
watch(width, (newWidth) => {
  if (newWidth < 768 && !appStore.sidebarCollapsed) {
    appStore.setSidebarCollapsed(true)
  }
})

// 路由变化时，移动端收起侧边栏
watch(() => route.fullPath, () => {
  if (isMobile.value) {
    appStore.setSidebarCollapsed(true)
  }
})
</script>

<style lang="scss" scoped>
.basic-layout {
  min-height: 100vh;
  background-color: var(--el-bg-color-page);
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 950; // 低于侧边栏(1000)，高于内容区
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-light);
  transition: width 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;

  &.collapsed {
    width: 64px !important;
  }

  .sidebar-header {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;

      .logo-text {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        white-space: nowrap;
      }
    }

    .sidebar-close-btn {
      display: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: rgba(100, 116, 139, 0.1);
      color: #64748b;
      cursor: pointer;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.2s ease;

      svg {
        width: 16px;
        height: 16px;
      }

      &:hover {
        background: rgba(6, 182, 212, 0.12);
        color: #06b6d4;
      }

      &:active {
        transform: scale(0.92);
      }
    }
  }

  .sidebar-nav {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 8px 0;
  }

  .sidebar-footer {
    border-top: 1px solid var(--el-border-color-lighter);
    padding: 8px;
  }
}

.main-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
}

.header {
  height: 60px;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 999;

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .sidebar-toggle {
      padding: 8px;
      
      .el-icon {
        font-size: 18px;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }
}

.main-content {
  flex: 1;
  // padding: 24px;
  min-height: calc(100vh - 60px - 60px); // 减去header和footer高度

  .content-wrapper {
    max-width: 1400px;
    margin: 0 auto;
  }
}

.footer {
  // height: 60px;
  background-color: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

// 响应式设计
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    
    &:not(.collapsed) {
      transform: translateX(0);
    }
  }

  .sidebar-close-btn {
    display: flex !important;
  }

  .main-container {
    margin-left: 0 !important;
  }

  .main-content {
    padding: 0px;
  }

  .header {
    padding: 0 16px;
  }

  .float-service-btn {
    right: 16px;
    bottom: 16px;
  }
}

.float-service-btn {
  position: fixed;
  right: 24px;
  bottom: 454px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(6, 182, 212, 0.35);
  z-index: 998;
  transition: all 0.3s ease;

  .el-icon {
    font-size: 22px;
  }

  &:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 8px 24px rgba(6, 182, 212, 0.45);
  }

  &:active {
    transform: scale(0.96);
  }
}

// 路由过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(30px);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}
</style>
