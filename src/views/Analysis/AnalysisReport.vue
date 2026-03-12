<template>
  <div class="analysis-report-page">
    <!-- 顶部工具栏 -->
    <div class="report-toolbar">
      <div class="toolbar-left">
        <el-button text class="back-btn" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </el-button>
        <div class="toolbar-divider"></div>
        <div class="report-meta">
          <el-icon class="meta-icon"><Document /></el-icon>
          <span class="report-id">{{ taskId }}</span>
          <el-tag v-if="taskInfo.symbol" size="small" class="symbol-tag">
            {{ taskInfo.symbol }}
          </el-tag>
          <el-tag v-if="taskInfo.date" size="small" type="info" class="date-tag">
            {{ taskInfo.date }}
          </el-tag>
        </div>
      </div>
      <div class="toolbar-right">
        <el-tooltip content="刷新报告" placement="bottom">
          <el-button text circle class="toolbar-btn" :loading="loading" @click="loadReport">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="在新窗口打开" placement="bottom">
          <el-button text circle class="toolbar-btn" @click="openInNewTab">
            <el-icon><TopRight /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-card">
        <div class="loading-icon">
          <el-icon class="rotating"><Loading /></el-icon>
        </div>
        <p class="loading-text">正在加载分析报告...</p>
        <p class="loading-sub">{{ taskId }}</p>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <div class="error-card">
        <el-icon class="error-icon"><CircleClose /></el-icon>
        <h3>加载失败</h3>
        <p class="error-msg">{{ error }}</p>
        <div class="error-actions">
          <el-button @click="goBack">返回</el-button>
          <el-button type="primary" @click="loadReport">重试</el-button>
        </div>
      </div>
    </div>

    <!-- 报告内容 -->
    <div v-else-if="htmlContent" class="report-content">
      <iframe
        ref="iframeRef"
        class="report-iframe"
        sandbox="allow-same-origin allow-scripts allow-popups"
        :srcdoc="htmlContent"
        @load="onIframeLoad"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, Document, Refresh, TopRight, Loading, CircleClose
} from '@element-plus/icons-vue'
import { analysisApi } from '@/api/analysis'

const route = useRoute()
const router = useRouter()

const taskId = computed(() => route.params.id as string)

const loading = ref(false)
const error = ref('')
const htmlContent = ref('')
const iframeRef = ref<HTMLIFrameElement>()

// 从 URL query 中读取展示元信息（可选）
const taskInfo = ref({
  symbol: route.query.symbol as string || '',
  date: route.query.date as string || ''
})

const loadReport = async () => {
  if (!taskId.value) {
    error.value = '缺少任务 ID'
    return
  }
  loading.value = true
  error.value = ''
  htmlContent.value = ''
  try {
    const html = await analysisApi.getSimplifiedHtml(taskId.value)
    if (typeof html === 'string' && html.trim()) {
      htmlContent.value = html
    } else {
      error.value = '报告内容为空，请稍后重试'
    }
  } catch (e: any) {
    error.value = e?.message || '获取报告失败，请稍后重试'
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}

const onIframeLoad = () => {
  // 自动调整 iframe 高度以适应内容
  const iframe = iframeRef.value
  if (iframe?.contentDocument) {
    try {
      const height = iframe.contentDocument.body?.scrollHeight
      if (height && height > 200) {
        iframe.style.height = `${height + 32}px`
      }
    } catch {
      // 跨域时忽略
    }
  }
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/analysis/single')
  }
}

const openInNewTab = () => {
  if (!htmlContent.value) return
  const blob = new Blob([htmlContent.value], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

onMounted(() => {
  loadReport()
})
</script>

<style lang="scss" scoped>
@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.analysis-report-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f0f9ff;
}

// ─── 工具栏 ───────────────────────────────────
.report-toolbar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 52px;
  background: white;
  border-bottom: 1px solid #e8f4fd;
  box-shadow: 0 2px 12px rgba(6, 182, 212, 0.06);
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.back-btn {
  color: #475569;
  font-size: 14px;
  flex-shrink: 0;

  &:hover {
    color: #06b6d4;
    background: rgba(6, 182, 212, 0.07);
  }

  .el-icon {
    font-size: 15px;
  }
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: #e2e8f0;
  flex-shrink: 0;
}

.report-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  overflow: hidden;

  .meta-icon {
    color: #06b6d4;
    font-size: 15px;
    flex-shrink: 0;
  }

  .report-id {
    font-size: 13px;
    color: #64748b;
    font-family: monospace;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 240px;
  }

  .symbol-tag {
    border-color: #a5f3fc;
    background: #ecfeff;
    color: #0891b2;
    flex-shrink: 0;
  }

  .date-tag {
    flex-shrink: 0;
  }
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.toolbar-btn {
  width: 32px;
  height: 32px;
  color: #64748b;

  &:hover {
    color: #06b6d4;
    background: rgba(6, 182, 212, 0.07) !important;
  }

  .el-icon {
    font-size: 16px;
  }
}

// ─── 加载状态 ──────────────────────────────────
.loading-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 64px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  border: 1px solid #e0f2fe;

  .loading-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(5, 150, 105, 0.1), rgba(6, 182, 212, 0.12));
    display: flex;
    align-items: center;
    justify-content: center;

    .el-icon {
      font-size: 28px;
      color: #06b6d4;
    }
  }

  .loading-text {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }

  .loading-sub {
    font-size: 12px;
    color: #94a3b8;
    font-family: monospace;
    margin: 0;
  }
}

// ─── 错误状态 ──────────────────────────────────
.error-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.error-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 64px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  border: 1px solid #fee2e2;

  .error-icon {
    font-size: 48px;
    color: #ef4444;
  }

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
  }

  .error-msg {
    margin: 0;
    font-size: 14px;
    color: #64748b;
    text-align: center;
    max-width: 360px;
  }

  .error-actions {
    display: flex;
    gap: 12px;
    margin-top: 4px;
  }
}

// ─── 报告内容 ──────────────────────────────────
.report-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.report-iframe {
  flex: 1;
  width: 100%;
  min-height: calc(100vh - 120px);
  border: none;
  border-radius: 16px;
  background: white;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  display: block;
}

// ─── 响应式 ───────────────────────────────────
@media (max-width: 768px) {
  .report-toolbar {
    padding: 0 12px;
  }

  .report-meta .report-id {
    max-width: 120px;
  }

  .report-content {
    padding: 12px;
  }

  .report-iframe {
    min-height: calc(100vh - 100px);
    border-radius: 12px;
  }

  .loading-card,
  .error-card {
    padding: 32px 24px;
    width: 100%;
  }
}
</style>
