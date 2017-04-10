module.exports = function(mod){
	mod.factory('serveSrv',['httpUtils',function(httpUtils){
		var urls = {
			listDisks : app.apiPath+"action/disks",
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