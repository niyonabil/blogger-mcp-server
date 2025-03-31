#!/bin/bash

# Script de démarrage pour le serveur MCP Blogger en mode développement

# Vérifier si l'API key est définie
if [ -z "$BLOGGER_API_KEY" ]; then
  echo "Erreur: La variable d'environnement BLOGGER_API_KEY n'est pas définie."
  echo "Veuillez définir cette variable avec votre clé API Blogger."
  echo "Exemple: export BLOGGER_API_KEY=votre_cle_api"
  exit 1
fi

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
  echo "Installation des dépendances..."
  npm install
fi

# Compiler le projet si nécessaire
if [ ! -d "dist" ]; then
  echo "Compilation du projet..."
  npm run build
fi

# Démarrer le serveur en mode développement
echo "Démarrage du serveur MCP Blogger en mode développement..."
npm run dev
