<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import wechatLogin from '@/utils/wechatLogin'

const router = useRouter()
const authStore = useAuthStore()

// 引擎特点对比：传统量化模型 vs TradingAgents-CN
const traditionalPoints = ref([
  '仅依赖历史数据，对突发新闻反应迟钝',
  '缺乏推理过程，"黑盒" 决策难解释',
  '仅处理结构化数据，无法理解文本情绪',
  '需要复杂数学建模背景，不适合个人投资者',
])

const engineAdvantages = ref([
  '多维度分析：同时研判行情、财报、新闻与市场情绪',
  '透明推理：完整思维链与多角色辩论记录',
  '实时感知：打通 A 股主流数据源与财经资讯',
  '开箱即用：注册账号即可在线分析，无需编程基础',
])

// 企业级平台六大核心能力
const features = ref([
  {
    id: 'multi-agent',
    title: '多智能体协作',
    description: '分析师、研究员、交易员、风控官四大角色各司其职，通过辩论与投票机制消除单点幻觉，输出更客观的决策。',
    icon: 'brain',
    link: '/analysis/single',
  },
  {
    id: 'a-share',
    title: 'A 股全市场深度覆盖',
    description: '覆盖上交所、深交所、北交所近 5000 只 A 股，内置行情、财报、公告与资金流向数据，中文金融语境深度优化。',
    icon: 'globe',
    link: '/screening',
  },
  {
    id: 'llm',
    title: '国产大模型驱动',
    description: '集成 DeepSeek V4、阿里千问 Qwen 等国产主流大模型，合规合规、响应快速，支持一键切换与多模型对比分析。',
    icon: 'chip',
    link: '/analysis/single',
  },
  {
    id: 'export',
    title: '专业报告导出',
    description: '支持将复杂的分析过程导出为 PDF、Word、Markdown 格式的专业投研报告，包含完整的推理链条与数据图表。',
    icon: 'report',
    link: '/reports',
  },
  {
    id: 'online',
    title: '在线即用，无需安装',
    description: '免本地部署、免环境配置，打开网页注册账号即可开始分析。注册即赠免费分析额度，立刻体验 AI 研报能力。',
    icon: 'online',
    link: '/login',
  },
  {
    id: 'risk',
    title: '合规与风控',
    description: '内置多层级风控模块，支持"中立 / 激进 / 保守" 风格切换。仅做辅助决策工具，严格遵循合规要求。',
    icon: 'shield',
    link: '/analysis/single',
  },
])

const handleCardClick = (link: string) => {
  if (!authStore.isAuthenticated) {
    if (wechatLogin.isWechat()) {
      wechatLogin.startAuth()
    } else {
      router.push('/login')
    }
    return
  }
  router.push(link)
}
</script>

