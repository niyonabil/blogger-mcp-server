"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const bloggerService_1 = require("./bloggerService");
const server_1 = require("./server");
const mcp_sdk_mock_1 = require("./mcp-sdk-mock");
/**
 * Point d'entrée principal du serveur MCP pour Blogger
 */
async function main() {
    try {
        console.log('Démarrage du serveur MCP pour Blogger...');
        // Initialiser le service Blogger
        const bloggerService = new bloggerService_1.BloggerService();
        // Convertir la configuration au format attendu par le serveur
        const serverMode = config_1.config.mode === 'http'
            ? { type: 'http', host: config_1.config.http.host, port: config_1.config.http.port }
            : { type: 'stdio' };
        const serverConfig = {
            mode: serverMode,
            blogger: config_1.config.blogger,
            logging: config_1.config.logging
        };
        // Initialiser le serveur MCP avec tous les outils
        const server = (0, server_1.initMCPServer)(bloggerService, serverConfig);
        // Configurer le transport approprié selon le mode
        if (serverMode.type === 'http') {
            const httpMode = serverMode;
            const transport = new mcp_sdk_mock_1.HttpServerTransport({
                host: httpMode.host,
                port: httpMode.port
            });
            await server.connect(transport);
        }
        else {
            const transport = new mcp_sdk_mock_1.StdioServerTransport();
            await server.connect(transport);
        }
        // Démarrer le serveur
        await server.start();
        console.log(`Serveur MCP pour Blogger démarré en mode ${config_1.config.mode}`);
        if (config_1.config.mode === 'http') {
            console.log(`Écoute sur ${config_1.config.http.host}:${config_1.config.http.port}`);
        }
    }
    catch (error) {
        console.error('Erreur lors du démarrage du serveur MCP pour Blogger:', error);
        process.exit(1);
    }
}
// Exécuter la fonction principale
main();
