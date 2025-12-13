import User from '../Models/user.js';
import bcryptjs from 'bcryptjs';
export const signup = async (req,resp)=>{
    
    const {username,email,password}=req.body;
    const hashedPassword = bcryptjs.hashSync(password,10)
    const newUser= new User({username,email,password:hashedPassword});
    try{
      await newUser.save()
     resp.status(201).json("User Singup Successfully");
    }
    catch(error){
      resp.status(500).json(error);
    }
    // try{
  //   resp.status(201).json({message:"User Signed up Successfully"});
    // console.log(req.body);
 //} catch(error){
   // resp.status(500).json({error:error.message});
 //}
};
