<template>
  <div class="guide-list-page">
    <!-- 顶部横幅 -->
    <header class="guide-hero">
      <div class="hero-inner">
        <div class="hero-eyebrow">TRADINGAGENTS · 学习指南</div>
        <h1 class="hero-title">AI 股票分析实战教程中心</h1>
        <p class="hero-subtitle">
          围绕国产大模型、多智能体 AI、A 股投研场景，提供可复用的实战教程、实测案例与框架解析。
        </p>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-num">{{ GUIDES.length }}+</span>
            <span class="stat-label">原创教程</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">DeepSeek · Qwen</span>
            <span class="stat-label">国产大模型实战</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">A 股专属</span>
            <span class="stat-label">仅限中国市场</span>
          </div>
        </div>
      </div>
    </header>

    <!-- 分类筛选 -->
    <nav class="category-nav">
      <button
        class="cat-btn"
        :class="{ active: activeCat === 'all' }"
        @click="activeCat = 'all'"
      >
        全部 <span class="count">{{ GUIDES.length }}</span>
      </button>
      <button
        v-for="cat in categories"
        :key="cat.value"
        class="cat-btn"
        :class="{ active: activeCat === cat.value }"
        @click="activeCat = cat.value"
      >
        {{ cat.label }} <span class="count">{{ cat.count }}</span>
      </button>
    </nav>

    <!-- 文章卡片网格 -->
    <main class="guide-grid">
      <article
        v-for="guide in filteredGuides"
        :key="guide.slug"
        class="guide-card"
        @click="goToGuide(guide.slug)"
      >
        <div class="card-cover">
          <img :src="guide.cover" :alt="guide.title" loading="lazy" />
          <span class="card-cat-badge">{{ CATEGORY_LABELS[guide.category] }}</span>
          <span v-if="guide.featured" class="card-featured-badge">精选</span>
        </div>
        <div class="card-body">
          <h2 class="card-title">{{ guide.title }}</h2>
          <p v-if="guide.subtitle" class="card-subtitle">{{ guide.subtitle }}</p>
          <p class="card-desc">{{ guide.description }}</p>
          <div class="card-tags">
            <span v-for="t in guide.tags.slice(0, 3)" :key="t" class="tag">#{{ t }}</span>
          </div>
          <div class="card-meta">
            <span class="meta-item">
              <el-icon><Timer /></el-icon> {{ guide.readTime }} 分钟阅读
            </span>
            <span class="meta-item">{{ formatDate(guide.publishedAt) }}</span>
          </div>
        </div>
      </article>
    </main>

    <!-- 底部 CTA -->
    <section class="bottom-cta">
      <h3>看完教程，就来实际体验一下 AI 股票分析</h3>
      <p>免费注册即获体验算力，输入 A 股代码即可获得多智能体 AI 分析报告</p>
      <el-button type="primary" size="large" @click="$router.push('/login')">
        免费注册体验
      </el-button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Timer } from '@element-plus/icons-vue'
import { useSeo } from '@/composables/useSeo'
import { GUIDES, CATEGORY_LABELS, type GuideMeta } from '@/data/guides'

// ------- SEO -------
useSeo({
  title: 'AI 股票分析实战教程 - DeepSeek / 千问 / 多智能体',
  description:
    '围绕 DeepSeek、通义千问等国产大模型，以及 TradingAgents 多智能体框架，提供 A 股投研场景下可落地的教程、实测案例与架构解析。',
  keywords:
    'AI 股票分析,DeepSeek 炒股,千问 股票,多智能体 股票,TradingAgents 教程,国产大模型 炒股,AI 选股',
  path: '/guide',
  image: '/assets/schema.png',
})

const router = useRouter()
const activeCat = ref<'all' | GuideMeta['category']>('all')

const categories = computed(() => {
  const map = new Map<GuideMeta['category'], number>()
  GUIDES.forEach((g) => map.set(g.category, (map.get(g.category) || 0) + 1))
  return Array.from(map.entries()).map(([value, count]) => ({
    value,
    label: CATEGORY_LABELS[value],
    count,
  }))
})

