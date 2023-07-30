const User =  require('../model/User');
const express =  require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const joi = require('@hapi/joi');



//Registering Schema
const registerSchema  = joi.object({
    name:joi.string().required(),
    email:joi.string().required().email(),
    password:joi.string().required(),
});

router.post('/register',async(req,res)=>{
// checking Email id exists
    const emailExist = await User.findOne({email:req.body.email})
    if(emailExist){
        return res.status(404).send("Email Id is Already Exists!!")
    }
// process of Hashing the password
const salt = await bcrypt.genSalt(10)
const hashedPassword = await bcrypt.hash(req.body.password,salt);

//add new user

const user  = new User ({
    name:req.body.name,
    email:req.body.email,
    password:hashedPassword
})
    try{
        const {error} =  await registerSchema.validateAsync(req.body);

    if(error){
        return  res.status(404).send(error.details[0].message)
    }
    else{
        const saveUser = await user.save();
        return res.status(202).send("user Created successfully !!!")
    }
    }
    catch(err){
        res.status(505).send(err)
    }
})

//logging schema 
const loginSchema  = joi.object({
    email:joi.string().required().email(),
    password:joi.string().required(),
});

router.post('/login',async(req,res)=>{
    //checking email exists
    const user = await User.findOne({email:req.body.email});
    if(!user){
        return res.status(405).send("Incorrect ID");
    }
    
    //compare password
    const validPassword =  await bcrypt.compare(req.body.password,user.password)
    if(!validPassword){
        return res.status(404).send("Incorrect Password")
    }
    //generate Token
    try{
        const {error} = await loginSchema.validateAsync(req.body)
        if(error){
            res.status(404).send(error.details[0].message)
        }
        else{
            // res.status(202).send("Login successfully")
            const generateToken = jwt.sign({id:user.id},process.env.TOKEN);
            res.header("auth-token",generateToken).send(generateToken)
            
        }
    }catch(error){
         res.status(404).send(error)
    }
})

//nodemailer
const verifyToken = require('../middleware/verifyToken');
const nodemailer = require('nodemailer');

router.get('/data',verifyToken,(req,res)=>{
    res.send({message:`welcome,${req.user.email}!! this is protected data`})
})


router.post('/reset',async(req,res)=>{
    const {email} =req.body;

    const user = await User.findOne({email});

    if(!user){
        return res.status(404).send({message:"user not found"});
    }

    const token = Math.random().toString(36).slice(-8);
    user.resetPasswordToken = token;
    user.resetPasswordExpire = Date.now() + 3600000 // 1hr

    await user.save();
    const transporter = nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:"yokeshsre@gmail.com",
            pass:"xuevismjzpyoubvf"
        },
    })
    const message = {
        from:"yokeshsre@gmail.com",
        to:  user.email,
        subject:"password reset request",
        text:`you are receiving this email because requested a password reset for your account. \n\n please use the following token to reset your password :  ${token}\n\n if you did not request a password reset, please ignore this email.`
    }
    transporter.sendMail(message,(error,info)=>{
        if(error){
            res.status(404).send({message:"something went wrong try again!!!!"})
        }
        res.status(200).send({messge:"reset password to email sent successfully " + info.response})
    })
})


router.post('/reset/:token',async(req,res)=>{
    const {token} =  req.params;
    const {password} = req.body;

    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpire:{$gt:Date.now()}
    })

    if(!user){
        return res.status(404).send({message:"Invalid token"});
    }

    const hashedPassword =  await bcrypt.hash(password,10);
    user.password=hashedPassword;
    user.resetPasswordToken=null;
    user.resetPasswordExpire=null;

    await user.save();

    res.send({message:"password reset successfully"});
})







module.exports = router