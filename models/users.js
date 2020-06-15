const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const ProductsModel = require('./product');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, minlength: 2 },
    lastName: { type: String, required: true, minlength: 2 },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, match: /.+@.+\..+/ },
    phone: { type: String, required: true, match: /^(012[2|7]|010[0|6]|011[1|4]|0155).{7}$/ },
    address: { type: String, required: true, minlength: 5 },
    password: { type: String, required: true, minlength: 4 },
    // image: { type: String, required: false },
    isadmin: { type: Boolean, required: true, minlength: 4 },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product'}],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product'}],
    cart: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        price: { type: mongoose.Schema.Types.Number, require: true },
        quantity: { type: mongoose.Schema.Types.Number, require: true },
    }],
})
userSchema.pre('save', async function () {
    let docs = await userModel.find({ username: this.username });
    console.log(docs);
    if (docs.length) {
        throw 'username exist!';
    }
    docs = await userModel.find({ email: this.email });
    if (docs.length) {
        throw 'email exist!';
    }
    this.password = bcrypt.hashSync(this.password, 10);
});
userSchema.pre('updateOne', async function () {
    // console.log(this.password);
    // this._update.password="sdsdsdsdsdsdsdsdsdsddsdsdsd" ;
    // console.log(this._update.password);
});
const userModel = mongoose.model('User', userSchema);
module.exports = userModel;