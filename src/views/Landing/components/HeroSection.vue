<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Logo from '@/components/Logo.vue'

const router = useRouter()
const authStore = useAuthStore()

// 粒子配置
const particles = ref<Array<{
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
}>>([])

// 初始化粒子
const initParticles = () => {
  particles.value = Array.from({ length: 50 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    speedX: (Math.random() - 0.5) * 0.5,
    speedY: (Math.random() - 0.5) * 0.5,
    opacity: Math.random() * 0.5 + 0.3
  }))
}

// 模拟股票数据流（仅A股）
const stockData = ref([
  { code: 'SH.600519', name: '贵州茅台', price: '+2.34%', trend: 'up' },
  { code: 'SZ.000858', name: '五粮液', price: '+1.89%', trend: 'up' },
  { code: 'SH.601318', name: '中国平安', price: '+0.89%', trend: 'up' },
  { code: 'SZ.000001', name: '平安银行', price: '+1.12%', trend: 'up' },
  { code: 'SH.600036', name: '招商银行', price: '+0.76%', trend: 'up' },
  { code: 'SZ.002594', name: '比亚迪', price: '+3.45%', trend: 'up' },
  { code: 'SH.688981', name: '中芯国际', price: '-0.23%', trend: 'down' },
  { code: 'SZ.300750', name: '宁德时代', price: '+2.18%', trend: 'up' },
])

const handleStartAnalysis = () => {
  // 检查登录状态
  if (!authStore.isAuthenticated) {
    // 未登录，跳转到登录页
    router.push('/login')
  } else {
    // 已登录，跳转到分析页
    router.push('/analysis/single')
  }
}

const handleViewDemo = () => {
  // 滚动到功能介绍区（直接滚动一屏高度）
  window.scrollTo({
    top: window.innerHeight,
    behavior: 'smooth'
  })
}

const handleLogin = () => {
  router.push('/login')
}

onMounted(() => {
  initParticles()
})
</script>

