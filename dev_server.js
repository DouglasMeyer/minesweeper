var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');
var host = '0.0.0.0';
var port = 3000;

new WebpackDevServer(webpack(config), {
  contentBase: __dirname,
  publicPath: config.output.publicPath,
  historyApiFallback: true
}).listen(port, host, function (err, _result) {
  if (err) {
    return console.log(err);
  }

  console.log('Listening at http://'+host+':'+port+'/');
});
