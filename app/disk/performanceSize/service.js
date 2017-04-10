module.exports = function(mod){
	mod.factory('diskPerformanceSizeSrv',['httpUtils',function(httpUtils){
		var urls = {
			listDisks : app.apiPath+"actions/disks",
			GetMetricStatistics:app.apiPath+"actions/GetMetricStatistics"
		}
		
		function listDisks(){
			return httpUtils.httpGet(urls.listDisks);
		}

		function GetMetricStatistics(params){
			return httpUtils.httpPost(urls.GetMetricStatistics,params)
		}

		return {
			listDisks:listDisks,
			GetMetricStatistics:GetMetricStatistics
		}
	}]);
}