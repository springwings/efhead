const path = require('path')
// const webpack = require('webpack')
const CompressionPlugin = require('compression-webpack-plugin')

function resolve (dir) {
  return path.join(__dirname, './', dir)
}

module.exports = {
  lintOnSave: false,
  productionSourceMap: false,
  configureWebpack: config => {
    // gzip压缩
    return {
      plugins: [
        new CompressionPlugin({
          test: /\.js$|\.html$|.\css/, // 匹配文件名
          threshold: 10240, // 对超过10k的数据压缩
          deleteOriginalAssets: false // 不删除源文件
        })
      ]
    }
  },
  chainWebpack: config => {
    // 为src下文件配别名，不使用相对路径
    config.resolve.alias
      .set('@', resolve('src'))
      .set('assets', resolve('src/assets'))
      .set('components', resolve('src/components'))
      .set('views', resolve('src/views'))
      .set('icons', resolve('src/icons'))
      .set('router', resolve('src/router'))
      .set('utils', resolve('src/utils'))
      .set('style', resolve('src/style'))

    /** 设置处理svg的router，使svg可直接用名称调用，无需路径 */
    // svg rule loader
    // const svgRule = config.module.rule('svg') // 找到svg-loader
    // svgRule.uses.clear() // 清除已有的loader, 如果不这样做会添加在此loader之后
    // svgRule.exclude.add(/node_modules/) // 正则匹配排除node_modules目录
    // svgRule // 添加svg新的loader处理
    //   .test(/\.svg$/)
    //   .use('svg-sprite-loader')
    //   .loader('svg-sprite-loader')
    //   .options({
    //     symbolId: 'icon-[name]'
    //   })
  },
  // outputDir: '../static/', // 打包文件存放地址
  // indexPath: 'zm.html', // 打包名称
  // publicPath: '/static/', // 打包后静态资源引入路径
  devServer: {
    host: 'localhost',
    port: 2022, // 端口号
    disableHostCheck: true,
    open: true, // 配置自动启动浏览器
    hotOnly: true, // 热更新
    proxy: {
      '/': {
        target: process.env.VUE_APP_BASE_API,
        changeOrigin: true
      }
    }
  }
}
