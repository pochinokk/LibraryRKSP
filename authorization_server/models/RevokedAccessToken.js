const {Schema, model} = require('mongoose');

const revokedAccessTokenSchema = new Schema({
    access_token: { type: String, required: true, unique: true },
    delete_time: { type: Date, required: true }
});

module.exports = model('RevokedAccessToken', revokedAccessTokenSchema);



