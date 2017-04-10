var path = require('path');

var express = require('express');
var webpack = require('webpack');
var opn = require('opn');
var webpackConfig = require('./webpack.dev.conf');
var port = 3001;

var routes = require('./../routes/index');
var api = require('./../routes/api');
var task = require("./../routes/task");

var app = express();
var compiler = webpack(webpackConfig);

var devMiddleware =  require('webpack-dev-middleware')(compiler,{
  publicPath: webpackConfig.output.publicPath,
  stats: {
    colors: true,
    chunks: false
  }
});

var hotMiddleware = require('webpack-hot-middleware')(compiler);

compiler.plugin('compilation',function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit',function(data, cb){
    hotMiddleware.publish({action: 'reload'});
    cb()
  })
})

var staticPath = path.posix.join("")

app.use(devMiddleware);
app.use(hotMiddleware);

app.use('/', routes);
app.use('/v1', api);
app.use('/tasks',task)


app.listen(port, function (err) {
  if(err){
    console.log(err);
    return;
  }

  var uri = 'http://localhost:' + port ;
  console.log('Listening at ' + uri + '\n');

  if(process.env.NODE_ENV !== 'testing'){
    opn(uri)
  }

})

process.on('uncaughtException', function (err) {
  console.error('An uncaught error occurred!');
  console.error(err.stack);
});