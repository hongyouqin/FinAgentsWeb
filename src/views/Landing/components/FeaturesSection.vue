<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 功能卡片数据
const features = ref([
  {
    id: 'ai-analysis',
    title: 'AI 深度分析',
    description: '多维度基本面与技术面分析，AI 生成专业投资报告，洞察市场趋势',
    icon: 'brain',
    link: '/analysis/single',
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'multi-market',
    title: '多市场覆盖',
    description: '支持 A股、港股、美股，一站式多市场股票追踪与数据聚合',
    icon: 'globe',
    link: '/screening',
    color: 'from-blue-500 to-cyan-400'
  },
  {
    id: 'smart-screening',
    title: '智能筛选',
    description: '自定义多维度筛选条件，快速发现符合投资策略的优质标的',
    icon: 'filter',
    link: '/screening',
    color: 'from-cyan-400 to-blue-400'
  },
  {
    id: 'history',
    title: '历史回测',
    description: '查看历史分析记录，追踪投资策略效果，优化决策模型',
    icon: 'chart',
    link: '/tasks?tab=completed',
    color: 'from-blue-400 to-cyan-500'
  },
  {
    id: 'favorites',
    title: '收藏管理',
    description: '一键收藏关注股票，构建个人投资组合，实时监控市场动态',
    icon: 'star',
    link: '/favorites',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'paper-trading',
    title: '模拟盘',
    description: '零风险模拟交易环境，验证投资策略，提升交易技能',
    icon: 'wallet',
    link: '/paper',
    color: 'from-blue-600 to-cyan-400'
  }
])

const handleCardClick = (link: string) => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  router.push(link)
}
</script>

<template>
  <section class="features-section">
    <!-- 扫描线效果 -->
    <!-- <div class="scan-line" /> -->

    <div class="features-container">
      <!-- 标题区 -->
      <div class="section-header">
        <div class="label-badge">
          <span class="badge-dot" />
          <span>核心功能</span>
        </div>
        <h2 class="section-titleas">
          全方位的
          <span class="gradient-text">智能投资解决方案</span>
        </h2>
        <p class="section-subtitle">
          从数据分析到投资决策，一站式覆盖您的投资全流程
        </p>
      </div>

      <!-- 功能卡片网格（非对称布局）-->
      <div class="features-grid">
        <div
          v-for="(feature, index) in features"
          :key="feature.id"
          class="feature-card"
          :class="`card-${index + 1}`"
          @click="handleCardClick(feature.link)"
        >
          <!-- 卡片背景光晕 -->
          <div class="card-glow" />

          <!-- SVG 图标 -->
          <div class="icon-wrapper">
            <svg v-if="feature.icon === 'brain'" class="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- 外层圆环 -->
              <circle cx="12" cy="12" r="9" stroke="url(#gradient1)" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="3 2"/>
              <!-- 内层数据层 -->
              <circle cx="12" cy="12" r="6" stroke="url(#gradient1)" stroke-width="1.5" stroke-linecap="round"/>
              <!-- 中心点 -->
              <circle cx="12" cy="12" r="2" fill="url(#gradient1)"/>
              <!-- 数据射线 -->
              <line x1="12" y1="3" x2="12" y2="6" stroke="url(#gradient1)" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="12" y1="18" x2="12" y2="21" stroke="url(#gradient1)" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="3" y1="12" x2="6" y2="12" stroke="url(#gradient1)" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="18" y1="12" x2="21" y2="12" stroke="url(#gradient1)" stroke-width="1.5" stroke-linecap="round"/>
              <!-- 对角线射线 -->
              <line x1="5.5" y1="5.5" x2="7.5" y2="7.5" stroke="url(#gradient1)" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="16.5" y1="16.5" x2="18.5" y2="18.5" stroke="url(#gradient1)" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="18.5" y1="5.5" x2="16.5" y2="7.5" stroke="url(#gradient1)" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="7.5" y1="16.5" x2="5.5" y2="18.5" stroke="url(#gradient1)" stroke-width="1.5" stroke-linecap="round"/>
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#06b6d4" />
                  <stop offset="100%" style="stop-color:#3b82f6" />
                </linearGradient>
              </defs>
            </svg>

            <svg v-else-if="feature.icon === 'globe'" class="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8M12 3c1.657 0 3 4.03 3 9s-1.343 9-3 9m0-18c-1.657 0-3 4.03-3 9s1.343 9 3 9" stroke="url(#gradient2)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <defs>
                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#3b82f6" />
                  <stop offset="100%" style="stop-color:#22d3ee" />
                </linearGradient>
              </defs>
            </svg>

            <svg v-else-if="feature.icon === 'filter'" class="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 4.5h18M3 4.5l7.5 10v6l3-1.5v-4.5L21 4.5M3 4.5L21 4.5" stroke="url(#gradient3)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <defs>
                <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#22d3ee" />
                  <stop offset="100%" style="stop-color:#3b82f6" />
                </linearGradient>
              </defs>
            </svg>

            <svg v-else-if="feature.icon === 'chart'" class="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" stroke="url(#gradient4)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <defs>
                <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#3b82f6" />
                  <stop offset="100%" style="stop-color:#22d3ee" />
                </linearGradient>
              </defs>
            </svg>

            <svg v-else-if="feature.icon === 'star'" class="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" stroke="url(#gradient5)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <defs>
                <linearGradient id="gradient5" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#06b6d4" />
                  <stop offset="100%" style="stop-color:#3b82f6" />
                </linearGradient>
              </defs>
            </svg>

            <svg v-else-if="feature.icon === 'wallet'" class="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" stroke="url(#gradient6)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <defs>
                <linearGradient id="gradient6" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#3b82f6" />
                  <stop offset="100%" style="stop-color:#22d3ee" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <!-- 卡片内容 -->
          <div class="card-content">
            <h3 class="card-titleas">{{ feature.title }}</h3>
            <p class="card-description">{{ feature.description }}</p>
          </div>

          <!-- 右上角箭头 -->
          <div class="card-arrow">
            <div class="arrow-circle">
              <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.features-section {
  position: relative;
  min-height: 100vh;
  padding: 8rem 3rem;
  overflow: hidden;
}

