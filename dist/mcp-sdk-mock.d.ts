/**
 * Mock du SDK MCP pour éviter les problèmes de dépendances
 * Cette implémentation simplifiée fournit les fonctionnalités essentielles
 * du SDK MCP sans dépendre de la version exacte du package
 */
import { z } from 'zod';
import { ServerMode } from './types';
export interface MCPTool<T extends z.ZodType> {
    name: string;
    description: string;
    parameters: T;
    handler: (params: z.infer<T>) => Promise<any>;
}
export interface MCPServerOptions {
    name: string;
    version: string;
    mode: ServerMode;
}
export interface ServerTransport {
    start: () => Promise<void>;
    stop: () => Promise<void>;
    onRequest?: (handler: (request: any) => Promise<any>) => void;
}
export declare class MCPServer {
    private options;
    private tools;
    private transport;
    constructor(options: MCPServerOptions);
    addTool<T extends z.ZodType>(tool: MCPTool<T>): void;
    connect(transport: ServerTransport): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
}
export declare class StdioServerTransport implements ServerTransport {
    private requestHandler;
    start(): Promise<void>;
    stop(): Promise<void>;
    onRequest(handler: (request: any) => Promise<any>): void;
}
export declare class HttpServerTransport implements ServerTransport {
    private server;
    private requestHandler;
    private host;
    private port;
    constructor(options: {
        host: string;
        port: number;
    });
    start(): Promise<void>;
    stop(): Promise<void>;
    onRequest(handler: (request: any) => Promise<any>): void;
}
export declare class ResourceTemplate<T> {
    private resource;
    constructor(resource: T);
    get(): T;
}
