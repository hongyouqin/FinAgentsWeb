<template>
  <div class="guide-detail-page">
    <!-- 404：slug 不存在 -->
    <div v-if="!guide" class="not-found">
      <h1>文章不存在</h1>
      <p>抱歉，你访问的文章可能已被移除或链接有误。</p>
      <router-link to="/guide" class="back-link">返回教程中心</router-link>
    </div>

    <template v-else>
      <!-- 面包屑 -->
      <nav class="breadcrumb" aria-label="面包屑">
        <router-link to="/">首页</router-link>
        <span class="sep">›</span>
        <router-link to="/guide">学习指南</router-link>
        <span class="sep">›</span>
        <span class="current">{{ CATEGORY_LABELS[guide.category] }}</span>
        <span class="sep">›</span>
        <span class="current ellipsis">{{ guide.title }}</span>
      </nav>

      <!-- 文章头 -->
      <header class="article-header">
        <div class="header-inner">
          <div class="cat-badge">{{ CATEGORY_LABELS[guide.category] }}</div>
          <h1 class="article-title">{{ guide.title }}</h1>
          <p v-if="guide.subtitle" class="article-subtitle">{{ guide.subtitle }}</p>

          <div class="article-meta">
            <span class="meta-item">
              <el-icon><User /></el-icon> {{ guide.author }}
            </span>
            <span class="meta-item">
              <el-icon><Calendar /></el-icon> {{ formatDate(guide.publishedAt) }}
            </span>
            <span class="meta-item">
              <el-icon><Timer /></el-icon> 约 {{ guide.readTime }} 分钟阅读
            </span>
          </div>

          <div class="article-tags">
            <span v-for="t in guide.tags" :key="t" class="tag">#{{ t }}</span>
          </div>
        </div>
      </header>

      <!-- 封面 -->
      <div v-if="guide.cover" class="article-cover">
        <img :src="guide.cover" :alt="guide.title" />
      </div>

      <!-- 主体：正文 + 侧栏目录 -->
      <div class="article-layout">
        <!-- 侧栏目录（桌面端） -->
        <aside v-if="toc.length" class="article-toc">
          <div class="toc-title">目录</div>
          <ul>
            <li
              v-for="item in toc"
              :key="item.id"
              :class="['toc-level-' + item.level, { active: activeTocId === item.id }]"
            >
              <a :href="'#' + item.id" @click.prevent="scrollToAnchor(item.id)">{{ item.text }}</a>
            </li>
          </ul>
        </aside>

        <!-- 正文 -->
        <article class="article-content markdown-body" v-html="renderedHtml"></article>
      </div>

      <!-- 作者声明 / 免责 -->
      <section class="article-disclaim">
        <p>
          ⚠️ 本文为教学与研究演示，不构成任何投资建议。股票投资有风险，入市需谨慎。模型输出仅供参考，一切操作请以个人独立判断为准。
        </p>
      </section>

      <!-- CTA -->
      <section class="article-cta">
        <div class="cta-inner">
          <h3>想用 AI 亲自跑一次你关注的股票？</h3>
          <p>TradingAgents 中文版已内置 DeepSeek / 通义千问等国产大模型，注册即可免费体验。</p>
          <div class="cta-btns">
            <router-link to="/register" class="btn-primary">免费注册体验</router-link>
            <router-link to="/guide" class="btn-ghost">查看更多教程</router-link>
          </div>
        </div>
      </section>

      <!-- 上一篇 / 下一篇 -->
      <nav v-if="prev || next" class="article-nav">
        <router-link v-if="prev" :to="`/guide/${prev.slug}`" class="nav-card prev">
          <div class="nav-label">← 上一篇</div>
          <div class="nav-title">{{ prev.title }}</div>
        </router-link>
        <span v-else class="nav-placeholder"></span>
        <router-link v-if="next" :to="`/guide/${next.slug}`" class="nav-card next">
          <div class="nav-label">下一篇 →</div>
          <div class="nav-title">{{ next.title }}</div>
        </router-link>
        <span v-else class="nav-placeholder"></span>
      </nav>

      <!-- 相关推荐 -->
      <section v-if="related.length" class="related-section">
        <h3 class="section-title">延伸阅读</h3>
        <div class="related-grid">
          <router-link
            v-for="g in related"
            :key="g.slug"
            :to="`/guide/${g.slug}`"
            class="related-card"
          >
            <img :src="g.cover" :alt="g.title" loading="lazy" />
            <div class="related-body">
              <div class="related-cat">{{ CATEGORY_LABELS[g.category] }}</div>
              <div class="related-title">{{ g.title }}</div>
              <div class="related-meta">{{ g.readTime }} 分钟 · {{ formatDate(g.publishedAt) }}</div>
            </div>
          </router-link>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import { marked } from 'marked'
