'use client';

import { useCallback } from 'react';

import { useState } from 'react';

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');

  const sendRequest = useCallback(async () => {
    const input = document.getElementById('inputText').value;
    setIsLoading(true);
    setResponse('正在生成...');

    try {
      const response = await fetch(`/api/generate?data=${encodeURIComponent(input)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const decoder = new TextDecoder();
      const reader = response.body.getReader();

      setResponse('');

      while (true) {
        const {value, done} = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value);
        setResponse(prev => prev + text);
      }
    } catch (error) {
      setResponse(`错误: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="container">
      <h1>表情包生成器</h1>
      <div className="input-group">
        <input
          type="text"
          id="inputText"
          placeholder="请输入表情包描述，例如：震惊"
          onKeyPress={(e) => e.key === 'Enter' && sendRequest()}
        />
        <button onClick={sendRequest} disabled={isLoading}>
          {isLoading ? '生成中...' : '生成表情'}
        </button>
      </div>
      <div id="response">{response}</div>

      <style jsx>{`
        .container {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .input-group {
          margin-bottom: 20px;
        }
        input[type="text"] {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
          margin-bottom: 10px;
        }
        button {
          background-color: #4CAF50;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
        button:hover:not(:disabled) {
          background-color: #45a049;
        }
        #response {
          margin-top: 20px;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          min-height: 100px;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
      `}</style>
    </div>
  );
}
