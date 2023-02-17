const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
});

const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);

module.exports = RefreshToken;

module.exports.findRefreshToken = function(token) {
    const query = {token: token};
    return RefreshToken.findOne(query).exec();
}

module.exports.addRefreshToken = function(newRefreshToken, callback) {
    newRefreshToken.save(callback);
}