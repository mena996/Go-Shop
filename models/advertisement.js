const mongoose = require('mongoose');

const AdsSchema = new mongoose.Schema({
    image: { type: String, required: true},
    alt: { type: String, required: true},
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
})
const AdvModel = mongoose.model('Advertisement', AdsSchema);

module.exports = AdvModel;