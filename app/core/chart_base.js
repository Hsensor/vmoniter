exports.chartOptions = {
    "options": {
        "chart": {
            "type": "column"
        },
        legend: {
            enabled: true
        },
        "plotOptions": {
            "series": {
                marker: {  
                    enabled: false, 
                    radius:1, 
                    states: {  
                        hover: {  
                            enabled: true                       
                        }  
                    },
                    symbol: 'circle' 
                }, 
                shadow:false
                /*point: {
                    events: {
                        mouseOver: function () {
                            var y =this.y;
                            $scope.$apply(function(){
                                $scope.usageSummaryOptions.y = y;
                            })
                        }
                    }
                },
                events: {
                    mouseOut: function () {
                        $scope.$apply(function(){
                            $scope.usageSummaryOptions.y=null;
                        })
                    }
                }*/
            },
            /*column: {
                dataLabels: {
                    enabled: true
                }
            }*/
        },
        /*tooltip: {
            formatter: function () {
                var s = '<b>' +  Highcharts.dateFormat('%Y-%m-%d %H:%M:%S',this.x) + '</b>';

                $.each(this.points, function () {
                    s += '<br/>' + this.series.name + ': ' +
                        conversion(this.y,{startUnit:"KB",decimalCount:2});
                });

                return s;
            },
            shared: true
        }*/
    },
    "series": [],
    "title": {
        "text": null
    },
    "credits": {
        "enabled": false
    },
    loading:true,
    yAxis: {
        lineColor: 'rgb(192, 208, 224)',
        lineWidth: 1,
        labels:{
            enabled:true,
            align:"left",
            x:0,
            y:0
        },
        type:"linear",
        endOnTick: false,
        maxPadding: 0.25,
        title:{
            text:null
        }
    },
    xAxis:{
        type: 'datetime',
        dateTimeLabelFormats:{
            minute:"%H:%M"
        },
        labels:{
            enabled:true,
        },
        tickLength:5,
        crosshair: true
    },
};

exports.chartPieOptions = {
    options: {
        chart: {
            type: "pie"
        },
        legend: {
            enabled: true
        },
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    format: '{point.name}: {point.y:.1f}%'
                }
            }
        },
    },
    series: [],
    title: {
        text: null
    },
    credits: {
        enabled: false
    },
    loading:true,  
};

exports.initChartOption = function (scope,metric,baseOptions,callBack){
    scope[metric.name] = angular.copy(baseOptions);
    
    scope[metric.name].color = metric.color
    callBack(scope[metric.name]);
    return scope[metric.name];
}
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
function conversion(byteSize,opt){
    opt = opt||{};
    if(!byteSize){
        return 0;
    }
    var unit = ["BYTE","KB","MB","GB","TB"];
    var start = 0,end = unit.length-1;

    function unit_conversion(byteSize){
        //10 byte--->mb
        if (opt.endUnit && start < end) {
            start++;
            byteSize = byteSize / 1024;
            return unit_conversion(byteSize)
        }

  if (opt.startUnit && opt.endUnit && start > end) {
    start--;
    byteSize = byteSize * 1024;
    return unit_conversion(byteSize);
  }

        if (byteSize >= 1024 && start < end) {
            start++;
            byteSize = byteSize / 1024;
            return unit_conversion(byteSize) //arguments.callee(byteSize);
        }
  
        return Number(byteSize);
    }
    if(opt.startUnit){
        start = unit.indexOf(opt.startUnit.toUpperCase());
    }
    if(opt.endUnit){
        end = unit.indexOf(opt.endUnit.toUpperCase());
    }
    if(!opt.needNotUnit){
        if(typeof opt.decimalCount !=="undefined"){
            return unit_conversion(byteSize).toFixed(opt.decimalCount)+unit[start];
        }else{
            return unit_conversion(byteSize)+unit[start];
        }
    }else{
        if(typeof opt.decimalCount!=="undefined"){
            return unit_conversion(byteSize).toFixed(opt.decimalCount);
        }else{
            return unit_conversion(byteSize);
        }
    }
}
exports.conversion = conversion;