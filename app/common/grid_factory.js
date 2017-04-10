var EE = require("./EventEmitter");


function dealWithURL(url,params){
    if(params.path){
        url = (url instanceof Array?url:[url]).concat(params.path).join("/");
    }
    if(params.qs){
        var qs = queryString(params.qs);

        if(url.indexOf("?")>1){
            url+=qs;
        }else{
            url+="?"+queryString(params.qs);
        }
    }
    return url;
}


function queryString(data) { 
    if(data){
        var tempArr = []; 
        for (var attr in data){ 
            tempArr.push(encodeURIComponent(attr)+"="+encodeURIComponent(data[attr]));
        }
        return tempArr.join("&");
    }else{
        return "";
    } 
}

function loadData ($scope,$http,gridOptions){
    gridOptions.disabled = true;
    gridOptions.loading = true;

    gridOptions.method = gridOptions.method;

    if(!/get|post|delete|put|patch/i.test(gridOptions.method)){
        throw new Error("expected gridOptions.method have put|post|delete|put|patch value");
    }
    
    var apiUrl = gridOptions.apiUrl;

    if ( gridOptions.requestParamsHandler && typeof gridOptions.requestParamsHandler == "function" ){
        /*requestDataObj
        * {qs:{},data:{}}
        */
        var paramsObj = gridOptions.requestParamsHandler(gridOptions.requestDataObj);
        
        apiUrl = dealWithURL(apiUrl,paramsObj);

    }else{
        throw new Error("expected gridOptions.requestParamsHandler is an function ,but not");
    }

    //客户端排序，并且有数据，直接渲染表格
    if (!gridOptions.sideServerPagination && $scope.allData && !gridOptions.refresh) {
        return loadDataInit($scope,gridOptions,{data:{rows:$scope.allData}});
    }

    if(/get|delete/i.test(gridOptions.method)){
        
        if ( gridOptions.responseHandler && typeof gridOptions.responseHandler === 'function' ){
           gridOptions.responseHandler($http[gridOptions.method](apiUrl)).then(function(result){
                loadDataInit($scope,gridOptions,result);
           },function(result){
                loadDataInit($scope,gridOptions,result);
            })
        } else {
            $http[gridOptions.method](apiUrl).then(function(result){
                loadDataInit($scope,gridOptions,result);
            },function(result){
                loadDataInit($scope,gridOptions,result);
            });
        }
    }else{
        
        if ( gridOptions.responseHandler && typeof gridOptions.responseHandler === 'function' ){
           gridOptions.responseHandler($http[gridOptions.method](apiUrl,paramsObj.data)).then(function(result){
                loadDataInit($scope,gridOptions,result);
           },function(result){
                loadDataInit($scope,gridOptions,result);
           });
        } else {
            $http[gridOptions.method](apiUrl,paramsObj.data).then(function(result){
                loadDataInit($scope,gridOptions,result);
            },function(result){
                loadDataInit($scope,gridOptions,result);
            });
        }
    } 
}


function loadDataInit($scope,gridOptions,result){

    if (result&&result.data&&result.data.rows) {

        if (gridOptions.sideServerPagination) {
            
            $scope.rows = result.data.rows;
            $scope.vm.allSelected = false;
            $scope.currentPage = result.data.currentPage;
            $scope.totalItems = result.data.total;
        }else{
            if ($scope.rows) {
                for (var i = 0;i<$scope.rows.length;i++) {
                    delete $scope.rows[i].selected;
                }
            }
            $scope.vm.allSelected = false;
            $scope.allData = result.data.rows;
            $scope.rows = $scope.allData.slice((gridOptions.currentPage-1)*gridOptions.pageSize,gridOptions.currentPage*gridOptions.pageSize);
            $scope.totalItems = result.data.total || $scope.allData.length; 
        }
        
        gridOptions.EE.emit("loadDataSuccess");
    }else{
        gridOptions.EE.emit("loadDataFailed");
    }
}


