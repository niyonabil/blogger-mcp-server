import { blogger_v3 } from 'googleapis';
import { BloggerBlog, BloggerPost, BloggerLabel } from './types';
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
export declare class BloggerService {
    private blogger;
    /**
     * Initialise le service Blogger avec l'API key
     */
    constructor();
    /**
     * Liste tous les blogs accessibles
     * @returns Liste des blogs
     */
    listBlogs(): Promise<blogger_v3.Schema$BlogList>;
    /**
     * Récupère les détails d'un blog spécifique
     * @param blogId ID du blog à récupérer
     * @returns Détails du blog
     */
    getBlog(blogId: string): Promise<blogger_v3.Schema$Blog>;
    /**
     * Simule la création d'un nouveau blog
     * Note: L'API Blogger ne permet pas réellement de créer un blog via API
     * Cette méthode simule la fonctionnalité et retourne un message d'erreur explicatif
     *
     * @param blogData Données du blog à créer
     * @returns Message d'erreur explicatif
     */
    createBlog(blogData: Partial<BloggerBlog>): Promise<any>;
    /**
     * Liste les posts d'un blog
     * @param blogId ID du blog
     * @param maxResults Nombre maximum de résultats à retourner
     * @returns Liste des posts
     */
    listPosts(blogId: string, maxResults?: number): Promise<blogger_v3.Schema$PostList>;
    /**
     * Recherche des posts dans un blog
     * @param blogId ID du blog
     * @param query Terme de recherche
     * @param maxResults Nombre maximum de résultats à retourner
     * @returns Liste des posts correspondants
     */
    searchPosts(blogId: string, query: string, maxResults?: number): Promise<blogger_v3.Schema$PostList>;
    /**
     * Récupère un post spécifique
     * @param blogId ID du blog
     * @param postId ID du post
     * @returns Détails du post
     */
    getPost(blogId: string, postId: string): Promise<blogger_v3.Schema$Post>;
    /**
     * Crée un nouveau post dans un blog
     * @param blogId ID du blog
     * @param postData Données du post à créer
     * @returns Post créé
     */
    createPost(blogId: string, postData: Partial<BloggerPost>): Promise<blogger_v3.Schema$Post>;
    /**
     * Met à jour un post existant
     * @param blogId ID du blog
     * @param postId ID du post
     * @param postData Données du post à mettre à jour
     * @returns Post mis à jour
     */
    updatePost(blogId: string, postId: string, postData: Partial<BloggerPost>): Promise<blogger_v3.Schema$Post>;
    /**
     * Supprime un post
     * @param blogId ID du blog
     * @param postId ID du post
     * @returns Statut de la suppression
     */
    deletePost(blogId: string, postId: string): Promise<void>;
    /**
     * Liste les labels d'un blog
     * @param blogId ID du blog
     * @returns Liste des labels
     */
    listLabels(blogId: string): Promise<BloggerLabelList>;
    /**
     * Récupère un label spécifique
     * @param blogId ID du blog
     * @param labelName Nom du label
     * @returns Détails du label
     */
    getLabel(blogId: string, labelName: string): Promise<BloggerLabel>;
}
export {};
