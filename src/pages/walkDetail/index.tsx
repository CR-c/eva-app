import { useState, useEffect } from 'react'
import { View, Text, Map, Button } from '@tarojs/components'
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

function WalkDetailPage() {
  const navBarInfo = getNavBarInfo()
  const [walkData, setWalkData] = useState<WalkDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    const loadWalkData = async () => {
      const instance = Taro.getCurrentInstance()
      const params = instance.router?.params

      if (params?.walkId) {
        try {
          const walkDetail: WalkDetail = await walkingService.getWalkDetail(parseInt(params.walkId))
          setWalkData(walkDetail)
          Taro.setNavigationBarTitle({ title: '遛狗详情' })
        } catch (error) {
          console.error('Failed to load walk detail:', error)
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

  const handleBack = () => {
    Taro.navigateBack()
  }

  const handleDelete = async () => {
    if (!walkData) return

    try {
      const result = await Taro.showModal({
        title: '删除记录',
        content: '确定要删除这条遛狗记录吗？删除后无法恢复。',
      })

      if (result.confirm) {
        await walkingService.deleteWalk(walkData.id)
        Taro.showToast({
          title: '删除成功',
          icon: 'success',
        })
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      }
    } catch (error) {
      console.error('Failed to delete walk:', error)
      Taro.showToast({
        title: '删除失败',
        icon: 'none',
      })
    }
  }

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}小时${mins}分钟`
    }
    return `${mins}分钟`
  }

  const formatPace = (pace: number | null) => {
    if (!pace) return '--'
    const mins = Math.floor(pace / 60)
    const secs = Math.round(pace % 60)
    return `${mins}'${secs}"`
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

  const handleToggleMap = () => {
    setShowMap(!showMap)
  }

  if (loading || !walkData) {
    return (
      <View className='walk-detail loading'>
        <Text>加载中...</Text>
      </View>
    )
  }

  const trackPoints = walkData.trackPoints || []
  const polylineData = [
    {
      points: trackPoints.map(p => ({
        latitude: p.lat || p.latitude,
        longitude: p.lng || p.longitude,
      })),
      color: '#25aff4',
      width: 6,
      arrowLine: true,
    },
  ]

  const mapCenter = trackPoints.length > 0
    ? {
        latitude: trackPoints[Math.floor(trackPoints.length / 2)].lat || 
                   trackPoints[Math.floor(trackPoints.length / 2)].latitude,
        longitude: trackPoints[Math.floor(trackPoints.length / 2)].lng || 
                     trackPoints[Math.floor(trackPoints.length / 2)].longitude,
      }
    : {
        latitude: walkData.startLatitude || 39.908823,
        longitude: walkData.startLongitude || 116.39747,
      }

  const mapMarkers = [
    {
      id: 1,
      latitude: walkData.startLatitude || 39.908823,
      longitude: walkData.startLongitude || 116.39747,
      iconPath: '/assets/icons/start-marker.png',
      width: 40,
      height: 40,
      callout: {
        content: '起点',
        color: '#10b981',
        fontSize: 12,
        borderRadius: 8,
        bgColor: '#ffffff',
        padding: 8,
        display: 'ALWAYS' as const,
        textAlign: 'center' as const,
      },
    },
    ...(walkData.endLatitude && walkData.endLongitude ? [
      {
        id: 2,
        latitude: walkData.endLatitude,
        longitude: walkData.endLongitude,
        iconPath: '/assets/icons/end-marker.png',
        width: 40,
        height: 40,
        callout: {
          content: '终点',
          color: '#ef4444',
          fontSize: 12,
          borderRadius: 8,
          bgColor: '#ffffff',
          padding: 8,
          display: 'ALWAYS' as const,
          textAlign: 'center' as const,
        },
      },
    ] : []),
  ]

  return (
    <View className='walk-detail'>
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
        <Text className='nav-title'>遛狗详情</Text>
        <View className='nav-button' onClick={handleDelete}>
          <Text className='nav-icon delete'>🗑️</Text>
        </View>
      </View>

      <View className='content-container'>
        <View className='info-card'>
          <View className='info-header'>
            <View className='status-badge' style={{ backgroundColor: getStatusColor(walkData.status) }}>
              {getStatusText(walkData.status)}
            </View>
            <View className='date-badge'>
              {formatDateTime(walkData.startTime)}
            </View>
          </View>

          <View className='info-row'>
            <Text className='label'>距离</Text>
            <Text className='value'>{(walkData.distance / 1000).toFixed(2)} 公里</Text>
          </View>

          <View className='info-row'>
            <Text className='label'>时长</Text>
            <Text className='value'>{formatDuration(walkData.duration)}</Text>
          </View>

          <View className='info-row'>
            <Text className='label'>配速</Text>
            <Text className='value'>{formatPace(walkData.avgPace)} /公里</Text>
          </View>

          <View className='info-row'>
            <Text className='label'>卡路里</Text>
            <Text className='value'>{walkData.calories} 千卡</Text>
          </View>

          {walkData.weather && (
            <View className='info-row'>
              <Text className='label'>天气</Text>
              <Text className='value'>
                {walkData.weather.includes('晴') ? '☀️' : walkData.weather.includes('阴') ? '☁️' : '🌤️'} {walkData.weather}
              </Text>
            </View>
          )}

          {walkData.temperature && (
            <View className='info-row'>
              <Text className='label'>温度</Text>
              <Text className='value'>{walkData.temperature.toFixed(1)}°C</Text>
            </View>
          )}

          {walkData.trackPointCount > 0 && (
            <View className='info-row'>
              <Text className='label'>轨迹点</Text>
              <Text className='value'>{walkData.trackPointCount} 个</Text>
            </View>
          )}
        </View>

        <View className='map-section'>
          <View className='map-header'>
            <Text className='map-title'>行动轨迹</Text>
            <Button
              size='small'
              onClick={handleToggleMap}
            >
              {showMap ? '隐藏' : '显示'}地图
            </Button>
          </View>

          {showMap && (
            <View className='map-container'>
              <Map
                className='route-map'
                latitude={mapCenter.latitude}
                longitude={mapCenter.longitude}
                markers={mapMarkers}
                polyline={polylineData}
                scale={15}
                showLocation={false}
                showScale={true}
                enableZoom={true}
                enableScroll={true}
                enableRotate={false}
              />
            </View>
          )}

          {!showMap && trackPoints.length > 0 && (
            <View className='track-points-list'>
              <Text className='points-title'>轨迹点详情 ({trackPoints.length}个)</Text>
              {trackPoints.map((point, index) => (
                <View key={index} className='track-point'>
                  <View className='point-number'>{index + 1}</View>
                  <View className='point-coords'>
                    <Text className='coord-text'>纬度: {point.lat || point.latitude}</Text>
                    <Text className='coord-text'>经度: {point.lng || point.longitude}</Text>
                  </View>
                  {point.timestamp !== null && (
                    <View className='point-time'>
                      {Math.floor(point.timestamp / 1000)}秒
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

export default WalkDetailPage
