#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * 分析打包后的文件大小和依赖关系
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
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// 获取文件大小（字节）
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath)
    return stats.size
  } catch (error) {
    return 0
  }
}

// 格式化文件大小
function formatSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 分析目录大小
function analyzeDirectory(dirPath, name) {
  if (!fs.existsSync(dirPath)) {
    colorLog('yellow', `⚠️  目录不存在: ${dirPath}`)
    return { name, size: 0, files: [] }
  }

  let totalSize = 0
  const files = []

  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath)
    
    for (const item of items) {
      const itemPath = path.join(currentPath, item)
      const stats = fs.statSync(itemPath)
      
      if (stats.isDirectory()) {
        walkDir(itemPath)
      } else {
        const size = stats.size
        totalSize += size
        files.push({
          path: path.relative(dirPath, itemPath),
          size: size,
          formattedSize: formatSize(size)
        })
      }
    }
  }

  walkDir(dirPath)
  
  // 按大小排序
  files.sort((a, b) => b.size - a.size)

  return {
    name,
    size: totalSize,
    formattedSize: formatSize(totalSize),
    files: files.slice(0, 10) // 只显示前10个最大的文件
  }
}

// 分析包依赖大小
function analyzeDependencies() {
  colorLog('cyan', '\n📦 分析依赖包大小...')
  
  try {
    // 读取 package.json
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }
    
    const depSizes = []
    
    for (const [name, version] of Object.entries(dependencies)) {
      const depPath = path.join('node_modules', name)
      if (fs.existsSync(depPath)) {
        const analysis = analyzeDirectory(depPath, `${name}@${version}`)
        depSizes.push(analysis)
      }
    }
    
    // 按大小排序
    depSizes.sort((a, b) => b.size - a.size)
    
    colorLog('bright', '\n📊 依赖包大小排行 (前15个):')
    console.log('─'.repeat(60))
    
    depSizes.slice(0, 15).forEach((dep, index) => {
      const rank = `${index + 1}`.padStart(2, ' ')
      const size = dep.formattedSize.padStart(10, ' ')
      console.log(`${rank}. ${dep.name.padEnd(35, ' ')} ${size}`)
    })
    
    return depSizes
  } catch (error) {
    colorLog('red', `❌ 分析依赖失败: ${error.message}`)
    return []
  }
}

// 分析构建产物
function analyzeBuildOutput() {
  colorLog('cyan', '\n🏗️  分析构建产物...')
  
  const platforms = [
    { name: 'h5', path: 'dist' }, // H5 builds directly to dist
    { name: 'weapp', path: 'dist/weapp' },
    { name: 'tt', path: 'dist/tt' }
  ]
  const results = {}
  
  for (const platform of platforms) {
    const distPath = platform.path
    if (fs.existsSync(distPath)) {
      results[platform.name] = analyzeDirectory(distPath, platform.name)
    }
  }
  
  if (Object.keys(results).length === 0) {
    colorLog('yellow', '⚠️  没有找到构建产物，请先运行构建命令')
    return results
  }
  
  colorLog('bright', '\n📊 构建产物大小:')
  console.log('─'.repeat(60))
  
  for (const [platform, analysis] of Object.entries(results)) {
    colorLog('green', `\n${platform.toUpperCase()} 平台:`)
    console.log(`  总大小: ${analysis.formattedSize}`)
    console.log(`  文件数: ${analysis.files.length}`)
    
    if (analysis.files.length > 0) {
      console.log('  最大文件:')
      analysis.files.slice(0, 5).forEach(file => {
        console.log(`    ${file.path.padEnd(30, ' ')} ${file.formattedSize}`)
      })
    }
  }
  
  return results
}

// 生成优化建议
function generateOptimizationSuggestions(depSizes, buildResults) {
  colorLog('cyan', '\n💡 优化建议:')
  console.log('─'.repeat(60))
  
  // 检查大依赖包
  const largeDeps = depSizes.filter(dep => dep.size > 1024 * 1024) // > 1MB
  if (largeDeps.length > 0) {
    colorLog('yellow', '\n📦 大依赖包优化:')
    largeDeps.slice(0, 5).forEach(dep => {
      console.log(`  • ${dep.name} (${dep.formattedSize}) - 考虑是否可以替换或按需引入`)
    })
  }
  
  // 检查构建产物
  for (const [platform, analysis] of Object.entries(buildResults)) {
    if (analysis.size > 2 * 1024 * 1024) { // > 2MB
      colorLog('yellow', `\n🏗️  ${platform.toUpperCase()} 平台优化:`)
      console.log(`  • 总大小 ${analysis.formattedSize} 较大，建议启用代码分割`)
      
      const largeFiles = analysis.files.filter(file => file.size > 100 * 1024) // > 100KB
      if (largeFiles.length > 0) {
        console.log('  • 大文件:')
        largeFiles.slice(0, 3).forEach(file => {
          console.log(`    - ${file.path} (${file.formattedSize})`)
        })
      }
    }
  }
  
  // 通用优化建议
  colorLog('green', '\n✅ 通用优化建议:')
  console.log('  • 启用 Tree Shaking 移除未使用代码')
  console.log('  • 使用 webpack-bundle-analyzer 详细分析')
  console.log('  • 考虑使用 CDN 加载大型依赖')
  console.log('  • 启用 gzip/brotli 压缩')
  console.log('  • 按需引入组件库')
}

// 主函数
function main() {
  colorLog('bright', '🔍 Eva App 构建分析工具')
  colorLog('bright', '=' .repeat(60))
  
  // 分析依赖
  const depSizes = analyzeDependencies()
  
  // 分析构建产物
  const buildResults = analyzeBuildOutput()
  
  // 生成优化建议
  generateOptimizationSuggestions(depSizes, buildResults)
  
  colorLog('bright', '\n✨ 分析完成!')
  
  // 如果有构建产物，提示可以查看详细报告
  if (Object.keys(buildResults).length > 0) {
    colorLog('cyan', '\n💡 提示: 运行以下命令生成详细的包分析报告:')
    console.log('  pnpm run build:h5:analyze')
    console.log('  pnpm run build:weapp:analyze')
    console.log('  pnpm run build:tt:analyze')
  }
}

// 运行分析
if (require.main === module) {
  main()
}

module.exports = {
  analyzeDirectory,
  analyzeDependencies,
  analyzeBuildOutput,
  generateOptimizationSuggestions
}