import { User, Calendar, Timer } from '@element-plus/icons-vue'
import { useSeo } from '@/composables/useSeo'
import {
  GUIDES,
  CATEGORY_LABELS,
  getGuideBySlug,
  getRelatedGuides,
  type GuideMeta,
} from '@/data/guides'

const route = useRoute()
const SITE_URL = 'https://nbstockai.com'

// 当前文章（响应路由变化）
// 兼容 nginx 可能带尾斜杠的 URL，避免 slug="xxx/" 导致找不到文章
const guide = computed<GuideMeta | undefined>(() => {
  const raw = String(route.params.slug || '')
  const slug = raw.replace(/\/+$/, '').trim()
  return getGuideBySlug(slug)
})

// 上一篇 / 下一篇（按发布时间倒序）
const sortedGuides = computed(() =>
  [...GUIDES].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
)
const currentIndex = computed(() =>
  guide.value ? sortedGuides.value.findIndex((g) => g.slug === guide.value!.slug) : -1
)
const prev = computed<GuideMeta | null>(() => {
  const i = currentIndex.value
  return i > 0 ? sortedGuides.value[i - 1] : null
})
const next = computed<GuideMeta | null>(() => {
  const i = currentIndex.value
  return i >= 0 && i < sortedGuides.value.length - 1 ? sortedGuides.value[i + 1] : null
})

// 相关文章
const related = computed(() =>
  guide.value ? getRelatedGuides(guide.value.slug, 3) : []
)

// ------- Markdown 渲染 + 目录抽取 -------
interface TocItem {
  id: string
  text: string
  level: 2 | 3
}

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\s\u3000]+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const toc = ref<TocItem[]>([])

const renderedHtml = computed(() => {
  if (!guide.value) return ''
  const items: TocItem[] = []
  const used = new Map<string, number>()

  // 自定义 renderer 给 h2/h3 加 id 并收集 TOC
  const renderer = new marked.Renderer()
  const origHeading = renderer.heading.bind(renderer)
  renderer.heading = (token: any) => {
    const level = token.depth as number
    const text = token.text as string
    if (level === 2 || level === 3) {
      let id = slugify(text) || `h-${items.length}`
      // 防重
      if (used.has(id)) {
        const n = (used.get(id) || 0) + 1
        used.set(id, n)
        id = `${id}-${n}`
      } else {
        used.set(id, 0)
      }
      items.push({ id, text, level: level as 2 | 3 })
      return `<h${level} id="${id}">${text}</h${level}>`
    }
    return origHeading(token)
  }

  const html = marked.parse(guide.value.content, {
    renderer,
    gfm: true,
    breaks: false,
  }) as string

  toc.value = items
  return html
})

