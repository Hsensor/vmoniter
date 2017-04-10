var chart = require("./../../core/chart_base");


module.exports = function($scope,$q,diskCapacitySrv,$timeout) {
  $scope.periods = [
    {
      period:60,text:"1分钟"
    },
    {
      period:300,text:"5分钟"
    }
  ];

  var times = [];
  $scope.period = $scope.periods[0];

  $scope.times = [
  {
    time:0.5*60*60*1000,text:"近0.5小时"
  },
  {
    time:1*60*60*1000,text:"近1小时"
  },{
    time:2*60*60*1000,text:"近2小时"
  },{
    time:3*60*60*1000,text:"近3小时"
  }]

  $scope.timeObj = $scope.times[0];
  $scope.loadHostChart = loadHostChart;

  $scope.init = refreshByTimeRange;


  $scope.hostCharts = [];

  initLoad($scope.timeObj.time);

  function initLoad(diffTime){
    var hosts = [];
    var hostsObj = {};
    $scope.hostCharts = [];
    
    diskCapacitySrv.listDisks()
    .then(function(result){
      var disks = result.entities;

      for (var i =0;i<disks.length;i++) {
        if(!hostsObj[disks[i].cvmIpAddress]){
          hostsObj[disks[i].cvmIpAddress] = {
            hostIp:disks[i].cvmIpAddress,
            disks:[]
          }
        }
        var curHostObj = hostsObj[disks[i].cvmIpAddress];
        curHostObj.disks.push(disks[i]);
      }

      for(var attr in hostsObj){
        hostsObj[attr].disks.sort(function(diskA,diskB){
          if(diskA.storageTierName && diskB.storageTierName){
            return diskA.storageTierName.localeCompare(diskB.storageTierName);
          }
        })
      }
      
      for(var attr in hostsObj){
        hosts.push(hostsObj[attr]);
      }

      hosts.sort(function(hostA,hostB){
        return hostA.hostIp.match(/\d+$/)[0]-hostB.hostIp.match(/\d+$/)[0];
      });

      for(var i = 0;i<hosts.length;i++){
        hosts[i].type = "hostIp"+ hosts[i].hostIp.match(/\d+$/)[0];
      }

      $scope.hosts = hosts;

      loadHostChart(diffTime,hosts[0]);
    })
  }


  function refreshByTimeRange(diffTime){
    
    for(var i=0;i<times.length;i++){
      $timeout.cancel(times[i]);
    }
    times.splice();

    var flag = false;
    $scope.hostCharts.splice(0);

    for(var i=0;i<$scope.hosts.length;i++){
      if ($scope.hosts[i].checked) {
        flag = true;

        init(createStartEndISOString(diffTime),$scope.hosts[i]);
      }
    }
    if(!flag){
      $scope.hosts[i].checked = true;
      init(createStartEndISOString(diffTime),$scope.hosts[0]);
    }
  }

  function loadHostChart(diffTime,host){
    if(host.checked){
      host.checked = !host.checked;

      for(var i=0;i<$scope.hostCharts.length;){
        if($scope.hostCharts[i].hostIp == host.hostIp){
          $scope.hostCharts.splice(i,1);
        }else{
          i++;
        }
      } 
    }else{
      host.checked = !host.checked;
      init(createStartEndISOString(diffTime),host)
    }
  }



  function createStartEndISOString(diffTime){
    var curDate = new Date();
    var endISO_T = curDate.toISOString().replace(/\.\d+(?=Z$)/,"");
    var startISO_T = new Date(curDate.getTime()-diffTime).toISOString().replace(/\.\d+(?=Z$)/,"");
    return {
      startISO_T : startISO_T,
      endISO_T : endISO_T
    }
  }
  
  function init(timeObj,hostObj){

    var baseOptions = {
      statistics: "Average",
      metric_name: "disk_usage",
      startISO_T: timeObj.startISO_T,
      endISO_T: timeObj.endISO_T,
      period: $scope.period.period
    };

    var disksPromise = [];

    for(var i=0;i<hostObj.disks.length;i++){
      var tempOptions = angular.copy(baseOptions);
        
      tempOptions.cluster_uuid = hostObj.disks[i].clusterUuid;
      tempOptions.disk_uuid = hostObj.disks[i].diskUuid;

      disksPromise.push(diskCapacitySrv.GetMetricStatistics(
        {
          "version":"2010-08-01",
          "namespace":"vega",
          "statistics":tempOptions.statistics,
          "metric_name":tempOptions.metric_name,
          "start_time":tempOptions.startISO_T,
          "end_time":tempOptions.endISO_T,
          "period":tempOptions.period,
          "dimensions":[
            {"name":"cluster_uuid","value":tempOptions.cluster_uuid},
            {"name":"disk_uuid","value":tempOptions.disk_uuid}
          ]
        }
      ))
    };

    $q.all(disksPromise).then(function(result){
      times.push($timeout(function(){
        refreshByTimeRange($scope.timeObj.time);
      },$scope.period.period*1000));
      drawChart({type:hostObj.type,hostIp:hostObj.hostIp,lines:result,disks:hostObj.disks});
    })

  }

  function drawChart(lineObj){
    var lines = [];
    var categories = [];
    
    for(var i=0;i<lineObj.lines.length;i++){
      lineObj.lines[i].datapoints.sort(function(a,b){
        return a[0]-b[0];
      })
    }

    var tempObj ={};

    for(var i=0;i<lineObj.lines.length;i++){
      var curDatapoints = lineObj.lines[i].datapoints;
      for(var j=0;j<curDatapoints.length;j++){
        if(!tempObj[curDatapoints[j][0]]){
          tempObj[curDatapoints[j][0]] = curDatapoints[j][0]
          categories.push(curDatapoints[j][0]);
        }
      }
    }
    tempObj = null;



    for(var i=0;i<lineObj.lines.length;i++){
      var tempArr = [];
      var curLine = lineObj.lines[i];
      var start = 0;

      for(var j=0;j<categories.length;j++){
        if(curLine.datapoints[start]&&(curLine.datapoints[start][0]!=categories[j])){
          tempArr.push([categories[j],0]);
        }else{
          if(curLine.datapoints[start]){
            tempArr.push(curLine.datapoints[start]);
          }else{
            tempArr.push([categories[start],0])
          }
          start++;
        }
      }
      lineObj.lines[i].datapoints = tempArr;
    }

    for(var i=0;i<lineObj.lines.length;i++){
      var temp = {name:lineObj.disks[i].storageTierName+"("+/[^\/]+$/.exec(lineObj.disks[i].mountPath)[0]+")",data:[]};
      lines.push(temp);
      
      for(var j=0;j<lineObj.lines[i].datapoints.length;j++){
        temp.data.push(lineObj.lines[i].datapoints[j][1]);
      }
    }

    chart.chartOptions.loading = true;
    $scope.hostCharts.push(chart.initChartOption($scope,{name:lineObj.type},chart.chartOptions,function(scopeChart){
      scopeChart.loading = false;
      scopeChart.options.tooltip = {
        formatter: function () {
            var s = '<b>' +  Highcharts.dateFormat('%m-%d %H:%M:%S',this.x) + '</b>';
            this.points.forEach(function(item,index){
              s += '<br/><tspan x="8" dy="15" style="fill:'+item.series.color+'">●'+ item.series.name + ' ' +
                    chart.conversion(item.y,{decimalCount:2})+"/"+chart.conversion(lineObj.disks[index].diskSize,{decimalCount:2})+"("+Math.ceil(item.y/lineObj.disks[index].diskSize*10000)/100+"%)</tspan>";
            })

            return s;
        },
        shared: true
      }
      scopeChart.yAxis.labels.formatter = function(){
        return chart.conversion(this.value,{decimalCount:2});
      };
      scopeChart.xAxis.categories = categories;
      scopeChart.xAxis.labels.formatter = function  () {
        return Highcharts.dateFormat('%H:%M',this.value);
      }
      scopeChart.titleText = lineObj.hostIp;
      scopeChart.series = lines;
      scopeChart.hostIp = lineObj.hostIp;
    }));
    
    $scope.hostCharts.sort(function(hostA,hostB){
      return hostA.hostIp.match(/\d+$/)[0]-hostB.hostIp.match(/\d+$/)[0];
    })
  }

  function clearTimer(){
    for(var i=0;i<times.length;i++){
      $timeout.cancel(times[i]);
    }
    times.splice();
  }

  $scope.$on('$destroy', clearTimer);
}
