import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import { useAuth } from '@/hooks/useAuth'
import { useUserStore } from '@/store/user'
import Skeleton from '@/components/Skeleton'
import './index.scss'

function Home() {
  useAuth()

  const [loading, setLoading] = useState(true)
  const userInfo = useUserStore((state) => state.userInfo)

  useEffect(() => {
    // 模拟数据加载
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <View className="home-page">
      {/* 头部欢迎区 */}
      <View className="home-header">
        <View className="header-bg"></View>
        <Skeleton loading={loading}>
          <View className="welcome-section">
            <Text className="welcome-title">EVA-APP</Text>
            <Text className="welcome-subtitle">
              欢迎回来, {userInfo?.nickname}
            </Text>
            <View className="status-bar">
              <View className="status-item">
                <View className="status-dot"></View>
                <Text className="status-text">SYSTEM ONLINE</Text>
              </View>
            </View>
          </View>
        </Skeleton>
      </View>

      {/* 快捷功能区 */}
      <View className="quick-actions">
        <Skeleton loading={loading} rows={2}>
          <View className="section-title">
            <View className="title-line"></View>
            <Text className="title-text">QUICK ACCESS</Text>
          </View>
          <View className="action-grid">
            <View className="action-item">
              <View className="action-icon">📊</View>
              <Text className="action-text">数据统计</Text>
            </View>
            <View className="action-item">
              <View className="action-icon">📁</View>
              <Text className="action-text">文件管理</Text>
            </View>
            <View className="action-item">
              <View className="action-icon">⚙️</View>
              <Text className="action-text">系统设置</Text>
            </View>
            <View className="action-item">
              <View className="action-icon">📱</View>
              <Text className="action-text">应用中心</Text>
            </View>
          </View>
        </Skeleton>
      </View>

      {/* 信息卡片区 */}
      <View className="info-cards">
        <Skeleton loading={loading} card rows={3}>
          <View className="info-card">
            <View className="card-header">
              <Text className="card-title">系统状态</Text>
              <View className="card-badge">ACTIVE</View>
            </View>
            <View className="card-content">
              <View className="info-row">
                <Text className="info-label">运行时间</Text>
                <Text className="info-value">24h 35m</Text>
              </View>
              <View className="info-row">
                <Text className="info-label">同步状态</Text>
                <Text className="info-value success">已同步</Text>
              </View>
              <View className="info-row">
                <Text className="info-label">最后更新</Text>
                <Text className="info-value">2 分钟前</Text>
              </View>
            </View>
          </View>
        </Skeleton>

        <Skeleton loading={loading} card rows={3}>
          <View className="info-card">
            <View className="card-header">
              <Text className="card-title">使用统计</Text>
              <View className="card-badge warning">MONITORING</View>
            </View>
            <View className="card-content">
              <View className="info-row">
                <Text className="info-label">今日访问</Text>
                <Text className="info-value">1,234</Text>
              </View>
              <View className="info-row">
                <Text className="info-label">总计使用</Text>
                <Text className="info-value">45,678</Text>
              </View>
              <View className="info-row">
                <Text className="info-label">平均响应</Text>
                <Text className="info-value">120ms</Text>
              </View>
            </View>
          </View>
        </Skeleton>
      </View>
    </View>
  )
}

export default Home
