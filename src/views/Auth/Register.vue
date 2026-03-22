<template>
  <div class="register-page">
    <!-- 背景装饰 -->
    <div class="register-background">
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

    <div class="register-container">
      <!-- Logo 区 -->
      <div class="register-header">
        <div class="logo-wrapper">
          <Logo :size="56" />
        </div>
        <h1 class="title">注册账号</h1>
        <p class="subtitle">开启 AI 智能投资之旅</p>
      </div>

      <!-- 注册卡片 -->
      <el-card class="register-card" shadow="never">
        <el-form
          :model="registerForm"
          :rules="registerRules"
          ref="registerFormRef"
          label-position="top"
          size="large"
          class="register-form"
        >
          <!-- 邀请码 -->
          <el-form-item label="邀请码" prop="inviteCode">
            <el-input
              v-model="registerForm.inviteCode"
              placeholder="请输入邀请码"
              prefix-icon="Ticket"
              clearable
            />
          </el-form-item>

          <!-- 用户名 -->
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名"
              prefix-icon="User"
              clearable
            />
          </el-form-item>

          <!-- 手机号 -->
          <el-form-item label="手机号" prop="phone">
            <el-input
              v-model="registerForm.phone"
              placeholder="请输入手机号"
              prefix-icon="Iphone"
              maxlength="11"
              clearable
            />
          </el-form-item>

          <!-- 短信验证码 -->
          <el-form-item label="短信验证码" prop="smsCode">
            <div class="sms-input-wrapper">
              <el-input
                v-model="registerForm.smsCode"
                placeholder="请输入验证码"
                prefix-icon="Message"
                maxlength="6"
                clearable
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

          <!-- 邮箱 -->
          <el-form-item label="邮箱" prop="email">
            <el-input
              v-model="registerForm.email"
              placeholder="请输入邮箱"
              prefix-icon="Message"
              clearable
            />
          </el-form-item>

          <!-- 密码 -->
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="至少8个字符，包含字母和数字"
              prefix-icon="Lock"
              show-password
              clearable
            />
          </el-form-item>

          <!-- 确认密码 -->
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              prefix-icon="Lock"
              show-password
              clearable
              @keyup.enter="handleRegister"
            />
          </el-form-item>

          <!-- 用户协议 -->
          <el-form-item prop="agreement">
            <el-checkbox v-model="registerForm.agreement">
              我已阅读并同意
              <el-link type="primary" :underline="false">《用户协议》</el-link>
              和
              <el-link type="primary" :underline="false">《隐私政策》</el-link>
            </el-checkbox>
          </el-form-item>

          <!-- 注册按钮 -->
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="register-button"
              :loading="registerLoading"
              @click="handleRegister"
            >
              <span v-if="!registerLoading">立即注册</span>
              <span v-else>注册中...</span>
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 底部提示 -->
        <div class="register-footer-tip">
          <el-text type="info" size="small">
            已有账号？
            <router-link to="/login">立即登录</router-link>
          </el-text>
        </div>
      </el-card>

      <!-- 免责声明 -->
      <div class="disclaimer">
        <p class="disclaimer-text">
          FinAgents 是一个 AI 多 Agents 的股票分析学习平台。平台中的分析结论、观点和"投资建议"均由 AI 自动生成，仅用于学习、研究与交流，不构成任何形式的投资建议或承诺。市场有风险，入市需谨慎。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api/auth'
import Logo from '@/components/Logo.vue'
import type { RegisterForm } from '@/types/auth'

const router = useRouter()

// 表单引用
const registerFormRef = ref()

// 加载状态
const registerLoading = ref(false)
const sendingSms = ref(false)
const smsCountdown = ref(0)

// 背景粒子
const particles = ref<Array<{
  x: number
  y: number
  size: number
  opacity: number
}>>([])

// 注册表单
const registerForm = reactive({
  inviteCode: '',
  username: '',
  phone: '',
  smsCode: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreement: false
})

// 手机号校验
const phoneValidator = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

