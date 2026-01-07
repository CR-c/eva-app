import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface TopNavigationProps {
  onBack: () => void
  onSettings: () => void
  isLive: boolean
}

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

function TopNavigation({ onBack, onSettings, isLive }: TopNavigationProps) {
  const navBarInfo = getNavBarInfo()

  return (
    <View
      className="top-navigation"
      style={{ paddingTop: `${navBarInfo.statusBarHeight}px` }}
    >
      <View
        className="nav-content"
        style={{ height: `${navBarInfo.navBarHeight}px` }}
      >
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