// ------- SEO + JSON-LD -------
watch(
  guide,
  (g) => {
    if (!g) return
    useSeo({
      title: g.title,
      description: g.description,
      keywords: g.keywords,
      path: `/guide/${g.slug}`,
      image: g.cover,
    })

    // 抽取 FAQ（markdown 里以 "## FAQ" 或 "## 常见问题" 开头的章节）
    const faqs = extractFaq(g.content)

    const articleLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: g.title,
      description: g.description,
      image: [g.cover.startsWith('http') ? g.cover : SITE_URL + g.cover],
      datePublished: g.publishedAt,
      dateModified: g.updatedAt,
      author: { '@type': 'Organization', name: g.author },
      publisher: {
        '@type': 'Organization',
        name: 'TradingAgents 中文版',
        logo: {
          '@type': 'ImageObject',
          url: SITE_URL + '/logo.svg',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/guide/${g.slug}`,
      },
      keywords: g.keywords,
    }

    const breadcrumbLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '首页', item: SITE_URL + '/' },
        { '@type': 'ListItem', position: 2, name: '学习指南', item: SITE_URL + '/guide' },
        {
          '@type': 'ListItem',
          position: 3,
          name: g.title,
          item: `${SITE_URL}/guide/${g.slug}`,
        },
      ],
    }

    const scripts: Array<{ type: string; key: string; innerHTML: string }> = [
      {
        type: 'application/ld+json',
        key: 'ld-article',
        innerHTML: JSON.stringify(articleLd),
      },
      {
        type: 'application/ld+json',
        key: 'ld-breadcrumb',
        innerHTML: JSON.stringify(breadcrumbLd),
      },
    ]

    if (faqs.length) {
      const faqLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }
      scripts.push({
        type: 'application/ld+json',
        key: 'ld-faq',
        innerHTML: JSON.stringify(faqLd),
      })
    }

    useHead({ script: scripts })
  },
  { immediate: true }
)

/**
 * 从 markdown 正文里抽取 FAQ
 * 约定：识别 "## FAQ" 或 "## 常见问题" 段落，内部 "### 问题" 后紧跟段落作为答案
 */
function extractFaq(md: string): Array<{ q: string; a: string }> {
  const faqSectionMatch = md.match(/##\s*(?:FAQ|常见问题)[^\n]*\n([\s\S]*?)(?=\n##\s|\s*$)/i)
  if (!faqSectionMatch) return []
  const section = faqSectionMatch[1]
  const result: Array<{ q: string; a: string }> = []
  const qaRegex = /###\s*(.+?)\n([\s\S]*?)(?=\n###\s|\s*$)/g
  let m: RegExpExecArray | null
  while ((m = qaRegex.exec(section)) !== null) {
    const q = m[1].trim()
    // 把答案里的 markdown 标记简单清理
    const a = m[2].trim().replace(/[*_`>#]/g, '').replace(/\s+/g, ' ').slice(0, 500)
    if (q && a) result.push({ q, a })
  }
  return result
}

// ------- 目录高亮 + 锚点滚动 -------
const activeTocId = ref<string>('')
let observer: IntersectionObserver | null = null

function setupObserver() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return
  if (observer) observer.disconnect()
  const els = document.querySelectorAll('.article-content h2[id], .article-content h3[id]')
  if (!els.length) return
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting)
      if (visible.length) {
        activeTocId.value = (visible[0].target as HTMLElement).id
      }
    },
    { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
  )
  els.forEach((el) => observer!.observe(el))
}

function scrollToAnchor(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 72
  window.scrollTo({ top, behavior: 'smooth' })
  history.replaceState(null, '', '#' + id)
}

onMounted(() => {
  nextTick(setupObserver)
})
onBeforeUnmount(() => observer?.disconnect())

// 路由切换时重置滚动并重新收集 TOC
watch(
  () => route.params.slug,
  () => {
    if (typeof window !== 'undefined') window.scrollTo(0, 0)
    nextTick(setupObserver)
  }
)

function formatDate(iso: string) {
  return iso.slice(0, 10)
}
</script>

<style lang="scss" scoped>
.guide-detail-page {
  min-height: 100vh;
  background: #fff;
  padding-bottom: 80px;
}

