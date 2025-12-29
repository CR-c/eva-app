import { useState, useEffect } from 'react'
import { View, Text, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface WalkData {
  distance: number
  duration: number
  pace: number
  calories: number
  startTime: string
  endTime: string
}

function WalkSummary() {
  const [walkData, setWalkData] = useState<WalkData>({
    distance: 3.5,
    duration: 45,
    pace: 12,
    calories: 350,
    startTime: '',
    endTime: ''
  })

  useEffect(() => {
    // 获取路由参数中的散步数据
    const instance = Taro.getCurrentInstance()
    const params = instance.router?.params
    
    if (params) {
      setWalkData(prev => ({
        ...prev,
        distance: parseFloat(params.distance || '3.5'),
        duration: parseInt(params.duration || '45'),
        pace: parseInt(params.pace || '12'),
        calories: parseInt(params.calories || '350')
      }))
    }

    // 设置页面标题
    Taro.setNavigationBarTitle({
      title: '散步总结'
    })
  }, [])

  const handleClose = () => {
    Taro.navigateBack({
      delta: 2 // 返回到首页，跳过遛狗页面
    })
  }

  const handleMore = () => {
    Taro.showActionSheet({
      itemList: ['保存到相册', '查看详细数据', '设置提醒'],
      success: (res) => {
        const actions = ['保存到相册', '查看详细数据', '设置提醒']
        Taro.showToast({
          title: actions[res.tapIndex],
          icon: 'none'
        })
      }
    })
  }

  const handleViewRoute = () => {
    Taro.showToast({
      title: '查看路线详情',
      icon: 'none'
    })
  }

  const handleShare = () => {
    Taro.showShareMenu({
      withShareTicket: true,
      success: () => {
        Taro.showToast({
          title: '分享成功！',
          icon: 'success'
        })
      },
      fail: () => {
        // 如果分享失败，显示其他分享选项
        Taro.showActionSheet({
          itemList: ['分享到朋友圈', '复制链接', '保存图片'],
          success: (res) => {
            const shareActions = ['分享到朋友圈', '复制链接', '保存图片']
            Taro.showToast({
              title: shareActions[res.tapIndex],
              icon: 'success'
            })
          }
        })
      }
    })
  }

  const handleBackHome = () => {
    Taro.reLaunch({
      url: '/pages/home/index'
    })
  }

  return (
    <View className="walk-summary">
      {/* 背景装饰元素 */}
      <View className="confetti-background">
        <View className="confetti confetti-circle delay-1" />
        <View className="confetti confetti-circle delay-2" />
        <View className="confetti confetti-circle delay-3" />
        <View className="confetti confetti-rect delay-1" />
        <View className="confetti confetti-rect delay-2" />
        <View className="confetti confetti-rect delay-3" />
        <View className="confetti confetti-star delay-1" />
        <View className="confetti confetti-star delay-2" />
      </View>

      {/* 顶部导航 */}
      <View className="top-navigation">
        <View className="nav-button" onClick={handleClose}>
          <Text className="nav-icon">✕</Text>
        </View>
        <Text className="nav-title">散步总结</Text>
        <View className="nav-button" onClick={handleMore}>
          <Text className="nav-icon">⋯</Text>
        </View>
      </View>

      {/* 主要内容区域 */}
      <View className="main-content">
        {/* 庆祝文本 */}
        <View className="celebration-section">
          <View className="stars">
            <Text className="star">⭐</Text>
            <Text className="star">⭐</Text>
            <Text className="star">⭐</Text>
          </View>
          <Text className="celebration-title">散步完成！</Text>
          <Text className="celebration-subtitle">目标成功达成</Text>
        </View>

        {/* 中央玻璃卡片 */}
        <View className="glass-card">
          {/* 浮动头像徽章 */}
          <View className="avatar-badge">
            <View className="avatar-container">
              <Image 
                className="avatar-image"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNfgPRCj1TjU0V6N812loHs-xGWnz32LFlJNga9llQVEk7GqDBgEOI67iHM2yOVuLW8JDfQ8Z4HqTv-KKwKcVqNgsDCfuECHt-OwVqDRoLcpyMJ_rsv8HmG4PCezcstZNsiVwOORgtmzJQDKXOmBUJoeai8pA0zU6VqHUZSFIpEmJP-8z4ViwtfCE7cViVjaGwTVzibX5xEhcOLJA4RutA0yC8hO9YHai1nx-qxc-PfJ4KucX0Mnhwn5zg2DytkI0v9wqNFglPsJ0Y"
                mode="aspectFill"
              />
            </View>
          </View>

          {/* 主要指标：距离 */}
          <View className="main-metric">
            <Text className="metric-label">总距离</Text>
            <View className="metric-value-section">
              <Text className="metric-value">{walkData.distance.toFixed(1)}</Text>
              <Text className="metric-unit">公里</Text>
            </View>
          </View>

          {/* 分隔线 */}
          <View className="divider" />

          {/* 次要统计网格 */}
          <View className="stats-grid">
            {/* 时长 */}
            <View className="stat-item">
              <View className="stat-icon duration-icon">
                <Text className="icon-text">⏱️</Text>
              </View>
              <Text className="stat-value">{walkData.duration}</Text>
              <Text className="stat-unit">分钟</Text>
            </View>

            {/* 配速 */}
            <View className="stat-item">
              <View className="stat-icon pace-icon">
                <Text className="icon-text">⚡</Text>
              </View>
              <Text className="stat-value">{walkData.pace}</Text>
              <Text className="stat-unit">分钟/公里</Text>
            </View>

            {/* 卡路里 */}
            <View className="stat-item">
              <View className="stat-icon calories-icon">
                <Text className="icon-text">🔥</Text>
              </View>
              <Text className="stat-value">{walkData.calories}</Text>
              <Text className="stat-unit">千卡</Text>
            </View>
          </View>

          {/* 地图预览 */}
          <View className="map-preview" onClick={handleViewRoute}>
            <View className="map-container">
              <Image 
                className="map-image"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIZnXnvM2hC2GWxRodzLCTsA9GlsFZPPdjF-RPjdsjlcQkwN2W6iJFKjKMBQ5TeDzt_1yOxtYFH9Sw9blvvmo_fZoHdYA5Xtt95k3_QG7Lbhb8bAMus7J8wfUcZzgCujj13VYZPAjVOBW-6t-CStGyLC-wCN3fIfRU0e5VrnZIYW3T7lXYmx6bP0_PiAF29onp1TU6zWBbmv_8-6rLLQU8Vrk3LOGb7nsXCJXxDEmSf6BFIurpXAdwLPBTN7rhP7VN3ShWAhwsRZcb"
                mode="aspectFill"
              />
              <View className="map-overlay">
                <View className="view-route-button">
                  <Text className="route-icon">🗺️</Text>
                  <Text className="route-text">查看路线</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* 底部操作按钮 */}
      <View className="bottom-actions">
        {/* 分享按钮 */}
        <Button className="share-button" onClick={handleShare}>
          <Text className="share-icon">📤</Text>
          <Text className="share-text">分享成就</Text>
        </Button>

        {/* 返回首页按钮 */}
        <Button className="home-button" onClick={handleBackHome}>
          <Text className="home-text">返回首页</Text>
        </Button>
      </View>
    </View>
  )
}

export default WalkSummary