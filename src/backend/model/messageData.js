"use strict";
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let messageSchema = new Schema({
     roomName:{type:String},
     messageList:{type:Array}
}, { timestamps: true });

module.exports = mongoose.model("message", messageSchema);