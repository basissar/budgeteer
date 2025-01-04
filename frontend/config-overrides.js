const { override, addWebpackModuleRule } = require('customize-cra');
const addLessLoader = require("customize-cra-less-loader");

module.exports = override(
  addWebpackModuleRule({
    test: /\.svg$/,
    use: ['@svgr/webpack'],
  }),
  addLessLoader({
    lessLoaderOptions: {
      lessOptions: {
        javascriptEnabled: true,
      },
    },
  })
);
