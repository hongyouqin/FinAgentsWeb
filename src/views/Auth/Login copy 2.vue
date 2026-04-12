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
        <!-- 登录方式切换 -->
        <div class="login-tabs">
          <div
            class="tab-item"
            :class="{ active: loginType === 'password' }"
            @click="switchLoginType('password')"
          >
            <svg class="tab-icon" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C9.243 2 7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zm6 10v8H6v-8h12zm-9-2V7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9z" fill="currentColor"/>
            </svg>
            <span>密码登录</span>
          </div>
          <div
            class="tab-item"
            :class="{ active: loginType === 'sms' }"
            @click="switchLoginType('sms')"
          >
            <svg class="tab-icon" viewBox="0 0 24 24" fill="none">
              <path d="M20 4H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM4 6h16v.511l-8 5.333-8-5.333V6zm0 12V8.853l7.479 4.987a.997.997 0 001.042 0L20 8.853V18H4z" fill="currentColor"/>
            </svg>
            <span>验证码登录</span>
          </div>
        </div>

        <!-- 密码登录表单 -->
        <el-form
          v-if="loginType === 'password'"
          :model="passwordForm"
          :rules="passwordRules"
          ref="passwordFormRef"
          label-position="top"
          size="large"
          class="login-form"
        >
          <el-form-item label="用户名" prop="identifier">
            <el-input
              v-model="passwordForm.identifier"
              placeholder="请输入用户名"
              prefix-icon="User"
              clearable
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="passwordForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
              clearable
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-form-item>
            <div class="form-options">
              <el-checkbox v-model="passwordForm.rememberMe">
                记住我
              </el-checkbox>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-button"
              :loading="loginLoading"
              @click="handleLogin"
            >
              <span v-if="!loginLoading">登录</span>
              <span v-else>登录中...</span>
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 短信验证码登录表单 -->
        <el-form
          v-else
          :model="smsForm"
          :rules="smsRules"
          ref="smsFormRef"
          label-position="top"
          size="large"
          class="login-form"
        >
          <el-form-item label="手机号" prop="phone">
            <el-input
              v-model="smsForm.phone"
              placeholder="请输入手机号"
              prefix-icon="Iphone"
              maxlength="11"
              clearable
            />
          </el-form-item>

          <el-form-item label="验证码" prop="smsCode">
            <div class="sms-input-wrapper">
              <el-input
                v-model="smsForm.smsCode"
                placeholder="请输入验证码"
                prefix-icon="Message"
                maxlength="6"
                clearable
                @keyup.enter="handleLogin"
              />
              <el-button
                class="sms-button"
                :disabled="smsCountdown > 0 || sendingSms"
                :loading="sendingSms"
                @click="handleSendSms"
              >
                {{ smsButtonText }}
              </el-button>
            </div>
          </el-form-item>

          <el-form-item>
            <div class="form-options">
              <el-checkbox v-model="smsForm.rememberMe">
                记住我
              </el-checkbox>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-button"
              :loading="loginLoading"
              @click="handleLogin"
            >
              <span v-if="!loginLoading">登录</span>
              <span v-else>登录中...</span>
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 底部提示 -->
        <div class="login-footer-tip">
          <el-text type="info" size="small">
            <template v-if="loginType === 'password'">
               <div class="register-link">没有账号？
                <router-link to="/register" class="register-router-link">立即注册</router-link>
              </div>
            </template>
            <template v-else>
              <div class="register-link">没有账号？
                <router-link to="/register" class="register-router-link">立即注册</router-link>
              </div>
            </template>
          </el-text>
        </div>
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
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api/auth'
import Logo from '@/components/Logo.vue'
import type { LoginForm } from '@/types/auth'

const router = useRouter()
const authStore = useAuthStore()

// 登录方式
const loginType = ref<'password' | 'sms'>('password')

// 表单引用
const passwordFormRef = ref()
const smsFormRef = ref()

// 加载状态
const loginLoading = ref(false)
const sendingSms = ref(false)
const smsCountdown = ref(0)

