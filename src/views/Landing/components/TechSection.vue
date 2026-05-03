<script setup lang="ts">
import { ref } from 'vue'

// 框架概览 4 大亮点
const frameworkHighlights = ref([
  { title: '多智能体协作', desc: '结构化输出与辩证推理', icon: 'agents' },
  { title: '风险对齐', desc: '可解释与可评估', icon: 'risk' },
  { title: '在线即用', desc: '免安装免配置', icon: 'cloud' },
  { title: '模块化设计', desc: '灵活组件配置', icon: 'module' },
])

// 角色专精
const roleSections = ref([
  {
    id: 'analyst',
    title: '分析师团队',
    subtitle: '从不同维度采集并分析市场数据',
    image: '/assets/analyst.png',
    imageAlt: 'TradingAgents 分析师团队：基本面、情绪、新闻、技术',
    points: [
      { label: '基本面分析师', desc: '评估公司基本面，识别可能的高估或低估' },
      { label: '情绪分析师', desc: '分析社交媒体与公众情绪，衡量市场氛围' },
      { label: '新闻分析师', desc: '评估新闻与宏观经济指标，预测市场变化' },
      { label: '技术分析师', desc: '使用技术指标预测价格趋势与交易机会' },
    ],
    reversed: false,
  },
  {
    id: 'researcher',
    title: '研究员团队',
    subtitle: '通过看多与看空的辩证过程，严格评估分析师数据',
    image: '/assets/researcher.png',
    imageAlt: 'TradingAgents 研究员团队：看多看空辩论',
    points: [
      { label: '看多研究员', desc: '强调积极的市场指标与增长潜力' },
      { label: '看空研究员', desc: '关注风险与负面市场信号' },
      { label: '辩证过程', desc: '确保形成对市场的平衡理解，协助交易智能体做出更有依据的决策' },
    ],
    reversed: true,
  },
  {
    id: 'trader',
    title: '交易智能体 & 风险管理',
    subtitle: '基于全面分析执行决策，监督市场风险敞口',
    image: '/assets/trader.png',
    imageAlt: 'TradingAgents 交易智能体与风险管理',
    points: [
      { label: '交易智能体', desc: '评估分析师与研究员的洞见，确定最优交易动作' },
      { label: '风险管理', desc: '监督市场风险敞口，确保交易活动在预设限额内进行' },
      { label: '资金经理', desc: '最终审批风险调整后的交易决策，并在模拟交易所执行订单' },
    ],
    reversed: false,
  },
])
</script>

<template>
  <section class="tech-section">
    <div class="tech-container">
      <!-- ========= 框架概览 ========= -->
      <div class="section-header">
        <div class="label-badge">
          <span class="badge-dot" />
          <span>TradingAgents 引擎介绍</span>
        </div>
        <h2 class="section-titleas">
          模拟一家
          <span class="gradient-text">专业交易机构</span>
          的决策流程
        </h2>
        <p class="section-subtitle">
          TradingAgents-CN 以结构化沟通与辩证协作为核心，通过分析师、研究员、交易与风控角色协同，
          形成可解释、可评估、可扩展的决策流程。
        </p>
      </div>

      <!-- 架构图 + 四大亮点 -->
      <div class="framework-showcase">
        <div class="schema-wrapper">
          <img
            src="/assets/schema.png"
            alt="TradingAgents 多智能体框架架构图 - 分析师/研究员/交易员/风控协同"
            class="schema-image"
            loading="lazy"
          />
          <div class="schema-label">TradingAgents 框架架构</div>
        </div>

        <div class="highlights-grid">
          <div
            v-for="h in frameworkHighlights"
            :key="h.title"
            class="highlight-card"
          >
            <div class="highlight-icon">
              <svg v-if="h.icon === 'agents'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="7" cy="7" r="2.5" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="17" cy="7" r="2.5" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="12" cy="17" r="2.5" stroke="currentColor" stroke-width="1.5"/>
                <path d="M9 8.5L10.5 15M15 8.5L13.5 15M9 7h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <svg v-else-if="h.icon === 'risk'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3L4 7v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V7l-8-4zM12 8v4M12 16h.01"
                      stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else-if="h.icon === 'cloud'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"
                      stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
                <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
                <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
              </svg>
            </div>
            <h4 class="highlight-title">{{ h.title }}</h4>
            <p class="highlight-desc">{{ h.desc }}</p>
          </div>
        </div>
      </div>

      <!-- ========= 角色专精 ========= -->
      <div class="section-header sub-header">
        <div class="label-badge">
          <span class="badge-dot" />
          <span>角色专精</span>
        </div>
        <h2 class="section-titleas">
          七个关键角色，
          <span class="gradient-text">各司其职协同决策</span>
        </h2>
        <p class="section-subtitle">
          借鉴专业交易机构的组织结构，将复杂的交易目标拆解为可管理的任务
        </p>
      </div>

      <div class="roles-stack">
        <div
          v-for="role in roleSections"
          :key="role.id"
          class="role-row"
          :class="{ reversed: role.reversed }"
        >
          <div class="role-visual">
            <div class="role-image-frame">
              <img
                :src="role.image"
                :alt="role.imageAlt"
                class="role-image"
                loading="lazy"
              />
              <div class="visual-glow" />
            </div>
          </div>

          <div class="role-content">
            <h3 class="role-title">{{ role.title }}</h3>
            <p class="role-subtitle">{{ role.subtitle }}</p>

            <ul class="role-points">
              <li v-for="p in role.points" :key="p.label" class="role-point">
                <span class="point-check">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                <div>
                  <strong class="point-label">{{ p.label }}</strong>
                  <span class="point-desc">{{ p.desc }}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- ========= 框架与平台 摘要 ========= -->
      <div class="framework-summary">
        <div class="summary-card">
          <div class="summary-tag">多智能体引擎</div>
          <p>基本面、情绪、新闻与技术分析师、研究员（多空）、交易与风控协作；面向研究的模块化决策流。</p>
        </div>
        <div class="summary-card">
          <div class="summary-tag">数据与模型管理</div>
          <p>集成 DeepSeek V4、阿里千问 Qwen 等国产主流大模型；打通 Tushare、AkShare、BaoStock 等 A 股主流数据源。</p>
        </div>
        <div class="summary-card">
          <div class="summary-tag">准确率 68.5%</div>
          <p>超过基准线 23.2 个百分点（基准 45.3%）。数据来源：TradingAgents 研究论文（arXiv:2412.20138）。</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.tech-section {
  position: relative;
  padding: 8rem 3rem;
  overflow: hidden;
}

