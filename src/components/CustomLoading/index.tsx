import React from 'react'
import { View, Text } from '@tarojs/components'
import { Loading } from '@nutui/nutui-react-taro'

interface CustomLoadingProps {
  /** 加载文本 */
  text?: string
  /** 加载器大小 */
  size?: 'small' | 'medium' | 'large'
  /** 加载器类型 */
  type?: 'spinner' | 'circular'
  /** 是否显示遮罩层 */
  overlay?: boolean
  /** 自定义样式类名 */
  className?: string
  /** 是否垂直居中 */
  centered?: boolean
}

const CustomLoading: React.FC<CustomLoadingProps> = ({
  text = '加载中...',
  size = 'medium',
  type = 'spinner',
  overlay = false,
  className = '',
  centered = true
}) => {
  const sizeClasses = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8', 
    large: 'w-10 h-10'
  }

  const containerClasses = centered 
    ? 'flex flex-col items-center justify-center py-12'
    : 'flex flex-col items-center'

  const loadingContent = (
    <View className={`${containerClasses} ${className}`}>
      {/* NutUI Loading 组件 */}
      <View className={`${sizeClasses[size]}`}>
        <Loading
          type={type}
          className="text-blue-500"
        />
      </View>
      
      {/* 加载文本 */}
      {text && (
        <Text className="text-gray-500 text-sm mt-3 text-center">
          {text}
        </Text>
      )}
    </View>
  )

  // 如果需要遮罩层
  if (overlay) {
    return (
      <View className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <View className="bg-white rounded-lg p-6 shadow-lg min-w-32">
          {loadingContent}
        </View>
      </View>
    )
  }

  return loadingContent
}

export default CustomLoading