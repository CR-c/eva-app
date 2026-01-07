/** @type {import('tailwindcss').Config} */
module.exports = {
  // 这里给出了一份 taro 通用示例，具体要根据你自己项目的目录结构进行配置
  // 比如你使用 vue3 项目，你就需要把 vue 这个格式也包括进来
  // 不在 content glob 表达式中包括的文件，在里面编写 tailwindcss class，是不会生成对应的 css 工具类的
  content: ['./public/index.html', './src/**/*.{html,js,ts,jsx,tsx}'],
  theme: {
    // 覆盖默认字体大小，适配小程序（基于 750 设计稿）
    // rem2rpx 会将 rem 转换为 rpx (1rem = 32rpx)
    // 所以这里的值会被放大 2 倍显示
    fontSize: {
      'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px -> 24rpx
      'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px -> 28rpx
      'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px -> 32rpx
      'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px -> 36rpx
      'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px -> 40rpx
      '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px -> 48rpx
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px -> 60rpx
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px -> 72rpx
      '5xl': ['3rem', { lineHeight: '1' }],           // 48px -> 96rpx
    },
    extend: {
      colors: {
        // Eva app 品牌色彩 - 蓝白清新风格
        primary: {
          50: '#e6f7ff',
          100: '#bae7ff',
          200: '#91d5ff',
          300: '#69c0ff',
          400: '#40a9ff',
          500: '#25aff4', // 主色 - 天空蓝
          600: '#1890ff',
          700: '#096dd9',
          800: '#0050b3',
          900: '#003a8c'
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
      }
    }
  },
  corePlugins: {
    // 小程序不需要 preflight，因为这主要是给 h5 的，如果你要同时开发多端，你应该使用 process.env.TARO_ENV 环境变量来控制它
    preflight: false,
  },
}
