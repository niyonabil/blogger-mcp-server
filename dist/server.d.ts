import { MCPServer } from './mcp-sdk-mock';
import { BloggerService } from './bloggerService';
import { ServerConfig } from './types';
/**
 * Initialise le serveur MCP pour Blogger avec tous les outils nécessaires
 * @param bloggerService - Service d'interaction avec l'API Blogger
 * @param config - Configuration du serveur
 * @returns Instance du serveur MCP configurée
 */
export declare function initMCPServer(bloggerService: BloggerService, config: ServerConfig): MCPServer;
