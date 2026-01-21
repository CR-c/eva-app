import { useEffect, useRef, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { useWalkingStore } from '@/store/walking'
import type { TrackPoint } from '@/constants/types'

interface UseWalkingLocationOptions {
  onLocationUpdate?: (location: TrackPoint) => void
  onError?: (error: any) => void
  enableTracking?: boolean // 是否始终启用位置监听
}

export function useWalkingLocation(options: UseWalkingLocationOptions = {}) {
  const { onLocationUpdate, onError, enableTracking = false } = options
  const { isTracking, isPaused, addTrackPoint, updateDistance } = useWalkingStore()

  const lastLocationRef = useRef<TrackPoint | null>(null)
  const totalDistanceRef = useRef(0)
  const startTimeRef = useRef<number>(0)

  const calculateDistance = useCallback(
    (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      const R = 6371e3
      const φ1 = (lat1 * Math.PI) / 180
      const φ2 = (lat2 * Math.PI) / 180
      const Δφ = ((lat2 - lat1) * Math.PI) / 180
      const Δλ = ((lng2 - lng1) * Math.PI) / 180

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

      return R * c
    },
    []
  )

  const handleLocationUpdate = useCallback(
    (location: any) => {
      const { latitude, longitude, accuracy, speed } = location

      if (accuracy > 100) {
        console.warn('Location accuracy too high:', accuracy)
        return
      }

      const now = Date.now()
      const trackPoint: TrackPoint = {
        lat: latitude,
        lng: longitude,
        t: startTimeRef.current ? now - startTimeRef.current : 0,
        spd: speed,
        acc: accuracy,
      }

      // 只有在真正散步时才记录轨迹和计算距离
      if (isTracking && !isPaused) {
        if (lastLocationRef.current) {
          const distance = calculateDistance(
            lastLocationRef.current.lat,
            lastLocationRef.current.lng,
            latitude,
            longitude
          )
          totalDistanceRef.current += distance
          updateDistance(totalDistanceRef.current)
        }

        lastLocationRef.current = trackPoint
        addTrackPoint(trackPoint)
      }

      // 但始终通知位置更新
      onLocationUpdate?.(trackPoint)
    },
    [calculateDistance, addTrackPoint, updateDistance, onLocationUpdate, isTracking, isPaused]
  )

  const startTracking = useCallback(async () => {
    try {
      // 先立即获取一次位置
      try {
        const location = await Taro.getLocation({ type: 'gcj02' })
        handleLocationUpdate(location)
      } catch (error) {
        console.warn('Failed to get immediate location:', error)
      }

      // 然后开始持续监听位置变化
      await Taro.startLocationUpdate({
        type: 'gcj02',
      })

      Taro.onLocationChange(handleLocationUpdate)
      if (isTracking && !isPaused) {
        startTimeRef.current = Date.now()
      }
    } catch (error) {
      onError?.(error)
      throw error
    }
  }, [handleLocationUpdate, onError, isTracking, isPaused])

  const stopTracking = useCallback(async () => {
    try {
      Taro.offLocationChange(handleLocationUpdate)
      await Taro.stopLocationUpdate()
    } catch (error) {
      onError?.(error)
    }
  }, [handleLocationUpdate, onError])

  useEffect(() => {
    // 如果启用了位置监听或者正在散步，就开始监听
    if (enableTracking || (isTracking && !isPaused)) {
      startTracking()
    } else {
      stopTracking()
    }

    return () => {
      stopTracking()
    }
  }, [isTracking, isPaused, enableTracking, startTracking, stopTracking])

  return {
    totalDistance: totalDistanceRef.current,
    lastLocation: lastLocationRef.current,
  }
}
