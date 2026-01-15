import { View, Text } from '@tarojs/components'
import './index.scss'

interface StatsCardsProps {
  distance: number
  duration: string
}

function StatsCards({ distance, duration }: StatsCardsProps) {
  return (
    <View className='stats-cards'>
      {/* 距离卡片 */}
      <View className='stat-card'>
        <View className='stat-header'>
          <Text className='stat-icon'>🚶‍♂️</Text>
          <Text className='stat-label'>距离</Text>
        </View>
        <View className='stat-value-section'>
          <Text className='stat-value'>{distance.toFixed(1)}</Text>
          <Text className='stat-unit'>公里</Text>
        </View>
      </View>

      {/* 时间卡片 */}
      <View className='stat-card'>
        <View className='stat-header'>
          <Text className='stat-icon'>⏱️</Text>
          <Text className='stat-label'>时长</Text>
        </View>
        <View className='stat-value-section'>
          <Text className='stat-value'>{duration}</Text>
          <Text className='stat-unit'>分钟</Text>
        </View>
      </View>
    </View>
  )
}

export default StatsCards
