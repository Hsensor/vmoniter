require('./performance.scss');

var DiskPerformanceController = require('./DiskPerformanceController.js');
var service = require("./service");

var mod = angular.module('diskPerformance', []);
service(mod);
mod.controller('DiskPerformanceController', ['$scope', '$q', 'diskPerformanceSrv','$timeout',DiskPerformanceController]);

module.exports = mod;