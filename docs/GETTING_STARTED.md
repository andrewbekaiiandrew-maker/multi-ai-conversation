# Guide de Démarrage

## Installation

### Prérequis
- Node.js 14+ 
- npm ou yarn

### Étapes

1. **Cloner le repository**
```bash
git clone https://github.com/andrewbekaiiandrew-maker/multi-ai-conversation.git
cd multi-ai-conversation
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration**
```bash
cp .env.example .env
# Éditer .env selon vos besoins
```

4. **Lancer le serveur**
```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

## Utilisation Basique

### 1. Via l'interface web
- Ouvrez `http://localhost:3000` dans votre navigateur
- Créez une nouvelle conversation
- Les agents IAs vont s'y connecter automatiquement

### 2. Via les agents Node.js
```bash
node examples/demo.js
```

Cela lancera une démonstration avec 3 agents (Chat, Analyzer, Coordinator) qui communiquent entre eux.

## Créer votre propre Agent

```javascript
const BaseAgent = require('../ai-agents/BaseAgent');

class MonAgent extends BaseAgent {
  constructor(name = 'MonAgent') {
    super(name, 'custom', 'http://localhost:3000');
  }

  getDescription() {
    return 'Mon agent personnalisé';
  }

  processMessage(msg) {
    console.log(`${this.name} reçoit: ${msg.content}`);
    
    setTimeout(() => {
      this.sendMessage('Ma réponse!');
    }, 1000);
  }
}

module.exports = MonAgent;
```

## Exemples d'Agents

### ChatAgent
Un agent conversationnel simple qui répond aux messages avec des réponses pré-définies.

### AnalyzerAgent
Analyse les messages reçus et fournit des statistiques (nombre de mots, présence de questions, etc.)

### CoordinatorAgent
Gère les tâches et coordonne le travail entre les autres agents.

## Architecture

```
┌─────────────────────────────────────────┐
│     Interface Web (HTML/CSS/JS)         │
└──────────────┬──────────────────────────┘
               │
         Socket.io (WebSocket)
               │
┌──────────────┴──────────────────────────┐
│    Server Express + Socket.io            │
│  - Gère les conversations                │
│  - Enregistre les agents                 │
│  - Routage des messages                  │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
 ChatAgent  AnalyzerAgent CoordinatorAgent
    │          │          │
    └──────────┴──────────┘
         (BaseAgent)
```

## API REST

### Agents
- `GET /api/agents` - Liste les agents connectés
- `POST /api/agents/register` - Enregistrer un nouvel agent

### Conversations
- `GET /api/conversations` - Liste les conversations
- `POST /api/conversations/create` - Créer une conversation

## WebSocket Events

### Client → Server
- `agent:join` - Un agent rejoint une conversation
- `message:send` - Envoyer un message
- `agent:leave` - Un agent quitte

### Server → Client
- `agent:registered` - Un agent s'est enregistré
- `conversation:created` - Une nouvelle conversation est créée
- `message:received` - Un nouveau message
- `agent:joined` - Un agent a rejoint
- `agent:left` - Un agent a quitté

## Troubleshooting

### "Connection refused"
- Vérifiez que le serveur est lancé: `npm run dev`
- Vérifiez le port (par défaut 3000)

### Les agents ne reçoivent pas les messages
- Vérifiez que Socket.io est accessible
- Vérifiez la console du navigateur pour les erreurs

### Les agents ne s'affichent pas
- Attendez quelques secondes, ils se chargent asynchronement
- Vérifiez la console serveur pour les logs
