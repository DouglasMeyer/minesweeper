var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CopyPlugin = require('copy-webpack-plugin');
var autoprefixer = require('autoprefixer');

var isDev = process.env.NODE_ENV === 'development';

module.exports = {
  context: path.join(__dirname, 'src'),
  devtool: isDev ? 'eval' : 'cheap-module-source-map',
  entry: [ './index.jsx' ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'app.js',
    publicPath: '/'
  },
  plugins: [
    new CopyPlugin([
      { from: './*.html' },
      { from: '../node_modules/babel-polyfill/dist/polyfill.min.js' }
    ]),
    new ExtractTextPlugin('index.css', { allChunks: true })
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: [ 'babel' ]
      },
      {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract("style-loader", "css-loader!postcss-loader")
      },
      { test: /\.svg$/, loader: "url-loader?limit=10000" }
    ]
  },
  postcss: function () {
    return [ autoprefixer ];
  }
};
