import { NextResponse } from 'next/server';

// 配置跨域
export const runtime = 'edge';

// 处理OPTIONS请求
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}

// API路由处理函数
// 处理来自Coze的SSE响应
async function processStream(reader) {
  console.log('Starting to process stream...');
  const decoder = new TextDecoder();
  let imageUrl = null;

  try {
    while (!imageUrl) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      console.log('Received chunk:', chunk);
      const events = chunk.split('\n\n');

      for (const event of events) {
        console.log('Processing event:', event);
        if (event.includes('conversation.message.completed')) {
          const dataLine = event.split('\n').find(line => line.startsWith('data:'));
          if (dataLine) {
            console.log('Found data line:', dataLine);
            const eventData = JSON.parse(dataLine.slice(5));
            console.log('Parsed event data:', eventData);
            if (eventData.content) {
              try {
                console.log('Trying to parse content:', eventData.content);
                const content = JSON.parse(eventData.content);
                console.log('Parsed content:', content);
                if (content.url) {
                  imageUrl = content.url;
                  break;
                }
              } catch (e) {
                console.error('Error parsing content:', e);
              }
            }
          }
        }
      }
    }
  } catch (e) {
    console.error('Error processing stream:', e);
  }

  return imageUrl;
}

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
    messages: [
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

    if (!response.ok) {
      return new NextResponse(JSON.stringify({ error: `API请求失败: ${response.status}` }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // 设置响应头
    const headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*'
    };

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const {value, done} = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, {stream: true});
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.trim() === '') continue;
              if (line.startsWith('data:')) {
                try {
                  const eventData = JSON.parse(line.slice(5));
                  console.log('Event data:', eventData);
                  controller.enqueue(line + '\n');
                } catch (e) {
                  console.error('Error parsing event data:', e);
                }
              } else {
                controller.enqueue(line + '\n');
              }
            }
          }
        } catch (e) {
          console.error('Stream processing error:', e);
          controller.error(e);
        } finally {
          controller.close();
        }
      }
    });

    return new NextResponse(stream, { headers });

    if (imageUrl) {
      return new NextResponse(JSON.stringify({ url: imageUrl }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*'
        }
      });
    }

    return new NextResponse(JSON.stringify({ error: 'No image URL found' }), {
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
