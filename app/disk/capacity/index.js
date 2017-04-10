require('./capacity.scss');

var DiskCapacityController = require('./DiskCapacityController.js');
var service = require("./service");

var mod = angular.module('diskCapacity', []);
service(mod);
mod.controller('DiskCapacityController', ['$scope', '$q', 'diskCapacitySrv','$timeout',DiskCapacityController]);

module.exports = mod;