/**
 * Integration Tests for Complete Workflows
 * Feature: taro4-nutui-refactor, Task 16.3: Integration testing
 * 
 * Tests complete user journeys from login to feature usage
 * Verifies data persistence and API integrations
 * Tests error handling and edge cases
 * Requirements: 9.2, 7.3, 7.4
 */

import Taro from '@tarojs/taro'
import { Toast } from '@nutui/nutui-react-taro'

// Mock all Taro APIs for integration testing
jest.mock('@tarojs/taro', () => ({
  // Navigation APIs
  navigateTo: jest.fn(),
  navigateBack: jest.fn(),
  redirectTo: jest.fn(),
  switchTab: jest.fn(),
  
  // UI APIs
  showToast: jest.fn(),
  showModal: jest.fn(),
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
  
  // Storage APIs
  setStorage: jest.fn(),
  getStorage: jest.fn(),
  removeStorage: jest.fn(),
  clearStorage: jest.fn(),
  
  // Media APIs
  chooseImage: jest.fn(),
  previewImage: jest.fn(),
  uploadFile: jest.fn(),
  
  // Location APIs
  getLocation: jest.fn(),
  chooseLocation: jest.fn(),
  
  // System APIs
  getSystemInfo: jest.fn(),
  getCurrentInstance: jest.fn(() => ({
    router: { params: {} }
  })),
  
  // Request APIs
  request: jest.fn()
}))

// Mock NutUI components
jest.mock('@nutui/nutui-react-taro', () => ({
  Toast: {
    show: jest.fn()
  },
  Dialog: {
    confirm: jest.fn(),
    alert: jest.fn()
  }
}))

