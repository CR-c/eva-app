import { View } from '@tarojs/components'
import './index.scss'

interface LoadingProps {
  text?: string
  size?: 'small' | 'medium' | 'large'
}

function Loading({ text = '加载中...', size = 'medium' }: LoadingProps) {
  return (
    <View className="loading-component">
      <View className={`loading-spinner loading-${size}`}>
        <View className="spinner"></View>
      </View>
      {text && <View className="loading-text">{text}</View>}
    </View>
  )
}

export default Loading
