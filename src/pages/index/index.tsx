import { View, Button, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAuth } from '@/hooks/useAuth'
import { useUserStore } from '@/store/user'
import { ROUTES } from '@/constants/routes'
import './index.scss'

function Index() {
  // 使用权限校验 Hook
  useAuth()

  const userInfo = useUserStore((state) => state.userInfo)
  const logout = useUserStore((state) => state.logout)

  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确认退出登录？',
      success: (res) => {
        if (res.confirm) {
          logout()
          Taro.reLaunch({
            url: ROUTES.LOGIN,
          })
        }
      },
    })
  }

  return (
    <View className="index-page">
      <View className="header">
        <View className="welcome">欢迎使用 Eva App</View>
        <View className="user-info">
          <Text className="nickname">{userInfo?.nickname || '用户'}</Text>
          <Text className="user-id">ID: {userInfo?.id}</Text>
        </View>
      </View>

      <View className="content">
        <View className="card">
          <View className="card-title">框架特性</View>
          <View className="feature-list">
            <View className="feature-item">✓ Taro 4 + React + TypeScript</View>
            <View className="feature-item">✓ 微信一键登录</View>
            <View className="feature-item">✓ 请求自动注入 Token</View>
            <View className="feature-item">✓ 401 统一处理</View>
            <View className="feature-item">✓ Zustand 状态管理</View>
            <View className="feature-item">✓ 路由权限控制</View>
          </View>
        </View>

        <Button className="logout-btn" onClick={handleLogout}>
          退出登录
        </Button>
      </View>
    </View>
  )
}

export default Index
