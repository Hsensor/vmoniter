var gridModule = angular.module("grid",[]);
var directives = require("./grid_directive");
var factories = require("./grid_factory");

directives(gridModule);
factories(gridModule);

module.exports = gridModule;