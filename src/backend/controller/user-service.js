const registrationValidator =  require('../model/registrationValidator')
const mongoose = require("mongoose");
const userSchema = require('../model/userData')
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
// Set up Global configuration access
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
                userId: find_username.username,
            }
        
            const usertoken = jwt.sign(data, jwtSecretKey);
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
            const token = header(tokenHeaderKey);
    
            const verified = jwt.verify(token, jwtSecretKey);
            if(verified){
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
            }else{
                // Access Denied
                return {code:401,message : "Token is not verfied"};
            }
        } catch (error) {
            // Access Denied
            return {code:401,message : error};
        }

        
    }

        
}

exports.verify =async()=>{
    

}
