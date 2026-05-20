<template>
  <div class="header-actions">
    <!-- 签到入口 -->
    <el-popover
      :visible="signGuideVisible"
      placement="bottom-end"
      :width="260"
      :show-arrow="true"
      popper-class="sign-guide-popover"
      :teleported="true"
    >
      <template #reference>
        <span class="sign-btn-wrap">
          <el-tooltip
            v-if="!signGuideVisible"
            :content="signTooltip"
            placement="bottom"
          >
            <button
              class="action-btn sign-btn-entry"
              :class="{ signed: signStore.signed, 'has-guide': needsSignAttention }"
              @click="handleSignBtnClick"
            >
              <el-icon class="sign-icon"><Calendar /></el-icon>
              <span v-if="signStore.signed" class="sign-checked-badge">✓</span>
              <span v-if="needsSignAttention" class="guide-dot" />
            </button>
          </el-tooltip>
          <button
            v-else
            class="action-btn sign-btn-entry"
            :class="{ signed: signStore.signed, 'has-guide': needsSignAttention }"
            @click="handleSignBtnClick"
          >
            <el-icon class="sign-icon"><Calendar /></el-icon>
            <span v-if="signStore.signed" class="sign-checked-badge">✓</span>
            <span v-if="needsSignAttention" class="guide-dot" />
          </button>
        </span>
      </template>
      <div class="sign-guide-card">
        <div class="guide-head">
          <el-icon class="guide-head-icon"><Present /></el-icon>
          <span class="guide-head-title">每日签到领算力</span>
          <button class="guide-close" @click="dismissSignGuide">
            <el-icon><Close /></el-icon>
          </button>
        </div>
        <div class="guide-body">
          点击这里可领取 <strong>1.5</strong> 算力，每天都能领，别忘了哦 ~
        </div>
        <div class="guide-actions">
          <button class="btn-ghost" @click="dismissSignGuide">下次再说</button>
          <button class="btn-primary" @click="goSignFromGuide">立即签到</button>
        </div>
      </div>
    </el-popover>

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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { useNotificationStore } from '@/stores/notifications'
import { useAuthStore } from '@/stores/auth'
import { useSignStore } from '@/stores/sign'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import weixin from '@/utils/weixin'
import {
  Sunny,
  Moon,
  FullScreen,
  Bell,
  QuestionFilled,
  Calendar,
  Present,
  Close
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const appStore = useAppStore()
const authStore = useAuthStore()
const notifStore = useNotificationStore()
const signStore = useSignStore()
const { unreadCount, items } = storeToRefs(notifStore)
const drawerVisible = ref(false)
const filter = ref<'all' | 'unread'>('all')
let timerCount: any = null
let timerList: any = null

// ─── 签到引导气泡 ──────────────────────────────────────
const signGuideVisible = ref(false)
let signGuideAutoHideTimer: any = null

/** 只要未签到且今日可签 → 持续显示红点+抖动 */
const needsSignAttention = computed(() => {
  if (!authStore.token) return false
  if (!signStore.initialized) return false
  if (signStore.isBalanceSufficient) return false
  return !signStore.signed && signStore.canSign
})

/** 签到按钮 tooltip 文案 */
const signTooltip = computed(() => {
  if (signStore.signed) return '今日已签到'
  if (signStore.isBalanceSufficient) return `余额充足（≥ ${signStore.balanceThreshold} 算力），请先使用后再来领取`
  if (signStore.canSign) return '签到领算力'
  return '签到'
})

/** localStorage key：同一用户同一天只引导一次 */
const getSignGuideKey = () => {
  const u: any = (authStore as any).user || {}
  const uid = u.user_id || u.id || u.username || 'anon'
  return `finagents_sign_guide_${uid}`
}

/** 检查并触发签到引导气泡 */
const tryShowSignGuide = () => {
  // 未登录不引导
  if (!authStore.token) return
  // 弹窗已打开 → 不重复引导
  if (signStore.dialogVisible) return
  // 已签到 → 不引导
  if (signStore.signed) return
  // 余额已达阈值 → 不引导（成本控制）
  if (signStore.isBalanceSufficient) return
  // 今日不可签到 → 不引导
  if (!signStore.canSign) return
  // 今日已引导过 → 不重复
  try {
    const today = new Date().toISOString().slice(0, 10)
    const lastShown = localStorage.getItem(getSignGuideKey())
    if (lastShown === today) return
    localStorage.setItem(getSignGuideKey(), today)
  } catch (e) { /* localStorage 不可用时忽略 */ }

  // 延迟一点，错开页面加载
  setTimeout(() => {
    if (signStore.signed || signStore.dialogVisible) return
    signGuideVisible.value = true
    // 12s 后自动关闭
    if (signGuideAutoHideTimer) clearTimeout(signGuideAutoHideTimer)
    signGuideAutoHideTimer = setTimeout(() => {
      signGuideVisible.value = false
    }, 12000)
  }, 1200)
}

const dismissSignGuide = () => {
  signGuideVisible.value = false
  if (signGuideAutoHideTimer) {
    clearTimeout(signGuideAutoHideTimer)
    signGuideAutoHideTimer = null
  }
}

const goSignFromGuide = () => {
  dismissSignGuide()
  signStore.openDialog()
}

const handleSignBtnClick = () => {
  // 点击按钮时如果气泡在开 → 一起关掉
  if (signGuideVisible.value) dismissSignGuide()
  signStore.openDialog()
}

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

  // 初始化签到状态
  if (authStore.isAuthenticated) {
    signStore.fetchStatus().then(() => {
      tryShowSignGuide()
    })
  }

  timerCount = setInterval(() => notifStore.refreshUnreadCount(), 30000)
  watch(drawerVisible, (v: boolean) => {
    // 🔥 P0 修复：watch 回调中创建 setInterval 前，必须先清理上一轮 timer，
    // 否则抽屉被频繁开合时旧 interval 无法回收，会累积成多重轮询。
    if (timerList) {
      clearInterval(timerList)
      timerList = null
    }
    if (v) {
      notifStore.loadList(filter.value)
      timerList = setInterval(() => notifStore.loadList(filter.value), 60000)
    }
  }, { immediate: true })
  watch(filter, () => { if (drawerVisible.value) notifStore.loadList(filter.value) })

  // token 变化时重连
  watch(() => authStore.token, (newToken) => {
    notifStore.connect()
    // 登录时初始化签到状态
    if (newToken) {
      signStore.fetchStatus().then(() => {
        tryShowSignGuide()
      })
    } else {
      signStore.reset()
      // 登出后重置引导气泡
      dismissSignGuide()
    }
  })
})

