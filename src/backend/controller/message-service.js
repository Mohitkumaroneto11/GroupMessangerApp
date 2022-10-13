const mongoose = require("mongoose");
const messageSchema = require('../model/messageData')
const roomSchema = require('../model/roomData')
const dotenv = require('dotenv');
// Set up Global configuration access
var redis = require('redis');
var JWTR =  require('jwt-redis').default;
var redisClient = redis.createClient();
var jwtr = new JWTR(redisClient);
(async () => {
    await redisClient.connect();
})();


dotenv.config();

exports.sendMessage =async(request)=>{

    let header = request.rawHeaders;
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    
    try {
            const token = header[1];
            
            const verified = await jwtr.verify(token, jwtSecretKey);
            if(verified){
                let found =false;
                let find_username = await roomSchema.findOne({roomName:request.body.roomName})
                if(find_username){
                    for(user of find_username.userList){
                        if(user==verified.username){
                            found=true;
                        }
                    }
                    if(!found){
                        return {code:401,message:"user not belong to this group"};
                    }

                }
                else{
                    return {code:401,message:"room does not exist"};
                }
                let messageData={message:request.body.message,send_by:verified.username, created_at:new Date}

                let updateMessage = await messageSchema.updateOne({roomName:request.body.roomName},{$push: { messageList: messageData }});
                if(updateMessage.acknowledged){
                    return {code:200, message: "Message SENT"}
                }
                else{
                    return {code:411,message:"Message not sent"}
                }
                
            }else{
                // Access Denied
                return {code:401,message : "Token is not verfied"};
            }
    } catch (error) {
            // Access Denied
            return {code:401,message : "Token is  not verfied"};
        }

        
    
        
}

exports.viewMessage =async(request)=>{

    let header = request.rawHeaders;
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    
    try {
            const token = header[1];
            
            const verified = await jwtr.verify(token, jwtSecretKey);
            if(verified){
                let found =false;
                let find_username = await roomSchema.findOne({roomName:request.body.roomName})
                if(find_username){
                    for(user of find_username.userList){
                        if(user==verified.username){
                            found=true;
                        }
                    }
                    if(!found){
                        return {code:401,message:"user not belong to this group"};
                    }

                }
                else{
                    return {code:401,message:"room does not exist"};
                }
                
                let allmessage = await messageSchema.find();
                if(allmessage){
                    return {code:200, message: "All Message", data: allmessage}
                }
                else{
                    return {code:411,message:"Not message is there"}
                }
                
            }else{
                // Access Denied
                return {code:401,message : "Token is not verfied"};
            }
    } catch (error) {
            // Access Denied
            return {code:401,message : "Token is  not verfied"};
        }

        
    
        
}