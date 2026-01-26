import cloudinary from '../utils/cloudinary.js';

const uploadImage = async (req, res) => {
  try {
    const { image } = req.body; // base64 string

    const result = await cloudinary.uploader.upload(image, {
      folder: 'estate-app',
    });

    res.status(200).json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default uploadImage;
