import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#2f67ff',
          borderRadius: 8,
          colorBgLayout: '#f5f7fb',
          colorText: '#1c2742',
          colorTextSecondary: '#667085',
          fontFamily:
            '"PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif',
        },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>,
)
