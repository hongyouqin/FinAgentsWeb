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

export const strategyApi = {
  /**
   * 获取每日推荐股票
   * @param params 查询参数
   */
  getDailyPitch(params: DailyPitchParams): Promise<any> {
    return request.get('/api/stock_pitch/daily-pitch', { params })
  }
}
