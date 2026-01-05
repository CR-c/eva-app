#!/usr/bin/env node

/**
 * Import Optimization Script
 * 优化项目中的导入语句，减少打包体积
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// 颜色输出工具
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// 需要优化的导入模式
const optimizationRules = [
  {
    name: 'NutUI React Taro',
    pattern: /import\s+{([^}]+)}\s+from\s+['"]@nutui\/nutui-react-taro['"]/g,
    replacement: (match, components) => {
      const componentList = components.split(',').map(c => c.trim())
      return componentList.map(component => 
        `import { ${component} } from '@nutui/nutui-react-taro/dist/esm/${component.toLowerCase()}'`
      ).join('\n')
    },
    description: '按需引入 NutUI 组件'
  },
  {
    name: 'Lodash',
    pattern: /import\s+_\s+from\s+['"]lodash['"]/g,
    replacement: () => '// 请使用具体的 lodash 方法: import debounce from \'lodash/debounce\'',
    description: '避免引入整个 lodash 库'
  },
  {
    name: 'Lodash Methods',
    pattern: /import\s+{([^}]+)}\s+from\s+['"]lodash['"]/g,
    replacement: (match, methods) => {
      const methodList = methods.split(',').map(m => m.trim())
      return methodList.map(method => 
        `import ${method} from 'lodash/${method}'`
      ).join('\n')
    },
    description: '按需引入 lodash 方法'
  },
  {
    name: 'Taro Components',
    pattern: /import\s+{([^}]+)}\s+from\s+['"]@tarojs\/components['"]/g,
    replacement: (match, components) => {
      // Taro 组件通常已经优化，但可以检查是否有未使用的组件
      return match
    },
    description: '检查 Taro 组件使用情况'
  }
]

// 扫描文件中的导入语句
function scanImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const imports = []
    
    // 匹配所有 import 语句
    const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"][^'"]+['"]/g
    let match
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push({
        statement: match[0],
        line: content.substring(0, match.index).split('\n').length
      })
    }
    
    return imports
  } catch (error) {
    return []
  }
}

// 分析项目中的导入语句
function analyzeImports(srcDir = 'src') {
  colorLog('cyan', '🔍 分析项目导入语句...')
  
  const results = {
    totalFiles: 0,
    totalImports: 0,
    optimizationOpportunities: [],
    largeImports: [],
    unusedImports: []
  }
  
  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath)
    
    for (const item of items) {
      const itemPath = path.join(currentPath, item)
      const stats = fs.statSync(itemPath)
      
      if (stats.isDirectory() && !item.startsWith('.')) {
        walkDir(itemPath)
      } else if (item.match(/\.(ts|tsx|js|jsx)$/)) {
        results.totalFiles++
        const imports = scanImports(itemPath)
        results.totalImports += imports.length
        
        // 检查优化机会
        const content = fs.readFileSync(itemPath, 'utf8')
        
        for (const rule of optimizationRules) {
          const matches = [...content.matchAll(rule.pattern)]
          if (matches.length > 0) {
            results.optimizationOpportunities.push({
              file: itemPath,
              rule: rule.name,
              matches: matches.length,
              description: rule.description
            })
          }
        }
        
        // 检查大型导入
        imports.forEach(imp => {
          if (imp.statement.includes('*') || imp.statement.length > 100) {
            results.largeImports.push({
              file: itemPath,
              line: imp.line,
              statement: imp.statement
            })
          }
        })
      }
    }
  }
  
  if (fs.existsSync(srcDir)) {
    walkDir(srcDir)
  }
  
  return results
}

// 生成优化建议
function generateImportOptimizations(analysis) {
  colorLog('bright', '\n📊 导入分析结果:')
  console.log('─'.repeat(60))
  console.log(`总文件数: ${analysis.totalFiles}`)
  console.log(`总导入数: ${analysis.totalImports}`)
  
  if (analysis.optimizationOpportunities.length > 0) {
    colorLog('yellow', '\n⚡ 优化机会:')
    analysis.optimizationOpportunities.forEach(opp => {
      console.log(`  📁 ${opp.file}`)
      console.log(`     ${opp.rule}: ${opp.matches} 处可优化`)
      console.log(`     💡 ${opp.description}`)
      console.log()
    })
  }
  
  if (analysis.largeImports.length > 0) {
    colorLog('yellow', '\n🔍 大型导入 (需要检查):')
    analysis.largeImports.slice(0, 10).forEach(imp => {
      console.log(`  📁 ${imp.file}:${imp.line}`)
      console.log(`     ${imp.statement}`)
      console.log()
    })
  }
  
  // 生成具体的优化建议
  colorLog('green', '\n✅ 优化建议:')
  console.log('  1. 使用按需引入减少包大小:')
  console.log('     - NutUI: import { Button } from "@nutui/nutui-react-taro/dist/esm/button"')
  console.log('     - Lodash: import debounce from "lodash/debounce"')
  console.log()
  console.log('  2. 避免使用 import * 语法')
  console.log('  3. 移除未使用的导入语句')
  console.log('  4. 考虑使用动态导入 (import()) 进行代码分割')
}

// 自动优化导入语句
function autoOptimizeImports(srcDir = 'src', dryRun = true) {
  colorLog('cyan', `🔧 ${dryRun ? '模拟' : '执行'}导入优化...`)
  
  const optimizedFiles = []
  
  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath)
    
    for (const item of items) {
      const itemPath = path.join(currentPath, item)
      const stats = fs.statSync(itemPath)
      
      if (stats.isDirectory() && !item.startsWith('.')) {
        walkDir(itemPath)
      } else if (item.match(/\.(ts|tsx|js|jsx)$/)) {
        let content = fs.readFileSync(itemPath, 'utf8')
        let modified = false
        
        // 应用优化规则
        for (const rule of optimizationRules) {
          if (rule.replacement && typeof rule.replacement === 'function') {
            const newContent = content.replace(rule.pattern, (...args) => {
              modified = true
              return rule.replacement(...args)
            })
            content = newContent
          }
        }
        
        if (modified) {
          optimizedFiles.push(itemPath)
          
          if (!dryRun) {
            fs.writeFileSync(itemPath, content, 'utf8')
            colorLog('green', `✅ 优化: ${itemPath}`)
          } else {
            colorLog('yellow', `🔍 可优化: ${itemPath}`)
          }
        }
      }
    }
  }
  
  if (fs.existsSync(srcDir)) {
    walkDir(srcDir)
  }
  
  colorLog('bright', `\n📊 ${dryRun ? '发现' : '完成'} ${optimizedFiles.length} 个文件的导入优化`)
  
  if (dryRun && optimizedFiles.length > 0) {
    colorLog('cyan', '\n💡 运行以下命令执行实际优化:')
    console.log('  node scripts/optimize-imports.js --apply')
  }
  
  return optimizedFiles
}

// 主函数
function main() {
  const args = process.argv.slice(2)
  const shouldApply = args.includes('--apply')
  
  colorLog('bright', '📦 Eva App 导入优化工具')
  colorLog('bright', '=' .repeat(60))
  
  // 分析导入
  const analysis = analyzeImports()
  
  // 生成建议
  generateImportOptimizations(analysis)
  
  // 自动优化
  autoOptimizeImports('src', !shouldApply)
  
  colorLog('bright', '\n✨ 分析完成!')
}

// 运行优化
if (require.main === module) {
  main()
}

module.exports = {
  analyzeImports,
  autoOptimizeImports,
  generateImportOptimizations
}