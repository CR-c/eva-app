import React from 'react'
import { View } from '@tarojs/components'
import { NavBar } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'

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

  const safeAreaClasses = safeArea ? 'pt-safe-top pb-safe-bottom' : ''

  return (
    <View className={`min-h-screen bg-gray-50 ${safeAreaClasses} ${className}`}>
      {/* Navigation Bar */}
      {title && (
        <NavBar
          title={title}
          leftShow={showBack}
          onClickBack={handleBack}
          rightShow={!!rightContent || showHome}
          right={
            rightContent || (showHome ? (
              <View 
                className="px-4 py-2 text-blue-500 text-sm cursor-pointer"
                onClick={handleHome}
              >
                首页
              </View>
            ) : null)
          }
          className="bg-white border-b border-gray-100 shadow-sm"
        />
      )}
      
      {/* Page Content */}
      <View className="flex-1 relative">
        {children}
      </View>
    </View>
  )
}

export default BasePage