onUnmounted(() => {
  if (timerCount) clearInterval(timerCount)
  if (timerList) clearInterval(timerList)
  if (signGuideAutoHideTimer) clearTimeout(signGuideAutoHideTimer)
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
    background: none;
    border: none;
    cursor: pointer;

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

  // ─── 签到入口 ──────────────────────────────────
  .sign-btn-wrap {
    display: inline-flex;
  }

  .sign-btn-entry {
    position: relative;

    .sign-icon {
      font-size: 20px;
      line-height: 1;
    }

    // 已签到角标（右下角绿色小圆 + 勾选）
    .sign-checked-badge {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #22c55e;
      color: white;
      font-size: 10px;
      font-weight: 700;
      line-height: 14px;
      text-align: center;
      box-shadow: 0 0 0 2px var(--header-bg, #fff), 0 2px 6px rgba(34, 197, 94, 0.4);
      animation: badgePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes badgePop {
      0% { transform: scale(0); opacity: 0; }
      60% { transform: scale(1.2); }
      100% { transform: scale(1); opacity: 1; }
    }

    &.signed {
      // 已签到状态不改变主图标颜色，仅右下角标示意
    }

    // 引导红点
    .guide-dot {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ef4444;
      animation: guidePulse 2s ease-in-out infinite;
    }

    &.has-guide {
      animation: guideShake 2.5s ease-in-out infinite;
    }
  }

  // 强制覆盖 el-badge 数字气泡配色
  :deep(.el-badge__content) {
    background: linear-gradient(135deg, #059669, #06b6d4);
    border-color: white;
  }
}

@keyframes guidePulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.6; transform: scale(1.3); }
}

@keyframes guideShake {
  0%, 85%, 100% { transform: rotate(0deg); }
  88%  { transform: rotate(-8deg); }
  91%  { transform: rotate(8deg); }
  94%  { transform: rotate(-6deg); }
  97%  { transform: rotate(6deg); }
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

<!-- 签到引导气泡样式（popover 在 body 下，需非 scoped） -->
<style lang="scss">
.sign-guide-popover.el-popover.el-popper {
  padding: 0 !important;
  border-radius: 14px !important;
  border: none !important;
  background: linear-gradient(135deg, #ffffff, #f0fdfa) !important;
  box-shadow: 0 12px 36px rgba(6, 182, 212, 0.18), 0 4px 12px rgba(0, 0, 0, 0.06) !important;
  overflow: hidden;
  animation: signGuideFadeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);

  .el-popper__arrow::before {
    background: #ffffff !important;
    border-color: transparent !important;
  }

  .sign-guide-card {
    padding: 14px 16px 16px;

    .guide-head {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;

      .guide-head-icon {
        font-size: 22px;
        color: #f59e0b;
        animation: guideGiftBounce 1.4s ease-in-out infinite;
      }

      .guide-head-title {
        flex: 1;
        font-size: 15px;
        font-weight: 700;
        color: #1e293b;
      }

      .guide-close {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: none;
        background: rgba(100, 116, 139, 0.08);
        color: #94a3b8;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        font-size: 12px;

        &:hover {
          background: rgba(100, 116, 139, 0.15);
          color: #475569;
        }
      }
    }

    .guide-body {
      font-size: 13px;
      color: #475569;
      line-height: 1.6;
      margin-bottom: 12px;

      strong {
        color: #f59e0b;
        font-weight: 800;
        font-size: 15px;
        margin: 0 2px;
      }
    }

    .guide-actions {
      display: flex;
      gap: 8px;

      button {
        flex: 1;
        height: 32px;
        border-radius: 8px;
        border: none;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-ghost {
        background: rgba(100, 116, 139, 0.08);
        color: #64748b;

        &:hover {
          background: rgba(100, 116, 139, 0.15);
        }
      }

      .btn-primary {
        background: linear-gradient(135deg, #06b6d4, #0891b2);
        color: white;
        box-shadow: 0 2px 8px rgba(6, 182, 212, 0.3);

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
        }
      }
    }
  }
}

@keyframes signGuideFadeIn {
  0% { opacity: 0; transform: translateY(-8px) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes guideGiftBounce {
  0%, 100% { transform: translateY(0) rotate(0); }
  25% { transform: translateY(-3px) rotate(-8deg); }
  75% { transform: translateY(-3px) rotate(8deg); }
}
</style>
