var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CopyPlugin = require('copy-webpack-plugin');
var autoprefixer = require('autoprefixer');

var isDev = process.env.NODE_ENV === 'development';

module.exports = {
  context: path.join(__dirname, 'src'),
  devtool: 'source-map',
  entry: [ './index.jsx' ],
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
        loader: 'babel',
        query: {
          presets: [ 'react', 'es2015' ],
          plugins: [ 'transform-es3-member-expression-literals', 'transform-es3-property-literals' ]
        }
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract("style-loader", "css-loader?sourceMap!postcss-loader")
      },
      { test: /\.svg$/, loader: "url-loader?limit=10000" }
    ]
  },
  plugins: [
    new CopyPlugin([
      { from: './*.html' },
      { from: './lib/*' },
      { from: '../node_modules/babel-polyfill/dist/polyfill.min.js' }
    ]),
    isDev ? null : new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new ExtractTextPlugin('index.css', { allChunks: true })
  ].filter(x=>x),
  postcss: function () {
    return [ autoprefixer ];
  }
};
