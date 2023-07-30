const jwt = require('jsonwebtoken')
const User = require('../model/User')
const verifyToken = (req,res,next)=>{
    const authHeader = req.headers.authorization;

    if(!authHeader){
    res.status(401).send({message:"missing token"})
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token,process.env.SECRET_KEY,async(error,decode)=>{
        if(error){
            return res.status(404).send({message:"invalid token"})
        }
        const user = await User.findOne({_id:decode.id})

        if(!user){
        return res.status(404).send({message:"user not found"})
        }

        req.user = user;
        next();
    })
};

module.exports = verifyToken