const mongoose = require('mongoose');

const ProductVariantSchema = new mongoose.Schema({
    Image: { type: String, required: true },
    Price: { type: Number, required: true },
    ProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    ProductVariantName: { type: String, required: true },
    StockQuantity: { type: Number, required: true },
    productName: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
});

module.exports = mongoose.model('ProductVariant', ProductVariantSchema,"productVariants");
