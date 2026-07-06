import { request } from './request'

export interface StockHotItem {
  category: string
  current_price: number
  followers: number
  rank: number
  stock_code: string
  stock_name: string
}

export interface StockHotDealItem {
  current_price: number
  deal_attention: number
  rank: number
  stock_code: string
  stock_name: string
}

export interface StockHotRankItem {
  change_amount: number
  change_percent: number
  current_price: number
  rank: number
  stock_code: string
  stock_name: string
}

/**
 * 获取所有分类的股票热度数据
 * @param limit 每分类返回条数，默认 10
 */
export function getAllStockHot(limit: number = 10): Promise<any> {
  return request.get('/api/stock-hot/all', { params: { limit } })
}

/**
 * 按分类查询股票热度排行
 * @param category 分类，仅支持 "最热门" 或 "本周新增"
 * @param limit 返回条数，默认 10
 */
export function getStockHotByCategory(category: '最热门' | '本周新增', limit: number = 10): Promise<any> {
  return request.get(`/api/stock-hot/${category}`, { params: { limit } })
}

/**
 * 获取雪球交易排行
 * @param limit 返回条数，默认 10
 */
export function getStockHotDeal(limit: number = 10): Promise<any> {
  return request.get('/api/stock-hot-deal', { params: { limit } })
}

/**
 * 获取东方财富人气榜
 * @param limit 返回条数，默认 10
 */
export function getStockHotRank(limit: number = 10): Promise<any> {
  return request.get('/api/stock-hot-rank', { params: { limit } })
}
