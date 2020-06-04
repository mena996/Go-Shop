const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 50 },
    description: { type: String },
    image: [{ type: String, required: true, minlength: 4 }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
    price: { type: Number, required: true, min: 0 },
})

const productModel = mongoose.model('Product', ProductSchema);
module.exports = productModel;