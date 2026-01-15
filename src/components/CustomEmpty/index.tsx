import React from 'react'
import { View, Image, Text } from '@tarojs/components'
import { Button } from '@nutui/nutui-react-taro'

interface CustomEmptyProps {
  /** 空状态描述文本 */
  description?: string
  /** 空状态图片 */
  image?: string
  /** 图片大小 */
  imageSize?: 'small' | 'medium' | 'large'
  /** 操作按钮文本 */
  actionText?: string
  /** 操作按钮点击事件 */
  onAction?: () => void
  /** 自定义样式类名 */
  className?: string
  /** 是否显示默认图片 */
  showDefaultImage?: boolean
}

const CustomEmpty: React.FC<CustomEmptyProps> = ({
  description = '暂无数据',
  image,
  imageSize = 'medium',
  actionText,
  onAction,
  className = '',
  showDefaultImage = true,
}) => {
  const sizeClasses = {
    small: 'w-24 h-24',
    medium: 'w-32 h-32',
    large: 'w-40 h-40',
  }

  const defaultImageSrc =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik00MCA2NEg4OFY3Mkg0MFY2NFoiIGZpbGw9IiNEOUQ5RDkiLz4KPHBhdGggZD0iTTQ4IDQ4SDgwVjU2SDQ4VjQ4WiIgZmlsbD0iI0Q5RDlEOSIvPgo8L3N2Zz4K'

  return (
    <View className={`flex flex-col items-center justify-center py-16 px-8 ${className}`}>
      {/* 空状态图片 */}
      {(image || showDefaultImage) && (
        <View className={`${sizeClasses[imageSize]} mb-6 flex items-center justify-center`}>
          <Image
            src={image || defaultImageSrc}
            className='w-full h-full object-contain opacity-60'
            mode='aspectFit'
          />
        </View>
      )}

      {/* 描述文本 */}
      <Text className='text-gray-400 text-base text-center mb-6 leading-relaxed'>
        {description}
      </Text>

      {/* 操作按钮 */}
      {actionText && onAction && (
        <Button
          type='primary'
          size='small'
          onClick={onAction}
          className='bg-blue-500 border-blue-500 hover:bg-blue-600 px-6'
        >
          {actionText}
        </Button>
      )}
    </View>
  )
}

export default CustomEmpty
