import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import path from 'path'
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig<'webpack5'>((merge) => {
  const baseConfig: UserConfigExport<'webpack5'> = {
    projectName: 'eva-app-new',
    date: '2025-12-25',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: [
      "@tarojs/plugin-generator",
      ["@tarojs/plugin-html", {
        // 包含额外的 HTML 标签支持
        pxtransformBlackList: [/demo-/, /^body/]
      }]
    ],
    defineConstants: {
    },
    copy: {
      patterns: [],
      options: {}
    },
    framework: 'react',
    compiler: {
      type: 'webpack5',
      prebundle: {
        enable: false, // 禁用 prebundle 避免问题
        force: false,
        include: ['@nutui/nutui-react-taro'], // 指定需要预编译的依赖
        exclude: [], // 排除不需要预编译的依赖
        esbuild: {
          minify: false
        }
      }
    },
    cache: {
      enable: true // 启用缓存以提升编译速度
    },
    alias: {
      '@': path.resolve(__dirname, '..', 'src')
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {
            // 不排除任何选择器，让所有 px 都转换为 rpx
          }
        },
        cssModules: {
          enable: false
        }
      },
      webpackChain(chain, webpack) {
        // 配置 weapp-tailwindcss 插件
        chain.merge({
          plugin: {
            install: {
              plugin: UnifiedWebpackPluginV5,
              args: [{
                appType: 'taro',
                // 开启 rem -> rpx 的转化
                rem2rpx: true,
                // 与 NutUI 一起使用时，重新注入 tailwindcss css var 区域块
                injectAdditionalCssVarScope: true
              }]
            }
          }
        })
        
        // 配置 optimization 为 prebundle 兼容的值
        chain.optimization.merge({
          chunkIds: 'deterministic'
        })
        
        // 移除不兼容的 hash 占位符
        chain.output.chunkFilename('[name].js')
      }
    },
    h5: {
      output: {
        // H5端也需要移除hash占位符以兼容prebundle
        chunkFilename: '[name].js'
      },
      webpackChain(chain) {
        // H5端也配置相同的chunkIds
        chain.optimization.merge({
          chunkIds: 'deterministic'
        })
      }
    }
  }

  if (process.env.NODE_ENV === 'development') {
    return merge({}, baseConfig, {
      logger: {
        quiet: false,
        stats: true
      }
    })
  }
  
  return baseConfig
})
