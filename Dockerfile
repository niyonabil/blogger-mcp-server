# Dockerfile amélioré pour blogger-mcp-server (compatibilité Glama)

# Étape 1: Construction de l'application
FROM node:20-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de manifeste et de verrouillage des dépendances
COPY package.json package-lock.json* ./

# Installer les dépendances de production et de développement pour la compilation
RUN npm install

# Copier le reste des fichiers sources de l'application
COPY . .

# Compiler le projet TypeScript
RUN npm run build

# Supprimer les dépendances de développement après la compilation
RUN npm prune --production

# Étape 2: Création de l'image de production
FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /app

# Créer un utilisateur non-root pour exécuter l'application
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copier les dépendances de production et les fichiers compilés depuis l'étape de construction
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Définir les variables d'environnement
# BLOGGER_API_KEY doit être fournie à l'exécution (docker run -e BLOGGER_API_KEY=VOTRE_CLE)
ENV MCP_MODE=http
ENV MCP_HTTP_HOST=0.0.0.0
ENV MCP_HTTP_PORT=3000
ENV BLOGGER_MAX_RESULTS=10
ENV BLOGGER_API_TIMEOUT=30000
ENV LOG_LEVEL=info
# NODE_ENV=production est souvent une bonne pratique pour les applications Node.js
ENV NODE_ENV=production

# Exposer le port sur lequel l'application écoute
EXPOSE 3000

# Changer le propriétaire des fichiers de l'application pour l'utilisateur non-root
RUN chown -R appuser:appgroup /app

# Basculer vers l'utilisateur non-root
USER appuser

# Commande pour démarrer le serveur
CMD ["node", "dist/index.js"]

# Métadonnées de l'image (optionnel, mais recommandé)
LABEL maintainer="niyonabil"
LABEL description="Serveur MCP pour interagir avec l'API Blogger de Google."
LABEL version="1.0.4" # Se baser sur la version du package.json si possible
