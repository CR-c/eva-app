import { create } from 'zustand'
import * as walkingService from '@/services/walking'
import { IS_DEV } from '@/constants/env'
import type { WalkDetail, TrackPoint, WalkStartDTO, WalkEndDTO } from '@/constants/types'

// Mock functions for development
const mockWalkDetail = (id: number = Date.now()): WalkDetail => ({
  id,
  petId: 1,
  startTime: new Date().toISOString(),
  endTime: null,
  duration: 0,
  distance: 0,
  startLatitude: 39.908823,
  startLongitude: 116.39747,
  endLatitude: null,
  endLongitude: null,
  trackPoints: '[]',
  status: 1,
  calories: 0,
  note: null,
  coverImage: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

const mockDelay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms))

interface WalkingStore {
  currentWalk: WalkDetail | null
  isTracking: boolean
  isPaused: boolean
  trackPoints: TrackPoint[]
  duration: number
  distance: number
  loading: boolean

  startWalk: (data: WalkStartDTO) => Promise<void>
  endWalk: (data: WalkEndDTO) => Promise<WalkDetail>
  pauseWalk: () => Promise<void>
  resumeWalk: () => Promise<void>
  cancelWalk: () => Promise<void>
  addTrackPoint: (point: TrackPoint) => void
  updateDuration: (seconds: number) => void
  updateDistance: (meters: number) => void
  clearWalk: () => void
  loadInProgressWalk: () => Promise<void>
}

export const useWalkingStore = create<WalkingStore>((set, get) => ({
  currentWalk: null,
  isTracking: false,
  isPaused: false,
  trackPoints: [],
  duration: 0,
  distance: 0,
  loading: false,

  startWalk: async (data: WalkStartDTO) => {
    set({ loading: true })
    try {
      let walkId: number
      let walkDetail: WalkDetail

      if (IS_DEV) {
        // 开发模式使用mock数据
        console.log('Using mock data for startWalk')
        await mockDelay()
        walkId = Date.now()
        walkDetail = mockWalkDetail(walkId)
      } else {
        // 生产模式调用真实API
        walkId = await walkingService.startWalk(data)
        walkDetail = await walkingService.getWalkDetail(walkId)
      }

      set({
        currentWalk: walkDetail,
        isTracking: true,
        isPaused: false,
        trackPoints: [],
        duration: 0,
        distance: 0,
      })
    } catch (error) {
      console.error('Failed to start walk:', error)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  endWalk: async (data: WalkEndDTO) => {
    const { currentWalk } = get()
    if (!currentWalk) {
      throw new Error('没有进行中的散步')
    }

    set({ loading: true })
    try {
      console.log('Calling endWalk service for walk:', currentWalk.id, 'with data:', data)

      let walkDetail: WalkDetail
      if (IS_DEV) {
        // 开发模式使用mock
        console.log('Using mock data for endWalk')
        await mockDelay(1000)
        walkDetail = {
          ...mockWalkDetail(currentWalk.id),
          endTime: new Date().toISOString(),
          duration: data.duration,
          distance: data.distance,
          endLatitude: data.endLatitude,
          endLongitude: data.endLongitude,
          trackPoints: data.trackPoints,
          status: 3, // 已完成
        }
      } else {
        walkDetail = await walkingService.endWalk(currentWalk.id, data)
      }

      set({
        currentWalk: walkDetail,
        isTracking: false,
        isPaused: false,
      })
      console.log('Walk ended successfully:', walkDetail)
      return walkDetail
    } catch (error) {
      console.error('Failed to end walk:', error)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  pauseWalk: async () => {
    const { currentWalk } = get()
    if (!currentWalk) {
      throw new Error('没有进行中的散步')
    }

    set({ loading: true })
    try {
      console.log('Calling pauseWalk service for walk:', currentWalk.id)

      if (IS_DEV) {
        // 开发模式使用mock
        console.log('Using mock data for pauseWalk')
        await mockDelay(500)
      } else {
        await walkingService.pauseWalk(currentWalk.id)
      }

      set({ isPaused: true })
      console.log('Walk paused successfully')
    } catch (error) {
      console.error('Failed to pause walk:', error)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  resumeWalk: async () => {
    const { currentWalk } = get()
    if (!currentWalk) {
      throw new Error('没有进行中的散步')
    }

    set({ loading: true })
    try {
      console.log('Calling resumeWalk service for walk:', currentWalk.id)

      if (IS_DEV) {
        // 开发模式使用mock
        console.log('Using mock data for resumeWalk')
        await mockDelay(500)
      } else {
        await walkingService.resumeWalk(currentWalk.id)
      }

      set({ isPaused: false })
      console.log('Walk resumed successfully')
    } catch (error) {
      console.error('Failed to resume walk:', error)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  cancelWalk: async () => {
    set({ loading: true })
    try {
      await walkingService.cancelWalk(get().currentWalk!.id)
      set({
        currentWalk: null,
        isTracking: false,
        isPaused: false,
        trackPoints: [],
        duration: 0,
        distance: 0,
      })
    } catch (error) {
      console.error('Failed to cancel walk:', error)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  addTrackPoint: (point: TrackPoint) => {
    const { trackPoints } = get()
    set({ trackPoints: [...trackPoints, point] })
  },

  updateDuration: (seconds: number) => {
    set({ duration: seconds })
  },

  updateDistance: (meters: number) => {
    set({ distance: meters })
  },

  clearWalk: () => {
    set({
      currentWalk: null,
      isTracking: false,
      isPaused: false,
      trackPoints: [],
      duration: 0,
      distance: 0,
    })
  },

  loadInProgressWalk: async () => {
    try {
      const walk = await walkingService.getInProgressWalk()
      if (walk && walk.status === 1) {
        // 只有状态为进行中(1)的散步才设置为当前散步
        set({
          currentWalk: walk,
          isTracking: true,
          isPaused: false,
        })
      } else if (walk && walk.status === 2) {
        // 状态为暂停(2)的散步
        set({
          currentWalk: walk,
          isTracking: true,
          isPaused: true,
        })
      } else {
        // 清除任何非进行中的散步状态
        set({
          currentWalk: null,
          isTracking: false,
          isPaused: false,
          trackPoints: [],
          duration: 0,
          distance: 0,
        })
      }
    } catch (error) {
      console.error('Failed to load in-progress walk:', error)
      // 出错时也清除状态
      set({
        currentWalk: null,
        isTracking: false,
        isPaused: false,
        trackPoints: [],
        duration: 0,
        distance: 0,
      })
    }
  },
}))
