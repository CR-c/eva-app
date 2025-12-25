import { useEffect } from 'react'
import Taro from '@tarojs/taro'
import { useUserStore } from '@/store/user'
import { WHITE_LIST, ROUTES } from '@/constants/routes'

/**
 * 页面权限校验 Hook
 * 在需要登录的页面中使用
 */
export function useAuth() {
  const isLoggedIn = useUserStore((state) => state.isLoggedIn)

  useEffect(() => {
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const currentRoute = `/${currentPage.route}`

    // 如果不在白名单且未登录，跳转到登录页
    if (!WHITE_LIST.includes(currentRoute) && !isLoggedIn) {
      Taro.reLaunch({
        url: ROUTES.LOGIN,
      })
    }
  }, [isLoggedIn])

  return { isLoggedIn }
}
