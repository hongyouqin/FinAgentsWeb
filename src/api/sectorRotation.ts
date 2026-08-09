import { request } from './request'

/** 板块动能排行项 */
export interface SectorMomentumItem {
  industry: string
  rank: number
  data_date: string
  flow_score: number
  flow_raw: number
  /** 主力净买入额，单位：万元 */
  flow_net: number
  flow_trend_5d: number
  turnover_score: number
  turnover_ratio: number
  turnover_trend_5d: number
  turnover_trend_10d: number
  composite_score: number
  /** 真上涨 / 假上涨 / 低位启动 / 高位出货 / 观望 / 中性 */
  signal: string
  signal_detail: string
  stock_count: number
  /** 主力净买入额合计，单位：万元 */
  total_main_force_net: number
}

/** 板块成分股 */
export interface SectorStockItem {
  symbol: string
  name: string
  industry: string
  source: string
}

/**
 * 获取板块动能排行（资金流强度 + 成交额占比趋势）
 */
export function getSectorMomentumRanking(params: {
  top_n?: number
  days?: number
  weight_flow?: number
  weight_turnover?: number
} = {}): Promise<any> {
  return request.get('/api/sector-rotation/momentum-ranking', { params })
}

/**
 * 获取指定板块下的成分股列表（分页）
 * @param params industry 为必填，取值来自动能排行的 industry 字段
 */
export function getSectorStocks(params: {
  industry: string
  page?: number
  page_size?: number
  source?: string
}): Promise<any> {
  return request.get('/api/sector-rotation/stocks', { params })
}
