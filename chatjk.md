名称：创建新的报告对话会话
方式：post
接口：/api/report-chat/start
传参：{
  "analysis_id": "string"//报告的id，用户选择报告向AI提问
}
返回：{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string",
      "input": "string",
      "ctx": {}
    }
  ]
}

名称：发送消息并获取 AI 回复
方式：post
接口：/api/report-chat/message
传参：{
  "conversation_id": "string",
  "message": "string"
}
返回：{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string",
      "input": "string",
      "ctx": {}
    }
  ]
}


名称：获取会话状态，包含历史轮次、token 统计等。
方式：get 
接口：/api/report-chat/state/(conversation_id)
传参：conversation_id
返回：

名称：列出当前用户的报告对话会话（最近 N 条）。
方式：get 
接口：/api/report-chat/conversations?limit=20
传参：limit
返回：

名称：删除指定会话。
方式：DELETE
接口：/api/report-chat/conversation/(conversation_id)
传参：conversation_id
返回：

名称：列出系统中可用于对话的模型,目前不让选择，只有deepseek，功能还不完善。
方式：get
接口：/api/report-chat/models
传参：
返回：{
  "success": true,
  "data": {
    "models": [
      {
        "model_name": "qwen-turbo",
        "provider": "dashscope",
        "enabled": true
      },
      {
        "model_name": "qwen-plus-latest",
        "provider": "dashscope",
        "enabled": true
      },
      {
        "model_name": "gpt-3.5-turbo",
        "provider": "openai",
        "enabled": false
      },
      {
        "model_name": "gpt-4",
        "provider": "openai",
        "enabled": false
      },
      {
        "model_name": "gemini-2.5-pro",
        "provider": "google",
        "enabled": false
      },
      {
        "model_name": "deepseek-chat",
        "provider": "deepseek",
        "enabled": false
      }
    ]
  },
  "message": "ok",
  "timestamp": "2026-06-27T12:12:51.432165+08:00"
}