const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });
const Avatar = require('../models/Avatar');

router.post('/upload', upload.single('Image'), async (req, res) => {
  try {
    const result = req.file; 
    const avatar = new Avatar({
      imageUrl: result.path,
      publicId: result.filename,
    });
    await avatar.save();

    res.status(200).json({
      success: true,
      message: 'Upload successful',
      imageUrl: result.path,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

module.exports = router;