<template>
  <div class="hero-section">
    <!-- 动态背景层 -->
    <div class="hero-background">
      <!-- 粒子效果 -->
      <div class="particles-container">
        <div
          v-for="(particle, index) in particles"
          :key="index"
          class="particle"
          :style="{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity
          }"
        />
      </div>

      <!-- 网格背景（增强） -->
      <div class="grid-overlay" />

      <!-- 扫描线效果 -->
      <div class="scan-line" />

      <!-- 光晕效果 -->
      <div class="glow-effect glow-1" />
      <div class="glow-effect glow-2" />
      <div class="glow-effect glow-3" />
    </div>

    <!-- 导航栏 -->
    <nav class="hero-nav">
      <div class="nav-content">
        <div class="nav-logo">
          <div class="logo-glow">
            <Logo :size="40" />
          </div>
          <span class="logo-text">FinAgents</span>
          <span class="logo-badge">AI</span>
        </div>

        <el-button type="primary" class="login-btn" @click="handleLogin">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="cta-label">登录</span>
        </el-button>
      </div>
    </nav>

    <!-- 主内容区（非对称布局） -->
    <div class="hero-content">
      <div class="content-wrapper">
        <!-- 左侧：文字内容 -->
        <div class="hero-text">
          <div class="label-badge">
            <span class="badge-dot" />
            <span>下一代量化交易平台</span>
          </div>

          <h1 class="hero-title">
            <span class="title-line-1">AI 驱动的</span>
            <span class="title-line-2">
              <span class="gradient-text">智能股票分析</span>
              平台
            </span>
          </h1>

          <p class="hero-subtitle">
            深度分析 · 实时洞察 · 精准决策
            <br>
            <span class="highlight">让每一次投资都基于数据与智能</span>
          </p>

          <!-- CTA 按钮组 -->
          <div class="cta-buttons">
            <el-button type="primary" size="large" class="cta-primary" @click="handleStartAnalysis">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="cta-label">开始免费分析</span>
              <div class="button-glow" />
            </el-button>
            <el-button size="large" class="cta-secondary" @click="handleViewDemo">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <polygon points="10,8 16,12 10,16" fill="currentColor"/>
              </svg>
              <span class="cta-label">查看演示</span>
            </el-button>
          </div>

          <!-- 数据统计 -->
          <div class="stats-row">
            <div class="stat-itemas">
              <div class="stat-value">A股</div>
              <div class="stat-label">市场覆盖</div>
            </div>
            <div class="stat-divider" />
            <div class="stat-itemas">
              <div class="stat-value">5000+</div>
              <div class="stat-label">上市公司</div>
            </div>
            <div class="stat-divider" />
            <div class="stat-itemas">
              <div class="stat-value">24/7</div>
              <div class="stat-label">实时监控</div>
            </div>
          </div>
        </div>

        <!-- 右侧：A股数据卡片 -->
        <div class="hero-visual">
          <div class="data-card card-1">
            <div class="card-header">
              <span class="card-titleas">上证指数</span>
              <span class="card-trend up">+1.85%</span>
            </div>
            <div class="card-chart">
              <svg viewBox="0 0 100 40" class="mini-chart">
                <polyline
                  points="0,30 20,25 40,28 60,15 80,18 100,10"
                  fill="none"
                  stroke="url(#chartGradient)"
                  stroke-width="2"
                />
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#06b6d4" />
                    <stop offset="100%" style="stop-color:#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div class="card-meta">
              <span class="meta-label">3,234.56</span>
            </div>
          </div>

          <div class="data-card card-2">
            <div class="card-header">
              <span class="card-titleas">深证成指</span>
              <span class="card-trend up">+2.13%</span>
            </div>
            <div class="card-chart">
              <svg viewBox="0 0 100 40" class="mini-chart">
                <polyline
                  points="0,25 20,20 40,22 60,12 80,15 100,8"
                  fill="none"
                  stroke="url(#chartGradient2)"
                  stroke-width="2"
                />
                <defs>
                  <linearGradient id="chartGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#06b6d4" />
                    <stop offset="100%" style="stop-color:#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div class="card-meta">
              <span class="meta-label">10,876.32</span>
            </div>
          </div>

          <div class="data-card card-3">
            <div class="card-header">
              <span class="card-titleas">创业板指</span>
              <span class="card-trend up">+1.67%</span>
            </div>
            <div class="card-chart">
              <svg viewBox="0 0 100 40" class="mini-chart">
                <polyline
                  points="0,28 20,24 40,26 60,18 80,20 100,12"
                  fill="none"
                  stroke="url(#chartGradient3)"
                  stroke-width="2"
                />
                <defs>
                  <linearGradient id="chartGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#06b6d4" />
                    <stop offset="100%" style="stop-color:#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div class="card-meta">
              <span class="meta-label">2,345.78</span>
            </div>
          </div>

          <!-- 装饰光晕 -->
          <div class="visual-glow" />
        </div>
      </div>
    </div>

    <!-- 股票数据流 -->
    <div class="stock-ticker">
      <div class="ticker-content">
        <div v-for="(stock, index) in [...stockData, ...stockData, ...stockData]" :key="index" class="ticker-item">
          <span class="stock-code">{{ stock.code }}</span>
          <span class="stock-name">{{ stock.name }}</span>
          <span class="stock-price" :class="stock.trend">{{ stock.price }}</span>
        </div>
      </div>
    </div>

    <!-- 滚动提示 -->
    <div class="scroll-indicator">
      <div class="scroll-text">SCROLL</div>
      <svg class="scroll-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5v14M19 12l-7 7-7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  </div>
</template>

<style scoped lang="scss">
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: radial-gradient(ellipse at top, #164e63 0%, #0f172a 50%, #020617 100%);
}

// ========== 动态背景层 ==========
.hero-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

// 粒子效果
.particles-container {
  position: absolute;
  inset: 0;
}

.particle {
  position: absolute;
  background: radial-gradient(circle, #06b6d4 0%, transparent 70%);
  border-radius: 50%;
  animation: particle-float 20s infinite ease-in-out;
  pointer-events: none;
}

@keyframes particle-float {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-20px) translateX(10px);
  }
  50% {
    transform: translateY(-10px) translateX(-10px);
  }
  75% {
    transform: translateY(-30px) translateX(5px);
  }
}

// 网格背景（增强）
.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(6, 182, 212, 0.08) 1.5px, transparent 1.5px),
    linear-gradient(90deg, rgba(6, 182, 212, 0.08) 1.5px, transparent 1.5px),
    linear-gradient(rgba(16, 185, 129, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16, 185, 129, 0.04) 1px, transparent 1px);
  background-size: 100px 100px, 100px 100px, 20px 20px, 20px 20px;
  background-position: -1px -1px, -1px -1px, -1px -1px, -1px -1px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
  animation: grid-move 30s linear infinite;
}