// 扫描线
.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%,
    rgba(6, 182, 212, 0.8) 20%,
    rgba(6, 182, 212, 1) 50%,
    rgba(6, 182, 212, 0.8) 80%,
    transparent 100%
  );
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.8);
  animation: scan-move 8s linear infinite;
  opacity: 0.6;
}

@keyframes scan-move {
  0% {
    transform: translateY(0);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(100vh);
    opacity: 0;
  }
}

// 容器
.features-container {
  position: relative;
  z-index: 10;
  max-width: 1400px;
  margin: 0 auto;
}

// 标题区
.section-header {
  text-align: center;
  margin-bottom: 5rem;
}

.label-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 100px;
  font-size: 0.875rem;
  color: #06b6d4;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(10px);
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  border-radius: 50%;
  animation: dot-pulse 2s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.7);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(6, 182, 212, 0);
  }
}

.section-titleas {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  line-height: 1.2;
  color: #f1f5f9;
  margin-bottom: 1rem;
}

.gradient-text {
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: #94a3b8;
  line-height: 1.6;
}

// 功能卡片网格（非对称布局）
.features-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 2rem;
  position: relative;
}

.feature-card {
  position: relative;
  padding: 2.5rem;
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  &:hover {
    transform: translateY(-8px);
    border-color: rgba(6, 182, 212, 0.5);
    box-shadow: 0 20px 60px rgba(6, 182, 212, 0.3);

    .card-glow {
      opacity: 1;
    }

    .card-arrow {
      transform: translate(4px, -4px);
    }

    .icon-wrapper {
      transform: scale(1.1);
    }
  }
}

// 非对称布局
.card-1 {
  grid-column: 1 / 7;  // 左侧大卡片
}

.card-2 {
  grid-column: 7 / 13; // 右侧大卡片
}

.card-3 {
  grid-column: 1 / 5;  // 左侧小卡片
}

.card-4 {
  grid-column: 5 / 9;  // 中间小卡片
}

.card-5 {
  grid-column: 9 / 13; // 右侧小卡片
}

.card-6 {
  grid-column: 3 / 11; // 底部宽卡片
}

// 卡片光晕
.card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(6, 182, 212, 0.15) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

// 图标
.icon-wrapper {
  width: 64px;
  height: 64px;
  margin-bottom: 1.5rem;
  transition: transform 0.3s ease;
}

.feature-icon {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 12px rgba(6, 182, 212, 0.4));
}

// 卡片内容
.card-content {
  position: relative;
  z-index: 2;
}

.card-titleas {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 0.75rem;
}

.card-description {
  font-size: 1rem;
  color: #94a3b8;
  line-height: 1.6;
}

// 右上角箭头
.card-arrow {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  transition: transform 0.3s ease;
}

.arrow-circle {
  width: 40px;
  height: 40px;
  background: rgba(6, 182, 212, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.arrow-icon {
  width: 20px;
  height: 20px;
  color: #06b6d4;
}

// 响应式
@media (max-width: 1024px) {
  .features-section {
    padding: 5rem 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .feature-card {
    grid-column: 1 / -1 !important;
  }
}

@media (max-width: 768px) {
  .features-section {
    padding: 4rem 1.5rem;
  }

  .section-header {
    margin-bottom: 3rem;
  }

  .feature-card {
    padding: 2rem;
  }

  .icon-wrapper {
    width: 48px;
    height: 48px;
  }

  .card-titleas {
    font-size: 1.25rem;
  }

  .card-description {
    font-size: 0.875rem;
  }
}
</style>
