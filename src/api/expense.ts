import { request } from './request'

// ---- 类型定义 ----
export type RecordType = 'income' | 'expense'

export interface ExpenseRecord {
  _id: string
  record_type: RecordType
  category: string
  amount: number
  description: string
  record_date: string
  created_at: string
  updated_at: string
}

export interface CreateExpenseParams {
  record_type: RecordType
  category: string
  amount: number
  description?: string
  record_date: string
}

export interface UpdateExpenseParams extends CreateExpenseParams {}

export interface RecordListQuery {
  record_type?: RecordType
  category?: string
  year_month?: string
  page?: number
  page_size?: number
}

export interface RecordListResult {
  items: ExpenseRecord[]
  total: number
  page: number
  page_size: number
}

export interface MonthlySettlement {
  year_month: string
  total_income: number
  total_expense: number
  balance: number
  record_count: number
  income_count: number
  expense_count: number
  details: ExpenseRecord[]
}

export interface CategorySummaryItem {
  category: string
  total_amount: number
  count: number
  percentage: number
}

// ---- API ----
const expenseApi = {
  /** 查询收支记录列表 */
  getRecords(params?: RecordListQuery): Promise<any> {
    return request.get('/api/expense/records', { params })
  },

  /** 获取单条记录 */
  getRecord(recordId: string): Promise<any> {
    return request.get(`/api/expense/records/${recordId}`)
  },

  /** 创建收支记录 */
  createRecord(params: CreateExpenseParams): Promise<any> {
    return request.post('/api/expense/records', params)
  },

  /** 更新收支记录 */
  updateRecord(recordId: string, params: UpdateExpenseParams): Promise<any> {
    return request.put(`/api/expense/records/${recordId}`, params)
  },

  /** 删除收支记录 */
  deleteRecord(recordId: string): Promise<any> {
    return request.delete(`/api/expense/records/${recordId}`)
  },

  /** 获取月度扎帐结果 */
  getMonthlySettlement(yearMonth: string): Promise<any> {
    return request.get('/api/expense/monthly-settlement', { params: { year_month: yearMonth } })
  },

  /** 获取分类汇总 */
  getCategorySummary(yearMonth: string): Promise<any> {
    return request.get('/api/expense/category-summary', { params: { year_month: yearMonth } })
  },
}

export default expenseApi
