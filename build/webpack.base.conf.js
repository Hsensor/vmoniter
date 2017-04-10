var path = require('path');
module.exports = {
  debug: true,
  entry: {
    app:"./app/main.js"
  },     
  output: {
    path: path.resolve(__dirname, './../dist'),
    publicPath: "/",
    filename: '[name].js'
  },

  module: {
    loaders: [
      {
        test: /\.html$/,
        loader: 'html'
      },
      {
        test: /\.scss$/,
        loader: 'style-loader!css-loader!autoprefixer-loader!sass-loader'
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.png$/,
        loader: 'url-loader?limit=100000&mimetype=image/png'
      },
      {
        test: /\.jpg$/,
        loader: 'file-loader'
      },
      //加载css fonts file loader
      {
        test: /\.(svg|ttf|eot|woff|woff2)$/,
        loader: 'file-loader?name=fonts/[name].[ext]'
      }
    ]
  },
  
  resolve: {
    //require 目录
    /*modulesDirectories: [
      'node_modules',
      'app/vendor'
    ]*/
  }
};