// 邮箱校验
const emailValidator = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入邮箱'))
  } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
    callback(new Error('请输入正确的邮箱地址'))
  } else {
    callback()
  }
}

// 密码校验
const passwordValidator = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (value.length < 8) {
    callback(new Error('密码至少8个字符'))
  } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/.test(value)) {
    callback(new Error('密码必须包含字母和数字'))
  } else {
    callback()
  }
}

// 确认密码校验
const confirmPasswordValidator = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 协议校验
const agreementValidator = (rule: any, value: boolean, callback: any) => {
  if (!value) {
    callback(new Error('请阅读并同意用户协议和隐私政策'))
  } else {
    callback()
  }
}

// 表单验证规则
const registerRules = {
  inviteCode: [
    { required: true, message: '请输入邀请码', trigger: 'blur' },
    { min: 4, max: 32, message: '邀请码长度为4-32个字符', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, validator: phoneValidator, trigger: 'blur' }
  ],
  smsCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ],
  email: [
    { required: true, validator: emailValidator, trigger: 'blur' }
  ],
  password: [
    { required: true, validator: passwordValidator, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: confirmPasswordValidator, trigger: 'blur' }
  ],
  agreement: [
    { required: true, validator: agreementValidator, trigger: 'change' }
  ]
}

// 短信按钮文字
const smsButtonText = computed(() => {
  if (sendingSms.value) return '发送中...'
  if (smsCountdown.value > 0) return `${smsCountdown.value}s`
  return '获取验证码'
})

// 发送短信验证码
const handleSendSms = async () => {
  try {
    // 验证手机号
    await registerFormRef.value.validateField('phone')

    sendingSms.value = true
    console.log('📨 发送短信验证码...', registerForm.phone)

    const response = await authApi.sendSms({
      phone: registerForm.phone,
      sms_type: 'register'
    })

    if (response.success) {
      ElMessage.success('验证码已发送，5分钟内有效')
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

// 注册处理
const handleRegister = async () => {
  // 防止重复提交
  if (registerLoading.value) {
    console.log('⏭️ 注册请求进行中，跳过重复点击')
    return
  }

  try {
    // 验证表单
    await registerFormRef.value.validate()

    registerLoading.value = true
    console.log('📝 开始注册流程...')

    // 构造注册请求数据
    const registerData: RegisterForm = {
      invite_code: registerForm.inviteCode,
      username: registerForm.username,
      phone: registerForm.phone,
      sms_code: registerForm.smsCode,
      email: registerForm.email,
      password: registerForm.password
    }

    // 调用注册 API
    const response = await authApi.register(registerData)

    if (response.success) {
      console.log('✅ 注册成功')
      ElMessage.success('注册成功，请登录')
      
      // 跳转到登录页
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } else {
      ElMessage.error(response.message || '注册失败')
    }
  } catch (error: any) {
    console.error('注册失败:', error)
    // 只有在不是表单验证错误时才显示错误消息
    if (error.message && !error.message.includes('validate')) {
      ElMessage.error(error.message || '注册失败，请重试')
    }
  } finally {
    registerLoading.value = false
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
.register-page {
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
.register-background {
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
.register-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 480px;
}

// ========== Logo 区 ==========
.register-header {
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

// ========== 注册卡片 ==========
.register-card {
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

// ========== 表单样式 ==========
.register-form {
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

  :deep(.el-link) {
    color: #06b6d4;
    font-weight: 500;

    &:hover {
      color: #3b82f6;
    }
  }
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

// 注册按钮
.register-button {
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

.register-footer-tip {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(6, 182, 212, 0.1);

  :deep(.el-text) {
    color: rgba(255, 255, 255, 0.5) !important;
  }

  a {
    color: #06b6d4;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      color: #3b82f6;
    }
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
  .register-container {
    max-width: 100%;
    padding: 0 1rem;
  }

  .register-card {
    padding: 1.5rem;
  }

  .register-header .title {
    font-size: 2rem;
  }

  .sms-input-wrapper {
    .sms-button {
      min-width: 90px;
      font-size: 0.875rem;
    }
  }
}
</style>
