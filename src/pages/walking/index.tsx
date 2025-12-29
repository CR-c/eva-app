import { useState, useEffect } from 'react'
import { View, Map } from '@tarojs/components'
import Taro from '@tarojs/taro'
import TopNavigation from './components/TopNavigation'
import StatsCards from './components/StatsCards'
import ControlButtons from './components/ControlButtons'
import MapControls from './components/MapControls'
import './index.scss'

interface LocationPoint {
  latitude: number
  longitude: number
  timestamp: number
}

function Walking() {
  const [isWalking, setIsWalking] = useState(true)
  const [duration, setDuration] = useState(870) // 14:30 in seconds
  const [distance, setDistance] = useState(1.2) // km
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 39.908823,
    longitude: 116.397470
  })
  const [walkPath] = useState<LocationPoint[]>([
    { latitude: 39.908823, longitude: 116.397470, timestamp: Date.now() - 870000 },
    { latitude: 39.909123, longitude: 116.397770, timestamp: Date.now() - 800000 },
    { latitude: 39.909423, longitude: 116.398070, timestamp: Date.now() - 700000 },
    { latitude: 39.909723, longitude: 116.398370, timestamp: Date.now() - 600000 },
    { latitude: 39.910023, longitude: 116.398670, timestamp: Date.now() - 500000 },
    { latitude: 39.910323, longitude: 116.398970, timestamp: Date.now() - 400000 },
    { latitude: 39.910623, longitude: 116.399270, timestamp: Date.now() - 300000 },
    { latitude: 39.910923, longitude: 116.399570, timestamp: Date.now() - 200000 },
    { latitude: 39.911223, longitude: 116.399870, timestamp: Date.now() - 100000 },
    { latitude: 39.911523, longitude: 116.400170, timestamp: Date.now() }
  ])

  // 计时器
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isWalking) {
      timer = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isWalking])

  // 模拟位置更新
  useEffect(() => {
    let locationTimer: NodeJS.Timeout
    if (isWalking) {
      locationTimer = setInterval(() => {
        // 模拟位置变化
        setCurrentLocation(prev => ({
          latitude: prev.latitude + (Math.random() - 0.5) * 0.0001,
          longitude: prev.longitude + (Math.random() - 0.5) * 0.0001
        }))
        
        // 更新距离（简单模拟）
        setDistance(prev => prev + 0.001)
      }, 5000)
    }
    return () => clearInterval(locationTimer)
  }, [isWalking])

  const handleBack = () => {
    Taro.navigateBack()
  }

  const handleSettings = () => {
    Taro.showToast({
      title: '设置功能',
      icon: 'none'
    })
  }

  const handlePauseResume = () => {
    setIsWalking(!isWalking)
    Taro.showToast({
      title: isWalking ? '已暂停' : '继续散步',
      icon: 'success'
    })
  }

  const handleEndWalk = () => {
    Taro.showModal({
      title: '结束散步',
      content: '确定要结束这次散步吗？',
      success: (res) => {
        if (res.confirm) {
          // 跳转到汇总页面，传递散步数据
          const params = new URLSearchParams({
            distance: distance.toFixed(1),
            duration: Math.floor(duration / 60).toString(),
            pace: '12',
            calories: Math.floor(distance * 100).toString()
          })
          
          Taro.navigateTo({
            url: `/pages/walkSummary/index?${params.toString()}`
          })
        }
      }
    })
  }

  const handleZoomIn = () => {
    Taro.showToast({ title: '放大地图', icon: 'none' })
  }

  const handleZoomOut = () => {
    Taro.showToast({ title: '缩小地图', icon: 'none' })
  }

  const handleLocate = () => {
    Taro.showToast({ title: '定位到当前位置', icon: 'none' })
  }

  // 格式化时间显示
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 地图路径数据
  const polylineData = [{
    points: walkPath.map(point => ({
      latitude: point.latitude,
      longitude: point.longitude
    })),
    color: '#25aff4',
    width: 6,
    arrowLine: true
  }]

  // 地图标记
  const markersData = [{
    id: 1,
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude,
    iconPath: '/assets/icons/dog-marker.png',
    width: 40,
    height: 40,
    callout: {
      content: 'Buddy',
      color: '#ffffff',
      fontSize: 12,
      borderRadius: 8,
      bgColor: '#25aff4',
      padding: 8,
      display: 'ALWAYS' as const,
      anchorX: 0,
      anchorY: 0,
      borderWidth: 0,
      borderColor: '#25aff4',
      textAlign: 'center' as const
    }
  }]

  return (
    <View className="walking-page">
      {/* 顶部导航 */}
      <TopNavigation 
        onBack={handleBack}
        onSettings={handleSettings}
        isLive={isWalking}
      />

      {/* 地图区域 */}
      <View className="map-container">
        <Map
          className="walking-map"
          latitude={currentLocation.latitude}
          longitude={currentLocation.longitude}
          scale={16}
          markers={markersData}
          polyline={polylineData}
          showLocation
          showScale
          enableOverlooking
          enableZoom
          enableScroll
          enableRotate
          onError={(e) => console.error('Map error:', e)}
        />
        
        {/* 地图控制按钮 */}
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onLocate={handleLocate}
        />
      </View>

      {/* 底部控制区域 */}
      <View className="bottom-controls">
        {/* 渐变遮罩 */}
        <View className="gradient-overlay" />
        
        <View className="controls-content">
          {/* 统计卡片 */}
          <StatsCards
            distance={distance}
            duration={formatDuration(duration)}
          />
          
          {/* 控制按钮 */}
          <ControlButtons
            isWalking={isWalking}
            onPauseResume={handlePauseResume}
            onEndWalk={handleEndWalk}
          />
        </View>
      </View>
    </View>
  )
}

export default Walking