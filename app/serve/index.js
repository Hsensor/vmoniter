require('./serve.scss');

var serveController = require('./serveController.js');
var service = require("./service");

var mod = angular.module('serve', []);
service(mod);
mod.controller('serveController', ['$scope', '$q', 'serveSrv','$timeout',serveController]);

module.exports = mod;