var baseConfig = require('./webpack.base.conf')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var merge = require('webpack-merge')

module.exports = merge(baseConfig,{
  plugins:[
    new webpack.optimize.CommonsChunkPlugin({
      name:"common",
      minChunks:2
    }),
    new HtmlWebpackPlugin({
      template:__dirname+"./../index.html",
      filename:__dirname+"./../dist/index.html",
      inject:'body',
      hash:true,
      chunks:['common','app']
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.NoErrorsPlugin(),
    //new webpack.optimize.UglifyJsPlugin()
  ]
})