// 从 localStorage 恢复倒计时状态（防止刷新页面后重新发送）
const restoreSmsCountdown = () => {
  const savedTime = localStorage.getItem('sms_countdown_end')
  if (savedTime) {
    const endTime = parseInt(savedTime, 10)
    const now = Date.now()
    const remaining = Math.ceil((endTime - now) / 1000)
    
    if (remaining > 0) {
      smsCountdown.value = remaining
      // 继续倒计时
      const timer = setInterval(() => {
        smsCountdown.value--
        if (smsCountdown.value <= 0) {
          clearInterval(timer)
          localStorage.removeItem('sms_countdown_end')
        }
      }, 1000)
    } else {
      localStorage.removeItem('sms_countdown_end')
    }
  }
}

// 背景粒子
const particles = ref<Array<{
  x: number
  y: number
  size: number
  opacity: number
}>>([])

// 密码登录表单
const passwordForm = reactive({
  identifier: '',
  password: '',
  rememberMe: false
})

// 短信登录表单
const smsForm = reactive({
  phone: '',
  smsCode: '',
  rememberMe: false
})

// 手机号校验规则
const phoneValidator = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

// 密码表单验证规则
const passwordRules = {
  identifier: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

// 短信表单验证规则
const smsRules = {
  phone: [
    { required: true, validator: phoneValidator, trigger: 'blur' }
  ],
  smsCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ]
}

// 短信按钮文字
const smsButtonText = computed(() => {
  if (sendingSms.value) return '发送中...'
  if (smsCountdown.value > 0) return `${smsCountdown.value}s`
  return '获取验证码'
})

// 切换登录方式
const switchLoginType = (type: 'password' | 'sms') => {
  loginType.value = type
  // 清空表单
  passwordForm.identifier = ''
  passwordForm.password = ''
  smsForm.phone = ''
  smsForm.smsCode = ''
}

// 发送短信验证码
const handleSendSms = async () => {
  // 如果正在倒计时，不允许再次发送
  if (smsCountdown.value > 0) {
    ElMessage.warning(`请等待 ${smsCountdown.value} 秒后再试`)
    return
  }

  try {
    // 验证手机号
    await smsFormRef.value.validateField('phone')

    sendingSms.value = true
    console.log('📨 发送短信验证码...', smsForm.phone)

    const response = await authApi.sendSms({
      phone: smsForm.phone,
      sms_type: 'login'
    })
    console.log('📨 发送短信验证码结果:', response)
    if (response.success) {
      ElMessage.success('验证码已发送')
      // 开始倒计时
      smsCountdown.value = 60
      
      // 保存倒计时结束时间到 localStorage（跨页面/刷新保持）
      const endTime = Date.now() + 60 * 1000
      localStorage.setItem('sms_countdown_end', endTime.toString())
      
      const timer = setInterval(() => {
        smsCountdown.value--
        if (smsCountdown.value <= 0) {
          clearInterval(timer)
          localStorage.removeItem('sms_countdown_end')
        }
      }, 1000)
    } else {
      ElMessage.error(response.message || '验证码发送失败')
    }
  } catch (error: any) {
    console.error('发送短信失败:', error)
    if (!error.message?.includes('validate')) {
      ElMessage.error('验证码发送失败，请重试')
    }
  } finally {
    sendingSms.value = false
  }
}

// 登录处理
const handleLogin = async () => {
  // 防止重复提交
  if (loginLoading.value) {
    console.log('⏭️ 登录请求进行中，跳过重复点击')
    return
  }

  try {
    // 验证表单
    const formRef = loginType.value === 'password' ? passwordFormRef.value : smsFormRef.value
    await formRef.validate()

    loginLoading.value = true
    console.log('🔐 开始登录流程...', loginType.value)

    // 构造登录请求数据
    const loginData: LoginForm = loginType.value === 'password'
      ? {
          login_type: 'password',
          identifier: passwordForm.identifier,
          password: passwordForm.password,
          remember_me: passwordForm.rememberMe
        }
      : {
          login_type: 'sms',
          identifier: smsForm.phone,
          sms_code: smsForm.smsCode,
          remember_me: smsForm.rememberMe
        }

    // 调用登录 API
    const success = await authStore.login(loginData)

    if (success) {
      console.log('✅ 登录成功')
      ElMessage.success('登录成功')

      // 跳转到重定向路径或仪表板
      const redirectPath = authStore.getAndClearRedirectPath()
      console.log('🔄 重定向到:', redirectPath)
      router.push(redirectPath)
    } else {
      ElMessage.error(loginType.value === 'password' ? '用户名或密码错误' : '手机号或验证码错误')
    }
  } catch (error: any) {
    console.error('登录失败:', error)
    // 只有在不是表单验证错误时才显示错误消息
    if (error.message && !error.message.includes('validate')) {
      ElMessage.error('登录失败，请重试')
    }
  } finally {
    loginLoading.value = false
  }
}

