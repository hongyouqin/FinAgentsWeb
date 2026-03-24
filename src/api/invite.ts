import request from './request'

// 邀请码项
export interface InviteCode {
  code: string
  max_uses: number
  used_count: number
  remaining_uses: number
  used_by_count: number
  expire_at: number
  expire_at_datetime: string
  created_at: number
  created_at_datetime: string
  is_active: boolean
  is_expired: boolean
  is_used_up: boolean
  status: string
  is_valid: boolean
  description: string
}

// 邀请码列表响应
export interface InviteCodesResponse {
  items: InviteCode[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// 创建邀请码响应
export interface CreateInviteCodeResponse {
  code: string
  max_uses: number
  used_count: number
  remaining_uses: number
  expire_at: number
  expire_at_datetime: string
  created_at: number
  created_at_datetime: string
  is_active: boolean
  description: string
}

export const inviteApi = {
  /**
   * 获取我的邀请码列表
   */
  getMyCodes(params?: {
    page?: number
    page_size?: number
    status?: 'valid' | 'used' | 'expired' | 'all'
  }): Promise<{ success: boolean; data: InviteCodesResponse }> {
    return request.get('/api/invite-codes/my-codes', { params })
  },

  /**
   * 创建新邀请码
   */
  create(): Promise<{ success: boolean; message: string; data: CreateInviteCodeResponse }> {
    return request.post('/api/invite-codes/create')
  },

  /**
   * 获取已邀请用户列表
   */
  getInvitedUsers(params?: {
    page?: number
    page_size?: number
  }): Promise<{ success: boolean; data: any }> {
    return request.get('/api/invite/invited-users', { params })
  }
}
