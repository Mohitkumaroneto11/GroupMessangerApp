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
    route.use('/api/game/join', async (req, res, next) => {
        let getdata = await authenticateSocketConnection_(req)
        req.body.profile = getdata
        next()
      }, (req, res, next) => {
        console.log('Request Type:', req.method)
        next()
      })


      
    route.route('/api/v1/constest/config').get(async (req, response) => {
        const configs = await usersController.getAllLobbyConfig();
        console.log("configs response", configs);
        return response.json({ lobbies: configs });
    });
   
    

    

      route.route('/auth/login').post(async (req, response)=>{
        const configs = await usersController.login(req.body);
        console.log("configs response", configs);
        return response.json({ result: configs });
      });
      route.route('/auth/verify').post(async (req, response)=>{
        const configs = await usersController.verify();
        console.log("configs response", configs);
        return response.json({ lobbies: configs });
      });
      route.route('/auth/registration').post(async (req, response)=>{
        const configs = await usersController.registration(req.body,req.header);
        console.log("configs response", configs);
        return response.json({ datasaved: configs });
      });

      
};
