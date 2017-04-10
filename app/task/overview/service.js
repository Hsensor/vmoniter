module.exports = function(mod){
	mod.factory('taskOverviewSrv',['httpUtils','funUtils',function(httpUtils){
		var urls = {
			listGames : app.apiPath+"tasks/listGames",
			getStatusGame:app.apiPath+"tasks/StatusGame"
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
			return httpUtils.httpGet(funUils.dealWithURL(urls.getStatusGame,params))
		}

		return {
			listGames:listGames,
			getStatusGame:getStatusGame
		}
	}]);
}