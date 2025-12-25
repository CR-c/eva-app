import { useState, useEffect } from 'react'
import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { WxUserInfo } from '@/constants/types'
import './index.scss'

interface RegisterModalProps {
  visible: boolean
  onClose: () => void
  onConfirm: (nickname: string, phone: string, avatar?: string) => void
}

function RegisterModal({ visible, onClose, onConfirm }: RegisterModalProps) {
  const [nickname, setNickname] = useState('')
  const [phone, setPhone] = useState('')
  const [avatar, setAvatar] = useState('')
  const [loading, setLoading] = useState(false)

  // 获取微信用户信息
  const getWxUserInfo = async () => {
    try {
      // 注意：微信小程序新版本已废弃 getUserInfo，需要使用 getUserProfile
      const { userInfo } = await Taro.getUserProfile({
        desc: '用于完善会员资料',
      })

      if (userInfo) {
        setNickname(userInfo.nickName)
        setAvatar(userInfo.avatarUrl)
      }
    } catch (error) {
      console.error('获取微信用户信息失败:', error)
      Taro.showToast({
        title: '获取微信信息失败',
        icon: 'none',
      })
    }
  }

  const handleConfirm = () => {
    if (!nickname.trim()) {
      Taro.showToast({
        title: '请输入昵称',
        icon: 'none',
      })
      return
    }

    if (!phone.trim()) {
      Taro.showToast({
        title: '请输入手机号',
        icon: 'none',
      })
      return
    }

    // 简单的手机号验证
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      Taro.showToast({
        title: '请输入正确的手机号',
        icon: 'none',
      })
      return
    }

    onConfirm(nickname, phone, avatar)
  }

  if (!visible) return null

  return (
    <View className="register-modal">
      <View className="modal-mask" onClick={onClose}></View>
      <View className="modal-container">
        <View className="modal-header">
          <Text className="modal-title">完善个人信息</Text>
          <Text className="modal-subtitle">Welcome to EVA-01</Text>
        </View>

        <View className="modal-body">
          <View className="form-item">
            <View className="item-label">
              <View className="label-dot"></View>
              <Text className="label-text">昵称</Text>
            </View>
            <View className="item-input-wrapper">
              <Input
                className="item-input"
                value={nickname}
                placeholder="请输入昵称"
                placeholderClass="input-placeholder"
                onInput={(e) => setNickname(e.detail.value)}
              />
              <Button
                className="get-wx-btn"
                size="mini"
                onClick={getWxUserInfo}
              >
                获取微信昵称
              </Button>
            </View>
          </View>

          <View className="form-item">
            <View className="item-label">
              <View className="label-dot"></View>
              <Text className="label-text">手机号</Text>
            </View>
            <Input
              className="item-input"
              type="number"
              maxlength={11}
              value={phone}
              placeholder="请输入手机号"
              placeholderClass="input-placeholder"
              onInput={(e) => setPhone(e.detail.value)}
            />
          </View>
        </View>

        <View className="modal-footer">
          <Button
            className="cancel-btn"
            onClick={onClose}
          >
            取消
          </Button>
          <Button
            className="confirm-btn"
            loading={loading}
            onClick={handleConfirm}
          >
            {loading ? '注册中...' : '确认注册'}
          </Button>
        </View>
      </View>
    </View>
  )
}

export default RegisterModal
