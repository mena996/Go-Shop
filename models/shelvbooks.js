const mongoose = require('mongoose');

const ShelvBookSchema = new mongoose.Schema({
    state: { type: Number, required: true, min: 0, max: 3 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
})
const shelvBookModel = mongoose.model('ShelvBook', ShelvBookSchema);
module.exports = shelvBookModel;