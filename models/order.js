const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    date: { type: mongoose.Schema.Types.Date, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        price: { type: mongoose.Schema.Types.Number, require: true },
        quantity: { type: mongoose.Schema.Types.Number, require: true },
    }],
    status: { type: mongoose.Schema.Types.Number, require: true, min:0, max:2 },
    paid: {type: mongoose.Schema.Types.Boolean, required: true}
});
const orderModel = mongoose.model('Order', OrderSchema);
module.exports = orderModel;