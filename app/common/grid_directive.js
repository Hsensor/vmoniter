module.exports = function Grid(module){
    require("./grid.css");

    module.directive("grid",['loadData','EE',function(loadData,EE){
        return {
            restrict:"EA",
            replace:true,
            scope:{
                gridOptions:"="
            },
            template:require("./grid.html"),
            //templateUrl:"/vega_monitor_client/app/common/grid.html",//require("./grid.html"),
            controller:['$scope','$http','$timeout',function($scope,$http,$timeout){
                var gridOptions = $scope.gridOptions;
                if(!gridOptions){
                    throw new Error("gridOptions is not existly");
                }
                gridOptions.rowHeight = gridOptions.rowHeight;

                var EEInstance = new EE();
                $scope.gridApi = gridOptions.EE = EEInstance;
                initColumnDefs();
                initBlankRows(gridOptions,$scope);

                gridOptions.EE.on("loadDataSuccess",function(){
                    gridOptions.loading =  false;
                    gridOptions.disabled = false;
                    gridOptions.refresh = false;

                    initBlankRows(gridOptions,$scope);
                });

                gridOptions.EE.on("loadDataFailed",function(){
                    gridOptions.disabled = false;
                    gridOptions.loading =  false;
                    gridOptions.refresh = false;
                });

                gridOptions.EE.on("refresh",function(){
                    gridOptions.refresh = true;
                    
                    if(gridOptions.currentPage!==1){
                        gridOptions.currentPage = 1;
                    }else{
                        gridOptions.EE.emit("loadDataStart");
                    }
                });

                gridOptions.EE.on("reload",function(){
                    gridOptions.refresh = true;
                    gridOptions.EE.emit("loadDataStart");
                })

                gridOptions.EE.on("loadDataStart",function(){
                    loadData($scope,$http,gridOptions);
                })

                $scope.gridApi.appScope = $scope.$parent;
                $scope.selecedtHandler = selecedtHandler;
                $scope.checkAllSelected = checkAllSelected;

                $scope.gridOptions.onRegisterApi($scope.gridApi);
                
                $scope.$watch("gridOptions.currentPage",function(newVal,oldVal){
                    if(gridOptions.apiUrl){
                        gridOptions.EE.emit("loadDataStart");
                    }else{
                        if(gridOptions.data){
                             if( gridOptions.data.rows ){
                                $scope.rows = gridOptions.data.rows;
                            }
                            $scope.totalCount = gridOptions.data.total||$scope.rows.length;
                        }
                    }
                });

                function initBlankRows(gridOptions,$scope){
                    if(gridOptions.pageSize){
                        $scope.blankRows = [];
                        var i;

                        if($scope.rows&&$scope.rows.length){
                            i = $scope.rows.length;
                        }
                        i = i||0;

                        if(i<gridOptions.pageSize){
                            for(; i<gridOptions.pageSize;i++){
                                $scope.blankRows.push(i);
                            }
                        }
                    }else{
                        console.warn("expected gridOptions.pageSize is an number")
                    }
                }

                function initColumnDefs(){
                    $scope.vm = {};
                    $scope.vm.multipleSelected = $scope.gridOptions.multipleSelected;

                    $scope.vm.allSelected = false;

                    $scope.columnDefs = angular.forEach($scope.gridOptions.columnDefs,function(item){
                        item.flag = 1;
                        item.active = false;
                    });
                }

                //全选，全不选
                function selecedtHandler(){
                    if($scope.vm.multipleSelected){
                        if($scope.vm.allSelected){
                            $scope.vm.allSelected = false;
                            for(var i=0;i<$scope.rows.length;i++){
                                $scope.rows[i].selected = false;
                            }

                        }else{
                            $scope.vm.allSelected = true;
                            for(var i=0;i<$scope.rows.length;i++){
                                $scope.rows[i].selected = true;
                            }
                        }

                        checkAllSelected();
                    }
                }

                //检查是否为全选
                function checkAllSelected (){
                    if($scope.rows.length){
                        for(var i=0;i<$scope.rows.length;i++){
                            if(!$scope.rows[i].selected){
                                allSelected = $scope.vm.allSelected = false;
                                return $scope.gridApi.emit("selectedRows",findSelectedRows());
                            }
                        }
                        $scope.vm.allSelected = true;
                    }
                    return $scope.gridApi.emit("selectedRows",findSelectedRows());
                
                }

                //查询所选择的rows
                function findSelectedRows(){
                    var selectedRows = [];
                    for(var i=0;i<$scope.rows.length;i++){
                        if($scope.rows[i].selected){
                            selectedRows.push($scope.rows[i]);
                        }
                    }
                    return selectedRows;
                }
            }],
            link:function(scope,ele,attrs,parentCtrl){
                scope.rowClick = function(curRow){
                    if(!scope.vm.multipleSelected){
                        if(!curRow.selected){
                            for(var i=0;i<scope.rows.length;i++){
                                scope.rows[i].selected = false;
                            }
                            curRow.selected = true;
                        } else {
                            curRow.selected = !curRow.selected;
                        }
                    }else{
                        curRow.selected = !curRow.selected;
                    }

                    scope.checkAllSelected();

                }
                scope.columnSortHandler = function(columnDef){
                    if(scope.rows&&scope.rows.length){
                        if(!columnDef.notSorted){
                            angular.forEach(scope.columnDefs,function(item){
                                item.active = false;
                            });
                            columnDef.active = true;

                            if(columnDef.sortHandler){

                                scope.rows = scope.rows.sort(function(rowA,rowB){
                                    return columnDef.sortHandler(rowA,rowB)*columnDef.flag;
                                }) 
                            }else{
                                scope.rows = defaultSortRule(columnDef);
                            }
                            columnDef.flag*=-1;
                        }
                    }
                }

                function defaultSortRule(columnDef){
                    var columnDefKeys = columnDef.name.split(".");

                    return scope.rows.sort(function(rowA,rowB){
                        var rowAKeyValue = rowA,rowBKeyValue = rowB;

                        for(var i=0;i<columnDefKeys.length;i++){
                            rowAKeyValue = rowAKeyValue[columnDefKeys[i]];
                            rowBKeyValue = rowBKeyValue[columnDefKeys[i]];
                        }
                        if(columnDef.type=="number"){
                            return ((rowAKeyValue-rowBKeyValue)>=0?1:-1)*columnDef.flag;
                        }else{
                            return stringCompare(rowAKeyValue,rowBKeyValue)*columnDef.flag;
                        }
                    })
                }

                function stringCompare(strA,strB){
                    if(strA&&strB){
                        strA = String(strA),strB = String(strB);

                        var minLen = strA.length<strB.length?strA.length:strB.length;

                        for(var i=0;i<strA.length;i++){
                            if(strA.charCodeAt(i)>strB.charCodeAt(i)){
                                return 1
                            }else if(strA.charCodeAt(i)<strB.charCodeAt(i)){
                                return -1
                            }else{
                                continue;
                            }
                        }
                        if(strA.length>strB.length){
                            return 1;
                        }else if(strA.length<strB.length){
                            return -1;
                        }
                        return 0;
                    }
                }
            }
        }
    }]);
    module.directive("gridCell",function(){
        return {
            restrict:"AE",
            controller:['$scope','$element','$attrs','$compile',function($scope,$element,$attrs,$compile){
                $scope.$watch($attrs.celltemplate,function(html){
                    $element.append($compile(html)($scope));
                    
                })
            }]
        }
    });
    module.directive("gridHeaderCell",function(){
        return {
            restrict:"EA",
            template:'<div></div>',
            replace:true,
            controller:['$scope','$element','$attrs','$compile',function($scope,$element,$attrs,$compile){
                $scope.$watch($attrs["headercelltemplate"],function(html){
                    $element.append($compile(html)($scope));
                })
            }]
        }
    });
    module.directive("gridSelecteCell",function(){
        return {
            restrict:"EA",
            replace:true,
            template:'<div class="select-cell"></div>',
            controller:['$scope','$element','$attrs','$compile',function($scope,$element,$attrs,$compile){
                $scope.$watch($attrs.rowcellselectetemplate,function(html){
                    $element.append($compile(html)($scope));
                })
            }]
        }
    });


    module.controller("paginationController",['$scope','$attrs','$parse','paging' ,function($scope,$attrs,$parse,paging){
        var ctrl = this;

        var maxSize = $scope.$parent.gridOptions.maxSize,
            rotate = $scope.$parent.gridOptions.rotate,
            forceEllipses = $scope.$parent.gridOptions.forceEllipses,
            boundaryLinkNumbers = $scope.$parent.gridOptions.boundaryLinkNumbers,
            pageLabel = angular.identity;

        $scope.boundaryLinks = $scope.$parent.gridOptions.boundaryLinks;
        $scope.directionLinks = $scope.$parent.gridOptions.directionLinks;
        $scope.EE = $scope.$parent.gridOptions.EE;


        paging.create(this, $scope, $attrs);

        function makePage(number, text, isActive){
            return {
                number: number,
                text: text,
                active: isActive
            };
        }

        function getPages(currentPage, totalPages){
            var pages = [];

            var startPage = 1, endPage = totalPages;
            var isMaxSized = angular.isDefined(maxSize) && maxSize < totalPages;

            if (isMaxSized) {
                if (rotate) {
                    startPage = Math.max(currentPage - Math.floor(maxSize/2),1);
                    endPage = startPage + maxSize - 1;

                    if(endPage>totalPages){
                        endPage = totalPages;
                        startPage = endPage-maxSize + 1;
                    }
                } else {
                    startPage = (Math.ceil(currentPage/maxSize)-1)*maxSize + 1;
                    endPage =Math.min(startPage + maxSize - 1,totalPages);
                }
            }

            for (var number = startPage; number <= endPage; number++) {
                var page = makePage(number, pageLabel(number), number === currentPage);
                pages.push(page);
            }

            if (isMaxSized && maxSize > 0 &&(!rotate || forceEllipses || boundaryLinkNumbers)){
                if (startPage > 1) {
                    if (!boundaryLinkNumbers || startPage>3) {
                        var previousPageSet = makePage(startPage - 1,'...',false);
                        pages.unshift(previousPageSet);
                    }
                    if (boundaryLinkNumbers) {
                        if(startPage ===3 ){
                            var secondPageLink = makePage(2, '2', false);
                            pages.unshift(secondPageLink);
                        }

                        var firstPageLink = makePage(1, '1', false);
                        pages.unshift(firstPageLink);
                    }
                }

                if (endPage < totalPages) {
                    if (!boundaryLinkNumbers || endPage < totalPages - 2) {
                        var nextPageSet = makePage(endPage + 1,'...',false);
                        pages.push(nextPageSet);
                    }

                    if (boundaryLinkNumbers) {
                        if (endPage === totalPages - 2) {
                            var secondToLastPageLink = makePage(totalPages-1, totalPages-1,false);
                            pages.push(secondToLastPageLink);
                        }

                        var lastPageLink = makePage(totalPages, totalPages, false);
                        pages.push(lastPageLink);
                    }
                }
            }

            return pages;

        }

        var originalRender = this.render;
        this.render = function(){
            originalRender();
            if($scope.page >0 && $scope.page <= $scope.totalPages){
                $scope.pages = getPages($scope.page,$scope.totalPages);
            }
        }

    }]);

    module.directive("pagination",function(){
        return {
            scope:{
                totalItems:'=',
                firstText:'=',
                previousText:'=',
                nextText:'=',
                lastText:'=',
                ngDisabled:"=",
                requestDataObj:"="
            },
            require:['pagination','?ngModel'],
            restrict:'A',
            controller:'paginationController',
            controllerAs:'pagination',
            //templateUrl:"/vega_monitor_client/app/common/pagination.html",
            template:require("./pagination.html"),
            link: function(scope,element,attrs,ctrls){
                element.addClass('pagination');
                var paginationCtrl = ctrls[0], ngModelCtrl = ctrls[1];

                if(!ngModelCtrl){
                    return;
                }

                paginationCtrl.init(ngModelCtrl);
            }
        }
    })

}