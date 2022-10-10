"use strict";
const { jwtAuth } = require("./jwt-token");
exports.authenticateSocketConnection = async (socket, socketCallback) => {
     try {
          const { token, appVersion, deviceType, serverVersion } = validateSocketConnection(socket, socketCallback);
          const tokenData = jwtAuth.verifyJwtToken(token);
          socket.userId = tokenData.userId;
          socket.name = tokenData.name;
          socket.token = token;
          // verify token, getUser profile, validate price 
          console.info("authenticateSocketConnection: tokenData ", tokenData);
          return socketCallback();
     } catch (error) {
          console.error("authenticateSocketConnection", error);
          socketCallback(error);
     }

}
exports.authenticateSocketConnection_ = async (request) => {
     try {
          let gettoken = request.rawHeaders;
         
          let token = gettoken[3];
          //  let split = gettoken[1].split(" ")
          // let token = split[1];
          const tokenData = jwtAuth.verifyJwtToken2(token);
          // verify token, getUser profile, validate price 
          let user={}
          user = tokenData
          console.info("authenticateSocketConnection: tokenData ", user);
          return user;
     } catch (error) {
          console.error("authenticateSocketConnection", error);
          return error;
     }

}
