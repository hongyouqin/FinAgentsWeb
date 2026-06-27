<template>
  <div class="chat-page">
    <!-- 移动端会话列表抽屉 -->
    <el-drawer v-model="showSidebar" direction="ltr" size="300px" :with-header="false" class="chat-drawer">
      <div class="sidebar-content">
        <div class="sidebar-inner">
          <div class="sidebar-header">
            <h4>历史会话</h4>
            <el-button type="primary" size="small" :icon="Plus" @click="showReportPicker = true; showSidebar = false">新对话</el-button>
          </div>
          <div class="sidebar-list">
            <div v-if="loadingList" class="list-loading"><el-icon class="rotating"><Loading /></el-icon> 加载中...</div>
            <div v-else-if="conversations.length === 0" class="list-empty">
              <el-icon><ChatDotRound /></el-icon>
              <span>暂无历史会话</span>
            </div>
            <div v-else v-for="conv in conversations" :key="conv.conversation_id"
              class="conv-item" :class="{ active: conv.conversation_id === currentConversationId }"
              @click="selectConversation(conv)">
              <div class="conv-icon"><el-icon><ChatLineSquare /></el-icon></div>
              <div class="conv-info">
                <div class="conv-title">{{ conv.title || '报告对话' }}</div>
                <div class="conv-time">{{ conv.created_at?.slice(0, 16).replace('T', ' ') || '' }}</div>
              </div>
              <el-button class="conv-del" text size="small" @click.stop="handleDeleteConv(conv)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 左侧会话列表 (PC端) -->
    <aside class="chat-sidebar" :class="{ collapsed: !showSidebarPC }">
      <div class="sidebar-inner">
        <div class="sidebar-header">
          <h4>历史会话</h4>
          <el-button type="primary" size="small" :icon="Plus" @click="showReportPicker = true">新对话</el-button>
        </div>
        <div class="sidebar-list">
          <div v-if="loadingList" class="list-loading"><el-icon class="rotating"><Loading /></el-icon> 加载中...</div>
          <div v-else-if="conversations.length === 0" class="list-empty">
            <el-icon><ChatDotRound /></el-icon>
            <span>暂无历史会话</span>
          </div>
          <div v-else v-for="conv in conversations" :key="conv.conversation_id"
            class="conv-item" :class="{ active: conv.conversation_id === currentConversationId }"
            @click="selectConversation(conv)">
            <div class="conv-icon"><el-icon><ChatLineSquare /></el-icon></div>
            <div class="conv-info">
              <div class="conv-title">{{ conv.title || '报告对话' }}</div>
              <div class="conv-time">{{ conv.created_at?.slice(0, 16).replace('T', ' ') || '' }}</div>
            </div>
            <el-button class="conv-del" text size="small" @click.stop="handleDeleteConv(conv)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </aside>

    <!-- 右侧对话区 -->
    <main class="chat-main">
      <div class="chat-header">
        <div class="header-left">
          <el-button class="sidebar-toggle mobile-only" text @click="showSidebar = true"><el-icon><Operation /></el-icon></el-button>
          <el-button class="sidebar-toggle pc-only" text @click="showSidebarPC = !showSidebarPC"><el-icon><Operation /></el-icon></el-button>
          <h3 class="chat-title">{{ currentTitle || 'AI 报告对话' }}</h3>
        </div>
        <div class="header-right">
          <el-button type="primary" size="small" :icon="Plus" @click="showReportPicker = true">新对话</el-button>
        </div>
      </div>

      <div class="chat-messages" ref="messagesRef">
        <div v-if="!currentConversationId && messages.length === 0" class="empty-state">
          <div class="empty-visual">
            <div class="empty-glow"></div>
            <el-icon class="empty-icon"><ChatDotRound /></el-icon>
          </div>
          <h3>AI 报告对话助手</h3>
          <p>选择一份分析报告，AI 将结合报告内容回答你的深度追问</p>
          <el-button type="primary" size="large" :icon="Plus" @click="showReportPicker = true" class="start-btn">选择报告开始对话</el-button>
          <div class="quick-tips">
            <div class="tip-item"><el-icon><TrendCharts /></el-icon><span>追问报告中的买卖信号逻辑</span></div>
            <div class="tip-item"><el-icon><DataAnalysis /></el-icon><span>让 AI 解释基本面分析结论</span></div>
            <div class="tip-item"><el-icon><QuestionFilled /></el-icon><span>对比不同分析师的观点差异</span></div>
          </div>
        </div>

        <template v-for="(msg, idx) in messages" :key="idx">
          <div class="message-item" :class="msg.role">
            <div class="message-avatar">
              <el-icon v-if="msg.role === 'assistant'"><Monitor /></el-icon>
              <el-icon v-else><User /></el-icon>
            </div>
            <div class="message-bubble">
              <div class="message-content" v-html="renderMarkdown(msg.content)"></div>
              <div class="message-time" v-if="msg.timestamp">{{ formatMsgTime(msg.timestamp) }}</div>
            </div>
          </div>
        </template>

        <div v-if="sending" class="message-item assistant">
          <div class="message-avatar"><el-icon><Monitor /></el-icon></div>
          <div class="message-bubble typing"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
        </div>
      </div>

      <div class="chat-input-area">
        <div class="input-wrapper">
          <el-input v-model="inputText" type="textarea" :autosize="{ minRows: 1, maxRows: 4 }" :placeholder="currentConversationId ? '输入你的问题...' : '请先选择报告开始对话'" :disabled="sending || !currentConversationId" @keydown.enter.exact.prevent="handleSend" resize="none" />
          <el-button class="send-btn" type="primary" :loading="sending" :disabled="!inputText.trim() || sending || !currentConversationId" @click="handleSend" circle><el-icon><Promotion /></el-icon></el-button>
        </div>
      </div>
    </main>

    <!-- 报告选择弹框 -->
    <el-dialog v-model="showReportPicker" title="选择分析报告开始对话" width="540px" align-center destroy-on-close>
      <div class="report-picker">
        <el-input v-model="reportSearch" placeholder="搜索股票代码或名称" :prefix-icon="Search" clearable class="picker-search" />
        <div class="report-list" v-loading="loadingReports">
          <div v-if="filteredReports.length === 0" class="report-empty">暂无已完成的分析报告</div>
          <div v-else v-for="report in filteredReports" :key="report.task_id" class="report-item" @click="startNewChat(report)">
            <div class="report-stock">
              <span class="report-code">{{ report.stock_code || report.stock_symbol }}</span>
              <span class="report-name">{{ report.stock_name }}</span>
            </div>
            <div class="report-meta">
              <span class="report-date">{{ (report.created_at || report.start_time || '').slice(0, 10) }}</span>
              <el-icon class="report-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ChatDotRound, ChatLineSquare, Operation, Delete, QuestionFilled, Monitor, User, Promotion, Plus, Loading, Search, ArrowRight, TrendCharts, DataAnalysis } from '@element-plus/icons-vue'
