var taskDetailController = require('./taskDetailController.js');

require('./detail.scss');

var mod = angular.module('taskDetail', []);
var service = require("./service");

service(mod);

mod.controller('taskDetailController', ['$scope','taskDetailSrv','$q','generateGridDefaultOptions', '$timeout',taskDetailController]);

module.exports = mod;