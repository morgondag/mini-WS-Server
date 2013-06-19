'use strict';
var wsPort = 1399;
var webSocketServer = require('websocket').server;
var http = require('http');
var clients = [];
var fs = require('fs')
var os = require('os');
var networkInterfaces = os.networkInterfaces();
console.log('local-ip for testing:', networkInterfaces.en0[1].address);
//https://github.com/Worlize/WebSocket-Node/wiki/Documentation


//HTTP server
var server = http.createServer(function(request, response) {

    fs.readFile(__dirname + '/test.html', function(err, html) {
        if (err) {
            throw err;
        }

        response.writeHeader(200, {
            "Content-Type": "text/html"
        });
        response.write(html + 'connect to ip:<span id="ip">' + networkInterfaces.en0[1].address + ':' + wsPort + '</span>');
        response.end();
    });

});

server.listen(wsPort, function() {
    console.log('Yeaah WS on :' + wsPort);
});

//WS Server
var wsServer = new webSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    return true;
}


wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }



    var connection = request.accept('echo-protocol', request.origin);

    var index = clients.push(connection) - 1;
    var userName = false;

    connection.on('message', function(message) {

        // First msg send username on connect
        if (userName === false) {
            userName = message.utf8Data;
            console.log((new Date()) + ' New Dude: ' + userName);

            // msg and broadcast
        } else {
            console.log((new Date()) + ' Message from ' + userName + ': ' + message.utf8Data);

            var obj = {
                time: new Date(),
                text: message.utf8Data,
                author: userName,
                type: 'message'
            };


            for (var i = 0; i < clients.length; i++) {
                clients[i].sendUTF(JSON.stringify(obj));
            }
        }
    });

    // User Disconnects
    connection.on('close', function(connection) {
        if (userName !== false) {
            console.log(connection.remoteAddress + " disconnected.");
            clients.splice(index, 1);
        }
    });
});


/* 
    CLIENTSIDE JS
    connection = new WebSocket('ws://localhost:1337/');

    connection.onopen = function() {
        connection.send('username')
    };

    connection.onerror = function(error) {
        console.log('WebSocket Error ' + error);
    };

    connection.onmessage = function(e) {
        console.log(e.data);
    };

    connection.onclose = function(e) {
        console.log('bye');
    };
*/