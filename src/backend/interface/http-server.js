"use strict";
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const methodOverride = require('method-override');
// const { error, notFound } = require("./middlewares");
const routes = require("../route");
console.debug('Rummy Server : Starting ...')
const app = new express();
app
     // .use(error.errorHandler)
     .use(methodOverride())
     .use(helmet())
     .use(cors())
     .use(express.json())
     .use(express.urlencoded({ extended: true }))
     // .use("/api/v1", v1Router)
     // .use(notFound.notFoundHandler)

routes(app);
const server = http.createServer(app);

server.on('close', () => {
     console.debug('Server closing, bye!')
});

console.debug('Rummy Server running....');

module.exports = server;