function gridFactories(mod){
    mod.factory('dealWithURL', [function(){
        return dealWithURL;
    }]);

    mod.factory('queryString', [function(){
        return queryString
    }]);

    mod.factory('loadData', function(){
        return loadData;
    })

    mod.factory('EE', [function(){
        return EE;
    }])

    mod.factory('paging',['$parse',function($parse){
        return {
            create:function(ctrl,$scope,$attrs){
                ctrl.setNumPages = $attrs.numPages ? $parse($attrs.numPages).assign : angular.noop;
                ctrl.ngModelCtrl = { $setViewValue: angular.noop }; // nullModelCtrl
                ctrl._watchers = [];

                ctrl.init = function(ngModelCtrl){
                    
                    ctrl.ngModelCtrl =  ngModelCtrl;

                    ngModelCtrl.$render = function(){ 
                        ctrl.render();
                    }

                    
                    ctrl.pageSize = $scope.$parent.gridOptions.pageSize;

                    $scope.$watch('totalItems', function(newTotal, oldTotal){
                        if(angular.isDefined(newTotal) || newTotal !== oldTotal){
                            $scope.totalPages = ctrl.calculateTotalPages();
                            ctrl.updatePage();
                        }
                    }); 
                }

                ctrl.calculateTotalPages = function(){
                    var totalPages = ctrl.pageSize< 1 ? 1 : Math.ceil($scope.totalItems/ctrl.pageSize);
                    return Math.max(totalPages||0,1);
                }

                ctrl.render = function(){
                    $scope.page = parseInt(ctrl.ngModelCtrl.$viewValue,10) || 1;
                }

                $scope.selectPage = function(page, evt){
                    if (evt){
                        evt.preventDefault();
                    }

                    var clickAllowed = !$scope.ngDisabled || !evt;

                    if (clickAllowed && $scope.page !== page && page>0 && page <= $scope.totalPages){

                        if (evt && evt.target){
                            evt.target.blur();
                        }

                        ctrl.ngModelCtrl.$setViewValue(page);
                        ctrl.ngModelCtrl.$render();
                       
                    }
                }

                $scope.getText = function(key){
                    return $scope[key+'Text'];
                }

                $scope.noPrevious = function(){
                    return $scope.page ===1;
                }

                $scope.noNext = function(){
                    return $scope.page === $scope.totalPages;
                }

                ctrl.updatePage = function(){
                    ctrl.setNumPages($scope.$parent,$scope.totalPages);

                    if($scope.page > $scope.totalPages){
                        $scope.selectPage($scope.totalPages);
                    }else{
                        ctrl.ngModelCtrl.$render();
                    }
                }

                $scope.$on("$destroy", function(){
                    while(ctrl._watchers.length){
                        ctrl._watchers.shift()();
                    }
                })
            }
        }
    }])

    mod.factory('generateGridDefaultOptions', function(){
        return function generateGridDefaultOptions(configGridOpts){
            var gridDefaultOpts = {
                rowHeight:'auto',
                method:'get',
                showCheckedBox:true,
                mutipleSelected:false,
                //loadingTemplate:"",
                loadingText:"努力加载数据中",
                //noDataTempate:"",
                noDataText:"没有查询到数据",
                responseHandler:function(promise){
                    return promise;
                },
                requestParamsHandler:function(paramsObj){
                    return paramsObj||{};
                },
                requestDataObj:{
                    qs:{},
                    data:{}
                },
                sideServerPagination:false,
                firstText:'First',
                previousText:'Previous',
                nextText:'Next',
                lastText:'Last',
                refresh:true,
                maxSize:7,
                pageSize:10,
                currentPage:1,
                disabled:true,
                loading:true,
                rotate:true,
                forceEllipses:false,
                boundaryLinkNumbers:false,
                boundaryLinks:true,
                directionLinks:true
            }

            var gridOpts = angular.extend(gridDefaultOpts,configGridOpts);
            if(gridOpts.sideServerPagination){
                gridOpts.requestDataObj.qs.pageSize = gridOpts.pageSize;
                gridOpts.requestDataObj.qs.page = gridOpts.currentPage;
            }

            return gridOpts;
        };
    })

}

module.exports = gridFactories;