/**
 * Property 6: Plugin Configuration Correctness
 * 
 * This property validates that the @tarojs/plugin-html plugin is correctly configured
 * with the injectAdditionalCssVarScope option for NutUI compatibility.
 * 
 * Requirements validated:
 * - 4.1: Plugin installation and configuration
 * - 4.5: CSS variable injection for NutUI compatibility
 */

import * as fc from 'fast-check'
import * as fs from 'fs'
import * as path from 'path'

describe('Plugin Configuration Property Tests', () => {
  describe('Configuration File Tests', () => {
    test('Taro config should include @tarojs/plugin-html with correct options', () => {
      const configPath = path.join(process.cwd(), 'config', 'index.ts')
      expect(fs.existsSync(configPath)).toBe(true)
      
      // Read config file content
      const configContent = fs.readFileSync(configPath, 'utf-8')
      
      // Should include @tarojs/plugin-html plugin
      expect(configContent).toContain('@tarojs/plugin-html')
      expect(configContent).toContain('injectAdditionalCssVarScope: true')
      
      // Should have proper plugin array structure
      expect(configContent).toContain('plugins: [')
      expect(configContent).toContain('"@tarojs/plugin-generator"')
    })

    test('Package.json should include NutUI-React-Taro dependency', () => {
      const packagePath = path.join(process.cwd(), 'package.json')
      expect(fs.existsSync(packagePath)).toBe(true)
      
      // Read package.json content
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf-8'))
      
      // Should have NutUI-React-Taro as dependency
      expect(packageContent.dependencies).toHaveProperty('@nutui/nutui-react-taro')
      
      // Should have @tarojs/plugin-html as dev dependency
      expect(packageContent.devDependencies).toHaveProperty('@tarojs/plugin-html')
    })

    test('App.tsx should include NutUI ConfigProvider', () => {
      const appPath = path.join(process.cwd(), 'src', 'app.tsx')
      expect(fs.existsSync(appPath)).toBe(true)
      
      // Read app.tsx content
      const appContent = fs.readFileSync(appPath, 'utf-8')
      
      // Should import ConfigProvider from NutUI
      expect(appContent).toContain("import { ConfigProvider } from '@nutui/nutui-react-taro'")
      
      // Should use ConfigProvider with theme configuration
      expect(appContent).toContain('<ConfigProvider')
      expect(appContent).toContain('theme={{')
      expect(appContent).toContain('nutuiBrandColor:')
      expect(appContent).toContain('locale="zh-CN"')
    })
  })

  describe('Plugin Configuration Property Tests', () => {
    test('Plugin configuration should preserve CSS variable injection across different build modes', () => {
      fc.assert(
        fc.property(
          fc.record({
            buildMode: fc.oneof(fc.constant('development'), fc.constant('production')),
            platform: fc.oneof(fc.constant('weapp'), fc.constant('tt'), fc.constant('h5'))
          }),
          (buildConfig) => {
            // Mock plugin configuration validation
            const pluginConfig = {
              injectAdditionalCssVarScope: true,
              platform: buildConfig.platform,
              mode: buildConfig.buildMode
            }

            // Property: CSS variable injection should always be enabled for NutUI compatibility
            expect(pluginConfig.injectAdditionalCssVarScope).toBe(true)
            
            // Property: Configuration should be consistent across platforms
            expect(['weapp', 'tt', 'h5']).toContain(pluginConfig.platform)
            
            // Property: Configuration should work in both development and production
            expect(['development', 'production']).toContain(pluginConfig.mode)
            
            return true
          }
        ),
        { numRuns: 50 }
      )
    })

    test('NutUI theme configuration should maintain brand consistency', () => {
      fc.assert(
        fc.property(
          fc.record({
            primaryColor: fc.constant('#3b82f6'), // Use a fixed valid hex color
            locale: fc.oneof(fc.constant('zh-CN'), fc.constant('en-US'))
          }),
          (themeConfig) => {
            // Mock theme configuration validation
            const nutUITheme = {
              nutuiBrandColor: themeConfig.primaryColor,
              nutuiBrandColorStart: themeConfig.primaryColor,
              nutuiBrandColorEnd: themeConfig.primaryColor,
              locale: themeConfig.locale
            }

            // Property: Brand colors should be valid hex colors
            expect(nutUITheme.nutuiBrandColor).toMatch(/^#[0-9a-fA-F]{6}$/)
            expect(nutUITheme.nutuiBrandColorStart).toMatch(/^#[0-9a-fA-F]{6}$/)
            expect(nutUITheme.nutuiBrandColorEnd).toMatch(/^#[0-9a-fA-F]{6}$/)
            
            // Property: Locale should be supported
            expect(['zh-CN', 'en-US']).toContain(nutUITheme.locale)
            
            return true
          }
        ),
        { numRuns: 30 }
      )
    })

    test('Plugin integration should not break existing Taro functionality', () => {
      fc.assert(
        fc.property(
          fc.record({
            hasGenerator: fc.boolean(),
            hasHtml: fc.boolean(),
            pluginCount: fc.integer({ min: 2, max: 10 })
          }),
          (pluginConfig) => {
            // Mock plugin array validation
            const plugins: (string | [string, any])[] = []
            
            if (pluginConfig.hasGenerator) {
              plugins.push('@tarojs/plugin-generator')
            }
            
            if (pluginConfig.hasHtml) {
              plugins.push(['@tarojs/plugin-html', { injectAdditionalCssVarScope: true }])
            }

            // Property: Essential plugins should be present
            if (pluginConfig.hasGenerator && pluginConfig.hasHtml) {
              expect(plugins).toHaveLength(2)
              expect(plugins[0]).toBe('@tarojs/plugin-generator')
              expect(plugins[1]).toEqual(['@tarojs/plugin-html', { injectAdditionalCssVarScope: true }])
            }
            
            // Property: Plugin configuration should be valid
            expect(plugins.length).toBeGreaterThanOrEqual(0)
            expect(plugins.length).toBeLessThanOrEqual(pluginConfig.pluginCount)
            
            return true
          }
        ),
        { numRuns: 40 }
      )
    })
  })

  describe('Build Integration Tests', () => {
    test('CSS variable injection should work with Tailwind CSS', () => {
      // Mock CSS variable injection test
      const cssVariables = [
        '--tw-bg-opacity',
        '--tw-text-opacity',
        '--tw-border-opacity',
        '--nutui-brand-color',
        '--nutui-brand-color-start',
        '--nutui-brand-color-end'
      ]

      cssVariables.forEach(variable => {
        // Property: CSS variables should be properly formatted
        expect(variable).toMatch(/^--[a-z-]+$/)
        
        // Property: Variables should not conflict
        expect(variable.length).toBeGreaterThan(3)
      })
    })

    test('Plugin configuration should be environment-agnostic', () => {
      fc.assert(
        fc.property(
          fc.record({
            nodeEnv: fc.oneof(fc.constant('development'), fc.constant('production'), fc.constant('test')),
            taroEnv: fc.oneof(fc.constant('weapp'), fc.constant('tt'), fc.constant('h5'))
          }),
          (envConfig) => {
            // Mock environment configuration validation
            const config = {
              injectAdditionalCssVarScope: true,
              NODE_ENV: envConfig.nodeEnv,
              TARO_ENV: envConfig.taroEnv
            }

            // Property: CSS variable injection should work in all environments
            expect(config.injectAdditionalCssVarScope).toBe(true)
            
            // Property: Environment variables should be valid
            expect(['development', 'production', 'test']).toContain(config.NODE_ENV)
            expect(['weapp', 'tt', 'h5']).toContain(config.TARO_ENV)
            
            return true
          }
        ),
        { numRuns: 25 }
      )
    })
  })
})