.tech-container {
  position: relative;
  z-index: 10;
  max-width: 1400px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

.sub-header { margin-top: 7rem; }

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
  font-size: clamp(1rem, 2vw, 1.1rem);
  color: #94a3b8;
  line-height: 1.7;
}

/* ===== 框架概览 ===== */
.framework-showcase {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 3rem;
  align-items: center;
  padding: 3rem;
  background: rgba(30, 41, 59, 0.35);
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: 28px;
  backdrop-filter: blur(20px);
}

.schema-wrapper {
  position: relative;
  text-align: center;
}

.schema-image {
  width: 100%;
  max-width: 640px;
  height: auto;
  border-radius: 18px;
  filter: drop-shadow(0 12px 40px rgba(6, 182, 212, 0.3));
  background: rgba(15, 23, 42, 0.6);
  padding: 1rem;
}

.schema-label {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #94a3b8;
  letter-spacing: 0.05em;
}

.highlights-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.highlight-card {
  padding: 1.5rem 1.25rem;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(6, 182, 212, 0.15);
  border-radius: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(6, 182, 212, 0.4);
  }
}

.highlight-icon {
  width: 40px;
  height: 40px;
  color: #06b6d4;
  margin-bottom: 0.75rem;
  filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.4));

  svg { width: 100%; height: 100%; }
}

.highlight-title {
  font-size: 1.0625rem;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0 0 0.375rem;
}

.highlight-desc {
  font-size: 0.8125rem;
  color: #94a3b8;
  margin: 0;
  line-height: 1.5;
}

/* ===== 角色专精 ===== */
.roles-stack {
  display: flex;
  flex-direction: column;
  gap: 5rem;
}

.role-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;

  &.reversed .role-visual { order: 2; }
  &.reversed .role-content { order: 1; }
}

.role-visual {
  display: flex;
  justify-content: center;
}

.role-image-frame {
  position: relative;
  width: 100%;
  max-width: 500px;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(16, 185, 129, 0.05));
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: 24px;
  backdrop-filter: blur(20px);
}

.role-image {
  width: 100%;
  height: auto;
  border-radius: 16px;
  display: block;
}

.visual-glow {
  position: absolute;
  inset: -10%;
  background: radial-gradient(circle at center, rgba(6, 182, 212, 0.25) 0%, transparent 70%);
  filter: blur(60px);
  z-index: -1;
  opacity: 0.7;
}

.role-content {
  padding: 0 0.5rem;
}

.role-title {
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: 800;
  color: #f1f5f9;
  margin: 0 0 0.75rem;
  letter-spacing: -0.02em;
}

.role-subtitle {
  font-size: 1.0625rem;
  color: #94a3b8;
  line-height: 1.6;
  margin: 0 0 1.75rem;
}

.role-points {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.role-point {
  display: flex;
  gap: 0.875rem;
  align-items: flex-start;
  padding: 1rem 1.125rem;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(6, 182, 212, 0.12);
  border-radius: 12px;
  transition: all 0.25s ease;

  &:hover {
    border-color: rgba(6, 182, 212, 0.35);
    transform: translateX(4px);
  }

  > div {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
}

.point-check {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #06b6d4);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);

  svg { width: 16px; height: 16px; }
}

.point-label {
  font-size: 1rem;
  font-weight: 700;
  color: #f1f5f9;
}

.point-desc {
  font-size: 0.9375rem;
  color: #94a3b8;
  line-height: 1.55;
}

/* ===== 框架摘要 ===== */
.framework-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 6rem;
}

.summary-card {
  padding: 2rem 1.75rem;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: 20px;
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-6px);
    border-color: rgba(6, 182, 212, 0.45);
    box-shadow: 0 20px 50px rgba(6, 182, 212, 0.2);
  }

  p {
    font-size: 0.9375rem;
    color: #94a3b8;
    line-height: 1.65;
    margin: 0;
  }
}

.summary-tag {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  margin-bottom: 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 100px;
}

@media (max-width: 1024px) {
  .tech-section { padding: 5rem 1.75rem; }
  .framework-showcase {
    grid-template-columns: 1fr;
    padding: 2rem;
    gap: 2rem;
  }
  .role-row {
    grid-template-columns: 1fr;
    gap: 2rem;

    &.reversed .role-visual { order: 1; }
    &.reversed .role-content { order: 2; }
  }
  .framework-summary { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .tech-section { padding: 4rem 1.25rem; }
  .highlights-grid { grid-template-columns: 1fr; }
  .framework-showcase { padding: 1.5rem; }
  .role-image-frame { padding: 1rem; }
}
</style>
