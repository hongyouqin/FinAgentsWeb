/**
 * 管理员 API
 */

import { ApiClient } from './request'
import type { ApiResponse } from './request'

// ─── 类型定义 ─────────────────────────────────────

/** 今日统计数据 */
export interface TodayStats {
  date: string
  total_users: number
  daily_register: number
  dau: number
  mau: number
  daily_reports: number
  monthly_reports: number
  daily_recharge: number
  monthly_recharge: number
  '7d_inactive': number
  generated_at: string
}

/** 摘要统计 */
export interface StatsSummary {
  '总用户数': number
  '今日注册': number
  '今日日活': number
  '今日充值': number
  '今日报告生成': number
  '本月充值': number
  '本月报告生成': number
}

/** 仪表盘数据 */
export interface DashboardData {
  today: TodayStats
  summary: StatsSummary
}

/** 单日历史记录 */
export interface DailyHistoryItem {
  date: string
  total_users: number
  daily_register: number
  dau: number
  mau: number
  daily_reports: number
  daily_recharge: number
}

// ─── API ──────────────────────────────────────────

/**
 * 获取管理后台仪表盘统计数据
 */
export function getDashboardStats(): Promise<ApiResponse<DashboardData>> {
  return ApiClient.get<DashboardData>('/api/admin/stats/dashboard')
}

/**
 * 获取历史统计数据（扁平数组）
 * @param days 查询天数，默认 30
 */
export function getStatsHistory(days: number = 30): Promise<ApiResponse<DailyHistoryItem[]>> {
  return ApiClient.get<DailyHistoryItem[]>('/api/admin/stats/history', { days })
}
