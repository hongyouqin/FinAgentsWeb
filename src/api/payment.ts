import { request } from './request'

export interface CreateOrderParams {
  package_id: string
  payment_scene: 'NATIVE' | 'JSAPI' | 'MWEB'
  code?: string
}

export interface CreateOrderResult {
  order_no: string
  package_id: string
  amount: number
  status: string
}

export interface PrepareOrderResult {
  code_url?: string     // NATIVE 模式下的微信二维码链接
  qr_code_url?: string  // 备用字段名
  url?: string          // 通用备用字段
  mweb_url?: string     // H5 支付链接
  h5_url?: string       // H5 支付链接备用
  order_no: string
  expire_seconds?: number
  // JSAPI 支付参数
  appId?: string
  timeStamp?: string
  nonceStr?: string
  package?: string
  signType?: string
  paySign?: string
  // 微信 SDK 配置参数（可选，用于其他微信功能）
  wxConfig?: {
    appId: string
    timestamp: string
    nonceStr: string
    signature: string
    jsApiList: string[]
  }
}

export interface OrderStatus {
  order_no: string
  status: 'pending' | 'paid' | 'failed' | 'expired'
  paid_at?: string
  points?: number
}

const paymentApi = {
  /**
   * 创建充值订单
   * POST /api/payment/recharge/create
   */
  createOrder(params: CreateOrderParams): Promise<any> {
    return request.post('/api/payment/recharge/create', params)
  },

  /**
   * 准备支付（获取二维码 URL）
   * POST /api/payment/recharge/{order_no}/prepare
   */
  prepareOrder(orderNo: string): Promise<any> {
    return request.post(`/api/payment/recharge/${orderNo}/prepare`, {})
  },

  /**
   * 查询订单支付状态
   * GET /api/payment/recharge/{order_no}/status
   */
  queryStatus(orderNo: string): Promise<any> {
    return request.get(`/api/payment/recharge/${orderNo}/status`)
  },

  /**
   * 获取充值套餐列表
   * GET /api/payment/recharge/packages
   */
  getPackages(): Promise<any> {
    return request.get('/api/payment/recharge/packages')
  },

  /**
   * 获取充值记录
   * GET /api/payment/recharge/orders?skip=0&limit=20
   */
  getHistory(params?: { skip?: number; limit?: number }): Promise<any> {
    return request.get('/api/payment/recharge/orders', { params })
  },

  /**
   * 获取积分余额
   * GET /api/payment/balance
   */
  getBalance(): Promise<any> {
    return request.get('/api/payment/balance')
  },

  /**
   * 获取算力流水记录
   * GET /api/payment/transactions?limit=50&transaction_type=ALL
   */
  getTransactions(params?: { limit?: number; transaction_type?: 'RECHARGE' | 'CONSUME' | 'ALL' }): Promise<any> {
    return request.get('/api/payment/transactions', { params })
  },

  /**
   * 准备微信 JSAPI 支付（获取 wxConfig）
   * POST /api/payment/recharge/prepare_recharge_payment
   */
  configcallback(code: string): Promise<any> {
    return request.post('/api/payment/wechat/callback', { code })
  }

  
}

export default paymentApi
