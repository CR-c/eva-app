import { create } from 'zustand'
import type { UserInfo, LoginData } from '@/constants/types'
import { getCache, setCache, removeCache } from '@/utils/cache'
import { CACHE_KEYS } from '@/constants/cache'

interface UserStore {
  // 状态
  token: string | null
  userInfo: UserInfo | null
  isLoggedIn: boolean
  roles: string[]
  permissions: string[]

  // 操作
  setToken: (token: string) => void
  setUserInfo: (userInfo: UserInfo) => void
  login: (loginData: LoginData) => void
  logout: () => void
  restoreLoginState: () => void
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasAnyRole: (roles: string[]) => boolean
}

export const useUserStore = create<UserStore>((set, get) => ({
  // 初始状态
  token: null,
  userInfo: null,
  isLoggedIn: false,
  roles: [],
  permissions: [],

  // 设置 token
  setToken: (token: string) => {
    setCache(CACHE_KEYS.TOKEN, token)
    set({ token, isLoggedIn: true })
  },

  // 设置用户信息
  setUserInfo: (userInfo: UserInfo) => {
    setCache(CACHE_KEYS.USER_INFO, userInfo)
    set({
      userInfo,
      roles: userInfo.roles || [],
      permissions: userInfo.permissions || [],
    })
  },

  // 登录
  login: (loginData: LoginData) => {
    const { token, userId, username, nickname, avatar, roles, permissions } = loginData

    // 构造用户信息
    const userInfo: UserInfo = {
      userId,
      username,
      nickname,
      avatar,
      roles,
      permissions,
    }

    setCache(CACHE_KEYS.TOKEN, token)
    setCache(CACHE_KEYS.USER_INFO, userInfo)

    set({
      token,
      userInfo,
      isLoggedIn: true,
      roles: roles || [],
      permissions: permissions || [],
    })
  },

  // 登出
  logout: () => {
    removeCache(CACHE_KEYS.TOKEN)
    removeCache(CACHE_KEYS.USER_INFO)
    set({
      token: null,
      userInfo: null,
      isLoggedIn: false,
      roles: [],
      permissions: [],
    })
  },

  // 恢复登录态
  restoreLoginState: () => {
    const token = getCache<string>(CACHE_KEYS.TOKEN)
    const userInfo = getCache<UserInfo>(CACHE_KEYS.USER_INFO)

    if (token && userInfo) {
      set({
        token,
        userInfo,
        isLoggedIn: true,
        roles: userInfo.roles || [],
        permissions: userInfo.permissions || [],
      })
    }
  },

  // 判断是否有某个权限
  hasPermission: (permission: string): boolean => {
    const { permissions } = get()
    return permissions.includes(permission) || permissions.includes('*:*:*')
  },

  // 判断是否有某个角色
  hasRole: (role: string): boolean => {
    const { roles } = get()
    return roles.includes(role) || roles.includes('admin')
  },

  // 判断是否有任意一个权限
  hasAnyPermission: (permissions: string[]): boolean => {
    const { hasPermission } = get()
    return permissions.some((permission) => hasPermission(permission))
  },

  // 判断是否有任意一个角色
  hasAnyRole: (roles: string[]): boolean => {
    const { hasRole } = get()
    return roles.some((role) => hasRole(role))
  },
}))
