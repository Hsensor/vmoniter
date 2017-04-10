var baseConfig = require('./webpack.base.conf')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var merge = require('webpack-merge')

Object.keys(baseConfig.entry).forEach(function(name){
  baseConfig.entry[name] = ['./build/dev-client'].concat(baseConfig.entry[name])
})
console.log(baseConfig.entry);

module.exports = merge(baseConfig,{
  plugins:[
    new webpack.optimize.CommonsChunkPlugin({
      name:"common",
      minChunks:2
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new HtmlWebpackPlugin({
      template:__dirname+"./../index.html",
      filename:__dirname+"./../dist/index.html",
      inject:'body',
      hash:true,
      chunks:['common','app']
    })
  ]
})