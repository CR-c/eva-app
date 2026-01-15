import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import { Card, Loading } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { useAuth } from '@/hooks/useAuth'
import BasePage from '@/components/BasePage'

interface MenuItem {
  id: string
  title: string
  icon: string
  desc: string
  color: string
  path?: string
}

const menuItems: MenuItem[] = [
  {
    id: '1',
    title: 'SYNC MODE',
    icon: '🔄',
    desc: '数据同步',
    color: '#39FF14',
  },
  {
    id: '2',
    title: 'ANALYSIS',
    icon: '📊',
    desc: '数据分析',
    color: '#6A0DAD',
  },
  {
    id: '3',
    title: 'BACKUP',
    icon: '💾',
    desc: '备份管理',
    color: '#FF6600',
  },
  {
    id: '4',
    title: 'SECURITY',
    icon: '🔒',
    desc: '安全中心',
    color: '#39FF14',
  },
  {
    id: '5',
    title: 'TERMINAL',
    icon: '⚡',
    desc: '命令终端',
    color: '#6A0DAD',
  },
  {
    id: '6',
    title: 'SETTINGS',
    icon: '⚙️',
    desc: '系统配置',
    color: '#FF6600',
  },
]

function Menu() {
  useAuth()

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  const handleMenuClick = (item: MenuItem) => {
    Taro.showToast({
      title: `${item.title} - 功能开发中`,
      icon: 'none',
    })
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case '#39FF14':
        return {
          border: 'border-green-400',
          bg: 'bg-green-50',
          text: 'text-green-500',
          glow: 'shadow-green-400/20',
        }
      case '#6A0DAD':
        return {
          border: 'border-purple-500',
          bg: 'bg-purple-50',
          text: 'text-purple-600',
          glow: 'shadow-purple-500/20',
        }
      case '#FF6600':
        return {
          border: 'border-orange-500',
          bg: 'bg-orange-50',
          text: 'text-orange-600',
          glow: 'shadow-orange-500/20',
        }
      default:
        return {
          border: 'border-primary-500',
          bg: 'bg-primary-50',
          text: 'text-primary-600',
          glow: 'shadow-primary-500/20',
        }
    }
  }

  if (loading) {
    return (
      <BasePage title='功能菜单' safeArea className='bg-gradient-to-b from-gray-50 to-white'>
        <View className='flex justify-center items-center h-64'>
          <Loading type='spinner' />
          <Text className='ml-2 text-gray-500'>加载中...</Text>
        </View>
      </BasePage>
    )
  }

  return (
    <BasePage title='功能菜单' safeArea className='bg-gradient-to-b from-gray-50 to-white'>
      <View className='min-h-screen pb-10'>
        {/* 头部 */}
        <View className='relative px-10 pt-15 pb-10 bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden'>
          {/* 背景装饰 */}
          <View className='absolute inset-0 bg-gradient-to-r from-transparent via-primary-500/5 to-transparent opacity-60' />

          <View className='relative z-10 text-center'>
            <Text className='text-2xl font-bold text-primary-500 mb-2 tracking-widest block'>
              FUNCTION MENU
            </Text>
            <Text className='text-base text-gray-600 block'>系统功能模块</Text>
          </View>
        </View>

        {/* 菜单列表 */}
        <View className='px-6 py-8 flex flex-col gap-6'>
          {menuItems.map(item => {
            const colorClasses = getColorClasses(item.color)

            return (
              <Card
                key={item.id}
                className={`relative bg-white border ${colorClasses.border} rounded-2xl p-6 shadow-lg ${colorClasses.glow} active:scale-98 transition-all cursor-pointer overflow-hidden`}
                onClick={() => handleMenuClick(item)}
              >
                {/* 背景光效 */}
                <View
                  className={`absolute inset-0 ${colorClasses.bg} opacity-0 hover:opacity-100 transition-opacity`}
                />

                <View className='relative z-10 flex justify-between items-center'>
                  <View className='flex items-center gap-6 flex-1'>
                    {/* 图标 */}
                    <View
                      className={`w-20 h-20 ${colorClasses.border} border-3 ${colorClasses.bg} rounded-2xl flex items-center justify-center shadow-md`}
                    >
                      <Text className={`text-2xl ${colorClasses.text}`}>{item.icon}</Text>
                    </View>

                    {/* 信息 */}
                    <View className='flex-1'>
                      <Text className='text-lg font-bold text-gray-900 mb-2 tracking-wide block'>
                        {item.title}
                      </Text>
                      <Text className='text-sm text-gray-600 block'>{item.desc}</Text>
                    </View>
                  </View>

                  {/* 箭头 */}
                  <View className='flex items-center'>
                    <View
                      className='w-0 h-0 border-l-4 border-t-2 border-b-2 border-t-transparent border-b-transparent'
                      style={{ borderLeftColor: item.color }}
                    />
                  </View>
                </View>
              </Card>
            )
          })}
        </View>

        {/* 底部信息 */}
        <View className='px-6 mt-5'>
          <View className='h-1 bg-gradient-to-r from-primary-500 via-green-500 to-primary-500 rounded-full mb-5' />
          <Text className='text-center text-primary-500 font-bold tracking-widest block'>
            TOTAL FUNCTIONS: {menuItems.length}
          </Text>
        </View>
      </View>
    </BasePage>
  )
}

export default Menu
