const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/api/register", async (req, res) => {
  try {
    const existingEmail = await User.findOne({email:req.body.email});
    if (existingEmail) {
        return res.status(400).json({error:"Email Alredyb exists"});
    }
    const existingName = await User.findOne({name:req.body.name});
    if (existingName) {
        return res.status(400).json({error:'Name already taken'});
    }
    const hashedPassword = await bcrypt.hash(req.body.password,10);
    const newUser = new User({
        name:req.body.name,
        email:req.body.email,
        password:hashedPassword
    });
    await newUser.save();
    res.status(200).json({message:'User Registered'})
  } catch (error) {
    res.status(500).json({error:'Internal Server Error'})
  }
}); 

router.post("/api/login", async(req,res)=>{
    try {
        const user = await User.findOne({email:req.body.email});
        if (!user) {
            return res.status(400).json({error:"Invalid Email"})
        }
        const passwordMatch = await bcrypt.compare(req.body.password,user.password);
        if (!passwordMatch) {
            return res.status(400).json({error:"Invalid Password"})
        }
        const token = jwt.sign({email:user.email},'secret');
        res.status(200).json({token,message:'User Logged in'});
    } catch (error) {
        res.status(500).json({error:'Internal Server Error'})
    }
})
 module.exports = router