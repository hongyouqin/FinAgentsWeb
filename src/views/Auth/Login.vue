<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="login-background">
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
      <div class="grid-overlay" />
      <div class="scan-line" />
      <div class="glow-effect glow-1" />
      <div class="glow-effect glow-2" />
    </div>

    <div class="login-container">
      <!-- Logo 区 -->
      <div class="login-header">
        <div class="logo-wrapper">
          <Logo :size="56" />
        </div>
        <h1 class="title">NB.STOCK</h1>
        <p class="subtitle">牛逼股票</p>
      </div>

      <!-- 登录卡片 -->
      <el-card class="login-card" shadow="never">
        <!-- 微信扫码登录 -->
        <div class="wechat-login-container">
          <!-- 二维码加载状态 -->
          <div v-if="qrcodeLoading" class="qrcode-loading">
            <el-icon class="loading-icon" :size="40">
              <Loading />
            </el-icon>
            <p class="loading-text">正在加载二维码...</p>
          </div>

          <!-- 二维码显示 -->
          <div v-else-if="qrUrl" class="qrcode-display">
            <div class="qrcode-header">
              <img :src="wxlogo" alt="微信" class="wechat-icon" />
              <h3>微信扫码登录</h3>
            </div>
            
            <div class="qrcode-wrapper">
              <img :src="qrUrl" alt="微信登录二维码" class="qrcode-image" />
              <div v-if="qrcodeExpired" class="qrcode-expired-mask">
                <el-icon :size="48" color="#fff">
                  <RefreshRight />
                </el-icon>
                <p class="expired-text">二维码已过期</p>
                <el-button type="primary" size="small" @click="refreshQrcode">
                  点击刷新
                </el-button>
              </div>
            </div>

            <div class="qrcode-tips">
              <p class="tip-text">请使用微信扫一扫</p>
              <p class="tip-subtext">扫码后关注公众号即可完成登录</p>
              <p class="tip-agreement">
                登录即表示同意
                <router-link to="/user-agreement" class="agreement-link">《用户协议》</router-link>
                和
                <router-link to="/privacy-policy" class="agreement-link">《隐私政策》</router-link>
              </p>
            </div>

            <div class="qrcode-timer">
              <el-icon><Clock /></el-icon>
              <span>二维码剩余有效期: {{ formatTime(qrcodeCountdown) }}</span>
            </div>
          </div>

          <!-- 错误状态 -->
          <div v-else-if="qrcodeError" class="qrcode-error">
            <el-icon :size="48" color="#ef4444">
              <CircleClose />
            </el-icon>
            <p class="error-text">{{ qrcodeErrorMessage }}</p>
            <el-button type="primary" @click="initWechatLogin">
              重新加载
            </el-button>
          </div>
        </div>

        <!-- 底部提示 -->
        <!-- <div class="login-footer-tip">
          <el-text type="info" size="small">
            <div class="register-link">
              没有账号？
              <router-link to="/register" class="register-router-link">立即注册</router-link>
            </div>
          </el-text>
        </div> -->
      </el-card>

      <!-- 免责声明 -->
      <div class="disclaimer">
        <p class="disclaimer-text">
          NB.STOCK 是一个 多智能体 的股票分析学习平台。平台中的分析结论、观点和"投资建议"均由 AI 自动生成，仅用于学习、研究与交流，不构成任何形式的投资建议或承诺。市场有风险，入市需谨慎。
        </p>
        <div class="icp-info">
          <img style="width: 8px;margin-right: 4px;" src="data:image/webp;base64,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" alt="IconGongAn" loading="lazy">
        <a style="margin-right: 8px;" href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=2021000340" target="_blank" rel="noopener noreferrer">渝公网安备 2021000340 号</a>
        
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">渝ICP备2021000340号-15</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading, RefreshRight, Clock, CircleClose } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import Logo from '@/components/Logo.vue'
import { request } from '@/api/request'
import wxlogo from '../../../assets/wxlogo.png' 

const router = useRouter()
const authStore = useAuthStore()

// 背景粒子
const particles = ref<Array<{
  x: number
  y: number
  size: number
  opacity: number
}>>([])

// 初始化粒子
const initParticles = () => {
  particles.value = Array.from({ length: 30 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    opacity: Math.random() * 0.5 + 0.2
  }))
}

