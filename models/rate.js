const mongoose = require('mongoose');

const RateSchema = new mongoose.Schema({
    rate: { type: Number, required: true, min: 0, max: 5 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
})
const rateModel = mongoose.model('Rate', RateSchema);
module.exports = rateModel;