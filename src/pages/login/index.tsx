import { useState } from 'react'
import { View } from '@tarojs/components'
import { Button, Input, Tabs, TabPane } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { passwordLogin, wxMiniappLogin } from '@/services/auth'
import { useUserStore } from '@/store/user'
import { ROUTES } from '@/constants/routes'
import BasePage from '@/components/BasePage'

function Login() {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('0')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const login = useUserStore((state) => state.login)

  // 账号密码登录
  const handlePasswordLogin = async () => {
    if (!username.trim()) {
      Taro.showToast({
        title: '请输入账号',
        icon: 'none'
      })
      return
    }

    if (!password.trim()) {
      Taro.showToast({
        title: '请输入密码',
        icon: 'none'
      })
      return
    }

    setLoading(true)
    try {
      const loginData = await passwordLogin({
        username,
        password,
      })

      login(loginData)

      Taro.showToast({
        title: '登录成功',
        icon: 'success'
      })

      // 跳转到首页
      setTimeout(() => {
        Taro.switchTab({
          url: ROUTES.HOME,
        })
      }, 1000)
    } catch (error: any) {
      Taro.showToast({
        title: error.message || '登录失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  // 微信一键登录
  const handleWxLogin = async () => {
    if (loading) return

    setLoading(true)
    try {
      const loginData = await wxMiniappLogin()

      login(loginData)

      Taro.showToast({
        title: '登录成功',
        icon: 'success'
      })

      // 跳转到首页
      setTimeout(() => {
        Taro.switchTab({
          url: ROUTES.HOME,
        })
      }, 1000)
    } catch (error) {
      console.error('Login failed:', error)
      Taro.showToast({
        title: '登录失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <BasePage showBack={false} safeArea={true} className="bg-gradient-to-b from-blue-50 to-white">
      {/* 背景装饰 */}
      <View className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-blue-50/50 to-transparent opacity-60" />
      
      {/* 登录容器 */}
      <View className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8 py-20">
        {/* Logo 和标题 */}
        <View className="text-center mb-15">
          <View className="text-6xl font-bold text-primary-500 mb-5 tracking-widest drop-shadow-lg">
            遛狗助手
          </View>
          <View className="text-xl font-bold text-gray-800 mb-2 tracking-wide">
            PET WALKING APP
          </View>
          <View className="text-base text-gray-500">
            和爱宠一起享受散步时光
          </View>
        </View>

        {/* 登录表单区域 */}
        <View className="w-full max-w-md">
          <Tabs 
            value={activeTab} 
            onChange={(value) => setActiveTab(value as string)}
            className="mb-10"
          >
            <TabPane title="密码登录" value="0">
              <View className="space-y-6 pt-8">
                {/* 账号输入 */}
                <View>
                  <View className="text-sm font-semibold text-gray-700 mb-3 px-2">
                    账号
                  </View>
                  <Input
                    placeholder="请输入账号 (admin)"
                    value={username}
                    onChange={(value) => setUsername(value)}
                    className="w-full h-22 px-6 bg-white border-2 border-gray-200 rounded-xl text-gray-800 shadow-sm focus:border-primary-500 focus:shadow-primary-100"
                  />
                </View>

                {/* 密码输入 */}
                <View>
                  <View className="text-sm font-semibold text-gray-700 mb-3 px-2">
                    密码
                  </View>
                  <Input
                    type="password"
                    placeholder="请输入密码 (admin123)"
                    value={password}
                    onChange={(value) => setPassword(value)}
                    className="w-full h-22 px-6 bg-white border-2 border-gray-200 rounded-xl text-gray-800 shadow-sm focus:border-primary-500 focus:shadow-primary-100"
                  />
                </View>

                {/* 登录按钮 */}
                <Button
                  type="primary"
                  size="large"
                  loading={loading}
                  onClick={handlePasswordLogin}
                  className="w-full h-22 bg-gradient-to-r from-primary-500 to-primary-600 border-none rounded-xl font-bold text-white shadow-lg hover:from-primary-600 hover:to-primary-700 active:scale-98 transition-all"
                >
                  {loading ? '登录中...' : '登 录'}
                </Button>
              </View>
            </TabPane>

            <TabPane title="微信登录" value="1">
              <View className="pt-8 text-center">
                <Button
                  type="primary"
                  size="large"
                  loading={loading}
                  onClick={handleWxLogin}
                  className="w-full h-22 bg-gradient-to-r from-primary-500 to-primary-600 border-none rounded-xl font-bold text-white shadow-lg hover:from-primary-600 hover:to-primary-700 active:scale-98 transition-all mb-5"
                >
                  {loading ? '登录中...' : '微信一键登录'}
                </Button>
                <View className="text-sm text-gray-500">
                  首次登录将自动注册账号
                </View>
              </View>
            </TabPane>
          </Tabs>

          {/* 测试提示 */}
          <View className="mt-10 p-5 bg-accent-50 border border-accent-200 rounded-xl text-center">
            <View className="text-sm text-accent-600 font-medium">
              测试账号: admin / admin123
            </View>
          </View>
        </View>
      </View>
    </BasePage>
  )
}

export default Login
