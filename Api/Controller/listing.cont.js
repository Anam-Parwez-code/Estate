import Listing from '../Models/listing.model.js';
import errorHandler from '../utils/err.js';
export const createListing=async (req,resp,next) =>{
    try{
        const imagesUrls=req.files?.map(file => file.path);
        const listing=await Listing.create({...req.body, images: imagesUrls,userRef:req.user.id,
            
        });
        return resp.status(201).json(listing);
    } catch(error){
        next(error);
    }
};
export const deleteListing=async(req,resp,next)=>{
const listing=await Listing.findById(req.params.id);
if(!listing){
    return next(errorHandler(404,'Listing not Found'));
}
if(req.user.id !== listing.userRef){
    return next(errorHandler(401,'you can only delete your own listing'))
}
try{
    await listing.findByIdAndDelete(req.params.id);
 resp.status(200).json('Listing has been deleted');
}catch(error){
    next(error);
}
}
