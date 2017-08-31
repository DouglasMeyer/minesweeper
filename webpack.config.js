var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CopyPlugin = require('copy-webpack-plugin');

var isDev = process.env.NODE_ENV === 'development';

module.exports = {
  context: path.join(__dirname, 'src'),
  devtool: 'source-map',
  entry: [ 'babel-polyfill', './index.jsx' ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'app.js',
    publicPath: '/',
    library: 'Minesweeper'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        include: /src/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [
            { loader: 'css-loader', options: { importLoaders: 1 } },
            { loader: "postcss-loader", options: { ctx: {
              autoprefixer: {}
            } } }
          ]
        })
      },
      { test: /\.svg$/, loader: "url-loader?limit=10000" }
    ]
  },
  plugins: [
    new CopyPlugin([
      { from: './*.html' },
      { from: './lib/*' }
    ]),
    isDev ? null : new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new ExtractTextPlugin('index.css', { allChunks: true })
  ].filter(x=>x),
  resolve: {
    alias: {
      'react': 'preact-compat',
      'react-dom': 'preact-compat'
    }
  }
};
