import express from 'express';
import multer from 'multer';
import cloudinary from '../utils/cloudinary.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // memory me store kare

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'listings' },
      (error, result) => {
        if (error) return res.status(500).json({ success: false, message: error.message });
        res.json({ success: true, url: result.secure_url });
      }
    );
    stream.end(file.buffer); // multer memory se buffer send karenge
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
