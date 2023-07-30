const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config()
const dburl = process.env.DBURL;
const port = process.env.PORT
mongoose.connect(dburl,{useNewUrlParser:true});

const con = mongoose.connection;

try {
    con.on("open", () => {
      console.log("MongoDB connected!!!!");
    });
  } catch (error) {
    console.log("Error: " + error);
  }
app.listen(port,()=>{
    console.log("Port is Running at "+port);
})
// -------------------------------------------------

app.use(express.json());
app.use(express.urlencoded({extended:false}));

const cors = require('cors');
app.use(cors({origin:true}));


// -------------------------------------------------
const userRouter = require('./routes/User')
app.use('/user',userRouter)