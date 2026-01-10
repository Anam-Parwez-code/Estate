import bcryptjs from 'bcryptjs';
import  errorHandler  from '../utils/err.js';
import User from '../Models/user.js';
export const test=(req,resp)=>{
    resp.send("API is working ");
};
export const updateUser=async (req,resp,next)=>{
    if(req.user.id!== req.params.id)
        return next(errorHandler(401,'You can only update your own Account!'))
    try{
            if(req.body.password){
                req.body.password=bcryptjs.hashSync(req.body.password,10)
            }
            const updateUser=await User.findByIdAndUpdate(req.params.id,{
                $set:{
                    username:req.body.username,
                    email:req.body.email,
                    password:req.body.password,
                    avatar:req.body.avatar,
                },
            },{new:true});
            const{password,...rest}=updateUser._doc;
            resp.status(200).json(rest);
                
    }catch(error){
            next(error)
    }
};
export const deleteUser= async (req,resp,next)=>{
    if(req.user.id !== req.params.id)
        return next(errorHandler(401,'You can only delete your own account!'))
    try{
        await User.findByIdAndDelete(req.params.id);
      /// resp.clearCookie('access_token');
        resp.json({success:true,message:'User has been deleted!'});
    }catch(error){
       resp.status(500).json({success:false,message:error.message});
    }
}