import chatApi from '@/api/chat'
import { analysisApi } from '@/api/analysis'
import type { ChatMessage, Conversation } from '@/api/chat'
import { marked } from 'marked'

defineOptions({ name: 'ChatHome' })
marked.setOptions({ breaks: true, gfm: true })

const route = useRoute()
const router = useRouter()

const showSidebar = ref(false)
const showSidebarPC = ref(true)
const conversations = ref<Conversation[]>([])
const currentConversationId = ref('')
const currentTitle = ref('')
const messages = ref<ChatMessage[]>([])
const inputText = ref('')
const sending = ref(false)
const loadingList = ref(false)
const messagesRef = ref<HTMLElement | null>(null)
const showReportPicker = ref(false)
const loadingReports = ref(false)
const reportList = ref<any[]>([])
const reportSearch = ref('')

const filteredReports = computed(() => {
  if (!reportSearch.value) return reportList.value
  const k = reportSearch.value.toLowerCase()
  return reportList.value.filter((r: any) => (r.stock_code || '').toLowerCase().includes(k) || (r.stock_name || '').toLowerCase().includes(k) || (r.stock_symbol || '').toLowerCase().includes(k))
})

function renderMarkdown(content: string) { if (!content) return ''; try { return marked(content) as string } catch { return content } }
function formatMsgTime(ts: string) { if (!ts) return ''; return ts.slice(11, 16) }
function scrollToBottom() { nextTick(() => { if (messagesRef.value) messagesRef.value.scrollTop = messagesRef.value.scrollHeight }) }

