const Book = require('../models/Book.model');
const fs = require('fs');
const path = require('path');
const User = require('../models/User.model');

// GET all books
// exports.getAll = async (req, res, next) => {
//   try {
//     const userId = req.auth.userId; // récupéré via JWT
//     const books = await Book.find({ userId }); // ← seulement ses livres
//     res.status(200).json(books);
//   } catch (err) { next(err); }
// };
// exports.getAll = async (req, res, next) => {
//   try {
//     const books = await Book.find();
//     const userId = req.auth?.userId || null; // si JWT fourni

//     // Ajouter propriété isOwner pour chaque livre
//     const booksWithOwnership = books.map(book => ({
//       ...book._doc,
//       isOwner: book.userId.toString() === userId?.toString()
//     }));

//     res.status(200).json(booksWithOwnership);
//   } catch (err) { next(err); }
// };

exports.getAll = async (req, res, next) => {
  try {
    const books = await Book.find();
    const userId = req.auth?.userId || null;

    const booksWithOwner = await Promise.all(
      books.map(async book => {
        const user = await User.findById(book.userId);
        return {
          ...book._doc,
          creatorName: user ? user.name : 'Unknown',
          isOwner: userId ? book.userId.toString() === userId.toString() : false
        };
      })
    );

    res.status(200).json(booksWithOwner);
  } catch (err) {
    next(err);
  }
};


// GET single book
exports.getOne = async (req, res, next) => {
    try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.status(200).json(book);
    } catch (err) { next(err); }
};


// POST create book
exports.create = async (req, res, next) => {
    try {
    const bookData = req.body.book ? JSON.parse(req.body.book) : req.body;
    if (!req.file) return res.status(400).json({ message: 'Image required' });


    const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;


    const book = new Book({
    userId: bookData.userId,
    title: bookData.title,
    imageUrl,
    author: bookData.author || '',
    publisher: bookData.publisher || '',
    category: bookData.category || '',
    review: bookData.review || '',
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: []
    });
    await book.save();
    res.status(201).json({ message: 'Book created' });
    } catch (err) { next(err); }
};


// PUT update book
exports.update = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // Vérifie si le token appartient au propriétaire
    if (book.userId !== req.auth.userId) return res.status(401).json({ message: '404: unauthorized request' });

    // Si on a un champ 'book' (chaîne JSON) dans le body, on le parse.
    // Si on a un fichier, on traitera l'image plus bas.
    let updatedData;
    if (req.body && req.body.book) {
      // req.body.book peut être une string JSON quand la requête est form-data (même sans file)
      updatedData = typeof req.body.book === 'string' ? JSON.parse(req.body.book) : req.body.book;
    } else {
      // req.body contient directement les champs si envoyé en JSON pur
      updatedData = req.body;
    }

    // Si un nouveau fichier a été uploadé, supprimer l'ancienne image et mettre à jour imageUrl
    if (req.file) {
      const oldFilename = book.imageUrl ? book.imageUrl.split('/images/')[1] : null;
      if (oldFilename) {
        const oldPath = path.join(__dirname, '..', 'images', oldFilename);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updatedData.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
    }

    // Nettoyage : enlever champs indésirables si besoin (ex: _id, userId si tu veux pas le changer)
    delete updatedData._id;
    // si tu veux empêcher le changement du userId :
    // delete updatedData.userId;

    await Book.findByIdAndUpdate(req.params.id, { $set: updatedData }, { new: true });
    res.status(200).json({ message: 'Book updated' });
  } catch (err) {
    next(err);
  }
}; 
// DELETE book
exports.remove = async (req, res, next) => {
    try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.userId !== req.auth.userId) return res.status(401).json({ message: '404: unauthorized request' });


    const filename = book.imageUrl.split('/images/')[1];
    const filePath = path.join(__dirname, '..', 'images', filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);


    await Book.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Book deleted' });
    } catch (err) { next(err); }
};

// POST like/dislike
exports.like = async (req, res, next) => {
    try {
    const { userId, like } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });


    if (like === 1 && !book.usersLiked.includes(userId)) {
    book.usersLiked.push(userId);
    book.likes = book.usersLiked.length;
    const idx = book.usersDisliked.indexOf(userId);
    if (idx !== -1) book.usersDisliked.splice(idx, 1);
    book.dislikes = book.usersDisliked.length;
    } else if (like === -1 && !book.usersDisliked.includes(userId)) {
    book.usersDisliked.push(userId);
    book.dislikes = book.usersDisliked.length;
    const idx = book.usersLiked.indexOf(userId);
    if (idx !== -1) book.usersLiked.splice(idx, 1);
    book.likes = book.usersLiked.length;
    } else if (like === 0) {
    const idxL = book.usersLiked.indexOf(userId);
    if (idxL !== -1) book.usersLiked.splice(idxL, 1);
    const idxD = book.usersDisliked.indexOf(userId);
    if (idxD !== -1) book.usersDisliked.splice(idxD, 1);
    book.likes = book.usersLiked.length;
    book.dislikes = book.usersDisliked.length;
    }


    await book.save();
    res.status(200).json({ message: 'Like status updated' });
    } catch (err) { next(err); }
};