const {Schema, model} = require('mongoose');

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    full_name: { type: String, required: true },
    phone: { type: String, default: null},
    address: { type: String, default: null},
    role: {
        type: String,
        default: 'READER',
        required: true,
    }
});

module.exports = model('User', userSchema);



