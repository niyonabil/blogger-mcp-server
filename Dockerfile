FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY tsconfig.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY src/ ./src/

# Compiler le projet TypeScript
RUN npm run build

# Exposer le port pour le mode HTTP
EXPOSE 3000

# Définir les variables d'environnement par défaut
ENV MCP_MODE=http
ENV MCP_HTTP_HOST=0.0.0.0
ENV MCP_HTTP_PORT=3000
ENV BLOGGER_MAX_RESULTS=10
ENV BLOGGER_API_TIMEOUT=30000
ENV LOG_LEVEL=info

# Démarrer le serveur
CMD ["node", "dist/index.js"]
