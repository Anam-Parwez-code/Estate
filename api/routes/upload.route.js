import express from 'express';
import multer from 'multer';
import cloudinary from '../utils/cloudinary.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    
    // ✅ TRANSFORMATIONS ADD KARO - Images optimize ke liye
    const transformation = [
      { width: 800, height: 600, crop: 'limit' },  // Resize
      { quality: 'auto:good' },                      // Auto quality
      { format: 'webp' }                             // WebP format
    ];
    
    const stream = cloudinary.uploader.upload_stream(
      { 
        folder: 'listings',
        transformation: transformation  // ← YE ADD KARO
      },
      (error, result) => {
        if (error) return res.status(500).json({ success: false, message: error.message });
        res.json({ success: true, url: result.secure_url });
      }
    );
    
    stream.end(file.buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;