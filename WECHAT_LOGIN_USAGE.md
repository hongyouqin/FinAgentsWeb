# 微信登录使用说明

## 📋 功能概述

实现了微信公众号授权登录的完整流程，包括：
- ✅ 自动检测微信环境
- ✅ 自动获取授权码（code）
- ✅ 调用后端接口完成登录
- ✅ 自动注册 JSSDK
- ✅ 支持主动触发微信登录

---

## 🔧 配置步骤

### 1️⃣ 配置微信公众号 AppID

在 `.env.development` 和 `.env.production` 中设置：

```env
VITE_WECHAT_APP_ID=wxXXXXXXXXXXXXXXXX
```

**注意**：将 `wxXXXXXXXXXXXXXXXX` 替换为你的实际微信公众号 AppID。

### 2️⃣ 后端接口要求

需要实现以下后端接口：

#### 微信登录接口
```
POST /api/auth/wechat-login
```

**请求参数：**
```json
{
  "code": "微信授权码"
}
```

**响应格式：**
```json
{
  "success": true,
  "data": {
    "access_token": "JWT access token",
    "refresh_token": "JWT refresh token",
    "user": {
      "id": 1,
      "username": "用户昵称",
      "avatar": "头像URL",
      // ... 其他用户信息
    },
    "jssdk_config": {
      "appId": "wxXXXXXXXXXXXXXXXX",
      "timestamp": "1234567890",
      "nonceStr": "随机字符串",
      "signature": "签名",
      "jsApiList": ["chooseWXPay", "updateAppMessageShareData"]
    }
  }
}
```

**后端逻辑：**
1. 用 `code` 调用微信 API 获取 `access_token` 和 `openid`
2. 根据 `openid` 查询或创建用户
3. 生成 JWT token
4. 生成 JSSDK 签名配置
5. 返回登录信息和 JSSDK 配置

---

## 🚀 使用方式

### 方式一：自动登录（推荐）

应用启动时会自动检测并处理微信登录，无需额外代码。

**流程：**
1. 用户在微信中打开网站
2. 检测到微信环境且无 code → 自动跳转到微信授权页
3. 用户授权后重定向回网站（带 code 参数）
4. 自动调用后端接口完成登录
5. 清除 URL 中的 code 参数

### 方式二：手动触发登录

在登录页面添加微信登录按钮：

```vue
<template>
  <div class="login-options">
    <!-- 原有登录方式 -->
    
    <!-- 微信登录按钮 -->
    <el-button 
      v-if="isWechatEnv"
      type="success" 
      @click="handleWechatLogin"
    >
      <el-icon><ChatDotRound /></el-icon>
      微信一键登录
    </el-button>
  </div>
</template>

<script setup lang="ts">
import wechatLogin from '@/utils/wechatLogin'

const isWechatEnv = wechatLogin.isWechat()

const handleWechatLogin = () => {
  wechatLogin.triggerWechatLogin()
}
</script>
```

---

## 📝 核心 API

### wechatLogin 对象

```typescript
import wechatLogin from '@/utils/wechatLogin'
```

#### 方法列表

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `init(config)` | 初始化配置 | void |
| `isWechat()` | 检查是否在微信环境 | boolean |
| `getCodeFromUrl()` | 获取 URL 中的 code | string \| null |
| `startAuth(redirectUri?)` | 开始微信授权 | void |
| `handleAuthCallback(code)` | 处理授权回调 | Promise<boolean> |
| `checkAndLogin()` | 检查并处理登录 | Promise<boolean> |
| `triggerWechatLogin()` | 主动触发微信登录 | void |

#### 使用示例

```typescript
// 1. 初始化（通常在 main.ts 中自动完成）
wechatLogin.init({
  appId: 'wxXXXXXXXXXXXXXXXX',
  redirectUri: window.location.origin
})

// 2. 检查是否微信环境
if (wechatLogin.isWechat()) {
  console.log('当前在微信环境中')
}

// 3. 主动触发微信登录
wechatLogin.triggerWechatLogin()

// 4. 手动处理授权回调
const code = wechatLogin.getCodeFromUrl()
if (code) {
  await wechatLogin.handleAuthCallback(code)
}
```

---

## 🔍 调试技巧

### 1. 查看控制台日志

微信登录流程会输出详细的日志：

```
🔐 开始微信授权登录...
📨 处理微信授权回调，code: xxx
📥 微信登录响应: {...}
✅ 微信登录成功
🔧 注册微信 JSSDK...
✅ 微信 JSSDK 注册成功
```

### 2. 本地测试

由于微信授权需要在真实的微信环境中测试，建议：

1. **开发阶段**：使用微信开发者工具
2. **测试阶段**：部署到测试服务器，在真实微信中测试
3. **生产阶段**：确保域名已在公众号后台配置

### 3. 常见问题

#### Q: 为什么没有自动跳转微信授权？
A: 检查以下几点：
- 是否在微信环境中打开
- `VITE_WECHAT_APP_ID` 是否正确配置
- 控制台是否有错误日志

#### Q: 登录后又跳回授权页？
A: 可能是 code 未被正确清除，检查 `clearCodeFromUrl()` 是否正常执行。

#### Q: JSSDK 注册失败？
A: 检查后端返回的 `jssdk_config` 是否正确，特别是 `signature` 签名。

---

## 🛡️ 安全注意事项

1. **不要在前端暴露 AppSecret**：只配置 AppID，密钥保存在后端
2. **验证 state 参数**：防止 CSRF 攻击（可在 `startAuth` 中添加 state 参数）
3. **HTTPS 强制**：生产环境必须使用 HTTPS
4. **域名白名单**：在公众号后台配置正确的授权回调域名

---

## 📦 相关文件

- `src/utils/wechatLogin.ts` - 微信登录核心逻辑
- `src/utils/weixin.ts` - 微信 JSSDK 封装
- `src/stores/auth.ts` - 认证状态管理
- `src/main.ts` - 应用初始化（集成微信登录）
- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置

---

## 🎯 后续优化建议

1. **添加 loading 状态**：在授权过程中显示加载动画
2. **错误重试机制**：网络失败时提供重试按钮
3. **记住登录状态**：延长 token 有效期或使用 refresh token
4. **分享功能集成**：利用 JSSDK 实现自定义分享
5. **支付功能集成**：结合 `chooseWXPay` 实现微信支付
