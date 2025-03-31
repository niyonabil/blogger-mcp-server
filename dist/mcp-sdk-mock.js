"use strict";
/**
 * Mock du SDK MCP pour éviter les problèmes de dépendances
 * Cette implémentation simplifiée fournit les fonctionnalités essentielles
 * du SDK MCP sans dépendre de la version exacte du package
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceTemplate = exports.HttpServerTransport = exports.StdioServerTransport = exports.MCPServer = void 0;
const zod_1 = require("zod");
const http = __importStar(require("http"));
// Classe principale du serveur MCP
class MCPServer {
    constructor(options) {
        this.tools = new Map();
        this.transport = null;
        this.options = options;
    }
    // Ajoute un outil au serveur
    addTool(tool) {
        this.tools.set(tool.name, tool);
    }
    // Connecte le serveur à un transport
    async connect(transport) {
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
                    const mcpTool = this.tools.get(tool);
                    try {
                        const validatedParams = mcpTool.parameters.parse(params);
                        const result = await mcpTool.handler(validatedParams);
                        return result;
                    }
                    catch (error) {
                        if (error instanceof zod_1.z.ZodError) {
                            return {
                                error: `Paramètres invalides: ${error.message}`
                            };
                        }
                        return {
                            error: `Erreur lors de l'exécution de l'outil: ${error}`
                        };
                    }
                }
                catch (error) {
                    return {
                        error: `Erreur interne du serveur: ${error}`
                    };
                }
            });
        }
    }
    // Démarre le serveur
    async start() {
        if (!this.transport) {
            throw new Error('Le serveur doit être connecté à un transport avant de démarrer');
        }
        await this.transport.start();
    }
    // Arrête le serveur
    async stop() {
        if (this.transport) {
            await this.transport.stop();
        }
    }
}
exports.MCPServer = MCPServer;
// Transport pour le mode stdio
class StdioServerTransport {
    constructor() {
        this.requestHandler = null;
    }
    async start() {
        process.stdin.setEncoding('utf-8');
        process.stdin.on('data', async (data) => {
            try {
                const request = JSON.parse(data.toString());
                if (this.requestHandler) {
                    const response = await this.requestHandler(request);
                    process.stdout.write(JSON.stringify(response) + '\n');
                }
            }
            catch (error) {
                process.stdout.write(JSON.stringify({ error: `Erreur de parsing: ${error}` }) + '\n');
            }
        });
    }
    async stop() {
        // Rien à faire pour le mode stdio
    }
    onRequest(handler) {
        this.requestHandler = handler;
    }
}
exports.StdioServerTransport = StdioServerTransport;
// Transport pour le mode HTTP
class HttpServerTransport {
    constructor(options) {
        this.server = null;
        this.requestHandler = null;
        this.host = options.host;
        this.port = options.port;
    }
    async start() {
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
                        }
                        else {
                            res.statusCode = 500;
                            res.end(JSON.stringify({ error: 'Gestionnaire de requêtes non configuré' }));
                        }
                    }
                    catch (error) {
                        res.statusCode = 400;
                        res.end(JSON.stringify({ error: `Erreur de parsing: ${error}` }));
                    }
                });
            }
            catch (error) {
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
    async stop() {
        return new Promise((resolve, reject) => {
            if (this.server) {
                this.server.close((err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            }
            else {
                resolve();
            }
        });
    }
    onRequest(handler) {
        this.requestHandler = handler;
    }
}
exports.HttpServerTransport = HttpServerTransport;
// Classe pour les templates de ressources
class ResourceTemplate {
    constructor(resource) {
        this.resource = resource;
    }
    get() {
        return this.resource;
    }
}
exports.ResourceTemplate = ResourceTemplate;
