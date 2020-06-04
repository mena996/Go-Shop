const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    state: { type: Number, required: true, min: 0, max: 3 },//0->add //1-bought //2-wishlist //3-deliverd
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
})
const cartModel = mongoose.model('ShelvBook', CartSchema);
module.exports = cartModel;