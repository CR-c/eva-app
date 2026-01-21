 import { useState, useEffect } from 'react'
import { View, Map, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import TopNavigation from './components/TopNavigation'
import StatsCards from './components/StatsCards'
import ControlButtons from './components/ControlButtons'
import MapControls from './components/MapControls'
import { useWalkingStore } from '@/store/walking'
import { useWalkingLocation } from '@/hooks/useWalkingLocation'
import { usePetStore } from '@/store/pet'
import { BASE_URL } from '@/constants/env'
import './index.scss'

function Walking() {
  const {
    currentWalk,
    isTracking,
    isPaused,
    trackPoints,
    duration,
    distance,
    startWalk,
    endWalk,
    pauseWalk,
    resumeWalk,
    cancelWalk,
    updateDuration,
    loadInProgressWalk,
  } = useWalkingStore()

  const { currentPet } = usePetStore()
  
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 39.908823,
    longitude: 116.39747,
  })

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isOperating, setIsOperating] = useState(false) // 添加操作状态

  useWalkingLocation({
    onLocationUpdate: (location) => {
      setCurrentLocation({
        latitude: location.lat,
        longitude: location.lng,
      })
    },
    onError: (error) => {
      console.error('Location error:', error)
      Taro.showToast({
        title: '定位失败',
        icon: 'none',
      })
    },
    enableTracking: true, // 始终启用位置监听
  })

  useEffect(() => {
    const initWalk = async () => {
      // 首先立即获取当前位置
      try {
        const location = await Taro.getLocation({ type: 'gcj02' })
        setCurrentLocation({
          latitude: location.latitude,
          longitude: location.longitude,
        })
        console.log('Initial location obtained:', location)
      } catch (error) {
        console.error('Failed to get initial location:', error)
        Taro.showToast({
          title: '获取位置失败，请检查定位权限',
          icon: 'none',
          duration: 3000,
        })
      }

      // 然后加载进行中的散步
      await loadInProgressWalk()
      
      const { currentWalk: inProgressWalk } = useWalkingStore.getState()
      if (inProgressWalk && (inProgressWalk.status === 1 || inProgressWalk.status === 2)) {
        // 如果有进行中或暂停的散步，使用散步的起始位置
        setCurrentLocation({
          latitude: inProgressWalk.startLatitude,
          longitude: inProgressWalk.startLongitude,
        })
        console.log('Using walk start location:', inProgressWalk.startLatitude, inProgressWalk.startLongitude)
      }
    }

    initWalk()
  }, [loadInProgressWalk])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isTracking && !isPaused) {
      timer = setInterval(() => {
        updateDuration(duration + 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isTracking, isPaused, duration, updateDuration])

  const handleBack = () => {
    if (isTracking) {
      Taro.showModal({
        title: '提示',
        content: '遛狗进行中，确定要离开吗？',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateBack()
          }
        },
      })
    } else {
      Taro.navigateBack()
    }
  }

  const handleSettings = () => {
    Taro.showToast({
      title: '设置功能',
      icon: 'none',
    })
  }

  const testApiConnection = async () => {
    try {
      console.log('Testing API connection to:', BASE_URL)
      const response = await Taro.request({
        url: `${BASE_URL}/api/v1/health`,
        method: 'GET',
      })
      console.log('API health check response:', response)
      return true
    } catch (error) {
      console.error('API connection failed:', error)
      return false
    }
  }

  const handleStartWalk = async () => {
    if (isOperating) {
      console.log('Operation already in progress, ignoring...')
      return
    }

    setIsOperating(true)

    // 先测试API连接
    console.log('Testing API connection...')
    const apiAvailable = await testApiConnection()
    
    if (!apiAvailable) {
      Taro.showToast({
        title: '服务器连接失败，请检查网络',
        icon: 'none',
        duration: 3000,
      })
      setIsOperating(false)
      return
    }

    // 立即显示操作反馈
    Taro.showLoading({
      title: '开始中...',
      mask: true,
    })
    
    try {
      const location = await Taro.getLocation({ type: 'gcj02' })
      
      await startWalk({
        startLatitude: location.latitude,
        startLongitude: location.longitude,
        petId: currentPet?.id,
      })
      
      setCurrentLocation({
        latitude: location.latitude,
        longitude: location.longitude,
      })
      
      Taro.hideLoading()
      Taro.showToast({
        title: '开始遛狗',
        icon: 'success',
        duration: 1500,
      })
    } catch (error: any) {
      console.error('Start walk failed:', error)
      Taro.hideLoading()
      Taro.showToast({
        title: `开始遛狗失败: ${error.message || '未知错误'}`,
        icon: 'none',
        duration: 3000,
      })
    } finally {
      setIsOperating(false)
    }
  }

  const handlePauseResume = async () => {
    if (!currentWalk) {
      console.error('No current walk found')
      Taro.showToast({
        title: '没有进行中的散步',
        icon: 'none',
      })
      return
    }

    if (isOperating) {
      console.log('Operation already in progress, ignoring...')
      return
    }

    setIsOperating(true)
    console.log('Pause/Resume walk:', currentWalk.id, 'isPaused:', isPaused)

    // 立即显示操作反馈
    Taro.showLoading({
      title: isPaused ? '继续中...' : '暂停中...',
      mask: true,
    })

    try {
      if (isPaused) {
        console.log('Resuming walk...')
        await resumeWalk()
        Taro.hideLoading()
        Taro.showToast({
          title: '继续散步',
          icon: 'success',
          duration: 1500,
        })
      } else {
        console.log('Pausing walk...')
        await pauseWalk()
        Taro.hideLoading()
        Taro.showToast({
          title: '已暂停',
          icon: 'success',
          duration: 1500,
        })
      }
    } catch (error: any) {
      console.error('Pause/Resume failed:', error)
      Taro.hideLoading()
      Taro.showToast({
        title: `操作失败: ${error.message || '未知错误'}`,
        icon: 'none',
        duration: 3000,
      })
    } finally {
      setIsOperating(false)
    }
  }

  const handleEndWalk = () => {
    console.log('handleEndWalk called!')
    console.log('Current state:', { currentWalk, isTracking, isPaused, isOperating })
    
    // 添加立即的用户反馈
    Taro.showToast({
      title: 'handleEndWalk被调用了!',
      icon: 'none',
      duration: 2000,
    })
    
    setShowConfirmModal(true)
    console.log('showConfirmModal set to true')
  }

  const confirmEndWalk = async () => {
    if (!currentWalk) {
      console.error('No current walk found')
      Taro.showToast({
        title: '没有进行中的散步',
        icon: 'none',
      })
      return
    }

    if (isOperating) {
      console.log('Operation already in progress, ignoring...')
      return
    }

    setIsOperating(true)
    setShowConfirmModal(false)

    console.log('Ending walk:', currentWalk.id)
    console.log('End data:', {
      duration,
      distance,
      endLatitude: currentLocation.latitude,
      endLongitude: currentLocation.longitude,
      trackPointsCount: trackPoints.length,
    })

    // 立即显示操作反馈
    Taro.showLoading({
      title: '结束中...',
      mask: true,
    })

    try {
      const endData = {
        duration: duration,
        distance: distance,
        endLatitude: currentLocation.latitude,
        endLongitude: currentLocation.longitude,
        trackPoints: JSON.stringify(trackPoints),
      }

      const walkDetail = await endWalk(endData)
      
      Taro.hideLoading()
      Taro.showToast({
        title: '散步已结束',
        icon: 'success',
        duration: 1500,
      })

      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        const params = new URLSearchParams({
          walkId: walkDetail.id.toString(),
        })

        Taro.redirectTo({
          url: `/pages/walkSummary/index?${params.toString()}`,
        })
      }, 1500)

    } catch (error: any) {
      console.error('End walk failed:', error)
      Taro.hideLoading()
      Taro.showToast({
        title: `结束遛狗失败: ${error.message || '未知错误'}`,
        icon: 'none',
        duration: 3000,
      })
      setIsOperating(false)
    }
  }

  const handleCancelWalk = async () => {
    if (!currentWalk) return

    try {
      await Taro.showModal({
        title: '取消遛狗',
        content: '确定要取消本次遛狗吗？记录将不会保存。',
        success: async (res) => {
          if (res.confirm) {
            await cancelWalk()
            Taro.showToast({
              title: '已取消',
              icon: 'success',
            })
            setTimeout(() => {
              Taro.navigateBack()
            }, 1500)
          }
        },
      })
    } catch (error) {
      console.error('Cancel walk failed:', error)
      Taro.showToast({
        title: '取消失败',
        icon: 'none',
      })
    }
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

  // 添加调试信息
  const debugInfo = {
    currentWalk: currentWalk ? {
      id: currentWalk.id,
      status: currentWalk.status,
      startTime: currentWalk.startTime,
    } : null,
    isTracking,
    isPaused,
    duration,
    distance,
    trackPointsCount: trackPoints.length,
  }

  console.log('Walking page state:', debugInfo)

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const polylineData = [
    {
      points: trackPoints.map(point => ({
        latitude: point.lat,
        longitude: point.lng,
      })),
      color: '#25aff4',
      width: 6,
      arrowLine: true,
    },
  ]

  const markersData = [
    {
      id: 1,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      iconPath: 'assets/icons/dog-marker.png',
      width: 40,
      height: 40,
      callout: {
        content: `🐕 ${currentPet?.name || 'Buddy'}`,
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
        textAlign: 'center' as const,
      },
    },
  ]

  return (
    <View className='walking-page'>
      <TopNavigation onBack={handleBack} onSettings={handleSettings} isLive={isTracking && !isPaused} />

      <View className='map-container'>
        <Map
          className='walking-map'
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
          onError={e => console.error('Map error:', e)}
        />

        <MapControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onLocate={handleLocate} />
      </View>

      <View className='bottom-controls'>
        <View className='gradient-overlay' />

        <View className='controls-content'>
          <ControlButtons
            isWalking={isTracking && !isPaused}
            hasActiveWalk={!!currentWalk && isTracking}
            isOperating={isOperating}
            onPauseResume={(!currentWalk || !isTracking) ? handleStartWalk : handlePauseResume}
            onEndWalk={handleEndWalk}
          />

          {isTracking && (
            <View className='cancel-button' onClick={handleCancelWalk}>
              取消遛狗
            </View>
          )}

          <StatsCards 
            distance={distance / 1000} 
            duration={formatDuration(duration)} 
          />
        </View>
      </View>

      {showConfirmModal && (
        <View className='modal-overlay' onClick={() => setShowConfirmModal(false)}>
          <View className='modal-content' onClick={(e) => e.stopPropagation()}>
            <View className='modal-title'>结束遛狗</View>
            <View className='modal-body'>
              <View className='modal-stat'>
                <Text className='stat-label'>时长</Text>
                <Text className='stat-value'>{formatDuration(duration)}</Text>
              </View>
              <View className='modal-stat'>
                <Text className='stat-label'>距离</Text>
                <Text className='stat-value'>{(distance / 1000).toFixed(2)} 公里</Text>
              </View>
            </View>
            <View className='modal-actions'>
              <View className='modal-button secondary' onClick={() => setShowConfirmModal(false)}>
                继续遛狗
              </View>
              <View className='modal-button primary' onClick={confirmEndWalk}>
                结束
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default Walking
