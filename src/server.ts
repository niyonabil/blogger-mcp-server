import { MCPServer } from './mcp-sdk-mock';
import { z } from 'zod';
import { BloggerService } from './bloggerService';
import { ServerConfig } from './types';

/**
 * Initialise le serveur MCP pour Blogger avec tous les outils nécessaires
 * @param bloggerService - Service d'interaction avec l'API Blogger
 * @param config - Configuration du serveur
 * @returns Instance du serveur MCP configurée
 */
export function initMCPServer(bloggerService: BloggerService, config: ServerConfig): MCPServer {
  // Créer une nouvelle instance du serveur MCP
  const server = new MCPServer({
    name: "Blogger MCP Server",
    version: "1.0.1",
    // Configurer le mode de fonctionnement (stdio ou http)
    mode: config.mode
  });

  // Outil pour lister les blogs
  server.addTool({
    name: 'list_blogs',
    description: 'Liste tous les blogs accessibles',
    parameters: z.object({}),
    handler: async () => {
      try {
        const blogs = await bloggerService.listBlogs();
        return { blogs: blogs.items || [] };
      } catch (error) {
        return { error: `Erreur lors de la récupération des blogs: ${error}` };
      }
    }
  });

  // Outil pour obtenir un blog spécifique
  server.addTool({
    name: 'get_blog',
    description: 'Récupère les détails d\'un blog spécifique',
    parameters: z.object({
      blogId: z.string().describe('ID du blog à récupérer')
    }),
    handler: async ({ blogId }) => {
      try {
        const blog = await bloggerService.getBlog(blogId);
        return { blog };
      } catch (error) {
        return { error: `Erreur lors de la récupération du blog ${blogId}: ${error}` };
      }
    }
  });

  // Outil pour créer un nouveau blog (avec message d'erreur explicatif)
  server.addTool({
    name: 'create_blog',
    description: 'Crée un nouveau blog (note: l\'API Blogger ne supporte pas cette fonctionnalité)',
    parameters: z.object({
      name: z.string().describe('Nom du blog'),
      description: z.string().optional().describe('Description du blog')
    }),
    handler: async ({ name, description }) => {
      try {
        const result = await bloggerService.createBlog({ name, description: description || '' });
        return result; // Retourne le message d'erreur explicatif
      } catch (error) {
        return { error: `Erreur lors de la création du blog: ${error}` };
      }
    }
  });

  // Outil pour lister les posts d'un blog
  server.addTool({
    name: 'list_posts',
    description: 'Liste les posts d\'un blog',
    parameters: z.object({
      blogId: z.string().describe('ID du blog'),
      maxResults: z.number().optional().describe('Nombre maximum de résultats à retourner')
    }),
    handler: async ({ blogId, maxResults }) => {
      try {
        const posts = await bloggerService.listPosts(blogId, maxResults);
        return { posts: posts.items || [] };
      } catch (error) {
        return { error: `Erreur lors de la récupération des posts du blog ${blogId}: ${error}` };
      }
    }
  });

  // Outil pour rechercher des posts
  server.addTool({
    name: 'search_posts',
    description: 'Recherche des posts dans un blog',
    parameters: z.object({
      blogId: z.string().describe('ID du blog'),
      query: z.string().describe('Terme de recherche'),
      maxResults: z.number().optional().describe('Nombre maximum de résultats à retourner')
    }),
    handler: async ({ blogId, query, maxResults }) => {
      try {
        const posts = await bloggerService.searchPosts(blogId, query, maxResults);
        return { posts: posts.items || [] };
      } catch (error) {
        return { error: `Erreur lors de la recherche de posts dans le blog ${blogId}: ${error}` };
      }
    }
  });

  // Outil pour obtenir un post spécifique
  server.addTool({
    name: 'get_post',
    description: 'Récupère un post spécifique',
    parameters: z.object({
      blogId: z.string().describe('ID du blog'),
      postId: z.string().describe('ID du post')
    }),
    handler: async ({ blogId, postId }) => {
      try {
        const post = await bloggerService.getPost(blogId, postId);
        return { post };
      } catch (error) {
        return { error: `Erreur lors de la récupération du post ${postId}: ${error}` };
      }
    }
  });

  // Outil pour créer un nouveau post
  server.addTool({
    name: 'create_post',
    description: 'Crée un nouveau post dans un blog',
    parameters: z.object({
      blogId: z.string().describe('ID du blog'),
      title: z.string().describe('Titre du post'),
      content: z.string().describe('Contenu du post'),
      labels: z.array(z.string()).optional().describe('Labels à associer au post')
    }),
    handler: async ({ blogId, title, content, labels }) => {
      try {
        const postData = { title, content, labels: labels || [] };
        const post = await bloggerService.createPost(blogId, postData);
        return { post };
      } catch (error) {
        return { error: `Erreur lors de la création du post dans le blog ${blogId}: ${error}` };
      }
    }
  });

  // Outil pour mettre à jour un post
  server.addTool({
    name: 'update_post',
    description: 'Met à jour un post existant',
    parameters: z.object({
      blogId: z.string().describe('ID du blog'),
      postId: z.string().describe('ID du post'),
      title: z.string().optional().describe('Nouveau titre du post'),
      content: z.string().optional().describe('Nouveau contenu du post'),
      labels: z.array(z.string()).optional().describe('Nouveaux labels à associer au post')
    }),
    handler: async ({ blogId, postId, title, content, labels }) => {
      try {
        // Préparer les données de mise à jour
        const postData = {
          title,
          content,
          labels
        };
        
        const post = await bloggerService.updatePost(blogId, postId, postData);
        return { post };
      } catch (error) {
        return { error: `Erreur lors de la mise à jour du post ${postId}: ${error}` };
      }
    }
  });

  // Outil pour supprimer un post
  server.addTool({
    name: 'delete_post',
    description: 'Supprime un post',
    parameters: z.object({
      blogId: z.string().describe('ID du blog'),
      postId: z.string().describe('ID du post')
    }),
    handler: async ({ blogId, postId }) => {
      try {
        await bloggerService.deletePost(blogId, postId);
        return { success: true, message: `Post ${postId} supprimé avec succès` };
      } catch (error) {
        return { error: `Erreur lors de la suppression du post ${postId}: ${error}` };
      }
    }
  });

  // Outil pour lister les labels d'un blog
  server.addTool({
    name: 'list_labels',
    description: 'Liste les labels d\'un blog',
    parameters: z.object({
      blogId: z.string().describe('ID du blog')
    }),
    handler: async ({ blogId }) => {
      try {
        const labels = await bloggerService.listLabels(blogId);
        return { labels: labels.items || [] };
      } catch (error) {
        return { error: `Erreur lors de la récupération des labels du blog ${blogId}: ${error}` };
      }
    }
  });

  // Outil pour obtenir un label spécifique
  server.addTool({
    name: 'get_label',
    description: 'Récupère un label spécifique',
    parameters: z.object({
      blogId: z.string().describe('ID du blog'),
      labelName: z.string().describe('Nom du label')
    }),
    handler: async ({ blogId, labelName }) => {
      try {
        const label = await bloggerService.getLabel(blogId, labelName);
        return { label };
      } catch (error) {
        return { error: `Erreur lors de la récupération du label ${labelName}: ${error}` };
      }
    }
  });

  return server;
}
