import { NextResponse } from 'next/server';

// API路由处理函数
export async function GET(request) {
  // 获取查询参数
  const { searchParams } = new URL(request.url);
  const data = searchParams.get('data');

  if (!data) {
    return new NextResponse(JSON.stringify({ error: 'Missing data parameter' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*'
      }
    });
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
  };

  try {
    // 调用Coze API
    const response = await fetch('https://api.coze.cn/v3/chat', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer pat_QtNPx52lB43YqfVLgPR7lGRp3jFXnVe7VtA0Z7e0pX6KCBbNYeLc9rKOdI2dVzXr',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    // 返回流式响应
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*'
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*'
      }
    });
  }
}
