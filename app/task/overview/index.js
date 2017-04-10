var taskOverviewController = require('./taskOverviewController.js');

require('./overview.scss');

var mod = module.exports = angular.module('taskOverview', []);
var service = require("./service");

service(mod);

mod.controller('taskOverviewController', ['$scope','taskOverviewSrv','$log', taskOverviewController]);

module.exports = mod;