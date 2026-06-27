<template>
  <el-menu
    :default-active="activeMenu"
    :collapse="appStore.sidebarCollapsed"
    :unique-opened="true"
    router
    class="sidebar-menu"
  >

    <el-menu-item index="/analysis/single">
      <el-icon><Odometer /></el-icon>
      <template #title>首页</template>
    </el-menu-item>
    <el-menu-item v-if="authStore.user?.is_admin" index="/chat">
      <el-icon><ChatDotRound /></el-icon>
      <template #title>AI 对话</template>
    </el-menu-item>
    <!-- <el-menu-item index="/dashboard">
      <el-icon><Odometer /></el-icon>
      <template #title>仪表板</template>
    </el-menu-item> -->
    <el-menu-item index="/tasks">
      <el-icon><List /></el-icon>
      <template #title>任务中心</template>
    </el-menu-item>
    <!-- <el-menu-item index="/reports">
      <el-icon><TrendCharts /></el-icon>
      <template #title>分析记录</template>
    </el-menu-item> -->
    <el-menu-item index="/recharge">
      <el-icon><Coin /></el-icon>
      <template #title>算力充值</template>
    </el-menu-item>
    <el-menu-item index="/strategy">
      <el-icon><Cpu /></el-icon>
      <template #title>策略</template>
    </el-menu-item>
    <el-menu-item v-if="authStore.user?.is_admin" index="/reports">
      <el-icon><Document /></el-icon>
      <template #title>分析报告</template>
    </el-menu-item>
    <el-menu-item v-if="authStore.user?.is_admin" index="/statistics">
      <el-icon><DataAnalysis /></el-icon>
      <template #title>数据统计</template>
    </el-menu-item>
    <el-menu-item v-if="authStore.user?.is_admin" index="/expense">
      <el-icon><Wallet /></el-icon>
      <template #title>收支账本</template>
    </el-menu-item>
    
    <!-- <el-menu-item index="/learning">
      <el-icon><Reading /></el-icon>
      <template #title>学习中心</template>
    </el-menu-item> -->
    

    <!-- <el-sub-menu index="/analysis">
      <template #title>
        <el-icon><TrendCharts /></el-icon>
        <span>分析记录</span>
      </template> -->
      <!-- <el-menu-item index="/analysis/single">单股分析</el-menu-item> -->
      <!-- <el-menu-item index="/analysis/batch">批量分析</el-menu-item> -->
      <!-- 新增：将分析报告作为股票分析的子菜单 -->
      <!-- <el-menu-item index="/reports">分析报告</el-menu-item>
    </el-sub-menu> -->

    

    <!-- <el-menu-item index="/screening">
      <el-icon><Search /></el-icon>
      <template #title>股票筛选</template>
    </el-menu-item>

    <el-menu-item index="/favorites">
      <el-icon><Star /></el-icon>
      <template #title>我的自选股</template>
    </el-menu-item>

    <el-menu-item index="/paper">
      <el-icon><CreditCard /></el-icon>
      <template #title>模拟交易</template>
    </el-menu-item> -->


    <!-- 分析报告已移至“股票分析”子菜单，保留注释便于追踪 -->
    <!--
    <el-menu-item index="/reports">
      <el-icon><Document /></el-icon>
      <template #title>分析报告</template>
    </el-menu-item>
    -->

    <el-sub-menu index="/settings">
      <template #title>
        <el-icon><Setting /></el-icon>
        <span>设置</span>
      </template>

      <!-- 个人设置 -->
      <el-sub-menu index="/settings-personal">
        <template #title>个人设置</template>
        <el-menu-item index="/settings">通用设置</el-menu-item>
        <!-- <el-menu-item index="/settings?tab=appearance">外观设置</el-menu-item>
        <el-menu-item index="/settings?tab=analysis">分析偏好</el-menu-item>
        <el-menu-item index="/settings?tab=notifications">通知设置</el-menu-item>
        <el-menu-item index="/settings?tab=security">安全设置</el-menu-item> -->
      </el-sub-menu>

      <!-- 系统配置 -->
      <!-- <el-sub-menu index="/settings-config">
        <template #title>系统配置</template>
        <el-menu-item index="/settings/config">配置管理</el-menu-item>
        <el-menu-item index="/settings/cache">缓存管理</el-menu-item>
      </el-sub-menu> -->

      <!-- 系统管理 -->
      <!-- <el-sub-menu index="/settings-admin">
        <template #title>系统管理</template>
        <el-menu-item index="/settings/database">数据库管理</el-menu-item>
        <el-menu-item index="/settings/logs">操作日志</el-menu-item>
        <el-menu-item index="/settings/system-logs">系统日志</el-menu-item>
        <el-menu-item index="/settings/sync">多数据源同步</el-menu-item>
        <el-menu-item index="/settings/scheduler">定时任务</el-menu-item>
        <el-menu-item index="/settings/usage">使用统计</el-menu-item>
      </el-sub-menu> -->
    </el-sub-menu>

    <!-- <el-menu-item index="/about">
      <el-icon><InfoFilled /></el-icon>
      <template #title>关于</template>
    </el-menu-item> -->

    <!-- 交流与客服：点击弹框，不跳转页面 -->
    <el-menu-item @click="showContactDialog = true">
      <el-icon><Service /></el-icon>
      <template #title>交流与客服</template>
    </el-menu-item>
  </el-menu>

  <!-- 客服弹框：Teleport 到 body，避免侧边栏 transform 影响定位 -->
  <Teleport to="body">
    <el-dialog
      v-model="showContactDialog"
      title="交流与客服"
      width="320px"
      align-center
      :close-on-click-modal="true"
    >
      <div class="contact-content">
        <div class="contact-row title-row">企业微信客服</div>
        <div class="contact-row desc-row">扫码添加企业微信客服，获取咨询与对接支持。</div>
        <div  class="qr-wrapper">
          <img :src="qhyQrCode" alt="企业微信客服二维码" class="qr-image" />
        </div>
      </div>
    </el-dialog>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import {
  Odometer,
  Reading,
  TrendCharts,
  Search,
  Star,
  List,
  Document,
  Setting,
  InfoFilled,
  CreditCard,
  Coin,
  Service,
  Cpu,
  DataAnalysis,
  Wallet,
  ChatDotRound,
} from '@element-plus/icons-vue'
import qhyQrCode from '../../../assets/qhy.png'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const appStore = useAppStore()
const authStore = useAuthStore()

