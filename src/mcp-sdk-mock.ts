/**
 * Mock du SDK MCP pour éviter les problèmes de dépendances
 * Cette implémentation simplifiée fournit les fonctionnalités essentielles
 * du SDK MCP sans dépendre de la version exacte du package
 */

import { z } from 'zod';
import * as http from 'http';
import { ServerMode } from './types';

// Interface pour les outils du serveur MCP
export interface MCPTool<T extends z.ZodType> {
  name: string;
  description: string;
  parameters: T;
  handler: (params: z.infer<T>) => Promise<any>;
}

// Interface pour les options du serveur MCP
export interface MCPServerOptions {
  name: string;
  version: string;
  mode: ServerMode;
}

// Interface pour le transport du serveur MCP
export interface ServerTransport {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  onRequest?: (handler: (request: any) => Promise<any>) => void;
}

// Classe principale du serveur MCP
export class MCPServer {
  private options: MCPServerOptions;
  private tools: Map<string, MCPTool<any>> = new Map();
  private transport: ServerTransport | null = null;

  constructor(options: MCPServerOptions) {
    this.options = options;
  }

  // Ajoute un outil au serveur
  addTool<T extends z.ZodType>(tool: MCPTool<T>): void {
    this.tools.set(tool.name, tool);
  }

  // Connecte le serveur à un transport
  async connect(transport: ServerTransport): Promise<void> {
    this.transport = transport;
    
    if (this.transport.onRequest) {
      this.transport.onRequest(async (request) => {
        try {
          const { tool, params } = request;
          
          if (!this.tools.has(tool)) {
            return {
              error: `Outil non trouvé: ${tool}`
            };
          }
          
          const mcpTool = this.tools.get(tool)!;
          
          try {
            const validatedParams = mcpTool.parameters.parse(params);
            const result = await mcpTool.handler(validatedParams);
            return result;
          } catch (error) {
            if (error instanceof z.ZodError) {
              return {
                error: `Paramètres invalides: ${error.message}`
              };
            }
            
            return {
              error: `Erreur lors de l'exécution de l'outil: ${error}`
            };
          }
        } catch (error) {
          return {
            error: `Erreur interne du serveur: ${error}`
          };
        }
      });
    }
  }

  // Démarre le serveur
  async start(): Promise<void> {
    if (!this.transport) {
      throw new Error('Le serveur doit être connecté à un transport avant de démarrer');
    }
    
    await this.transport.start();
  }

  // Arrête le serveur
  async stop(): Promise<void> {
    if (this.transport) {
      await this.transport.stop();
    }
  }
}

// Transport pour le mode stdio
export class StdioServerTransport implements ServerTransport {
  private requestHandler: ((request: any) => Promise<any>) | null = null;

  async start(): Promise<void> {
    process.stdin.setEncoding('utf-8');
    
    process.stdin.on('data', async (data) => {
      try {
        const request = JSON.parse(data.toString());
        
        if (this.requestHandler) {
          const response = await this.requestHandler(request);
          process.stdout.write(JSON.stringify(response) + '\n');
        }
      } catch (error) {
        process.stdout.write(JSON.stringify({ error: `Erreur de parsing: ${error}` }) + '\n');
      }
    });
  }

  async stop(): Promise<void> {
    // Rien à faire pour le mode stdio
  }

  onRequest(handler: (request: any) => Promise<any>): void {
    this.requestHandler = handler;
  }
}

// Transport pour le mode HTTP
export class HttpServerTransport implements ServerTransport {
  private server: http.Server | null = null;
  private requestHandler: ((request: any) => Promise<any>) | null = null;
  private host: string;
  private port: number;

  constructor(options: { host: string, port: number }) {
    this.host = options.host;
    this.port = options.port;
  }

  async start(): Promise<void> {
    this.server = http.createServer(async (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
      if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
      }
      
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Méthode non autorisée' }));
        return;
      }
      
      try {
        let body = '';
        
        req.on('data', (chunk) => {
          body += chunk.toString();
        });
        
        req.on('end', async () => {
          try {
            const request = JSON.parse(body);
            
            if (this.requestHandler) {
              const response = await this.requestHandler(request);
              res.statusCode = 200;
              res.end(JSON.stringify(response));
            } else {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Gestionnaire de requêtes non configuré' }));
            }
          } catch (error) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: `Erreur de parsing: ${error}` }));
          }
        });
      } catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: `Erreur interne du serveur: ${error}` }));
      }
    });
    
    return new Promise((resolve) => {
      if (this.server) {
        this.server.listen(this.port, this.host, () => {
          resolve();
        });
      }
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  onRequest(handler: (request: any) => Promise<any>): void {
    this.requestHandler = handler;
  }
}

// Classe pour les templates de ressources
export class ResourceTemplate<T> {
  constructor(private resource: T) {}

  get(): T {
    return this.resource;
  }
}