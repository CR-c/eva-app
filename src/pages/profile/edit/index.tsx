import { useState } from 'react'
import { View, Text, Input, Image, Picker } from '@tarojs/components'
import { Button } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { useAuth } from '@/hooks/useAuth'
import { useUserStore } from '@/store/user'
import { updateUserProfile } from '@/services/user'
import type { UserInfo } from '@/constants/types'
import { regionData } from '@/constants/region'
import PageLayout from '@/components/PageLayout'
import './index.scss'

function EditProfile() {
  useAuth()

  const userInfo = useUserStore(state => state.userInfo)
  const setUserInfo = useUserStore(state => state.setUserInfo)

  const [formData, setFormData] = useState<Partial<UserInfo>>({
    nickname: userInfo?.nickname || '',
    phone: userInfo?.phone || '',
    email: userInfo?.email || '',
    gender: userInfo?.gender || 0,
    birthday: userInfo?.birthday || '',
    location: userInfo?.location || '',
    signature: userInfo?.signature || '',
  })

  const [saving, setSaving] = useState(false)

  // 性别选择
  const genderOptions = ['未设置', '男', '女']

  // 地区选择相关
  const [regionValue, setRegionValue] = useState([0, 0, 0])
  const [provinces] = useState(regionData.map(item => item.name))
  const [cities, setCities] = useState(regionData[0].cities.map(item => item.name))
  const [districts, setDistricts] = useState(regionData[0].cities[0].districts)

  const handleInput = (field: keyof UserInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // 性别选择
  const handleGenderChange = (e: any) => {
    const index = e.detail.value
    setFormData(prev => ({ ...prev, gender: index as 0 | 1 | 2 }))
  }

  // 生日选择
  const handleDateChange = (e: any) => {
    setFormData(prev => ({ ...prev, birthday: e.detail.value }))
  }

  // 地区选择 - 列改变时更新下级列表
  const handleRegionColumnChange = (e: any) => {
    const { column, value } = e.detail
    const newValue = [...regionValue]
    newValue[column] = value

    if (column === 0) {
      // 省份改变，更新市和区
      const newCities = regionData[value].cities.map(item => item.name)
      const newDistricts = regionData[value].cities[0].districts
      setCities(newCities)
      setDistricts(newDistricts)
      newValue[1] = 0
      newValue[2] = 0
    } else if (column === 1) {
      // 市改变，更新区
      const newDistricts = regionData[newValue[0]].cities[value].districts
      setDistricts(newDistricts)
      newValue[2] = 0
    }

    setRegionValue(newValue)
  }

  // 地区选择确认
  const handleRegionChange = (e: any) => {
    const { value } = e.detail
    const province = regionData[value[0]].name
    const city = regionData[value[0]].cities[value[1]].name
    const district = regionData[value[0]].cities[value[1]].districts[value[2]]
    const location = `${province} ${city} ${district}`

    setFormData(prev => ({ ...prev, location }))
    setRegionValue(value)
  }

  // 头像选择
  const handleChooseAvatar = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: () => {
        Taro.showToast({
          title: '头像上传功能开发中',
          icon: 'none',
        })
        // 实际项目中应调用上传接口
      },
    })
  }

  // 保存
  const handleSave = async () => {
    if (!formData.nickname?.trim()) {
      Taro.showToast({
        title: '昵称不能为空',
        icon: 'none',
      })
      return
    }

    setSaving(true)
    try {
      const updatedUserInfo = await updateUserProfile(formData)
      setUserInfo(updatedUserInfo)

      Taro.showToast({
        title: '保存成功',
        icon: 'success',
      })

      setTimeout(() => {
        Taro.navigateBack()
      }, 1000)
    } catch (error) {
      console.error('Save profile error:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageLayout title='编辑资料'>
      <View className='edit-profile-content'>
        {/* 头部 */}
        <View className='edit-header'>
          <View className='header-bg'></View>
          <View className='header-content'>
            <Text className='header-title'>EDIT PROFILE</Text>
            <Text className='header-subtitle'>编辑个人资料</Text>
          </View>
        </View>

        {/* 头像编辑 */}
        <View className='avatar-section'>
          <View className='avatar-container' onClick={handleChooseAvatar}>
            <Image
              className='avatar'
              src={userInfo?.avatar || 'https://via.placeholder.com/200'}
              mode='aspectFill'
            />
            <View className='avatar-mask'>
              <Text className='mask-text'>📷 更换头像</Text>
            </View>
          </View>
        </View>

        {/* 表单 */}
        <View className='form-container'>
          <View className='form-item'>
            <View className='item-label'>
              <View className='label-dot'></View>
              <Text className='label-text'>昵称</Text>
            </View>
            <Input
              className='item-input'
              value={formData.nickname}
              placeholder='请输入昵称'
              placeholderClass='input-placeholder'
              onInput={e => handleInput('nickname', e.detail.value)}
            />
          </View>

          <View className='form-item'>
            <View className='item-label'>
              <View className='label-dot'></View>
              <Text className='label-text'>手机号</Text>
            </View>
            <Input
              className='item-input'
              value={formData.phone}
              placeholder='请输入手机号'
              placeholderClass='input-placeholder'
              type='number'
              onInput={e => handleInput('phone', e.detail.value)}
            />
          </View>

          <View className='form-item'>
            <View className='item-label'>
              <View className='label-dot'></View>
              <Text className='label-text'>邮箱</Text>
            </View>
            <Input
              className='item-input'
              value={formData.email}
              placeholder='请输入邮箱'
              placeholderClass='input-placeholder'
              onInput={e => handleInput('email', e.detail.value)}
            />
          </View>

          <View className='form-item picker-item'>
            <View className='item-label'>
              <View className='label-dot'></View>
              <Text className='label-text'>性别</Text>
            </View>
            <Picker
              mode='selector'
              range={genderOptions}
              value={formData.gender}
              onChange={handleGenderChange}
            >
              <View className='picker-value'>
                <Text className={`value-text ${!formData.gender ? 'placeholder' : ''}`}>
                  {genderOptions[formData.gender || 0]}
                </Text>
                <Text className='arrow'>▼</Text>
              </View>
            </Picker>
          </View>

          <View className='form-item picker-item'>
            <View className='item-label'>
              <View className='label-dot'></View>
              <Text className='label-text'>生日</Text>
            </View>
            <Picker
              mode='date'
              value={formData.birthday || ''}
              start='1950-01-01'
              end={new Date().toISOString().split('T')[0]}
              onChange={handleDateChange}
            >
              <View className='picker-value'>
                <Text className={`value-text ${!formData.birthday ? 'placeholder' : ''}`}>
                  {formData.birthday || '请选择生日'}
                </Text>
                <Text className='arrow'>📅</Text>
              </View>
            </Picker>
          </View>

          <View className='form-item picker-item'>
            <View className='item-label'>
              <View className='label-dot'></View>
              <Text className='label-text'>地区</Text>
            </View>
            <Picker
              mode='multiSelector'
              range={[provinces, cities, districts]}
              value={regionValue}
              onChange={handleRegionChange}
              onColumnChange={handleRegionColumnChange}
            >
              <View className='picker-value'>
                <Text className={`value-text ${!formData.location ? 'placeholder' : ''}`}>
                  {formData.location || '请选择地区'}
                </Text>
                <Text className='arrow'>📍</Text>
              </View>
            </Picker>
          </View>

          <View className='form-item textarea-item'>
            <View className='item-label'>
              <View className='label-dot'></View>
              <Text className='label-text'>个性签名</Text>
            </View>
            <Input
              className='item-textarea'
              value={formData.signature}
              placeholder='请输入个性签名'
              placeholderClass='input-placeholder'
              onInput={e => handleInput('signature', e.detail.value)}
            />
          </View>
        </View>

        {/* 保存按钮 */}
        <View className='save-section'>
          <Button
            className={`save-btn ${saving ? 'saving' : ''}`}
            loading={saving}
            onClick={handleSave}
          >
            {saving ? '保存中...' : '💾 保存'}
          </Button>
        </View>
      </View>
    </PageLayout>
  )
}

export default EditProfile