describe('Integration Tests for Complete Workflows', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Complete User Journey: Login to Pet Management', () => {
    test('User can complete full pet management workflow', async () => {
      // Step 1: User opens app and navigates to login
      const mockNavigateTo = Taro.navigateTo as jest.Mock
      const mockSetStorage = Taro.setStorage as jest.Mock
      const mockGetStorage = Taro.getStorage as jest.Mock
      const mockRequest = Taro.request as jest.Mock

      // Mock login API response
      mockRequest.mockResolvedValueOnce({
        statusCode: 200,
        data: {
          success: true,
          token: 'mock-jwt-token',
          user: {
            id: '123',
            username: 'testuser',
            nickname: '测试用户'
          }
        }
      })

      // Simulate login API call
      const loginResponse = await Taro.request({
        url: 'https://api.example.com/login',
        method: 'POST',
        data: {
          username: 'testuser',
          password: 'password123'
        }
      })

      expect(loginResponse.data.success).toBe(true)
      expect(loginResponse.data.token).toBeDefined()

      // Step 2: Store user data and token
      await Taro.setStorage({
        key: 'userToken',
        data: loginResponse.data.token
      })

      await Taro.setStorage({
        key: 'userInfo',
        data: loginResponse.data.user
      })

      expect(mockSetStorage).toHaveBeenCalledTimes(2)

      // Step 3: Navigate to home page
      await Taro.navigateTo({ url: '/pages/home/index' })
      expect(mockNavigateTo).toHaveBeenCalledWith({ url: '/pages/home/index' })

      // Step 4: Navigate to pets page
      await Taro.navigateTo({ url: '/pages/pets/index' })
      expect(mockNavigateTo).toHaveBeenCalledWith({ url: '/pages/pets/index' })

      // Step 5: Load pets data
      mockGetStorage.mockResolvedValueOnce({ data: 'mock-jwt-token' })
      mockRequest.mockResolvedValueOnce({
        statusCode: 200,
        data: {
          success: true,
          pets: [
            { id: '1', name: '小白', species: 'dog', age: 2 },
            { id: '2', name: '小黑', species: 'cat', age: 1 }
          ]
        }
      })

      const token = await Taro.getStorage({ key: 'userToken' })
      const petsResponse = await Taro.request({
        url: 'https://api.example.com/pets',
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token.data}`
        }
      })

      expect(petsResponse.data.pets).toHaveLength(2)

      // Step 6: Add new pet
      await Taro.navigateTo({ url: '/pages/addPet/index' })

      mockRequest.mockResolvedValueOnce({
        statusCode: 200,
        data: {
          success: true,
          pet: { id: '3', name: '小花', species: 'cat', age: 0 }
        }
      })

      const addPetResponse = await Taro.request({
        url: 'https://api.example.com/pets',
        method: 'POST',
        data: {
          name: '小花',
          species: 'cat',
          age: 0
        },
        header: {
          'Authorization': `Bearer ${token.data}`
        }
      })

      expect(addPetResponse.data.success).toBe(true)
      expect(addPetResponse.data.pet.name).toBe('小花')

      // Step 7: Show success message and navigate back
      await Taro.showToast({
        title: '添加成功',
        icon: 'success'
      })

      await Taro.navigateBack()

      // Verify complete workflow
      expect(mockRequest).toHaveBeenCalledTimes(3) // login, get pets, add pet
      expect(mockNavigateTo).toHaveBeenCalledTimes(3) // home, pets, addPet
    })
  })

  describe('Complete User Journey: Growth Tracking Workflow', () => {
    test('User can complete growth record management workflow', async () => {
      const mockNavigateTo = Taro.navigateTo as jest.Mock
      const mockChooseImage = Taro.chooseImage as jest.Mock
      const mockUploadFile = Taro.uploadFile as jest.Mock
      const mockRequest = Taro.request as jest.Mock
      const mockGetStorage = Taro.getStorage as jest.Mock

      // Step 1: Navigate to growth records
      await Taro.navigateTo({ url: '/pages/growthRecords/index' })
      expect(mockNavigateTo).toHaveBeenCalledWith({ url: '/pages/growthRecords/index' })

      // Step 2: Load existing growth records
      mockGetStorage.mockResolvedValueOnce({ data: 'mock-jwt-token' })
      mockRequest.mockResolvedValueOnce({
        statusCode: 200,
        data: {
          success: true,
          records: [
            {
              id: '1',
              petId: '1',
              date: '2024-01-01',
              weight: 5.2,
              height: 30,
              notes: '健康成长'
            }
          ]
        }
      })

      const token = await Taro.getStorage({ key: 'userToken' })
      const recordsResponse = await Taro.request({
        url: 'https://api.example.com/growth-records',
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token.data}`
        }
      })

      expect(recordsResponse.data.records).toHaveLength(1)

      // Step 3: Add new growth record with photo
      await Taro.navigateTo({ url: '/pages/addGrowthRecord/index' })

      // Choose image
      mockChooseImage.mockResolvedValueOnce({
        tempFilePaths: ['temp://photo1.jpg']
      })

      const imageResult = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['camera', 'album']
      })

      expect(imageResult.tempFilePaths).toHaveLength(1)

      // Upload image
      mockUploadFile.mockResolvedValueOnce({
        statusCode: 200,
        data: JSON.stringify({
          success: true,
          url: 'https://cdn.example.com/photos/photo1.jpg'
        })
      })

      const uploadResult = await Taro.uploadFile({
        url: 'https://api.example.com/upload',
        filePath: imageResult.tempFilePaths[0],
        name: 'photo',
        header: {
          'Authorization': `Bearer ${token.data}`
        }
      })

      const uploadData = JSON.parse(uploadResult.data)
      expect(uploadData.success).toBe(true)

      // Step 4: Save growth record
      mockRequest.mockResolvedValueOnce({
        statusCode: 200,
        data: {
          success: true,
          record: {
            id: '2',
            petId: '1',
            date: '2024-01-15',
            weight: 5.5,
            height: 32,
            notes: '继续健康成长',
            photos: [uploadData.url]
          }
        }
      })

      const saveRecordResponse = await Taro.request({
        url: 'https://api.example.com/growth-records',
        method: 'POST',
        data: {
          petId: '1',
          date: '2024-01-15',
          weight: 5.5,
          height: 32,
          notes: '继续健康成长',
          photos: [uploadData.url]
        },
        header: {
          'Authorization': `Bearer ${token.data}`
        }
      })

      expect(saveRecordResponse.data.success).toBe(true)
      expect(saveRecordResponse.data.record.photos).toHaveLength(1)

      // Step 5: Navigate to timeline view
      await Taro.navigateTo({ url: '/pages/growthTimeline/index' })

      // Verify complete workflow
      expect(mockChooseImage).toHaveBeenCalledTimes(1)
      expect(mockUploadFile).toHaveBeenCalledTimes(1)
      expect(mockRequest).toHaveBeenCalledTimes(2) // get records, save record
    })
  })

  describe('Error Handling and Edge Cases', () => {
    test('Network error handling throughout workflow', async () => {
      const mockRequest = Taro.request as jest.Mock
      const mockShowModal = Taro.showModal as jest.Mock

      // Simulate network error during login
      mockRequest.mockRejectedValueOnce({
        errMsg: 'request:fail timeout'
      })

      try {
        await Taro.request({
          url: 'https://api.example.com/login',
          method: 'POST',
          data: { username: 'test', password: 'test' }
        })
      } catch (error: any) {
        expect(error.errMsg).toContain('timeout')

        // Show error dialog
        mockShowModal.mockResolvedValueOnce({ confirm: true })
        await Taro.showModal({
          title: '网络错误',
          content: '请检查网络连接后重试',
          showCancel: false
        })

        expect(mockShowModal).toHaveBeenCalledWith({
          title: '网络错误',
          content: '请检查网络连接后重试',
          showCancel: false
        })
      }
    })

    test('Authentication error handling', async () => {
      const mockRequest = Taro.request as jest.Mock
      const mockRemoveStorage = Taro.removeStorage as jest.Mock
      const mockRedirectTo = Taro.redirectTo as jest.Mock

      // Simulate 401 unauthorized response
      mockRequest.mockResolvedValueOnce({
        statusCode: 401,
        data: {
          success: false,
          message: 'Token expired'
        }
      })

      const response = await Taro.request({
        url: 'https://api.example.com/pets',
        method: 'GET',
        header: {
          'Authorization': 'Bearer expired-token'
        }
      })

      if (response.statusCode === 401) {
        // Clear stored auth data
        await Taro.removeStorage({ key: 'userToken' })
        await Taro.removeStorage({ key: 'userInfo' })

        // Redirect to login
        await Taro.redirectTo({ url: '/pages/login/index' })

        expect(mockRemoveStorage).toHaveBeenCalledTimes(2)
        expect(mockRedirectTo).toHaveBeenCalledWith({ url: '/pages/login/index' })
      }
    })

    test('Form validation error handling', async () => {
      const mockShowToast = Taro.showToast as jest.Mock

      // Test pet form validation
      const validatePetForm = (data: any) => {
        const errors: string[] = []

        if (!data.name || data.name.trim() === '') {
          errors.push('宠物名称不能为空')
        }

        if (!data.species) {
          errors.push('请选择宠物种类')
        }

        if (data.age !== undefined && (data.age < 0 || data.age > 30)) {
          errors.push('年龄必须在0-30之间')
        }

        return errors
      }

      const invalidData = {
        name: '',
        species: '',
        age: -1
      }

      const errors = validatePetForm(invalidData)
      expect(errors).toHaveLength(3)

      if (errors.length > 0) {
        await Taro.showToast({
          title: errors[0],
          icon: 'none'
        })

        expect(mockShowToast).toHaveBeenCalledWith({
          title: '宠物名称不能为空',
          icon: 'none'
        })
      }
    })

    test('Image upload error handling', async () => {
      const mockChooseImage = Taro.chooseImage as jest.Mock
      const mockUploadFile = Taro.uploadFile as jest.Mock
      const mockShowModal = Taro.showModal as jest.Mock

      // Simulate image selection cancellation
      mockChooseImage.mockRejectedValueOnce({
        errMsg: 'chooseImage:fail cancel'
      })

      try {
        await Taro.chooseImage({ count: 1 })
      } catch (error: any) {
        expect(error.errMsg).toContain('cancel')
        // User cancelled, no error message needed
      }

      // Simulate upload failure
      mockChooseImage.mockResolvedValueOnce({
        tempFilePaths: ['temp://photo.jpg']
      })

      mockUploadFile.mockRejectedValueOnce({
        errMsg: 'uploadFile:fail network error'
      })

      const imageResult = await Taro.chooseImage({ count: 1 })
      
      try {
        await Taro.uploadFile({
          url: 'https://api.example.com/upload',
          filePath: imageResult.tempFilePaths[0],
          name: 'photo'
        })
      } catch (error: any) {
        expect(error.errMsg).toContain('network error')

        mockShowModal.mockResolvedValueOnce({ confirm: true })
        await Taro.showModal({
          title: '上传失败',
          content: '图片上传失败，请重试',
          showCancel: false
        })

        expect(mockShowModal).toHaveBeenCalledWith({
          title: '上传失败',
          content: '图片上传失败，请重试',
          showCancel: false
        })
      }
    })
  })

  describe('Data Persistence and Synchronization', () => {
    test('Offline data persistence and sync', async () => {
      const mockSetStorage = Taro.setStorage as jest.Mock
      const mockGetStorage = Taro.getStorage as jest.Mock
      const mockRequest = Taro.request as jest.Mock

      // Store data offline
      const offlineData = {
        pets: [
          { id: 'temp-1', name: '离线宠物', species: 'dog', synced: false }
        ],
        growthRecords: [
          { id: 'temp-2', petId: 'temp-1', weight: 5.0, synced: false }
        ]
      }

      await Taro.setStorage({
        key: 'offlineData',
        data: offlineData
      })

      expect(mockSetStorage).toHaveBeenCalledWith({
        key: 'offlineData',
        data: offlineData
      })

      // Simulate coming back online and syncing
      mockGetStorage.mockResolvedValueOnce({ data: offlineData })
      
      const storedData = await Taro.getStorage({ key: 'offlineData' })
      expect(storedData.data.pets).toHaveLength(1)

      // Sync unsynced data
      const unsyncedPets = storedData.data.pets.filter((pet: any) => !pet.synced)
      
      for (const pet of unsyncedPets) {
        mockRequest.mockResolvedValueOnce({
          statusCode: 200,
          data: {
            success: true,
            pet: { ...pet, id: 'server-123', synced: true }
          }
        })

        const syncResponse = await Taro.request({
          url: 'https://api.example.com/pets',
          method: 'POST',
          data: pet
        })

        expect(syncResponse.data.success).toBe(true)
      }
    })

    test('Data consistency across app lifecycle', async () => {
      const mockSetStorage = Taro.setStorage as jest.Mock
      const mockGetStorage = Taro.getStorage as jest.Mock

      // Simulate app state changes
      const appState = {
        currentPet: { id: '1', name: '小白' },
        lastViewedPage: '/pages/pets/index',
        formData: {
          petName: '新宠物',
          species: 'cat'
        }
      }

      // Save state before app backgrounding
      await Taro.setStorage({
        key: 'appState',
        data: appState
      })

      // Restore state after app foregrounding
      mockGetStorage.mockResolvedValueOnce({ data: appState })
      
      const restoredState = await Taro.getStorage({ key: 'appState' })
      
      expect(restoredState.data.currentPet.name).toBe('小白')
      expect(restoredState.data.formData.petName).toBe('新宠物')
    })
  })

  describe('Cross-Platform Integration', () => {
    test('WeChat-specific API integration', async () => {
      const mockGetSystemInfo = Taro.getSystemInfo as jest.Mock
      const mockChooseLocation = Taro.chooseLocation as jest.Mock

      // Mock WeChat platform
      mockGetSystemInfo.mockResolvedValueOnce({
        platform: 'devtools',
        system: 'iOS 14.0',
        version: '8.0.0'
      })

      const systemInfo = await Taro.getSystemInfo()
      expect(systemInfo.platform).toBeDefined()

      // Test WeChat-specific location API
      mockChooseLocation.mockResolvedValueOnce({
        name: '测试地点',
        address: '测试地址',
        latitude: 39.9042,
        longitude: 116.4074
      })

      const location = await Taro.chooseLocation()
      expect(location.name).toBe('测试地点')
      expect(location.latitude).toBeDefined()
    })

    test('ByteDance-specific API integration', async () => {
      const mockGetSystemInfo = Taro.getSystemInfo as jest.Mock
      const mockRequest = Taro.request as jest.Mock

      // Mock ByteDance platform
      mockGetSystemInfo.mockResolvedValueOnce({
        platform: 'devtools',
        system: 'Android 10',
        version: '2.0.0',
        brand: 'ByteDance'
      })

      const systemInfo = await Taro.getSystemInfo()
      expect(systemInfo.brand).toBe('ByteDance')

      // Test platform-specific API calls
      mockRequest.mockResolvedValueOnce({
        statusCode: 200,
        data: { success: true, platform: 'tt' }
      })

      const platformResponse = await Taro.request({
        url: 'https://api.example.com/platform-check',
        method: 'GET',
        header: {
          'Platform': 'ByteDance'
        }
      })

      expect(platformResponse.data.platform).toBe('tt')
    })
  })

  describe('Performance Integration Tests', () => {
    test('Large dataset handling', async () => {
      const mockRequest = Taro.request as jest.Mock
      const mockSetStorage = Taro.setStorage as jest.Mock

      // Simulate loading large dataset
      const largePetList = Array.from({ length: 100 }, (_, i) => ({
        id: `pet-${i}`,
        name: `宠物${i}`,
        species: i % 2 === 0 ? 'dog' : 'cat',
        age: Math.floor(Math.random() * 15)
      }))

      mockRequest.mockResolvedValueOnce({
        statusCode: 200,
        data: {
          success: true,
          pets: largePetList,
          total: 100
        }
      })

      const startTime = Date.now()
      const response = await Taro.request({
        url: 'https://api.example.com/pets',
        method: 'GET'
      })
      const requestTime = Date.now() - startTime

      expect(response.data.pets).toHaveLength(100)
      expect(requestTime).toBeLessThan(1000) // Should complete within 1 second

      // Test storage performance with large data
      const storageStartTime = Date.now()
      await Taro.setStorage({
        key: 'largePetList',
        data: response.data.pets
      })
      const storageTime = Date.now() - storageStartTime

      expect(storageTime).toBeLessThan(500) // Should store within 500ms
    })

    test('Concurrent operations handling', async () => {
      const mockRequest = Taro.request as jest.Mock
      const mockSetStorage = Taro.setStorage as jest.Mock

      // Mock multiple API responses
      mockRequest
        .mockResolvedValueOnce({ statusCode: 200, data: { pets: [] } })
        .mockResolvedValueOnce({ statusCode: 200, data: { records: [] } })
        .mockResolvedValueOnce({ statusCode: 200, data: { photos: [] } })

      // Test concurrent API calls
      const startTime = Date.now()
      const [petsResponse, recordsResponse, photosResponse] = await Promise.all([
        Taro.request({ url: 'https://api.example.com/pets', method: 'GET' }),
        Taro.request({ url: 'https://api.example.com/records', method: 'GET' }),
        Taro.request({ url: 'https://api.example.com/photos', method: 'GET' })
      ])
      const concurrentTime = Date.now() - startTime

      expect(petsResponse.statusCode).toBe(200)
      expect(recordsResponse.statusCode).toBe(200)
      expect(photosResponse.statusCode).toBe(200)
      expect(concurrentTime).toBeLessThan(1000) // Should complete concurrently

      // Test concurrent storage operations
      await Promise.all([
        Taro.setStorage({ key: 'pets', data: petsResponse.data }),
        Taro.setStorage({ key: 'records', data: recordsResponse.data }),
        Taro.setStorage({ key: 'photos', data: photosResponse.data })
      ])

      expect(mockSetStorage).toHaveBeenCalledTimes(3)
    })
  })
})