require('./type.scss');

var DiskTypeController = require('./DiskTypeController.js');
var service = require("./service");

var mod = angular.module('diskType', []);
service(mod);
mod.controller('DiskTypeController', ['$scope', '$q', 'diskTypeSrv','$timeout',DiskTypeController]);

module.exports = mod;