// 二维码相关状态
const qrcodeLoading = ref(false)
const qrcodeError = ref(false)
const qrcodeErrorMessage = ref('')
const qrUrl = ref('')
const scene = ref('')
const qrcodeCountdown = ref(300) // 5分钟 = 300秒
const qrcodeExpired = ref(false)
let countdownTimer: number | null = null
let pollingTimer: number | null = null

// 获取微信登录二维码
const fetchWechatQrcode = async () => {
  try {
    qrcodeLoading.value = true
    qrcodeError.value = false
    qrcodeExpired.value = false
    
    const response = await request.get('/api/auth/wechat/login-qrcode')
    console.log(response);
    
    if (response.data && response.code === 0) {
      qrUrl.value = response.data.qr_url
      scene.value = response.data.scene
      qrcodeCountdown.value = 300 // 重置倒计时
      
      // 开始倒计时
      startCountdown()
      // 开始轮询登录状态
      startPolling()
    } else {
      throw new Error(response.data?.message || '获取二维码失败')
    }
  } catch (error: any) {
    console.error('获取微信二维码失败:', error)
    qrcodeError.value = true
    qrcodeErrorMessage.value = error.message || '获取二维码失败，请重试'
  } finally {
    qrcodeLoading.value = false
  }
}

// 倒计时
const startCountdown = () => {
  // 清除旧定时器
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  
  countdownTimer = window.setInterval(() => {
    qrcodeCountdown.value--
    
    if (qrcodeCountdown.value <= 0) {
      // 二维码过期
      qrcodeExpired.value = true
      stopCountdown()
      stopPolling()
      ElMessage.warning('二维码已过期，请刷新后重新扫码')
    }
  }, 1000)
}

const stopCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

// 格式化时间
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

// 轮询登录状态
const startPolling = () => {
  // 清除旧定时器
  if (pollingTimer) {
    clearInterval(pollingTimer)
  }
  
  pollingTimer = window.setInterval(async () => {
    if (!scene.value || qrcodeExpired.value) {
      stopPolling()
      return
    }
    
    try {
      const response = await request.get('/api/auth/wechat/login-status', {
        params: { scene: scene.value }
      })
      
      if (response.code === 0) {
        // const status = response.data.data.status
        
        if (response.data.access_token ) {
          // 登录成功
          stopPolling()
          stopCountdown()
          
          ElMessage.success('登录成功')
          
          // 保存token等信息
          const loginData = response.data
          if (loginData.access_token) {
            authStore.loginWithQRCode(loginData)
            // authStore.setAuthInfo(
            //   loginData.access_token,
            //   loginData.refresh_token,
            //   loginData.user
            // )
          }
          
          // 跳转到重定向路径或仪表板
          const redirectPath = authStore.getAndClearRedirectPath()
          router.push(redirectPath)
        } 
          // else if (status === 'expired') {
          //   // 二维码过期
          //   qrcodeExpired.value = true
          //   stopPolling()
          //   stopCountdown()
          //   ElMessage.warning('二维码已过期，请刷新')
          // }
        // status === 'waiting' 时继续轮询
      }
    } catch (error: any) {
      console.error('轮询登录状态失败:', error)
      // 轮询失败不停止，继续尝试
    }
  }, 2000) // 每2秒轮询一次
}

const stopPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
}

// 刷新二维码
const refreshQrcode = () => {
  stopPolling()
  stopCountdown()
  qrUrl.value = ''
  scene.value = ''
  fetchWechatQrcode()
}

// 初始化微信登录
const initWechatLogin = () => {
  fetchWechatQrcode()
}

// 组件卸载时清理定时器
onUnmounted(() => {
  stopPolling()
  stopCountdown()
})

onMounted(() => {
  initParticles()
  initWechatLogin()
})
</script>

<style scoped lang="scss">
.login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  // iOS 安全区域适配
  padding-top: max(20px, env(safe-area-inset-top));
  padding-bottom: max(20px, env(safe-area-inset-bottom));
  padding-left: max(20px, env(safe-area-inset-left));
  padding-right: max(20px, env(safe-area-inset-right));
  overflow: hidden;
  background: radial-gradient(ellipse at top, #164e63 0%, #0f172a 50%, #020617 100%);
}

// ========== 背景装饰 ==========
.login-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.particles-container {
  position: absolute;
  inset: 0;
}

