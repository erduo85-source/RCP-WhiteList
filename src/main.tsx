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
          borderRadiusLG: 12,
          colorBgLayout: '#f5f7fb',
          colorBgContainer: '#ffffff',
          colorText: '#1c2742',
          colorTextSecondary: '#667085',
          colorBorderSecondary: '#edf1f7',
          fontFamily:
            '"PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif',
        },
        components: {
          Button: {
            controlHeightLG: 40,
            fontWeight: 600,
          },
          Card: {
            headerHeight: 68,
          },
          Menu: {
            itemHeight: 42,
            itemBorderRadius: 8,
            itemSelectedBg: '#edf4ff',
            itemSelectedColor: '#2f67ff',
            itemColor: '#344054',
            subMenuItemBg: '#ffffff',
          },
          Segmented: {
            itemActiveBg: '#2f67ff',
            itemSelectedBg: '#2f67ff',
            itemSelectedColor: '#ffffff',
            trackBg: '#ffffff',
          },
          Table: {
            headerBg: '#ffffff',
            headerColor: '#344054',
            rowHoverBg: '#f8fbff',
            borderColor: '#edf1f7',
          },
        },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>,
)
