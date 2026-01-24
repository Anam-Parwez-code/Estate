import User from '../Models/user.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/err.js';
import jwt from 'jsonwebtoken';
export const signup = async (req,resp,next)=>{
    
    const {username,email,password}=req.body;
    const hashedPassword = bcryptjs.hashSync(password,10)
    const newUser= new User({username,email,password:hashedPassword});
    try{
      await newUser.save()
     resp.status(201).json({
      success:true,
      message:"user Signed up Successfully",
     });
    }
    catch(error){
      next(errorHandler(500,error.message|| "SignUp Failed"));
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
   .json({success:true, 
    message:"Login Succesfully",
    token,
    user:rest
  });
  }catch(error){
    next(error);
  }
};
export const google = async (req,resp,next) =>{
  try{
const user=await User.findOne({email:req.body.email});
if(user){
const token=jwt.sign({id:user._id},process.env.JWT_SECRET);
const {password:pass,...rest}= user._doc;
resp.cookie('access_token',token,{httpOnly:true})
.status(200)
.json(rest);
}else{
const generatedPassword =Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
const hashedPassword =bcryptjs.hashSync(generatedPassword,10);
const newUser=new User({username:req.body.name.split(" ").join("").toLowerCase()+ Math.random().toString(36).slice(-4),email:req.body.email,password:hashedPassword,avatar:req.body.photo});
await newUser.save();
const token =jwt.sign({id:newUser._id},process.env.JWT_SECRET);
const{password:pass,...rest}=newUser._doc;
resp.cookie('access_token',token,{httpOnly:true})
.status(200)
.json(rest);
}
  }catch(error){
    next(error)
  }
}
export const signOut=async(req,resp,next) =>{
   try{
    resp.clearCookie('access_token',token,{ httpOnly:true,
      secure:process.env.NODE_ENV==='production',
      sameSite:'none',
     });
    resp.status(200).json('User has been logged out!');
   }
   catch(error){
    next(error)
   }
}