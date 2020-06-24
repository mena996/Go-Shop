const mongoose = require('mongoose');
const ProductModel = require('./product');

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 2 },
    image: { type: String, required: true, minlength: 4 },
})

CategorySchema.pre('findOneAndDelete', function(next) {
    ProductModel.deleteMany({category_id: this._id}).exec();
    next();
});

const categoryModel = mongoose.model('Category', CategorySchema);
module.exports = categoryModel;