import User from '../Models/user.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/err.js';
import jwt from 'jsonwebtoken';
export const signup = async (req,resp)=>{
    
    const {username,email,password}=req.body;
    const hashedPassword = bcryptjs.hashSync(password,10)
    const newUser= new User({username,email,password:hashedPassword});
    try{
      await newUser.save()
     resp.status(201).json("User Singup Successfully");
    }
    catch(error){
      next(errorHandler(550,'error from function'));
    }
    // try{
  //   resp.status(201).json({message:"User Signed up Successfully"});
    // console.log(req.body);
 //} catch(error){
   // resp.status(500).json({error:error.message});
 //}
};
export  const signin=async(req,resp,next)=>{
  const {email,password } = req.body;
  try{
   const validUser= await User.findOne({email});
   if(!validUser) return next(errorHandler(404,'User not Found'));
   const validPassword=bcryptjs.compareSync(password,validUser.password);
   if(!validPassword) return next(errorHandler(401,'Wrong Password, try again'));
   const token=jwt.sign({id:validUser._id},process.env.JWT_SECRET);
   const {password:pass,...rest}=validUser._doc;
   resp
   .cookie('access_token',token,{ httpOnly:true })
   .status(200)
   .json(rest);
  }catch(error){
    next(error);
  }
};
