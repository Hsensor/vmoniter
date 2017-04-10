require('./capacitySize.scss');

var DiskCapacitySizeController = require('./DiskCapacitySizeController.js');
var service = require("./service");

var mod = angular.module('diskCapacitySize', []);
service(mod);
mod.controller('DiskCapacitySizeController', ['$scope', '$q', 'diskCapacitySizeSrv','$timeout',DiskCapacitySizeController]);

module.exports = mod;