/*  (C) 2012 Premist aka Minku Lee.
    LICENSE : https://github.com/premist/node-crossdomain-proxy/blob/master/LICENSE
*/

var http = require('http');
var url = require('url');
var port = process.env.port || 1337;

http.createServer(function(proxyReq, proxyResp) {
    var params = url.parse(proxyReq.url, true);
    var URL = "http://" + params.query.src;
    console.log("-:- " + URL);

    var destParams = url.parse(URL);

    var headers = proxyReq.headers
    headers.host = '193.0.174.161'

    var reqOptions = {
        host : destParams.host,
        // host: "193.0.174.161",
        port : 80,
        path : destParams.pathname,
        method : proxyReq.method,
        // method: proxyReq.method == 'OPTIONS' ? 'POST' : proxyReq.method,
        headers: headers
    };
    console.log(reqOptions);

    var req = http.request(reqOptions, function(res) {
        var headers = res.headers;
        headers['Access-Control-Allow-Origin'] = 'http://localhost';
        headers['Access-Control-Allow-Headers'] = 'X-Requested-With';
        headers['Access-Control-Allow-Credentials'] =  true;
        proxyResp.writeHead(res.statusCode, headers);
        res.on('data', function(chunk) {
            proxyResp.write(chunk);
        });

        res.on('end', function() {
            proxyResp.end();
        });
    });

    req.on('error', function(e) {
        console.log('An error occured: ' + e.message);
        proxyResp.writeHead(503);
        proxyResp.write("Error!");
        proxyResp.end();
    });
    req.end();
}).listen(port);

console.log("proxy started on " + port)