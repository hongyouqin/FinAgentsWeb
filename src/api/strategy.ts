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

export interface TetBacktestParams {
  stock_code: string
  start_date: string
  end_date: string
  return_equity_curve?: boolean
}

export interface EquityCurveItem {
  date: string
  strategy: number
  benchmark: number
}

// 后端实际返回的列式净值曲线结构
export interface EquityCurveColumnar {
  date: string[]
  strategy: number[]
  benchmark: number[]
}

export interface TetBacktestResult {
  total_return: number
  annual_return: number
  sharpe_ratio: number
  max_drawdown: number
  trade_count: number
  win_rate: number
  equity_curve: EquityCurveColumnar | null
}

// ─── 组合分析 ──────────────────────────────────
export interface PortfolioParams {
  start_date: string
  end_date: string
  top_n: number
  return_equity_curve?: boolean
}

export interface PortfolioStockItem {
  code: string
  trend_score: number
  emotion_index: number
  anchored_trend_score: number
  timing_indicator: number
  hist_volatility: number
  expected_return: number
  action: string
  weight_equal: number
  weight_timing: number
  weight_vol_trend: number
}

export interface PortfolioCurveItem {
  date: string
  cum_return: number
}

export interface PortfolioResult {
  portfolio: {
    total_count: number
    top_n: number
    stocks: PortfolioStockItem[]
  }
  backtest: {
    total_return: number
    annual_return: number
    sharpe_ratio: number
    max_drawdown: number
    stock_count: number
    equity_curve: PortfolioCurveItem[]
  }
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
  },

  /**
   * 埋点记录：用户点击 TET 图表计算的行为
   * POST /api/admin/stats/track/chart-click
   */
  trackChartClick(data: { event_type: string; stock_code: string; start_date: string; end_date: string }): Promise<any> {
    return request.post('/api/admin/stats/track/chart-click', data)
  },

  /**
   * 单股票 TET 策略回测
   * GET /api/tet/backtest
   */
  getBacktest(params: TetBacktestParams): Promise<{ success: boolean; data: TetBacktestResult }> {
    return request.get('/api/tet/backtest', { params })
  },

  /**
   * 多股票 TET 投资组合分析
   * POST /api/tet/portfolio
   */
  getPortfolio(params: PortfolioParams, stockCodes: string[]): Promise<{ success: boolean; data: PortfolioResult }> {
    return request.post('/api/tet/portfolio', stockCodes, { params })
  }
}
