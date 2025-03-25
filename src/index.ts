import { config } from './config';
import { BloggerService } from './bloggerService';
import { initMCPServer } from './server';
import { StdioServerTransport, HttpServerTransport } from './mcp-sdk-mock';
import { ServerMode } from './types';

/**
 * Point d'entrée principal du serveur MCP pour Blogger
 */
async function main() {
  try {
    console.log('Démarrage du serveur MCP pour Blogger...');
    
    // Initialiser le service Blogger
    const bloggerService = new BloggerService();
    
    // Convertir la configuration au format attendu par le serveur
    const serverMode: ServerMode = config.mode === 'http' 
      ? { type: 'http' as const, host: config.http.host, port: config.http.port } 
      : { type: 'stdio' as const };
    
    const serverConfig = {
      mode: serverMode,
      blogger: config.blogger,
      logging: config.logging
    };
    
    // Initialiser le serveur MCP avec tous les outils
    const server = initMCPServer(bloggerService, serverConfig);
    
    // Configurer le transport approprié selon le mode
    if (serverMode.type === 'http') {
      const httpMode = serverMode;
      const transport = new HttpServerTransport({
        host: httpMode.host,
        port: httpMode.port
      });
      await server.connect(transport);
    } else {
      const transport = new StdioServerTransport();
      await server.connect(transport);
    }
    
    // Démarrer le serveur
    await server.start();
    
    console.log(`Serveur MCP pour Blogger démarré en mode ${config.mode}`);
    if (config.mode === 'http') {
      console.log(`Écoute sur ${config.http.host}:${config.http.port}`);
    }
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur MCP pour Blogger:', error);
    process.exit(1);
  }
}

// Exécuter la fonction principale
main();
