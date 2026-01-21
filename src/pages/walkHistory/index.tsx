import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { Button } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import * as walkingService from '@/services/walking'
import type { WalkRecord } from '@/constants/types'
import './index.scss'

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

function WalkHistory() {
  const navBarInfo = getNavBarInfo()
  const [walks, setWalks] = useState<WalkRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWalk, setSelectedWalk] = useState<WalkRecord | null>(null)

  useEffect(() => {
    loadWalkHistory()
  }, [])

  const loadWalkHistory = async () => {
    try {
      const walkList = await walkingService.getWalkList()
      setWalks(walkList)
    } catch (error) {
      console.error('Failed to load walk history:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    Taro.navigateBack()
  }

  const handleViewDetail = (walkId: number) => {
    Taro.navigateTo({
      url: `/pages/walkDetail/index?walkId=${walkId}`,
    })
  }

  const formatTime = (datetime: string) => {
    const date = new Date(datetime)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const months = Math.floor(days / 30)
    const years = Math.floor(months / 12)

    if (years > 0) {
      return `${years}年前`
    } else if (months > 0) {
      return `${months}个月前`
    } else if (days > 0) {
      return `${days}天前`
    } else if (days === 0) {
      return '今天'
    }
    return datetime
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}小时${mins}分钟`
    }
    return `${mins}分钟`
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case 3:
        return '#10b981'
      case 2:
        return '#f59e0b'
      case 1:
        return '#3b82f6'
      case 0:
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  const getStatusText = (status: number) => {
    switch (status) {
      case 3:
        return '已完成'
      case 2:
        return '已暂停'
      case 1:
        return '进行中'
      case 0:
        return '已取消'
      default:
        return '未知'
    }
  }

  if (loading) {
    return (
      <View className='walk-history loading'>
        <Text>加载中...</Text>
      </View>
    )
  }

  return (
    <View className='walk-history'>
      <View
        className='top-navigation'
        style={{
          paddingTop: `${navBarInfo.statusBarHeight}px`,
          height: `${navBarInfo.totalHeight}px`,
        }}
      >
        <View className='nav-button' onClick={handleBack}>
          <Text className='nav-icon'>←</Text>
        </View>
        <Text className='nav-title'>遛狗记录</Text>
        <View className='nav-button'></View>
      </View>

      <ScrollView className='history-list' scrollY>
        {walks.length === 0 ? (
          <View className='empty-state'>
            <Text className='empty-icon'>🐕</Text>
            <Text className='empty-text'>还没有遛狗记录</Text>
            <Button
              type='primary'
              onClick={() => Taro.switchTab({ url: '/pages/home/index' })}
            >
              开始第一次遛狗
            </Button>
          </View>
        ) : (
          walks.map(walk => (
            <View
              key={walk.id}
              className='walk-item'
              onClick={() => handleViewDetail(walk.id)}
            >
              <View className='walk-header'>
                <View className='walk-date'>{formatTime(walk.startTime)}</View>
                <View
                  className='walk-status'
                  style={{ backgroundColor: getStatusColor(walk.status) }}
                >
                  {getStatusText(walk.status)}
                </View>
              </View>

              <View className='walk-stats'>
                <View className='stat-row'>
                  <Text className='stat-icon'>📍</Text>
                  <Text className='stat-value'>{(walk.distance / 1000).toFixed(2)} 公里</Text>
                </View>
                <View className='stat-row'>
                  <Text className='stat-icon'>⏱️</Text>
                  <Text className='stat-value'>{formatDuration(walk.duration)}</Text>
                </View>
                <View className='stat-row'>
                  <Text className='stat-icon'>🔥</Text>
                  <Text className='stat-value'>{walk.calories} 千卡</Text>
                </View>
              </View>

              {walk.weather && (
                <View className='walk-weather'>
                  <Text className='weather-icon'>
                    {walk.weather.includes('晴') ? '☀️' : walk.weather.includes('阴') ? '☁️' : walk.weather.includes('雨') ? '🌧️' : '🌤️'}
                  </Text>
                  <Text className='weather-text'>{walk.weather}</Text>
                </View>
              )}

              <View className='walk-arrow'>›</View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}

export default WalkHistory
