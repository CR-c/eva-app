import { useEffect } from 'react'
import { ConfigProvider } from '@nutui/nutui-react-taro'
import zhCN from '@nutui/nutui-react-taro/dist/es/locales/zh-CN'
import { useUserStore } from './store/user'
import './styles/index.scss'
import './styles/tailwind.css'

function App({ children }: { children: React.ReactNode }) {
  const restoreLoginState = useUserStore((state) => state.restoreLoginState)

  useEffect(() => {
    // App 启动时恢复登录态
    restoreLoginState()

    // 全局异常兜底处理
    const handleError = (error: any) => {
      console.error('Global error:', error)
    }

    // 监听未捕获的错误
    if (typeof window !== 'undefined') {
      window.addEventListener('error', handleError)
      window.addEventListener('unhandledrejection', handleError)

      return () => {
        window.removeEventListener('error', handleError)
        window.removeEventListener('unhandledrejection', handleError)
      }
    }
  }, [restoreLoginState])

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        primaryColor: '#3b82f6', // Eva app 主色
        primaryColorHover: '#1d4ed8',
        nutuiBrandColor: '#3b82f6',
        nutuiBrandColorStart: '#3b82f6',
        nutuiBrandColorEnd: '#1d4ed8',
      }}
    >
      {children}
    </ConfigProvider>
  )
}

export default App
