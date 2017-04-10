require('./performanceSize.scss');

var DiskPerformanceSizeController = require('./DiskPerformanceSizeController.js');
var service = require("./service");

var mod = angular.module('diskPerformance', []);
service(mod);
mod.controller('DiskPerformanceSizeController', ['$scope', '$q', 'diskPerformanceSizeSrv','$timeout',DiskPerformanceSizeController]);

module.exports = mod;