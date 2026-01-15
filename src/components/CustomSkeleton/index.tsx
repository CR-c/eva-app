import React from 'react'
import { View } from '@tarojs/components'
import { Skeleton } from '@nutui/nutui-react-taro'

interface CustomSkeletonProps {
  /** 是否显示加载状态 */
  loading?: boolean
  /** 子组件 */
  children?: React.ReactNode
  /** 骨架屏行数 */
  rows?: number
  /** 是否显示头像 */
  avatar?: boolean
  /** 头像大小 */
  avatarSize?: 'small' | 'medium' | 'large'
  /** 是否显示标题 */
  title?: boolean
  /** 是否显示卡片样式 */
  card?: boolean
  /** 自定义样式类名 */
  className?: string
  /** 动画类型 */
  animated?: boolean
}

const CustomSkeleton: React.FC<CustomSkeletonProps> = ({
  loading = true,
  children,
  rows = 3,
  avatar = false,
  avatarSize = 'medium',
  title = false,
  card = false,
  className = '',
  animated = true,
}) => {
  // 如果不是加载状态，直接返回子组件
  if (!loading) {
    return <>{children}</>
  }

  const avatarSizeMap = {
    small: '40',
    medium: '60',
    large: '80',
  }

  const cardClasses = card ? 'bg-white rounded-2xl p-6 border border-gray-100 shadow-sm' : ''

  return (
    <View className={`${cardClasses} ${className}`}>
      <View className={`flex ${avatar ? 'gap-4' : ''}`}>
        {/* 头像骨架 */}
        {avatar && (
          <View className='flex-shrink-0'>
            <Skeleton
              width={avatarSizeMap[avatarSize]}
              height={avatarSizeMap[avatarSize]}
              animated={animated}
              className='rounded-full'
            />
          </View>
        )}

        {/* 内容骨架 */}
        <View className='flex-1 space-y-3'>
          {/* 标题骨架 */}
          {title && <Skeleton width='60%' height='20' animated={animated} className='rounded' />}

          {/* 行骨架 */}
          {Array.from({ length: rows }).map((_, index) => (
            <Skeleton
              key={index}
              width={index === rows - 1 ? '80%' : '100%'}
              height='16'
              animated={animated}
              className='rounded'
            />
          ))}
        </View>
      </View>
    </View>
  )
}

export default CustomSkeleton