const filteredGuides = computed(() => {
  const list = activeCat.value === 'all' ? GUIDES : GUIDES.filter((g) => g.category === activeCat.value)
  // 精选置顶 + 按发布时间倒序
  return [...list].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    return b.publishedAt.localeCompare(a.publishedAt)
  })
})

function goToGuide(slug: string) {
  router.push(`/guide/${slug}`)
}

function formatDate(iso: string) {
  return iso.slice(0, 10)
}
</script>

<style lang="scss" scoped>
.guide-list-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f7f9fc 0%, #ffffff 60%);
  padding-bottom: 80px;
}

.guide-hero {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%);
  color: #fff;
  padding: 80px 24px 64px;
  text-align: center;

  .hero-inner {
    max-width: 900px;
    margin: 0 auto;
  }

  .hero-eyebrow {
    font-size: 13px;
    letter-spacing: 2px;
    opacity: 0.8;
    margin-bottom: 16px;
  }

  .hero-title {
    font-size: 42px;
    font-weight: 700;
    line-height: 1.2;
    margin: 0 0 16px;
  }

  .hero-subtitle {
    font-size: 17px;
    opacity: 0.9;
    max-width: 680px;
    margin: 0 auto 40px;
    line-height: 1.7;
  }

  .hero-stats {
    display: flex;
    justify-content: center;
    gap: 60px;
    flex-wrap: wrap;

    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .stat-num {
        font-size: 24px;
        font-weight: 700;
      }
      .stat-label {
        font-size: 13px;
        opacity: 0.8;
      }
    }
  }
}

.category-nav {
  max-width: 1200px;
  margin: 40px auto 32px;
  padding: 0 24px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  .cat-btn {
    padding: 8px 20px;
    border-radius: 999px;
    border: 1px solid #e5e7eb;
    background: #fff;
    cursor: pointer;
    font-size: 14px;
    color: #475569;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;

    .count {
      background: #f1f5f9;
      color: #64748b;
      padding: 1px 8px;
      border-radius: 999px;
      font-size: 12px;
    }

    &:hover {
      border-color: #3b82f6;
      color: #3b82f6;
    }

    &.active {
      background: #3b82f6;
      border-color: #3b82f6;
      color: #fff;

      .count {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
      }
    }
  }
}

.guide-grid {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 28px;
}

.guide-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.1);
  }

  .card-cover {
    position: relative;
    aspect-ratio: 16 / 9;
    background: #f1f5f9;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s ease;
    }

    .card-cat-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background: rgba(0, 0, 0, 0.65);
      color: #fff;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
    }

    .card-featured-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: linear-gradient(135deg, #f59e0b, #ef4444);
      color: #fff;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
    }
  }

  &:hover .card-cover img {
    transform: scale(1.06);
  }

  .card-body {
    padding: 20px 22px 22px;
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 10px;
  }

  .card-title {
    font-size: 17px;
    line-height: 1.4;
    color: #0f172a;
    margin: 0;
    font-weight: 600;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-subtitle {
    font-size: 13px;
    color: #64748b;
    margin: 0;
  }

  .card-desc {
    font-size: 13px;
    line-height: 1.6;
    color: #64748b;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    .tag {
      font-size: 12px;
      color: #3b82f6;
      background: #eff6ff;
      padding: 2px 10px;
      border-radius: 6px;
    }
  }

  .card-meta {
    margin-top: auto;
    padding-top: 10px;
    border-top: 1px dashed #e5e7eb;
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #94a3b8;

    .meta-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
  }
}

.bottom-cta {
  max-width: 820px;
  margin: 80px auto 0;
  padding: 48px 32px;
  text-align: center;
  background: linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%);
  border-radius: 20px;

  h3 {
    font-size: 22px;
    color: #0f172a;
    margin: 0 0 12px;
  }
  p {
    font-size: 14px;
    color: #475569;
    margin: 0 0 24px;
  }
}

@media (max-width: 640px) {
  .guide-hero {
    padding: 48px 16px 40px;
    .hero-title {
      font-size: 28px;
    }
    .hero-subtitle {
      font-size: 14px;
    }
    .hero-stats {
      gap: 24px;
    }
  }
  .guide-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .bottom-cta {
    margin: 48px 16px 0;
    padding: 32px 20px;
    h3 {
      font-size: 18px;
    }
  }
}
</style>
