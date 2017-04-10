module.exports = function($scope,taskDetailSrv,$q,generateGridDefaultOptions,$timeout) {
	var taskStates = [
		{
			name:"全部任务",
			value:"all"
		},
		{
			name:"正在进行任务",
			value:"running"
		},
		{
			name:"已完成任务",
			value:"success"
		},
		{
			name:"失败任务",
			value:"failed"
		}
	]

	var taskTypes = [
		{
			name:"全部任务",
			value:"all"
		},
		{
			name:"GC",
			value:"GC"
		},
		{
			name:"Migrate",
			value:"Migrate"
		},
		{
			name:"DataStore",
			value:"DataStore"
		},
		{
			name:"NFS",
			value:"NFS"
		}
	]

	$scope.taskStates = taskStates;
	$scope.taskState = taskStates[0];

	$scope.taskTypes = taskTypes;
	$scope.taskType =  taskTypes[0]; 
  
  
    $scope.taskGridOptions = generateGridDefaultOptions({
      	apiUrl:"/tasks/ListGame",
      	method:"get",
        columnDefs:[
          {name:"gameid",displayName:"任务ID",cellTemplate:'<div>{{row[columnDef.name]}}</div>'},
          {name:"status",displayName:"任务状态",type:"number",cellTemplate:'<div>{{row[columnDef.name]}}</div>'},
          {name:"eventname",displayName:"任务名称",cellTemplate:'<div>{{row[columnDef.name]}}</div>'},
          {name:"timestamp",displayName:"创建时间",type:"number",cellTemplate:'<div>{{row[columnDef.name]}}</div>'}
        ],
        showCheckedBox:true,
        rowHeight:36,
        rowClass:"row-color",
        //cellSelectClass:"cell-select-style",
        multipleSelected:true,
        //rowCellSelecteTemplate:'<div class="select"><div class="select-inner"></div></div>',
        loading:true,
        rotate:true,
        forceEllipses:true,
        boundaryLinks:true,
        directionLinks:true,
        currentPage:4,
        pageSize:20,
        sideServerPagination:true,
        requestParamsHandler:function(requestDataObj){
            requestDataObj.qs.name="zhangsan";
            requestDataObj.qs.age="18";
            requestDataObj.data = {
                hobi:["soccer","pingpong"]
            }
        	return requestDataObj;
        },
        responseHandler:function(promise){
        	return promise.then(function(result){
                return {data:{rows:result.data.games,total:result.data.total}};
        	});
        },
        onRegisterApi : registerGridApi
    });

    /*$timeout(function(){
        $scope.taskGridOptions.disabled = true;
    },5000)*/


    /*$scope.cellClick = function(row,columnValue){
        console.log(row,columnValue);
    }*/
    $scope.selectPage = function(){
        $scope.taskGridOptions.currentPage = Math.floor(Math.random()*10);
    }
    function registerGridApi(gridApi){
        
        gridApi.appScope.cellClick = function($event,row,columnValue){
            if($event.stopPropagation){
                $event.stopPropagation();
            }

            console.log(arguments);
        }

        gridApi.on("selectedRows",function(selectedRows){
            var curSelectedRow = selectedRows[0];
            if(curSelectedRow){
                taskDetailSrv.getStatusGame({path:[curSelectedRow.gameid]}).then(function(data){
                    console.log('gameid detail',data);
                })  
            }          
        });

        $scope.refresh = function(){
            gridApi.emit("refresh");
        }
        $scope.reload = function(){
            gridApi.emit('reload');
        }
    }

}