const activeMenu = computed(() => route.path)

const showContactDialog = ref(false)
</script>

<style lang="scss" scoped>
.sidebar-menu {
  border: none;
  height: 100%;

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    height: 48px;
    line-height: 48px;
  }

  // Hover 配色
  :deep(.el-menu-item:not(.is-active):hover),
  :deep(.el-sub-menu__title:hover) {
    background: rgba(6, 182, 212, 0.07) !important;
    color: #0891b2;
  }

  // 激活状态配色
  :deep(.el-menu-item.is-active) {
    background: linear-gradient(90deg, rgba(5, 150, 105, 0.09) 0%, rgba(6, 182, 212, 0.10) 100%) !important;
    color: #059669 !important;
    font-weight: 600;
    position: relative;

    // 左侧青绿指示条
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 20%;
      height: 60%;
      width: 3px;
      background: linear-gradient(180deg, #059669, #06b6d4);
      border-radius: 0 3px 3px 0;
    }

    .el-icon {
      color: #059669 !important;
    }
  }

  // 激活子菜单标题配色
  :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
    color: #059669 !important;
    font-weight: 600;

    .el-icon {
      color: #059669 !important;
    }
  }
}

// 客服弹框内容（Teleport 到 body 后 scoped 不生效，需用 :global）
.contact-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0 16px;

  .contact-row {
    width: 100%;
    text-align: center;
  }

  .title-row {
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 8px;
  }

  .desc-row {
    font-size: 13px;
    color: #64748b;
    line-height: 1.6;
    margin-bottom: 20px;
  }

  .qr-wrapper {
    width: 200px;
    height: 200px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    .qr-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}

@media (max-width: 480px) {
  .contact-content {
    padding: 4px 0 12px;

    .title-row {
      font-size: 16px;
    }

    .desc-row {
      font-size: 12px;
      margin-bottom: 16px;
      padding: 0 8px;
    }

    .qr-wrapper {
      width: 160px;
      height: 160px;
    }
  }
}
</style>
