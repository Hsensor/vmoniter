
var express = require('express');
var router = express.Router();
var http = require("http");
function randGames(count){
  var games = [];

  for(var i=0;i<count;i++){
    var temp = {};
    temp.gameid = 1000*Math.random();
    temp.status = ["failed","success"][Math.ceil(2*Math.random())];
    temp.timestamp = + new Date();
    games.push(temp);
  }
  return games;
}


router.get("/StatusGame/:id",function(req,res,next){
  /*var options = {
    host:"10.100.123.102",
    method:req.method,
    headers:{
      'Content-Type':'application/json'
    },
    port:2048
  }
  options.path = '/StatusGame/'+req.params.id;

  var sreq = http.request(options,function(sres){
    sres.setEncoding('utf-8');
    sres.pipe(res);
  })

  sreq.end();*/
  res.send({games:randGames(),currentPage:1,total:500});
});

router.get("/ListGame",function(req,res,next){
  /*var options = {
    host:"10.100.123.102",
    method:req.method,
    headers:{
      'Content-Type':'application/json'
    },
    port:2048
  }

  options.path = '/ListGame';

  var sreq = http.request(options,function(sres){
    sres.setEncoding('utf-8');
    sres.pipe(res);
  })

  sreq.end();*/
  setTimeout(function(){
    res.send({games:randGames(req.query.pageSize||500),currentPage:req.query.page,total:500});
  },5000)

});

module.exports = router;
