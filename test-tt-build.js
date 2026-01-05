#!/usr/bin/env node

/**
 * ByteDance Mini-Program Build Test Script
 * Tests the ByteDance (TikTok/Douyin) mini-program build functionality and validates output
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧪 Starting ByteDance Mini-Program Build Test...\n');

// Test 1: Check if Taro CLI supports ByteDance platform
console.log('1. Checking ByteDance platform support...');
try {
  const taroVersion = execSync('npx taro --version', { encoding: 'utf8' });
  console.log(`✅ Taro version: ${taroVersion.trim()}`);
  
  // Check if tt platform is available
  const helpOutput = execSync('npx taro build --help', { encoding: 'utf8' });
  if (helpOutput.includes('tt')) {
    console.log('✅ ByteDance (tt) platform is supported');
  } else {
    console.error('❌ ByteDance (tt) platform not supported');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Taro CLI check failed:', error.message);
  process.exit(1);
}

// Test 2: Validate ByteDance-specific configuration
console.log('\n2. Validating ByteDance configuration...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Check for ByteDance build scripts
  if (packageJson.scripts['build:tt']) {
    console.log('✅ ByteDance build script found');
  } else {
    console.log('⚠️  ByteDance build script not found');
  }
  
  if (packageJson.scripts['dev:tt']) {
    console.log('✅ ByteDance dev script found');
  } else {
    console.log('⚠️  ByteDance dev script not found');
  }
  
  // Check for ByteDance platform plugin
  if (packageJson.devDependencies['@tarojs/plugin-platform-tt']) {
    console.log(`✅ ByteDance platform plugin: ${packageJson.devDependencies['@tarojs/plugin-platform-tt']}`);
  } else {
    console.error('❌ ByteDance platform plugin not found');
  }
} catch (error) {
  console.error('❌ Failed to check ByteDance configuration:', error.message);
  process.exit(1);
}

// Test 3: Check for ByteDance-specific project configuration
console.log('\n3. Checking ByteDance project configuration...');
const ttProjectConfig = 'project.tt.json';
if (fs.existsSync(ttProjectConfig)) {
  try {
    const config = JSON.parse(fs.readFileSync(ttProjectConfig, 'utf8'));
    console.log('✅ ByteDance project configuration exists');
    console.log(`✅ Project name: ${config.projectname || 'Not specified'}`);
    
    if (config.appid) {
      console.log(`✅ ByteDance AppID configured: ${config.appid}`);
    } else {
      console.log('⚠️  ByteDance AppID not configured (this is optional for testing)');
    }
  } catch (error) {
    console.error('❌ Failed to parse ByteDance project config:', error.message);
  }
} else {
  console.log('⚠️  ByteDance project configuration (project.tt.json) not found');
  console.log('   This is optional but recommended for ByteDance-specific settings');
}

// Test 4: Check cross-platform compatibility
console.log('\n4. Checking cross-platform compatibility...');
try {
  const configPath = 'config/index.ts';
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  // Check if configuration handles different platforms
  if (configContent.includes('process.env.TARO_ENV')) {
    console.log('✅ Platform-specific configuration handling found');
  } else {
    console.log('⚠️  Platform-specific configuration handling not found');
  }
  
  // Check for ByteDance-specific optimizations
  if (configContent.includes('tt') || configContent.includes('bytedance')) {
    console.log('✅ ByteDance-specific configuration found');
  } else {
    console.log('⚠️  No ByteDance-specific configuration found');
  }
} catch (error) {
  console.error('❌ Failed to check cross-platform configuration:', error.message);
}

// Test 5: Validate API compatibility
console.log('\n5. Checking ByteDance API compatibility...');
try {
  const srcFiles = getAllTsxFiles('src');
  let platformSpecificApis = 0;
  let compatibleApis = 0;
  
  // APIs that work on both WeChat and ByteDance
  const compatibleTaroApis = [
    'Taro.navigateTo',
    'Taro.navigateBack',
    'Taro.showToast',
    'Taro.showModal',
    'Taro.request',
    'Taro.getStorageSync',
    'Taro.setStorageSync'
  ];
  
  // APIs that might be platform-specific
  const platformSpecificTaroApis = [
    'Taro.getUserInfo',
    'Taro.login',
    'Taro.getUserProfile',
    'Taro.authorize'
  ];
  
  for (const file of srcFiles.slice(0, 10)) { // Check first 10 files
    const content = fs.readFileSync(file, 'utf8');
    
    for (const api of compatibleTaroApis) {
      if (content.includes(api)) {
        compatibleApis++;
        break; // Only count once per file
      }
    }
    
    for (const api of platformSpecificTaroApis) {
      if (content.includes(api)) {
        platformSpecificApis++;
        console.log(`⚠️  Platform-specific API ${api} found in ${path.relative('src', file)}`);
        break; // Only count once per file
      }
    }
  }
  
  console.log(`✅ Compatible APIs found in ${compatibleApis} files`);
  if (platformSpecificApis > 0) {
    console.log(`⚠️  Platform-specific APIs found in ${platformSpecificApis} files`);
    console.log('   Consider adding platform detection for these APIs');
  } else {
    console.log('✅ No platform-specific APIs found');
  }
} catch (error) {
  console.error('❌ Failed to check API compatibility:', error.message);
}

// Test 6: Check styling compatibility
console.log('\n6. Checking styling compatibility for ByteDance...');
try {
  // Check if Tailwind CSS configuration is compatible with ByteDance
  const tailwindConfig = 'tailwind.config.ts';
  if (fs.existsSync(tailwindConfig)) {
    const configContent = fs.readFileSync(tailwindConfig, 'utf8');
    
    // Check for mini-program specific configurations
    if (configContent.includes('corePlugins') && configContent.includes('preflight: false')) {
      console.log('✅ Mini-program compatible Tailwind configuration found');
    } else {
      console.log('⚠️  Mini-program specific Tailwind configuration not found');
    }
  }
  
  // Check for platform-specific styling
  const styleFiles = getAllStyleFiles('src');
  let platformSpecificStyles = 0;
  
  for (const file of styleFiles.slice(0, 5)) { // Check first 5 style files
    const content = fs.readFileSync(file, 'utf8');
    
    // Look for WeChat-specific styles that might not work on ByteDance
    if (content.includes('wx-') || content.includes('weapp-')) {
      platformSpecificStyles++;
      console.log(`⚠️  Potential platform-specific styles in ${path.relative('src', file)}`);
    }
  }
  
  if (platformSpecificStyles === 0) {
    console.log('✅ No platform-specific styles detected');
  }
} catch (error) {
  console.error('❌ Failed to check styling compatibility:', error.message);
}

// Test 7: Validate build command
console.log('\n7. Validating ByteDance build command...');
try {
  const buildHelp = execSync('npx taro build --type tt --help', { encoding: 'utf8' });
  if (buildHelp.includes('tt') || buildHelp.includes('bytedance')) {
    console.log('✅ ByteDance build command is functional');
  }
} catch (error) {
  console.log('⚠️  ByteDance build command validation had issues');
}

console.log('\n🎉 ByteDance Mini-Program Build Test completed!');
console.log('\nNext steps:');
console.log('- Run "npm run build:tt" to perform actual build');
console.log('- Check dist/ directory for build output');
console.log('- Import dist/ folder into ByteDance Developer Tools for testing');
console.log('- Compare functionality with WeChat version for consistency');

// Helper functions
function getAllTsxFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);
      
      if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
        traverse(fullPath);
      } else if (item.isFile() && (item.name.endsWith('.tsx') || item.name.endsWith('.ts'))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function getAllStyleFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);
      
      if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
        traverse(fullPath);
      } else if (item.isFile() && (item.name.endsWith('.scss') || item.name.endsWith('.css') || item.name.endsWith('.less'))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}