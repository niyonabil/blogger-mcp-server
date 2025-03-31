/**
 * Types utilisés dans le serveur MCP pour Blogger
 */

// Type pour un blog
export interface BloggerBlog {
  id: string;
  name: string;
  description?: string;
  url: string;
  status?: string;
  posts?: BloggerPost[];
  labels?: BloggerLabel[];
}

// Type pour un post
export interface BloggerPost {
  id: string;
  blogId: string;
  title: string;
  content: string;
  url?: string;
  published?: string;
  updated?: string;
  author?: {
    id: string;
    displayName: string;
    url: string;
    image?: {
      url: string;
    };
  };
  labels?: string[];
}

// Type pour un label
export interface BloggerLabel {
  id?: string;
  name: string;
}

// Type pour les paramètres de recherche
export interface SearchParams {
  query: string;
  maxResults?: number;
}

// Type pour les paramètres de pagination
export interface PaginationParams {
  pageToken?: string;
  maxResults?: number;
}

// Type pour les modes de fonctionnement du serveur
export type ServerMode =
  | { type: 'stdio' }
  | { type: 'http', host: string, port: number };

// Type pour la configuration du serveur
export interface ServerConfig {
  mode: ServerMode;
  blogger: {
    apiKey?: string;
    maxResults: number;
    timeout: number;
  };
  logging: {
    level: string;
  };
}

// Types pour l'interface utilisateur
export interface ServerStatus {
  running: boolean;
  mode: string;
  startTime?: Date;
  connections: number;
  tools: string[];
}

export interface ClientConnection {
  id: string;
  ip?: string;
  connectedAt: Date;
  lastActivity: Date;
  requestCount: number;
}

export interface ServerStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  toolUsage: Record<string, number>;
}
