const registrationValidator =  require('../model/registrationValidator')
const mongoose = require("mongoose");
const userSchema = require('../model/userData')
const roomSchema = require('../model/roomData')
const messageSchema = require('../model/messageData')
const bcrypt = require("bcrypt");
const dotenv = require('dotenv');
// Set up Global configuration access
var redis = require('redis');
const { request } = require('express');
var JWTR =  require('jwt-redis').default;
var redisClient = redis.createClient();
var jwtr = new JWTR(redisClient);
(async () => {
    await redisClient.connect();
})();


dotenv.config();



async function hashPassword(plaintextPassword) {
    const hash = await bcrypt.hash(plaintextPassword, 10);
    return hash
}
 
// compare password
async function comparePassword(plaintextPassword, hash) {
    const result = await bcrypt.compare(plaintextPassword, hash);
    return result;
}
exports.logout =async(req,header)=>{

    let find_username = await userSchema.findOne({username:req.username}) 
    if(find_username==null){
        return {code:202,message : "username not exist"}
    }
    let token  =  header[1];
    const usertoken = await jwtr.destroy(token);
    if(usertoken){
        return {code:200,message : "logout successfully",  token:usertoken}
    }
    else{
        return {code:406,message : "logout unsucessfull",  token:usertoken}
    }

}
exports.login =async(req)=>{
    
    let find_username = await userSchema.findOne({username:req.username}) 
    console.log(find_username)
    if(!find_username){
        return {code:202,message : "username doesn't exist"}
    }
    else{
        let result = await comparePassword(req.password,find_username.password)
        if(result){
            let jwtSecretKey = process.env.JWT_SECRET_KEY;
            let data = {
                time: Date(),
                username: find_username.username,
                role:find_username.role
            }
        
            const usertoken = await jwtr.sign(data, jwtSecretKey);
            return {code:200,message : "login successfully",  token:usertoken}
        }
        else{
            return {code:203,message : "password Not matched"}
        }
    }

}
exports.registration =async(req,header)=>{
    


    let find_username = await userSchema.findOne({username:req.username})
    let find_email = await userSchema.findOne({email:req.email}) 
    console.log(find_username)
    if(find_username){
        return {code:202,message : "username already exist"}
    }
    if(find_email){
        return {code:204,message : "email already exist"}
    }
    else{
        //verify its admin or not
        let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
        let jwtSecretKey = process.env.JWT_SECRET_KEY;
    
        try {
            const token = header[1];
            
            const verified = await jwtr.verify(token, jwtSecretKey);
            if(verified){
                if(verified.role != 1)
                {
                    return {code:405,message : "You are not admin user"}
                }
                else{

                    let hashpassword = await hashPassword(req.password)
    
                    let userDatas = {
                        _id:new mongoose.Types.ObjectId().toString(),
                        username:req.username,
                        password:hashpassword,
                        email:req.email,
                        role:req.role
                    }
                    registrationValidator.registration(userDatas);
                    let save_res =new userSchema(userDatas).save();
                    return true;
                }
            }else{
                // Access Denied
                return {code:401,message : "Token is not verfied"};
            }
        } catch (error) {
            // Access Denied
            return {code:401,message : "Token is required"};
        }

        
    }

        
}

exports.updateuser =async(resqest)=>{
    


    let findusername = resqest.query.username;
    let req = resqest.body;
    let header = resqest.rawHeaders;

    let find_username = await userSchema.findOne({username:findusername})
    let find_email = await userSchema.findOne({email:req.email}) 
    if(find_username==null){
        return {code:202,message : "username not exist"}
    }
    if(find_email){
        return {code:204,message : "email already exist"}
    }
    else{
        let jwtSecretKey = process.env.JWT_SECRET_KEY;
    
        try {
            const token = header[1];
            
            const verified = await jwtr.verify(token, jwtSecretKey);
            if(verified){
                if(verified.role != 1)
                {
                    return {code:405,message : "You are not admin user"}
                }
                else{
                    const filter = { username: findusername };
                    const update = { email: req.email, role:req.role };
                    let updateuser = await userSchema.findOneAndUpdate(filter, update)
                    if(updateuser){
                        return {code:200, message:"user information updated"};
                    }
                    else{
                        return {code:407, message:"user information not updated"}
                    }
                }
            }else{
                // Access Denied
                return {code:401,message : "Token is not verfied"};
            }
        } catch (error) {
            // Access Denied
            return {code:401,message : "Token is required"};
        }

        
    }

        
}

