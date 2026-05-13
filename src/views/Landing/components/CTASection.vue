<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import wechatLogin from '@/utils/wechatLogin'

const router = useRouter()

// 关键要点
const keyPoints = ref([
  '多智能体协作系统：7 个专业 AI 角色分工协作，完成全流程投资分析与决策',
  '专注 A 股市场：覆盖上交所、深交所、北交所近 5000 只 A 股，中文金融语境深度优化',
  '国产大模型驱动：集成 DeepSeek V4、阿里千问 Qwen 等国产主流 LLM，合规可控',
  '在线即用：免安装免环境配置，新用户注册即送 5 算力，邀请好友双方各得 3 算力',
  '专业研报输出：支持 PDF / Word / Markdown 导出，包含完整推理链与多空辩证记录',
])

// FAQ（与 index.html JSON-LD 保持一致，有利于 SEO）
const faqs = ref([
  {
    q: 'TradingAgents 中文版是什么？',
    a: 'TradingAgents 中文版（TradingAgents-CN）是面向 A 股投资者的多智能体 AI 股票分析在线平台。由基本面分析师、情绪分析师、新闻分析师、技术分析师与研究员、交易员、风险经理等多个专业 AI 角色协作，整合 A 股行情、财报、新闻与市场情绪，输出可解释的 AI 研报。',
    open: true,
  },
  {
    q: '支持哪些 LLM 模型？',
    a: '目前集成国产主流大模型，包括 DeepSeek V4、阿里千问 Qwen 等，后续将持续接入更多国产模型。您可以在界面一键切换模型，也支持同时使用多个模型进行对比分析，权衡不同模型的思路与观点。',
    open: false,
  },
  {
    q: '支持哪些股票市场？',
    a: 'TradingAgents 中文版目前专注于中国 A 股市场，全面覆盖上交所主板、科创板、深交所主板、创业板以及北交所近 5000 只 A 股。A 股数据通过 Tushare 、 AkShare 、 BaoStock 等主流数据源获取，确保数据的实时性与准确性。',
    open: false,
  },
  {
    q: '如何开始使用 TradingAgents 中文版？',
    a: '无需任何安装或部署，打开官网注册账号后即可在线使用。新用户注册即赠免费分析额度，输入股票代码或名称，选择分析模型和分析维度，即可开始 AI 分析，几分钟内获得专业研报。',
    open: false,
  },
  {
    q: 'AI 的分析结果可以直接用于实盘交易吗？',
    a: 'TradingAgents 中文版仅供研究与教育用途，不构成任何投资建议。实际投资决策需结合您个人的风险承受能力、市场环境与专业顾问意见，平台对任何投资损失不承担责任。',
    open: false,
  },
])

const toggleFaq = (i: number) => {
  faqs.value[i].open = !faqs.value[i].open
}

const handleStartNow = () => {
  if (wechatLogin.isWechat()) {
    wechatLogin.startAuth()
  } else {
    router.push('/login')
  }
}

const handleScrollTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <section class="cta-section">
    <div class="cta-container">
      <!-- ========= 关键要点 ========= -->
      <div class="section-header">
        <div class="label-badge">
          <span class="badge-dot" />
          <span>关键要点</span>
        </div>
        <h2 class="section-titleas">
          一眼看懂
          <span class="gradient-text">TradingAgents 中文版</span>
        </h2>
        <p class="section-subtitle">数据来源：TradingAgents 研究论文（arXiv:2412.20138） | 最后更新：2026 年</p>
      </div>

      <ul class="keypoints">
        <li v-for="(p, i) in keyPoints" :key="i" class="keypoint">
          <span class="kp-num">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="kp-text">{{ p }}</span>
        </li>
      </ul>

      <!-- ========= FAQ ========= -->
      <div class="section-header sub-header">
        <div class="label-badge">
          <span class="badge-dot" />
          <span>常见问题</span>
        </div>
        <h2 class="section-titleas">
          关于 TradingAgents 中文版的
          <span class="gradient-text">常见问题解答</span>
        </h2>
      </div>

      <div class="faq-list">
        <div
          v-for="(f, i) in faqs"
          :key="i"
          class="faq-item"
          :class="{ open: f.open }"
          @click="toggleFaq(i)"
        >
          <div class="faq-question">
            <span class="faq-q-text">{{ f.q }}</span>
            <span class="faq-toggle">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </div>
          <div class="faq-answer" v-show="f.open">
            <p>{{ f.a }}</p>
          </div>
        </div>
      </div>

      <!-- ========= 行动号召 ========= -->
      <div class="cta-card">
        <div class="cta-card-bg" />

        <h2 class="cta-title">
          立即开始您的
          <span class="gradient-text">AI 研报之旅</span>
        </h2>
        <p class="cta-subtitle">
          <span class="highlight-benefit">🎁 新用户注册即送算力</span> · 邀请好友再得奖励 · 免安装在线即用
          <br>
          <span class="disclaimer">仅供研究与教育用途，不构成投资建议。</span>
        </p>

        <div class="cta-actions">
          <button class="cta-btn primary-btn" @click="handleStartNow">
            <span>免费注册 · 领取算力</span>
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="cta-btn secondary-btn" @click="handleScrollTop">
            <span>回到顶部</span>
          </button>
        </div>

        <div class="trust-indicators">
          <div class="trust-item">
            <span class="trust-icon-wrap green">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span>注册即赠免费额度</span>
          </div>
          <div class="trust-item">
            <span class="trust-icon-wrap blue">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span>数据与隐私安全</span>
          </div>
          <div class="trust-item">
            <span class="trust-icon-wrap cyan">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span>几分钟得出研报</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.cta-section {
  position: relative;
  padding: 6rem 3rem 8rem;
  overflow: hidden;
}

