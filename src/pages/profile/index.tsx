import { useState, useEffect } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { Cell, CellGroup, Avatar, Loading } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { useAuth } from '@/hooks/useAuth'
import { useUserStore } from '@/store/user'
import { ROUTES } from '@/constants/routes'
import BasePage from '@/components/BasePage'

interface MenuItem {
  icon: string
  label: string
  key: string
  arrow?: boolean
}

function Profile() {
  useAuth()

  const [loading, setLoading] = useState(true)
  const userInfo = useUserStore((state) => state.userInfo)
  const logout = useUserStore((state) => state.logout)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  const menuItems: MenuItem[] = [
    { icon: '✏️', label: '编辑资料', key: 'edit', arrow: true },
    { icon: '👤', label: '个人信息', key: 'info', arrow: true },
    { icon: '⚙️', label: '设置', key: 'setting', arrow: true },
    { icon: 'ℹ️', label: '关于', key: 'about', arrow: true },
    { icon: '🚪', label: '退出登录', key: 'logout', arrow: false },
  ]

  const handleMenuClick = (key: string) => {
    switch (key) {
      case 'edit':
        Taro.navigateTo({
          url: ROUTES.EDIT_PROFILE,
        })
        break
      case 'info':
        Taro.showToast({
          title: '个人信息',
          icon: 'none',
        })
        break
      case 'setting':
        Taro.showToast({
          title: '设置功能开发中',
          icon: 'none',
        })
        break
      case 'about':
        Taro.showModal({
          title: 'EVA-APP',
          content: 'EVA-01 TEST TYPE\n初号机基础框架 v0.1.0',
          showCancel: false,
          confirmText: '确定',
        })
        break
      case 'logout':
        Taro.showModal({
          title: 'LOGOUT',
          content: '确认退出登录？',
          confirmText: '确认',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              logout()
              Taro.reLaunch({
                url: ROUTES.LOGIN,
              })
            }
          },
        })
        break
    }
  }

  if (loading) {
    return (
      <BasePage title="个人中心" safeArea={true} className="bg-gradient-to-b from-gray-50 to-white">
        <View className="flex justify-center items-center h-64">
          <Loading type="spinner" />
          <Text className="ml-2 text-gray-500">加载中...</Text>
        </View>
      </BasePage>
    )
  }

  return (
    <BasePage title="个人中心" safeArea={true} className="bg-gradient-to-b from-gray-50 to-white">
      <View className="min-h-screen pb-10">
        {/* 头部用户卡片 */}
        <View className="relative px-10 pt-15 pb-10 bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden">
          {/* 背景装饰 */}
          <View className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-blue-50/50 to-transparent opacity-60" />
          
          <View className="relative z-10 flex items-center gap-8">
            <View className="relative">
              <Avatar
                size="80"
                src={userInfo?.avatar || 'https://via.placeholder.com/200?text=Avatar'}
                className="border-4 border-primary-500 shadow-lg shadow-primary-500/30"
              />
              {/* 状态指示器 */}
              <View className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-3 border-white rounded-full shadow-lg animate-pulse" />
            </View>
            
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900 mb-2 block">
                {userInfo?.nickname || '用户'}
              </Text>
              <Text className="text-sm text-gray-600 font-mono block">
                ID: {userInfo?.id || '---'}
              </Text>
            </View>
          </View>
        </View>

        {/* 菜单列表 */}
        <View className="px-6 py-8">
          <CellGroup className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {menuItems.slice(0, -1).map((item) => (
              <Cell
                key={item.key}
                title={
                  <View className="flex items-center gap-4">
                    <Text className="text-lg text-primary-500">{item.icon}</Text>
                    <Text className="font-semibold text-gray-900">{item.label}</Text>
                  </View>
                }
                isLink={item.arrow}
                onClick={() => handleMenuClick(item.key)}
                className="py-4 px-6 border-b border-gray-50 last:border-b-0 active:bg-gray-50 transition-colors"
              />
            ))}
          </CellGroup>

          {/* 退出登录单独处理 */}
          <View className="mt-6">
            <CellGroup className="bg-white rounded-2xl shadow-sm border border-orange-200 overflow-hidden">
              <Cell
                title={
                  <View className="flex items-center gap-4">
                    <Text className="text-lg text-orange-500">🚪</Text>
                    <Text className="font-semibold text-orange-500">退出登录</Text>
                  </View>
                }
                onClick={() => handleMenuClick('logout')}
                className="py-4 px-6 active:bg-orange-50 transition-colors"
              />
            </CellGroup>
          </View>
        </View>

        {/* 底部版本信息 */}
        <View className="flex flex-col items-center gap-5 px-10 mt-8">
          <View className="w-50 h-0.5 bg-gradient-to-r from-transparent via-primary-500 to-transparent" />
          <Text className="text-sm text-gray-400 font-mono tracking-wider">
            EVA-APP v0.1.0
          </Text>
        </View>
      </View>
    </BasePage>
  )
}

export default Profile
