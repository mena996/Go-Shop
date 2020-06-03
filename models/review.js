const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    review: { type: String, required: true, minlength: 2 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
})
const reviewModel = mongoose.model('Review', ReviewSchema);
module.exports = reviewModel;