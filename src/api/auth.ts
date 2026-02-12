import { ApiClient } from './request'
import type { 
  LoginForm, 
  RegisterForm, 
  LoginResponse, 
  RefreshTokenResponse,
  User,
  UserPermissions,
  ChangePasswordForm,
  SendSmsRequest
} from '@/types/auth'

export const authApi = {
  // 登录（支持密码和短信验证码）
  login: (data: LoginForm) =>
    ApiClient.post<LoginResponse>('/api/auth/login', data, {
      skipAuth: true,  // 登录请求不需要认证
      skipAuthError: true  // 跳过 401 错误的自动处理
    }),

  // 发送短信验证码
  sendSms: (data: SendSmsRequest) =>
    ApiClient.post('/api/auth/send-sms', data, {
      skipAuth: true,
      skipAuthError: true
    }),

  // 注册（手机号+短信验证码）
  register: (data: RegisterForm) =>
    ApiClient.post('/api/auth/register-by-phone', data, {
      skipAuth: true,  // 注册请求不需要认证
      skipAuthError: true  // 跳过 401 错误的自动处理
    }),

  // 登出
  logout: () =>
    ApiClient.post('/api/auth/logout'),

  // 刷新Token
  refreshToken: (refreshToken: string) =>
    ApiClient.post<RefreshTokenResponse>('/api/auth/refresh', { refresh_token: refreshToken }),

  // 获取用户信息
  getUserInfo: () =>
    ApiClient.get<User>('/api/auth/me'),

  // 获取用户权限（开源版不需要，admin拥有所有权限）
  // getUserPermissions: () =>
  //   ApiClient.get<UserPermissions>('/api/auth/permissions'),

  // 更新用户信息
  updateUserInfo: (data: Partial<User>) =>
    ApiClient.put<User>('/api/auth/me', data),

  // 修改密码
  changePassword: (data: ChangePasswordForm) =>
    ApiClient.post('/api/auth/change-password', data),

  // 重置密码
  resetPassword: (email: string) =>
    ApiClient.post('/api/auth/reset-password', { email }),

  // 验证邮箱
  verifyEmail: (token: string) =>
    ApiClient.post('/api/auth/verify-email', { token })
}
