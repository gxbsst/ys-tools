import path from 'path';

export default {
  entry: {
    vendor: path.resolve(__dirname, 'src/vendor.js'),
    index: path.resolve(__dirname, 'src/index.js')
  },
  extraBabelPlugins: [
    'transform-runtime',
    'transform-decorators-legacy',
    'transform-class-properties',
    [
      'import',
      {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true
      }
    ]
  ],
  env: {
    development: {
      extraBabelPlugins: [
        'dva-hmr'
      ]
    }
  },
  // proxy: {
  //   '/api/': {
  //     target: 'http://crm.weimobdev.com',
  //     pathRewrite: {
  //       '^/api/': '/api/'
  //     },
  //     changeOrigin: true
  //   },
  //   '/oa/': {
  //     target: 'http://oa.weimobdev.com',
  //     pathRewrite: {
  //       '^/oa/': '/'
  //     },
  //     changeOrigin: true
  //   },
  //   '/wmc/': {
  //     target: 'http://api-dev.weimobwmc.com',
  //     pathRewrite: {
  //       '^/wmc/': '/media/'
  //     },
  //     changeOrigin: true
  //   },
  //   '/sso/': {
  //     target: 'http://sso.weimobdev.com',
  //     pathRewrite: {
  //       '^/sso/': '/'
  //     },
  //     changeOrigin: true
  //   }
  // },
  alias: {
    components$: path.resolve(__dirname, 'src/components/index.js'),
  },
  externals: {
    // 'g2': 'G2',
    // 'g-cloud': 'Cloud',
    // 'g2-plugin-slider': 'G2.Plugin.slider'
  },
  ignoreMomentLocale: true,
  theme: path.resolve(__dirname, 'src/theme.js'),
  hash: true
};
