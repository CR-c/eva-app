#!/usr/bin/env node

/**
 * Cross-Platform Comparison Script
 * Compares WeChat and ByteDance mini-program compatibility
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Cross-Platform Compatibility Analysis...\n');

// Test 1: Compare platform configurations
console.log('1. Platform Configuration Comparison...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

console.log('\n📱 WeChat Platform:');
console.log(`   Build script: ${packageJson.scripts['build:weapp'] ? '✅' : '❌'}`);
console.log(`   Dev script: ${packageJson.scripts['dev:weapp'] ? '✅' : '❌'}`);
console.log(`   Platform plugin: ${packageJson.devDependencies['@tarojs/plugin-platform-weapp'] ? '✅' : '❌'}`);

console.log('\n📱 ByteDance Platform:');
console.log(`   Build script: ${packageJson.scripts['build:tt'] ? '✅' : '❌'}`);
console.log(`   Dev script: ${packageJson.scripts['dev:tt'] ? '✅' : '❌'}`);
console.log(`   Platform plugin: ${packageJson.devDependencies['@tarojs/plugin-platform-tt'] ? '✅' : '❌'}`);

// Test 2: Check project configurations
console.log('\n2. Project Configuration Files...');
const wechatConfig = fs.existsSync('project.config.json');
const bytedanceConfig = fs.existsSync('project.tt.json');

console.log(`   WeChat config (project.config.json): ${wechatConfig ? '✅' : '❌'}`);
console.log(`   ByteDance config (project.tt.json): ${bytedanceConfig ? '❌ Missing' : '✅'}`);

if (!bytedanceConfig) {
  console.log('\n   📝 Creating ByteDance project configuration...');
  
  if (wechatConfig) {
    const wechatConfigContent = JSON.parse(fs.readFileSync('project.config.json', 'utf8'));
    const bytedanceConfigContent = {
      ...wechatConfigContent,
      projectname: wechatConfigContent.projectname + '-tt',
      appid: '', // ByteDance uses different app ID
      setting: {
        ...wechatConfigContent.setting,
        urlCheck: true,
        es6: false,
        enhance: true,
        compileHotReLoad: true,
        postcss: false,
        minified: false
      }
    };
    
    fs.writeFileSync('project.tt.json', JSON.stringify(bytedanceConfigContent, null, 2));
    console.log('   ✅ Created project.tt.json based on WeChat configuration');
  }
}

// Test 3: Analyze API compatibility
console.log('\n3. API Compatibility Analysis...');
const srcFiles = getAllTsxFiles('src');
const apiUsage = {
  compatible: [],
  wechatSpecific: [],
  bytedanceSpecific: [],
  needsPlatformDetection: []
};

const compatibleApis = [
  'Taro.navigateTo',
  'Taro.navigateBack',
  'Taro.showToast',
  'Taro.showModal',
  'Taro.request',
  'Taro.getStorageSync',
  'Taro.setStorageSync',
  'Taro.showLoading',
  'Taro.hideLoading'
];

const platformSpecificApis = [
  'Taro.getUserInfo',
  'Taro.login',
  'Taro.getUserProfile',
  'Taro.authorize',
  'Taro.requestPayment',
  'Taro.scanCode'
];

for (const file of srcFiles.slice(0, 15)) {
  const content = fs.readFileSync(file, 'utf8');
  const fileName = path.relative('src', file);
  
  for (const api of compatibleApis) {
    if (content.includes(api)) {
      apiUsage.compatible.push({ file: fileName, api });
    }
  }
  
  for (const api of platformSpecificApis) {
    if (content.includes(api)) {
      apiUsage.needsPlatformDetection.push({ file: fileName, api });
    }
  }
}

console.log(`   ✅ Compatible APIs found: ${apiUsage.compatible.length}`);
console.log(`   ⚠️  APIs needing platform detection: ${apiUsage.needsPlatformDetection.length}`);

if (apiUsage.needsPlatformDetection.length > 0) {
  console.log('\n   Platform-specific APIs found:');
  apiUsage.needsPlatformDetection.forEach(({ file, api }) => {
    console.log(`     - ${api} in ${file}`);
  });
}

// Test 4: Component compatibility
console.log('\n4. Component Library Compatibility...');
let nutUIUsage = 0;
let taroUIUsage = 0;
let customComponents = 0;

for (const file of srcFiles.slice(0, 20)) {
  const content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('@nutui/nutui-react-taro')) {
    nutUIUsage++;
  }
  
  if (content.includes('taro-ui')) {
    taroUIUsage++;
  }
  
  if (content.includes('export default') && content.includes('React.FC')) {
    customComponents++;
  }
}

console.log(`   ✅ NutUI-React components: ${nutUIUsage} files`);
console.log(`   ${taroUIUsage > 0 ? '⚠️' : '✅'}  Legacy Taro UI: ${taroUIUsage} files`);
console.log(`   ✅ Custom components: ${customComponents} files`);

// Test 5: Styling compatibility
console.log('\n5. Styling System Compatibility...');
const styleFiles = getAllStyleFiles('src');
let tailwindUsage = 0;
let scssUsage = 0;
let platformSpecificStyles = 0;

for (const file of styleFiles) {
  const content = fs.readFileSync(file, 'utf8');
  
  if (file.endsWith('.scss')) {
    scssUsage++;
  }
  
  if (content.includes('wx-') || content.includes('weapp-')) {
    platformSpecificStyles++;
  }
}

// Check for Tailwind usage in TSX files
for (const file of srcFiles.slice(0, 10)) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('className=') && (content.includes('bg-') || content.includes('text-') || content.includes('p-'))) {
    tailwindUsage++;
  }
}

console.log(`   ✅ Tailwind CSS usage: ${tailwindUsage} files`);
console.log(`   ✅ SCSS files: ${scssUsage} files`);
console.log(`   ${platformSpecificStyles > 0 ? '⚠️' : '✅'}  Platform-specific styles: ${platformSpecificStyles} files`);

// Test 6: Build configuration compatibility
console.log('\n6. Build Configuration Compatibility...');
const configContent = fs.readFileSync('config/index.ts', 'utf8');

const features = {
  webpackChain: configContent.includes('webpackChain'),
  weappTailwindcss: configContent.includes('weapp-tailwindcss'),
  pluginHtml: configContent.includes('@tarojs/plugin-html'),
  cssVariableInjection: configContent.includes('injectAdditionalCssVarScope'),
  platformDetection: configContent.includes('process.env.TARO_ENV')
};

console.log(`   ✅ Webpack customization: ${features.webpackChain ? 'Yes' : 'No'}`);
console.log(`   ✅ weapp-tailwindcss: ${features.weappTailwindcss ? 'Yes' : 'No'}`);
console.log(`   ✅ HTML plugin: ${features.pluginHtml ? 'Yes' : 'No'}`);
console.log(`   ✅ CSS variable injection: ${features.cssVariableInjection ? 'Yes' : 'No'}`);
console.log(`   ✅ Platform detection: ${features.platformDetection ? 'Yes' : 'No'}`);

// Test 7: Generate compatibility report
console.log('\n7. Compatibility Summary...');
const compatibilityScore = calculateCompatibilityScore({
  apiCompatibility: apiUsage.needsPlatformDetection.length === 0 ? 100 : 80,
  componentCompatibility: taroUIUsage === 0 ? 100 : 70,
  stylingCompatibility: platformSpecificStyles === 0 ? 100 : 85,
  configurationCompatibility: features.platformDetection ? 100 : 90
});

console.log(`\n📊 Overall Cross-Platform Compatibility: ${compatibilityScore}%`);

if (compatibilityScore >= 90) {
  console.log('🎉 Excellent cross-platform compatibility!');
} else if (compatibilityScore >= 80) {
  console.log('✅ Good cross-platform compatibility with minor issues');
} else {
  console.log('⚠️  Cross-platform compatibility needs improvement');
}

console.log('\n📋 Recommendations:');
if (apiUsage.needsPlatformDetection.length > 0) {
  console.log('- Add platform detection for platform-specific APIs');
}
if (taroUIUsage > 0) {
  console.log('- Complete migration from Taro UI to NutUI-React');
}
if (platformSpecificStyles > 0) {
  console.log('- Remove platform-specific styling classes');
}
if (!bytedanceConfig) {
  console.log('- ✅ ByteDance project configuration has been created');
}

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

function calculateCompatibilityScore(scores) {
  const weights = {
    apiCompatibility: 0.3,
    componentCompatibility: 0.3,
    stylingCompatibility: 0.2,
    configurationCompatibility: 0.2
  };
  
  return Math.round(
    scores.apiCompatibility * weights.apiCompatibility +
    scores.componentCompatibility * weights.componentCompatibility +
    scores.stylingCompatibility * weights.stylingCompatibility +
    scores.configurationCompatibility * weights.configurationCompatibility
  );
}