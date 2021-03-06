const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
})
const favoriteModel = mongoose.model('Favorite', FavoriteSchema);
module.exports = favoriteModel;