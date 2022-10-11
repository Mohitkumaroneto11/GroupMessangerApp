"use strict";
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let userSchema = new Schema({
     username:{type:String},
     password:{type:String},
     email:{type:String},
     role:{type:Number}
     
}, { timestamps: true });

module.exports = mongoose.model("user", userSchema);