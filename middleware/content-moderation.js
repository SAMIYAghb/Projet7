const forbiddenWords = ['racisme', 'violence', 'discrimination', 'haine'];

module.exports = (req, res, next) => {
  const data = req.body.book ? JSON.parse(req.body.book) : req.body;

  const text = `${data.title} ${data.review} ${data.category}`.toLowerCase();
  for (const word of forbiddenWords) {
    if (text.includes(word)) {
      return res.status(400).json({ 
        message: `Votre publication contient un terme interdit : "${word}". Veuillez reformuler.` 
      });
    }
  }
  next();
};
 
