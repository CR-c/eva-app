#!/usr/bin/env node

/**
 * WeChat Mini-Program Functionality Validation Script
 * Validates WeChat-specific functionality without full build
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating WeChat Mini-Program Functionality...\n');

// Test 1: Validate app configuration
console.log('1. Validating app configuration...');
try {
  const appConfigPath = 'src/app.config.ts';
  if (fs.existsSync(appConfigPath)) {
    const appConfig = fs.readFileSync(appConfigPath, 'utf8');
    console.log('✅ App configuration file exists');
    
    // Check for pages configuration
    if (appConfig.includes('pages')) {
      console.log('✅ Pages configuration found');
    } else {
      console.log('⚠️  Pages configuration not found');
    }
    
    // Check for tabBar configuration
    if (appConfig.includes('tabBar')) {
      console.log('✅ TabBar configuration found');
    } else {
      console.log('⚠️  TabBar configuration not found');
    }
  } else {
    console.error('❌ App configuration file missing');
  }
} catch (error) {
  console.error('❌ Failed to validate app configuration:', error.message);
}

// Test 2: Check page components
console.log('\n2. Checking page components...');
const pagesDir = 'src/pages';
if (fs.existsSync(pagesDir)) {
  const pages = fs.readdirSync(pagesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  console.log(`✅ Found ${pages.length} page directories:`, pages.join(', '));
  
  // Check each page for required files
  for (const page of pages.slice(0, 5)) { // Check first 5 pages
    const pageDir = path.join(pagesDir, page);
    const indexFile = path.join(pageDir, 'index.tsx');
    const configFile = path.join(pageDir, 'index.config.ts');
    
    if (fs.existsSync(indexFile)) {
      console.log(`✅ ${page}/index.tsx exists`);
    } else {
      console.log(`⚠️  ${page}/index.tsx missing`);
    }
    
    if (fs.existsSync(configFile)) {
      console.log(`✅ ${page}/index.config.ts exists`);
    } else {
      console.log(`⚠️  ${page}/index.config.ts missing`);
    }
  }
} else {
  console.error('❌ Pages directory not found');
}

// Test 3: Check NutUI-React integration
console.log('\n3. Checking NutUI-React integration...');
try {
  const appFile = 'src/app.tsx';
  if (fs.existsSync(appFile)) {
    const appContent = fs.readFileSync(appFile, 'utf8');
    
    if (appContent.includes('@nutui/nutui-react-taro')) {
      console.log('✅ NutUI-React import found in app.tsx');
    } else {
      console.log('⚠️  NutUI-React import not found in app.tsx');
    }
    
    if (appContent.includes('ConfigProvider')) {
      console.log('✅ NutUI ConfigProvider found');
    } else {
      console.log('⚠️  NutUI ConfigProvider not found');
    }
  }
} catch (error) {
  console.error('❌ Failed to check NutUI integration:', error.message);
}

// Test 4: Check Tailwind CSS integration
console.log('\n4. Checking Tailwind CSS integration...');
try {
  const tailwindConfig = 'tailwind.config.ts';
  if (fs.existsSync(tailwindConfig)) {
    console.log('✅ Tailwind config file exists');
    
    const configContent = fs.readFileSync(tailwindConfig, 'utf8');
    if (configContent.includes('weapp-tailwindcss')) {
      console.log('✅ weapp-tailwindcss integration found');
    } else {
      console.log('⚠️  weapp-tailwindcss integration not found');
    }
  } else {
    console.log('⚠️  Tailwind config file not found');
  }
  
  // Check for Tailwind CSS usage in components
  const samplePages = ['src/pages/home/index.tsx', 'src/pages/login/index.tsx'];
  for (const pagePath of samplePages) {
    if (fs.existsSync(pagePath)) {
      const pageContent = fs.readFileSync(pagePath, 'utf8');
      if (pageContent.includes('className=') && (pageContent.includes('bg-') || pageContent.includes('text-') || pageContent.includes('p-') || pageContent.includes('m-'))) {
        console.log(`✅ Tailwind classes found in ${path.basename(path.dirname(pagePath))}`);
      } else {
        console.log(`⚠️  No Tailwind classes found in ${path.basename(path.dirname(pagePath))}`);
      }
    }
  }
} catch (error) {
  console.error('❌ Failed to check Tailwind integration:', error.message);
}

// Test 5: Check WeChat-specific APIs usage
console.log('\n5. Checking WeChat-specific APIs usage...');
try {
  const srcFiles = getAllTsxFiles('src');
  let wechatApiUsage = 0;
  
  const wechatApis = [
    'Taro.navigateTo',
    'Taro.navigateBack',
    'Taro.showToast',
    'Taro.showModal',
    'Taro.request',
    'Taro.getStorageSync',
    'Taro.setStorageSync',
    'Taro.getUserInfo',
    'Taro.login'
  ];
  
  for (const file of srcFiles.slice(0, 10)) { // Check first 10 files
    const content = fs.readFileSync(file, 'utf8');
    for (const api of wechatApis) {
      if (content.includes(api)) {
        wechatApiUsage++;
        console.log(`✅ Found ${api} in ${path.relative('src', file)}`);
        break; // Only count once per file
      }
    }
  }
  
  if (wechatApiUsage > 0) {
    console.log(`✅ WeChat APIs are being used in ${wechatApiUsage} files`);
  } else {
    console.log('⚠️  No WeChat API usage found (this may be normal)');
  }
} catch (error) {
  console.error('❌ Failed to check WeChat API usage:', error.message);
}

// Test 6: Validate component migration status
console.log('\n6. Checking component migration status...');
try {
  const srcFiles = getAllTsxFiles('src');
  let nutUIUsage = 0;
  let taroUIUsage = 0;
  
  for (const file of srcFiles.slice(0, 15)) { // Check first 15 files
    const content = fs.readFileSync(file, 'utf8');
    
    if (content.includes('@nutui/nutui-react-taro')) {
      nutUIUsage++;
    }
    
    if (content.includes('taro-ui')) {
      taroUIUsage++;
    }
  }
  
  console.log(`✅ NutUI-React usage found in ${nutUIUsage} files`);
  if (taroUIUsage > 0) {
    console.log(`⚠️  Legacy Taro UI usage still found in ${taroUIUsage} files`);
  } else {
    console.log('✅ No legacy Taro UI usage found');
  }
} catch (error) {
  console.error('❌ Failed to check component migration:', error.message);
}

console.log('\n🎯 WeChat Mini-Program Functionality Validation completed!');

// Helper function to get all TSX files
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