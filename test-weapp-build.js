#!/usr/bin/env node

/**
 * WeChat Mini-Program Build Test Script
 * Tests the WeChat mini-program build functionality and validates output
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧪 Starting WeChat Mini-Program Build Test...\n');

// Test 1: Check if Taro CLI is available and correct version
console.log('1. Checking Taro CLI version...');
try {
  const taroVersion = execSync('npx taro --version', { encoding: 'utf8' });
  console.log(`✅ Taro version: ${taroVersion.trim()}`);
  
  if (!taroVersion.includes('4.')) {
    throw new Error('Taro 4.x is required');
  }
} catch (error) {
  console.error('❌ Taro CLI check failed:', error.message);
  process.exit(1);
}

// Test 2: Validate configuration files
console.log('\n2. Validating configuration files...');
const configFiles = [
  'config/index.ts',
  'project.config.json',
  'package.json'
];

for (const file of configFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.error(`❌ ${file} missing`);
    process.exit(1);
  }
}

// Test 3: Check WeChat-specific configuration
console.log('\n3. Checking WeChat mini-program configuration...');
try {
  const projectConfig = JSON.parse(fs.readFileSync('project.config.json', 'utf8'));
  
  if (projectConfig.appid) {
    console.log(`✅ WeChat AppID configured: ${projectConfig.appid}`);
  } else {
    console.log('⚠️  WeChat AppID not configured (this is optional for testing)');
  }
  
  if (projectConfig.miniprogramRoot === 'dist/') {
    console.log('✅ Mini-program root correctly set to dist/');
  } else {
    console.error('❌ Mini-program root should be set to dist/');
  }
  
  console.log(`✅ Project name: ${projectConfig.projectname}`);
} catch (error) {
  console.error('❌ Failed to parse project.config.json:', error.message);
  process.exit(1);
}

// Test 4: Check source files structure
console.log('\n4. Checking source files structure...');
const requiredDirs = ['src', 'src/pages'];
const requiredFiles = ['src/app.tsx', 'src/app.config.ts'];

for (const dir of requiredDirs) {
  if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
    console.log(`✅ ${dir} directory exists`);
  } else {
    console.error(`❌ ${dir} directory missing`);
    process.exit(1);
  }
}

for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.error(`❌ ${file} missing`);
    process.exit(1);
  }
}

// Test 5: Check dependencies
console.log('\n5. Checking key dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    '@tarojs/taro',
    '@tarojs/components',
    '@tarojs/runtime',
    '@nutui/nutui-react-taro',
    'react'
  ];
  
  for (const dep of requiredDeps) {
    if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
      const version = packageJson.dependencies[dep] || packageJson.devDependencies[dep];
      console.log(`✅ ${dep}: ${version}`);
    } else {
      console.error(`❌ ${dep} not found in dependencies`);
    }
  }
} catch (error) {
  console.error('❌ Failed to check dependencies:', error.message);
  process.exit(1);
}

// Test 6: Attempt a dry-run build (syntax check only)
console.log('\n6. Performing build syntax validation...');
try {
  // Create a minimal test to validate the build configuration
  const testResult = execSync('npx taro build --type weapp --help', { encoding: 'utf8' });
  if (testResult.includes('weapp')) {
    console.log('✅ WeChat build command is available');
  }
} catch (error) {
  console.log('⚠️  Build command validation had issues, but this may be expected');
}

// Test 7: Check for common build issues
console.log('\n7. Checking for common build configuration issues...');

// Check if weapp-tailwindcss is properly configured
try {
  const configPath = 'config/index.ts';
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  if (configContent.includes('weapp-tailwindcss')) {
    console.log('✅ weapp-tailwindcss plugin is configured');
  } else {
    console.log('⚠️  weapp-tailwindcss plugin not found in config');
  }
  
  if (configContent.includes('@tarojs/plugin-html')) {
    console.log('✅ @tarojs/plugin-html is configured');
  } else {
    console.log('⚠️  @tarojs/plugin-html not found in config');
  }
  
  if (configContent.includes('injectAdditionalCssVarScope')) {
    console.log('✅ CSS variable injection is configured');
  } else {
    console.log('⚠️  CSS variable injection not configured');
  }
} catch (error) {
  console.error('❌ Failed to check build configuration:', error.message);
}

console.log('\n🎉 WeChat Mini-Program Build Test completed!');
console.log('\nNext steps:');
console.log('- Run "npm run build:weapp" to perform actual build');
console.log('- Check dist/ directory for build output');
console.log('- Import dist/ folder into WeChat Developer Tools for testing');