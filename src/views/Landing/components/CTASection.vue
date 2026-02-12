<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const handleStartNow = () => {
  router.push('/login')
}

const handleLearnMore = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <section class="cta-section">
    <div class="cta-container">
      <!-- 扫描线效果 -->
      <!-- <div class="scan-line" /> -->

      <!-- 主内容区 -->
      <div class="cta-content">
        <!-- 标题 -->
        <h2 class="cta-title">
          开启您的
          <span class="gradient-text">智能投资</span>
          之旅
        </h2>

        <!-- 副标题 -->
        <p class="cta-subtitle">
          加入数千位投资者，使用 AI 技术提升投资决策能力
        </p>

        <!-- 按钮组 -->
        <div class="cta-actions">
          <button class="cta-btn primary-btn" @click="handleStartNow">
            <span>立即开始</span>
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <button class="cta-btn secondary-btn" @click="handleLearnMore">
            <span>了解更多</span>
          </button>
        </div>

        <!-- 信任指标 -->
        <div class="trust-indicators">
          <div class="trust-item">
            <svg class="trust-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="url(#gradientTrust1)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <defs>
                <linearGradient id="gradientTrust1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#06b6d4" />
                  <stop offset="100%" style="stop-color:#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <span>免费试用</span>
          </div>

          <div class="trust-item">
            <svg class="trust-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke="url(#gradientTrust2)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <defs>
                <linearGradient id="gradientTrust2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#06b6d4" />
                  <stop offset="100%" style="stop-color:#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <span>数据安全</span>
          </div>

          <div class="trust-item">
            <svg class="trust-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="url(#gradientTrust3)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <defs>
                <linearGradient id="gradientTrust3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#06b6d4" />
                  <stop offset="100%" style="stop-color:#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <span>即时响应</span>
          </div>
        </div>
      </div>

      <!-- 底部装饰线 -->
      <div class="bottom-decorator" />
    </div>
  </section>
</template>

<style scoped lang="scss">
.cta-section {
  position: relative;
  min-height: 90vh;
  padding: 4rem 3rem 10rem 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
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
    transform: translateY(80vh);
    opacity: 0;
  }
}

// 容器
.cta-container {
  position: relative;
  z-index: 10;
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}

// 主内容
.cta-content {
  position: relative;
  padding: 4rem 3rem 8rem 3rem;
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: 32px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent 0%,
      rgba(6, 182, 212, 0.5) 50%,
      transparent 100%
    );
  }
}

// 标题
.cta-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 900;
  line-height: 1.1;
  color: #f1f5f9;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
}

.gradient-text {
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

// 副标题
.cta-subtitle {
  font-size: clamp(1.125rem, 2vw, 1.5rem);
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

// 按钮组
.cta-actions {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 3rem;
}

.cta-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: inherit;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }
}

// 主按钮
.primary-btn {
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  border: none;
  color: #ffffff;
  box-shadow: 0 10px 30px rgba(6, 182, 212, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 40px rgba(6, 182, 212, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

.btn-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.primary-btn:hover .btn-icon {
  transform: translateX(4px);
}

// 次要按钮
.secondary-btn {
  background: transparent;
  border: 2px solid rgba(6, 182, 212, 0.4);
  color: #06b6d4;

  &:hover {
    background: rgba(6, 182, 212, 0.1);
    border-color: rgba(6, 182, 212, 0.6);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
}

// 信任指标
.trust-indicators {
  display: flex;
  gap: 3rem;
  justify-content: center;
  flex-wrap: wrap;
  padding-top: 2rem;
  border-top: 1px solid rgba(6, 182, 212, 0.15);
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #94a3b8;
}

.trust-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

// 底部装饰线
.bottom-decorator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 4px;
  background: linear-gradient(90deg, 
    transparent 0%,
    #06b6d4 50%,
    transparent 100%
  );
  border-radius: 100px;
  opacity: 0.5;
}

// 响应式
@media (max-width: 768px) {
  .cta-section {
    padding: 4rem 1.5rem;
    min-height: 70vh;
  }

  .cta-content {
    padding: 3rem 2rem;
  }

  .cta-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .cta-btn {
    width: 100%;
    justify-content: center;
  }

  .trust-indicators {
    gap: 1.5rem;
    flex-direction: column;
  }
}
</style>
