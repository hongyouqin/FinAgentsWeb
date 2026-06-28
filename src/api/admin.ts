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

/**
 * 触发统计数据重新生成
 */
export function generateStats(): Promise<ApiResponse<{ message: string }>> {
  return ApiClient.post<{ message: string }>('/api/admin/stats/generate')
}

/**
 * 获取今日签到人数
 */
export interface SignTodayData {
  date: string
  sign_count: number
}

export function getSignToday(): Promise<ApiResponse<SignTodayData>> {
  return ApiClient.get<SignTodayData>('/api/admin/stats/sign/today')
}

/**
 * 登录状态访问埋点：上报一次登录用户的访问行为（用于 DAU/活跃度统计）
 */
export function trackLogin(): Promise<ApiResponse<any>> {
  return ApiClient.post<any>('/api/admin/stats/track/login')
}

// ─── TET 图表点击统计 ────────────────────────────

export interface ChartClickStock {
  stock_code: string
  stock_name?: string
  click_count: number
}

export interface ChartClickUser {
  user_id: number
  username: string
  click_count: number
}

export interface ChartClickDailyTrend {
  date: string
  count: number
}

export interface ChartClicksSummary {
  total_clicks: number
  today_clicks: number
  top_stocks: ChartClickStock[]
  top_users: ChartClickUser[]
  daily_trend: ChartClickDailyTrend[]
}

/**
 * 获取 TET 图表点击统计汇总
 * @param days 查询天数，默认 30
 */
export function getChartClicksSummary(days: number = 30): Promise<ApiResponse<ChartClicksSummary>> {
  return ApiClient.get<ChartClicksSummary>('/api/admin/stats/tracking/chart-clicks/summary', { days })
}

// ─── 月度充值统计 ────────────────────────

export interface MonthlyRechargeItem {
  month: string
  monthly_recharge: number
}

/**
 * 获取月度充值统计
 */
export function getMonthlyRecharge(): Promise<ApiResponse<MonthlyRechargeItem>> {
  return ApiClient.get<MonthlyRechargeItem>('/api/admin/stats/monthly-recharge')
}
