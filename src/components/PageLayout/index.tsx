import { View, Text } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import 'taro-ui/dist/style/components/icon.scss'
import './index.scss'

interface PageLayoutProps {
  title: string
  children: React.ReactNode
  showBackButton?: boolean
  onBack?: () => void
}

function PageLayout({
  title,
  children,
  showBackButton = true,
  onBack
}: PageLayoutProps) {
  const [statusBarHeight, setStatusBarHeight] = useState(0)
  const [capsuleInfo, setCapsuleInfo] = useState({
    top: 0,
    height: 32,
    right: 0
  })

  useEffect(() => {
    // 获取系统信息
    const systemInfo = Taro.getSystemInfoSync()
    setStatusBarHeight(systemInfo.statusBarHeight || 44)

    // 获取胶囊按钮信息
    try {
      const menuButtonInfo = Taro.getMenuButtonBoundingClientRect()
      setCapsuleInfo({
        top: menuButtonInfo.top,
        height: menuButtonInfo.height,
        right: systemInfo.windowWidth - menuButtonInfo.right
      })
    } catch (error) {
      console.warn('Failed to get menu button info:', error)
    }
  }, [])

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      Taro.navigateBack()
    }
  }

  // 计算导航栏高度
  const navBarHeight = capsuleInfo.top + capsuleInfo.height + 8 - statusBarHeight

  return (
    <View className="page-layout" style={{ backgroundColor: '#f5f7f8' }}>
      {/* 状态栏占位 */}
      <View 
        className="status-bar" 
        style={{ height: `${statusBarHeight}px` }}
      />
      
      {/* 自定义导航栏 */}
      <View 
        className="nav-bar"
        style={{ 
          height: `${navBarHeight}px`,
          paddingRight: `${capsuleInfo.right}px`
        }}
      >
        {showBackButton && (
          <View className="nav-back-button" onClick={handleBack}>
            <AtIcon value="chevron-left" size="24" color="#ffffff" />
          </View>
        )}
        
        <View className="nav-title">
          <Text className="title-text">{title}</Text>
        </View>
        
        {/* 占位，保持标题居中 */}
        <View className="nav-placeholder" />
      </View>
      
      {/* 页面内容 */}
      <View className="page-content">
        {children}
      </View>
    </View>
  )
}

export default PageLayout