async function loadConversations() {
  loadingList.value = true
  try { const res = await chatApi.getConversations(30); const data = res.data ?? res; conversations.value = data.conversations || data.items || data || [] }
  catch (e) { console.error('加载会话列表失败:', e) }
  finally { loadingList.value = false }
}

async function selectConversation(conv: Conversation) {
  currentConversationId.value = conv.conversation_id; currentTitle.value = conv.title || '报告对话'; showSidebar.value = false
  await loadMessages(conv.conversation_id)
}

async function loadMessages(convId: string) {
  try {
    const res = await chatApi.getConversationState(convId)
    const data = res.data ?? res
    // 兼容多种返回格式：messages / history / recent_messages
    let msgs = data.messages || data.history || data.recent_messages || []
    // 字段适配：后端可能返回 text_preview / text / content
    messages.value = msgs.map((m: any) => ({
      role: m.role,
      content: m.content || m.text_preview || m.text || '',
      timestamp: m.timestamp || m.created_at || ''
    }))
    scrollToBottom()
  } catch (e) { console.error('加载消息失败:', e) }
}

async function handleSend() {
  const text = inputText.value.trim()
  if (!text || sending.value || !currentConversationId.value) return
  messages.value.push({ role: 'user', content: text, timestamp: new Date().toISOString() })
  inputText.value = ''; scrollToBottom(); sending.value = true
  try {
    const res = await chatApi.sendMessage(currentConversationId.value, text); const data = res.data ?? res
    messages.value.push({ role: 'assistant', content: data.reply || data.content || data.message || data.msg || '', timestamp: new Date().toISOString() })
    scrollToBottom()
  } catch (e: any) { ElMessage.error(e?.message || '发送失败'); messages.value.pop() }
  finally { sending.value = false }
}

async function handleDeleteConv(conv: Conversation) {
  try {
    await ElMessageBox.confirm('确定删除该会话？', '提示', { type: 'warning' })
    await chatApi.deleteConversation(conv.conversation_id); ElMessage.success('已删除')
    if (currentConversationId.value === conv.conversation_id) { currentConversationId.value = ''; currentTitle.value = ''; messages.value = [] }
    loadConversations()
  } catch {}
}

async function loadReports() {
  loadingReports.value = true
  try {
    const res = await analysisApi.getHistory({ page: 1, page_size: 50, status: 'completed' }); const body = (res as any)?.data?.data || (res as any)?.data || {}
    reportList.value = body.tasks || body.analyses || []
    if (reportList.value.length === 0) { const res2 = await analysisApi.getTaskList({ status: 'completed', limit: 50, offset: 0 }); reportList.value = ((res2 as any)?.data?.data || (res2 as any)?.data || {}).tasks || [] }
  } catch (e) { console.error('加载报告列表失败:', e) }
  finally { loadingReports.value = false }
}

async function startNewChat(report: any) {
  const analysisId = report.task_id || report.analysis_id || report.id
  if (!analysisId) return ElMessage.warning('无效的报告ID')
  showReportPicker.value = false
  try {
    const res = await chatApi.startConversation(analysisId); const data = res.data ?? res; const convId = data.conversation_id || data.id
    if (convId) { currentConversationId.value = convId; currentTitle.value = `${report.stock_name || report.stock_code || ''} 报告对话`; messages.value = []; ElMessage.success('对话已创建'); loadConversations() }
  } catch (e: any) { ElMessage.error(e?.message || '创建对话失败') }
}

onMounted(async () => {
  await loadConversations(); await loadReports()
  const convId = route.query.conversation_id as string; const analysisId = route.query.analysis_id as string
  if (convId) { currentConversationId.value = convId; currentTitle.value = '报告对话'; await loadMessages(convId) }
  else if (analysisId) { await startNewChat({ task_id: analysisId, stock_name: route.query.stock_name || '' }) }
})
</script>

