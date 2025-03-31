#!/bin/bash

# Script de démarrage pour le serveur MCP Blogger en mode production

# Vérifier si l'API key est définie
if [ -z "$BLOGGER_API_KEY" ]; then
  echo "Erreur: La variable d'environnement BLOGGER_API_KEY n'est pas définie."
  echo "Veuillez définir cette variable avec votre clé API Blogger."
  echo "Exemple: export BLOGGER_API_KEY=votre_cle_api"
  exit 1
fi

# Vérifier si le projet est compilé
if [ ! -d "dist" ]; then
  echo "Erreur: Le projet n'est pas compilé."
  echo "Veuillez exécuter 'npm run build' avant de démarrer le serveur en production."
  exit 1
fi

# Démarrer le serveur en mode production
echo "Démarrage du serveur MCP Blogger en mode production..."
node dist/index.js
