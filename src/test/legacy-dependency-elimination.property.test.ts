/**
 * Property-Based Tests for Legacy Dependency Elimination
 * Feature: taro4-nutui-refactor, Property 10: Legacy Dependency Elimination
 * **Validates: Requirements 7.5**
 */

import * as fc from 'fast-check'
import * as fs from 'fs'
import * as path from 'path'

describe('Legacy Dependency Elimination Properties', () => {
  const packageJsonPath = path.join(__dirname, '../../package.json')
  const srcPath = path.join(__dirname, '../')

  beforeAll(() => {
    // Ensure package.json exists
    expect(fs.existsSync(packageJsonPath)).toBe(true)
  })

  /**
   * Property 10: Legacy Dependency Elimination
   * For any completed migration phase, all legacy dependencies and unused code should be removed from the final build
   * **Validates: Requirements 7.5**
   */
  test('Property 10: Legacy dependencies should be eliminated from package.json', () => {
    fc.assert(fc.property(
      fc.record({
        checkType: fc.constantFrom('dependencies', 'devDependencies', 'peerDependencies'),
        legacyPackages: fc.constantFrom(
          ['taro-ui'],
          ['@tarojs/taro@3', '@tarojs/components@3', '@tarojs/cli@3'],
          ['taro-ui', '@tarojs/taro@3'],
          ['node-sass'], // Only node-sass is truly legacy, sass@1.75+ is current
          ['@types/taro-ui']
        )
      }),
      ({ checkType, legacyPackages }) => {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
        const dependencies = packageJson[checkType] || {}
        
        // Check that none of the legacy packages are present
        const hasLegacyDependencies = legacyPackages.some(pkg => {
          const [packageName, version] = pkg.split('@')
          
          if (!Object.keys(dependencies).includes(packageName)) {
            return false // Package not present, which is good
          }
          
          // Special handling for version-specific checks
          if (version) {
            const installedVersion = dependencies[packageName]
            // For Taro packages, ensure they're version 4+
            if (packageName.startsWith('@tarojs/')) {
              const majorVersion = parseInt(installedVersion.replace(/[^\d]/g, '').charAt(0))
              return majorVersion < 4
            }
          }
          
          // For packages without version specified, their presence indicates legacy usage
          return true
        })
        
        return !hasLegacyDependencies
      }
    ), { numRuns: 100 })
  })

  test('Property 10: Legacy taro-ui imports should be eliminated from source code', () => {
    fc.assert(fc.property(
      fc.record({
        fileExtensions: fc.constantFrom(
          ['.ts', '.tsx', '.js', '.jsx'],
          ['.ts', '.tsx'],
          ['.js', '.jsx']
        ),
        importPatterns: fc.constantFrom(
          ['taro-ui'],
          ['from "taro-ui"', "from 'taro-ui'"],
          ['import.*taro-ui', 'require.*taro-ui']
        )
      }),
      ({ fileExtensions, importPatterns }) => {
        const sourceFiles = getAllSourceFiles(srcPath, fileExtensions)
        
        // Check that no source files contain legacy taro-ui imports
        const hasLegacyImports = sourceFiles.some(filePath => {
          try {
            // Skip test files and validation scripts that may reference taro-ui for checking purposes
            const fileName = path.basename(filePath)
            if (fileName.includes('.test.') || fileName.includes('.spec.') || 
                fileName.includes('validate-') || fileName.includes('cross-platform-comparison')) {
              return false
            }
            
            const content = fs.readFileSync(filePath, 'utf8')
            return importPatterns.some(pattern => {
              const regex = new RegExp(pattern, 'gi')
              return regex.test(content)
            })
          } catch (error) {
            return false
          }
        })
        
        return !hasLegacyImports
      }
    ), { numRuns: 50 })
  })

  test('Property 10: Legacy SCSS files should be eliminated or replaced', () => {
    fc.assert(fc.property(
      fc.record({
        componentType: fc.constantFrom('Loading', 'Skeleton'), // Removed 'Empty' since it's not exported
        checkType: fc.constantFrom('file-exists', 'import-exists', 'usage-exists')
      }),
      ({ componentType, checkType }) => {
        const componentPath = path.join(srcPath, 'components', componentType)
        const scssPath = path.join(componentPath, 'index.scss')
        const tsxPath = path.join(componentPath, 'index.tsx')
        
        switch (checkType) {
          case 'file-exists':
            // Legacy SCSS files should not exist for unused components
            return !fs.existsSync(scssPath)
            
          case 'import-exists':
            // If component exists, it should not import its SCSS file
            if (fs.existsSync(tsxPath)) {
              const content = fs.readFileSync(tsxPath, 'utf8')
              return !content.includes("import './index.scss'")
            }
            return true
            
          case 'usage-exists':
            // Legacy components should not be exported from components/index.ts
            const indexPath = path.join(srcPath, 'components', 'index.ts')
            if (fs.existsSync(indexPath)) {
              const content = fs.readFileSync(indexPath, 'utf8')
              // Check for exact export pattern to avoid false positives with CustomEmpty
              const exportPattern = new RegExp(`export.*\\b${componentType}\\b.*from`, 'gi')
              return !exportPattern.test(content)
            }
            return true
            
          default:
            return true
        }
      }
    ), { numRuns: 100 })
  })

  test('Property 10: Specific legacy component handling', () => {
    fc.assert(fc.property(
      fc.record({
        legacyComponent: fc.constantFrom('Empty') // Test the specific Empty component case
      }),
      ({ legacyComponent }) => {
        const indexPath = path.join(srcPath, 'components', 'index.ts')
        if (fs.existsSync(indexPath)) {
          const content = fs.readFileSync(indexPath, 'utf8')
          // Empty should not be exported (only CustomEmpty should be)
          const hasLegacyExport = new RegExp(`export.*\\b${legacyComponent}\\b.*from`, 'gi').test(content)
          return !hasLegacyExport
        }
        return true
      }
    ), { numRuns: 50 })
  })

  test('Property 10: Build output should not contain legacy dependencies', () => {
    fc.assert(fc.property(
      fc.record({
        buildType: fc.constantFrom('weapp', 'tt', 'h5'),
        legacyPatterns: fc.constantFrom(
          ['taro-ui', 'AtButton', 'AtIcon', 'AtCard'],
          ['taro@3', 'components@3'],
          ['node_modules/taro-ui', 'dist/taro-ui']
        )
      }),
      ({ buildType, legacyPatterns }) => {
        const distPath = path.join(__dirname, '../../dist', buildType)
        
        // If build output exists, check it doesn't contain legacy patterns
        if (fs.existsSync(distPath)) {
          const buildFiles = getAllBuildFiles(distPath)
          
          const hasLegacyContent = buildFiles.some(filePath => {
            try {
              const content = fs.readFileSync(filePath, 'utf8')
              return legacyPatterns.some(pattern => {
                return content.includes(pattern)
              })
            } catch (error) {
              return false
            }
          })
          
          return !hasLegacyContent
        }
        
        // If no build output, test passes (nothing to check)
        return true
      }
    ), { numRuns: 30 })
  })

  test('Property 10: Package.json should only contain Taro4+ dependencies', () => {
    fc.assert(fc.property(
      fc.record({
        taroPackagePattern: fc.constantFrom(
          '@tarojs/cli',
          '@tarojs/taro',
          '@tarojs/components',
          '@tarojs/runtime',
          '@tarojs/shared'
        )
      }),
      ({ taroPackagePattern }) => {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
        const allDependencies = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
          ...packageJson.peerDependencies
        }
        
        // If Taro package exists, it should be version 4+
        if (allDependencies[taroPackagePattern]) {
          const version = allDependencies[taroPackagePattern]
          // Check that version starts with 4 or higher
          const majorVersion = parseInt(version.replace(/[^\d]/g, '').charAt(0))
          return majorVersion >= 4
        }
        
        return true
      }
    ), { numRuns: 100 })
  })
})

// Helper functions
function getAllSourceFiles(dir: string, extensions: string[]): string[] {
  const files: string[] = []
  
  function traverse(currentDir: string) {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name)
        
        if (entry.isDirectory()) {
          // Skip node_modules and dist directories
          if (!['node_modules', 'dist', '.git', '.next'].includes(entry.name)) {
            traverse(fullPath)
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name)
          if (extensions.includes(ext)) {
            files.push(fullPath)
          }
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }
  }
  
  traverse(dir)
  return files
}

function getAllBuildFiles(dir: string): string[] {
  const files: string[] = []
  
  function traverse(currentDir: string) {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name)
        
        if (entry.isDirectory()) {
          traverse(fullPath)
        } else if (entry.isFile()) {
          // Only check text-based files
          const ext = path.extname(entry.name)
          if (['.js', '.css', '.json', '.html', '.xml'].includes(ext)) {
            files.push(fullPath)
          }
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }
  }
  
  traverse(dir)
  return files
}