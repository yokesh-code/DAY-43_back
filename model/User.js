const mongoose = require('mongoose');

const loginSchema =  new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date
})
const User = mongoose.model('Login',loginSchema);
module.exports = User;