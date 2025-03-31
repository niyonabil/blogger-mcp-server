import { config } from './config';
import { BloggerService } from './bloggerService';
import { initMCPServer } from './server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Server as HttpServer } from 'http';
import { ServerMode, ServerStatus, ClientConnection, ServerStats } from './types';
import { WebUIManager } from './ui-manager';

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
    
    // Initialiser le gestionnaire d'interface utilisateur
    const uiManager = new WebUIManager();
    
    // Démarrer l'interface utilisateur sur le port 3001 (ou un autre port configuré)
    const uiPort = process.env.UI_PORT ? parseInt(process.env.UI_PORT) : 3001;
    await uiManager.start(uiPort);
    
    // Initialiser les statistiques et l'état du serveur
    const serverTools = [
      'list_blogs', 'get_blog', 'create_blog', 'list_posts', 
      'search_posts', 'get_post', 'create_post', 'update_post', 
      'delete_post', 'list_labels', 'get_label'
    ];
    
    const serverStatus: ServerStatus = {
      running: true,
      mode: serverMode.type,
      startTime: new Date(),
      connections: 0,
      tools: serverTools
    };
    
    const serverStats: ServerStats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      toolUsage: serverTools.reduce((acc, tool) => {
        acc[tool] = 0;
        return acc;
      }, {} as Record<string, number>)
    };
    
    uiManager.updateStatus(serverStatus);
    uiManager.updateStats(serverStats);
    
    // Configurer le transport approprié selon le mode
    if (serverMode.type === 'http') {
      // Pour le mode HTTP, nous utilisons directement le serveur HTTP de Node.js
      // car le SDK MCP officiel n'a pas d'équivalent direct à HttpServerTransport
      const httpMode = serverMode;
      const httpServer = new HttpServer((req, res) => {
        if (req.method === 'OPTIONS') {
          res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          });
          res.end();
          return;
        }
        
        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Méthode non autorisée' }));
          return;
        }
        
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', async () => {
          try {
            const request = JSON.parse(body);
            const { tool, params } = request;
            
            // Mettre à jour les statistiques
            updateStats(tool);
            
            // Ajouter une connexion client
            const clientIp = req.socket.remoteAddress || 'unknown';
            updateConnections(req.socket.remotePort?.toString() || 'client', clientIp);
            
            // Appeler l'outil approprié via le SDK MCP
            try {
              const startTime = Date.now();
              
              // Utiliser la méthode appropriée du SDK MCP pour appeler l'outil
              // Note: Le SDK MCP n'a pas de méthode callTool, nous devons donc
              // implémenter notre propre logique pour router les appels d'outils
              let result;
              
              // Trouver l'outil correspondant dans la liste des outils enregistrés
              if (serverTools.includes(tool)) {
                // Simuler l'appel d'outil en utilisant directement le service Blogger
                switch (tool) {
                  case 'list_blogs':
                    const blogs = await bloggerService.listBlogs();
                    result = { blogs };
                    break;
                  case 'get_blog':
                    const blog = await bloggerService.getBlog(params.blogId);
                    result = { blog };
                    break;
                  case 'list_posts':
                    const posts = await bloggerService.listPosts(params.blogId, params.maxResults);
                    result = { posts };
                    break;
                  case 'search_posts':
                    const searchResults = await bloggerService.searchPosts(params.blogId, params.query, params.maxResults);
                    result = { posts: searchResults };
                    break;
                  case 'get_post':
                    const post = await bloggerService.getPost(params.blogId, params.postId);
                    result = { post };
                    break;
                  case 'create_post':
                    const newPost = await bloggerService.createPost(params.blogId, {
                      title: params.title,
                      content: params.content,
                      labels: params.labels
                    });
                    result = { post: newPost };
                    break;
                  case 'update_post':
                    const updatedPost = await bloggerService.updatePost(params.blogId, params.postId, {
                      title: params.title,
                      content: params.content,
                      labels: params.labels
                    });
                    result = { post: updatedPost };
                    break;
                  case 'delete_post':
                    await bloggerService.deletePost(params.blogId, params.postId);
                    result = { success: true };
                    break;
                  case 'list_labels':
                    const labels = await bloggerService.listLabels(params.blogId);
                    result = { labels };
                    break;
                  case 'get_label':
                    const label = await bloggerService.getLabel(params.blogId, params.labelName);
                    result = { label };
                    break;
                  case 'create_blog':
                    result = { 
                      error: 'La création de blogs n\'est pas supportée par l\'API Blogger. Veuillez créer un blog via l\'interface web de Blogger.' 
                    };
                    break;
                  default:
                    throw new Error(`Outil inconnu: ${tool}`);
                }
              } else {
                throw new Error(`Outil inconnu: ${tool}`);
              }
              
              const duration = Date.now() - startTime;
              
              // Mettre à jour les statistiques de réussite
              updateStats(tool, true, duration);
              
              res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(JSON.stringify(result));
            } catch (error) {
              // Mettre à jour les statistiques d'échec
              updateStats(tool, false);
              
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ 
                error: `Erreur lors de l'exécution de l'outil: ${error}` 
              }));
            }
          } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Erreur de parsing: ${error}` }));
          }
        });
      });
      
      httpServer.listen(httpMode.port, httpMode.host, () => {
        console.log(`Serveur MCP pour Blogger démarré en mode HTTP`);
        console.log(`Écoute sur ${httpMode.host}:${httpMode.port}`);
        console.log(`Interface utilisateur disponible sur http://localhost:${uiPort}`);
      });
    } else {
      // Pour le mode stdio, nous utilisons le transport du SDK MCP officiel
      const transport = new StdioServerTransport();
      await server.connect(transport);
      console.log(`Serveur MCP pour Blogger démarré en mode stdio`);
      console.log(`Interface utilisateur disponible sur http://localhost:${uiPort}`);
    }
    
    // Fonctions pour mettre à jour les statistiques et les connexions
    const connections: Record<string, ClientConnection> = {};
    let stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalResponseTime: 0,
      toolUsage: serverTools.reduce((acc, tool) => {
        acc[tool] = 0;
        return acc;
      }, {} as Record<string, number>)
    };
    
    function updateStats(tool: string, success = true, duration = 0) {
      stats.totalRequests++;
      if (success) {
        stats.successfulRequests++;
        stats.totalResponseTime += duration;
      }
      
      if (stats.toolUsage[tool] !== undefined) {
        stats.toolUsage[tool]++;
      }
      
      const updatedStats: ServerStats = {
        totalRequests: stats.totalRequests,
        successfulRequests: stats.successfulRequests,
        failedRequests: stats.totalRequests - stats.successfulRequests,
        averageResponseTime: stats.successfulRequests > 0 
          ? Math.round(stats.totalResponseTime / stats.successfulRequests) 
          : 0,
        toolUsage: stats.toolUsage
      };
      
      uiManager.updateStats(updatedStats);
    }
    
    function updateConnections(clientId: string, clientIp?: string) {
      const now = new Date();
      
      if (!connections[clientId]) {
        connections[clientId] = {
          id: clientId,
          ip: clientIp,
          connectedAt: now,
          lastActivity: now,
          requestCount: 1
        };
      } else {
        connections[clientId].lastActivity = now;
        connections[clientId].requestCount++;
      }
      
      // Nettoyer les connexions inactives (plus de 5 minutes)
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      Object.keys(connections).forEach(id => {
        if (connections[id].lastActivity < fiveMinutesAgo) {
          delete connections[id];
        }
      });
      
      uiManager.updateConnections(Object.values(connections));
      
      // Mettre à jour le statut avec le nombre de connexions
      const updatedStatus: ServerStatus = {
        ...serverStatus,
        connections: Object.keys(connections).length
      };
      
      uiManager.updateStatus(updatedStatus);
    }
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur MCP pour Blogger:', error);
    process.exit(1);
  }
}

// Exécuter la fonction principale
main();
