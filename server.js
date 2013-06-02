'use strict';
var wsPort = 1337;
var webSocketServer = require('websocket').server;
var http = require('http');
var clients = [];

//HTTP server
var server = http.createServer(function(request, response) {});

server.listen(wsPort, function() {
    console.log('Yeaah WS on :' + wsPort);
});

//WS Server
var wsServer = new webSocketServer({
    httpServer: server
});

wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);
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
                time: (new Date()).getTime(),
                text: message,
                author: userName
            };

            var msg = JSON.stringify({
                type: 'message',
                data: obj
            });

            for (var i = 0; i < clients.length; i++) {
                clients[i].sendUTF(msg);
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