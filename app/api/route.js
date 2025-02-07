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
  console.log('Received API request');
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
    user_id: "user_123",
    messages: [
      {
        role: "user",
        content: `生成一个表情包：${data}`,
        content_type: "text"
      }
    ],
    plugins: [
      {
        plugin_id: "7463001326394507304",
        api_id: "7463001326394523688",
        plugin_type: 4,
        plugin_name: "biaoqingbao",
        api_name: "biaoqingbao"
      }
    ]
  };

  console.log('Request body:', JSON.stringify(requestBody, null, 2));

  try {
    // 调用Coze API
    let response;
    try {
      response = await fetch('https://api.coze.cn/v3/chat', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer pat_QtNPx52lB43YqfVLgPR7lGRp3jFXnVe7VtA0Z7e0pX6KCBbNYeLc9rKOdI2dVzXr',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('API response status:', response.status);
      console.log('API response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        return new NextResponse(JSON.stringify({ error: `API请求失败: ${response.status}` }), {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        });
      }
    } catch (error) {
      console.error('API request error:', error);
      return new NextResponse(JSON.stringify({ error: `API请求失败: ${error.message}` }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    try {
      const data = await response.json();
      console.log('API response data:', JSON.stringify(data, null, 2));

      let imageUrl = null;

      // 检查插件返回数据
      if (data.plugin_responses && data.plugin_responses.length > 0) {
        const pluginResponse = data.plugin_responses[0];
        if (pluginResponse.content) {
          try {
            const content = JSON.parse(pluginResponse.content);
            console.log('Plugin response content:', content);
            if (content.url) {
              imageUrl = content.url;
            }
          } catch (e) {
            console.error('Error parsing plugin response:', e);
          }
        }
      }

      if (imageUrl) {
        console.log('Found image URL:', imageUrl);
        return new NextResponse(JSON.stringify({ url: imageUrl }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } else {
        console.log('No image URL found in response');
        return new NextResponse(JSON.stringify({ error: '未能获取到图片URL' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    } catch (error) {
      console.error('Error parsing response:', error);
      return new NextResponse(JSON.stringify({ error: `响应解析失败: ${error.message}` }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

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
