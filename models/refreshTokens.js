const mongoose = require('mongoose');

const RefreshSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    token: { type: String, required: true},
    createdAt: { type: Date, expires: (60 * 60 * 24 * 7), default: Date.now }
})
const RefreshModel = mongoose.model('RefreshToken', RefreshSchema);
module.exports = RefreshModel;