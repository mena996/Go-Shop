const mongoose = require('mongoose');

const RefreshSchema = new mongoose.Schema({
    token: { type: String, required: true},
    createdAt: { type: Date, expires: (60 * 60 * 24), default: Date.now }
})
const RefreshModel = mongoose.model('RefreshToken', RefreshSchema);
module.exports = RefreshModel;