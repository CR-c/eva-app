import type { UserConfigExport } from "@tarojs/cli"

export default {
  mini: {
    // 小程序端优化配置
    optimizeMainPackage: {
      enable: true,
      exclude: [
        // 排除不需要优化的文件
        'node_modules/@nutui/nutui-react-taro/dist/styles/**',
        'node_modules/tailwindcss/**'
      ]
    },
    // 启用代码分割和懒加载
    addChunkPages(pages, pagesNames) {
      // 将大页面分包处理
      const chunkPages = new Map()
      
      // 将表单页面分到一个包
      const formPages = ['addPet', 'addGrowthRecord', 'addGrowthPhoto']
      formPages.forEach(pageName => {
        if (pagesNames.includes(pageName)) {
          chunkPages.set('form-pages', [...(chunkPages.get('form-pages') || []), pageName])
        }
      })
      
      // 将展示页面分到一个包
      const displayPages = ['growthGallery', 'growthTimeline', 'walkSummary']
      displayPages.forEach(pageName => {
        if (pagesNames.includes(pageName)) {
          chunkPages.set('display-pages', [...(chunkPages.get('display-pages') || []), pageName])
        }
      })
      
      return chunkPages
    },
    webpackChain(chain) {
      // 启用 Tree Shaking
      chain.optimization.usedExports(true)
      chain.optimization.sideEffects(false)
      
      // 优化代码分割
      chain.optimization.splitChunks({
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 0,
        maxSize: 200000, // 200KB 最大包大小
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
            chunks: 'all',
            maxSize: 150000 // 150KB vendor 包最大大小
          },
          // NutUI 组件单独打包
          nutui: {
            test: /[\\/]node_modules[\\/]@nutui[\\/]/,
            name: 'nutui',
            priority: 10,
            chunks: 'all',
            maxSize: 100000 // 100KB NutUI 包最大大小
          },
          // React 相关单独打包
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            priority: 20,
            chunks: 'all'
          },
          // Taro 框架单独打包
          taro: {
            test: /[\\/]node_modules[\\/]@tarojs[\\/]/,
            name: 'taro',
            priority: 15,
            chunks: 'all'
          }
        }
      })
      
      // 启用压缩优化
      chain.optimization.minimize(true)
      
      // 移除未使用的代码
      chain.optimization.providedExports(true)
      chain.optimization.concatenateModules(true)
    },
    postcss: {
      // CSS 优化配置
      pxtransform: {
        enable: true,
        config: {
          selectorBlackList: [/^\.nut-/, /^\.tw-/]
        }
      },
      // 启用 CSS 压缩和优化
      cssModules: {
        enable: false
      }
    }
  },
  h5: {
    /**
     * WebpackChain 插件配置 - 生产环境优化
     * @docs https://github.com/neutrinojs/webpack-chain
     */
    webpackChain (chain) {
      // 启用 Tree Shaking
      chain.optimization.usedExports(true)
      chain.optimization.sideEffects(false)
      
      // 代码分割优化
      chain.optimization.splitChunks({
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 20000,
        maxSize: 200000,
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
          },
          // NutUI 组件单独打包
          nutui: {
            test: /[\\/]node_modules[\\/]@nutui[\\/]/,
            name: 'nutui',
            priority: 10,
            chunks: 'all'
          },
          // React 相关单独打包
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            priority: 20,
            chunks: 'all'
          }
        }
      })
      
      // 启用压缩
      chain.optimization.minimize(true)
      
      // 如果需要分析包大小，可以启用 bundle analyzer
      if (process.env.ANALYZE) {
        const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
        chain.plugin('analyzer')
          .use(BundleAnalyzerPlugin, [{
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: 'bundle-report.html'
          }])
      }
    },
    // 输出优化
    output: {
      filename: 'js/[name].[contenthash:8].js',
      chunkFilename: 'js/[name].[contenthash:8].js'
    },
    // CSS 提取优化
    miniCssExtractPluginOption: {
      ignoreOrder: true,
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[name].[contenthash:8].css'
    }
  }
} satisfies UserConfigExport<'webpack5'>