@keyframes grid-move {
  0% {
    background-position: 0 0, 0 0, 0 0, 0 0;
  }
  100% {
    background-position: 100px 100px, 100px 100px, 20px 20px, 20px 20px;
  }
}

// 扫描线效果
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

// 光晕效果
.glow-effect {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.3;
  animation: glow-pulse 8s ease-in-out infinite;
}

.glow-1 {
  top: 10%;
  left: 15%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #06b6d4 0%, transparent 70%);
  animation-delay: 0s;
}

.glow-2 {
  top: 50%;
  right: 10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, #10b981 0%, transparent 70%);
  animation-delay: 2s;
}

.glow-3 {
  bottom: 10%;
  left: 30%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #0ea5e9 0%, transparent 70%);
  animation-delay: 4s;
}

@keyframes glow-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.5;
  }
}

// ========== 导航栏 ==========
.hero-nav {
  position: relative;
  z-index: 100;
  padding: 2rem 3rem;
  backdrop-filter: blur(20px);
  background: linear-gradient(to bottom, rgba(15, 23, 42, 0.8), transparent);
}

.nav-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.logo-glow {
  position: relative;
  display: flex;
  align-items: center;
  
  &::before {
    content: '';
    position: absolute;
    inset: -8px;
    background: radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, transparent 70%);
    border-radius: 50%;
    filter: blur(12px);
    animation: logo-pulse 3s ease-in-out infinite;
  }
}

@keyframes logo-pulse {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.logo-text {
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

.logo-badge {
  background: linear-gradient(135deg, #059669 0%, #06b6d4 100%);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
}

.login-btn {
  background: linear-gradient(135deg, #059669 0%, #06b6d4 100%);
  border: none;
  padding: 0.875rem 1.75rem;
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(6, 182, 212, 0.3);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(6, 182, 212, 0.5);
  }

  .btn-icon {
    width: 20px;
    height: 20px;
  }
}

// ========== 主内容（非对称布局）==========
.hero-content {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  align-items: center;
  padding: 2rem 3rem 10rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 4rem;
  width: 100%;
  align-items: center;
}

// 左侧文字
.hero-text {
  text-align: left;
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
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
//   animation: badge-float 3s ease-in-out infinite;
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #10b981, #06b6d4);
  border-radius: 50%;
  animation: dot-pulse 2s ease-in-out infinite;
}

@keyframes badge-float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes dot-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
  }
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 5rem);
  font-weight: 900;
  line-height: 1.1;
  color: #f1f5f9;
  margin-bottom: 1.5rem;
  letter-spacing: -0.03em;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.title-line-1 {
  display: block;
  opacity: 0.9;
}

.title-line-2 {
  display: block;
}

.gradient-text {
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  display: inline-block;
  filter: drop-shadow(0 0 30px rgba(6, 182, 212, 0.5));
  animation: text-glow 3s ease-in-out infinite;
}

@keyframes text-glow {
  0%, 100% {
    filter: drop-shadow(0 0 20px rgba(6, 182, 212, 0.4));
  }
  50% {
    filter: drop-shadow(0 0 40px rgba(6, 182, 212, 0.8));
  }
}

.hero-subtitle {
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: #94a3b8;
  line-height: 1.8;
  margin-bottom: 3rem;
  font-weight: 400;

  .highlight {
    color: #06b6d4;
    font-weight: 500;
  }
}

// CTA 按钮
.cta-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
}

.cta-primary {
  background: linear-gradient(135deg, #059669 60%, #06b6d4 40%);
  border: none;
  padding: 1.25rem 2.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(6, 182, 212, 0.4);

  .button-glow {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%);
    // opacity: 0;
    transition: opacity 0.4s ease;
  }

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 16px 50px rgba(6, 182, 212, 0.6);

    .button-glow {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(-2px) scale(0.98);
  }

  .btn-icon,
  span {
    position: relative;
    z-index: 1;
  }

  .btn-icon {
    width: 22px;
    height: 22px;
  }
}

.cta-secondary {
  background: rgba(6, 182, 212, 0.05);
  border: 2px solid rgba(6, 182, 212, 0.4);
  color: #06b6d4;
  padding: 1.25rem 2.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  margin: 0;

  &:hover {
    background: rgba(6, 182, 212, 0.15);
    border-color: #06b6d4;
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(6, 182, 212, 0.3);
  }

  .btn-icon {
    width: 22px;
    height: 22px;
  }
}

