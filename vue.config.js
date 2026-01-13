const path = require('path');
const webpack = require('webpack');
const packageName = require('./package.json').name;

function resolve(dir) {
  return path.join(__dirname, dir);
}

const isDev = process.env.NODE_ENV === 'development';
const publicPath = isDev ? '/' : `/${packageName}/`;

module.exports = {
  pages: {
    index: {
      entry: 'src/entries/main/main',
      template: 'public/index.html',
      filename: 'index.html'
    },
    // 开发环境禁用非必要入口提升速度
    ...(isDev
      ? {}
      : {
          microapp: {
            entry: 'src/entries/microapp/main',
            template: 'public/index.html',
            filename: 'microapp.html'
          },
          iframe: {
            entry: 'src/entries/iframe/main',
            template: 'public/index.html',
            filename: 'iframe.html'
          }
        })
  },

  publicPath: publicPath,
  outputDir: `release/${packageName}`,
  assetsDir: 'static',
  productionSourceMap: false,
  lintOnSave: false,
  transpileDependencies: ['resize-detector'],

  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT',
      'Access-Control-Allow-Credentials': 'true'
    },
    hot: true, // 显式启用热更新
    hotOnly: false,
    liveReload: false,
    historyApiFallback: true,
    watchOptions: {
      ignored: /node_modules/,
      aggregateTimeout: 300,
      poll: 1000
    },
    proxy: {
      /* 保持原始代理配置不变 */
      '^/api/purificationApi': {
        target: process.env.WEBPACK_PROXY_HOST,
        changeOrigin: true,
        pathRewrite: {
          '^/api/purificationApi': process.env.WEBPACK_PROXY_BASE_URL
        }
      },
      '^/api/sewage-plant': {
        target: process.env.WEBPACK_PROXY_HOST,
        changeOrigin: true,
        pathRewrite: {
          '^/api/sewage-plant': '/main/sewage-plant'
        }
      },
      '^/api/wpgBimApi': {
        target: process.env.WEBPACK_PROXY_HOST,
        changeOrigin: true,
        pathRewrite: {
          '^/api/wpgBimApi': '/main/wpgBimApi'
        }
      },
      '/sw': {
        // 此处要与 /api/api.js 中的 API_PROXY_PREFIX 值保持一致
        target: 'http://116.236.135.250:8093/supplyWaterThird',
        changeOrigin: true,
        pathRewrite: {
          '^/sw': ''
        }
      },
      '^/api': {
        target: process.env.WEBPACK_PROXY_PUBLIC_HOST,
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/api': '/main'
        }
      }
    }
  },

  configureWebpack: {
    devtool: isDev ? 'eval-cheap-module-source-map' : 'source-map',
    resolve: {
      alias: {
        vue$: 'vue/dist/vue.esm.js',
        '@': resolve('src'),
        assets: resolve('src/assets') // 明确路径别名
      },
      extensions: ['.js', '.vue', '.json'],
      modules: [resolve('src'), resolve('node_modules'), resolve('static')]
    },
    plugins: [
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      ...(isDev
        ? [
            new webpack.HashedModuleIdsPlugin()
            // new webpack.DllReferencePlugin({
            //   context: __dirname,
            //   manifest: require('./public/vendor-manifest.json')
            // })
          ]
        : [])
    ],
    optimization: {
      ...(isDev
        ? {
            removeAvailableModules: false,
            removeEmptyChunks: false,
            splitChunks: false,
            minimize: false
          }
        : {
            splitChunks: {
              cacheGroups: {
                vendors: {
                  name: 'chunk-vendors',
                  test: /[\\/]node_modules[\\/].*\.js$/,
                  priority: -10,
                  chunks: 'initial'
                },
                common: {
                  name: 'chunk-common',
                  test: /\.js$/,
                  minChunks: 2,
                  priority: -20,
                  chunks: 'initial',
                  reuseExistingChunk: true
                }
              }
            }
          })
    },
    output: isDev
      ? {}
      : {
          library: packageName,
          libraryTarget: 'umd',
          jsonpFunction: `webpackJsonp_${packageName}`
        }
  },

  chainWebpack: config => {
    // 开发环境优化配置
    if (isDev) {
      config.cache({
        type: 'memory',
        maxGenerations: 1
      });

      // 关闭图片处理优化
      config.module
        .rule('images')
        .use('url-loader')
        .tap(options => ({
          ...options,
          fallback: {
            ...options.fallback,
            options: {
              ...options.fallback.options,
              disable: true // 关闭图片压缩
            }
          }
        }));

      // 禁用预加载
      config.plugins.delete('prefetch');
      config.plugins.delete('preload');
    }

    // LeaderLine 特殊处理（保留原始配置）
    config.module
      .rule('leaderLine')
      .test(path.resolve(__dirname, 'node_modules/leader-line'))
      .use('skeleton-loader')
      .loader('skeleton-loader')
      .options({ procedure: content => `${content}export default LeaderLine` });

    // 资源路径处理（保留原始逻辑）
    ['fonts', 'images', 'media'].forEach(type => {
      config.module
        .rule(type)
        .use('url-loader')
        .tap(options => {
          options.fallback.options.publicPath = publicPath;
          return options;
        });
    });

    config.module
      .rule('svg')
      .use('file-loader')
      .tap(options => {
        options.publicPath = publicPath;
        return options;
      });
  },

  css: {
    extract: !isDev,
    sourceMap: false,
    loaderOptions: {
      less: {
        lessOptions: {
          modifyVars: {},
          javascriptEnabled: true,
          globalVars: {
            hack: `true; @import "~@/styles/public.less"`
          }
        }
      }
    }
  }
};
