let http = require('http');　//内置的http模块提供了HTTP服务器和客户端功能
let fs = require('fs');  //内置的fs模块提供了与文件系统相关的功能
let path = require('path');  //内置的path模块提供了与文件系统路径相关的功能
let mime = require('mime');  //附加的mime模块有根据文件扩展名得出MIME类型的能力
let cache = {};  //cache是用来缓存文件内容的对象
let chatServer = require('./lib/chat_server');

function send404(response) {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.write('Error 404: resource not found.');
    response.end();
}

function sendFile(response, filePath, fileContents) {
    response.writeHead(
        200,
        {"content-type": mime.getType(path.basename(filePath))} );
    response.end(fileContents);
}

function serveStatic(response, cache, absPath) {
    if (cache[absPath]) {  //检查文件是否缓存在内存中
        sendFile(response, absPath, cache[absPath]);  //从内存中返回文件
    } else {
        fs.access(absPath, (err) => {  //检查文件是否存在
            if (err) {
                send404(response);
            } else {
                fs.readFile(absPath, function(err, data) {  //从硬盘中读取文件
                    if (err) {
                        send404(response);
                    } else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data);  //从硬盘中读取文件并返回
                    }
                });
            }
        });
    }
}

let server = http.createServer(function(request, response) {　　//创建HTTP服务器，用匿名函数定义对每个请求的处理行为
    let filePath = false;
    if (request.url === '/') {
        filePath = 'public/index.html';
    } else {
        filePath = 'public' + request.url;  //将URL路径转为文件的相对路径
    }

    let absPath = './' + filePath;
    serveStatic(response, cache, absPath);  //返回静态文件
});

server.listen(3000, function() {
    console.log("Server listening on port 3000.");
});

chatServer.listen(server);