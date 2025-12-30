import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import devConfig from './dev'
import prodConfig from './prod'

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig<'webpack5'>(async (merge) => {
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
      "@tarojs/plugin-generator"
    ],
    defineConstants: {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
      __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
      ENABLE_INNER_HTML: JSON.stringify(true),
      ENABLE_ADJACENT_HTML: JSON.stringify(true),
      ENABLE_SIZE_APIS: JSON.stringify(true),
      ENABLE_TEMPLATE_CONTENT: JSON.stringify(true),
      ENABLE_CLONE_NODE: JSON.stringify(true),
      ENABLE_CONTAINS: JSON.stringify(true)
    },
    copy: {
      patterns: [
      ],
      options: {
      }
    },
    framework: 'react',
    compiler: 'webpack5',
    cache: {
      enable: true // 启用 Webpack 持久化缓存配置，提升二次编译速度
    },
    logger: {
      quiet: false,
      stats: true
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {
            // 设计稿尺寸
            designWidth: 750,
            // 设计稿尺寸换算规则
            deviceRatio: {
              640: 2.34 / 2,
              750: 1,
              828: 1.81 / 2
            }
          }
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      },
      // 小程序端专用配置
      optimizeMainPackage: {
        enable: true
      },
      // 添加小程序分包配置支持
      addChunkPages(_pages, _pagesNames) {
        // 可以在这里配置分包逻辑
      },
      webpackChain(chain) {
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
        
        // 优化构建性能
        chain.optimization.splitChunks({
          chunks: 'all',
          maxInitialRequests: Infinity,
          minSize: 0,
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all'
            }
          }
        })
      }
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      output: {
        filename: 'js/[name].[hash:8].js',
        chunkFilename: 'js/[name].[chunkhash:8].js'
      },
      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: 'css/[name].[hash].css',
        chunkFilename: 'css/[name].[chunkhash].css'
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {}
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      },
      webpackChain(chain) {
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
      }
    },
    rn: {
      appName: 'taroDemo',
      postcss: {
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        }
      }
    }
  }


  if (process.env.NODE_ENV === 'development') {
    // 本地开发构建配置（不混淆压缩）
    return merge({}, baseConfig, devConfig)
  }
  // 生产构建配置（默认开启压缩混淆等）
  return merge({}, baseConfig, prodConfig)
})
