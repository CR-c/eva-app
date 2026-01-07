import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'

// 获取导航栏信息
const getNavBarInfo = () => {
  try {
    const systemInfo = Taro.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 44
    const menuButton = Taro.getMenuButtonBoundingClientRect()
    const menuButtonMarginTop = menuButton.top - statusBarHeight
    const navBarHeight = menuButton.height + menuButtonMarginTop * 2
    return { statusBarHeight, navBarHeight, totalHeight: statusBarHeight + navBarHeight }
  } catch {
    return { statusBarHeight: 44, navBarHeight: 44, totalHeight: 88 }
  }
}

interface BasePageProps {
  title?: string
  showBack?: boolean
  showHome?: boolean
  rightContent?: React.ReactNode
  className?: string
  children: React.ReactNode
  safeArea?: boolean
}

const BasePage: React.FC<BasePageProps> = ({
  title = '',
  showBack = true,
  showHome = false,
  rightContent,
  className = '',
  children,
  safeArea = true
}) => {
  const navBarInfo = getNavBarInfo()

  const handleBack = () => {
    if (Taro.getCurrentPages().length > 1) {
      Taro.navigateBack()
    } else {
      Taro.switchTab({ url: '/pages/home/index' })
    }
  }

  const handleHome = () => {
    Taro.switchTab({ url: '/pages/home/index' })
  }

  return (
    <View className={`min-h-screen bg-[#f5f7f8] ${className}`}>
      {/* 自定义导航栏 */}
      {title && (
        <View
          className="bg-white"
          style={{
            paddingTop: safeArea ? `${navBarInfo.statusBarHeight}px` : 0,
            borderBottom: '2rpx solid #f1f5f9',
            position: 'sticky',
            top: 0,
            zIndex: 100
          }}
        >
          <View
            className="flex items-center justify-between"
            style={{
              padding: '0 32rpx',
              height: `${navBarInfo.navBarHeight}px`
            }}
          >
            {/* 左侧返回按钮 */}
            {showBack ? (
              <View
                className="flex items-center justify-center bg-[#f1f5f9]"
                style={{ width: '72rpx', height: '72rpx', borderRadius: '36rpx' }}
                onClick={handleBack}
              >
                <Text style={{ fontSize: '32rpx', color: '#0d171c' }}>←</Text>
              </View>
            ) : (
              <View style={{ width: '72rpx' }} />
            )}

            {/* 标题 */}
            <Text className="font-bold text-[#0d171c]" style={{ fontSize: '32rpx' }}>
              {title}
            </Text>

            {/* 右侧内容 */}
            {rightContent || (showHome ? (
              <View
                className="flex items-center justify-center bg-[#eff6ff]"
                style={{ width: '72rpx', height: '72rpx', borderRadius: '36rpx' }}
                onClick={handleHome}
              >
                <Text style={{ fontSize: '24rpx', color: '#25aff4', fontWeight: '600' }}>首页</Text>
              </View>
            ) : (
              <View style={{ width: '72rpx' }} />
            ))}
          </View>
        </View>
      )}

      {/* 页面内容 */}
      <View className="flex-1 relative">
        {children}
      </View>
    </View>
  )
}

export default BasePage