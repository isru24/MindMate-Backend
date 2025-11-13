const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/route')

mongoose.connect('mongodb://localhost:27017/MindMate')
.then(()=>{
    console.log('Database Connected')
})
.catch(()=>{
    console.error('Error Connecting Database')
})

const app = express();
app.use(express.json())
app.use(userRoutes)
const port = 3000;

app.listen(port,()=>{
    console.log(`Serrver running on port ${port}`)
})

app.get('/',(req,res)=>{
    res.status(200).json({message:'Hello'})
})