<template>
  <div class="wechat-login-demo">
    <el-card class="demo-card">
      <template #header>
        <div class="card-header">
          <h2>微信登录演示</h2>
        </div>
      </template>

      <!-- 环境检测 -->
      <div class="section">
        <h3>1. 环境检测</h3>
        <el-alert
          :title="isWechat ? '✅ 当前在微信环境中' : '❌ 非微信环境'"
          :type="isWechat ? 'success' : 'warning'"
          show-icon
        />
      </div>

      <!-- 登录状态 -->
      <div class="section">
        <h3>2. 登录状态</h3>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="是否登录">
            <el-tag :type="authStore.isAuthenticated ? 'success' : 'info'">
              {{ authStore.isAuthenticated ? '已登录' : '未登录' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="用户名" v-if="authStore.user">
            {{ authStore.user.username }}
          </el-descriptions-item>
          <el-descriptions-item label="积分余额" v-if="authStore.isAuthenticated">
            {{ authStore.points }} {{ authStore.balanceSymbol }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 操作按钮 -->
      <div class="section">
        <h3>3. 操作</h3>
        <div class="button-group">
          <el-button 
            type="primary" 
            size="large"
            @click="handleWechatLogin"
            :disabled="!isWechat"
          >
            <el-icon><ChatDotRound /></el-icon>
            微信一键登录
          </el-button>

          <el-button 
            v-if="authStore.isAuthenticated"
            type="danger" 
            size="large"
            @click="handleLogout"
          >
            <el-icon><SwitchButton /></el-icon>
            退出登录
          </el-button>
        </div>

        <el-text type="info" size="small" style="margin-top: 12px; display: block;">
          提示：只有在微信环境中才能使用微信登录功能
        </el-text>
      </div>

      <!-- 调试信息 -->
      <div class="section" v-if="debugInfo.length > 0">
        <h3>4. 调试日志</h3>
        <div class="debug-log">
          <div v-for="(log, index) in debugInfo" :key="index" class="log-item">
            {{ log }}
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import wechatLogin from '@/utils/wechatLogin'
import { ChatDotRound, SwitchButton } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()
const isWechat = ref(false)
const debugInfo = ref<string[]>([])

// 添加调试日志
const addLog = (message: string) => {
  const time = new Date().toLocaleTimeString()
  debugInfo.value.push(`[${time}] ${message}`)
  console.log(message)
}

// 检查微信环境
onMounted(() => {
  isWechat.value = wechatLogin.isWechat()
  addLog(`环境检测: ${isWechat.value ? '微信环境' : '非微信环境'}`)
  
  // 检查 URL 中是否有 code
  const code = wechatLogin.getCodeFromUrl()
  if (code) {
    addLog(`检测到授权码: ${code.substring(0, 10)}...`)
  }
})

// 微信登录
const handleWechatLogin = async () => {
  addLog('开始微信登录...')
  
  try {
    // 初始化配置
    wechatLogin.init({
      appId: import.meta.env.VITE_WECHAT_APP_ID || '',
      redirectUri: window.location.href
    })
    
    addLog('配置初始化完成')
    
    // 触发微信授权
    wechatLogin.triggerWechatLogin()
    
    addLog('已跳转到微信授权页')
  } catch (error: any) {
    addLog(`登录失败: ${error.message}`)
    ElMessage.error('微信登录失败')
  }
}

// 退出登录
const handleLogout = async () => {
  await authStore.logout()
  addLog('已退出登录')
  ElMessage.success('退出成功')
}
</script>

<style scoped lang="scss">
.wechat-login-demo {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.demo-card {
  :deep(.el-card__header) {
    background: linear-gradient(135deg, #07c160 0%, #06ad56 100%);
    color: white;
    
    .card-header {
      h2 {
        margin: 0;
        font-size: 1.5rem;
      }
    }
  }
}

.section {
  margin-bottom: 24px;
  
  h3 {
    margin: 0 0 12px 0;
    font-size: 1rem;
    color: #303133;
  }
}

.button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.debug-log {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 12px;
  max-height: 300px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  
  .log-item {
    padding: 4px 0;
    border-bottom: 1px solid #e4e7ed;
    
    &:last-child {
      border-bottom: none;
    }
  }
}
</style>