.particle {
  position: absolute;
  background: radial-gradient(circle, #06b6d4 0%, transparent 70%);
  border-radius: 50%;
  animation: particle-float 20s infinite ease-in-out;
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

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(6, 182, 212, 0.08) 1.5px, transparent 1.5px),
    linear-gradient(90deg, rgba(6, 182, 212, 0.08) 1.5px, transparent 1.5px);
  background-size: 50px 50px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
  animation: grid-move 30s linear infinite;
}

@keyframes grid-move {
  0% {
    background-position: 0 0, 0 0;
  }
  100% {
    background-position: 50px 50px, 50px 50px;
  }
}

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
}

.glow-2 {
  bottom: 10%;
  right: 15%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
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

// ========== 主容器 ==========
.login-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 420px;
}

// ========== Logo 区 ==========
.login-header {
  text-align: center;
  margin-bottom: 2rem;

  .logo-wrapper {
    display: inline-flex;
    margin-bottom: 1rem;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      inset: -12px;
      background: radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, transparent 70%);
      border-radius: 50%;
      filter: blur(16px);
      animation: logo-pulse 3s ease-in-out infinite;
    }
  }

  .title {
    font-size: 2.5rem;
    font-weight: 800;
    margin: 0 0 0.5rem 0;
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
  }

  .subtitle {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
    font-weight: 500;
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

// ========== 登录卡片 ==========
.login-card {
  backdrop-filter: blur(20px);
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);

  :deep(.el-card__body) {
    padding: 0;
  }
}

// ========== 微信扫码登录 ==========
.wechat-login-container {
  padding: 1rem 0;
}

.qrcode-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  
  .loading-icon {
    color: #06b6d4;
    animation: rotate 1.5s linear infinite;
    margin-bottom: 1rem;
  }
  
  .loading-text {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    margin: 0;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.qrcode-display {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qrcode-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  
  .wechat-icon {
    width: 28px;
    height: 28px;
  }
  
  h3 {
    color: white;
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
  }
}

.qrcode-wrapper {
  position: relative;
  width: 200px;
  height: 200px;
  background: white;
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  margin-bottom: 1rem;
  
  .qrcode-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.qrcode-expired-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  .expired-text {
    color: white;
    font-size: 0.85rem;
    margin: 0;
  }
}

.qrcode-tips {
  text-align: center;
  margin-bottom: 0.75rem;
  
  .tip-text {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.95rem;
    font-weight: 500;
    margin: 0 0 0.35rem 0;
  }
  
  .tip-subtext {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.8rem;
    margin: 0 0 0.4rem 0;
  }
  
  .tip-agreement {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.7rem;
    margin: 0;
    line-height: 1.5;
    
    .agreement-link {
      color: #06b6d4;
      font-size: 0.7rem;
      
      &:hover {
        color: #22d3ee;
      }
    }
  }
}

.qrcode-timer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
  
  .el-icon {
    font-size: 0.9rem;
  }
}

.qrcode-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  gap: 1rem;
  
  .error-text {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    margin: 0;
  }
}

.login-footer-tip {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(6, 182, 212, 0.1);

  :deep(.el-text) {
    color: rgba(255, 255, 255, 0.5) !important;
  }
}

// ========== 免责声明 ==========
.disclaimer {
  margin-top: 2rem;
  text-align: center;
}

.disclaimer-text {
  font-size: 0.75rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  padding: 0 1rem;
}

.icp-info {
  margin-top: 8px;

  a {
    color: rgba(255, 255, 255, 0.4);
    font-size: 10px;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: #06b6d4;
    }
  }
}

// ========== 响应式 ==========
@media (max-width: 768px) {
  .login-container {
    max-width: 100%;
    padding: 0 1rem;
  }
  .tab-icon {
    width: 14px !important;
    height: 14px !important;
  }

  .login-card {
    padding: 1rem;
  }

  .login-header {
    margin-bottom: 1.5rem;
    
    .title {
      font-size: 1.8rem;
    }
    
    .subtitle {
      font-size: 0.9rem;
    }
  }
  .qrcode-wrapper {
    width: 180px;
    height: 180px;
  }
  
  .qrcode-header h3 {
    font-size: 1rem;
  }
  
  .tip-text {
    font-size: 0.9rem !important;
  }
  
  .tip-subtext {
    font-size: 0.75rem !important;
  }
  
  .qrcode-timer {
    font-size: 0.75rem;
  }
}
.register-link {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.875rem;
}

.register-router-link {
  color: #06b6d4;
  text-decoration: none;
  transition: color 0.2s ease;
  
  &:hover {
    color: #22d3ee;
    text-decoration: underline;
  }
}
</style>
