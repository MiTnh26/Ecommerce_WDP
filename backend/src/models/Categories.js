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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', CategorySchema);
