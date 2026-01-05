// Test setup file for Jest
import '@testing-library/jest-dom'
import React from 'react'

// Mock Taro APIs for testing
const mockTaro = {
  navigateTo: jest.fn(() => Promise.resolve()),
  navigateBack: jest.fn(() => Promise.resolve()),
  showToast: jest.fn(() => Promise.resolve()),
  showModal: jest.fn(() => Promise.resolve()),
  showLoading: jest.fn(() => Promise.resolve()),
  hideLoading: jest.fn(() => Promise.resolve()),
  getSystemInfo: jest.fn(() => Promise.resolve({
    platform: 'devtools',
    system: 'iOS 10.0.1',
    version: '6.6.3',
    screenWidth: 375,
    screenHeight: 667,
    windowWidth: 375,
    windowHeight: 667,
    pixelRatio: 2
  })),
  getStorageSync: jest.fn(() => ''),
  setStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
  getCurrentInstance: jest.fn(() => ({
    router: {
      params: {}
    }
  })),
  useRouter: jest.fn(() => ({
    params: {}
  })),
  ENV_TYPE: {
    WEAPP: 'WEAPP',
    WEB: 'WEB',
    RN: 'RN',
    SWAN: 'SWAN',
    ALIPAY: 'ALIPAY',
    TT: 'TT',
    QQ: 'QQ',
    JD: 'JD'
  },
  getEnv: jest.fn(() => 'WEAPP')
}

// Mock global Taro
global.Taro = mockTaro
jest.mock('@tarojs/taro', () => mockTaro)

// Mock WeChat APIs
global.wx = {
  ...mockTaro,
  canIUse: jest.fn(() => true)
} as any

// Mock ByteDance APIs
global.tt = {
  ...mockTaro,
  canIUse: jest.fn(() => true)
} as any

// Mock NutUI-React components for testing
jest.mock('@nutui/nutui-react-taro', () => ({
  Button: jest.fn(({ children, onClick, ...props }) => 
    React.createElement('button', { onClick, ...props }, children)
  ),
  Input: jest.fn(({ value, onChange, ...props }) => 
    React.createElement('input', { 
      value, 
      onChange: (e: any) => onChange?.(e.target.value), 
      ...props 
    })
  ),
  Form: jest.fn(({ children, ...props }) => 
    React.createElement('form', props, children)
  ),
  Cell: jest.fn(({ children, ...props }) => 
    React.createElement('div', props, children)
  ),
  NavBar: jest.fn(({ title, onClickLeft, ...props }) => 
    React.createElement('div', props, [
      React.createElement('button', { key: 'back', onClick: onClickLeft }, 'Back'),
      React.createElement('span', { key: 'title' }, title)
    ])
  ),
  Toast: {
    show: jest.fn(),
    hide: jest.fn()
  },
  Dialog: {
    show: jest.fn(),
    hide: jest.fn()
  },
  Loading: jest.fn(({ children, ...props }) => 
    React.createElement('div', props, children)
  ),
  ConfigProvider: jest.fn(({ children }) => children)
}))

// Mock Tailwind CSS classes
jest.mock('tailwindcss', () => ({}))

// Mock process.env for tests
process.env.TARO_ENV = 'weapp'
process.env.NODE_ENV = 'test'

// Global test utilities
global.testUtils = {
  mockTaro,
  createMockComponent: (name: string) => jest.fn(({ children, ...props }) => 
    React.createElement('div', { 'data-testid': name, ...props }, children)
  )
}