<template>
  <section class="features-section">
    <div class="features-container">
      <!-- ========= 引擎特点对比 ========= -->
      <div class="section-header">
        <div class="label-badge">
          <span class="badge-dot" />
          <span>TradingAgents-CN 引擎特点</span>
        </div>
        <h2 class="section-titleas">
          面向研究与教学的
          <span class="gradient-text">多智能体交易框架</span>
        </h2>
        <p class="section-subtitle">AI 驱动的新范式，让金融决策可解释、可评估、可扩展</p>
      </div>

      <div class="compare-grid">
        <!-- 传统量化模型 -->
        <div class="compare-card traditional">
          <div class="compare-header">
            <div class="compare-icon old">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div>
              <div class="compare-tag old-tag">传统方案</div>
              <h3 class="compare-titleas">传统量化模型</h3>
            </div>
          </div>
          <ul class="compare-list">
            <li v-for="(item, i) in traditionalPoints" :key="i" class="compare-item old">
              <span class="dot-x">✕</span>
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>

        <!-- TradingAgents-CN 引擎 -->
        <div class="compare-card modern">
          <div class="compare-header">
            <div class="compare-icon new">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div>
              <div class="compare-tag new-tag">AI 新范式</div>
              <h3 class="compare-titleas">TradingAgents-CN 引擎</h3>
            </div>
          </div>
          <ul class="compare-list">
            <li v-for="(item, i) in engineAdvantages" :key="i" class="compare-item new">
              <span class="dot-check">✓</span>
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- ========= 关键数字 ========= -->
      <div class="metrics-row">
        <div class="metric">
          <div class="metric-value">5000<span>+</span></div>
          <div class="metric-label">A 股上市公司</div>
          <div class="metric-hint">上交所 / 深交所 / 北交所全覆盖</div>
        </div>
        <div class="metric">
          <div class="metric-value">7</div>
          <div class="metric-label">专业智能体</div>
          <div class="metric-hint">分析师、研究员、交易员协作</div>
        </div>
        <div class="metric">
          <div class="metric-value">2</div>
          <div class="metric-label">国产主流 LLM</div>
          <div class="metric-hint">DeepSeek V4、阿里千问 Qwen</div>
        </div>
        <div class="metric">
          <div class="metric-value">¥0</div>
          <div class="metric-label">注册赠送</div>
          <div class="metric-hint">新用户免费分析额度</div>
        </div>
      </div>

      <!-- ========= 企业级平台六大能力 ========= -->
      <div class="section-header sub-header">
        <div class="label-badge">
          <span class="badge-dot" />
          <span>企业级金融 AI 研究平台</span>
        </div>
        <h2 class="section-titleas">
          不只是聊天机器人，是完整的
          <span class="gradient-text">多智能体协作系统</span>
        </h2>
        <p class="section-subtitle">模拟真实交易团队的决策流程</p>
      </div>

      <div class="features-grid">
        <div
          v-for="(feature, index) in features"
          :key="feature.id"
          class="feature-card"
          :class="`card-${index + 1}`"
          @click="handleCardClick(feature.link)"
        >
          <div class="card-glow" />
          <div class="icon-wrapper">
            <!-- 多智能体协作 -->
            <svg v-if="feature.icon === 'brain'" class="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="6" cy="8" r="2.5" stroke="url(#gbrain)" stroke-width="1.5"/>
              <circle cx="18" cy="8" r="2.5" stroke="url(#gbrain)" stroke-width="1.5"/>
              <circle cx="12" cy="18" r="2.5" stroke="url(#gbrain)" stroke-width="1.5"/>
              <path d="M8 9.5L10.5 16M16 9.5L13.5 16M8 8h8" stroke="url(#gbrain)" stroke-width="1.5" stroke-linecap="round"/>
              <defs><linearGradient id="gbrain" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#06b6d4"/><stop offset="100%" stop-color="#10b981"/></linearGradient></defs>
            </svg>
            <!-- 多市场覆盖 -->
            <svg v-else-if="feature.icon === 'globe'" class="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8M12 3c1.657 0 3 4.03 3 9s-1.343 9-3 9m0-18c-1.657 0-3 4.03-3 9s1.343 9 3 9" stroke="url(#gglobe)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <defs><linearGradient id="gglobe" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#22d3ee"/></linearGradient></defs>
            </svg>
            <!-- 多 LLM -->
            <svg v-else-if="feature.icon === 'chip'" class="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="5" width="14" height="14" rx="2" stroke="url(#gchip)" stroke-width="1.5"/>
              <rect x="9" y="9" width="6" height="6" rx="1" stroke="url(#gchip)" stroke-width="1.5"/>
              <path d="M9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2" stroke="url(#gchip)" stroke-width="1.5" stroke-linecap="round"/>
              <defs><linearGradient id="gchip" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#06b6d4"/><stop offset="100%" stop-color="#3b82f6"/></linearGradient></defs>
            </svg>
            <!-- 专业报告 -->
            <svg v-else-if="feature.icon === 'report'" class="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="url(#greport)" stroke-width="1.5" stroke-linejoin="round"/>
              <path d="M14 2v6h6M8 13h8M8 17h5M8 9h3" stroke="url(#greport)" stroke-width="1.5" stroke-linecap="round"/>
              <defs><linearGradient id="greport" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#22d3ee"/><stop offset="100%" stop-color="#3b82f6"/></linearGradient></defs>
            </svg>
            <!-- 在线即用 -->
            <svg v-else-if="feature.icon === 'online'" class="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 5h18v12H3z" stroke="url(#gonline)" stroke-width="1.5" stroke-linejoin="round"/>
              <path d="M8 21h8M12 17v4" stroke="url(#gonline)" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M8 11l3 3 5-5" stroke="url(#gonline)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              <defs><linearGradient id="gonline" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0ea5e9"/><stop offset="100%" stop-color="#06b6d4"/></linearGradient></defs>
            </svg>
            <!-- 合规 -->
            <svg v-else-if="feature.icon === 'shield'" class="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3L4 7v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V7l-8-4z" stroke="url(#gshield)" stroke-width="1.5" stroke-linejoin="round"/>
              <path d="M9 12l2 2 4-4" stroke="url(#gshield)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <defs><linearGradient id="gshield" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#10b981"/><stop offset="100%" stop-color="#06b6d4"/></linearGradient></defs>
            </svg>
          </div>

          <div class="card-content">
            <h3 class="card-titleas">{{ feature.title }}</h3>
            <p class="card-description">{{ feature.description }}</p>
          </div>

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
  padding: 8rem 3rem;
  overflow: hidden;
}

.features-container {
  position: relative;
  z-index: 10;
  max-width: 1400px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.sub-header {
  margin-top: 6rem;
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
  background: linear-gradient(135deg, #10b981, #06b6d4);
  border-radius: 50%;
  animation: dot-pulse 2s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
}

.section-titleas {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  line-height: 1.2;
  color: #f1f5f9;
  margin-bottom: 1rem;
}

.gradient-text {
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: #94a3b8;
  line-height: 1.6;
}

/* ===== 对比卡片 ===== */
.compare-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 2rem;
  align-items: stretch;
  margin-bottom: 4rem;
  position: relative;

  &::before {
    content: 'VS';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, #06b6d4, #10b981);
    color: #fff;
    font-weight: 900;
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
    box-shadow: 0 8px 30px rgba(6, 182, 212, 0.4);
  }
}

.compare-card {
  padding: 2.5rem 2rem;
  border-radius: 24px;
  backdrop-filter: blur(20px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &.traditional {
    background: rgba(71, 85, 105, 0.15);
    border: 1px solid rgba(148, 163, 184, 0.2);
    grid-column: 1;
    opacity: 0.9;
  }

  &.modern {
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(16, 185, 129, 0.08));
    border: 1px solid rgba(6, 182, 212, 0.35);
    grid-column: 3;
    box-shadow: 0 20px 60px rgba(6, 182, 212, 0.15);

    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 30px 80px rgba(6, 182, 212, 0.3);
    }
  }
}

.compare-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.75rem;
}

.compare-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg { width: 26px; height: 26px; }

  &.old {
    background: rgba(148, 163, 184, 0.15);
    color: #94a3b8;
  }
  &.new {
    background: linear-gradient(135deg, #06b6d4, #10b981);
    color: #fff;
    box-shadow: 0 8px 24px rgba(6, 182, 212, 0.4);
  }
}

.compare-tag {
  display: inline-block;
  padding: 0.125rem 0.625rem;
  font-size: 0.75rem;
  border-radius: 6px;
  margin-bottom: 0.25rem;

  &.old-tag { background: rgba(148, 163, 184, 0.15); color: #94a3b8; }
  &.new-tag { background: rgba(16, 185, 129, 0.15); color: #10b981; }
}

.compare-titleas {
  font-size: 1.375rem;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
}

.compare-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.compare-item {
  display: flex;
  gap: 0.75rem;
  font-size: 0.9375rem;
  line-height: 1.55;

  &.old {
    color: #94a3b8;
    .dot-x {
      color: #64748b;
      font-weight: 700;
      flex-shrink: 0;
    }
  }
  &.new {
    color: #e2e8f0;
    .dot-check {
      color: #10b981;
      font-weight: 900;
      flex-shrink: 0;
    }
  }
}

/* ===== 数字 ===== */
.metrics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  padding: 2.5rem 2rem;
  margin-bottom: 2rem;
  background: rgba(30, 41, 59, 0.35);
  border: 1px solid rgba(6, 182, 212, 0.15);
  border-radius: 24px;
  backdrop-filter: blur(20px);
}

.metric {
  text-align: center;
  padding: 0 0.5rem;
  border-right: 1px solid rgba(148, 163, 184, 0.1);

  &:last-child { border-right: none; }
}

.metric-value {
  font-size: clamp(2rem, 3.5vw, 2.75rem);
  font-weight: 900;
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  margin-bottom: 0.5rem;

  span { font-size: 0.7em; }
}

.metric-label {
  font-size: 1rem;
  font-weight: 600;
  color: #f1f5f9;
  margin-bottom: 0.25rem;
}

.metric-hint {
  font-size: 0.8125rem;
  color: #94a3b8;
}

/* ===== 六大能力卡片 ===== */
.features-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.75rem;
}

.feature-card {
  position: relative;
  padding: 2.25rem;
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
    .card-glow { opacity: 1; }
    .card-arrow { transform: translate(4px, -4px); }
    .icon-wrapper { transform: scale(1.1) rotate(-4deg); }
  }
}

.card-1, .card-2 { grid-column: span 4; }
.card-3, .card-4 { grid-column: span 4; }
.card-5, .card-6 { grid-column: span 4; }

.card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(6, 182, 212, 0.15) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.icon-wrapper {
  width: 56px;
  height: 56px;
  margin-bottom: 1.25rem;
  padding: 10px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(16, 185, 129, 0.08));
  border: 1px solid rgba(6, 182, 212, 0.2);
  transition: transform 0.3s ease;
}