<style lang="scss" scoped>
.chat-page { display: flex; height: calc(100vh - 60px); overflow: hidden; background: #f0f9ff; }
.chat-sidebar { width: 300px; background: #fff; border-right: 1px solid #e2e8f0; flex-shrink: 0; overflow: hidden; transition: width 0.3s ease; &.collapsed { width: 0; border: none; } }
.sidebar-inner { height: 100%; display: flex; flex-direction: column; }
.sidebar-header { padding: 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; h4 { margin: 0; font-size: 15px; font-weight: 600; color: #1e293b; } }
.sidebar-list { flex: 1; overflow-y: auto; padding: 8px; }
.list-loading { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 40px 16px; color: #94a3b8; font-size: 13px; .rotating { animation: spin 1s linear infinite; } }
.list-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 48px 16px; color: #94a3b8; font-size: 13px; .el-icon { font-size: 32px; color: #cbd5e1; } }
.conv-item { display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: 10px; cursor: pointer; transition: all 0.2s; margin-bottom: 4px; border: 1px solid transparent;
  &:hover { background: #f1f5f9; .conv-del { opacity: 1; } }
  &.active { background: linear-gradient(135deg, rgba(6,182,212,0.06), rgba(99,102,241,0.06)); border-color: rgba(6,182,212,0.2); }
  .conv-icon { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #e0f2fe, #ede9fe); display: flex; align-items: center; justify-content: center; flex-shrink: 0; .el-icon { color: #6366f1; font-size: 15px; } }
  .conv-info { flex: 1; min-width: 0; }
  .conv-title { font-size: 13px; font-weight: 500; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .conv-time { font-size: 11px; color: #94a3b8; margin-top: 2px; }
  .conv-del { opacity: 0; transition: opacity 0.2s; color: #94a3b8; &:hover { color: #ef4444; } }
}
.chat-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.chat-header { height: 56px; padding: 0 20px; display: flex; align-items: center; justify-content: space-between; background: #fff; border-bottom: 1px solid #e2e8f0; flex-shrink: 0;
  .header-left { display: flex; align-items: center; gap: 8px; }
  .chat-title { margin: 0; font-size: 15px; font-weight: 600; color: #1e293b; }
  .pc-only { display: inline-flex; } .mobile-only { display: none; }
}
.chat-messages { flex: 1; overflow-y: auto; padding: 24px 20px; scroll-behavior: smooth; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 40px 24px;
  .empty-visual { position: relative; margin-bottom: 20px;
    .empty-glow { position: absolute; inset: -20px; border-radius: 50%; background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%); animation: pulse-glow 3s ease-in-out infinite; }
    .empty-icon { font-size: 56px; color: #6366f1; position: relative; z-index: 1; }
  }
  h3 { margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #1e293b; }
  p { margin: 0 0 24px; font-size: 14px; color: #64748b; max-width: 380px; line-height: 1.6; }
  .start-btn { border-radius: 12px; padding: 12px 28px; font-size: 15px; font-weight: 600; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; box-shadow: 0 6px 20px rgba(99,102,241,0.3); &:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(99,102,241,0.4); } }
  .quick-tips { display: flex; flex-direction: column; gap: 10px; margin-top: 28px; width: 100%; max-width: 320px; }
  .tip-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(255,255,255,0.8); border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13px; color: #475569; transition: all 0.2s;
    .el-icon { color: #6366f1; font-size: 16px; flex-shrink: 0; } &:hover { border-color: #c7d2fe; background: #eef2ff; }
  }
}
@keyframes pulse-glow { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }
.message-item { display: flex; gap: 12px; margin-bottom: 20px; max-width: 80%;
  &.user { margin-left: auto; flex-direction: row-reverse; .message-bubble { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border-radius: 16px 16px 4px 16px; } .message-avatar { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; } }
  &.assistant { .message-bubble { background: #fff; color: #334155; border: 1px solid #e2e8f0; border-radius: 16px 16px 16px 4px; } .message-avatar { background: linear-gradient(135deg, #059669, #06b6d4); color: #fff; } }
}
.message-avatar { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px; }
.message-bubble { padding: 12px 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); word-break: break-word; max-width: 100%; overflow: hidden;
  &.typing { display: flex; align-items: center; gap: 4px; padding: 14px 20px; .dot { width: 8px; height: 8px; border-radius: 50%; background: #94a3b8; animation: bounce 1.4s infinite ease-in-out both; &:nth-child(1) { animation-delay: 0s; } &:nth-child(2) { animation-delay: 0.16s; } &:nth-child(3) { animation-delay: 0.32s; } } }
}
@keyframes bounce { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.message-content { font-size: 14px; line-height: 1.7; overflow-wrap: break-word; word-break: break-word;
  :deep(p) { margin: 0 0 8px; &:last-child { margin: 0; } }
  :deep(code) { background: rgba(0,0,0,0.06); padding: 2px 5px; border-radius: 4px; font-size: 13px; word-break: break-all; }
  :deep(pre) { background: #1e293b; color: #e2e8f0; padding: 12px; border-radius: 8px; overflow-x: auto; margin: 8px 0; max-width: 100%; }
  :deep(pre code) { word-break: normal; }
  :deep(table) { border-collapse: collapse; font-size: 13px; display: block; overflow-x: auto; max-width: 100%; }
  :deep(th), :deep(td) { border: 1px solid #e2e8f0; padding: 6px 10px; white-space: nowrap; }
  :deep(ul), :deep(ol) { padding-left: 18px; margin: 6px 0; }
  :deep(img) { max-width: 100%; height: auto; border-radius: 8px; }
}
.message-time { font-size: 11px; color: #94a3b8; margin-top: 6px; }
.chat-input-area { padding: 16px 20px; border-top: 1px solid #e2e8f0; background: #fff; flex-shrink: 0; }
.input-wrapper { display: flex; align-items: flex-end; gap: 10px; max-width: 800px; margin: 0 auto;
  :deep(.el-textarea__inner) { border-radius: 12px; padding: 10px 14px; font-size: 14px; box-shadow: 0 0 0 1px #e2e8f0 inset; transition: box-shadow 0.2s; &:focus { box-shadow: 0 0 0 2px #6366f1 inset; } }
  .send-btn { width: 40px; height: 40px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; flex-shrink: 0; &:hover:not(:disabled) { transform: scale(1.05); } &:disabled { opacity: 0.5; background: #cbd5e1; } }
}
.report-picker { .picker-search { margin-bottom: 12px; } .report-list { max-height: 400px; overflow-y: auto; } .report-empty { padding: 40px; text-align: center; color: #94a3b8; font-size: 13px; }
  .report-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-radius: 10px; cursor: pointer; transition: all 0.2s; border: 1px solid #f1f5f9; margin-bottom: 6px; &:hover { background: #eef2ff; border-color: #c7d2fe; }
    .report-stock { display: flex; align-items: center; gap: 8px; } .report-code { font-weight: 600; font-size: 14px; color: #1e293b; } .report-name { font-size: 13px; color: #64748b; }
    .report-meta { display: flex; align-items: center; gap: 8px; } .report-date { font-size: 12px; color: #94a3b8; } .report-arrow { color: #94a3b8; font-size: 14px; }
  }
}
@media (max-width: 768px) {
  .chat-page { height: calc(100vh - 60px); }
  .chat-sidebar { display: none; }
  .chat-header { padding: 0 12px; .pc-only { display: none; } .mobile-only { display: inline-flex; } }
  .chat-messages { padding: 12px 8px; }
  .message-item { max-width: 95%; }
  .message-avatar { width: 28px; height: 28px; font-size: 13px; }
  .message-bubble { padding: 10px 12px; max-width: calc(100vw - 80px); overflow-x: auto; }
  .message-content {
    font-size: 13px;
    :deep(pre) { font-size: 11px; padding: 8px; max-width: 100%; }
    :deep(table) { font-size: 11px; display: block; overflow-x: auto; max-width: 100%; }
    :deep(img) { max-width: 100%; height: auto; }
  }
  .chat-input-area { padding: 10px 8px; }
  .input-wrapper { gap: 8px;
    :deep(.el-textarea__inner) { font-size: 14px; padding: 8px 12px; }
    .send-btn { width: 36px; height: 36px; }
  }
  .empty-state { padding: 24px 16px; .empty-visual .empty-icon { font-size: 44px; } h3 { font-size: 18px; } p { font-size: 13px; } }
}
.sidebar-content { height: 100%; }
.chat-drawer { :deep(.el-drawer__body) { padding: 0; } }
</style>
