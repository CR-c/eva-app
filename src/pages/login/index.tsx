import { useState } from 'react'
import { View, Button, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { passwordLogin, wxMiniappLogin } from '@/services/auth'
import { useUserStore } from '@/store/user'
import { ROUTES } from '@/constants/routes'
import './index.scss'

function Login() {
  const [loading, setLoading] = useState(false)
  const [loginMode, setLoginMode] = useState<'password' | 'wechat'>('password')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const login = useUserStore((state) => state.login)

  // 账号密码登录
  const handlePasswordLogin = async () => {
    if (!username.trim()) {
      Taro.showToast({
        title: '请输入账号',
        icon: 'none',
      })
      return
    }

    if (!password.trim()) {
      Taro.showToast({
        title: '请输入密码',
        icon: 'none',
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
        icon: 'success',
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
        icon: 'none',
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
        icon: 'success',
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
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="login-page">
      <View className="login-container">
        <View className="logo">遛狗助手</View>
        <View className="title">PET WALKING APP</View>
        <View className="desc">和爱宠一起享受散步时光</View>

        {/* 登录方式切换 */}
        <View className="login-mode-tabs">
          <View
            className={`tab-item ${loginMode === 'password' ? 'active' : ''}`}
            onClick={() => setLoginMode('password')}
          >
            密码登录
          </View>
          <View
            className={`tab-item ${loginMode === 'wechat' ? 'active' : ''}`}
            onClick={() => setLoginMode('wechat')}
          >
            微信登录
          </View>
        </View>

        {/* 账号密码登录表单 */}
        {loginMode === 'password' && (
          <View className="login-form">
            <View className="form-item">
              <View className="form-label">账号</View>
              <Input
                className="form-input"
                type="text"
                placeholder="请输入账号 (admin)"
                value={username}
                onInput={(e) => setUsername(e.detail.value)}
              />
            </View>
            <View className="form-item">
              <View className="form-label">密码</View>
              <Input
                className="form-input"
                type="password"
                placeholder="请输入密码 (admin123)"
                value={password}
                onInput={(e) => setPassword(e.detail.value)}
              />
            </View>
            <Button
              className="login-btn password-btn"
              loading={loading}
              onClick={handlePasswordLogin}
            >
              {loading ? '登录中...' : '登 录'}
            </Button>
          </View>
        )}

        {/* 微信一键登录 */}
        {loginMode === 'wechat' && (
          <View className="wechat-login">
            <Button
              className="login-btn wechat-btn"
              loading={loading}
              onClick={handleWxLogin}
            >
              {loading ? '登录中...' : '微信一键登录'}
            </Button>
            <View className="wechat-tip">
              首次登录将自动注册账号
            </View>
          </View>
        )}

        <View className="login-tip">
          测试账号: admin / admin123
        </View>
      </View>
    </View>
  )
}

export default Login
