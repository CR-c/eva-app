import type { UserConfigExport } from "@tarojs/cli"

export default {
  logger: {
    quiet: false,
    stats: true
  },
  mini: {
    webpackChain(chain) {
      // 开发环境简化配置
      chain.devtool('cheap-module-source-map')
    }
  },
  h5: {
    devServer: {
      port: 10086,
      host: 'localhost'
    }
  }
} satisfies UserConfigExport<'webpack5'>
