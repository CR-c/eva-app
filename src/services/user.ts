import { post, put } from '@/utils/request'
import type { UserInfo } from '@/constants/types'

/**
 * 获取用户详细信息
 */
export async function getUserProfile() {
  const response = await post<UserInfo>('/api/user/profile')
  return response.data
}

/**
 * 更新用户信息
 */
export async function updateUserProfile(data: Partial<UserInfo>) {
  const response = await put<UserInfo>('/api/user/profile', data, {
    showLoading: true,
  })
  return response.data
}

/**
 * 上传头像
 */
export async function uploadAvatar(filePath: string) {
  // 实际项目中需要使用 Taro.uploadFile
  const response = await post<{ url: string }>('/api/user/avatar', {
    filePath,
  })
  return response.data
}
