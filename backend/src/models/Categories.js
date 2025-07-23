const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  CategoryName: {
    type: String,
    required: true,
    trim: true
  },
  Status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  ShopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', CategorySchema);
