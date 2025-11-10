const mongoose = require('mongoose');


const bookSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    author: { type: String },
    publisher: { type: String },
    category: { type: String },
    review: { type: String },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    usersLiked: { type: [String], default: [] },
    usersDisliked: { type: [String], default: [] },
}, { timestamps: true });


module.exports = mongoose.model('Book', bookSchema);