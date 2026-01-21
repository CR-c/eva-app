import { useState, useEffect } from 'react'
import { View, Text, Image, Map } from '@tarojs/components'
import { Button } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import * as walkingService from '@/services/walking'
import type { WalkDetail } from '@/constants/types'
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

interface WalkData {
  id: number
  distance: number
  duration: number
  pace: number
  calories: number
  startTime: string
  endTime: string
  trackPoints: { lat: number; lng: number }[]
  petName?: string
  petPhoto?: string
}

function WalkSummary() {
  const navBarInfo = getNavBarInfo()
  const [walkData, setWalkData] = useState<WalkData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadWalkData = async () => {
      const instance = Taro.getCurrentInstance()
      const params = instance.router?.params

      if (params?.walkId) {
        try {
          const walkDetail: WalkDetail = await walkingService.getWalkDetail(parseInt(params.walkId))
          
          setWalkData({
            id: walkDetail.id,
            distance: walkDetail.distance / 1000,
            duration: Math.floor(walkDetail.duration / 60),
            pace: walkDetail.avgPace ? Math.floor(walkDetail.avgPace / 60) : 0,
            calories: walkDetail.calories,
            startTime: walkDetail.startTime,
            endTime: walkDetail.endTime || '',
            trackPoints: walkDetail.trackPoints.map(p => ({ lat: p.lat || p.latitude, lng: p.lng || p.longitude })),
            petName: walkDetail.petName || undefined,
            petPhoto: walkDetail.petPhoto || undefined,
          })

          Taro.setNavigationBarTitle({ title: '散步总结' })
        } catch (error) {
          console.error('Failed to load walk data:', error)
          Taro.showToast({
            title: '加载失败',
            icon: 'none',
          })
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    loadWalkData()
  }, [])

  const handleClose = () => {
    Taro.navigateBack({ delta: 2 })
  }

  const handleMore = () => {
    Taro.showActionSheet({
      itemList: ['保存到相册', '查看详细数据', '设置提醒'],
      success: res => {
        const actions = ['保存到相册', '查看详细数据', '设置提醒']
        Taro.showToast({ title: actions[res.tapIndex], icon: 'none' })
      },
    })
  }

  const handleViewRoute = () => {
    Taro.showToast({ title: '查看路线详情', icon: 'none' })
  }

  const handleShare = () => {
    Taro.showShareMenu({
      withShareTicket: true,
      success: () => {
        Taro.showToast({ title: '分享成功！', icon: 'success' })
      },
      fail: () => {
        Taro.showActionSheet({
          itemList: ['分享到朋友圈', '复制链接', '保存图片'],
          success: res => {
            const shareActions = ['分享到朋友圈', '复制链接', '保存图片']
            Taro.showToast({ title: shareActions[res.tapIndex], icon: 'success' })
          },
        })
      },
    })
  }

  const handleBackHome = () => {
    Taro.switchTab({ url: '/pages/home/index' })
  }

  if (loading || !walkData) {
    return (
      <View className='walk-summary loading'>
        <Text>加载中...</Text>
      </View>
    )
  }

  const polylineData = [
    {
      points: walkData.trackPoints.map(point => ({
        latitude: point.lat || point.latitude,
        longitude: point.lng || point.longitude,
      })),
      color: '#25aff4',
      width: 6,
      arrowLine: true,
    },
  ]

  const mapCenter = walkData.trackPoints.length > 0
    ? {
        latitude: walkData.trackPoints[Math.floor(walkData.trackPoints.length / 2)].lat || 
                   walkData.trackPoints[Math.floor(walkData.trackPoints.length / 2)].latitude,
        longitude: walkData.trackPoints[Math.floor(walkData.trackPoints.length / 2)].lng || 
                    walkData.trackPoints[Math.floor(walkData.trackPoints.length / 2)].longitude,
      }
    : { latitude: 39.908823, longitude: 116.39747 }

  return (
    <View className='walk-summary'>
      <View className='confetti-background'>
        <View className='confetti confetti-circle delay-1' />
        <View className='confetti confetti-circle delay-2' />
        <View className='confetti confetti-circle delay-3' />
        <View className='confetti confetti-rect delay-1' />
        <View className='confetti confetti-rect delay-2' />
        <View className='confetti confetti-rect delay-3' />
        <View className='confetti confetti-star delay-1' />
        <View className='confetti confetti-star delay-2' />
      </View>

      <View
        className='top-navigation'
        style={{
          paddingTop: `${navBarInfo.statusBarHeight}px`,
          height: `${navBarInfo.totalHeight}px`,
        }}
      >
        <View className='nav-button' onClick={handleClose}>
          <Text className='nav-icon'>✕</Text>
        </View>
        <Text className='nav-title'>散步总结</Text>
        <View className='nav-button' onClick={handleMore}>
          <Text className='nav-icon'>⋯</Text>
        </View>
      </View>

      <View className='main-content'>
        <View className='celebration-section'>
          <View className='stars'>
            <Text className='star'>⭐</Text>
            <Text className='star'>⭐</Text>
            <Text className='star'>⭐</Text>
          </View>
          <Text className='celebration-title'>散步完成！</Text>
          <Text className='celebration-subtitle'>目标成功达成</Text>
        </View>

        <View className='glass-card'>
          <View className='avatar-badge'>
            <View className='avatar-container'>
              <Image
                className='avatar-image'
                src={walkData.petPhoto || 'https://via.placeholder.com/100'}
                mode='aspectFill'
              />
            </View>
          </View>

          <View className='main-metric'>
            <Text className='metric-label'>总距离</Text>
            <View className='metric-value-section'>
              <Text className='metric-value'>{walkData.distance.toFixed(1)}</Text>
              <Text className='metric-unit'>公里</Text>
            </View>
          </View>

          <View className='divider' />

          <View className='stats-grid'>
            <View className='stat-item'>
              <View className='stat-icon duration-icon'>
                <Text className='icon-text'>⏱️</Text>
              </View>
              <Text className='stat-value'>{walkData.duration}</Text>
              <Text className='stat-unit'>分钟</Text>
            </View>

            <View className='stat-item'>
              <View className='stat-icon pace-icon'>
                <Text className='icon-text'>⚡</Text>
              </View>
              <Text className='stat-value'>{walkData.pace}</Text>
              <Text className='stat-unit'>分钟/公里</Text>
            </View>

            <View className='stat-item'>
              <View className='stat-icon calories-icon'>
                <Text className='icon-text'>🔥</Text>
              </View>
              <Text className='stat-value'>{walkData.calories}</Text>
              <Text className='stat-unit'>千卡</Text>
            </View>
          </View>

          <View className='map-preview' onClick={handleViewRoute}>
            <View className='map-container'>
              <Map
                className='map-image'
                latitude={mapCenter.latitude}
                longitude={mapCenter.longitude}
                polyline={polylineData}
                scale={14}
                showLocation={false}
                showScale={false}
                enableZoom={false}
                enableScroll={false}
              />
              <View className='map-overlay'>
                <View className='view-route-button'>
                  <Text className='route-icon'>🗺️</Text>
                  <Text className='route-text'>查看路线</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className='bottom-actions'>
        <Button
          type='primary'
          block
          onClick={handleShare}
          style={{
            marginBottom: '24rpx',
            height: '96rpx',
            borderRadius: '48rpx',
            background: '#25aff4',
          }}
        >
          <View className='flex items-center justify-center' style={{ gap: '12rpx' }}>
            <Text style={{ fontSize: '32rpx' }}>📤</Text>
            <Text className='text-white font-bold' style={{ fontSize: '30rpx' }}>
              分享成就
            </Text>
          </View>
        </Button>

        <Button
          block
          onClick={handleBackHome}
          style={{
            height: '96rpx',
            borderRadius: '48rpx',
            background: '#f1f5f9',
            color: '#0d171c',
          }}
        >
          <Text className='font-bold' style={{ fontSize: '30rpx', color: '#0d171c' }}>
            返回首页
          </Text>
        </Button>
      </View>
    </View>
  )
}

export default WalkSummary
