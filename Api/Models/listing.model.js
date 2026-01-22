import mongoose from 'mongoose';
const listingSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
        },
        description:{
            type:String,
            required:true,
        },
        address:{
            type:String,
            required:true,
        },
        regularPrice:{
            type:Number,
            required:true,
        },
        discountPrice:{
            type:Number,
            default:null,
        },
        bathrooms:{
            type:Number,
            required:true,
       },
       bedrooms:{
        type:Number,
        required:true,

       },
       furnished:{
        type:Boolean,
        required:true,
       },
       parking:{
        type:Boolean,
        required:true,
       },
       type:{
        type:String,
        required:true,
       },
       offer:{
        type:Boolean,
        default:false,
       },
       imageUrls:{
        type:[String],
        required:true,
       },
       userRef:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
      required:true,
       },

    },{timestamps:true}
)
const Listing = mongoose.model('Listing',listingSchema);
export default Listing;