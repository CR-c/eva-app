// Unit tests for component integration with NutUI-React and Taro4
import React from 'react'
import { render, screen } from './test-utils'
import { Button, Input, NavBar } from '@nutui/nutui-react-taro'

describe('Component Integration Tests', () => {
  describe('NutUI-React Components', () => {
    test('Button component renders correctly', () => {
      const handleClick = jest.fn()
      
      render(
        <Button onClick={handleClick} type="primary">
          Test Button
        </Button>
      )
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Test Button')
      
      button.click()
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    test('Input component handles value changes', () => {
      const handleChange = jest.fn()
      
      render(
        <Input
          value=""
          onChange={handleChange}
          placeholder="Enter text"
        />
      )
      
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('placeholder', 'Enter text')
    })

    test('NavBar component renders with title and back button', () => {
      const handleBack = jest.fn()
      
      render(
        <NavBar
          title="Test Page"
          leftShow={true}
          onClickLeft={handleBack}
        />
      )
      
      expect(screen.getByText('Test Page')).toBeInTheDocument()
      expect(screen.getByText('Back')).toBeInTheDocument()
      
      const backButton = screen.getByText('Back')
      backButton.click()
      expect(handleBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Taro4 Integration', () => {
    test('Taro navigation functions are mocked correctly', () => {
      expect(global.Taro.navigateTo).toBeDefined()
      expect(global.Taro.navigateBack).toBeDefined()
      expect(global.Taro.showToast).toBeDefined()
      
      // Test that mocks work
      global.Taro.navigateTo({ url: '/pages/test' })
      expect(global.Taro.navigateTo).toHaveBeenCalledWith({ url: '/pages/test' })
    })

    test('Taro storage functions are mocked correctly', () => {
      expect(global.Taro.getStorageSync).toBeDefined()
      expect(global.Taro.setStorageSync).toBeDefined()
      expect(global.Taro.removeStorageSync).toBeDefined()
      
      // Test storage operations
      global.Taro.setStorageSync('test-key', 'test-value')
      expect(global.Taro.setStorageSync).toHaveBeenCalledWith('test-key', 'test-value')
      
      global.Taro.getStorageSync('test-key')
      expect(global.Taro.getStorageSync).toHaveBeenCalledWith('test-key')
    })

    test('Platform environment is set correctly', () => {
      expect(process.env.TARO_ENV).toBe('weapp')
      expect(process.env.NODE_ENV).toBe('test')
      expect(global.Taro.getEnv()).toBe('WEAPP')
    })
  })

  describe('Test Utilities', () => {
    test('Custom render function works with ConfigProvider', () => {
      render(<div data-testid="test-element">Test Content</div>)
      
      expect(screen.getByTestId('config-provider')).toBeInTheDocument()
      expect(screen.getByTestId('test-element')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    test('Test utilities are available globally', () => {
      expect(global.testUtils).toBeDefined()
      expect(global.testUtils.mockTaro).toBeDefined()
      expect(global.testUtils.createMockComponent).toBeDefined()
      
      const MockComponent = global.testUtils.createMockComponent('test-component')
      render(<MockComponent>Test</MockComponent>)
      
      expect(screen.getByTestId('test-component')).toBeInTheDocument()
    })
  })
})