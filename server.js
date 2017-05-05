var fs = require('fs'),
    http = require('http'),
    url = require('url'),
    path = require('path');

var indexPage, movie_webm, movie_mp4, movie_mp4_alternative, movie_ogg;
var count, lastEnd = 0;

// load the video files and the index html page
fs.readFile(path.resolve(__dirname,"movie.webm"), function (err, data) {
	console.log("0");
    if (err) {
        throw err;
    }
    movie_webm = data;
});
//fs.readFile(path.resolve(__dirname,"movie.mp4"), function (err, data) {
fs.readFile(path.resolve(__dirname,"movie.mp4"), function (err, data) {
	console.log("1");
    if (err) {
        throw err;
    }
    movie_mp4 = data;
});
fs.readFile(path.resolve(__dirname,"test3_cw_1.mp4"), function (err, data) {
	console.log("1");
    if (err) {
        throw err;
    }
    movie_mp4_alternative = data;
});
fs.readFile(path.resolve(__dirname,"movie.ogg"), function (err, data) {
	console.log("2");
    if (err) {
        throw err;
    }
    movie_ogg = data;
});

fs.readFile(path.resolve(__dirname,"index.html"), function (err, data) {
	console.log("3");
    if (err) {
        throw err;
    }
    indexPage = data;    
});

// create http server
http.createServer(function (req, res) {
    
    var reqResource = url.parse(req.url).pathname;
    console.log("Resource: " + reqResource);

    if(reqResource == "/"){
    
        //console.log(req.headers)
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(indexPage);
        res.end();

    } else if (reqResource == "/favicon.ico"){
    
        res.writeHead(404);
        res.end();
    
    } else {

            var total;
            if(reqResource == "/movie.mp4"){
                total = movie_mp4.length;
            } else if(reqResource == "/movie.ogg"){
                total = movie_ogg.length;
            } else if(reqResource == "/movie.webm"){
                total = movie_webm.length;
            } 
                
            var range = req.headers.range;

            var positions = range.replace(/bytes=/, "").split("-");
            var start = parseInt(positions[0], 10);
            // if last byte position is not present then it is the last byte of the video file.
			if(reqResource == "/movie.mp4"){
				lastEnd = Math.max(start+500000, lastEnd+500000);
				lastEnd = Math.min(lastEnd, total);
				var end = positions[1] ? parseInt(positions[1], 10) : lastEnd - 1;
			}else{
				var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
			}
            var chunksize = (end-start)+1;
			count++;
			
			console.log("*chunk size:"+"bytes " + start + "-" + end + "/" + total);
			
            if(reqResource == "/movie.mp4"){
				if(start > 3000000){
					console.log("<<-return alternative video bytes");
					res.writeHead(206, { "Content-Range": "bytes " + start + "-" + end + "/" + total, 
										 "Accept-Ranges": "bytes",
										 "Content-Length": chunksize,
										 "Content-Type":"video/mp4"});
					res.end(movie_mp4_alternative.slice(start, end+1), "binary");
				}else{
					res.writeHead(206, { "Content-Range": "bytes " + start + "-" + end + "/" + total, 
										 "Accept-Ranges": "bytes",
										 "Content-Length": chunksize,
										 "Content-Type":"video/mp4"});
					res.end(movie_mp4.slice(start, end+1), "binary");
				}

            } else if(reqResource == "/movie.ogg"){
                res.writeHead(206, { "Content-Range": "bytes " + start + "-" + end + "/" + total, 
                                     "Accept-Ranges": "bytes",
                                     "Content-Length": chunksize,
                                     "Content-Type":"video/ogg"});
                res.end(movie_ogg.slice(start, end+1), "binary");

            } else if(reqResource == "/movie.webm"){
                res.writeHead(206, { "Content-Range": "bytes " + start + "-" + end + "/" + total, 
                                     "Accept-Ranges": "bytes",
                                     "Content-Length": chunksize,
                                     "Content-Type":"video/webm"});
                res.end(movie_webm.slice(start, end+1), "binary");
            }
    }
}).listen(8889); 