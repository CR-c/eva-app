import { useState, useEffect } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { Button, Card } from '@nutui/nutui-react-taro'
import { useAuth } from '@/hooks/useAuth'
import Taro from '@tarojs/taro'
import BasePage from '@/components/BasePage'

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
    Taro.navigateTo({
      url: '/pages/walking/index'
    })
  }

  return (
    <BasePage showBack={false} safeArea={true} className="bg-gradient-to-b from-gray-50 to-white">
      <View className="min-h-screen px-6 pb-8 font-sans">
        {/* 头部区域 */}
        <View className="flex justify-between items-start pt-12 pb-4">
          <View className="flex-1">
            <Text className="text-2xl font-extrabold text-gray-900 leading-tight mb-1 block">
              {currentTime}，小莎！
            </Text>
            <Text className="text-base text-gray-500 font-medium block">
              准备好今天的散步了吗？
            </Text>
          </View>
          <View className="relative">
            <View className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary-200">
              <Image 
                className="w-full h-full rounded-full"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCI9_9IW4-5TZAwkkEs6EsOOPNdkGbU4vbtPTg3wR25cD1mDFbd5RMtWZI5ht8154_ox9C-xNF975cS6weZktS_XgjxOULJIi_qqu4SVjYSVdRNCzzVONtiGWJto9tT1SY0F2_TeUtY5ITS30YYDJ06zc4b92-xlcnoyBzeX3EnZ33PZirqIpays1kib9YfA0x71We3TUe-_Wi8Uy-V6irAs4YvoDsQUU8E50XmRmIeYGdkHPncMsX2m-xjKaBfkb651GIOZy6Az1UG"
                mode="aspectFill"
              />
              <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></View>
            </View>
          </View>
        </View>

        {/* 天气卡片 */}
        <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-100 rounded-3xl p-6 mb-6 relative overflow-hidden">
          <View className="flex justify-between items-start relative z-10">
            <View className="flex-1 max-w-xs">
              <Text className="text-sm font-bold text-primary-500 uppercase tracking-wide mb-2 block">
                天气
              </Text>
              <View className="flex items-baseline gap-3 mb-4">
                <Text className="text-4xl font-black text-gray-900 leading-none block">
                  22°C
                </Text>
                <Text className="text-base font-medium text-gray-600 block">
                  晴朗
                </Text>
              </View>
              <Text className="text-sm text-gray-700 font-medium leading-relaxed block">
                今天天气很棒！非常适合在公园里长时间散步。
              </Text>
            </View>
            <View className="flex items-center justify-center">
              <Text className="text-4xl drop-shadow-lg block">☀️</Text>
            </View>
          </View>
          {/* 背景装饰 */}
          <View className="absolute -right-8 -bottom-12 w-45 h-45 bg-primary-100 rounded-full opacity-50"></View>
        </Card>

        {/* 狗狗插图区域 */}
        <View className="flex justify-center items-center min-h-65 mb-6 relative">
          {/* 背景装饰 */}
          <View className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-75 w-full h-full bg-gradient-radial from-blue-100/50 to-transparent rounded-full blur-xl"></View>
          
          <View className="relative z-10 w-full max-w-80 h-80">
            <Image 
              className="w-full h-full transition-transform duration-700 hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYfOvlwfYUI09BMvOdalvkrLRCfAFBkAiZqgIyTHRs0-c_6FSt38iYTiKghGGNR-S36LKTYwiCV80gjlx4Ed8Zf0eA-NpoXbTRjE7RsVojI_EKw_JWOSbtFzQ_5MAzhfKpF5AiKHcIhK-V07N7W-LV2KFR_-ZiqpEihzXlfmxTUQ3ehS6JhycW5RHHs3z8ydHT0Qpszo1QClFuCIBF6AZkDPH8101CYmDnFAal2MeJGF983VLvGqZwE-j1CF-VjU02VWx5c7xvtXuJ"
              mode="aspectFit"
            />
          </View>
        </View>

        {/* 统计卡片 */}
        <View className="grid grid-cols-2 gap-4 mb-8">
          <Card className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <View className="w-8 h-8 bg-accent-100 text-accent-600 rounded-xl flex items-center justify-center text-lg">
              🐾
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1 block">
                每日目标
              </Text>
              <Text className="text-sm font-bold text-gray-900 block">
                4/5 公里
              </Text>
            </View>
          </Card>
          
          <Card className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <View className="w-8 h-8 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-lg">
              ⏰
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1 block">
                下次散步
              </Text>
              <Text className="text-sm font-bold text-gray-900 block">
                下午 5:00
              </Text>
            </View>
          </Card>
        </View>

        {/* 开始散步按钮 */}
        <View className="mt-8">
          <Button
            type="primary"
            size="large"
            onClick={handleStartWalk}
            className="w-full h-16 bg-gradient-to-r from-accent-400 to-pink-500 border-none rounded-3xl shadow-lg shadow-pink-500/30 active:scale-95 transition-all"
          >
            <View className="flex items-center justify-center gap-3 h-full">
              <View className="bg-white/20 p-2 rounded-full text-base">
                🐾
              </View>
              <Text className="text-white font-bold tracking-wide">
                开始散步
              </Text>
              <Text className="text-white font-bold transition-transform hover:translate-x-1">
                →
              </Text>
            </View>
          </Button>
        </View>
      </View>
    </BasePage>
  )
}

export default Home
