"use strict"
const usersController = require("./controller/user-service");
const { authenticateSocketConnection_ } = require("../backend/middleware/authentication");
module.exports = function routes(route) {
    route.get('/', (request, response) => {
        response.send(`Api server in running (${new Date()})`);
    });
    // route.get('/api/game/test', (request, response) => {
    //     console.log(rabbitMQ)
    //     return response.send(rabbitMQ);
    // });
    route.post('/', (request, response) => {
        response.send(`Api server in running (${new Date()})`);
    });
    route.route('/auth/login').post(async (req, response)=>{
        const configs = await usersController.login(req.body);
        console.log("configs response", configs);
        return response.json({ result: configs });
      });
      route.route('/auth/registration').post(async (req, response)=>{
        const configs = await usersController.registration(req.body,req.rawHeaders);
        console.log("configs response", configs);
        return response.json({ datasaved: configs });
      });
      route.route('/auth/edituser').post(async (req, response)=>{
        const configs = await usersController.updateuser(req);
        console.log("configs response", configs);
        return response.json({ datasaved: configs });
      });
      route.route('/auth/logout').post(async (req, response)=>{
        const configs = await usersController.logout(req.query,req.rawHeaders);
        console.log("configs response", configs);
        return response.json({ datasaved: configs });
      });

      route.route('/auth/createRoom').post(async (req, response)=>{
        const configs = await usersController.createRoom(req);
        console.log("configs response", configs);
        return response.json({ datasaved: configs });
      });

      route.route('/auth/adduser').post(async (req, response)=>{
        const configs = await usersController.addUserRoom(req);
        console.log("configs response", configs);
        return response.json({ datasaved: configs });
      });

      route.route('/auth/removeuser').post(async (req, response)=>{
        const configs = await usersController.removeUserRoom(req);
        console.log("configs response", configs);
        return response.json({ datasaved: configs });
      });

      route.route('/auth/removeroom').post(async (req, response)=>{
        const configs = await usersController.removeRoom(req);
        console.log("configs response", configs);
        return response.json({ datasaved: configs });
      });

      route.route('/auth/userList').get(async (req, response)=>{
        const configs = await usersController.userList(req);
        console.log("configs response", configs);
        return response.json({ datasaved: configs });
      });

      


      
};
