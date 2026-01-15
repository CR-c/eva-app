import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import { Button, Input, Tabs } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { passwordLogin, wxMiniappLogin } from '@/services/auth'
import { useUserStore } from '@/store/user'
import { ROUTES } from '@/constants/routes'

function Login() {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('0')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const login = useUserStore(state => state.login)

  const handlePasswordLogin = async () => {
    if (!username.trim()) {
      Taro.showToast({ title: '请输入账号', icon: 'none' })
      return
    }
    if (!password.trim()) {
      Taro.showToast({ title: '请输入密码', icon: 'none' })
      return
    }

    setLoading(true)
    try {
      const loginData = await passwordLogin({ username, password })
      login(loginData)
      Taro.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        Taro.switchTab({ url: ROUTES.HOME })
      }, 1000)
    } catch (error: any) {
      Taro.showToast({ title: error.message || '登录失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleWxLogin = async () => {
    if (loading) return
    setLoading(true)
    try {
      const loginData = await wxMiniappLogin()
      login(loginData)
      Taro.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        Taro.switchTab({ url: ROUTES.HOME })
      }, 1000)
    } catch (error) {
      Taro.showToast({ title: '登录失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='min-h-screen bg-[#f5f7f8] relative'>
      {/* Background Decoration */}
      <View
        className='absolute bg-[#25aff4] opacity-10'
        style={{
          width: '600rpx',
          height: '600rpx',
          borderRadius: '300rpx',
          top: '-200rpx',
          right: '-200rpx',
        }}
      />
      <View
        className='absolute bg-[#25aff4] opacity-5'
        style={{
          width: '400rpx',
          height: '400rpx',
          borderRadius: '200rpx',
          bottom: '100rpx',
          left: '-150rpx',
        }}
      />

      {/* Content */}
      <View className='relative' style={{ padding: '120rpx 48rpx 48rpx', zIndex: 10 }}>
        {/* Logo */}
        <View className='text-center' style={{ marginBottom: '80rpx' }}>
          <View
            className='flex items-center justify-center bg-white mx-auto'
            style={{
              width: '160rpx',
              height: '160rpx',
              borderRadius: '48rpx',
              marginBottom: '32rpx',
              boxShadow: '0 8rpx 32rpx rgba(37, 175, 244, 0.2)',
            }}
          >
            <Text style={{ fontSize: '80rpx' }}>🐕</Text>
          </View>
          <Text
            className='block font-bold text-[#0d171c]'
            style={{ fontSize: '48rpx', marginBottom: '12rpx' }}
          >
            遛狗助手
          </Text>
          <Text className='block text-[#64748b]' style={{ fontSize: '28rpx' }}>
            和爱宠一起享受散步时光
          </Text>
        </View>

        {/* Login Form */}
        <View
          className='bg-white'
          style={{
            borderRadius: '32rpx',
            padding: '40rpx',
            boxShadow: '0 4rpx 24rpx rgba(0,0,0,0.05)',
          }}
        >
          <Tabs
            value={activeTab}
            onChange={value => setActiveTab(value as string)}
            style={{ marginBottom: '40rpx' }}
          >
            <Tabs.TabPane title='密码登录' value='0'>
              <View style={{ paddingTop: '40rpx' }}>
                {/* Username Input */}
                <View style={{ marginBottom: '32rpx' }}>
                  <Text
                    className='block text-[#64748b] font-medium'
                    style={{ fontSize: '26rpx', marginBottom: '16rpx' }}
                  >
                    账号
                  </Text>
                  <Input
                    placeholder='请输入账号'
                    value={username}
                    onChange={value => setUsername(value)}
                    style={{
                      height: '96rpx',
                      background: '#f8fafc',
                      borderRadius: '24rpx',
                      padding: '0 32rpx',
                      fontSize: '30rpx',
                    }}
                  />
                </View>

                {/* Password Input */}
                <View style={{ marginBottom: '40rpx' }}>
                  <Text
                    className='block text-[#64748b] font-medium'
                    style={{ fontSize: '26rpx', marginBottom: '16rpx' }}
                  >
                    密码
                  </Text>
                  <Input
                    type='password'
                    placeholder='请输入密码'
                    value={password}
                    onChange={value => setPassword(value)}
                    style={{
                      height: '96rpx',
                      background: '#f8fafc',
                      borderRadius: '24rpx',
                      padding: '0 32rpx',
                      fontSize: '30rpx',
                    }}
                  />
                </View>

                {/* Login Button */}
                <Button
                  type='primary'
                  block
                  loading={loading}
                  onClick={handlePasswordLogin}
                  style={{
                    height: '96rpx',
                    borderRadius: '48rpx',
                    background: '#25aff4',
                    border: 'none',
                  }}
                >
                  <Text className='text-white font-bold' style={{ fontSize: '32rpx' }}>
                    {loading ? '登录中...' : '登 录'}
                  </Text>
                </Button>
              </View>
            </Tabs.TabPane>

            <Tabs.TabPane title='微信登录' value='1'>
              <View style={{ paddingTop: '60rpx', textAlign: 'center' }}>
                <View
                  className='flex items-center justify-center bg-[#07c160] mx-auto'
                  style={{
                    width: '120rpx',
                    height: '120rpx',
                    borderRadius: '60rpx',
                    marginBottom: '32rpx',
                  }}
                >
                  <Text className='text-white' style={{ fontSize: '56rpx' }}>
                    微
                  </Text>
                </View>
                <Text
                  className='block text-[#64748b]'
                  style={{ fontSize: '28rpx', marginBottom: '48rpx' }}
                >
                  使用微信账号快速登录
                </Text>

                <Button
                  type='primary'
                  block
                  loading={loading}
                  onClick={handleWxLogin}
                  style={{
                    height: '96rpx',
                    borderRadius: '48rpx',
                    background: '#07c160',
                    border: 'none',
                  }}
                >
                  <Text className='text-white font-bold' style={{ fontSize: '32rpx' }}>
                    {loading ? '登录中...' : '微信一键登录'}
                  </Text>
                </Button>

                <Text
                  className='block text-[#94a3b8]'
                  style={{ fontSize: '24rpx', marginTop: '24rpx' }}
                >
                  首次登录将自动注册账号
                </Text>
              </View>
            </Tabs.TabPane>
          </Tabs>
        </View>

        {/* Test Account Hint */}
        <View
          className='bg-[#fffbeb]'
          style={{
            marginTop: '32rpx',
            padding: '24rpx 32rpx',
            borderRadius: '24rpx',
            border: '2rpx solid #fef3c7',
          }}
        >
          <Text className='text-[#d97706] text-center block' style={{ fontSize: '26rpx' }}>
            测试账号: admin / admin123
          </Text>
        </View>
      </View>
    </View>
  )
}

export default Login
