import multer from 'multer';
import cloudinary from'../config/cloudinary.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
const storage=new CloudinaryStorage({
    cloudinary:cloudinary,
    params:{
        folder:'listings',
        allowed_formats:['jpg','png','jpeg'],
    },
});
const upload = multer({ storage: storage });

export default upload;