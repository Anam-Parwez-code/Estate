import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import  cookieParser from 'cookie-parser';

dotenv.config({path:'./Api/.env'});
const app =express();
console.log("MONGO_URI:",process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log('Connected to MongoDB!');
}).catch((err)=>{
    console.log(err);
})
app.use(express.json());
app.use(cookieParser());
app.listen(3000,()=>{
    console.log("server in 3000");
});
app.use('/api/user',userRouter);
app.use('/api/auth',authRouter);
app.use('/api/listing',listingRouter);
app.use((err,req,resp,next) => { 
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
   resp.status(statusCode).json({
    success:false,
    statusCode,
    message,
  });
});