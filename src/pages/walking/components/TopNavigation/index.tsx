import { View, Text } from '@tarojs/components'
import './index.scss'

interface TopNavigationProps {
  onBack: () => void
  onSettings: () => void
  isLive: boolean
}

function TopNavigation({ onBack, onSettings, isLive }: TopNavigationProps) {
  return (
    <View className="top-navigation">
      <View className="nav-content">
        {/* 返回按钮 */}
        <View className="nav-button" onClick={onBack}>
          <Text className="nav-icon">←</Text>
        </View>
        
        {/* 中间状态区域 */}
        <View className="nav-center">
          <View className="status-indicator">
            {isLive && <View className="live-dot" />}
            <Text className="status-text">Buddy • {isLive ? '直播中' : '已暂停'}</Text>
          </View>
        </View>
        
        {/* 设置按钮 */}
        <View className="nav-button" onClick={onSettings}>
          <Text className="nav-icon">⚙️</Text>
        </View>
      </View>
    </View>
  )
}

export default TopNavigation