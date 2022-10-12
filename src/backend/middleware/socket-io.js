"use strict";
const {
     authenticateSocketConnection
} = require("./authentication");
const {
     socketEvents
} = require("./event");
const {
     createRoomController,
     joinUserController,
     removeUserController,

} = require("../controller/socket-controller");

let socketIO;
exports.initSocketServer = (httpServer, serverType) => {
          const socketOptions = {
               path: '/v1/socket.io',
               pingTimeout: 6000, 
               pingInterval: 5000
          };
          socketIO = require('socket.io')(httpServer, socketOptions);
          const {
               createAdapter
          } = require("@socket.io/redis-adapter");
          socketIO.sockets.setMaxListeners(0);
          socketIO.use(authenticateSocketConnection);
          socketIO.on(socketEvents.default.connection, onSocketConnection);
          socketIO.on(socketEvents.default.connect_error, errorHandler);
          socketIO.on(socketEvents.default.connect_timeout, errorHandler);
          socketIO.on(socketEvents.default.error, errorHandler);
          socketIO.on(socketEvents.default.disconnect, errorHandler);
          socketIO.on(socketEvents.default.reconnect, errorHandler);
          socketIO.on(socketEvents.default.reconnect_error, errorHandler);
          socketIO.on(socketEvents.default.pong, pongHandler);

          function onSocketConnection(socket) {

               console.info("onSocketConnection id ", socket.userId);
               console.info("onSocketConnection name ", socket.name);
               joinUserController(socketIO, socket);
               removeUserController(socketIO, socket);
               
          }

          function errorHandler(err) {
               console.error("Socket Error handler : ", err);
          }

          

          function pongHandler(err) {
               if (err) {
                    console.error("pongHandler : Error", err);
               }
          }
          return socketIO;
}

exports.emitInRoom = (roomId, eventName, data) => {
     if (socketIO) {
          console.info("emitInRoom event name data " + eventName, roomId, eventName);
          const resp = {
               status: 200,
               data: data,
               errorMessage: "SUCCESS_MESSAGE"
          };
          const clients = socketIO.sockets.adapter.rooms.get(roomId);
          return socketIO.to(roomId).emit(eventName, resp);

     }
}
