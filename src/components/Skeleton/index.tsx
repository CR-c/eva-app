import { View } from '@tarojs/components'
import './index.scss'

interface SkeletonProps {
  loading?: boolean
  children?: React.ReactNode
  rows?: number
  avatar?: boolean
  card?: boolean
}

function Skeleton({
  loading = true,
  children,
  rows = 3,
  avatar = false,
  card = false,
}: SkeletonProps) {
  if (!loading) {
    return <>{children}</>
  }

  return (
    <View className={`skeleton-wrapper ${card ? 'skeleton-card' : ''}`}>
      {avatar && (
        <View className="skeleton-item skeleton-avatar skeleton-animate"></View>
      )}
      <View className="skeleton-content">
        {Array.from({ length: rows }).map((_, index) => (
          <View
            key={index}
            className={`skeleton-item skeleton-row skeleton-animate ${
              index === rows - 1 ? 'skeleton-row-short' : ''
            }`}
          ></View>
        ))}
      </View>
    </View>
  )
}

export default Skeleton
