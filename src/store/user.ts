import { create } from 'zustand'
import type { UserInfo } from '@/constants/types'
import { getCache, setCache, removeCache } from '@/utils/cache'
import { CACHE_KEYS } from '@/constants/cache'

interface UserStore {
  // 状态
  token: string | null
  userInfo: UserInfo | null
  isLoggedIn: boolean

  // 操作
  setToken: (token: string) => void
  setUserInfo: (userInfo: UserInfo) => void
  login: (token: string, userInfo: UserInfo) => void
  logout: () => void
  restoreLoginState: () => void
}

export const useUserStore = create<UserStore>((set) => ({
  // 初始状态
  token: null,
  userInfo: null,
  isLoggedIn: false,

  // 设置 token
  setToken: (token: string) => {
    setCache(CACHE_KEYS.TOKEN, token)
    set({ token, isLoggedIn: true })
  },

  // 设置用户信息
  setUserInfo: (userInfo: UserInfo) => {
    setCache(CACHE_KEYS.USER_INFO, userInfo)
    set({ userInfo })
  },

  // 登录
  login: (token: string, userInfo: UserInfo) => {
    setCache(CACHE_KEYS.TOKEN, token)
    setCache(CACHE_KEYS.USER_INFO, userInfo)
    set({ token, userInfo, isLoggedIn: true })
  },

  // 登出
  logout: () => {
    removeCache(CACHE_KEYS.TOKEN)
    removeCache(CACHE_KEYS.USER_INFO)
    set({ token: null, userInfo: null, isLoggedIn: false })
  },

  // 恢复登录态
  restoreLoginState: () => {
    const token = getCache<string>(CACHE_KEYS.TOKEN)
    const userInfo = getCache<UserInfo>(CACHE_KEYS.USER_INFO)

    if (token && userInfo) {
      set({ token, userInfo, isLoggedIn: true })
    }
  },
}))
