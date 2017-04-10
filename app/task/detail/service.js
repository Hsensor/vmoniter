module.exports = function(mod){
	mod.factory('taskDetailSrv',['httpUtils','funUtils',function(httpUtils,funUtils){
		var urls = {
			listGames : "/tasks/listGames",
			getStatusGame:"/tasks/StatusGame"
		}
		
		function listGames(){
			return httpUtils.httpGet(urls.listGames);
		}

		/**
		* params
		* {
		*	path,[]
		*   qs, obj
		*   data json
		* }
		*/
		function getStatusGame(params){
			return httpUtils.httpGet(funUtils.dealWithURL(urls.getStatusGame,params))
		}

		return {
			listGames:listGames,
			getStatusGame:getStatusGame
		}
	}]);
}