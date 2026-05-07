/**
 * 策略推荐 API
 */

import { request } from './request'

export interface DailyPitchParams {
  date: string        // 日期 YYYY-MM-DD
  limit?: number      // 返回数量限制
  include_stats?: boolean  // 是否包含统计信息
}

export interface StockPitch {
  stock_code: string
  stock_name: string
  industry: string
  timing_indicator: number      // 最佳时机指标
  anchored_trend_score: number  // 锚定趋势分数
  emotim_index: number          // 情绪指数
}

export interface AvailableDatesResponse {
  total_dates: number
  earliest_date: string
  latest_date: string
  dates: Array<{
    date: string
    recommendation_count: number
  }>
}

export interface TetChartParams {
  stock_code: string
  start_date: string   // YYYY-MM-DD
  end_date: string     // YYYY-MM-DD
}

export interface TetChartItem {
  date: string
  close_stock: number
  close_hs300: number
  trend_score: number
  emotion_index: number
  anchored_trend_score: number
  timing_indicator: number
}

export const strategyApi = {
  /**
   * 获取每日推荐股票
   * @param params 查询参数
   */
  getDailyPitch(params: DailyPitchParams): Promise<any> {
    return request.get('/api/stock_pitch/daily-pitch', { params })
  },

  /**
   * 获取有数据的日期列表
   */
  getAvailableDates(): Promise<AvailableDatesResponse> {
    return request.get('/api/stock_pitch/available-dates')
  },

  /**
   * 查询个股 TET 指标时序（Trend・Emotion・Timing）
   * @param params stock_code / start_date / end_date
   */
  getTetChart(params: TetChartParams): Promise<{ success: boolean; data: TetChartItem[] }> {
    return request.get('/api/tet/chart', { params })
  }
}
