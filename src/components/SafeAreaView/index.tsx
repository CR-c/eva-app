import React, { useEffect, useState } from 'react'
import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'

interface SafeAreaViewProps {
  /** 子组件 */
  children: React.ReactNode
  /** 是否启用顶部安全区域 */
  top?: boolean
  /** 是否启用底部安全区域 */
  bottom?: boolean
  /** 自定义样式类名 */
  className?: string
  /** 背景色 */
  backgroundColor?: string
}

const SafeAreaView: React.FC<SafeAreaViewProps> = ({
  children,
  top = true,
  bottom = true,
  className = '',
  backgroundColor = 'bg-white'
}) => {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    bottom: 0
  })

  useEffect(() => {
    // 获取系统信息
    Taro.getSystemInfo({
      success: (res) => {
        const { safeArea: systemSafeArea, screenHeight } = res
        
        if (systemSafeArea) {
          setSafeArea({
            top: systemSafeArea.top,
            bottom: screenHeight - systemSafeArea.bottom
          })
        }
      }
    })
  }, [])

  const topStyle = top ? { paddingTop: `${safeArea.top}px` } : {}
  const bottomStyle = bottom ? { paddingBottom: `${safeArea.bottom}px` } : {}

  return (
    <View 
      className={`${backgroundColor} ${className}`}
      style={{
        ...topStyle,
        ...bottomStyle
      }}
    >
      {children}
    </View>
  )
}

export default SafeAreaView