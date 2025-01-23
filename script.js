// API 配置
const API_CONFIG = {
    url: 'https://api.coze.cn/v3/chat',
    token: 'pat_QtNPx52lB43YqfVLgPR7lGRp3jFXnVe7VtA0Z7e0pX6KCBbNYeLc9rKOdI2dVzXr',
    botId: '7462973713437835327',
    userId: '123456789'
};

// 显示消息到聊天容器
function appendMessage(content, isUser = false) {
    const chatContainer = document.getElementById('chatContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    if (!isUser && content.startsWith('http')) {
        // 创建图片元素
        const img = document.createElement('img');
        img.src = content;
        img.alt = '生成的表情';
        img.className = 'generated-image';
        messageDiv.appendChild(img);
        
        // 添加下载按钮
        const downloadBtn = document.createElement('a');
        downloadBtn.href = content;
        downloadBtn.className = 'download-btn';
        downloadBtn.innerHTML = '下载表情';
        downloadBtn.download = '表情包.jpg';
        downloadBtn.target = '_blank';
        messageDiv.appendChild(downloadBtn);
    } else {
        messageDiv.textContent = content;
    }
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 解析 SSE 数据
function parseSSEData(text) {
    const events = text.split('\n\n').filter(event => event.trim());
    let finalContent = '';

    for (const event of events) {
        const lines = event.split('\n');
        const eventType = lines[0].replace('event:', '');
        const data = lines[1].replace('data:', '');

        try {
            const jsonData = JSON.parse(data);
            
            // 提取 conversation.message.delta 或 conversation.message.completed 中的 content
            if ((eventType === 'conversation.message.delta' || 
                 eventType === 'conversation.message.completed') && 
                jsonData.type === 'answer' && 
                jsonData.content) {
                finalContent = jsonData.content;
            }
            
            // 如果是工具响应，也提取内容
            if (eventType === 'conversation.message.completed' && 
                jsonData.type === 'tool_response' && 
                jsonData.content) {
                finalContent = jsonData.content;
            }
        } catch (e) {
            console.error('解析 JSON 失败:', e);
        }
    }

    return finalContent;
}

// 发送消息到 API
async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) return;

    // 显示用户消息
    appendMessage(message, true);
    messageInput.value = '';

    // 准备请求数据
    const requestData = {
        bot_id: API_CONFIG.botId,
        user_id: API_CONFIG.userId,
        stream: true,
        auto_save_history: true,
        additional_messages: [
            {
                role: 'user',
                content: message,
                content_type: 'text'
            }
        ]
    };

    try {
        // 创建响应容器
        const responseDiv = document.createElement('div');
        responseDiv.className = 'message bot-message';
        document.getElementById('chatContainer').appendChild(responseDiv);

        // 发起请求
        const response = await fetch(API_CONFIG.url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_CONFIG.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        // 处理流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let responseText = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                // 在完成时解析并显示最终内容
                const finalContent = parseSSEData(responseText);
                if (finalContent) {
                    responseDiv.remove(); // 移除临时响应容器
                    appendMessage(finalContent); // 添加最终内容
                }
                break;
            }

            // 累积响应文本
            responseText += decoder.decode(value, { stream: true });
        }

    } catch (error) {
        console.error('API 请求错误:', error);
        appendMessage('发送消息时出现错误，请稍后重试。');
    }
}

// 添加输入框回车事件监听
document.getElementById('messageInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});
