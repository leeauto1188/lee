export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        <title>表情包生成器</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style={{ backgroundColor: '#f5f5f5', margin: 0, padding: '20px' }}>
        {children}
      </body>
    </html>
  )
}
