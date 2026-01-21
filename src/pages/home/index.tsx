import { useState, useEffect } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { Button } from '@nutui/nutui-react-taro'
import { useAuth } from '@/hooks/useAuth'
import { useWalkingStore } from '@/store/walking'
import Taro from '@tarojs/taro'

function Home() {
  useAuth()

  const [greeting, setGreeting] = useState('')
  const { currentWalk, isTracking, loadInProgressWalk } = useWalkingStore()

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours()
      if (hour < 12) {
        setGreeting('早上好')
      } else if (hour < 18) {
        setGreeting('下午好')
      } else {
        setGreeting('晚上好')
      }
    }

    updateGreeting()
    const timer = setInterval(updateGreeting, 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // 页面加载时检查是否有进行中的散步
    loadInProgressWalk()
  }, [loadInProgressWalk])

  // 判断是否有活跃的散步
  const hasActiveWalk = currentWalk && isTracking

  const getWalkButtonText = () => {
    return hasActiveWalk ? '继续散步' : '开始散步'
  }

  const getWalkButtonIcon = () => {
    return hasActiveWalk ? '▶️' : '🐾'
  }

  const getWalkButtonStyle = () => {
    return hasActiveWalk 
      ? {
          height: '112rpx',
          borderRadius: '56rpx',
          background: 'linear-gradient(to right, #22c55e, #16a34a)',
          border: 'none',
          boxShadow: '0 16rpx 40rpx -12rpx rgba(34, 197, 94, 0.5)',
        }
      : {
          height: '112rpx',
          borderRadius: '56rpx',
          background: 'linear-gradient(to right, #FB923C, #EC4899)',
          border: 'none',
          boxShadow: '0 16rpx 40rpx -12rpx rgba(236, 72, 153, 0.5)',
        }
  }

   const handleStartWalk = () => {
     Taro.navigateTo({ url: '/pages/walking/index' })
   }

   const handleViewHistory = () => {
     Taro.navigateTo({ url: '/pages/walkHistory/index' })
   }

  return (
    <View className='min-h-screen bg-[#f5f7f8]'>
      {/* Header */}
      <View
        className='flex items-center justify-between bg-white'
        style={{ padding: '48rpx 32rpx 32rpx' }}
      >
        <View>
          <Text
            className='block font-bold text-[#0d171c]'
            style={{ fontSize: '40rpx', lineHeight: '48rpx', marginBottom: '8rpx' }}
          >
            {greeting}，小莎！
          </Text>
          <Text className='block text-[#64748b]' style={{ fontSize: '28rpx' }}>
            准备好今天的散步了吗？
          </Text>
        </View>
        <View className='relative'>
          <Image
            className='rounded-full'
            style={{
              width: '96rpx',
              height: '96rpx',
              border: '4rpx solid rgba(37, 175, 244, 0.2)',
            }}
            src='https://lh3.googleusercontent.com/aida-public/AB6AXuCI9_9IW4-5TZAwkkEs6EsOOPNdkGbU4vbtPTg3wR25cD1mDFbd5RMtWZI5ht8154_ox9C-xNF975cS6weZktS_XgjxOULJIi_qqu4SVjYSVdRNCzzVONtiGWJto9tT1SY0F2_TeUtY5ITS30YYDJ06zc4b92-xlcnoyBzeX3EnZ33PZirqIpays1kib9YfA0x71We3TUe-_Wi8Uy-V6irAs4YvoDsQUU8E50XmRmIeYGdkHPncMsX2m-xjKaBfkb651GIOZy6Az1UG'
            mode='aspectFill'
          />
          <View
            className='absolute bg-[#22c55e] rounded-full'
            style={{
              width: '24rpx',
              height: '24rpx',
              bottom: '0',
              right: '0',
              border: '4rpx solid #fff',
            }}
          />
        </View>
      </View>

      {/* Main Content */}
      <View style={{ padding: '24rpx 32rpx' }}>
        {/* Weather Card */}
        <View
          className='relative overflow-hidden bg-[#eff6ff]'
          style={{
            padding: '40rpx',
            borderRadius: '32rpx',
            marginBottom: '32rpx',
            border: '2rpx solid #dbeafe',
          }}
        >
          <View className='flex justify-between items-start relative' style={{ zIndex: 10 }}>
            <View style={{ maxWidth: '400rpx' }}>
              <Text
                className='block font-bold text-[#25aff4] uppercase'
                style={{ fontSize: '24rpx', letterSpacing: '2rpx', marginBottom: '8rpx' }}
              >
                天气
              </Text>
              <View className='flex items-baseline' style={{ gap: '16rpx', marginBottom: '24rpx' }}>
                <Text
                  className='block font-black text-[#0d171c]'
                  style={{ fontSize: '72rpx', lineHeight: '80rpx' }}
                >
                  22°C
                </Text>
                <Text className='block text-[#64748b]' style={{ fontSize: '32rpx' }}>
                  晴朗
                </Text>
              </View>
              <Text
                className='block text-[#475569]'
                style={{ fontSize: '28rpx', lineHeight: '40rpx' }}
              >
                今天天气很棒！非常适合在公园里长时间散步。
              </Text>
            </View>
            <Text style={{ fontSize: '100rpx' }}>☀️</Text>
          </View>
          {/* Background Decoration */}
          <View
            className='absolute bg-[#25aff4] rounded-full opacity-10'
            style={{
              width: '300rpx',
              height: '300rpx',
              right: '-80rpx',
              bottom: '-120rpx',
            }}
          />
        </View>

        {/* Hero Illustration */}
        <View
          className='flex items-center justify-center relative'
          style={{ height: '420rpx', marginBottom: '32rpx' }}
        >
          <View
            className='absolute bg-[#25aff4] opacity-5 rounded-full'
            style={{
              width: '400rpx',
              height: '400rpx',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
          <Image
            className='relative'
            style={{ width: '400rpx', height: '400rpx', zIndex: 10 }}
            src='https://lh3.googleusercontent.com/aida-public/AB6AXuCYfOvlwfYUI09BMvOdalvkrLRCfAFBkAiZqgIyTHRs0-c_6FSt38iYTiKghGGNR-S36LKTYwiCV80gjlx4Ed8Zf0eA-NpoXbTRjE7RsVojI_EKw_JWOSbtFzQ_5MAzhfKpF5AiKHcIhK-V07N7W-LV2KFR_-ZiqpEihzXlfmxTUQ3ehS6JhycW5RHHs3z8ydHT0Qpszo1QClFuCIBF6AZkDPH8101CYmDnFAal2MeJGF983VLvGqZwE-j1CF-VjU02VWx5c7xvtXuJ'
            mode='aspectFit'
          />
        </View>

        {/* Start Walking Button */}
        <View style={{ marginBottom: '32rpx' }}>
          <Button
            type='primary'
            block
            onClick={handleStartWalk}
            style={getWalkButtonStyle()}
          >
            <View className='flex items-center justify-center' style={{ gap: '16rpx' }}>
              <View
                className='flex items-center justify-center rounded-full'
                style={{
                  width: '48rpx',
                  height: '48rpx',
                  background: 'rgba(255,255,255,0.2)',
                }}
              >
                <Text style={{ fontSize: '28rpx' }}>{getWalkButtonIcon()}</Text>
              </View>
              <Text
                className='text-white font-bold'
                style={{ fontSize: '32rpx', letterSpacing: '2rpx' }}
              >
                {getWalkButtonText()}
              </Text>
              <Text className='text-white' style={{ fontSize: '32rpx' }}>
                →
              </Text>
            </View>
            </Button>

           <Button
             block
             onClick={handleViewHistory}
             style={{
               height: '96rpx',
               borderRadius: '48rpx',
               background: '#ffffff',
               color: '#25aff4',
               border: '2rpx solid #25aff4',
               marginTop: '24rpx',
             }}
           >
             <View className='flex items-center justify-center' style={{ gap: '12rpx' }}>
               <Text style={{ fontSize: '28rpx' }}>📋</Text>
               <Text
                 className='font-bold'
                 style={{ fontSize: '28rpx', color: '#25aff4' }}
               >
                 查看历史记录
               </Text>
             </View>
           </Button>
         </View>

         {/* Stats Row */}
        <View className='flex' style={{ gap: '24rpx', paddingBottom: '32rpx' }}>
          {/* Daily Goal */}
          <View
            className='flex-1 flex items-center bg-white'
            style={{
              padding: '28rpx',
              borderRadius: '24rpx',
              border: '2rpx solid #f1f5f9',
            }}
          >
            <View
              className='flex items-center justify-center bg-[#ffedd5]'
              style={{
                width: '72rpx',
                height: '72rpx',
                borderRadius: '16rpx',
                marginRight: '20rpx',
              }}
            >
              <Text style={{ fontSize: '36rpx' }}>🐾</Text>
            </View>
            <View>
              <Text
                className='block text-[#94a3b8] font-semibold uppercase'
                style={{ fontSize: '20rpx', letterSpacing: '1rpx', marginBottom: '4rpx' }}
              >
                每日目标
              </Text>
              <Text className='block font-bold text-[#0d171c]' style={{ fontSize: '28rpx' }}>
                4/5 公里
              </Text>
            </View>
          </View>

          {/* Next Walk */}
          <View
            className='flex-1 flex items-center bg-white'
            style={{
              padding: '28rpx',
              borderRadius: '24rpx',
              border: '2rpx solid #f1f5f9',
            }}
          >
            <View
              className='flex items-center justify-center bg-[#f3e8ff]'
              style={{
                width: '72rpx',
                height: '72rpx',
                borderRadius: '16rpx',
                marginRight: '20rpx',
              }}
            >
              <Text style={{ fontSize: '36rpx' }}>⏰</Text>
            </View>
            <View>
              <Text
                className='block text-[#94a3b8] font-semibold uppercase'
                style={{ fontSize: '20rpx', letterSpacing: '1rpx', marginBottom: '4rpx' }}
              >
                下次散步
              </Text>
              <Text className='block font-bold text-[#0d171c]' style={{ fontSize: '28rpx' }}>
                下午 5:00
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

export default Home
