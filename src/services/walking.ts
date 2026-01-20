import { get, post, put, del } from '@/utils/request'
import type {
  WalkRecord,
  WalkDetail,
  WalkStartDTO,
  WalkEndDTO,
  WalkQueryDTO,
  WalkStatistics,
} from '@/constants/types'

export async function startWalk(data: WalkStartDTO) {
  const response = await post<number>('/walks/start', data, {
    showLoading: true,
  })
  return response.data
}

export async function endWalk(id: number, data: WalkEndDTO) {
  const response = await put<WalkDetail>(`/walks/${id}/end`, data, {
    showLoading: true,
  })
  return response.data
}

export async function pauseWalk(id: number) {
  const response = await put<void>(`/walks/${id}/pause`, undefined, {
    showLoading: true,
  })
  return response.data
}

export async function resumeWalk(id: number) {
  const response = await put<void>(`/walks/${id}/resume`, undefined, {
    showLoading: true,
  })
  return response.data
}

export async function cancelWalk(id: number) {
  const response = await put<void>(`/walks/${id}/cancel`, undefined, {
    showLoading: true,
  })
  return response.data
}

export async function getWalkList(params?: WalkQueryDTO) {
  const response = await get<WalkRecord[]>('/walks', params)
  return response.data
}

export async function getWalkDetail(id: number) {
  const response = await get<WalkDetail>(`/walks/${id}`)
  return response.data
}

export async function deleteWalk(id: number) {
  const response = await del<void>(`/walks/${id}`, undefined, {
    showLoading: true,
  })
  return response.data
}

export async function getStatistics(type: string = 'day', date?: string) {
  const response = await get<WalkStatistics>('/walks/statistics', {
    type,
    date,
  })
  return response.data
}

export async function getRecentWalks(limit: number = 10) {
  const response = await get<WalkRecord[]>('/walks/recent', { limit })
  return response.data
}

export async function getInProgressWalk() {
  const response = await get<WalkDetail>('/walks/in-progress')
  return response.data
}
