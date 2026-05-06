<template>
  <div class="about-page">
    <!-- Hero -->
    <section class="hero">
      <h1>TradingAgents 中文版</h1>
      <p class="subtitle">多智能体 AI 股票分析平台，专为 A 股投资者打造</p>
    </section>

    <!-- 介绍 -->
    <section class="intro">
      <h2>我们是谁</h2>
      <p>
        TradingAgents 中文版基于美国 Tauric Research 开源的
        <a href="https://github.com/TauricResearch/TradingAgents" target="_blank" rel="noopener">TradingAgents</a>
        多智能体金融交易决策框架，由国内团队重新设计并针对 A 股市场深度适配。
        我们将复杂的多智能体协作能力包装为“打开网页即可使用”的在线服务，无需任何安装部署。
      </p>
    </section>

    <!-- 核心能力 -->
    <section class="capabilities">
      <h2>核心能力</h2>
      <div class="cap-grid">
        <div class="cap-card">
          <div class="cap-icon">
            <el-icon><Cpu /></el-icon>
          </div>
          <h3>多智能体协作</h3>
          <p>基本面、技术面、情绪面、新闻面分析师分工协作，研究员汇总、交易员决策、风控员抦截，模拟真实投研团队工作流。</p>
        </div>
        <div class="cap-card">
          <div class="cap-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <h3>国产大模型驱动</h3>
          <p>集成 DeepSeek V4、阿里通义千问 Qwen 等主流国产大模型，支持一键切换与多模型对比分析。</p>
        </div>
        <div class="cap-card">
          <div class="cap-icon">
            <el-icon><Document /></el-icon>
          </div>
          <h3>可解释 AI 研报</h3>
          <p>多空辩证过程透明展示，输出专业级分析报告，支持 PDF / Excel 导出，方便存档与分享。</p>
        </div>
        <div class="cap-card">
          <div class="cap-icon">
            <el-icon><Search /></el-icon>
          </div>
          <h3>A 股全市场覆盖</h3>
          <p>支持上交所、深交所、北交所全部 A 股，数据源多路备份，行情与新闻实时同步。</p>
        </div>
      </div>
    </section>

    <!-- 技术栈 -->
    <section class="tech">
      <h2>技术架构</h2>
      <div class="tech-list">
        <div class="tech-item">
          <span class="label">前端</span>
          <span class="value">Vue 3 + Vite + Element Plus + TypeScript</span>
        </div>
        <div class="tech-item">
          <span class="label">后端</span>
          <span class="value">FastAPI + MongoDB + Redis</span>
        </div>
        <div class="tech-item">
          <span class="label">AI 引擎</span>
          <span class="value">LangChain + 多智能体编排 + RAG 增强检索</span>
        </div>
        <div class="tech-item">
          <span class="label">部署</span>
          <span class="value">Docker + Nginx + 预渲染 SSG</span>
        </div>
      </div>
    </section>

    <!-- 联系 -->
    <section class="contact">
      <h2>联系我们</h2>
      <p>如有合作、反馈或建议，欢迎通过以下方式联系：</p>
      <div class="contact-list">
        <div class="contact-item">
          <el-icon><ChatDotRound /></el-icon>
          <span>微信公众号：TradingAgents中文版</span>
        </div>
        <div class="contact-item">
          <el-icon><Message /></el-icon>
          <span>邮箱：support@nbstockai.com</span>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <h3>立即体验 AI 股票分析</h3>
      <p>注册即获免费算力，输入股票代码开始你的第一次 AI 研报</p>
      <el-button type="primary" size="large" @click="$router.push('/login')">免费体验</el-button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useSeo } from '@/composables/useSeo'
import { TrendCharts, Search, Document, Cpu, ChatDotRound, Message } from '@element-plus/icons-vue'

useSeo({
  title: '关于 TradingAgents 中文版 | 多智能体 AI 股票分析平台',
  description: 'TradingAgents 中文版是面向 A 股投资者的多智能体 AI 分析平台，基于 DeepSeek V4、阿里千问 Qwen 等国产大模型，提供可解释的 AI 研报。',
  keywords: 'TradingAgents介绍,TradingAgents中文版,多智能体AI,AI股票分析平台,DeepSeek炒股,千问股票分析',
  path: '/about',
})
</script>

<style lang="scss" scoped>
.about-page {
  max-width: 860px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.hero {
  text-align: center;
  padding: 48px 0 40px;

  h1 {
    font-size: 36px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 12px;
  }

  .subtitle {
    font-size: 17px;
    color: #475569;
    margin: 0;
  }
}

section {
  margin-bottom: 48px;

  h2 {
    font-size: 24px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 16px;
    padding-bottom: 10px;
    border-bottom: 2px solid #e5e7eb;
  }

  > p {
    font-size: 15px;
    line-height: 1.8;
    color: #374151;
    margin: 0 0 16px;

    a {
      color: #2563eb;
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }
  }
}

.cap-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.cap-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  }

  .cap-icon {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: linear-gradient(135deg, #3b82f6, #06b6d4);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 20px;
    margin-bottom: 14px;
  }

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #0f172a;
    margin: 0 0 8px;
  }

  p {
    font-size: 13px;
    line-height: 1.7;
    color: #64748b;
    margin: 0;
  }
}

.tech-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tech-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 8px;

  .label {
    font-size: 13px;
    font-weight: 600;
    color: #2563eb;
    min-width: 60px;
  }

  .value {
    font-size: 14px;
    color: #374151;
  }
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  color: #374151;

  .el-icon {
    font-size: 18px;
    color: #3b82f6;
  }
}

.cta {
  text-align: center;
  background: linear-gradient(135deg, #eff6ff, #e0f2fe);
  border-radius: 16px;
  padding: 40px 24px;

  h3 {
    font-size: 22px;
    color: #0f172a;
    margin: 0 0 10px;
    border: none;
    padding: 0;
  }

  p {
    font-size: 14px;
    color: #475569;
    margin: 0 0 20px;
  }
}

@media (max-width: 640px) {
  .hero h1 { font-size: 28px; }
  .cap-grid { grid-template-columns: 1fr; }
}
</style>
