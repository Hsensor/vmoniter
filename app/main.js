'use strict';

require('./core');
require('angular');
require('angular-ui-router');
require('angular-ui-bootstrap');
require('oclazyload');
require('./common/common_module');
window.Highcharts = require("highcharts");
require("highcharts/modules/drilldown")(window.Highcharts);
Highcharts.setOptions({global: {useUTC: false}});
require("highcharts-ng");
var grid = require("./common/grid");


window.app = {
  apiPath:"/v1/"
}


var app = angular.module('vegaMoniter', [
  'ui.router',
  'oc.lazyLoad',
  "ui.bootstrap",
  "common",
  "highcharts-ng",
  grid.name
  ]);

angular.module('vegaMoniter')
  .config([
    '$stateProvider',
    '$locationProvider',
    '$urlRouterProvider',
    function ($stateProvider, $locationProvider, $urlRouterProvider) {
      $stateProvider
        .state('main', {
          url: '',
          abstract:true,
          views:{
            "":{
              template: require('./wrap.html'),
            }
          }
        })
        .state('main.diskCapacity', {
          url: '/disk/capacity',
          views:{
            "wrap":{
              template: require('./disk/capacity/capacity.html'),
              controller: 'DiskCapacityController'
            }
          },
          resolve: {
            load:['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
              var deferred = $q.defer();
              require.ensure([], function (require) {
                
                var mod = require('./disk/capacity');
                
                $ocLazyLoad.load({
                  name: mod.name,
                });
                
                deferred.resolve(mod.controller);
              });

              return deferred.promise;
            }]
          }
        })
        .state('main.diskPerformance', {
          url: '/disk',
          views:{
            "wrap":{
              template: require('./disk/performance/performance.html'),
              controller: 'DiskPerformanceController'
            }
          },
          resolve: {
            load:['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
              var deferred = $q.defer();
              require.ensure([], function (require) {
                
                var mod = require('./disk/performance');
                
                $ocLazyLoad.load({
                  name: mod.name,
                });
                
                deferred.resolve(mod.controller);
              });

              return deferred.promise;
            }]
          }
        })
        .state('main.diskCapacitySize', {
          url: '/disk/csize',
          views:{
            "wrap":{
              template: require('./disk/capacitySize/capacitySize.html'),
              controller: 'DiskCapacitySizeController'
            }
          },
          resolve: {
            load:['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
              var deferred = $q.defer();
              require.ensure([], function (require) {
                
                var mod = require('./disk/capacitySize');
                
                $ocLazyLoad.load({
                  name: mod.name,
                });
                
                deferred.resolve(mod.controller);
              });

              return deferred.promise;
            }]
          }
        })
        .state('main.diskPerformanceSize', {
          url: '/disk/psize',
          views:{
            "wrap":{
              template: require('./disk/performanceSize/performanceSize.html'),
              controller: 'DiskPerformanceSizeController'
            }
          },
          resolve: {
            load:['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
              var deferred = $q.defer();
              require.ensure([], function (require) {
                
                var mod = require('./disk/performanceSize');
                
                $ocLazyLoad.load({
                  name: mod.name,
                });
                
                deferred.resolve(mod.controller);
              });

              return deferred.promise;
            }]
          }
        })
        .state('main.diskCHLayer', {
          url: '/disk/coldhotlayer',
          views:{
            "wrap":{
              template: require('./disk/coldhotlayer/coldhotlayer.html'),
              controller: 'DiskColdhotlayerController'
            }
          },
          resolve: {
            load:['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
              var deferred = $q.defer();
              require.ensure([], function (require) {
                
                var mod = require('./disk/coldhotlayer');
                
                $ocLazyLoad.load({
                  name: mod.name,
                });
                
                deferred.resolve(mod.controller);
              });

              return deferred.promise;
            }]
          }
        })
        .state('main.diskType', {
          url: '/disk/type',
          views:{
            "wrap":{
              template: require('./disk/type/type.html'),
              controller: 'DiskTypeController'
            }
          },
          resolve: {
            load:['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
              var deferred = $q.defer();
              require.ensure([], function (require) {
                
                var mod = require('./disk/type');
                
                $ocLazyLoad.load({
                  name: mod.name,
                });
                
                deferred.resolve(mod.controller);
              });

              return deferred.promise;
            }]
          }
        })
        .state('main.taskOverview', {
          url: '/task',
          views:{
            "wrap":{
              template: require('./task/overview/overview.html'),
              controller: 'taskOverviewController',
            }
          },
          resolve: {
            load:['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
              var deferred = $q.defer();

              require.ensure([], function (require) {
                var mod = require('./task/overview');
                $ocLazyLoad.load({
                  name: mod.name,
                });
                
                deferred.resolve(mod.controller);
              });

              return deferred.promise;
            }]
          }
        })
        .state('main.taskDetail', {
          url: '/task/detail',
          views:{
            "wrap":{
              template: require('./task/detail/detail.html'),
              controller: 'taskDetailController',
            }
          },
          resolve: {
            load:['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
              var deferred = $q.defer();

              require.ensure([], function (require) {
                var mod = require('./task/detail');
                $ocLazyLoad.load({
                  name: mod.name,
                });
                
                deferred.resolve(mod.controller);
              });

              return deferred.promise;
            }]
          }
        })
        .state('main.serve', {
          url: '/serve',
          views:{
            "wrap":{
              template: require('./serve/serve.html'),
              controller: 'serveController',
            }
          },
          resolve: {
            load:['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
              var deferred = $q.defer();

              require.ensure([], function (require) {
                var mod = require('./serve');
                $ocLazyLoad.load({
                  name: mod.name,
                });
                
                deferred.resolve(mod.controller);
              });

              return deferred.promise;
            }]
          }
        });

      //$locationProvider.html5Mode(true);

      $urlRouterProvider.otherwise('/disk');
    }])
  .run(['$rootScope','$state',function($rootScope,$state){
    console.log($state);
    $rootScope.$state = $state;
  }])
