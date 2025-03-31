import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ServerConfig, BloggerBlog, BloggerPost, BloggerLabel } from './types';
import { BloggerService } from './bloggerService';
import { z } from 'zod';

/**
 * Initialise le serveur MCP avec tous les outils pour Blogger
 * @param bloggerService Service Blogger pour interagir avec l'API
 * @param config Configuration du serveur
 * @returns Instance du serveur MCP
 */
export function initMCPServer(bloggerService: BloggerService, config: ServerConfig): McpServer {
  // Créer une nouvelle instance du serveur MCP avec les informations du serveur
  const server = new McpServer({
    name: "Blogger MCP Server",
    version: "1.0.1",
    vendor: "mcproadev"
  });

  // Outil pour lister les blogs
  server.tool('list_blogs', 'Liste tous les blogs accessibles', {}, 
    async (_args, _extra) => {
      try {
        const blogs = await bloggerService.listBlogs();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ blogs }, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error('Erreur lors de la récupération des blogs:', error);
        return {
          content: [
            {
              type: 'text',
              text: `Erreur lors de la récupération des blogs: ${error}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Outil pour obtenir les détails d'un blog
  server.tool('get_blog', 'Récupère les détails d\'un blog spécifique', 
    {
      blogId: z.string().describe('ID du blog')
    },
    async (args, _extra) => {
      try {
        const blog = await bloggerService.getBlog(args.blogId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ blog }, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error(`Erreur lors de la récupération du blog ${args.blogId}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Erreur lors de la récupération du blog: ${error}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Outil pour créer un nouveau blog (non supporté par l'API Blogger)
  server.tool('create_blog', 'Crée un nouveau blog (non supporté par l\'API Blogger)',
    {
      name: z.string().describe('Nom du blog'),
      description: z.string().optional().describe('Description du blog')
    },
    async (_args, _extra) => {
      return {
        content: [
          {
            type: 'text',
            text: 'La création de blogs n\'est pas supportée par l\'API Blogger. Veuillez créer un blog via l\'interface web de Blogger.'
          }
        ],
        isError: true
      };
    }
  );

  // Outil pour lister les posts d'un blog
  server.tool('list_posts', 'Liste tous les posts d\'un blog',
    {
      blogId: z.string().describe('ID du blog'),
      maxResults: z.number().optional().describe('Nombre maximum de résultats à retourner')
    },
    async (args, _extra) => {
      try {
        const posts = await bloggerService.listPosts(args.blogId, args.maxResults);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ posts }, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error(`Erreur lors de la récupération des posts du blog ${args.blogId}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Erreur lors de la récupération des posts: ${error}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Outil pour rechercher des posts
  server.tool('search_posts', 'Recherche des posts dans un blog',
    {
      blogId: z.string().describe('ID du blog'),
      query: z.string().describe('Terme de recherche'),
      maxResults: z.number().optional().describe('Nombre maximum de résultats à retourner')
    },
    async (args, _extra) => {
      try {
        const posts = await bloggerService.searchPosts(args.blogId, args.query, args.maxResults);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ posts }, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error(`Erreur lors de la recherche de posts dans le blog ${args.blogId}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Erreur lors de la recherche de posts: ${error}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Outil pour obtenir les détails d'un post
  server.tool('get_post', 'Récupère les détails d\'un post spécifique',
    {
      blogId: z.string().describe('ID du blog'),
      postId: z.string().describe('ID du post')
    },
    async (args, _extra) => {
      try {
        const post = await bloggerService.getPost(args.blogId, args.postId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ post }, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error(`Erreur lors de la récupération du post ${args.postId}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Erreur lors de la récupération du post: ${error}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Outil pour créer un nouveau post
  server.tool('create_post', 'Crée un nouveau post dans un blog',
    {
      blogId: z.string().describe('ID du blog'),
      title: z.string().describe('Titre du post'),
      content: z.string().describe('Contenu du post'),
      labels: z.array(z.string()).optional().describe('Labels à associer au post')
    },
    async (args, _extra) => {
      try {
        const post = await bloggerService.createPost(args.blogId, { 
          title: args.title, 
          content: args.content, 
          labels: args.labels 
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ post }, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error(`Erreur lors de la création d'un post dans le blog ${args.blogId}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Erreur lors de la création du post: ${error}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Outil pour mettre à jour un post existant
  server.tool('update_post', 'Met à jour un post existant',
    {
      blogId: z.string().describe('ID du blog'),
      postId: z.string().describe('ID du post'),
      title: z.string().optional().describe('Nouveau titre du post'),
      content: z.string().optional().describe('Nouveau contenu du post'),
      labels: z.array(z.string()).optional().describe('Nouveaux labels à associer au post')
    },
    async (args, _extra) => {
      try {
        const post = await bloggerService.updatePost(args.blogId, args.postId, { 
          title: args.title, 
          content: args.content, 
          labels: args.labels 
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ post }, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error(`Erreur lors de la mise à jour du post ${args.postId}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Erreur lors de la mise à jour du post: ${error}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Outil pour supprimer un post
  server.tool('delete_post', 'Supprime un post',
    {
      blogId: z.string().describe('ID du blog'),
      postId: z.string().describe('ID du post')
    },
    async (args, _extra) => {
      try {
        await bloggerService.deletePost(args.blogId, args.postId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true }, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error(`Erreur lors de la suppression du post ${args.postId}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Erreur lors de la suppression du post: ${error}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Outil pour lister les labels d'un blog
  server.tool('list_labels', 'Liste tous les labels d\'un blog',
    {
      blogId: z.string().describe('ID du blog')
    },
    async (args, _extra) => {
      try {
        const labels = await bloggerService.listLabels(args.blogId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ labels }, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error(`Erreur lors de la récupération des labels du blog ${args.blogId}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Erreur lors de la récupération des labels: ${error}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Outil pour obtenir les détails d'un label
  server.tool('get_label', 'Récupère les détails d\'un label spécifique',
    {
      blogId: z.string().describe('ID du blog'),
      labelName: z.string().describe('Nom du label')
    },
    async (args, _extra) => {
      try {
        const label = await bloggerService.getLabel(args.blogId, args.labelName);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ label }, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error(`Erreur lors de la récupération du label ${args.labelName}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Erreur lors de la récupération du label: ${error}`
            }
          ],
          isError: true
        };
      }
    }
  );

  return server;
}
