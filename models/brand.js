const mongoose = require('mongoose');
const ProductModel = require('./product');

const BrandSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 2 },
    description: { type: String, required: true, minlength: 2 },
    image: { type: String, required: true, minlength: 4 },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
})

BrandSchema.pre('findOneAndDelete', function(next) {
    ProductModel.deleteMany({brand_id: this._id}).exec();
    next();
});

const brandModel = mongoose.model('Brand', BrandSchema);
module.exports = brandModel;