// Configuration du serveur MCP pour Blogger
export const config = {
  // Mode de fonctionnement du serveur (stdio ou http)
  mode: process.env.MCP_MODE || 'stdio',
  
  // Configuration du mode HTTP (si utilisé)
  http: {
    host: process.env.MCP_HTTP_HOST || '0.0.0.0',
    port: parseInt(process.env.MCP_HTTP_PORT || '3000', 10)
  },
  
  // Configuration de l'API Blogger
  blogger: {
    apiKey: process.env.BLOGGER_API_KEY,
    // Nombre maximum de résultats par défaut pour les requêtes de liste
    maxResults: parseInt(process.env.BLOGGER_MAX_RESULTS || '10', 10),
    // Timeout pour les requêtes API en millisecondes
    timeout: parseInt(process.env.BLOGGER_API_TIMEOUT || '30000', 10)
  },
  
  // Configuration des logs
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};
