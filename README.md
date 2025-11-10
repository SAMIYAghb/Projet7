# Wave — API Express + Mongoose

API de la bibliothèque Wave (Villers-Cotterêts) permettant de partager, modifier et liker des livres.

## Prérequis

- Node.js >= 18
- MongoDB Atlas (ou local)
- npm ou yarn

## Installation

```bash
# Cloner le projet
git clone <url-du-projet>
cd wave-api

# Installer les dépendances
npm install

# Créer un fichier .env
touch .env


## .env :

PORT=3000
MONGO_URI=<ton-mongo-atlas-uri>
JWT_SECRET=une_chaine_secrete
TOKEN_EXP=24h


## Lancer le serveur

# Développement avec nodemon
npm run dev

# Production
npm start

## Structure du projet

wave-api/
├─ images/                 # images uploadées
├─ controllers/            # authController.js, bookController.js
├─ middlewares/            # auth.middleware.js, multer-config.js
├─ models/                 # User.js, Book.js
├─ routes/                 # auth.routes.js, books.routes.js
├─ .env
├─ server.js
├─ package.json
└─ README.md


## Routes de l’API
| Route                 | Méthode | Auth | Description                     |
| --------------------- | ------- | ---- | ------------------------------- |
| `/api/auth/signup`    | POST    | ❌    | Inscription utilisateur         |
| `/api/auth/login`     | POST    | ❌    | Connexion utilisateur           |
| `/api/books`          | GET     | ❌    | Voir tous les livres            |
| `/api/books/:id`      | GET     | ❌    | Voir un livre spécifique        |
| `/api/books`          | POST    | ✅    | Ajouter un livre (image + JSON) |
| `/api/books/:id`      | PUT     | ✅    | Modifier un livre               |
| `/api/books/:id`      | DELETE  | ✅    | Supprimer un livre              |
| `/api/books/:id/like` | POST    | ✅    | Like / Dislike un livre         |


## Exemple Postman
# Signup :

POST /api/auth/signup
{
  "name": "Paul",
  "email": "paul@example.com",
  "password": "azertyui"
}


# Login :

POST /api/auth/login
{
  "email": "paul@example.com",
  "password": "azertyui"
}


# Créer un livre (form-data) :

image: <fichier>
book: {"userId":"<userId>","title":"Mon livre","author":"Auteur","publisher":"Maison","category":"Roman","review":"Super livre"}


# Like / Dislike :

POST /api/books/:id/like
{
  "userId": "<userId>",
  "like": 1
}


## Modèles MongoDB
#
User

name: String

email: String, unique

password: String (haché)

# Book

userId: String

title, author, publisher, category, review: String

imageUrl: String

likes, dislikes: Number

usersLiked, usersDisliked: [String]


## Sécurité

Password haché avec bcrypt

Routes protégées avec JWT

Vérification que seul l’auteur peut modifier ou supprimer un livre

Limitation du nombre de requêtes avec express-rate-limit

Entêtes sécurisées avec helmet

Vérification du type de fichiers uploadés via multer


## 2️⃣ Sécuriser ton API

### a) Authentification

- JWT sur toutes les routes sensibles (`POST`, `PUT`, `DELETE`, `/like`)  
- Expiration du token (`TOKEN_EXP=24h`)  
- Vérifier `req.auth.userId === book.userId` pour modification/suppression

### b) Protection contre les attaques

- **helmet** → sécurise les entêtes HTTP  
- **cors** → configure les origines autorisées  
- **express-rate-limit** → limite le nombre de requêtes (ex: 200 requêtes / 15 min)  
- **bcrypt** → hachage des mots de passe  
- Vérifier les extensions de fichiers **uniquement images** via multer  
- Désactiver le stockage des fichiers temporaires en production, utiliser **S3/CDN**

## Tests

Utiliser Postman pour toutes les routes CRUD + like/dislike

Vérifier que les erreurs remontent correctement (404, 401, 400)
