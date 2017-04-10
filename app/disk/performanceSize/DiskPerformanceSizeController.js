var chart = require("./../../core/chart_base");


module.exports = function($scope,$q,diskPerformanceSizeSrv,$timeout) {
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
      time:20*60*1000,text:"近20分钟"
    },
    {
      time:0.5*60*60*1000,text:"近0.5小时"
    },
    {
      time:1*60*60*1000,text:"近1小时"
    },
    {
      time:2*60*60*1000,text:"近2小时"
    },
    {
      time:3*60*60*1000,text:"近3小时"
    }
  ]

  $scope.timeObj = $scope.times[0];

  $scope.init = init;
  var hdd_disks = [];
  var ssd_disks = [];
  var disksObj ;

	init($scope.timeObj.time);
  
  function init(diffTime){    
    var curDate = new Date();
    var endISO_T = curDate.toISOString().replace(/\.\d+(?=Z$)/,"");
    var startISO_T= new Date(curDate.getTime()-diffTime).toISOString().replace(/\.\d+(?=Z$)/,"");
    
    var baseOptions = {
      statistics: "Average",
      metric_name: "disk_usage",
      startISO_T: startISO_T,
      endISO_T: endISO_T,
      period: $scope.period.period
      //cluster_uuid: result.entities[i].clusterUuid,
      //disk_uuid: result.entities[i].diskUuid
    };

    listDisks(baseOptions);
  }
   
  function listDisks(baseOptions){
    for(var i=0;i<times.length;i++){
      $timeout.cancel(times[i]);
    }
    times.splice();

    diskPerformanceSizeSrv.listDisks().then(function(result){
      var HDD_disks = [];
      var SSD_disks = [];
      result.entities.sort(function(a,b){
        return a.cvmIpAddress.match(/\.(\d+)$/)[1]-b.cvmIpAddress.match(/\.(\d+)$/)[1];
      });
      disksObj = result;

      for(var i=0;i<result.entities.length;i++){
        var tempOptions = angular.copy(baseOptions);
          tempOptions.cluster_uuid = result.entities[i].clusterUuid;
          tempOptions.disk_uuid = result.entities[i].diskUuid;
        
        if(result.entities[i].storageTierName=="HDD"){
          
          hdd_disks.push(result.entities[i]);
          HDD_disks.push(diskPerformanceSizeSrv.GetMetricStatistics(
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
              ],
              type:"hdd"
            }
          ));
        }else{
          ssd_disks.push(result.entities[i]);
          SSD_disks.push(diskPerformanceSizeSrv.GetMetricStatistics(
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
              ],
              type:"ssd"
            }
          ));
        }
      }
      return {
        hdd:HDD_disks,
        ssd:SSD_disks
      }
    }).then(function(result ){
      $q.all(result.ssd).then(function(result){
        times.push($timeout(function(){
          init($scope.timeObj.time);
        },$scope.period.period*1000));
        drawChart({type:"SSDChart",lines:result})
      })


    });
  }
  //statistics Average Sum Minimum Maximum

  function drawChart(lineObj){
    var lines = [];
    var categories = [];
    var colors ;
    var series;
    
    if(lineObj.type=="HDDChart"){
      series = hdd_disks;
      colors =  ["#989898","#A4BEC5","#7CB6C7","#58BBD8","#0190D6","#0369B1","#115481"];
    }else{
      series = ssd_disks;
      colors = ["#EBDB02","#F1AB27","#EA912B","#C37429","#822F29","#DD561F","#AC3B29","#CE281C"]
    }
    
    var perLineCountPoint=[];

    for(var i=0;i<lineObj.lines.length;i++){
      lineObj.lines[i].datapoints.sort(function(a,b){
        return a[0]-b[0];
      })
      perLineCountPoint.push(lineObj.lines[i].datapoints.length);
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
      var temp = {
        name:series[i].cvmIpAddress+"("+/[^\/]+$/.exec(series[i].mountPath)[0]+")",
        data:[],
        total:series[i].diskSize,
        color:colors[i]
      };
      lines.push(temp);
      
      for(var j=0;j<lineObj.lines[i].datapoints.length;j++){
        temp.data.push(lineObj.lines[i].datapoints[j][1]);
      }
    }

    chart.chartOptions.loading = true;
    chart.initChartOption($scope,{name:lineObj.type},chart.chartOptions,function(scopeChart){
      scopeChart.loading = false;
      scopeChart.options.tooltip = {
        formatter: function () {
            var s = '<b>' +  Highcharts.dateFormat('%m-%d %H:%M:%S',this.x) + '</b>';
            this.points.forEach(function(item,index){
              s += '<br/><tspan style="fill:'+item.series.color+'" x="8" dy="15">●'+ item.series.name + ': ' +
                    chart.conversion(item.y,{decimalCount:2})+"/"+chart.conversion(series[index].diskSize,{decimalCount:2})+"("+Math.ceil(item.y/series[index].diskSize*10000)/100+"%)</tspan>";
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
      scopeChart.series = lines;
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
