<template>
  <div class="header-actions">
    <!-- 主题切换 -->
    <!-- <el-tooltip content="切换主题" placement="bottom">
      <el-button type="text" @click="toggleTheme" class="action-btn">
        <el-icon>
          <Sunny v-if="appStore.isDarkTheme" />
          <Moon v-else />
        </el-icon>
      </el-button>
    </el-tooltip> -->

    <!-- 全屏切换（移动端隐藏） -->
    <el-tooltip content="全屏" placement="bottom">
      <el-button type="text" @click="toggleFullscreen" class="action-btn fullscreen-btn">
        <el-icon><FullScreen /></el-icon>
      </el-button>
    </el-tooltip>

    <!-- 通知 -->
    <el-tooltip content="通知" placement="bottom">
      <el-badge :value="unreadCount" :hidden="unreadCount === 0">
        <el-button type="text" @click="openDrawer" class="action-btn">
          <el-icon><Bell /></el-icon>
        </el-button>
      </el-badge>
    </el-tooltip>

    <!-- 帮助 -->
    <!-- <el-tooltip content="帮助" placement="bottom">
      <el-button type="text" @click="showHelp" class="action-btn">
        <el-icon><QuestionFilled /></el-icon>
      </el-button>
    </el-tooltip> -->

    <!-- 通知抽屉（方案B） -->
    <el-drawer v-model="drawerVisible" direction="rtl" size="360px" :with-header="true" title="消息中心">
      <div class="notif-toolbar">
        <el-segmented v-model="filter" :options="[{label: '全部', value: 'all'}, {label: '未读', value: 'unread'}]" size="small" />
        <el-button size="small" text type="primary" @click="onMarkAllRead" :disabled="unreadCount===0">全部已读</el-button>
      </div>
      <el-scrollbar max-height="calc(100vh - 160px)">
        <el-empty v-if="items.length===0" description="暂无通知" />
        <div v-else class="notif-list">
          <div v-for="n in items" :key="n.id" class="notif-item" :class="{unread: n.status==='unread'}">
            <div class="row">
              <el-tag :type="tagType(n.type)" size="small">{{ typeLabel(n.type) }}</el-tag>
              <span class="time">{{ toLocal(n.created_at) }}</span>
            </div>
            <div class="title" @click="go(n)">{{ n.title }}</div>
            <div class="content" v-if="n.content">{{ n.content }}</div>
            <div class="ops">
              <el-button size="small" text type="primary" @click="go(n)" :disabled="!n.link">查看</el-button>
              <el-button size="small" text @click="onMarkRead(n)" v-if="n.status==='unread'">标记已读</el-button>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { useNotificationStore } from '@/stores/notifications'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import weixin from '@/utils/weixin'
