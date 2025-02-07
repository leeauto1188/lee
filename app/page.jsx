'use client';

import { useState } from 'react';

export default function Page() {
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendRequest() {
    const input = document.getElementById('inputText').value;
    if (!input) {
      setError('请输入表情包描述');
      return;
    }

    setLoading(true);
    setError('');
    setImageUrl('');

    try {
      const response = await fetch(`/api?data=${encodeURIComponent(input)}`);
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (data.url) {
        setImageUrl(data.url);
      } else {
        throw new Error('未能获取到图片URL');
      }
    } catch (error) {
      setError(`错误: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h1>表情包生成器</h1>
      <div className="input-group">
        <input 
          type="text" 
          id="inputText" 
          placeholder="请输入表情包描述，例如：震惊" 
          disabled={loading}
        />
        <button 
          onClick={sendRequest} 
          disabled={loading}
        >
          {loading ? '生成中...' : '生成表情'}
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      {imageUrl && (
        <div className="result">
          <img src={imageUrl} alt="生成的表情包" />
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          text-align: center;
        }
        .input-group {
          margin: 20px 0;
        }
        input[type="text"] {
          width: 80%;
          padding: 10px;
          margin-right: 10px;
          border: 2px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }
        input[type="text"]:focus {
          border-color: #4CAF50;
          outline: none;
        }
        button {
          padding: 10px 20px;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        button:disabled {
          background-color: #cccccc;
        }
        button:hover:not(:disabled) {
          background-color: #45a049;
        }
        .error {
          color: red;
          margin: 10px 0;
        }
        .result {
          margin-top: 20px;
        }
        .result img {
          max-width: 100%;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
          word-wrap: break-word;
        }
      `}</style>
    </div>
  );
}
