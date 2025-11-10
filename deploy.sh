#!/bin/bash

echo "🚀 DÉMARRAGE DU DÉPLOIEMENT"

# 1) Aller dans le dossier du projet
cd "/c/Amina/ALTERNANCE/Montorat/BACK-END/Cours et projets/Chapitre 8/Projet7" || exit
echo "📂 Dossier projet : OK"

# 2) Télécharger les dernières mises à jour du code
echo "📦 Mise à jour du code depuis GitHub..."
git pull origin main

# 3) Installer les dépendances Node.js
echo "🔧 Installation / Vérification des dépendances..."
npm install

# 4) (Optionnel) Construire un front si besoin
# npm run build

# 5) Redémarrer l'application avec PM2
echo "♻️ Redémarrage du service Node.js..."
pm2 restart wave-api || pm2 start server.js --name "wave-api"

# 6) Vérifier que PM2 fonctionne bien
pm2 status

echo "✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS"
