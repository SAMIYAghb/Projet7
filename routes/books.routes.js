const express = require('express');
const router = express.Router();
const bookCtrl = require('../controllers/book.controller');
const moderation = require('../middleware/content-moderation');
const { auth, optional } = require('../middleware/auth.middleware');
const multer = require('../middleware/multer-config');
const Book = require('../models/Book.model');
// Route de recherche /api/books/search?title=harry
router.get('/search', async (req, res, next) => {
  try {
    const query = {};
    if (req.query.title) query.title = { $regex: req.query.title, $options: 'i' };
    if (req.query.author) query.author = { $regex: req.query.author, $options: 'i' };
    if (req.query.category) query.category = req.query.category;

    const books = await Book.find(query);
    res.status(200).json(books);
  } catch (err) { next(err); }
});
 


// Routes livres
router.get('/', optional, bookCtrl.getAll);// JWT facultatif
router.get('/:id', bookCtrl.getOne);

router.post('/', auth, multer, bookCtrl.create);// JWT obligatoire

router.put('/:id', auth, multer, bookCtrl.update);
router.delete('/:id', auth, bookCtrl.remove);
router.post('/:id/like', auth, bookCtrl.like);

//projet 7Diminution des contenus offensants
router.post('/', auth, moderation, multer, bookCtrl.create);

module.exports = router;