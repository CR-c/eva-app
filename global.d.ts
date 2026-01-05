/// <reference types="@tarojs/taro" />

declare module '*.png'
declare module '*.gif'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.svg'
declare module '*.css'
declare module '*.less'
declare module '*.scss'
declare module '*.sass'
declare module '*.styl'

// NutUI-React Taro type extensions
declare module '@nutui/nutui-react-taro' {
  export * from '@nutui/nutui-react-taro/dist/types'
}

// Taro4 global types
declare namespace Taro {
  interface TaroStatic {
    ENV_TYPE: {
      WEAPP: 'WEAPP'
      WEB: 'WEB'
      RN: 'RN'
      SWAN: 'SWAN'
      ALIPAY: 'ALIPAY'
      TT: 'TT'
      QQ: 'QQ'
      JD: 'JD'
    }
    getEnv(): keyof Taro.TaroStatic['ENV_TYPE']
  }
}

// WeChat mini-program specific types
declare namespace WechatMiniprogram {
  interface Wx {
    [key: string]: any
  }
}

// ByteDance mini-program specific types
declare namespace TTMiniprogram {
  interface Tt {
    [key: string]: any
  }
}

// CSS Module types for Tailwind
declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.module.scss' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.module.sass' {
  const classes: { [key: string]: string }
  export default classes
}

// Environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test'
    TARO_ENV: 'weapp' | 'h5' | 'rn' | 'swan' | 'alipay' | 'tt' | 'qq' | 'jd'
  }
}

// Fast-check property testing types
declare module 'fast-check' {
  export * from 'fast-check'
}