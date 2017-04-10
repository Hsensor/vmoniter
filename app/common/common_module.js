var mod = angular.module('common', []);

mod.factory('httpUtils',["$http","$q",function($http,$q){ 
        var funcs = {
            "httpGet" : httpGet,
            "httpPost" : httpPost,
            "httpPut" : httpPut,
            "httpDelete" : httpDelete,
            "httpPatch" : httpPatch
        }; 
        return funcs;
        
        function httpGet(url){
            var deferred = $q.defer(),
            dataPromise = deferred.promise;
            if(url.indexOf('?') == -1){//prevent from cache
                url+="?";
            }
            else{
                (url[url.length-1] != '&') && (url+="&"); 
            }
            url+="dt="+Math.random();
            
            $http.get(url).then(function(result) {
                deferred.resolve(result.data);
            }).catch(function(result) {
                deferred.reject(result.data);
            });
            return dataPromise;
        }

        function httpDelete(url){
            var deferred = $q.defer(),
            dataPromise = deferred.promise;
            $http["delete"](url).then(function(result) { 
                deferred.resolve(result.data);
            }).catch(function(result) {
                deferred.reject(result.data);
            });
            return dataPromise;
        }
        
        function httpPost(url,data){
            var deferred = $q.defer(),
            dataPromise = deferred.promise;
            $http.post(url,data).then(function(result) { 
                deferred.resolve(result.data);
            }).catch(function(result) {
                deferred.reject(result.data);
            });
            return dataPromise;
        }

        function httpPut(url,data){
            var deferred = $q.defer(),
            dataPromise = deferred.promise;
            $http.put(url,data).then(function(result) { 
                deferred.resolve(result.data);
            }).catch(function(result) {
                deferred.reject(result.data);
            });
            return dataPromise;
        }

         function httpPatch(url,data){
            var deferred = $q.defer(),
            dataPromise = deferred.promise;
            $http.patch(url,data).then(function(result) { 
                deferred.resolve(result.data);
            }).catch(function(result) {
                deferred.reject(result.data);
            });
            return dataPromise;
        }
    }
]);

mod.factory("funUtils",[function(){
    
    /**
    * params
    * {
    *   path,[]
    *   qs, obj
    *   data json
    * }
    */
    function dealWithURL(url,params){
        if(params.path){
            url = (url instanceof Array?url:[url]).concat(params.path).join("/");
        }
        if(params.qs){
            var qs = queryString(params.qs);

            if(url.indexOf("?")){
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
    
    function execParseQS(url){
        var tempa=null;
        var reg=/([^=?&]+)=([^=?&]+)/g;
        var resultObj={}
        while( tempa=reg.exec(url)){
            resultObj[decodeURIComponent(tempa[1])]=decodeURIComponent(tempa[2]);         
        }
        
        return resultObj;
    }

    return {
        queryString: queryString,
        execParseQS: execParseQS,
        dealWithURL: dealWithURL
    }

}])

mod.directive("initSearch",function(){
    return {
        restrict:'E',
        template:'<div class="mb-15">'+
            '<div class="row">'+
                '<div class="col-xs-3">'+
                    '<div class="input-group">'+
                        '<div class="input-group-addon"> 粒度:</div><select class="form-control input-sm"  ng-model="period" ng-options="period.text for period in periods" ng-change="refresh(timeObj.time)"></select>'+
                    '</div>'+
                '</div>'+

                '<div class="col-xs-3">'+
                    '<div class="input-group">'+
                        '<div class="input-group-addon"> 时间范围:</div><select class="form-control input-sm" ng-model="timeObj" ng-options="timeObj.text for timeObj in times"  ng-change="refresh(timeObj.time)"></select>'+
                    '</div>'+
                '</div>'+
                '<div class="col-xs-1 pull-right">'+
                    '<button class="pull-right btn btn-default btn-sm" ng-click="refresh(timeObj.time)"><span class="glyphicon glyphicon-refresh"></span>刷新</button>'+
                '</div>'+
            '</div>'+
        '<div>',
        scope:{
            times:"=",
            timeObj:"=",
            periods:"=",
            period:"=",
            init:"&"
        },
        replace:true,
        controller:['$scope','$timeout',function($scope,$timeout){
            $scope.refresh = function(diffTime){
                $timeout(function(){
                    $scope.init()(diffTime);
                })
            }
        }],
        link:function(scope,ele,attrs,parentCtrl){

        }
    }
});
mod.filter("unit_conversion",function(){
    /**
    * byteSize number required
    * opt  {}    options
    * startUnit BYTE
    * use like this 
    * conversion(1024*1024*1024) =>1GB
    * conversion(1024*1024*1024,{endUnit:"GB"}) =>1024*1024GB
    * conversion(1024*1024*1024,{startUnit:"KB"}) =>1TB
    * conversion(1024*1024*1024,{startUnit:"KB",endUnit:"GB"}) =>1024*1024GB
    * conversion(1024*1024*1024,{needNotUnit:false,endUnit:"GB"}) =>1GB
    * conversion(1024*1024*1024,{needNotUnit:false,startUnit:"KB",endUnit:"GB"}) =>1024GB
    * conversion(1024*1024,{needNotUnit:true,startUnit:"GB",endUnit:"MB"}) => 1073741824
    */
    return function conversion(byteSize,opt){
        opt = opt||{};
        if(!byteSize){
            return 0;
        }
        var unit = ["BYTE","KB","MB","GB","TB"];
        var start = 0,end = unit.length-1;

        
        if(opt.startUnit){
            start = unit.indexOf(opt.startUnit.toUpperCase());
        }
        if(opt.endUnit){
            end = unit.indexOf(opt.endUnit.toUpperCase());
        }

        var resultSize = unit_conversion(byteSize, opt, start, end);

        if(!opt.needNotUnit){
            if(typeof opt.decimalCount !=="undefined"){
                return resultSize.size.toFixed(opt.decimalCount) + unit[resultSize.unit];
            }else{
                return resultSize.size + unit[resultSize.unit];
            }
        }else{
            if(typeof opt.decimalCount!=="undefined"){
                return resultSize.size.toFixed(opt.decimalCount);
            }else{
                return resultSize.size;
            }
        }
    }

    function unit_conversion(byteSize, opt, start, end){
        //10 byte--->mb
        if (opt.endUnit && start < end) {
            start++;
            byteSize = byteSize / 1024;
            return unit_conversion(byteSize, opt, start, end)
        }

        if (opt.startUnit && opt.endUnit && start > end) {
            start--;
            byteSize = byteSize * 1024;
            return unit_conversion(byteSize, opt, start, end);
        }

        if (byteSize >= 1024 && start < end) {
            start++;
            byteSize = byteSize / 1024;
            return unit_conversion(byteSize, opt, start, end) //arguments.callee(byteSize);
        }

        return {size:Number(byteSize),unit:start};
    }

})

mod.filter("conversionDate",['$filter',function($filter){
    return function(date,formater){
        date = new Date(date);
        return $filter('date')(date,formater);
    }
}])

mod.directive('contenteditable',function(){
    return {
        require:'ngModel',
        link:function(scope,elm,attrs,ctrl){
            elm.bind('keyup',function(){
                //scope.$apply(function(){
                    ctrl.$setViewValue(elm.text());
                //})
            });

            ctrl.$render = function(){
                debugger;
                elm.html(ctrl.$setViewValue);
            }
            console.log(111);
            ctrl.$setViewValue(elm.html());
        }
    }
})

module.exports = mod;