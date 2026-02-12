<script setup lang="ts">
import { ref } from 'vue'

// 技术优势数据
const techStats = ref([
  {
    id: 'accuracy',
    value: '95%+',
    label: '分析准确率',
    description: '基于多维度数据模型，AI 智能分析准确率达 95% 以上'
  },
  {
    id: 'speed',
    value: '~2min',
    label: '平均分析时长',
    description: '深度多维分析，2 分钟内生成专业投资报告'
  },
  {
    id: 'coverage',
    value: '10000+',
    label: '股票覆盖',
    description: '覆盖 A股、港股、美股超过 10000+ 上市公司'
  },
  {
    id: 'realtime',
    value: '24/7',
    label: '实时监控',
    description: '全天候实时数据更新，把握每一个投资机会'
  }
])

// 核心技术特性
const techFeatures = ref([
  {
    id: 'ai-engine',
    title: 'AI 分析引擎',
    description: '多模型融合，深度学习驱动',
    icon: 'chip'
  },
  {
    id: 'data-pipeline',
    title: '数据处理管道',
    description: '实时数据流，高效 ETL 架构',
    icon: 'server'
  },
  {
    id: 'multi-source',
    title: '多源数据聚合',
    description: '整合全球市场数据源',
    icon: 'database'
  },
  {
    id: 'security',
    title: '安全防护',
    description: '企业级安全加密与隐私保护',
    icon: 'shield'
  }
])
</script>

