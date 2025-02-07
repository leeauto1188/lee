# AI 表情包生成器

这是一个基于 Coze API 的智能表情包生成工具，通过简单的文字描述即可生成有趣的表情包图片。

## 功能特点

- 🎨 智能表情生成：根据文字描述自动生成匹配的表情包
- 🖼️ 实时图片预览：生成的表情包直接显示在界面上
- ⬇️ 一键下载：支持表情包图片快速下载
- 💬 流畅对话：支持连续对话，可以不断调整生成效果
- 🎯 简单易用：清晰的界面设计，无需特殊技能即可使用

## 技术实现

- 前端界面：HTML5 + CSS3 + JavaScript
- API 集成：Coze API 流式响应处理
- 数据处理：SSE (Server-Sent Events) 实时数据解析
- 界面设计：响应式设计，支持各种设备访问

## 使用方法

1. 启动服务器：
   ```bash
   python3 -m http.server 8000
   ```

2. 访问应用：
   - 打开浏览器
   - 访问 http://localhost:8000
   - 等待页面加载完成

3. 生成表情包：
   - 在输入框中输入表情包描述
   - 例如：「开心」、「伤心」、「可爱」等
   - 点击"生成表情"按钮或按回车键
   - 等待表情包生成并显示

4. 下载表情包：
   - 表情包生成后，点击图片下方的"下载表情"按钮
   - 选择保存位置即可下载

## 文件说明

- `index.html`: 前端页面及样式
- `script.js`: API 调用和业务逻辑处理
- `README.md`: 项目说明文档

## 使用技巧

1. 描述越具体，生成的表情包越符合预期
2. 可以尝试不同的描述方式：
   - 情绪类：开心、伤心、生气、惊讶
   - 场景类：吃饭、睡觉、工作、玩耍
   - 风格类：可爱、搞笑、严肃、夸张

## 注意事项

- 确保网络连接正常
- 如遇到跨域问题，需要配置浏览器 CORS 设置
- 建议使用现代浏览器（Chrome、Firefox、Safari 等）访问

## 更新日志

### 2025-01-23
- 优化界面设计，采用现代化 UI
- 添加图片实时预览功能
- 优化流式响应处理
- 添加一键下载功能

## 问题反馈

如果您在使用过程中遇到任何问题，或有任何改进建议，请及时反馈。

