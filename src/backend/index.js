require("./interface/mongo-conn");
const httpServer = require("./interface/http-server");
const socketServer = require("./middleware/socket-io");
const socketIO = socketServer.initSocketServer(httpServer, "Socket");
const port = 3011;
httpServer.listen(port, () => {
     //const rabbitMQ = new RabbitMQ();
     console.log("Server Running on port "+port);
});
exports.socketIO = socketIO;