// 数据统计
.stats-row {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.stat-itemas {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: linear-gradient(to bottom, transparent, rgba(6, 182, 212, 0.3), transparent);
}

// 右侧3D数据卡片
.hero-visual {
  position: relative;
  height: 500px;
}

.data-card {
  position: absolute;
  width: 280px;
  padding: 1.5rem;
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: card-float 6s ease-in-out infinite;

  &:hover {
    transform: translateY(-10px) scale(1.05) !important;
    box-shadow: 0 30px 80px rgba(6, 182, 212, 0.4);
    border-color: rgba(6, 182, 212, 0.5);
  }
}

.card-1 {
  top: 0;
  left: 0;
  animation-delay: 0s;
  z-index: 3;
}

.card-2 {
  top: 150px;
  right: 20px;
  animation-delay: 2s;
  z-index: 2;
}

.card-3 {
  bottom: 20px;
  left: 50px;
  animation-delay: 4s;
  z-index: 1;
}

@keyframes card-float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(2deg);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-titleas {
  font-size: 0.875rem;
  color: #94a3b8;
  font-weight: 600;
}

.card-trend {
  font-size: 1.125rem;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;

  &.up {
    color: #10b981;
  }

  &.down {
    color: #ef4444;
  }
}

.card-chart {
  height: 80px;
  display: flex;
  align-items: flex-end;
  margin-bottom: 0.75rem;
}

.mini-chart {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.4));
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(6, 182, 212, 0.1);
}

.meta-label {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f1f5f9;
  font-family: 'JetBrains Mono', monospace;
}

.visual-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%);
  filter: blur(80px);
  animation: visual-glow-pulse 6s ease-in-out infinite;
  z-index: 0;
}

@keyframes visual-glow-pulse {
  0%, 100% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

// ========== 股票数据流 ==========
.stock-ticker {
  position: absolute;
  bottom: 5rem;
  left: 0;
  right: 0;
  z-index: 20;
  overflow: hidden;
  padding: 0.6rem 0;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(15, 23, 42, 0.8) 10%, 
    rgba(15, 23, 42, 0.8) 90%, 
    transparent 100%
  );
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(6, 182, 212, 0.3);
  border-bottom: 1px solid rgba(6, 182, 212, 0.3);
  box-shadow: 
    0 -10px 30px rgba(6, 182, 212, 0.1),
    0 10px 30px rgba(6, 182, 212, 0.1);
}

.ticker-content {
  display: flex;
  gap: 4rem;
  animation: scroll-ticker 40s linear infinite;
  width: fit-content;
}

.ticker-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  white-space: nowrap;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  background: rgba(6, 182, 212, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(6, 182, 212, 0.1);
}

.stock-code {
  color: #06b6d4;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8125rem;
}

.stock-name {
  color: #94a3b8;
  font-weight: 500;
}

.stock-price {
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;

  &.up {
    color: #10b981;
  }

  &.down {
    color: #ef4444;
  }
}

@keyframes scroll-ticker {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-33.333%);
  }
}

// ========== 滚动指示器 ==========
.scroll-indicator {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  animation: scroll-bounce 2s ease-in-out infinite;
}

.scroll-text {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: rgba(6, 182, 212, 0.6);
}

.scroll-icon {
  width: 24px;
  height: 24px;
  stroke: rgba(6, 182, 212, 0.6);
  color: rgba(6, 182, 212, 0.6);
}

@keyframes scroll-bounce {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(10px);
  }
}

// ========== 响应式 ==========
@media (max-width: 1024px) {
  .content-wrapper {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .hero-visual {
    display: none;
  }

  .hero-text {
    text-align: center;
  }

  .label-badge,
  .cta-buttons,
  .stats-row {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .hero-nav {
    padding: 1rem 1.5rem;
  }

  .hero-content {
    padding: 2rem 1.5rem 8rem;
  }

  .logo-text {
    font-size: 1.25rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .cta-buttons {
    flex-direction: column;
    width: 100%;

    button {
      width: 100%;
      justify-content: center;
    }
  }

  .stats-row {
    gap: 1rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }

  .stock-ticker {
    bottom: 5rem;
  }

  .geometric-shape {
    opacity: 0.1;
  }
}

.cta-label{
    margin-left: 0.5rem;
}

// ========== 深色主题适配 ==========
:global(.dark) {
  .hero-section {
    background: radial-gradient(ellipse at top, #0c4a6e 0%, #020617 50%, #000000 100%);
  }
}
</style>