// 初始化粒子
const initParticles = () => {
  particles.value = Array.from({ length: 30 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    opacity: Math.random() * 0.5 + 0.2
  }))
}

onMounted(() => {
  initParticles()
  restoreSmsCountdown() // 恢复倒计时状态
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
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);

  :deep(.el-card__body) {
    padding: 0;
  }
}

// ========== 登录方式切换 ==========
.login-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  padding: 0.5rem;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 12px;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
  font-size: 0.9rem;

  .tab-icon {
    width: 18px;
    height: 18px;
  }

  &:hover {
    color: rgba(255, 255, 255, 0.8);
    background: rgba(6, 182, 212, 0.1);
  }

  &.active {
    color: white;
    background: linear-gradient(135deg, #059669 0%, #06b6d4 100%);
    box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
  }
}

// ========== 表单样式 ==========
.login-form {
  :deep(.el-form-item__label) {
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
  }

  :deep(.el-input__wrapper) {
    background: rgba(15, 23, 42, 0.5);
    border: 1px solid rgba(6, 182, 212, 0.2);
    box-shadow: none;
    transition: all 0.3s ease;
    // iOS 修复：确保边框完整显示
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;

    &:hover {
      border-color: rgba(6, 182, 212, 0.4);
    }

    &.is-focus {
      border-color: #06b6d4;
      box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.1);
    }
  }

  :deep(.el-input__inner) {
    color: white;
    // iOS 修复：禁止自动调整字体大小
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
    // iOS 修复：确保输入框不会被缩放
    font-size: 16px !important;

    &::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }

    // 修复浏览器自动填充时的白底问题
    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 1000px rgba(15, 23, 42, 0.5) inset !important;
      -webkit-text-fill-color: white !important;
      transition: background-color 5000s ease-in-out 0s;
    }
  }

  :deep(.el-checkbox__label) {
    color: rgba(255, 255, 255, 0.7);
  }
  
  // iOS 修复：表单项目添加底部间距，防止遮挡
  :deep(.el-form-item) {
    margin-bottom: 22px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

// 短信验证码输入框
.sms-input-wrapper {
  display: flex;
  gap: 0.75rem;
  width: 100%;

  :deep(.el-input) {
    flex: 1;
  }

  .sms-button {
    flex-shrink: 0;
    min-width: 110px;
    background: rgba(6, 182, 212, 0.1);
    border: 1px solid rgba(6, 182, 212, 0.3);
    color: #06b6d4;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
      background: rgba(6, 182, 212, 0.2);
      border-color: #06b6d4;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

// 登录按钮
.login-button {
  width: 100%;
  background: linear-gradient(135deg, #059669 0%, #06b6d4 100%);
  border: none;
  font-weight: 600;
  font-size: 1rem;
  padding: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(6, 182, 212, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(6, 182, 212, 0.5);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
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
    padding: 1.2rem;
  }

  .login-header .title {
    font-size: 1.6rem;
  }
  .login-form{
    :deep(.el-form-item__label) {
      font-size: 0.75rem !important;
    }
    :deep(.el-input__inner) {
      font-size: 0.75rem !important;
    }


  } 

  .sms-input-wrapper {
    .sms-button {
      width: 70px;
      min-width: 70px;
      font-size: 0.675rem;
      padding: 4px 6px;
    }
  }
  .tab-item {
    font-size: 0.65rem;
    padding: 0.75rem 0.4rem;
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
