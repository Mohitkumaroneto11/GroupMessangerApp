require("./interface/mongo-conn");
const httpServer = require("./interface/http-server");
const port = 3011;
httpServer.listen(port, () => {
     //const rabbitMQ = new RabbitMQ();
     console.log("Server Running on port "+port);
});
