import { useState, useEffect } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { Button } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { useAuth } from '@/hooks/useAuth'
import { useUserStore } from '@/store/user'
import { ROUTES } from '@/constants/routes'

interface MenuItem {
  icon: string
  label: string
  key: string
  color?: string
}

function Profile() {
  useAuth()

  const [loading, setLoading] = useState(true)
  const userInfo = useUserStore(state => state.userInfo)
  const logout = useUserStore(state => state.logout)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const menuItems: MenuItem[] = [
    { icon: '✏️', label: '编辑资料', key: 'edit' },
    { icon: '📊', label: '散步记录', key: 'history' },
    { icon: '⚙️', label: '设置', key: 'setting' },
    { icon: 'ℹ️', label: '关于我们', key: 'about' },
  ]

  const handleMenuClick = (key: string) => {
    switch (key) {
      case 'edit':
        Taro.navigateTo({ url: ROUTES.EDIT_PROFILE })
        break
      case 'history':
        Taro.showToast({ title: '散步记录开发中', icon: 'none' })
        break
      case 'setting':
        Taro.showToast({ title: '设置功能开发中', icon: 'none' })
        break
      case 'about':
        Taro.showModal({
          title: '遛狗助手',
          content: '版本 1.0.0\n和爱宠一起享受散步时光',
          showCancel: false,
          confirmText: '确定',
        })
        break
    }
  }

  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '确认要退出登录吗？',
      confirmText: '确认',
      cancelText: '取消',
      success: res => {
        if (res.confirm) {
          logout()
          Taro.reLaunch({ url: ROUTES.LOGIN })
        }
      },
    })
  }

  if (loading) {
    return (
      <View className='min-h-screen bg-[#f5f7f8] flex items-center justify-center'>
        <Text style={{ fontSize: '28rpx' }} className='text-[#64748b]'>
          加载中...
        </Text>
      </View>
    )
  }

  return (
    <View className='min-h-screen bg-[#f5f7f8]'>
      {/* Header Card */}
      <View className='bg-white relative overflow-hidden' style={{ padding: '48rpx 32rpx 40rpx' }}>
        {/* Background Decoration */}
        <View
          className='absolute bg-[#25aff4] opacity-5'
          style={{
            width: '400rpx',
            height: '400rpx',
            borderRadius: '200rpx',
            top: '-200rpx',
            right: '-100rpx',
          }}
        />

        <View className='flex items-center relative' style={{ gap: '32rpx', zIndex: 10 }}>
          {/* Avatar */}
          <View className='relative'>
            <View
              className='overflow-hidden'
              style={{
                width: '144rpx',
                height: '144rpx',
                borderRadius: '72rpx',
                border: '6rpx solid #25aff4',
              }}
            >
              <Image
                src={userInfo?.avatar || 'https://via.placeholder.com/200?text=Avatar'}
                mode='aspectFill'
                style={{ width: '100%', height: '100%' }}
              />
            </View>
            <View
              className='absolute bg-[#22c55e]'
              style={{
                width: '28rpx',
                height: '28rpx',
                borderRadius: '14rpx',
                bottom: '4rpx',
                right: '4rpx',
                border: '4rpx solid #fff',
              }}
            />
          </View>

          {/* User Info */}
          <View className='flex-1'>
            <Text
              className='block font-bold text-[#0d171c]'
              style={{ fontSize: '40rpx', marginBottom: '8rpx' }}
            >
              {userInfo?.nickname || '用户'}
            </Text>
            <Text className='block text-[#64748b]' style={{ fontSize: '26rpx' }}>
              ID: {userInfo?.id || '---'}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View
          className='flex bg-[#f8fafc]'
          style={{
            marginTop: '32rpx',
            padding: '24rpx',
            borderRadius: '24rpx',
            gap: '24rpx',
          }}
        >
          <View className='flex-1 text-center'>
            <Text className='block font-bold text-[#0d171c]' style={{ fontSize: '36rpx' }}>
              28
            </Text>
            <Text className='block text-[#64748b]' style={{ fontSize: '24rpx' }}>
              散步次数
            </Text>
          </View>
          <View style={{ width: '2rpx', background: '#e2e8f0' }} />
          <View className='flex-1 text-center'>
            <Text className='block font-bold text-[#0d171c]' style={{ fontSize: '36rpx' }}>
              56.8
            </Text>
            <Text className='block text-[#64748b]' style={{ fontSize: '24rpx' }}>
              总里程(km)
            </Text>
          </View>
          <View style={{ width: '2rpx', background: '#e2e8f0' }} />
          <View className='flex-1 text-center'>
            <Text className='block font-bold text-[#0d171c]' style={{ fontSize: '36rpx' }}>
              15h
            </Text>
            <Text className='block text-[#64748b]' style={{ fontSize: '24rpx' }}>
              总时长
            </Text>
          </View>
        </View>
      </View>

      {/* Menu List */}
      <View style={{ padding: '24rpx 32rpx' }}>
        <View className='bg-white' style={{ borderRadius: '32rpx', overflow: 'hidden' }}>
          {menuItems.map((item, index) => (
            <View
              key={item.key}
              className='flex items-center justify-between'
              style={{
                padding: '36rpx 32rpx',
                borderBottom: index < menuItems.length - 1 ? '2rpx solid #f1f5f9' : 'none',
              }}
              onClick={() => handleMenuClick(item.key)}
            >
              <View className='flex items-center' style={{ gap: '24rpx' }}>
                <View
                  className='flex items-center justify-center bg-[#eff6ff]'
                  style={{
                    width: '72rpx',
                    height: '72rpx',
                    borderRadius: '20rpx',
                  }}
                >
                  <Text style={{ fontSize: '32rpx' }}>{item.icon}</Text>
                </View>
                <Text className='font-medium text-[#0d171c]' style={{ fontSize: '30rpx' }}>
                  {item.label}
                </Text>
              </View>
              <Text className='text-[#cbd5e1]' style={{ fontSize: '28rpx' }}>
                ›
              </Text>
            </View>
          ))}
        </View>

        {/* Logout Button */}
        <Button
          block
          onClick={handleLogout}
          style={{
            marginTop: '32rpx',
            height: '96rpx',
            borderRadius: '48rpx',
            background: '#fff',
            border: '2rpx solid #fee2e2',
          }}
        >
          <View className='flex items-center justify-center' style={{ gap: '12rpx' }}>
            <Text style={{ fontSize: '32rpx' }}>🚪</Text>
            <Text className='font-medium text-[#ef4444]' style={{ fontSize: '30rpx' }}>
              退出登录
            </Text>
          </View>
        </Button>

        {/* Version */}
        <View className='text-center' style={{ marginTop: '48rpx' }}>
          <Text className='text-[#94a3b8]' style={{ fontSize: '24rpx' }}>
            遛狗助手 v1.0.0
          </Text>
        </View>
      </View>
    </View>
  )
}

export default Profile