exports.createRoom =async(request)=>{

    let roomName = request.body.roomName;
    let header = request.rawHeaders;

    let find_roomName = await roomSchema.findOne({roomName:roomName})
    if(find_roomName){
        return {code:202,message : "Room name already exist"}
    }
    else{

        let jwtSecretKey = process.env.JWT_SECRET_KEY;
    
        try {
            const token = header[1];
            
            const verified = await jwtr.verify(token, jwtSecretKey);
            if(verified){
                let created_by = verified.username;
                let user=[];
                user.push(created_by)
                let roomDatas = {
                    _id:new mongoose.Types.ObjectId().toString(),
                    roomName:request.body.roomName,
                    userList:user,
                    created_by:created_by,
                    lastupdated_by:created_by
                }
                
                let updateuser = await new roomSchema(roomDatas).save();
                let messageData=[];
                messageData.push({message:"Welcome to new group",send_by:verified.username, created_at:new Date})
                
                let messageDatas = {
                    _id:new mongoose.Types.ObjectId().toString(),
                    roomName:request.body.roomName,
                    messageList:messageData
                }
                let updateMessage = await new messageSchema(messageDatas).save();
                return {code:200, message:"Room Created"};
                
            }else{
                // Access Denied
                return {code:401,message : "Token is not verfied"};
            }
        } catch (error) {
            // Access Denied
            return {code:401,message : "Token is not verified"};
        }

        
    }
        
}

exports.addUserRoom =async(resqest)=>{

    let roomName = resqest.body.roomName;
    let userNameList = resqest.body.userNameList;

    let header = resqest.rawHeaders;

    let find_roomName = await roomSchema.findOne({roomName:roomName})
    if(!find_roomName){
        return {code:202,message : "Room name Not exist"}
    }
    else{

        let jwtSecretKey = process.env.JWT_SECRET_KEY;
    
        try {
            const token = header[1];
            
            const verified = await jwtr.verify(token, jwtSecretKey);
            if(verified){
                let updated_by = verified.username;
                let users = find_roomName.userList;
                userNameList.forEach((userN)=>{
                    users.forEach((userL)=>{
                        if(userL !=userN){
                            users.push(userN)
                        }
                    })
                })
                const filter = { roomName: roomName };
                const update = { userList: users, lastupdated_by:updated_by };
                let updateRoom = await roomSchema.findOneAndUpdate(filter, update)
                if(updateRoom){
                    return {code:200, message:"Room updated"};
                }
                else{
                    return {code:409, message:"Room Not updated"};
                }
                
            }else{
                // Access Denied
                return {code:401,message : "Token is not verfied"};
            }
        } catch (error) {
            // Access Denied
            return {code:401,message : "Token is required"};
        }

        
    }
        
}

exports.removeUserRoom =async(resqest)=>{

    let roomName = resqest.body.roomName;
    let remove_username = resqest.body.username;

    let header = resqest.rawHeaders;

    let find_roomName = await roomSchema.findOne({roomName:roomName})
    if(!find_roomName){
        return {code:202,message : "Room name Not exist"}
    }
    else{

        let jwtSecretKey = process.env.JWT_SECRET_KEY;
    
        try {
            const token = header[1];
            
            const verified = await jwtr.verify(token, jwtSecretKey);
            if(verified){
                let updated_by = verified.username;
                let users = find_roomName.userList;

                for( var i = 0; i < users.length; i++){ 
    
                    if ( users[i] === remove_username) { 
                
                        users.splice(i, 1); 
                    }
                
                }
                
                const filter = { roomName: roomName };
                const update = { userList: users, lastupdated_by:updated_by };
                let updateRoom = await roomSchema.findOneAndUpdate(filter, update)
                if(updateRoom){
                    return {code:200, message:"Room updated"};
                }
                else{
                    return {code:409, message:"Room Not updated"};
                }
                
            }else{
                // Access Denied
                return {code:401,message : "Token is not verfied"};
            }
        } catch (error) {
            // Access Denied
            return {code:401,message : "Token is required"};
        }

        
    }
        
}

