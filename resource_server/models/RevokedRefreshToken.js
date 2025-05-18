const {Schema, model} = require('mongoose');

const revokedRefreshTokenSchema = new Schema({
    refresh_token: { type: String, required: true, unique: true },
    delete_time: { type: Date, required: true }
});

module.exports = model('RevokedRefreshToken', revokedRefreshTokenSchema);



