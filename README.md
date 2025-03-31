# blogger-mcp-server
=======
# Serveur MCP pour Blogger

Un serveur MCP (Model Context Protocol) qui permet aux modèles d'intelligence artificielle comme Claude d'interagir directement avec l'API Blogger de Google.

## À propos

Ce projet implémente un serveur compatible avec le protocole MCP (Model Context Protocol) pour l'API Blogger de Google. Il permet aux modèles d'IA comme Claude d'interagir avec les blogs Blogger pour :

* Lister et récupérer des blogs
* Lister, rechercher, récupérer, créer, mettre à jour et supprimer des posts
* Lister et récupérer des labels

> **Note importante** : L'API Blogger de Google ne permet pas de créer de nouveaux blogs via API. Cette limitation est documentée par Google. Les blogs doivent être créés manuellement via l'interface web de Blogger.

## Prérequis

* Node.js (version 16 ou supérieure)
* Une clé API Blogger de Google

## Installation

### Installation depuis npm

```bash
npm install -g @mcproadev/blogger-mcp-server
```

### Installation depuis le code source

```bash
git clone https://github.com/niyonabil/blogger-mcp-server.git
cd blogger-mcp-server
npm install
npm run build
```
if error install : 
npm install --save-dev @types/express @types/socket.io

## Configuration

### Obtenir une clé API Blogger

1. Accédez à la [Console Google Cloud](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Blogger v3
4. Créez une clé API
5. Notez cette clé pour l'utiliser dans la configuration

### Configuration du serveur MCP

Créez un fichier de configuration pour votre client MCP. Voici un exemple pour Claude Desktop :

```json
{
  "mcpServers": {
    "blogger": {
      "command": "npx",
      "args": [
        "-y",
        "@mcproadev/blogger-mcp-server"
      ],
      "env": {
        "BLOGGER_API_KEY": "VOTRE_CLE_API_ICI"
      }
    }
  }
}
```

Remplacez `VOTRE_CLE_API_ICI` par la clé API que vous avez obtenue.

## Utilisation

### Démarrage local

Le projet inclut deux scripts pour faciliter le démarrage du serveur :

#### Mode développement

```bash
export BLOGGER_API_KEY=votre_cle_api
./start-dev.sh
```

Ce script vérifie la présence de la clé API, installe les dépendances si nécessaire, compile le projet si nécessaire, puis démarre le serveur en mode développement.

#### Mode production

```bash
export BLOGGER_API_KEY=votre_cle_api
npm run build
./start-prod.sh
```

Ce script vérifie la présence de la clé API et que le projet est compilé, puis démarre le serveur en mode production.

### Utilisation avec un client MCP

Une fois configuré, vous pouvez utiliser le serveur MCP pour Blogger avec n'importe quel client MCP compatible, comme Claude Desktop.

Exemples de commandes :

* "Liste tous mes blogs Blogger"
* "Crée un nouveau post sur mon blog avec l'ID 123456 avec le titre 'Mon nouveau post' et le contenu 'Voici le contenu de mon post'"
* "Recherche des posts contenant le mot 'technologie' dans mon blog"
* "Mets à jour le post avec l'ID 789012 pour changer son titre en 'Nouveau titre'"

## Options de déploiement

### Déploiement sur Vercel

Le projet inclut un fichier `vercel.json` pour faciliter le déploiement sur Vercel :

1. Créez un compte sur [Vercel](https://vercel.com/) si vous n'en avez pas déjà un
2. Installez l'outil CLI Vercel : `npm install -g vercel`
3. Connectez-vous à votre compte Vercel : `vercel login`
4. Configurez votre variable d'environnement secrète : `vercel secrets add blogger_api_key "VOTRE_CLE_API_ICI"`
5. Déployez le projet : `vercel`

### Déploiement avec Docker

Le projet inclut un Dockerfile pour faciliter le déploiement dans un conteneur Docker :

1. Construisez l'image Docker :
   ```bash
   docker build -t blogger-mcp-server .
   ```

2. Exécutez le conteneur :
   ```bash
   docker run -p 3000:3000 -e BLOGGER_API_KEY=votre_cle_api blogger-mcp-server
   ```

### Autres options de déploiement

Le serveur peut également être déployé sur d'autres plateformes compatibles avec Node.js :

1. **Heroku** : Utilisez un Procfile et les variables d'environnement Heroku
2. **AWS Lambda** : Utilisez un adaptateur comme Serverless Framework
3. **Google Cloud Run** : Utilisez le Dockerfile inclus

## Structure du projet

Le serveur MCP pour Blogger est composé de plusieurs modules :

* `index.ts` : Point d'entrée principal
* `server.ts` : Configuration du serveur MCP
* `bloggerService.ts` : Service d'interaction avec l'API Blogger
* `config.ts` : Configuration du serveur
* `types.ts` : Définition des types et interfaces
* `mcp-sdk-mock.ts` : Implémentation simplifiée du SDK MCP pour éviter les problèmes de dépendances

## Limitations connues

* **Création de blogs** : L'API Blogger de Google ne permet pas de créer de nouveaux blogs via API. Les blogs doivent être créés manuellement via l'interface web de Blogger.
* **Recherche de posts** : L'API Blogger ne fournit pas d'endpoint direct pour la recherche. Cette fonctionnalité est implémentée côté client en récupérant les posts puis en les filtrant.
* **Gestion des labels** : L'API Blogger ne fournit pas d'endpoints directs pour la gestion des labels. Cette fonctionnalité est implémentée en extrayant les labels des posts.
* **Authentification** : Ce serveur utilise uniquement l'authentification par clé API, ce qui limite l'accès aux blogs publics ou aux blogs pour lesquels vous avez explicitement configuré l'accès.

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## Licence

Ce projet est sous licence MIT.
>>>>>>> cf72ca4 (Ajout des nouvelles fonctionnalités)
