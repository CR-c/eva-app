import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAuth } from '@/hooks/useAuth'
import Skeleton from '@/components/Skeleton'
import './index.scss'

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

  return (
    <View className="menu-page">
      {/* 头部 */}
      <View className="menu-header">
        <View className="header-bg"></View>
        <View className="header-content">
          <Text className="header-title">FUNCTION MENU</Text>
          <Text className="header-subtitle">系统功能模块</Text>
        </View>
      </View>

      {/* 菜单列表 */}
      <View className="menu-container">
        {loading ? (
          <>
            <Skeleton card rows={2} />
            <Skeleton card rows={2} />
            <Skeleton card rows={2} />
          </>
        ) : (
          menuItems.map((item) => (
            <View
              key={item.id}
              className="menu-item"
              onClick={() => handleMenuClick(item)}
            >
              <View className="menu-item-left">
                <View className="menu-icon" style={{ borderColor: item.color }}>
                  <Text className="icon-text">{item.icon}</Text>
                </View>
                <View className="menu-info">
                  <Text className="menu-title">{item.title}</Text>
                  <Text className="menu-desc">{item.desc}</Text>
                </View>
              </View>
              <View className="menu-arrow">
                <View
                  className="arrow-icon"
                  style={{ borderLeftColor: item.color }}
                ></View>
              </View>
              <View
                className="menu-glow"
                style={{ background: `${item.color}22` }}
              ></View>
            </View>
          ))
        )}
      </View>

      {/* 底部信息 */}
      <View className="menu-footer">
        <View className="footer-line"></View>
        <Text className="footer-text">
          TOTAL FUNCTIONS: {menuItems.length}
        </Text>
      </View>
    </View>
  )
}

export default Menu
