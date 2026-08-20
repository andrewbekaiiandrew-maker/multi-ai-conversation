const io = require('socket.io-client');
const { v4: uuidv4 } = require('uuid');

class BaseAgent {
  constructor(name, type, serverUrl = 'http://localhost:3000') {
    this.id = uuidv4();
    this.name = name;
    this.type = type;
    this.serverUrl = serverUrl;
    this.socket = null;
    this.currentConversation = null;
    this.memory = [];
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.socket = io(this.serverUrl);

      this.socket.on('connect', () => {
        console.log(`[${this.name}] Connected to server`);
        this.registerAgent();
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error(`[${this.name}] Connection error:`, error);
        reject(error);
      });

      this.setupListeners();
    });
  }

  registerAgent() {
    fetch(`${this.serverUrl}/api/agents/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: this.name,
        type: this.type,
        description: this.getDescription()
      })
    })
      .then(res => res.json())
      .then(agent => {
        this.id = agent.id;
        console.log(`[${this.name}] Registered with ID: ${this.id}`);
      })
      .catch(err => console.error(`[${this.name}] Registration error:`, err));
  }

  getDescription() {
    return `${this.type} agent`;
  }

  setupListeners() {
    this.socket.on('message:received', (msg) => {
      if (msg.agentId !== this.id) {
        this.onMessageReceived(msg);
      }
    });

    this.socket.on('agent:joined', (data) => {
      console.log(`[${this.name}] Agent joined: ${data.agentId}`);
    });

    this.socket.on('agent:left', (data) => {
      console.log(`[${this.name}] Agent left: ${data.agentId}`);
    });
  }

  joinConversation(conversationId) {
    this.currentConversation = conversationId;
    this.socket.emit('agent:join', {
      conversationId,
      agentId: this.id
    });
    console.log(`[${this.name}] Joined conversation: ${conversationId}`);
  }

  sendMessage(message) {
    if (!this.currentConversation) {
      console.error(`[${this.name}] No active conversation`);
      return;
    }

    this.socket.emit('message:send', {
      conversationId: this.currentConversation,
      agentId: this.id,
      message
    });

    this.memory.push({
      role: 'agent',
      name: this.name,
      message,
      timestamp: new Date()
    });
  }

  onMessageReceived(msg) {
    this.memory.push({
      role: 'other',
      name: msg.agentName,
      message: msg.content,
      timestamp: msg.timestamp
    });

    this.processMessage(msg);
  }

  processMessage(msg) {
    console.log(`[${this.name}] Received message from ${msg.agentName}: ${msg.content}`);
  }

  getMemory() {
    return this.memory;
  }

  clearMemory() {
    this.memory = [];
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log(`[${this.name}] Disconnected`);
    }
  }
}

module.exports = BaseAgent;
