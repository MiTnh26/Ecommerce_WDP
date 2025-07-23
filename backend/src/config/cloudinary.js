const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');
dotenv.config();



cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params:async (req, file) => {
    console.log("req.params:", req.params);
  console.log("req.body:", req.body); 
    const userId = req.params.id || "unknown";
   return {
      folder: `user/${userId}/avatar`,
      allowed_formats: ['jpg', 'jpeg', 'png'],
      transformation: [{ width: 300, height: 300, crop: 'limit' }],
    };
  },
});

module.exports = { cloudinary, storage };
