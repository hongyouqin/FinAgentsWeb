import { request } from './request'

export interface DisclosureCalendarItem {
  data_date: string
  first_schedule: string
  latest_date: string
  stock_code: string
  stock_name: string
}

export interface DisclosureCalendarListResponse {
  data: DisclosureCalendarItem[]
  total: number
  page: number
  page_size: number
}

/**
 * 获取预约披露日分页列表
 * @param params 查询参数
 */
export function getDisclosureCalendarList(params: { page?: number; page_size?: number; data_date?: string } = {}): Promise<any> {
  return request.get('/api/disclosure-calendar', { params })
}

/**
 * 按股票代码查询最新预约披露日
 * @param stockCode 6位股票代码
 */
export function getDisclosureByStock(stockCode: string): Promise<any> {
  return request.get(`/api/disclosure-calendar/${stockCode}`)
}