.cta-container {
  position: relative;
  z-index: 10;
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.sub-header { margin-top: 6rem; }

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
  font-size: clamp(1.75rem, 3.5vw, 2.75rem);
  font-weight: 800;
  color: #f1f5f9;
  line-height: 1.25;
  margin-bottom: 0.75rem;
}

.gradient-text {
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  color: #94a3b8;
  font-size: 0.9375rem;
}

/* ===== 关键要点 ===== */
.keypoints {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
}

.keypoint {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1.25rem 1.5rem;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(6, 182, 212, 0.18);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(6, 182, 212, 0.4);
  }
}

.kp-num {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 800;
  font-size: 1.5rem;
  color: transparent;
  background: linear-gradient(135deg, #10b981, #06b6d4);
  -webkit-background-clip: text;
  background-clip: text;
  flex-shrink: 0;
  min-width: 40px;
}

.kp-text {
  color: #cbd5e1;
  font-size: 0.9375rem;
  line-height: 1.6;
}

/* ===== FAQ ===== */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 6rem;
}

.faq-item {
  padding: 1.25rem 1.75rem;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(6, 182, 212, 0.15);
  border-radius: 14px;
  cursor: pointer;
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;

  &:hover { border-color: rgba(6, 182, 212, 0.35); }

  &.open {
    background: rgba(6, 182, 212, 0.06);
    border-color: rgba(6, 182, 212, 0.45);

    .faq-toggle { transform: rotate(180deg); }
  }
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.faq-q-text {
  font-size: 1.0625rem;
  font-weight: 600;
  color: #f1f5f9;
}

.faq-toggle {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  color: #06b6d4;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;

  svg { width: 20px; height: 20px; }
}

.faq-answer {
  margin-top: 0.875rem;
  padding-top: 0.875rem;
  border-top: 1px solid rgba(6, 182, 212, 0.12);

  p {
    margin: 0;
    color: #94a3b8;
    font-size: 0.9375rem;
    line-height: 1.75;
  }
}

/* ===== 行动号召 ===== */
.cta-card {
  position: relative;
  padding: 4rem 3rem;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(16, 185, 129, 0.05));
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 32px;
  backdrop-filter: blur(20px);
  text-align: center;
  overflow: hidden;
}

.cta-card-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 20%, rgba(6, 182, 212, 0.2) 0%, transparent 60%),
              radial-gradient(circle at 70% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 60%);
  filter: blur(40px);
  z-index: -1;
}

.cta-title {
  font-size: clamp(1.75rem, 3.5vw, 2.5rem);
  font-weight: 900;
  color: #f1f5f9;
  margin: 0 0 1rem;
}

/* 福利高亮：金色脉冲，引导用户点击注册 */
.highlight-benefit {
  display: inline-block;
  font-weight: 700;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.3px;
  animation: ctaBenefitPulse 2.4s ease-in-out infinite;
}

@keyframes ctaBenefitPulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.7; }
}

.cta-subtitle {
  font-size: 1.0625rem;
  color: #cbd5e1;
  line-height: 1.7;
  margin: 0 0 2rem;

  .disclaimer {
    font-size: 0.875rem;
    color: #fbbf24;
    opacity: 0.8;
  }
}

.cta-actions {
  display: flex;
  gap: 1.25rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 2.5rem;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.9375rem 2.25rem;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.primary-btn {
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  color: #fff;
  box-shadow: 0 10px 30px rgba(6, 182, 212, 0.35);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(6, 182, 212, 0.5);
  }
}

.secondary-btn {
  background: transparent;
  border: 2px solid rgba(6, 182, 212, 0.4);
  color: #06b6d4;

  &:hover {
    background: rgba(6, 182, 212, 0.1);
    border-color: #06b6d4;
    transform: translateY(-3px);
  }
}

.btn-icon { width: 18px; height: 18px; transition: transform 0.3s ease; }

.primary-btn:hover .btn-icon { transform: translateX(4px); }

.trust-indicators {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
  padding-top: 2rem;
  border-top: 1px solid rgba(6, 182, 212, 0.15);
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 0.9375rem;
  color: #cbd5e1;
}

.trust-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg { width: 18px; height: 18px; }

  &.green { background: rgba(16, 185, 129, 0.15); color: #10b981; }
  &.blue { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
  &.cyan { background: rgba(6, 182, 212, 0.15); color: #06b6d4; }
}

@media (max-width: 768px) {
  .cta-section { padding: 4rem 1.25rem 6rem; }
  .keypoints { grid-template-columns: 1fr; }
  .keypoint { padding: 1rem 1.25rem; }
  .faq-item { padding: 1rem 1.25rem; }
  .cta-card { padding: 2.5rem 1.5rem; }
  .cta-btn { width: 100%; justify-content: center; }
  .trust-indicators { flex-direction: column; gap: 1rem; }
}
</style>
