// 处理跨域的配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
}

// 处理OPTIONS预检请求
async function handleOptions(request) {
  return new Response(null, {
    headers: corsHeaders
  })
}

// 主要处理逻辑
async function handleRequest(request) {
  // 获取URL中的data参数
  const url = new URL(request.url)
  const data = url.searchParams.get('data')
  
  if (!data) {
    return new Response('Missing data parameter', {
      status: 400,
      headers: corsHeaders
    })
  }

  // 构建请求体
  const requestBody = {
    bot_id: "7462973713437835327",
    user_id: "123456789",
    stream: true,
    auto_save_history: true,
    additional_messages: [
      {
        role: "user",
        content: data,
        content_type: "text"
      }
    ]
  }

  // 调用Coze API
  const response = await fetch('https://api.coze.cn/v3/chat', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer pat_QtNPx52lB43YqfVLgPR7lGRp3jFXnVe7VtA0Z7e0pX6KCBbNYeLc9rKOdI2dVzXr',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  })

  // 返回流式响应
  return new Response(response.body, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}

// 处理所有请求
addEventListener('fetch', event => {
  const request = event.request
  
  // 处理OPTIONS请求
  if (request.method === 'OPTIONS') {
    event.respondWith(handleOptions(request))
  } else if (request.method === 'GET') {
    event.respondWith(handleRequest(request))
  }
})
