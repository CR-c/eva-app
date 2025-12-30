// Test setup file for Jest
import '@testing-library/jest-dom'

// Mock Taro APIs for testing
global.wx = {
  navigateTo: jest.fn(),
  navigateBack: jest.fn(),
  showToast: jest.fn(),
  showModal: jest.fn(),
  getSystemInfo: jest.fn(() => Promise.resolve({
    platform: 'devtools',
    system: 'iOS 10.0.1',
    version: '6.6.3'
  }))
} as any

global.tt = {
  navigateTo: jest.fn(),
  navigateBack: jest.fn(),
  showToast: jest.fn(),
  showModal: jest.fn(),
  getSystemInfo: jest.fn(() => Promise.resolve({
    platform: 'devtools',
    system: 'iOS 10.0.1',
    version: '6.6.3'
  }))
} as any

// Mock process.env for tests
process.env.TARO_ENV = 'weapp'