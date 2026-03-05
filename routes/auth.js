import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import Admin from "../models/adminSchema.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const existingEmail = await User.findOne({email:req.body.email});
    if (existingEmail) {
        return res.status(400).json({error:"Email Alredy exists"});
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

router.post("/login", async(req,res)=>{
    try {
        const user = await User.findOne({email:req.body.email});
        if (!user) {
            return res.status(400).json({error:"Invalid Email"})
        }
        const passwordMatch = await bcrypt.compare(req.body.password,user.password);
        if (!passwordMatch) {
            return res.status(400).json({error:"Invalid Password"})
        }
        const token = jwt.sign({_id: user._id,email:user.email,name: user.name},'secret');
        res.status(200).json({token,message:'User Logged in'});
    } catch (error) {
        res.status(500).json({error:'Internal Server Error'})
    }
});
// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({error: 'No token provided'});

  try {
    const decoded = jwt.verify(token, 'secret');
    req.userId = decoded._id;
    next();
  } catch {
    res.status(401).json({error: 'Invalid token'});
  }
};

// Get user info
router.get("/user/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({error: 'User not found'});
    res.json(user);
  } catch (error) {
    res.status(500).json({error: 'Internal Server Error'});
  }
});

// Update user info (name/email)
router.put("/user/update", verifyToken, async (req, res) => {
  try {
    const { name, email } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated', user: updatedUser });
  } catch (error) {
    res.status(500).json({error: 'Internal Server Error'});
  }
});

// Change password
router.put("/user/change-password", verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({error: 'Old password is incorrect'});

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({error: 'Internal Server Error'});
  }
});
// GET /admin/users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("name email createdAt")
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments();

    res.json({
      totalUsers,
      users,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.post("/admin/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

   const newAdmin = new Admin({
        email:req.body.email,
        password:hashedPassword
    });
    await newAdmin.save()

    res.status(201).json({ message: "Admin created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/admin/login", async(req,res)=>{
    try {
        const admin = await Admin.findOne({email:req.body.email});
        if (!admin) {
            return res.status(400).json({error:"Invalid Email"})
        }
        const passwordMatch = await bcrypt.compare(req.body.password,admin.password);
        if (!passwordMatch) {
            return res.status(400).json({error:"Invalid Password"})
        }
        const token = jwt.sign({_id: admin._id,email:admin.email,name: admin.name},'secret');
        res.status(200).json({token,message:'Admin Logged in'});
    } catch (error) {
        res.status(500).json({error:'Internal Server Error'})
    }
});

export default router