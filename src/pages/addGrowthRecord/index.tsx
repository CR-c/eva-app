import { useState, useEffect } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { 
  Form, 
  FormItem, 
  Input, 
  TextArea, 
  Picker, 
  DatePicker,
  Toast,
  Loading
} from '@nutui/nutui-react-taro'
import FormPage from '@/components/FormPage'
import './index.scss'

interface GrowthRecord {
  id: string
  petId: string
  date: string
  weight: number
  height: number
  notes?: string
  photo?: string
  milestone?: string
  createdAt: string
}

function AddGrowthRecord() {
  const [loading, setLoading] = useState(true)
  const [form] = Form.useForm()
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [pets, setPets] = useState<any[]>([])

  // 里程碑选项
  const milestoneOptions = [
    '第一次站立',
    '第一次走路',
    '换牙期',
    '疫苗接种',
    '绝育手术',
    '训练成功',
    '生病康复',
    '其他'
  ]

  useEffect(() => {
    loadPets()
    
    // 模拟加载时间
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)

    // 检查是否是编辑模式
    const instance = Taro.getCurrentInstance()
    const params = instance.router?.params
    
    if (params?.mode === 'edit' && params?.id) {
      setIsEditing(true)
      setEditingId(params.id)
      loadGrowthRecordData(params.id)
    }

    return () => clearTimeout(timer)
  }, [])

  const loadPets = async () => {
    try {
      const storedPets = await Taro.getStorage({ key: 'pets' })
      if (storedPets.data && Array.isArray(storedPets.data)) {
        setPets(storedPets.data)
      }
    } catch (error) {
      console.error('Failed to load pets:', error)
    }
  }

  const loadGrowthRecordData = async (recordId: string) => {
    try {
      const storedRecords = await Taro.getStorage({ key: 'growthRecords' })
      if (storedRecords.data && Array.isArray(storedRecords.data)) {
        const records = storedRecords.data as GrowthRecord[]
        const record = records.find(r => r.id === recordId)
        if (record) {
          form.setFieldsValue({
            petId: [record.petId],
            date: [record.date],
            weight: record.weight.toString(),
            height: record.height.toString(),
            milestone: record.milestone ? [record.milestone] : undefined,
            notes: record.notes || ''
          })
          setPhotoUrl(record.photo || '')
        }
      }
    } catch (error) {
      console.error('Failed to load growth record data:', error)
    }
  }

  const handlePhotoUpload = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        setPhotoUrl(tempFilePath)
      },
      fail: (error) => {
        console.error('Failed to choose image:', error)
        Toast.show('选择图片失败')
      }
    })
  }

  const handleSubmit = async (values: any) => {
    try {
      // 获取现有成长记录数据
      let records: GrowthRecord[] = []
      try {
        const storedRecords = await Taro.getStorage({ key: 'growthRecords' })
        if (storedRecords.data && Array.isArray(storedRecords.data)) {
          records = storedRecords.data as GrowthRecord[]
        }
      } catch (error) {
        console.log('No existing growth records found')
      }

      // Convert picker values back to the expected format
      let petId = ''
      if (Array.isArray(values.petId) && values.petId.length > 0) {
        petId = values.petId[0]
      }

      let date = ''
      if (Array.isArray(values.date) && values.date.length > 0) {
        date = values.date[0]
      }

      let milestone = ''
      if (Array.isArray(values.milestone) && values.milestone.length > 0) {
        milestone = values.milestone[0]
      }

      const recordData: GrowthRecord = {
        id: isEditing ? editingId : Date.now().toString(),
        petId: petId,
        date: date,
        weight: parseFloat(values.weight),
        height: parseFloat(values.height),
        milestone: milestone,
        notes: values.notes?.trim() || '',
        photo: photoUrl,
        createdAt: isEditing ? records.find(r => r.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString()
      }

      if (isEditing) {
        // 更新现有记录
        const index = records.findIndex(r => r.id === editingId)
        if (index !== -1) {
          records[index] = recordData
        }
      } else {
        // 添加新记录
        records.push(recordData)
      }

      // 保存到本地存储
      await Taro.setStorage({
        key: 'growthRecords',
        data: records
      })

      // 延迟返回，让用户看到成功提示
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)

    } catch (error) {
      console.error('Failed to save growth record:', error)
      throw new Error('保存失败，请重试')
    }
  }

  if (loading) {
    return (
      <FormPage title={isEditing ? '编辑成长记录' : '添加成长记录'} showSubmitButton={false}>
        <View className="flex justify-center items-center h-64">
          <Loading type="spinner" />
          <Text className="ml-2 text-gray-500">加载中...</Text>
        </View>
      </FormPage>
    )
  }

  return (
    <FormPage
      title={isEditing ? '编辑成长记录' : '添加成长记录'}
      onSubmit={handleSubmit}
      submitText={isEditing ? '更新成长记录' : '保存成长记录'}
      className="bg-gray-50"
    >
      {/* 照片上传器 */}
      <View className="mb-6 flex flex-col items-center">
        <View 
          className="relative w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={handlePhotoUpload}
        >
          {photoUrl ? (
            <Image 
              className="w-full h-full rounded-lg object-cover"
              src={photoUrl}
              mode="aspectFill"
            />
          ) : (
            <View className="flex flex-col items-center">
              <Text className="text-3xl mb-1">📸</Text>
              <Text className="text-xs text-gray-500">上传照片</Text>
            </View>
          )}
          <View className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <Text className="text-white text-sm">✏️</Text>
          </View>
        </View>
        <Text className="mt-2 text-sm text-gray-500">点击添加成长照片</Text>
      </View>

      {/* 宠物选择 */}
      <FormItem
        label="选择宠物"
        name="petId"
        rules={[{ required: true, message: '请选择宠物' }]}
      >
        <Picker
          options={[pets.map(pet => pet.name)]}
          className="bg-white border border-gray-200 rounded-lg"
        />
      </FormItem>

      {/* 记录日期 */}
      <FormItem
        label="记录日期"
        name="date"
        rules={[{ required: true, message: '请选择日期' }]}
      >
        <DatePicker
          className="bg-white border border-gray-200 rounded-lg"
        />
      </FormItem>

      {/* 体重和身高 */}
      <View className="flex gap-4">
        <View className="flex-1">
          <FormItem
            label="体重（kg）"
            name="weight"
            rules={[
              { required: true, message: '请输入体重' },
              { 
                validator: (_, value) => {
                  const weight = parseFloat(value)
                  if (isNaN(weight) || weight <= 0 || weight > 100) {
                    return Promise.reject(new Error('请输入0-100之间的有效体重'))
                  }
                  return Promise.resolve(true)
                }
              }
            ]}
          >
            <Input
              type="digit"
              placeholder="0.0"
              className="bg-white border border-gray-200 rounded-lg px-3 py-2"
            />
          </FormItem>
        </View>

        <View className="flex-1">
          <FormItem
            label="身高（cm）"
            name="height"
            rules={[
              { required: true, message: '请输入身高' },
              { 
                validator: (_, value) => {
                  const height = parseFloat(value)
                  if (isNaN(height) || height <= 0 || height > 200) {
                    return Promise.reject(new Error('请输入0-200之间的有效身高'))
                  }
                  return Promise.resolve(true)
                }
              }
            ]}
          >
            <Input
              type="digit"
              placeholder="0.0"
              className="bg-white border border-gray-200 rounded-lg px-3 py-2"
            />
          </FormItem>
        </View>
      </View>

      {/* 里程碑选择 */}
      <FormItem
        label={
          <View className="flex items-center">
            <Text>成长里程碑</Text>
            <Text className="ml-2 text-sm text-gray-400">（可选）</Text>
          </View>
        }
        name="milestone"
      >
        <Picker
          options={[milestoneOptions]}
          className="bg-white border border-gray-200 rounded-lg"
        />
      </FormItem>

      {/* 备注 */}
      <FormItem
        label={
          <View className="flex items-center">
            <Text>备注</Text>
            <Text className="ml-2 text-sm text-gray-400">（可选）</Text>
          </View>
        }
        name="notes"
      >
        <TextArea
          placeholder="记录宠物的成长变化、行为表现等..."
          rows={4}
          maxLength={300}
          className="bg-white border border-gray-200 rounded-lg p-3"
        />
      </FormItem>
    </FormPage>
  )
}

export default AddGrowthRecord