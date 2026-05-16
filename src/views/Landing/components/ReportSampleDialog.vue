<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ApiClient } from '@/api/request'

interface SlotImage {
  slot: number
  url: string | null
}

const emit = defineEmits<{
  (e: 'cta'): void
}>()

const loading = ref(false)
const errorMsg = ref('')
const images = ref<SlotImage[]>([])
const activeIndex = ref(0)
const previewVisible = ref(false)

// 拼接 API base 路径（图片资源走后端）
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
const resolveUrl = (url: string | null) => {
  if (!url) return ''
  if (/^https?:\/\//.test(url)) return url
  return apiBaseUrl + url
}

// 仅保留 url 非空的样本；图会换，不再绑定具体股票元数据
interface ReadyItem {
  slot: number
  url: string
  label: string
}
const readyItems = computed<ReadyItem[]>(() =>
  images.value
    .filter((it: SlotImage) => !!it.url)
    .map((it: SlotImage, idx: number) => ({
      slot: it.slot,
      url: resolveUrl(it.url as string),
      label: `样本 ${idx + 1}`,
    })),
)

const currentItem = computed<ReadyItem | null>(
  () => readyItems.value[activeIndex.value] || readyItems.value[0] || null,
)
const currentImage = computed(() => currentItem.value?.url || '')
const previewList = computed(() => readyItems.value.map((it: ReadyItem) => it.url))

const fetchTemplates = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    // 注意：后端路由带尾斜杠（Django/DRF 风格），丢了会 308 重定向并可能触发 CORS 失败
    const res = await ApiClient.get<{ images: SlotImage[] }>('/api/report-template/', undefined, {
      skipAuth: true,
      skipErrorHandler: true,
    })
    const list = (res?.data?.images || []) as SlotImage[]
    images.value = list
    activeIndex.value = 0
  } catch (e: any) {
    console.error('[ReportSampleDialog] fetch error', e)
    errorMsg.value = '样本加载失败，请稍后再试'
  } finally {
    loading.value = false
  }
}

// 区块直接展示，挂载即拉取（无需用户点击）
onMounted(() => {
  fetchTemplates()
})

// 鼠标跟随蒙层：在 rsd-image-wrap 内移动小胶囊
const spotlightX = ref(0)
const spotlightY = ref(0)
const spotlightShow = ref(false)
const onImgMove = (e: MouseEvent) => {
  const el = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  // 以鼠标点为锚点，胶囊用 transform 居中再偏移
  spotlightX.value = e.clientX - rect.left
  spotlightY.value = e.clientY - rect.top + el.scrollTop
}
const onImgEnter = () => { spotlightShow.value = true }
const onImgLeave = () => { spotlightShow.value = false }

const handleCta = () => {
  emit('cta')
}
</script>

