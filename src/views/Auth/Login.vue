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
        <h1 class="title">FinAgents</h1>
        <p class="subtitle">AI智能股票分析平台</p>
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
                <el-link href="/register" type="primary" target="_blank">立即注册</el-link>
              </div>
              <!-- 没有账号？
              <router-link to="/register">立即注册</router-link> -->
            </template>
            <template v-else>
              <div class="register-link">没有账号？
                <el-link href="/register" type="primary" target="_blank">立即注册</el-link>
              </div>
              <!-- 没有账号？
              <router-link to="/register">立即注册</router-link> -->
            </template>
          </el-text>
        </div>
      </el-card>

      <!-- 免责声明 -->
      <div class="disclaimer">
        <p class="disclaimer-text">
          FinAgents 是一个 AI 多 Agents 的股票分析学习平台。平台中的分析结论、观点和“投资建议”均由 AI 自动生成，仅用于学习、研究与交流，不构成任何形式的投资建议或承诺。市场有风险，入市需谨慎。
        </p>
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
      const timer = setInterval(() => {
        smsCountdown.value--
        if (smsCountdown.value <= 0) {
          clearInterval(timer)
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

    &::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }
  }

  :deep(.el-checkbox__label) {
    color: rgba(255, 255, 255, 0.7);
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

// ========== 响应式 ==========
@media (max-width: 768px) {
  .login-container {
    max-width: 100%;
    padding: 0 1rem;
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
      min-width: 90px;
      font-size: 0.875rem;
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
</style>