.not-found {
  max-width: 600px;
  margin: 120px auto;
  text-align: center;

  h1 {
    font-size: 28px;
    margin-bottom: 16px;
  }

  p {
    color: #6b7280;
    margin-bottom: 24px;
  }

  .back-link {
    display: inline-block;
    padding: 10px 24px;
    background: #3b82f6;
    color: #fff;
    border-radius: 6px;
    text-decoration: none;

    &:hover {
      background: #2563eb;
    }
  }
}

/* 面包屑 */
.breadcrumb {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 24px 0;
  font-size: 13px;
  color: #6b7280;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;

  a {
    color: #3b82f6;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  .sep {
    color: #d1d5db;
  }

  .current {
    color: #374151;
  }

  .ellipsis {
    max-width: 360px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

/* 文章头 */
.article-header {
  max-width: 860px;
  margin: 0 auto;
  padding: 32px 24px 24px;
  text-align: center;

  .cat-badge {
    display: inline-block;
    padding: 4px 12px;
    background: #eff6ff;
    color: #2563eb;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 16px;
  }

  .article-title {
    font-size: 34px;
    font-weight: 700;
    line-height: 1.3;
    color: #0f172a;
    margin: 0 0 14px;
  }

  .article-subtitle {
    font-size: 17px;
    color: #475569;
    margin: 0 0 20px;
    line-height: 1.6;
  }

  .article-meta {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 20px;
    color: #64748b;
    font-size: 14px;
    margin-bottom: 16px;

    .meta-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
  }

  .article-tags {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;

    .tag {
      padding: 4px 10px;
      background: #f1f5f9;
      color: #475569;
      border-radius: 4px;
      font-size: 12px;
    }
  }
}

/* 封面 */
.article-cover {
  max-width: 860px;
  margin: 0 auto 32px;
  padding: 0 24px;

  img {
    width: 100%;
    max-height: 420px;
    object-fit: cover;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  }
}

/* 主体布局 */
.article-layout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 220px minmax(0, 860px);
  gap: 40px;
  justify-content: center;

  @media (max-width: 1024px) {
    grid-template-columns: minmax(0, 860px);

    .article-toc {
      display: none;
    }
  }
}

/* 侧栏目录 */
.article-toc {
  position: sticky;
  top: 80px;
  align-self: start;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  padding: 16px 8px;
  border-left: 2px solid #e5e7eb;

  .toc-title {
    font-size: 13px;
    font-weight: 600;
    color: #6b7280;
    margin-bottom: 12px;
    padding-left: 12px;
    letter-spacing: 1px;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin-bottom: 6px;

    a {
      display: block;
      padding: 4px 12px;
      font-size: 13px;
      color: #64748b;
      text-decoration: none;
      line-height: 1.5;
      border-left: 2px solid transparent;
      margin-left: -2px;
      transition: all 0.2s;

      &:hover {
        color: #3b82f6;
      }
    }

    &.toc-level-3 a {
      padding-left: 28px;
      font-size: 12px;
      color: #94a3b8;
    }

    &.active > a {
      color: #2563eb;
      font-weight: 600;
      border-left-color: #2563eb;
      background: #eff6ff;
    }
  }
}

/* Markdown 正文（非 scoped 可以覆盖，见下方 :deep） */
.article-content {
  font-size: 16px;
  line-height: 1.85;
  color: #1f2937;

  :deep(h2) {
    font-size: 26px;
    font-weight: 700;
    margin: 48px 0 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid #e5e7eb;
    scroll-margin-top: 80px;
  }

  :deep(h3) {
    font-size: 20px;
    font-weight: 600;
    margin: 32px 0 12px;
    scroll-margin-top: 80px;
  }

  :deep(p) {
    margin: 0 0 16px;
  }

  :deep(ul),
  :deep(ol) {
    margin: 0 0 16px;
    padding-left: 24px;

    li {
      margin-bottom: 6px;
    }
  }

  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-size: 14px;

    th,
    td {
      border: 1px solid #e5e7eb;
      padding: 10px 14px;
      text-align: left;
    }

    th {
      background: #f9fafb;
      font-weight: 600;
    }

    tr:nth-child(even) td {
      background: #fafafa;
    }
  }

  :deep(pre) {
    background: #0f172a;
    color: #e2e8f0;
    padding: 16px 20px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 20px 0;
    font-size: 14px;
    line-height: 1.6;

    code {
      background: none;
      color: inherit;
      padding: 0;
    }
  }

  :deep(code) {
    background: #f1f5f9;
    color: #d6336c;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
    font-family: Consolas, Monaco, 'Courier New', monospace;
  }

  :deep(blockquote) {
    border-left: 4px solid #3b82f6;
    background: #eff6ff;
    padding: 12px 16px;
    margin: 16px 0;
    color: #475569;
    border-radius: 0 6px 6px 0;

    p {
      margin: 0;
    }
  }

  :deep(a) {
    color: #2563eb;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  :deep(img) {
    max-width: 100%;
    border-radius: 8px;
    margin: 16px 0;
  }

  :deep(hr) {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 32px 0;
  }
}

