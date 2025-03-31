import express from 'express';
import path from 'path';
import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { ServerStatus, ClientConnection, ServerStats } from './types';

// Interface pour le gestionnaire d'UI
export interface UIManager {
  start(port: number): Promise<void>;
  stop(): Promise<void>;
  updateStatus(status: ServerStatus): void;
  updateConnections(connections: ClientConnection[]): void;
  updateStats(stats: ServerStats): void;
}

// Implémentation du gestionnaire d'UI
export class WebUIManager implements UIManager {
  private app: express.Application;
  private server: HttpServer | null = null;
  private io: SocketIOServer | null = null;
  private status: ServerStatus = {
    running: false,
    mode: 'stopped',
    connections: 0,
    tools: []
  };
  private connections: ClientConnection[] = [];
  private stats: ServerStats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    toolUsage: {}
  };

  constructor() {
    this.app = express();
    
    // Configuration d'Express
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '../public')));
    
    // Routes API
    this.app.get('/api/status', (req, res) => {
      res.json(this.status);
    });
    
    this.app.get('/api/connections', (req, res) => {
      res.json(this.connections);
    });
    
    this.app.get('/api/stats', (req, res) => {
      res.json(this.stats);
    });
    
    // Route principale pour l'interface utilisateur - correction de la route wildcard
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });
  }

  async start(port: number): Promise<void> {
    return new Promise((resolve) => {
      this.server = new HttpServer(this.app);
      this.io = new SocketIOServer(this.server);
      
      // Configuration de Socket.IO
      this.io.on('connection', (socket) => {
        console.log('Nouvelle connexion UI:', socket.id);
        
        // Envoyer les données initiales
        socket.emit('status', this.status);
        socket.emit('connections', this.connections);
        socket.emit('stats', this.stats);
        
        // Gérer les actions de l'utilisateur
        socket.on('restart-server', () => {
          console.log('Demande de redémarrage du serveur reçue');
          // Logique de redémarrage à implémenter
        });
      });
      
      this.server.listen(port, () => {
        console.log(`Interface utilisateur démarrée sur le port ${port}`);
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((err) => {
          if (err) {
            reject(err);
          } else {
            this.server = null;
            this.io = null;
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  updateStatus(status: ServerStatus): void {
    this.status = status;
    if (this.io) {
      this.io.emit('status', status);
    }
  }

  updateConnections(connections: ClientConnection[]): void {
    this.connections = connections;
    if (this.io) {
      this.io.emit('connections', connections);
    }
  }

  updateStats(stats: ServerStats): void {
    this.stats = stats;
    if (this.io) {
      this.io.emit('stats', stats);
    }
  }
}
