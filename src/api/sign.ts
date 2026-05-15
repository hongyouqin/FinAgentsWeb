/**
 * 签到 API
 */

import { ApiClient } from './request'
import type { ApiResponse } from './request'

// ─── 类型定义 ─────────────────────────────────────

/** 积分余额快照 */
export interface PowerBalance {
  balance: number
  frozen: number
  available: number
  total_recharged: number
  total_consumed: number
}

/** 签到状态（GET /api/sign/status 返回） */
export interface SignStatus {
  /** 今日是否已签到 */
  has_signed: boolean
  /** 今日是否可以签到 */
  can_sign_today: boolean
  /** 当前积分余额快照 */
  current_power: PowerBalance
}

/** 签到提交结果（POST /api/sign/submit 返回） */
export interface SignResult {
  /** 签到是否成功 */
  success?: boolean
  /** 获得积分 */
  reward_points?: number
  /** 签到后积分余额快照 */
  current_power?: PowerBalance
  /** 通用消息 */
  message?: string
}

// ─── API ──────────────────────────────────────────

/**
 * 获取今日签到状态
 */
export function getSignStatus(): Promise<ApiResponse<SignStatus>> {
  return ApiClient.get<SignStatus>('/api/sign/status')
}

/**
 * 提交签到
 */
export function submitSign(): Promise<ApiResponse<SignResult>> {
  return ApiClient.post<SignResult>('/api/sign/submit')
}
