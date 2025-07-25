const mongoose = require('mongoose');

const avatarSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  publicId: {
    type: String, // dùng khi cần xóa ảnh trên Cloudinary
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Avatar', avatarSchema);
