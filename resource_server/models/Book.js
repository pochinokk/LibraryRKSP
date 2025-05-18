const {Schema, model} = require('mongoose');

const bookSchema = new Schema({
    reader_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: true },
    author: { type: String, required: true },
    printing_year: { type: Number, default: null },
    language: { type: String, required: true },
    end_date: { type: Date, default: null }
});

module.exports = model('Book', bookSchema);



