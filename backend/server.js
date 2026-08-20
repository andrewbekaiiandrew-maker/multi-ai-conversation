const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Store pour les conversations et IAs
const conversations = new Map();
const aiAgents = new Map();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/conversations', (req, res) => {
  const allConversations = Array.from(conversations.values());
  res.json(allConversations);
});

app.get('/api/agents', (req, res) => {
  const allAgents = Array.from(aiAgents.values());
  res.json(allAgents);
});

app.post('/api/agents/register', (req, res) => {
  const { name, type, description } = req.body;
  
  if (!name || !type) {
    return res.status(400).json({ error: 'Name and type are required' });
  }

  const agent = {
    id: uuidv4(),
    name,
    type,
    description: description || '',
    createdAt: new Date(),
    status: 'active'
  };

  aiAgents.set(agent.id, agent);
  io.emit('agent:registered', agent);
  
  res.json(agent);
});

app.post('/api/conversations/create', (req, res) => {
  const { title, participants } = req.body;

  const conversation = {
    id: uuidv4(),
    title: title || 'New Conversation',
    participants: participants || [],
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  conversations.set(conversation.id, conversation);
  io.emit('conversation:created', conversation);

  res.json(conversation);
});

// WebSocket Events
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('agent:join', (data) => {
    const { conversationId, agentId } = data;
    const conversation = conversations.get(conversationId);

    if (conversation) {
      if (!conversation.participants.includes(agentId)) {
        conversation.participants.push(agentId);
      }
      socket.join(`conversation:${conversationId}`);
      io.to(`conversation:${conversationId}`).emit('agent:joined', {
        conversationId,
        agentId,
        agent: aiAgents.get(agentId)
      });
    }
  });

  socket.on('message:send', (data) => {
    const { conversationId, agentId, message } = data;
    const conversation = conversations.get(conversationId);

    if (conversation) {
      const msg = {
        id: uuidv4(),
        conversationId,
        agentId,
        agentName: aiAgents.get(agentId)?.name || 'Unknown',
        content: message,
        timestamp: new Date()
      };

      conversation.messages.push(msg);
      conversation.updatedAt = new Date();

      io.to(`conversation:${conversationId}`).emit('message:received', msg);
    }
  });

  socket.on('agent:leave', (data) => {
    const { conversationId, agentId } = data;
    const conversation = conversations.get(conversationId);

    if (conversation) {
      conversation.participants = conversation.participants.filter(id => id !== agentId);
      io.to(`conversation:${conversationId}`).emit('agent:left', {
        conversationId,
        agentId
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
