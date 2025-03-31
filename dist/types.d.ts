/**
 * Types utilisés dans le serveur MCP pour Blogger
 */
export interface BloggerBlog {
    id: string;
    name: string;
    description?: string;
    url: string;
    status?: string;
    posts?: BloggerPost[];
    labels?: BloggerLabel[];
}
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
export interface BloggerLabel {
    id?: string;
    name: string;
}
export interface SearchParams {
    query: string;
    maxResults?: number;
}
export interface PaginationParams {
    pageToken?: string;
    maxResults?: number;
}
export type ServerMode = {
    type: 'stdio';
} | {
    type: 'http';
    host: string;
    port: number;
};
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
