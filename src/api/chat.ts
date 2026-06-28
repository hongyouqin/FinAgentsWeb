import { request } from './request'

// ---- 类型定义 ----
export interface Conversation {
  conversation_id: string
  analysis_id: string
  title?: string
  stock_name?: string
  stock_symbol?: string
  last_user_message?: string
  rounds?: number
  tokens_used?: number
  created_at: string
  updated_at?: string
  message_count?: number
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
  cost?: { amount: number; unit: string; total_tokens?: number }
}

export interface ConversationState {
  conversation_id: string
  analysis_id: string
  messages: ChatMessage[]
  token_count?: number
  created_at?: string
}

export interface ChatModel {
  model_name: string
  provider: string
  enabled: boolean
}

// ---- API ----
const chatApi = {
  /** 创建新的报告对话会话 */
  startConversation(analysisId: string): Promise<any> {
    return request.post('/api/report-chat/start', { analysis_id: analysisId })
  },

  /** 发送消息并获取 AI 回复 */
  sendMessage(conversationId: string, message: string): Promise<any> {
    return request.post('/api/report-chat/message', {
      conversation_id: conversationId,
      message,
    })
  },

  /** 获取会话状态（历史消息等，支持翻页） */
  getConversationState(conversationId: string, page = 1, pageSize = 20): Promise<any> {
    return request.get(`/api/report-chat/state/${conversationId}`, { params: { page, page_size: pageSize } })
  },

  /** 列出当前用户的会话列表 */
  getConversations(limit = 20): Promise<any> {
    return request.get('/api/report-chat/conversations', { params: { limit } })
  },

  /** 删除指定会话 */
  deleteConversation(conversationId: string): Promise<any> {
    return request.delete(`/api/report-chat/conversation/${conversationId}`)
  },

  /** 获取可用模型列表 */
  getModels(): Promise<any> {
    return request.get('/api/report-chat/models')
  },
}

export default chatApi
