import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  corePlugins: {
    // 禁用小程序不支持的功能
    preflight: false,
    container: false
  },
  theme: {
    extend: {
      colors: {
        // Eva app 品牌色彩
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // 主色
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a'
        },
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // 辅助色
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d'
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // 强调色
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12'
        }
      },
      spacing: {
        // 小程序安全区域
        'safe-top': 'var(--safe-area-inset-top, 0px)',
        'safe-bottom': 'var(--safe-area-inset-bottom, 0px)',
        'safe-left': 'var(--safe-area-inset-left, 0px)',
        'safe-right': 'var(--safe-area-inset-right, 0px)'
      },
      fontSize: {
        // 小程序适配的字体大小
        'xs': ['24rpx', { lineHeight: '32rpx' }],
        'sm': ['28rpx', { lineHeight: '40rpx' }],
        'base': ['32rpx', { lineHeight: '48rpx' }],
        'lg': ['36rpx', { lineHeight: '52rpx' }],
        'xl': ['40rpx', { lineHeight: '56rpx' }],
        '2xl': ['48rpx', { lineHeight: '64rpx' }],
        '3xl': ['60rpx', { lineHeight: '72rpx' }]
      },
      borderRadius: {
        // 小程序常用圆角
        'mini': '4rpx',
        'small': '8rpx',
        'medium': '12rpx',
        'large': '16rpx',
        'xl': '24rpx'
      }
    }
  },
  plugins: []
} satisfies Config