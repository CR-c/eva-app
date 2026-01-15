import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { Button, Tag } from '@nutui/nutui-react-taro'
import Taro, { useDidShow } from '@tarojs/taro'
import { getPetById, getGrowthRecordList, deleteGrowthRecord } from '@/services/pet'
import type { PetVO, GrowthRecord } from '@/constants/types'
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

function GrowthRecords() {
  const navBarInfo = getNavBarInfo()
  const [pet, setPet] = useState<PetVO | null>(null)
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [petId, setPetId] = useState<number | null>(null)

  useEffect(() => {
    const instance = Taro.getCurrentInstance()
    const params = instance.router?.params

    if (params?.petId) {
      const id = parseInt(params.petId)
      setPetId(id)
      loadData(id)
    } else {
      setLoading(false)
    }
  }, [])

  // 页面显示时刷新记录列表
  useDidShow(() => {
    if (petId) {
      loadRecords(petId)
    }
  })

  const loadData = async (id: number) => {
    try {
      const petData = await getPetById(id)
      setPet(petData)
      await loadRecords(id)
    } catch (error) {
      console.error('Failed to load data:', error)
      Taro.showToast({ title: '加载数据失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const loadRecords = async (id: number) => {
    try {
      const result = await getGrowthRecordList(id, { pageSize: 100 })
      // 按日期降序排序
      const sorted = (result.list || []).sort(
        (a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()
      )
      setGrowthRecords(sorted)
    } catch (error) {
      console.error('Failed to load records:', error)
    }
  }

  const handleBack = () => {
    Taro.navigateBack()
  }

  const handleAddRecord = () => {
    if (petId) {
      Taro.navigateTo({
        url: `/pages/addGrowthRecord/index?petId=${petId}`,
      })
    }
  }

  const handleRecordAction = (record: GrowthRecord) => {
    Taro.showActionSheet({
      itemList: ['编辑记录', '删除记录'],
      success: res => {
        switch (res.tapIndex) {
          case 0:
            Taro.navigateTo({
              url: `/pages/addGrowthRecord/index?petId=${petId}&recordId=${record.id}&mode=edit`,
            })
            break
          case 1:
            handleDeleteRecord(record.id)
            break
        }
      },
    })
  }

  const handleDeleteRecord = (recordId: number) => {
    Taro.showModal({
      title: '删除记录',
      content: '确定要删除这条成长记录吗？',
      success: async res => {
        if (res.confirm && petId) {
          try {
            await deleteGrowthRecord(petId, recordId)
            setGrowthRecords(prev => prev.filter(r => r.id !== recordId))
            Taro.showToast({ title: '删除成功', icon: 'success' })
          } catch (error) {
            console.error('Delete record failed:', error)
          }
        }
      },
    })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getGrowthTrend = () => {
    // 只统计有体重或身高数据的记录
    const recordsWithData = growthRecords.filter(r => r.weight || r.height)
    if (recordsWithData.length < 2) return null

    const sortedRecords = [...recordsWithData].sort(
      (a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime()
    )

    const latest = sortedRecords[sortedRecords.length - 1]
    const previous = sortedRecords[sortedRecords.length - 2]

    const weightChange = (latest.weight || 0) - (previous.weight || 0)
    const heightChange = (latest.height || 0) - (previous.height || 0)

    return {
      weightChange: weightChange.toFixed(1),
      heightChange: heightChange.toFixed(1),
      weightTrend: weightChange > 0 ? 'up' : weightChange < 0 ? 'down' : 'stable',
      heightTrend: heightChange > 0 ? 'up' : heightChange < 0 ? 'down' : 'stable',
    }
  }

  const trend = getGrowthTrend()

  if (loading) {
    return (
      <View className='min-h-screen bg-[#f5f7f8]'>
        {/* 自定义导航栏 */}
        <View
          className='bg-white'
          style={{
            paddingTop: `${navBarInfo.statusBarHeight}px`,
            borderBottom: '2rpx solid #f1f5f9',
          }}
        >
          <View
            className='flex items-center justify-between'
            style={{
              padding: '0 32rpx',
              height: `${navBarInfo.navBarHeight}px`,
            }}
          >
            <View
              className='flex items-center justify-center bg-[#f1f5f9]'
              style={{ width: '72rpx', height: '72rpx', borderRadius: '36rpx' }}
              onClick={handleBack}
            >
              <Text style={{ fontSize: '32rpx', color: '#0d171c' }}>←</Text>
            </View>
            <Text className='font-bold text-[#0d171c]' style={{ fontSize: '32rpx' }}>
              成长记录
            </Text>
            <View style={{ width: '72rpx' }} />
          </View>
        </View>

        {/* 加载骨架屏 */}
        <View style={{ padding: '48rpx 32rpx' }}>
          <View
            className='bg-[#e2e8f0]'
            style={{
              height: '200rpx',
              borderRadius: '24rpx',
              marginBottom: '32rpx',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          {[1, 2, 3].map(i => (
            <View
              key={i}
              className='bg-[#e2e8f0]'
              style={{
                height: '260rpx',
                borderRadius: '24rpx',
                marginBottom: '24rpx',
              }}
            />
          ))}
        </View>
      </View>
    )
  }

  return (
    <View className='min-h-screen bg-[#f5f7f8]'>
      {/* 自定义导航栏 */}
      <View
        className='bg-white'
        style={{
          paddingTop: `${navBarInfo.statusBarHeight}px`,
          borderBottom: '2rpx solid #f1f5f9',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <View
          className='flex items-center justify-between'
          style={{
            padding: '0 32rpx',
            height: `${navBarInfo.navBarHeight}px`,
          }}
        >
          <View
            className='flex items-center justify-center bg-[#f1f5f9]'
            style={{ width: '72rpx', height: '72rpx', borderRadius: '36rpx' }}
            onClick={handleBack}
          >
            <Text style={{ fontSize: '32rpx', color: '#0d171c' }}>←</Text>
          </View>
          <View className='flex flex-col items-center'>
            <Text className='font-bold text-[#0d171c]' style={{ fontSize: '32rpx' }}>
              {pet?.name || '宠物'}的成长记录
            </Text>
            <Text className='text-[#25aff4]' style={{ fontSize: '24rpx' }}>
              共{growthRecords.length}条记录
            </Text>
          </View>
          <View
            className='flex items-center justify-center bg-[#eff6ff]'
            style={{ width: '72rpx', height: '72rpx', borderRadius: '36rpx' }}
            onClick={handleAddRecord}
          >
            <Text style={{ fontSize: '32rpx', color: '#25aff4' }}>+</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY style={{ height: `calc(100vh - ${navBarInfo.totalHeight}px)` }}>
        {/* 成长趋势卡片 */}
        {trend && (
          <View style={{ padding: '32rpx' }}>
            <View
              className='bg-white'
              style={{
                borderRadius: '24rpx',
                padding: '32rpx',
                boxShadow: '0 4rpx 24rpx rgba(0,0,0,0.06)',
              }}
            >
              <View className='flex items-center' style={{ marginBottom: '24rpx' }}>
                <Text style={{ fontSize: '32rpx', marginRight: '12rpx' }}>📈</Text>
                <Text className='font-bold text-[#0d171c]' style={{ fontSize: '30rpx' }}>
                  成长趋势
                </Text>
              </View>

              <View className='flex' style={{ gap: '24rpx' }}>
                <View
                  className='flex-1 text-center'
                  style={{
                    background: '#eff6ff',
                    borderRadius: '16rpx',
                    padding: '24rpx',
                  }}
                >
                  <View
                    className='flex items-center justify-center'
                    style={{ gap: '8rpx', marginBottom: '8rpx' }}
                  >
                    <Text className='font-bold text-[#25aff4]' style={{ fontSize: '36rpx' }}>
                      {trend.weightChange}kg
                    </Text>
                    <Text style={{ fontSize: '28rpx' }}>
                      {trend.weightTrend === 'up'
                        ? '📈'
                        : trend.weightTrend === 'down'
                          ? '📉'
                          : '➡️'}
                    </Text>
                  </View>
                  <Text className='text-[#64748b]' style={{ fontSize: '24rpx' }}>
                    体重变化
                  </Text>
                </View>

                <View
                  className='flex-1 text-center'
                  style={{
                    background: '#f0fdf4',
                    borderRadius: '16rpx',
                    padding: '24rpx',
                  }}
                >
                  <View
                    className='flex items-center justify-center'
                    style={{ gap: '8rpx', marginBottom: '8rpx' }}
                  >
                    <Text className='font-bold text-[#22c55e]' style={{ fontSize: '36rpx' }}>
                      {trend.heightChange}cm
                    </Text>
                    <Text style={{ fontSize: '28rpx' }}>
                      {trend.heightTrend === 'up'
                        ? '📈'
                        : trend.heightTrend === 'down'
                          ? '📉'
                          : '➡️'}
                    </Text>
                  </View>
                  <Text className='text-[#64748b]' style={{ fontSize: '24rpx' }}>
                    身高变化
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* 记录列表 */}
        <View style={{ padding: '0 32rpx 64rpx' }}>
          {growthRecords.length === 0 ? (
            <View
              className='flex flex-col items-center justify-center text-center'
              style={{ minHeight: '500rpx' }}
            >
              <Text style={{ fontSize: '120rpx', marginBottom: '32rpx', opacity: 0.6 }}>📊</Text>
              <Text
                className='font-bold text-[#0d171c]'
                style={{ fontSize: '32rpx', marginBottom: '16rpx' }}
              >
                还没有成长记录
              </Text>
              <Text
                className='text-[#64748b]'
                style={{
                  fontSize: '26rpx',
                  lineHeight: '40rpx',
                  maxWidth: '400rpx',
                  marginBottom: '32rpx',
                }}
              >
                记录{pet?.name || '宠物'}的体重、身高等成长数据
              </Text>
              <Button
                type='primary'
                onClick={handleAddRecord}
                style={{
                  height: '88rpx',
                  borderRadius: '44rpx',
                  background: '#25aff4',
                  paddingLeft: '48rpx',
                  paddingRight: '48rpx',
                }}
              >
                <Text className='text-white font-bold' style={{ fontSize: '28rpx' }}>
                  添加第一条成长记录
                </Text>
              </Button>
            </View>
          ) : (
            <View style={{ display: 'flex', flexDirection: 'column', gap: '24rpx' }}>
              {growthRecords.map((record, index) => (
                <View
                  key={record.id}
                  className='bg-white'
                  style={{
                    borderRadius: '24rpx',
                    padding: '32rpx',
                    boxShadow: '0 4rpx 16rpx rgba(0,0,0,0.04)',
                  }}
                  onClick={() => handleRecordAction(record)}
                >
                  <View
                    className='flex items-center justify-between'
                    style={{ marginBottom: '20rpx' }}
                  >
                    <View>
                      <Text
                        className='block font-bold text-[#0d171c]'
                        style={{ fontSize: '28rpx', marginBottom: '4rpx' }}
                      >
                        成长记录 #{growthRecords.length - index}
                      </Text>
                      <Text className='block text-[#64748b]' style={{ fontSize: '24rpx' }}>
                        {formatDate(record.recordDate)}
                      </Text>
                    </View>
                    <Text className='text-[#94a3b8]' style={{ fontSize: '32rpx' }}>
                      ⋯
                    </Text>
                  </View>

                  {/* 数据展示 */}
                  <View className='flex' style={{ gap: '16rpx', marginBottom: '20rpx' }}>
                    {record.weight && (
                      <View
                        className='flex-1 text-center'
                        style={{
                          background: '#eff6ff',
                          borderRadius: '16rpx',
                          padding: '20rpx',
                        }}
                      >
                        <Text
                          className='block font-bold text-[#25aff4]'
                          style={{ fontSize: '32rpx' }}
                        >
                          {record.weight}
                        </Text>
                        <Text className='block text-[#64748b]' style={{ fontSize: '22rpx' }}>
                          体重 (kg)
                        </Text>
                      </View>
                    )}

                    {record.height && (
                      <View
                        className='flex-1 text-center'
                        style={{
                          background: '#f0fdf4',
                          borderRadius: '16rpx',
                          padding: '20rpx',
                        }}
                      >
                        <Text
                          className='block font-bold text-[#22c55e]'
                          style={{ fontSize: '32rpx' }}
                        >
                          {record.height}
                        </Text>
                        <Text className='block text-[#64748b]' style={{ fontSize: '22rpx' }}>
                          身高 (cm)
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* 里程碑标签 */}
                  {record.milestone && (
                    <View style={{ marginBottom: '16rpx' }}>
                      <Tag type='warning'>🏆 {record.milestone}</Tag>
                    </View>
                  )}

                  {/* 备注 */}
                  {record.notes && (
                    <View
                      style={{
                        background: '#f8fafc',
                        borderRadius: '12rpx',
                        padding: '20rpx',
                      }}
                    >
                      <Text
                        className='text-[#475569]'
                        style={{ fontSize: '26rpx', lineHeight: '40rpx' }}
                      >
                        {record.notes}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default GrowthRecords
