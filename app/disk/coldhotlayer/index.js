require('./coldhotlayer.scss');

var DiskColdhotlayerController = require('./DiskColdhotlayerController.js');
var service = require("./service");

var mod = angular.module('diskColdhotlayer', []);
service(mod);
mod.controller('DiskColdhotlayerController', ['$scope', '$q', 'diskColdhotlayerSrv','$timeout',DiskColdhotlayerController]);

module.exports = mod;