var path = require('path');
var webpack = require('webpack');
var CopyPlugin = require('copy-webpack-plugin');

var isDev = process.env.NODE_ENV === 'development';

module.exports = {
  context: path.join(__dirname, 'src'),
  devtool: isDev ? 'eval' : 'cheap-module-source-map',
  entry: [ './index.jsx' ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'app.js',
    publicPath: '/dist/'
  },
  plugins: [
    new CopyPlugin([
      { from: './*.html' },
      { from: './*.svg' },
      { from: '../node_modules/babel-polyfill/dist/polyfill.min.js' }
    ])
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: [ 'babel' ]
      }
    ]
  }
};
