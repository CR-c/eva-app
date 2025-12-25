import { useState, useEffect } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAuth } from '@/hooks/useAuth'
import { useUserStore } from '@/store/user'
import { ROUTES } from '@/constants/routes'
import Skeleton from '@/components/Skeleton'
import './index.scss'

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

  return (
    <View className="profile-page">
      {/* 头部用户卡片 */}
      <View className="profile-header">
        <View className="header-bg"></View>
        <Skeleton loading={loading} avatar>
          <View className="user-card">
            <View className="avatar-section">
              <Image
                className="avatar"
                src={
                  userInfo?.avatar ||
                  'https://via.placeholder.com/200?text=Avatar'
                }
                mode="aspectFill"
              />
              <View className="avatar-border"></View>
              <View className="status-dot"></View>
            </View>
            <View className="user-info">
              <Text className="user-name">{userInfo?.nickname || '用户'}</Text>
              <Text className="user-id">ID: {userInfo?.id || '---'}</Text>
            </View>
          </View>
        </Skeleton>
      </View>

      {/* 菜单列表 */}
      <View className="menu-section">
        {loading ? (
          <>
            <Skeleton card rows={1} />
            <Skeleton card rows={1} />
            <Skeleton card rows={1} />
          </>
        ) : (
          menuItems.map((item, index) => (
            <View
              key={item.key}
              className={`menu-item ${item.key === 'logout' ? 'logout-item' : ''}`}
              onClick={() => handleMenuClick(item.key)}
            >
              <View className="menu-left">
                <Text className="menu-icon">{item.icon}</Text>
                <Text className="menu-label">{item.label}</Text>
              </View>
              {item.arrow && (
                <Text className="menu-arrow">›</Text>
              )}
            </View>
          ))
        )}
      </View>

      {/* 底部版本信息 */}
      <View className="footer-info">
        <View className="footer-line"></View>
        <Text className="version-text">EVA-APP v0.1.0</Text>
      </View>
    </View>
  )
}

export default Profile
