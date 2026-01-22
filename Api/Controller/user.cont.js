import bcryptjs from 'bcryptjs';
import  {errorHandler}  from '../utils/err.js';
import User from '../Models/user.js';
import Listing from '../Models/listing.model.js';
import {v2 as cloudinary} from 'cloudinary';
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
});

export const test=(req,resp)=>{
    resp.send("API is working ");
};
//export const updateUser=async (req,resp,next)=>{
  //  if(req.user.id!== req.params.id)
    //    return next(errorHandler(401,'You can only update your own Account!'))
    //try{
      //      if(req.body.password){
        //        req.body.password=bcryptjs.hashSync(req.body.password,10)
          //  }
            //const updateUser=await User.findByIdAndUpdate(req.params.id,{
              //  $set:{
                //    username:req.body.username,
                  //  email:req.body.email,
                    //password:req.body.password,
                    //avatar:req.body.avatar,
                //},
            //},{new:true});
            //const{password,...rest}=updateUser._doc;
            //resp.status(200).json(rest);
                
    //}catch(error){
      //      next(error)
    //}
//};
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
};
export const updateUser = async (req, resp, next) => {
    console.log("Update User Request Body:", req.body); 
    console.log("Authenticated User ID:", req.user?.id);
    console.log("Target User ID:", req.params.id);  
    console.log("Uploaded File:", req.file);
    console.log("Request Body:", req.user);
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, 'You can only update your own Account!'));
  try {
    if(req.file){
        const result=await cloudinary.uploader.upload(req.file.path,{
            folder:"estate",
        });
        req.body.avatar=result.secure_url;
    }
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    const { password, ...rest } = updatedUser._doc;
    resp.status(200).json({ success: true, user: rest }); // 👈 success flag + user object
  } catch (error) {
    next(error);
  }
};

export const getUserListings=async(req,resp,next)=>{
    if(req.user.id === req.params.id){
  try{
    const listings=await Listing.find({ userRef:req.params.id});
    resp.status(200).json(listings);
   } catch(error){
    return next(error);
   }
    }else{
        return next(errorHandler(401,'you can only view your own listings'));
    }
};
export const getUser = async (req, resp, next) => {
  try {
    
    const user = await User.findById(req.params.id);
  
    if (!user) return next(errorHandler(404, 'User not found!'));
  
    const { password: pass, ...rest } = user._doc;
  
    resp.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};