const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 50 },
    image: { type: String, required: true, minlength: 4 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
})

const productModel = mongoose.model('Product', ProductSchema);
module.exports = productModel;