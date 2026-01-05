// Test utilities for NutUI-React components
import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ConfigProvider } from '@nutui/nutui-react-taro'

// Mock ConfigProvider for testing
const MockConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div data-testid="config-provider">
      {children}
    </div>
  )
}

// Custom render function that includes NutUI-React providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <MockConfigProvider>
        {children}
      </MockConfigProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

// Test utilities for Taro4 components
export const taroTestUtils = {
  // Mock Taro navigation
  mockNavigation: () => {
    const navigateTo = jest.fn()
    const navigateBack = jest.fn()
    
    global.Taro.navigateTo = navigateTo
    global.Taro.navigateBack = navigateBack
    
    return { navigateTo, navigateBack }
  },

  // Mock Taro storage
  mockStorage: () => {
    const storage = new Map<string, any>()
    
    global.Taro.getStorageSync = jest.fn((key: string) => storage.get(key) || '')
    global.Taro.setStorageSync = jest.fn((key: string, value: any) => storage.set(key, value))
    global.Taro.removeStorageSync = jest.fn((key: string) => storage.delete(key))
    
    return storage
  },

  // Mock Taro system info
  mockSystemInfo: (info: Partial<any> = {}) => {
    const defaultInfo = {
      platform: 'devtools',
      system: 'iOS 10.0.1',
      version: '6.6.3',
      screenWidth: 375,
      screenHeight: 667,
      windowWidth: 375,
      windowHeight: 667,
      pixelRatio: 2,
      ...info
    }
    
    global.Taro.getSystemInfo = jest.fn(() => Promise.resolve(defaultInfo))
    
    return defaultInfo
  }
}

// NutUI-React component test utilities
export const nutUITestUtils = {
  // Helper to test form components
  expectFormComponent: (element: HTMLElement) => {
    expect(element).toBeInTheDocument()
    expect(element).toBeVisible()
  },

  // Helper to test button interactions
  expectButtonInteraction: (button: HTMLElement, onClick: jest.Mock) => {
    expect(button).toBeInTheDocument()
    expect(button).not.toBeDisabled()
    
    button.click()
    expect(onClick).toHaveBeenCalled()
  },

  // Helper to test navigation components
  expectNavigationComponent: (element: HTMLElement, title?: string) => {
    expect(element).toBeInTheDocument()
    if (title) {
      expect(element).toHaveTextContent(title)
    }
  }
}

// Re-export everything from testing-library
export * from '@testing-library/react'

// Override the default render with our custom render
export { customRender as render }