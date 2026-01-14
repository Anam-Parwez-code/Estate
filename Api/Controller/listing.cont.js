import Listing from '../Models/listing.model.js';
export const createListing=async (req,resp,next) =>{
    try{
        const imagesUrls=req.files?.map(file => file.path);
        const listing=await Listing.create({...req.body, images: imagesUrls,userRef:req.user.id,
            
        });
        return resp.status(201).json(listing);
    } catch(error){
        next(error);
    }
}