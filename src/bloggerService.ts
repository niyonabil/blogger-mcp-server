import { google, blogger_v3 } from 'googleapis';
import { BloggerBlog, BloggerPost, BloggerLabel } from './types';
import { config } from './config';

/**
 * Types personnalisés pour compenser les limitations de l'API Blogger
 */
interface BloggerLabelList {
  kind?: string;
  items?: BloggerLabel[];
}

/**
 * Service d'interaction avec l'API Blogger de Google
 */
export class BloggerService {
  private blogger: blogger_v3.Blogger;

  /**
   * Initialise le service Blogger avec l'API key
   */
  constructor() {
    this.blogger = google.blogger({
      version: 'v3',
      auth: config.blogger.apiKey,
      timeout: config.blogger.timeout
    });
  }

  /**
   * Liste tous les blogs accessibles
   * @returns Liste des blogs
   */
  async listBlogs(): Promise<blogger_v3.Schema$BlogList> {
    try {
      const response = await this.blogger.blogs.listByUser({
        userId: 'self'
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des blogs:', error);
      throw error;
    }
  }

  /**
   * Récupère les détails d'un blog spécifique
   * @param blogId ID du blog à récupérer
   * @returns Détails du blog
   */
  async getBlog(blogId: string): Promise<blogger_v3.Schema$Blog> {
    try {
      const response = await this.blogger.blogs.get({
        blogId
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du blog ${blogId}:`, error);
      throw error;
    }
  }

  /**
   * Simule la création d'un nouveau blog
   * Note: L'API Blogger ne permet pas réellement de créer un blog via API
   * Cette méthode simule la fonctionnalité et retourne un message d'erreur explicatif
   * 
   * @param blogData Données du blog à créer
   * @returns Message d'erreur explicatif
   */
  async createBlog(blogData: Partial<BloggerBlog>): Promise<any> {
    // Simuler un délai pour rendre la réponse plus réaliste
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Retourner un message d'erreur explicatif
    return {
      error: true,
      message: "L'API Blogger de Google ne permet pas de créer un nouveau blog via API. Veuillez créer un blog manuellement sur blogger.com.",
      details: "Cette limitation est documentée par Google. Les blogs doivent être créés via l'interface web de Blogger.",
      suggestedAction: "Créez un blog sur https://www.blogger.com, puis utilisez son ID avec ce serveur MCP."
    };
  }

  /**
   * Liste les posts d'un blog
   * @param blogId ID du blog
   * @param maxResults Nombre maximum de résultats à retourner
   * @returns Liste des posts
   */
  async listPosts(blogId: string, maxResults?: number): Promise<blogger_v3.Schema$PostList> {
    try {
      const response = await this.blogger.posts.list({
        blogId,
        maxResults: maxResults || config.blogger.maxResults
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des posts du blog ${blogId}:`, error);
      throw error;
    }
  }

  /**
   * Recherche des posts dans un blog
   * @param blogId ID du blog
   * @param query Terme de recherche
   * @param maxResults Nombre maximum de résultats à retourner
   * @returns Liste des posts correspondants
   */
  async searchPosts(blogId: string, query: string, maxResults?: number): Promise<blogger_v3.Schema$PostList> {
    try {
      // Récupérer tous les posts puis filtrer côté client
      // car l'API Blogger ne fournit pas d'endpoint de recherche directe
      const response = await this.blogger.posts.list({
        blogId,
        maxResults: maxResults || config.blogger.maxResults
      });
      
      // Filtrer les posts qui contiennent le terme de recherche
      const allPosts = response.data.items || [];
      const filteredPosts = allPosts.filter(post => {
        const title = post.title?.toLowerCase() || '';
        const content = post.content?.toLowerCase() || '';
        const searchTerm = query.toLowerCase();
        return title.includes(searchTerm) || content.includes(searchTerm);
      });
      
      return {
        kind: response.data.kind,
        items: filteredPosts
      };
    } catch (error) {
      console.error(`Erreur lors de la recherche de posts dans le blog ${blogId}:`, error);
      throw error;
    }
  }

  /**
   * Récupère un post spécifique
   * @param blogId ID du blog
   * @param postId ID du post
   * @returns Détails du post
   */
  async getPost(blogId: string, postId: string): Promise<blogger_v3.Schema$Post> {
    try {
      const response = await this.blogger.posts.get({
        blogId,
        postId
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du post ${postId}:`, error);
      throw error;
    }
  }

  /**
   * Crée un nouveau post dans un blog
   * @param blogId ID du blog
   * @param postData Données du post à créer
   * @returns Post créé
   */
  async createPost(blogId: string, postData: Partial<BloggerPost>): Promise<blogger_v3.Schema$Post> {
    try {
      const response = await this.blogger.posts.insert({
        blogId,
        requestBody: postData as blogger_v3.Schema$Post
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la création du post dans le blog ${blogId}:`, error);
      throw error;
    }
  }

  /**
   * Met à jour un post existant
   * @param blogId ID du blog
   * @param postId ID du post
   * @param postData Données du post à mettre à jour
   * @returns Post mis à jour
   */
  async updatePost(blogId: string, postId: string, postData: Partial<BloggerPost>): Promise<blogger_v3.Schema$Post> {
    try {
      // Convertir les types pour éviter les erreurs de compilation
      const requestBody: blogger_v3.Schema$Post = {
        title: postData.title,
        content: postData.content,
        labels: postData.labels
      };
      
      const response = await this.blogger.posts.update({
        blogId,
        postId,
        requestBody
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du post ${postId}:`, error);
      throw error;
    }
  }

  /**
   * Supprime un post
   * @param blogId ID du blog
   * @param postId ID du post
   * @returns Statut de la suppression
   */
  async deletePost(blogId: string, postId: string): Promise<void> {
    try {
      await this.blogger.posts.delete({
        blogId,
        postId
      });
    } catch (error) {
      console.error(`Erreur lors de la suppression du post ${postId}:`, error);
      throw error;
    }
  }

  /**
   * Liste les labels d'un blog
   * @param blogId ID du blog
   * @returns Liste des labels
   */
  async listLabels(blogId: string): Promise<BloggerLabelList> {
    try {
      // L'API Blogger ne fournit pas d'endpoint direct pour lister les labels
      // Nous allons récupérer tous les posts et extraire les labels uniques
      const response = await this.blogger.posts.list({
        blogId,
        maxResults: 50 // Récupérer un nombre suffisant de posts pour extraire les labels
      });
      
      const posts = response.data.items || [];
      const labelSet = new Set<string>();
      
      // Extraire tous les labels uniques des posts
      posts.forEach(post => {
        const postLabels = post.labels || [];
        postLabels.forEach(label => labelSet.add(label));
      });
      
      // Convertir en format attendu
      const labels = Array.from(labelSet).map(name => ({ name }));
      
      return {
        kind: 'blogger#labelList',
        items: labels
      };
    } catch (error) {
      console.error(`Erreur lors de la récupération des labels du blog ${blogId}:`, error);
      throw error;
    }
  }

  /**
   * Récupère un label spécifique
   * @param blogId ID du blog
   * @param labelName Nom du label
   * @returns Détails du label
   */
  async getLabel(blogId: string, labelName: string): Promise<BloggerLabel> {
    try {
      // L'API Blogger ne fournit pas d'endpoint direct pour récupérer un label
      // Nous allons vérifier si le label existe en listant les labels
      const labels = await this.listLabels(blogId);
      const label = labels.items?.find(l => l.name === labelName);
      
      if (!label) {
        throw new Error(`Label ${labelName} non trouvé`);
      }
      
      return label;
    } catch (error) {
      console.error(`Erreur lors de la récupération du label ${labelName}:`, error);
      throw error;
    }
  }
}
