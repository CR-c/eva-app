import { useState, useEffect } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import { useAuth } from '@/hooks/useAuth'
import Taro from '@tarojs/taro'
import './index.scss'

function Home() {
  useAuth()

  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    // 获取当前时间并设置问候语
    const updateTime = () => {
      const now = new Date()
      const hour = now.getHours()
      let greeting = '早上好'
      if (hour >= 12 && hour < 18) {
        greeting = '下午好'
      } else if (hour >= 18) {
        greeting = '晚上好'
      }
      setCurrentTime(greeting)
    }
    
    updateTime()
    const timer = setInterval(updateTime, 60000) // 每分钟更新一次
    
    return () => clearInterval(timer)
  }, [])

  const handleStartWalk = () => {
    Taro.showToast({
      title: '开始遛狗！',
      icon: 'success'
    })
  }

  return (
    <View className="dog-walk-home">
      {/* 头部区域 */}
      <View className="header">
        <View className="greeting-section">
          <Text className="greeting-title">{currentTime}，小莎！</Text>
          <Text className="greeting-subtitle">准备好今天的散步了吗？</Text>
        </View>
        <View className="avatar-section">
          <View className="avatar">
            <Image 
              className="avatar-image"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCI9_9IW4-5TZAwkkEs6EsOOPNdkGbU4vbtPTg3wR25cD1mDFbd5RMtWZI5ht8154_ox9C-xNF975cS6weZktS_XgjxOULJIi_qqu4SVjYSVdRNCzzVONtiGWJto9tT1SY0F2_TeUtY5ITS30YYDJ06zc4b92-xlcnoyBzeX3EnZ33PZirqIpays1kib9YfA0x71We3TUe-_Wi8Uy-V6irAs4YvoDsQUU8E50XmRmIeYGdkHPncMsX2m-xjKaBfkb651GIOZy6Az1UG"
              mode="aspectFill"
            />
            <View className="online-status"></View>
          </View>
        </View>
      </View>

      {/* 天气卡片 */}
      <View className="weather-card">
        <View className="weather-content">
          <View className="weather-info">
            <Text className="weather-label">天气</Text>
            <View className="temperature-section">
              <Text className="temperature">22°C</Text>
              <Text className="weather-desc">晴朗</Text>
            </View>
            <Text className="weather-suggestion">
              今天天气很棒！非常适合在公园里长时间散步。
            </Text>
          </View>
          <View className="weather-icon">
            <Text className="sun-icon">☀️</Text>
          </View>
        </View>
      </View>

      {/* 狗狗插图区域 */}
      <View className="hero-section">
        <View className="dog-illustration">
          <Image 
            className="dog-image"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYfOvlwfYUI09BMvOdalvkrLRCfAFBkAiZqgIyTHRs0-c_6FSt38iYTiKghGGNR-S36LKTYwiCV80gjlx4Ed8Zf0eA-NpoXbTRjE7RsVojI_EKw_JWOSbtFzQ_5MAzhfKpF5AiKHcIhK-V07N7W-LV2KFR_-ZiqpEihzXlfmxTUQ3ehS6JhycW5RHHs3z8ydHT0Qpszo1QClFuCIBF6AZkDPH8101CYmDnFAal2MeJGF983VLvGqZwE-j1CF-VjU02VWx5c7xvtXuJ"
            mode="aspectFit"
          />
        </View>
      </View>

      {/* 统计卡片 */}
      <View className="stats-section">
        <View className="stat-card">
          <View className="stat-icon pets-icon">🐾</View>
          <View className="stat-info">
            <Text className="stat-label">每日目标</Text>
            <Text className="stat-value">4/5 公里</Text>
          </View>
        </View>
        <View className="stat-card">
          <View className="stat-icon time-icon">⏰</View>
          <View className="stat-info">
            <Text className="stat-label">下次散步</Text>
            <Text className="stat-value">下午 5:00</Text>
          </View>
        </View>
      </View>

      {/* 开始散步按钮 */}
      <View className="start-walk-section">
        <Button className="start-walk-btn" onClick={handleStartWalk}>
          <View className="btn-content">
            <View className="btn-icon">🐾</View>
            <Text className="btn-text">开始散步</Text>
            <Text className="btn-arrow">→</Text>
          </View>
        </Button>
      </View>
    </View>
  )
}

export default Home
