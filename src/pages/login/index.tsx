import { useState } from 'react'
import { View, Button, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { wxLogin, passwordLogin, checkUserExist, register } from '@/services/auth'
import { useUserStore } from '@/store/user'
import { ROUTES } from '@/constants/routes'
import RegisterModal from '@/components/RegisterModal'
import './index.scss'

function Login() {
  const [loading, setLoading] = useState(false)
  const [loginMode, setLoginMode] = useState<'password' | 'wechat'>('password')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [wxCode, setWxCode] = useState('')
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
      const { token, userInfo } = await passwordLogin(username, password)
      login(token, userInfo)

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
      // 1. 获取微信登录 code
      const { code } = await Taro.login()

      if (!code) {
        throw new Error('获取微信登录 code 失败')
      }

      // 2. 检查用户是否已存在
      const { exist, openid } = await checkUserExist(code)

      if (exist) {
        // 用户已存在，直接登录
        const { token, userInfo } = await wxLogin()
        login(token, userInfo)

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
      } else {
        // 用户不存在，显示注册弹窗
        setWxCode(code)
        setShowRegisterModal(true)
      }
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

  // 处理用户注册
  const handleRegisterConfirm = async (nickname: string, phone: string, avatar?: string) => {
    setShowRegisterModal(false)
    setLoading(true)

    try {
      // 调用注册接口
      const { token, userInfo } = await register({
        code: wxCode,
        nickname,
        phone,
        avatar,
      })

      // 注册成功，保存登录状态
      login(token, userInfo)

      Taro.showToast({
        title: '注册成功',
        icon: 'success',
      })

      // 跳转到首页
      setTimeout(() => {
        Taro.switchTab({
          url: ROUTES.HOME,
        })
      }, 1000)
    } catch (error) {
      console.error('Register failed:', error)
      Taro.showToast({
        title: '注册失败',
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  }

  // 关闭注册弹窗
  const handleRegisterClose = () => {
    setShowRegisterModal(false)
    setWxCode('')
  }

  return (
    <View className="login-page">
      <View className="login-container">
        <View className="logo">EVA APP</View>
        <View className="title">EVA-01 TEST TYPE</View>
        <View className="desc">初号机基础框架</View>

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
          </View>
        )}

        <View className="login-tip">
          测试账号: admin / admin123
        </View>
      </View>

      {/* 注册弹窗 */}
      <RegisterModal
        visible={showRegisterModal}
        onClose={handleRegisterClose}
        onConfirm={handleRegisterConfirm}
      />
    </View>
  )
}

export default Login
