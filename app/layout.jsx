import './globals.css'

export const metadata = {
  title: '表情包生成器',
  description: 'AI智能表情包生成工具',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
