const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'images');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
    cb(null, Date.now() + '_' + safeName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.test(ext)) return cb(new Error('Only images are allowed'));
  cb(null, true);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2 Mo max
}).single('image');


// Avec cette version :

// Seuls les fichiers jpg/jpeg/png sont acceptés.

// Taille maximale gérée de manière sûre par multer.

// Nom de fichier nettoyé pour éviter les caractères spéciaux.

// Plus fiable pour production.