<template>
  <section class="tech-section">
    <div class="tech-container">
      <!-- 标题区 -->
      <div class="section-header">
        <div class="label-badge">
          <span class="badge-dot" />
          <span>技术优势</span>
        </div>
        <h2 class="section-titleas">
          由
          <span class="gradient-text">尖端技术</span>
          驱动
        </h2>
        <p class="section-subtitle">
          强大的技术架构，为您的投资决策提供坚实保障
        </p>
      </div>

      <!-- 数据统计卡片（非对称布局）-->
      <div class="stats-grid">
        <div
          v-for="(stat, index) in techStats"
          :key="stat.id"
          class="stat-card"
          :class="`stat-card-${index + 1}`"
        >
          <div class="stat-card-glow" />
          
          <!-- 数据值 -->
          <div class="stat-value">{{ stat.value }}</div>
          
          <!-- 数据标签 -->
          <div class="stat-label">{{ stat.label }}</div>
          
          <!-- 数据描述 -->
          <p class="stat-description">{{ stat.description }}</p>

          <!-- 装饰线 -->
          <div class="stat-decorator" />
        </div>
      </div>

      <!-- 核心技术特性（横向布局）-->
      <div class="features-row">
        <div
          v-for="feature in techFeatures"
          :key="feature.id"
          class="feature-item"
        >
          <!-- SVG 图标 -->
          <div class="feature-icon-wrapper">
            <!-- AI 芯片图标 -->
            <svg v-if="feature.icon === 'chip'" class="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="9" y="9" width="6" height="6" stroke="url(#gradientChip)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="5" y="5" width="14" height="14" stroke="url(#gradientChip)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="5" y1="10" x2="3" y2="10" stroke="url(#gradientChip)" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="5" y1="14" x2="3" y2="14" stroke="url(#gradientChip)" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="19" y1="10" x2="21" y2="10" stroke="url(#gradientChip)" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="19" y1="14" x2="21" y2="14" stroke="url(#gradientChip)" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="10" y1="5" x2="10" y2="3" stroke="url(#gradientChip)" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="14" y1="5" x2="14" y2="3" stroke="url(#gradientChip)" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="10" y1="19" x2="10" y2="21" stroke="url(#gradientChip)" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="14" y1="19" x2="14" y2="21" stroke="url(#gradientChip)" stroke-width="1.5" stroke-linecap="round"/>
              <defs>
                <linearGradient id="gradientChip" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#06b6d4" />
                  <stop offset="100%" style="stop-color:#3b82f6" />
                </linearGradient>
              </defs>
            </svg>

            <!-- 服务器图标 -->
            <svg v-else-if="feature.icon === 'server'" class="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="18" height="6" rx="2" stroke="url(#gradientServer)" stroke-width="1.5"/>
              <rect x="3" y="14" width="18" height="6" rx="2" stroke="url(#gradientServer)" stroke-width="1.5"/>
              <circle cx="7" cy="7" r="1" fill="url(#gradientServer)"/>
              <circle cx="7" cy="17" r="1" fill="url(#gradientServer)"/>
              <line x1="11" y1="7" x2="17" y2="7" stroke="url(#gradientServer)" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="11" y1="17" x2="17" y2="17" stroke="url(#gradientServer)" stroke-width="1.5" stroke-linecap="round"/>
              <defs>
                <linearGradient id="gradientServer" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#3b82f6" />
                  <stop offset="100%" style="stop-color:#06b6d4" />
                </linearGradient>
              </defs>
            </svg>

            <!-- 数据库图标 -->
            <svg v-else-if="feature.icon === 'database'" class="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="12" cy="5" rx="8" ry="3" stroke="url(#gradientDB)" stroke-width="1.5"/>
              <path d="M4 5v7c0 1.657 3.582 3 8 3s8-1.343 8-3V5" stroke="url(#gradientDB)" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M4 12v7c0 1.657 3.582 3 8 3s8-1.343 8-3v-7" stroke="url(#gradientDB)" stroke-width="1.5" stroke-linecap="round"/>
              <defs>
                <linearGradient id="gradientDB" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#06b6d4" />
                  <stop offset="100%" style="stop-color:#3b82f6" />
                </linearGradient>
              </defs>
            </svg>

            <!-- 安全盾牌图标 -->
            <svg v-else-if="feature.icon === 'shield'" class="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3L4 7v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V7l-8-4z" stroke="url(#gradientShield)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 12l2 2 4-4" stroke="url(#gradientShield)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <defs>
                <linearGradient id="gradientShield" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#3b82f6" />
                  <stop offset="100%" style="stop-color:#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <!-- 特性内容 -->
          <div class="feature-content">
            <h4 class="feature-title">{{ feature.title }}</h4>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.tech-section {
  position: relative;
  min-height: 100vh;
  padding: 6rem 3rem;
  overflow: hidden;
}

// 容器
.tech-container {
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

// 数据统计网格（非对称布局）
.stats-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 2rem;
  margin-bottom: 5rem;
}

.stat-card {
  position: relative;
  padding: 3rem 2.5rem;
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: 24px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-8px);
    border-color: rgba(6, 182, 212, 0.5);
    box-shadow: 0 20px 60px rgba(6, 182, 212, 0.25);

    .stat-card-glow {
      opacity: 1;
    }

    .stat-decorator {
      width: 100%;
    }
  }
}

// 非对称布局
.stat-card-1 {
  grid-column: 1 / 4;
}

.stat-card-2 {
  grid-column: 4 / 7;
}

.stat-card-3 {
  grid-column: 7 / 10;
}

.stat-card-4 {
  grid-column: 10 / 13;
}

// 卡片光晕
.stat-card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top, rgba(6, 182, 212, 0.15) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

// 数据值
.stat-value {
  position: relative;
  z-index: 2;
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  font-weight: 900;
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.75rem;
  line-height: 1;
}

// 数据标签
.stat-label {
  position: relative;
  z-index: 2;
  font-size: 1.125rem;
  font-weight: 600;
  color: #f1f5f9;
  margin-bottom: 1rem;
}

// 数据描述
.stat-description {
  position: relative;
  z-index: 2;
  font-size: 0.875rem;
  color: #94a3b8;
  line-height: 1.6;
}

// 装饰线
.stat-decorator {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 40px;
  background: linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%);
  transition: width 0.4s ease;
}

// 核心技术特性（横向布局）
.features-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 1.5rem;
  background: rgba(30, 41, 59, 0.3);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(6, 182, 212, 0.15);
  border-radius: 20px;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(6, 182, 212, 0.4);
    transform: translateY(-4px);

    .feature-icon-wrapper {
      transform: scale(1.1);
    }
  }
}

// 特性图标
.feature-icon-wrapper {
  width: 56px;
  height: 56px;
  margin-bottom: 1.5rem;
  transition: transform 0.3s ease;
}

.feature-icon {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 12px rgba(6, 182, 212, 0.3));
}

// 特性内容
.feature-content {
  flex: 1;
}

.feature-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #f1f5f9;
  margin-bottom: 0.5rem;
}

.feature-description {
  font-size: 0.875rem;
  color: #94a3b8;
  line-height: 1.5;
}

// 响应式
@media (max-width: 1024px) {
  .tech-section {
    padding: 5rem 2rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-card {
    grid-column: auto !important;
  }
}

@media (max-width: 768px) {
  .tech-section {
    padding: 4rem 1.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .features-row {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 2rem 1.5rem;
  }

  .stat-value {
    font-size: 2.5rem;
  }
}
</style>
