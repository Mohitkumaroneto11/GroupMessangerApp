"use strict";
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let roomSchema = new Schema({
     roomName:{type:String},
     userList:{type:Array},
     created_by:{type:String},
     lastupdated_by:{type:String}
     
     
}, { timestamps: true });

module.exports = mongoose.model("room", roomSchema);