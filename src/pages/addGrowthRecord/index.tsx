import { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { Button, Input, TextArea, DatePicker } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { getPetById, createGrowthRecord, updateGrowthRecord, getGrowthRecordById } from '@/services/pet'
import type { PetVO, GrowthRecordDTO } from '@/constants/types'
import './index.scss'

// 获取导航栏信息
const getNavBarInfo = () => {
  try {
    const systemInfo = Taro.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 44
    const menuButton = Taro.getMenuButtonBoundingClientRect()
    const menuButtonMarginTop = menuButton.top - statusBarHeight
    const navBarHeight = menuButton.height + menuButtonMarginTop * 2
    return { statusBarHeight, navBarHeight, totalHeight: statusBarHeight + navBarHeight }
  } catch {
    return { statusBarHeight: 44, navBarHeight: 44, totalHeight: 88 }
  }
}

// 里程碑选项
const milestoneOptions = [
  { label: '第一次站立', value: '第一次站立' },
  { label: '第一次走路', value: '第一次走路' },
  { label: '换牙期', value: '换牙期' },
  { label: '疫苗接种', value: '疫苗接种' },
  { label: '绝育手术', value: '绝育手术' },
  { label: '训练成功', value: '训练成功' },
  { label: '生病康复', value: '生病康复' },
  { label: '其他', value: '其他' }
]

function AddGrowthRecord() {
  const navBarInfo = getNavBarInfo()
  const [petId, setPetId] = useState<number | null>(null)
  const [pet, setPet] = useState<PetVO | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [photoUrl, setPhotoUrl] = useState('')

  // 表单数据
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [milestone, setMilestone] = useState('')
  const [notes, setNotes] = useState('')
  const [datePickerVisible, setDatePickerVisible] = useState(false)

  useEffect(() => {
    const instance = Taro.getCurrentInstance()
    const params = instance.router?.params

    if (params?.petId) {
      const id = parseInt(params.petId)
      setPetId(id)
      loadPetData(id)

      // 检查是否是编辑模式
      if (params?.mode === 'edit' && params?.recordId) {
        setIsEditing(true)
        const recordId = parseInt(params.recordId)
        setEditingId(recordId)
        loadRecordData(id, recordId)
      } else {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const loadPetData = async (id: number) => {
    try {
      const petData = await getPetById(id)
      setPet(petData)
    } catch (error) {
      console.error('Failed to load pet data:', error)
    }
  }

  const loadRecordData = async (pId: number, recordId: number) => {
    try {
      const record = await getGrowthRecordById(pId, recordId)
      if (record) {
        setSelectedDate(new Date(record.recordDate))
        setWeight(record.weight?.toString() || '')
        setHeight(record.height?.toString() || '')
        setMilestone(record.milestone || '')
        setNotes(record.notes || '')
        setPhotoUrl(record.photoUrl || '')
      }
    } catch (error) {
      console.error('Failed to load record data:', error)
      Taro.showToast({ title: '加载记录失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    Taro.navigateBack()
  }

  const handlePhotoUpload = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        // TODO: 实际项目中需要上传到服务器获取URL
        setPhotoUrl(tempFilePath)
      },
      fail: (error) => {
        console.error('Failed to choose image:', error)
        Taro.showToast({ title: '选择图片失败', icon: 'none' })
      }
    })
  }

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const selectMilestone = (value: string) => {
    setMilestone(milestone === value ? '' : value)
  }

  const handleSubmit = async () => {
    if (!petId) {
      Taro.showToast({ title: '宠物ID无效', icon: 'none' })
      return
    }

    // 至少需要填写体重或身高其中一项
    if (!weight && !height) {
      Taro.showToast({ title: '请至少填写体重或身高', icon: 'none' })
      return
    }

    // 验证体重
    if (weight) {
      const w = parseFloat(weight)
      if (isNaN(w) || w <= 0 || w > 100) {
        Taro.showToast({ title: '请输入有效的体重(0-100kg)', icon: 'none' })
        return
      }
    }

    // 验证身高
    if (height) {
      const h = parseFloat(height)
      if (isNaN(h) || h <= 0 || h > 200) {
        Taro.showToast({ title: '请输入有效的身高(0-200cm)', icon: 'none' })
        return
      }
    }

    setSaving(true)

    try {
      const recordData: GrowthRecordDTO = {
        recordDate: formatDate(selectedDate),
        weight: weight ? parseFloat(weight) : undefined,
        height: height ? parseFloat(height) : undefined,
        milestone: milestone || undefined,
        notes: notes.trim() || undefined,
        photoUrl: photoUrl || undefined
      }

      if (isEditing && editingId) {
        await updateGrowthRecord(petId, editingId, recordData)
        Taro.showToast({ title: '更新成功', icon: 'success' })
      } else {
        await createGrowthRecord(petId, recordData)
        Taro.showToast({ title: '保存成功', icon: 'success' })
      }

      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)

    } catch (error) {
      console.error('Failed to save growth record:', error)
    } finally {
      setSaving(false)
    }
  }

  const getAgeText = () => {
    if (!pet) return ''
    const years = pet.age
    if (years === 0) {
      return '不到1岁'
    }
    return `${years}岁`
  }

  if (loading) {
    return (
      <View className="min-h-screen bg-[#f5f7f8]">
        {/* 自定义导航栏 */}
        <View
          className="bg-white"
          style={{
            paddingTop: `${navBarInfo.statusBarHeight}px`,
            borderBottom: '2rpx solid #f1f5f9'
          }}
        >
          <View
            className="flex items-center justify-between"
            style={{
              padding: '0 32rpx',
              height: `${navBarInfo.navBarHeight}px`
            }}
          >
            <View
              className="flex items-center justify-center bg-[#f1f5f9]"
              style={{ width: '72rpx', height: '72rpx', borderRadius: '36rpx' }}
              onClick={handleBack}
            >
              <Text style={{ fontSize: '32rpx', color: '#0d171c' }}>←</Text>
            </View>
            <Text className="font-bold text-[#0d171c]" style={{ fontSize: '32rpx' }}>
              {isEditing ? '编辑成长记录' : '新增成长记录'}
            </Text>
            <View style={{ width: '72rpx' }} />
          </View>
        </View>

        {/* 加载骨架屏 */}
        <View style={{ padding: '48rpx 32rpx' }}>
          {[1, 2, 3, 4].map(i => (
            <View
              key={i}
              className="bg-[#e2e8f0]"
              style={{
                height: '120rpx',
                borderRadius: '24rpx',
                marginBottom: '24rpx',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}
            />
          ))}
        </View>
      </View>
    )
  }

  return (
    <View className="min-h-screen bg-[#f5f7f8]">
      {/* 自定义导航栏 */}
      <View
        className="bg-white"
        style={{
          paddingTop: `${navBarInfo.statusBarHeight}px`,
          borderBottom: '2rpx solid #f1f5f9',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <View
          className="flex items-center justify-between"
          style={{
            padding: '0 32rpx',
            height: `${navBarInfo.navBarHeight}px`
          }}
        >
          <View
            className="flex items-center justify-center bg-[#f1f5f9]"
            style={{ width: '72rpx', height: '72rpx', borderRadius: '36rpx' }}
            onClick={handleBack}
          >
            <Text style={{ fontSize: '32rpx', color: '#0d171c' }}>←</Text>
          </View>
          <Text className="font-bold text-[#0d171c]" style={{ fontSize: '32rpx' }}>
            {isEditing ? '编辑成长记录' : '新增成长记录'}
          </Text>
          <View style={{ width: '72rpx' }} />
        </View>
      </View>

      <ScrollView scrollY style={{ height: `calc(100vh - ${navBarInfo.totalHeight}px)` }}>
        <View style={{ padding: '32rpx', paddingBottom: '200rpx' }}>
          {/* 宠物信息提示 */}
          {pet && (
            <View
              className="flex items-center justify-center"
              style={{
                gap: '16rpx',
                padding: '24rpx 32rpx',
                background: 'rgba(37, 175, 244, 0.1)',
                borderRadius: '48rpx',
                marginBottom: '32rpx'
              }}
            >
              <Text style={{ fontSize: '32rpx' }}>📊</Text>
              <Text style={{ fontSize: '28rpx', fontWeight: '700', color: '#25aff4' }}>
                记录{pet.name}的成长数据
              </Text>
            </View>
          )}

          {/* 照片上传（可选） */}
          <View
            className="bg-white"
            style={{
              borderRadius: '24rpx',
              padding: '32rpx',
              marginBottom: '32rpx',
              boxShadow: '0 4rpx 24rpx rgba(0,0,0,0.06)'
            }}
          >
            <View className="flex items-center" style={{ marginBottom: '24rpx' }}>
              <View
                style={{
                  width: '8rpx',
                  height: '32rpx',
                  background: 'linear-gradient(135deg, #25aff4 0%, #1e40af 100%)',
                  borderRadius: '4rpx',
                  marginRight: '16rpx'
                }}
              />
              <Text style={{ fontSize: '28rpx', fontWeight: '600', color: '#0d171c' }}>记录照片</Text>
              <Text style={{ fontSize: '24rpx', color: '#94a3b8', marginLeft: '8rpx' }}>（可选）</Text>
            </View>

            <View
              className="flex items-center justify-center"
              style={{
                width: '200rpx',
                height: '200rpx',
                borderRadius: '20rpx',
                border: photoUrl ? '4rpx solid #25aff4' : '4rpx dashed #cee0e8',
                background: photoUrl ? 'transparent' : '#f8fafc',
                overflow: 'hidden'
              }}
              onClick={handlePhotoUpload}
            >
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  mode="aspectFill"
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <View className="flex flex-col items-center justify-center">
                  <Text style={{ fontSize: '48rpx', color: '#25aff4' }}>📸</Text>
                  <Text style={{ fontSize: '22rpx', color: '#64748b', marginTop: '8rpx' }}>添加照片</Text>
                </View>
              )}
            </View>
          </View>

          {/* 记录日期 */}
          <View
            className="bg-white"
            style={{
              borderRadius: '24rpx',
              padding: '32rpx',
              marginBottom: '24rpx',
              boxShadow: '0 4rpx 16rpx rgba(0,0,0,0.04)'
            }}
          >
            <View className="flex items-center" style={{ marginBottom: '16rpx' }}>
              <View
                style={{
                  width: '8rpx',
                  height: '32rpx',
                  background: 'linear-gradient(135deg, #25aff4 0%, #1e40af 100%)',
                  borderRadius: '4rpx',
                  marginRight: '16rpx'
                }}
              />
              <Text style={{ fontSize: '28rpx', fontWeight: '600', color: '#0d171c' }}>记录日期</Text>
            </View>
            <View
              className="flex items-center justify-between"
              style={{
                height: '88rpx',
                background: '#f8fafc',
                border: '2rpx solid #e2e8f0',
                borderRadius: '20rpx',
                padding: '0 24rpx'
              }}
              onClick={() => setDatePickerVisible(true)}
            >
              <Text style={{ fontSize: '28rpx', color: '#0d171c' }}>
                {formatDate(selectedDate)}
              </Text>
              <Text style={{ fontSize: '32rpx', color: '#25aff4' }}>📅</Text>
            </View>
            <DatePicker
              visible={datePickerVisible}
              defaultValue={selectedDate}
              onClose={() => setDatePickerVisible(false)}
              onConfirm={(_, values) => {
                if (values && values.length >= 3) {
                  const newDate = new Date(
                    parseInt(values[0]),
                    parseInt(values[1]) - 1,
                    parseInt(values[2])
                  )
                  setSelectedDate(newDate)
                }
                setDatePickerVisible(false)
              }}
            />
          </View>

          {/* 体重和身高 */}
          <View className="flex" style={{ gap: '24rpx', marginBottom: '24rpx' }}>
            <View
              className="flex-1 bg-white"
              style={{
                borderRadius: '24rpx',
                padding: '32rpx',
                boxShadow: '0 4rpx 16rpx rgba(0,0,0,0.04)'
              }}
            >
              <View className="flex items-center" style={{ marginBottom: '16rpx' }}>
                <View
                  style={{
                    width: '8rpx',
                    height: '32rpx',
                    background: 'linear-gradient(135deg, #25aff4 0%, #1e40af 100%)',
                    borderRadius: '4rpx',
                    marginRight: '16rpx'
                  }}
                />
                <Text style={{ fontSize: '28rpx', fontWeight: '600', color: '#0d171c' }}>体重(kg)</Text>
              </View>
              <Input
                type="digit"
                value={weight}
                onChange={(val) => setWeight(val)}
                placeholder="0.0"
                style={{
                  '--nutui-input-padding': '0 24rpx',
                  '--nutui-input-font-size': '28rpx',
                  height: '88rpx',
                  background: '#f8fafc',
                  border: '2rpx solid #e2e8f0',
                  borderRadius: '20rpx'
                }}
              />
            </View>

            <View
              className="flex-1 bg-white"
              style={{
                borderRadius: '24rpx',
                padding: '32rpx',
                boxShadow: '0 4rpx 16rpx rgba(0,0,0,0.04)'
              }}
            >
              <View className="flex items-center" style={{ marginBottom: '16rpx' }}>
                <View
                  style={{
                    width: '8rpx',
                    height: '32rpx',
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    borderRadius: '4rpx',
                    marginRight: '16rpx'
                  }}
                />
                <Text style={{ fontSize: '28rpx', fontWeight: '600', color: '#0d171c' }}>身高(cm)</Text>
              </View>
              <Input
                type="digit"
                value={height}
                onChange={(val) => setHeight(val)}
                placeholder="0.0"
                style={{
                  '--nutui-input-padding': '0 24rpx',
                  '--nutui-input-font-size': '28rpx',
                  height: '88rpx',
                  background: '#f8fafc',
                  border: '2rpx solid #e2e8f0',
                  borderRadius: '20rpx'
                }}
              />
            </View>
          </View>

          {/* 里程碑选择 */}
          <View
            className="bg-white"
            style={{
              borderRadius: '24rpx',
              padding: '32rpx',
              marginBottom: '24rpx',
              boxShadow: '0 4rpx 16rpx rgba(0,0,0,0.04)'
            }}
          >
            <View className="flex items-center" style={{ marginBottom: '16rpx' }}>
              <View
                style={{
                  width: '8rpx',
                  height: '32rpx',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: '4rpx',
                  marginRight: '16rpx'
                }}
              />
              <Text style={{ fontSize: '28rpx', fontWeight: '600', color: '#0d171c' }}>成长里程碑</Text>
              <Text style={{ fontSize: '24rpx', color: '#94a3b8', marginLeft: '8rpx' }}>（可选）</Text>
            </View>
            <View className="flex flex-wrap" style={{ gap: '16rpx' }}>
              {milestoneOptions.map(option => (
                <View
                  key={option.value}
                  className="flex items-center justify-center"
                  style={{
                    padding: '12rpx 24rpx',
                    borderRadius: '24rpx',
                    background: milestone === option.value ? '#fef3c7' : '#f8fafc',
                    border: milestone === option.value ? '2rpx solid #f59e0b' : '2rpx solid #e2e8f0'
                  }}
                  onClick={() => selectMilestone(option.value)}
                >
                  <Text
                    style={{
                      fontSize: '26rpx',
                      color: milestone === option.value ? '#d97706' : '#0d171c'
                    }}
                  >
                    {option.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* 备注 */}
          <View
            className="bg-white"
            style={{
              borderRadius: '24rpx',
              padding: '32rpx',
              marginBottom: '24rpx',
              boxShadow: '0 4rpx 16rpx rgba(0,0,0,0.04)'
            }}
          >
            <View className="flex items-center" style={{ marginBottom: '16rpx' }}>
              <View
                style={{
                  width: '8rpx',
                  height: '32rpx',
                  background: 'linear-gradient(135deg, #25aff4 0%, #1e40af 100%)',
                  borderRadius: '4rpx',
                  marginRight: '16rpx'
                }}
              />
              <Text style={{ fontSize: '28rpx', fontWeight: '600', color: '#0d171c' }}>备注</Text>
              <Text style={{ fontSize: '24rpx', color: '#94a3b8', marginLeft: '8rpx' }}>（可选）</Text>
            </View>
            <TextArea
              value={notes}
              onChange={(val) => setNotes(val)}
              placeholder="记录宠物的成长变化、行为表现等..."
              maxLength={300}
              style={{
                '--nutui-textarea-padding': '24rpx',
                '--nutui-textarea-font-size': '28rpx',
                width: '100%',
                minHeight: '200rpx',
                background: '#f8fafc',
                border: '2rpx solid #e2e8f0',
                borderRadius: '20rpx'
              }}
            />
          </View>
        </View>
      </ScrollView>

      {/* 底部保存按钮 */}
      <View
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '32rpx',
          paddingBottom: '64rpx',
          background: 'linear-gradient(to top, #f5f7f8 0%, #f5f7f8 70%, transparent 100%)',
          zIndex: 100
        }}
      >
        <Button
          type="primary"
          disabled={saving}
          onClick={handleSubmit}
          style={{
            width: '100%',
            height: '100rpx',
            background: saving ? '#94a3b8' : '#25aff4',
            borderRadius: '50rpx',
            border: 'none',
            boxShadow: '0 16rpx 40rpx rgba(37,175,244,0.35)'
          }}
        >
          <View className="flex items-center justify-center" style={{ gap: '16rpx' }}>
            <Text style={{ fontSize: '32rpx' }}>📊</Text>
            <Text style={{ fontSize: '30rpx', fontWeight: '700', color: 'white' }}>
              {saving ? '保存中...' : (isEditing ? '更新成长记录' : '保存成长记录')}
            </Text>
          </View>
        </Button>
      </View>
    </View>
  )
}

export default AddGrowthRecord