exports.removeRoom =async(resqest)=>{

    let roomName = resqest.body.roomName;
    let header = resqest.rawHeaders;

    let find_roomName = await roomSchema.findOne({roomName:roomName})
    if(!find_roomName){
        return {code:202,message : "Room name Not exist"}
    }
    else{

        let jwtSecretKey = process.env.JWT_SECRET_KEY;
    
        try {
            const token = header[1];
            
            const verified = await jwtr.verify(token, jwtSecretKey);
            if(verified){
                const filter = { roomName: roomName };
                let updateRoom = await roomSchema.deleteOne(filter)
                let updateMessageRoom = await messageSchema.deleteOne(filter)
                if(updateRoom.acknowledged){
                    if(updateMessageRoom.acknowledged){
                        return {code:200, message:"Room Deleted successfully"};
                    }
                    else{

                        return {code:200, message:"Room Deleted successfully but no message was there"};
                    }
                }
                else{
                    return {code:409, message:"Room Not Deleted"};
                }
                
            }else{
                // Access Denied
                return {code:401,message : "Token is not verfied"};
            }
        } catch (error) {
            // Access Denied
            return {code:401,message : "Token is required"};
        }

        
    }
        
}

exports.userList =async(resqest)=>{

    let header = resqest.rawHeaders;
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    
    try {
            const token = header[1];
            
            const verified = await jwtr.verify(token, jwtSecretKey);
            if(verified){
                let userList = await userSchema.find()
                
                if(userList){
                    let userNameList = userList.map(function(user){
                        return user.username
                    })
                    return {code:200, userList:userNameList};
                }
                else{
                    return {code:409, message:"User Not found"};
                }
                
            }else{
                // Access Denied
                return {code:401,message : "Token is not verfied"};
            }
    } catch (error) {
            // Access Denied
            return {code:401,message : "Token is  not required"};
        }

        
    
        
}

exports.roomList =async(request)=>{

    let header = request.rawHeaders;
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    
    try {
            const token = header[1];
            
            const verified = await jwtr.verify(token, jwtSecretKey);
            if(verified){
                if(request.query.roomName){
                    let roomQuery = await roomSchema.findOne({roomName:request.query.roomName})
                    if(roomQuery){
                        return {code:200,message:"room Exist", data:roomQuery}
                    }
                    else{
                        return {code:412,message:"room Not Exist"}
                    }
                }
                else{
                    let roomList = await roomSchema.find()
                
                    if(roomList){
                        let roomNameList = roomList.map(function(room){
                            return room.roomName
                        })
                        return {code:200, userList:roomNameList};
                    }
                    else{
                        return {code:409, message:"User Not found"};
                    }
                }
                
                
            }else{
                // Access Denied
                return {code:401,message : "Token is not verfied"};
            }
    } catch (error) {
            // Access Denied
            return {code:401,message : "Token is  not required"};
        }

        
    
        
}

exports.roomByName =async(request)=>{

    let header = request.rawHeaders;
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    
    try {
            const token = header[1];
            
            const verified = await jwtr.verify(token, jwtSecretKey);
            if(verified){
                let roomQuery = await roomSchema.findOne({roomName:request.query.roomName})
                if(roomQuery){
                    return {code:200,message:"room Exist", data:roomQuery}
                }
                else{
                    return {code:412,message:"room Not Exist"}                    
                }
            }else{
                // Access Denied
                return {code:401,message : "Token is not verfied"};
            }
    } catch (error) {
            // Access Denied
            return {code:401,message : "Token is  not required"};
        }

        
    
        
}