.feature-icon {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 12px rgba(6, 182, 212, 0.4));
}

.card-content { position: relative; z-index: 2; }

.card-titleas {
  font-size: 1.375rem;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 0.75rem;
}

.card-description {
  font-size: 0.9375rem;
  color: #94a3b8;
  line-height: 1.65;
}

.card-arrow {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  transition: transform 0.3s ease;
}

.arrow-circle {
  width: 36px;
  height: 36px;
  background: rgba(6, 182, 212, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow-icon { width: 18px; height: 18px; color: #06b6d4; }

@media (max-width: 1024px) {
  .features-section { padding: 5rem 2rem; }
  .compare-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;

    &::before { display: none; }
    .compare-card.traditional,
    .compare-card.modern { grid-column: 1; }
  }
  .metrics-row { grid-template-columns: repeat(2, 1fr); }
  .metric { border-right: none; }
  .features-grid { grid-template-columns: 1fr; }
  .feature-card { grid-column: 1 / -1 !important; }
}

@media (max-width: 768px) {
  .features-section { padding: 4rem 1.25rem; }
  .compare-card { padding: 1.75rem 1.25rem; }
  .metrics-row { padding: 1.75rem 1rem; gap: 1rem; }
  .feature-card { padding: 1.75rem; }
}
</style>
