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
        <el-tooltip content="下载图片" placement="bottom">
          <el-button text circle class="toolbar-btn" :loading="downloading" @click="downloadImage">
            <el-icon><Download /></el-icon>
          </el-button>
        </el-tooltip>
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
  ArrowLeft, Document, Refresh, TopRight, Loading, CircleClose, Download
} from '@element-plus/icons-vue'
import { analysisApi } from '@/api/analysis'
import html2canvas from 'html2canvas'

const route = useRoute()
const router = useRouter()

const taskId = computed(() => route.params.id as string)

const loading = ref(false)
const error = ref('')
const htmlContent = ref('')
const iframeRef = ref<HTMLIFrameElement>()
const downloading = ref(false)

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

const downloadImage = async () => {
  if (!htmlContent.value || !iframeRef.value) {
    ElMessage.warning('报告内容尚未加载')
    return
  }

  downloading.value = true
  try {
    // 获取 iframe 的 document
    const iframe = iframeRef.value
    if (!iframe.contentDocument) {
      throw new Error('无法访问报告内容')
    }

    // 创建临时容器渲染 HTML 内容
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.left = '-9999px'
    container.style.top = '0'
    container.style.width = '375px' // 标准手机宽度
    container.style.transform = 'scale(1)'
    container.style.transformOrigin = 'top left'
    container.innerHTML = htmlContent.value

    // 应用样式以确保正确渲染
    const styles = `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #1e293b;
          background: white;
        }
        img {
          max-width: 100%;
          height: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
        }
        th {
          background: #f8fafc;
          font-weight: 600;
        }
      </style>
    `
    container.insertBefore(
      document.createRange().createContextualFragment(styles),
      container.firstChild
    )

    document.body.appendChild(container)

    // 等待内容渲染完成
    await new Promise(resolve => setTimeout(resolve, 100))

    // 使用 html2canvas 生成图片
    const canvas = await html2canvas(container, {
      width: 375,
      windowWidth: 375,
      scale: 2, // Retina 屏幕适配
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 0
    })

    // 移除临时容器
    document.body.removeChild(container)

    // 在 Canvas 底部绘制公众号二维码
    const qrCodeImg = new Image()
    qrCodeImg.crossOrigin = 'anonymous'
    qrCodeImg.src = '/assets/qrcodes.jpg'

    await new Promise((resolve, reject) => {
      qrCodeImg.onload = resolve
      qrCodeImg.onerror = reject
    })

    // 计算二维码尺寸（适配 375px 宽度）
    const footerHeight = 240 // 底部区域总高度（增加留白）
    const qrSize = 130 // 二维码正方形尺寸
    const padding = 30 // 左右边距
    const spacing = 20 // 元素间距

    // 创建新的 Canvas，增加底部空间
    const newCanvas = document.createElement('canvas')
    const ctx = newCanvas.getContext('2d')!
    newCanvas.width = canvas.width
    newCanvas.height = canvas.height + footerHeight

    // 绘制原始内容
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, newCanvas.width, newCanvas.height)
    ctx.drawImage(canvas, 0, 0)

    // 绘制渐变背景
    const gradient = ctx.createLinearGradient(0, canvas.height, 0, newCanvas.height)
    gradient.addColorStop(0, '#f8fafc')
    gradient.addColorStop(1, '#f1f5f9')
    ctx.fillStyle = gradient
    ctx.fillRect(0, canvas.height, newCanvas.width, footerHeight)

    // 绘制装饰线（顶部）
    const lineGradient = ctx.createLinearGradient(padding, canvas.height, newCanvas.width - padding, canvas.height)
    lineGradient.addColorStop(0, 'rgba(6, 182, 212, 0)')
    lineGradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.3)')
    lineGradient.addColorStop(1, 'rgba(6, 182, 212, 0)')
    ctx.strokeStyle = lineGradient
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(padding, canvas.height)
    ctx.lineTo(newCanvas.width - padding, canvas.height)
    ctx.stroke()

    // 绘制二维码圆角边框背景
    const qrX = (newCanvas.width - qrSize) / 2
    const qrY = canvas.height + 20 // 增加顶部间距
    const qrRadius = 12 // 圆角半径
    
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.roundRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, qrRadius)
    ctx.fill()
    
    // 绘制阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 2
    
    // 绘制二维码（保持原图比例）
    const actualQrHeight = (qrCodeImg.height / qrCodeImg.width) * qrSize
    ctx.drawImage(qrCodeImg, qrX, qrY, qrSize, actualQrHeight)
    
    // 重置阴影
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    // 绘制主标题
    ctx.fillStyle = '#1e293b'
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
    ctx.textAlign = 'center'
    ctx.fillText('获取更多专业分析', newCanvas.width / 2, qrY + actualQrHeight + 32)

    // 绘制副标题
    ctx.fillStyle = '#64748b'
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
    ctx.textAlign = 'center'
    ctx.fillText('扫描二维码关注公众号', newCanvas.width / 2, qrY + actualQrHeight + 52)

    // 绘制装饰图标（可选）
    ctx.font = '16px Arial'
    ctx.fillText('✨', newCanvas.width / 2 - 80, qrY + actualQrHeight + 54)
    ctx.fillText('✨', newCanvas.width / 2 + 80, qrY + actualQrHeight + 54)

    // 下载图片
    newCanvas.toBlob((blob: Blob | null) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `分析报告_${taskId.value}_${new Date().getTime()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        ElMessage.success('图片下载成功')
      }
    }, 'image/png')
  } catch (e: any) {
    console.error('下载失败:', e)
    ElMessage.error(e?.message || '下载图片失败，请重试')
  } finally {
    downloading.value = false
  }
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