<template>
  <section id="report-sample-section" class="report-sample-section">
    <div class="rsd-inner">
      <!-- 标题区：纯文本 hero，与首页背景融为一体 -->
      <header class="rsd-header">
        <span class="rsd-eyebrow">
          <span class="eyebrow-dot" />
          REAL OUTPUT · 真实样本
        </span>
        <h2 class="rsd-title">
          看看 AI 给不同股票写的<span class="hl">专属研报</span>
        </h2>
        <p class="rsd-sub">
          以下是平台对不同 A 股标的输出的同款研报样本 · 7 个智能体协作产出 · 多空辩论 · 中文研报 PDF。
          <br class="rsd-br" />
          登录后即可输入你关心的股票，生成同款。
        </p>
      </header>

      <!-- 样本切换：仅渲染 url 非空的项，多个则展示切换 chip -->
      <div
        v-if="readyItems.length > 1"
        class="rsd-stocks"
        role="tablist"
      >
        <button
          v-for="(item, idx) in readyItems"
          :key="item.slot"
          class="stock-chip"
          :class="{ active: activeIndex === idx }"
          role="tab"
          :aria-selected="activeIndex === idx"
          @click="activeIndex = idx"
        >
          <span class="chip-dot" />
          <span class="chip-name">{{ item.label }}</span>
        </button>
      </div>

      <!-- 预览区 -->
      <div class="rsd-preview">
        <!-- 加载中 -->
        <div v-if="loading" class="rsd-skeleton">
          <div class="sk-bar w70" />
          <div class="sk-bar w50" />
          <div class="sk-block" />
          <div class="sk-bar w90" />
          <div class="sk-bar w60" />
        </div>

        <!-- 错误 -->
        <div v-else-if="errorMsg" class="rsd-state">
          <svg
            class="state-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div class="state-title">{{ errorMsg }}</div>
          <button class="state-btn ghost" @click="fetchTemplates">重新加载</button>
        </div>

        <!-- 全部 url 都为空 -->
        <div v-else-if="readyItems.length === 0" class="rsd-state">
          <svg
            class="state-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <div class="state-title">样本正在准备中</div>
          <div class="state-sub">不如直接登录，立刻生成你自己的研报</div>
          <button class="state-btn primary" @click="handleCta">
            立即免费体验完整报告
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

        <!-- 正常预览：单图或多图都走这里 -->
        <div
          v-else
          class="rsd-image-wrap"
          @mousemove="onImgMove"
          @mouseenter="onImgEnter"
          @mouseleave="onImgLeave"
          @click="previewVisible = true"
        >
          <img :src="currentImage" alt="AI 研报样本" class="rsd-image" />

          <!-- 鼠标跟随的"点击放大"胶囊 -->
          <div
            v-show="spotlightShow"
            class="rsd-spotlight"
            :style="{ transform: `translate3d(${spotlightX}px, ${spotlightY}px, 0)` }"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            <span>点击放大查看高清大图</span>
          </div>

          <div class="rsd-image-watermark">SAMPLE · 仅供研究</div>
        </div>

        <!-- 全屏图片预览 -->
        <el-image-viewer
          v-if="previewVisible && currentImage"
          :url-list="previewList"
          :initial-index="readyItems.findIndex(it => it.url === currentImage)"
          teleported
          @close="previewVisible = false"
        />
      </div>

      <!-- 信任三件套 inline -->
      <div class="rsd-trust">
        <span class="trust-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          仅供研究 · 不构成投资建议
        </span>
        <span class="trust-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          单只股票 ≈ 10min 出报告
        </span>
        <span class="trust-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12l3 3 5-6" />
          </svg>
          注册即送算力 · 立即试用
        </span>
      </div>

      <!-- CTA -->
      <div class="rsd-footer">
        <button class="rsd-cta" @click="handleCta">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6L12 2z" />
          </svg>
          <span>立即免费生成我的专属报告</span>
          <svg class="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
/* 区块样式：与 Landing 整体背景融合，无卡片壳 */
.report-sample-section {
  --rsd-cyan: #06b6d4;
  --rsd-emerald: #10b981;
  --rsd-gold: #fbbf24;

  position: relative;
  width: 100%;
  padding: 80px 24px 0px;
  // background: #0f172a; /* 与 Landing 同色，无视觉断层 */

  /* 顶部一道渐隐青光做柔分隔（不是粗硬边框） */
  // &::before {
  //   content: '';
  //   position: absolute;
  //   inset: 0 0 auto 0;
  //   height: 1px;
  //   background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.35), transparent);
  // }
}

.rsd-inner {
  max-width: 1100px;
  margin: 0 auto;
}