import {
  Sunny,
  Moon,
  FullScreen,
  Bell,
  QuestionFilled
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const appStore = useAppStore()
const authStore = useAuthStore()
const notifStore = useNotificationStore()
const { unreadCount, items } = storeToRefs(notifStore)
const drawerVisible = ref(false)
const filter = ref<'all' | 'unread'>('all')
let timerCount: any = null
let timerList: any = null

const toggleTheme = () => { appStore.toggleTheme() }
const toggleFullscreen = () => {
  if (document.fullscreenElement) document.exitFullscreen()
  else document.documentElement.requestFullscreen()
}

function openDrawer() {
  drawerVisible.value = true
  notifStore.loadList(filter.value)
}
function onMarkRead(n: any) { notifStore.markRead(n.id) }
function onMarkAllRead() { notifStore.markAllRead() }
function typeLabel(t: string) { return t === 'analysis' ? '分析' : t === 'alert' ? '预警' : '系统' }
function tagType(t: string) { return t === 'analysis' ? 'success' : t === 'alert' ? 'warning' : 'info' }
function toLocal(iso: string) { try { return new Date(iso).toLocaleString() } catch { return iso } }
function go(n: any) {
  if (!n.link) return
  const raw = String(n.link).trim()
  console.log('通知链接:', raw)

  // 仅 http(s):// 开头才算外链；其他（含 `/xx`、`#/xx`、`xx/yy` 这类相对路径）一律按内部路由处理，
  // 避免后端下发 `analysis/report/xxx` 这类无前导斜杠的相对路径被浏览器相对当前路由拼接（出现 /analysis/analysis/xxx）。
  const isExternal = /^https?:\/\//i.test(raw)

  if (isExternal) {
    // 外部链接：判断微信环境
    if (weixin.isWechatEnv()) {
      // 微信环境：在当前窗口打开，避免新窗口触发登录逻辑
      window.location.href = raw
    } else {
      // 非微信环境：新窗口打开
      window.open(raw, '_blank')
    }
    return
  }

  // 内部路由：去掉可能的 `#` 前缀，并强制补齐 `/` 前缀
  let path = raw.replace(/^#/, '')
  if (!path.startsWith('/')) path = '/' + path
  router.push(path)
}

const godetile = (analysis: any) => {
    router.push({
      name: 'AnalysisReport',
      params: { id: analysis.task_id },
      query: {
        symbol: analysis.stock_code || analysis.symbol || '',
        date: analysis.created_at ? analysis.created_at.slice(0, 10) : ''
      }
    })
}

onMounted(() => {
  notifStore.refreshUnreadCount()
  // 🔥 建立 WebSocket 连接（优先），失败自动降级到 SSE
  notifStore.connect()

  timerCount = setInterval(() => notifStore.refreshUnreadCount(), 30000)
  watch(drawerVisible, (v) => {
    if (v) {
      notifStore.loadList(filter.value)
      timerList = setInterval(() => notifStore.loadList(filter.value), 60000)
    } else if (timerList) {
      clearInterval(timerList)
      timerList = null
    }
  }, { immediate: true })
  watch(filter, () => { if (drawerVisible.value) notifStore.loadList(filter.value) })

  // token 变化时重连
  watch(() => authStore.token, () => {
    notifStore.connect()
  })
})

onUnmounted(() => {
  if (timerCount) clearInterval(timerCount)
  if (timerList) clearInterval(timerList)
  // 🔥 断开所有连接（WebSocket 和 SSE）
  notifStore.disconnect()
})

function showHelp() {
  window.open('https://mp.weixin.qq.com/s/ppsYiBncynxlsfKFG8uEbw', '_blank')
}
</script>

<style lang="scss" scoped>
.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;

  .action-btn {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    transition: all 0.2s ease;
    padding: 0;

    &:hover {
      background: rgba(6, 182, 212, 0.09) !important;
      color: #06b6d4;
    }

    &:focus {
      background: transparent;
    }

    .el-icon {
      font-size: 18px;
    }
  }

  // 强制覆盖 el-badge 数字气泡配色
  :deep(.el-badge__content) {
    background: linear-gradient(135deg, #059669, #06b6d4);
    border-color: white;
  }
}

@media (max-width: 768px) {
  .fullscreen-btn {
    display: none !important;
  }
}

// ─── 通知抽屉 ─────────────────────────────────
.notif-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
}

.notif-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notif-item {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  transition: all 0.2s ease;

  &:hover {
    border-color: #a5f3fc;
    box-shadow: 0 2px 10px rgba(6, 182, 212, 0.08);
  }

  &.unread {
    background: linear-gradient(135deg, rgba(5, 150, 105, 0.04), rgba(6, 182, 212, 0.06));
    border-color: #cffafe;
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;

    .time {
      font-size: 11px;
      color: #94a3b8;
    }
  }

  .title {
    font-size: 13px;
    font-weight: 600;
    color: #1e293b;
    cursor: pointer;
    margin-bottom: 4px;
    line-height: 1.4;
    transition: color 0.15s;

    &:hover {
      color: #06b6d4;
    }
  }

  .content {
    font-size: 12px;
    color: #64748b;
    margin-bottom: 6px;
    line-height: 1.4;
  }

  .ops {
    display: flex;
    gap: 6px;
    margin-top: 8px;
  }
}
</style>