/* 免责 */
.article-disclaim {
  max-width: 860px;
  margin: 48px auto 0;
  padding: 0 24px;

  p {
    background: #fef3c7;
    color: #92400e;
    border-left: 4px solid #f59e0b;
    padding: 12px 16px;
    border-radius: 0 6px 6px 0;
    font-size: 14px;
    line-height: 1.7;
    margin: 0;
  }
}

/* CTA */
.article-cta {
  max-width: 860px;
  margin: 40px auto 0;
  padding: 0 24px;

  .cta-inner {
    background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
    color: #fff;
    padding: 40px 32px;
    border-radius: 12px;
    text-align: center;

    h3 {
      font-size: 22px;
      margin: 0 0 10px;
    }

    p {
      margin: 0 0 24px;
      opacity: 0.9;
    }

    .cta-btns {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .btn-primary,
    .btn-ghost {
      display: inline-block;
      padding: 11px 28px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #fff;
      color: #2563eb;

      &:hover {
        background: #f1f5f9;
      }
    }

    .btn-ghost {
      border: 1px solid rgba(255, 255, 255, 0.6);
      color: #fff;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }
}

/* 上/下篇 */
.article-nav {
  max-width: 860px;
  margin: 40px auto 0;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }

  .nav-card {
    display: block;
    padding: 16px 20px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s;

    &:hover {
      border-color: #3b82f6;
      background: #eff6ff;
      transform: translateY(-2px);
    }

    &.next {
      text-align: right;
    }

    .nav-label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 6px;
    }

    .nav-title {
      font-size: 15px;
      font-weight: 600;
      color: #0f172a;
      line-height: 1.4;
    }
  }

  .nav-placeholder {
    visibility: hidden;
  }
}

/* 相关推荐 */
.related-section {
  max-width: 1200px;
  margin: 64px auto 0;
  padding: 0 24px;

  .section-title {
    font-size: 22px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 20px;
    padding-left: 12px;
    border-left: 4px solid #3b82f6;
  }

  .related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  .related-card {
    display: block;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    transition: all 0.25s;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
      border-color: #bfdbfe;
    }

    img {
      width: 100%;
      height: 150px;
      object-fit: cover;
    }

    .related-body {
      padding: 14px 16px 16px;
    }

    .related-cat {
      font-size: 11px;
      color: #2563eb;
      margin-bottom: 6px;
      font-weight: 600;
    }

    .related-title {
      font-size: 15px;
      font-weight: 600;
      color: #0f172a;
      line-height: 1.4;
      margin-bottom: 8px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .related-meta {
      font-size: 12px;
      color: #94a3b8;
    }
  }
}

/* 移动端字号调整 */
@media (max-width: 640px) {
  .article-header {
    padding: 24px 20px 16px;

    .article-title {
      font-size: 26px;
    }

    .article-subtitle {
      font-size: 15px;
    }
  }

  .article-content {
    font-size: 15px;

    :deep(h2) {
      font-size: 22px;
    }

    :deep(h3) {
      font-size: 18px;
    }
  }
}
</style>
