var express = require('express');
var router = express.Router();
var http = require("http");
    


/* GET users listing. */
router.all('*', function(req, res, next) {
    var options = {
            host:'10.100.123.140',//'10.100.123.45',
            method:req.method,
            headers:{
                'Content-Type':'application/json'
            }
        };
    
    var body ="";

    if(req.url==="/actions/GetMetricStatistics"){
        options.port = 9196;
    }else{
        options.port = 9098;
    };

    req.on("data",function(chunk){
        body+=chunk;
    });

    req.on("end",function(){
        options.path = req.originalUrl;
        var sreq = http.request(options,function(sres){
                sres.setEncoding('utf-8');   
                sres.pipe(res);

            });

        if(/POST|PUT/i.test(req.method)){
            sreq.write(body);//send a chunk
        }

        sreq.end();
    });
});

module.exports = router;
