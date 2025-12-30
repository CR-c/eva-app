import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { Card, Button, Tag, Loading, Empty, ActionSheet } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import BasePage from '@/components/BasePage'

interface Pet {
  id: string
  name: string
  breed: string
  age: number
  gender: 'male' | 'female'
  size: 'small' | 'medium' | 'large'
  photo?: string
  bio?: string
  createdAt: string
}

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

function GrowthRecords() {
  const [pet, setPet] = useState<Pet | null>(null)
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [petId, setPetId] = useState('')
  const [showActionSheet, setShowActionSheet] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<GrowthRecord | null>(null)

  const actionSheetOptions = [
    { name: '查看详情', value: 'view' },
    { name: '编辑记录', value: 'edit' },
    { name: '删除记录', value: 'delete' }
  ]

  useEffect(() => {
    // 获取路由参数
    const instance = Taro.getCurrentInstance()
    const params = instance.router?.params
    
    if (params?.petId) {
      setPetId(params.petId)
      loadPetData(params.petId)
      loadGrowthRecords(params.petId)
    }
    
    // 模拟加载时间
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  const loadPetData = async (id: string) => {
    try {
      const storedPets = await Taro.getStorage({ key: 'pets' })
      if (storedPets.data && Array.isArray(storedPets.data)) {
        const petData = storedPets.data.find(p => p.id === id)
        if (petData) {
          setPet(petData)
        }
      }
    } catch (error) {
      console.error('Failed to load pet data:', error)
    }
  }

  const loadGrowthRecords = async (id: string) => {
    try {
      const storedRecords = await Taro.getStorage({ key: 'growthRecords' })
      if (storedRecords.data && Array.isArray(storedRecords.data)) {
        const petRecords = storedRecords.data
          .filter(record => record.petId === id)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setGrowthRecords(petRecords)
      }
    } catch (error) {
      console.log('No growth records found')
    }
  }

  const handleAddRecord = () => {
    Taro.navigateTo({
      url: `/pages/addGrowthRecord/index?petId=${petId}`
    })
  }

  const handleRecordAction = (record: GrowthRecord) => {
    setSelectedRecord(record)
    setShowActionSheet(true)
  }

  const handleActionSheetSelect = (item: any) => {
    setShowActionSheet(false)
    
    if (!selectedRecord) return
    
    switch (item.value) {
      case 'view':
        Taro.showToast({
          title: '查看详情',
          icon: 'none'
        })
        break
      case 'edit':
        Taro.navigateTo({
          url: `/pages/addGrowthRecord/index?id=${selectedRecord.id}&mode=edit`
        })
        break
      case 'delete':
        handleDeleteRecord(selectedRecord.id)
        break
    }
  }

  const handleDeleteRecord = (recordId: string) => {
    Taro.showModal({
      title: '删除记录',
      content: '确定要删除这条成长记录吗？',
      success: async (res) => {
        if (res.confirm) {
          const newRecords = growthRecords.filter(record => record.id !== recordId)
          setGrowthRecords(newRecords)
          
          // 保存到本地存储
          try {
            await Taro.setStorage({
              key: 'growthRecords',
              data: newRecords
            })
            Taro.showToast({
              title: '删除成功',
              icon: 'success'
            })
          } catch (error) {
            console.error('Failed to save records:', error)
          }
        }
      }
    })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getGrowthTrend = () => {
    if (growthRecords.length < 2) return null
    
    const sortedRecords = [...growthRecords].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    const latest = sortedRecords[sortedRecords.length - 1]
    const previous = sortedRecords[sortedRecords.length - 2]
    
    const weightChange = latest.weight - previous.weight
    const heightChange = latest.height - previous.height
    
    return {
      weightChange: weightChange.toFixed(1),
      heightChange: heightChange.toFixed(1),
      weightTrend: weightChange > 0 ? 'up' : weightChange < 0 ? 'down' : 'stable',
      heightTrend: heightChange > 0 ? 'up' : heightChange < 0 ? 'down' : 'stable'
    }
  }

  const trend = getGrowthTrend()

  if (loading) {
    return (
      <BasePage 
        title={`${pet?.name || '宠物'}的成长记录`} 
        safeArea={true} 
        className="bg-gradient-to-b from-gray-50 to-white"
        rightContent={
          <Button size="small" type="primary" onClick={handleAddRecord}>
            +
          </Button>
        }
      >
        <View className="flex justify-center items-center h-64">
          <Loading type="spinner" />
          <Text className="ml-2 text-gray-500">加载中...</Text>
        </View>
      </BasePage>
    )
  }

  return (
    <BasePage 
      title={`${pet?.name || '宠物'}的成长记录`} 
      safeArea={true} 
      className="bg-gradient-to-b from-gray-50 to-white"
      rightContent={
        <Button size="small" type="primary" onClick={handleAddRecord}>
          +
        </Button>
      }
    >
      <ScrollView className="h-screen pb-8" scrollY>
        {/* 成长趋势卡片 */}
        {trend && (
          <View className="px-4 py-6">
            <Card className="bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200 rounded-2xl p-6">
              <Text className="text-lg font-bold text-gray-900 mb-4 block">
                📈 成长趋势
              </Text>
              
              <View className="grid grid-cols-2 gap-4">
                <View className="text-center">
                  <View className="flex items-center justify-center gap-2 mb-2">
                    <Text className="text-2xl font-bold text-primary-600 block">
                      {trend.weightChange}kg
                    </Text>
                    <Text className="text-lg">
                      {trend.weightTrend === 'up' ? '📈' : trend.weightTrend === 'down' ? '📉' : '➡️'}
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-600 block">体重变化</Text>
                </View>
                
                <View className="text-center">
                  <View className="flex items-center justify-center gap-2 mb-2">
                    <Text className="text-2xl font-bold text-accent-600 block">
                      {trend.heightChange}cm
                    </Text>
                    <Text className="text-lg">
                      {trend.heightTrend === 'up' ? '📈' : trend.heightTrend === 'down' ? '📉' : '➡️'}
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-600 block">身高变化</Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* 记录列表 */}
        <View className="px-4 pb-8">
          {growthRecords.length === 0 ? (
            <Empty
              image="https://img12.360buyimg.com/imagetools/jfs/t1/33761/13/9873/4611/5c9b8c2fE676a2df8/de7dc02b1b76c3d8.png"
              description="还没有成长记录"
            >
              <Button type="primary" onClick={handleAddRecord}>
                添加第一条成长记录
              </Button>
            </Empty>
          ) : (
            <View className="space-y-4">
              {growthRecords.map((record, index) => (
                <Card 
                  key={record.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 active:scale-98 transition-all cursor-pointer"
                  onClick={() => handleRecordAction(record)}
                >
                  <View className="flex justify-between items-start mb-4">
                    <View>
                      <Text className="text-lg font-bold text-gray-900 mb-1 block">
                        成长记录 #{growthRecords.length - index}
                      </Text>
                      <Text className="text-sm text-gray-500 block">
                        {formatDate(record.date)}
                      </Text>
                    </View>
                    <Text className="text-gray-400">⋯</Text>
                  </View>
                  
                  {/* 数据展示 */}
                  <View className="grid grid-cols-2 gap-4 mb-4">
                    <View className="bg-blue-50 rounded-xl p-3 text-center">
                      <Text className="text-2xl font-bold text-blue-600 block">
                        {record.weight}
                      </Text>
                      <Text className="text-xs text-blue-500 block">体重 (kg)</Text>
                    </View>
                    
                    <View className="bg-green-50 rounded-xl p-3 text-center">
                      <Text className="text-2xl font-bold text-green-600 block">
                        {record.height}
                      </Text>
                      <Text className="text-xs text-green-500 block">身高 (cm)</Text>
                    </View>
                  </View>
                  
                  {/* 里程碑标签 */}
                  {record.milestone && (
                    <View className="mb-3">
                      <Tag type="warning" size="small">
                        🏆 {record.milestone}
                      </Tag>
                    </View>
                  )}
                  
                  {/* 备注 */}
                  {record.notes && (
                    <Text className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg block">
                      {record.notes}
                    </Text>
                  )}
                </Card>
              ))}
            </View>
          )}
        </View>

        {/* ActionSheet */}
        <ActionSheet
          visible={showActionSheet}
          options={actionSheetOptions}
          onSelect={handleActionSheetSelect}
          onCancel={() => setShowActionSheet(false)}
        />
      </ScrollView>
    </BasePage>
  )
}

export default GrowthRecords