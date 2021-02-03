const Dispatcher = require("./Dispatcher");
const packetHandler = Dispatcher.packetHandler;
const express = require('express');

function create(app) {
    app.ws('/games*', (ws, req) => {
		console.log("Websocket")
        ws.on('message', (msg) => {
			console.log("Message");
            msg = JSON.parse(msg);
            msg.path = req.path.replace(".websocket", "");
            packetHandler.receiveMessage(ws, msg);

        })

        ws.on('close', () => {
            packetHandler.receiveClose(ws);
        })
    });

    app.use("/games/", express.static(__dirname + '/html/'));

    app.get('/games*', (req, res, next) => {
        res.sendFile(__dirname + "/html/index.html");
    })
}

exports.create = create;