/* 头部居中文本 */
.rsd-header {
  text-align: center;
  margin-bottom: 28px;
}
.rsd-eyebrow {
  display: inline-flex;
  align-items: center;
     gap: 0.5rem;
    padding: 0.5rem 1rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: var(--rsd-cyan);
  background: rgba(6, 182, 212, 0.08);
  border: 1px solid rgba(6, 182, 212, 0.25);
  border-radius: 100px;;
    font-size: 0.875rem;
    color: #06b6d4;
    margin-bottom: 2.5rem;

  .eyebrow-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--rsd-emerald), var(--rsd-cyan));
    animation: rsd-dot 1.6s ease-in-out infinite;
  }
}
@keyframes rsd-dot {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  50%      { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
}
.rsd-title {
  font-size: 30px;
  font-weight: 800;
  color: #f1f5f9;
  margin: 0 0 12px;
  letter-spacing: -0.01em;
  line-height: 1.25;
  .hl {
    background: linear-gradient(135deg, var(--rsd-emerald), var(--rsd-cyan));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}
.rsd-sub {
  font-size: 14px;
  color: #94a3b8;
  line-height: 1.7;
  max-width: 720px;
  margin: 0 auto;
}

/* 样本切换 chip：通用化（样本 1/2/3...） */
.rsd-stocks {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.stock-chip {
  all: unset;
  cursor: pointer;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border-radius: 100px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.25s ease;
  color: #cbd5e1;
  white-space: nowrap;

  .chip-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(148, 163, 184, 0.5);
    transition: all 0.25s ease;
  }
  .chip-name {
    font-size: 13px;
    font-weight: 600;
    color: #e2e8f0;
    letter-spacing: 0.02em;
  }

  &:hover {
    background: rgba(30, 41, 59, 0.7);
    border-color: rgba(6, 182, 212, 0.3);
    transform: translateY(-1px);
  }
  &.active {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(6, 182, 212, 0.18));
    border-color: rgba(6, 182, 212, 0.6);
    box-shadow: 0 6px 20px rgba(6, 182, 212, 0.18);
    .chip-dot {
      background: linear-gradient(135deg, var(--rsd-emerald), var(--rsd-cyan));
      box-shadow: 0 0 8px rgba(6, 182, 212, 0.6);
    }
    .chip-name { color: #f1f5f9; }
    /* 选中态指向预览图的小三角 */
    // &::after {
    //   content: '';
    //   position: absolute;
    //   left: 50%;
    //   bottom: -7px;
    //   width: 12px;
    //   height: 12px;
    //   transform: translateX(-50%) rotate(45deg);
    //   background: linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(6, 182, 212, 0.18));
    //   border-right: 1px solid rgba(6, 182, 212, 0.6);
    //   border-bottom: 1px solid rgba(6, 182, 212, 0.6);
    // }
  }
}

/* 预览区：保留圆角和淡边框，但去掉重的卡片感 */
.rsd-preview {
  position: relative;
  border-radius: 16px;
  background: rgba(2, 6, 23, 0.6);
  border: 1px solid rgba(6, 182, 212, 0.2);
  overflow: hidden;
  min-height: 420px;
  width: 60%;
  margin: 0 auto;
  display: flex;
  align-items: stretch;
  justify-content: center;
  margin-bottom: 26px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
}
.rsd-image-wrap {
  position: relative;
  width: 100%;
  cursor: zoom-in;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: #0a0f1c;
  max-height: 640px;
  overflow-y: auto;
  overflow-x: hidden;

  &:hover .rsd-image { transform: scale(1.005); }
}
.rsd-image {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.4s ease;
  /* 防止 spotlight 抢占指针事件 */
  pointer-events: auto;
}

/* 鼠标跟随的"点击放大"胶囊 */
.rsd-spotlight {
  position: absolute;
  top: 0;
  left: 0;
  /* 用 transform 移动整体；再用 margin 偏移让胶囊定位在鼠标右下 */
  margin-left: 14px;
  margin-top: 14px;
  pointer-events: none; /* 不抢 click，让 wrap 能接到放大事件 */
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 100px;
  background: rgba(2, 6, 23, 0.85);
  border: 1px solid rgba(6, 182, 212, 0.5);
  backdrop-filter: blur(6px);
  color: #f1f5f9;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.4), 0 0 0 4px rgba(6, 182, 212, 0.08);
  z-index: 3;
  transition: opacity 0.18s ease;

  svg {
    width: 14px;
    height: 14px;
    color: var(--rsd-cyan);
  }
}

.rsd-image-watermark {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 10px;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.45);
  background: rgba(0, 0, 0, 0.4);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(4px);
  pointer-events: none;
  z-index: 2;
}

.rsd-skeleton {
  width: 100%;
  padding: 36px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  .sk-bar {
    height: 14px;
    border-radius: 6px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.04));
    background-size: 200% 100%;
    animation: sk-shine 1.4s linear infinite;
  }
  .w50 { width: 50%; }
  .w60 { width: 60%; }
  .w70 { width: 70%; }
  .w80 { width: 80%; }
  .w90 { width: 90%; }
  .sk-block {
    height: 220px;
    border-radius: 10px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
    background-size: 200% 100%;
    animation: sk-shine 1.6s linear infinite;
  }
}
@keyframes sk-shine {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.rsd-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  .state-icon {
    width: 48px;
    height: 48px;
    color: rgba(6, 182, 212, 0.6);
    margin-bottom: 14px;
  }
  .state-title { color: #e2e8f0; font-size: 15px; font-weight: 600; margin-bottom: 6px; }
  .state-sub { color: #94a3b8; font-size: 13px; margin-bottom: 18px; }
  .state-btn {
    all: unset;
    cursor: pointer;
    padding: 10px 22px;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.25s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    svg { width: 14px; height: 14px; }
    &.primary {
      background: linear-gradient(135deg, var(--rsd-emerald), var(--rsd-cyan));
      color: #fff;
      &:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(6, 182, 212, 0.4); }
    }
    &.ghost {
      background: rgba(6, 182, 212, 0.12);
      border: 1px solid rgba(6, 182, 212, 0.4);
      color: var(--rsd-cyan);
      &:hover { background: rgba(6, 182, 212, 0.2); }
    }
  }
}

/* 信任三件套 inline 排列，纯文本贴近 footer */
.rsd-trust {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 24px;
  .trust-row {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    color: #94a3b8;
    svg {
      width: 14px;
      height: 14px;
      color: var(--rsd-emerald);
      flex-shrink: 0;
    }
  }
}

/* CTA */
.rsd-footer {
  display: flex;
  justify-content: center;
}
.rsd-cta {
  all: unset;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  border-radius: 100px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #422006;
  font-weight: 700;
  font-size: 15px;
  box-shadow: 0 12px 28px rgba(251, 191, 36, 0.4);
  transition: all 0.25s ease;

  svg { width: 16px; height: 16px; }
  .cta-arrow { transition: transform 0.2s ease; }
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 36px rgba(251, 191, 36, 0.55);
    .cta-arrow { transform: translateX(4px); }
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .report-sample-section {
    padding: 48px 12px 40px;
  }
  .rsd-title { font-size: 22px; }
  .rsd-sub { font-size: 13px; }
  .rsd-br { display: none; }

  .rsd-stocks {
    gap: 8px;
    margin-bottom: 18px;
    /* 横滚保持节奏，避免换行打乱视觉 */
    flex-wrap: nowrap;
    overflow-x: auto;
    justify-content: flex-start;
    padding: 4px 4px 8px;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }
  .stock-chip {
    flex-shrink: 0;
    padding: 8px 14px;
    /* 移动端去掉指向预览图的小三角，避免视觉碎片 */
    &.active::after { display: none; }
  }

  .rsd-preview {
    min-height: auto;
    border-radius: 12px;
    margin-bottom: 18px;
  }
  .rsd-image-wrap { max-height: 60vh; }

  /* 移动端无 hover，鼠标跟随胶囊隐藏（点击直接放大已经够直觉） */
  .rsd-spotlight { display: none; }

  .rsd-trust {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 0 8px;
    margin-bottom: 20px;
  }

  .rsd-cta {
    padding: 12px 20px;
    font-size: 14px;
    width: 100%;
    justify-content: center;
  }
  .rsd-footer { padding: 0 8px; }
}
</style>
