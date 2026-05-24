import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    regularPrice: { type: Number, required: true }, // Ye hamesha INR rahega (Calculations ke liye)
    discountPrice: { type: Number, required: true }, // Ye bhi INR mein
    bathrooms: { type: Number, required: true },
    bedrooms: { type: Number, required: true },
    furnished: { type: Boolean, required: true },
    parking: { type: Boolean, required: true },
    type: { type: String, required: true },
    offer: { type: Boolean, required: true },
    imageUrls: { type: Array, required: true },
    userRef: { type: String, required: true },
    
    // Yahan dhyan dein: Inke naam wahi hone chahiye jo Python bhej raha hai
    originalCurrency: { 
      type: String, 
      default: 'INR' 
    },
    originalRegularPrice: { 
      type: Number 
    },
    originalDiscountPrice: { 
      type: Number 
    }
  },
  { timestamps: true,
    strict: false } // strict false add kiya hai taaki extra fields allow ho sakein
);


const Listing = mongoose.model('Listing', listingSchema);
export default Listing;