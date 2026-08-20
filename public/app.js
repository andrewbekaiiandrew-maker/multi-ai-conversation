const socket = io();

let currentConversationId = null;
const agentsList = new Map();
const conversationsList = new Map();

const agentsListEl = document.getElementById('agents-list');
const conversationsListEl = document.getElementById('conversations-list');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const createConversationBtn = document.getElementById('create-conversation-btn');
const conversationArea = document.getElementById('conversation-area');
const noConversation = document.getElementById('no-conversation');

document.addEventListener('DOMContentLoaded', () => {
  loadAgents();
  loadConversations();
  
  createConversationBtn.addEventListener('click', createConversation);
  sendBtn.addEventListener('click', sendMessage);
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
});

socket.on('agent:registered', (agent) => {
  addAgentToList(agent);
});

socket.on('conversation:created', (conversation) => {
  addConversationToList(conversation);
});

socket.on('agent:joined', (data) => {
  console.log(`Agent joined: ${data.agent.name}`);
});

socket.on('message:received', (msg) => {
  if (msg.conversationId === currentConversationId) {
    displayMessage(msg);
  }
});

async function loadAgents() {
  try {
    const res = await fetch('/api/agents');
    const agents = await res.json();
    agents.forEach(addAgentToList);
  } catch (err) {
    console.error('Error loading agents:', err);
  }
}

async function loadConversations() {
  try {
    const res = await fetch('/api/conversations');
    const conversations = await res.json();
    conversations.forEach(addConversationToList);
  } catch (err) {
    console.error('Error loading conversations:', err);
  }
}

function addAgentToList(agent) {
  if (!agentsList.has(agent.id)) {
    const agentEl = document.createElement('div');
    agentEl.className = 'agent-item';
    agentEl.textContent = `🤖 ${agent.name}`;
    agentEl.title = agent.type;
    agentsListEl.appendChild(agentEl);
    agentsList.set(agent.id, agent);
  }
}

function addConversationToList(conversation) {
  if (!conversationsList.has(conversation.id)) {
    const convEl = document.createElement('div');
    convEl.className = 'conversation-item';
    convEl.textContent = conversation.title;
    convEl.addEventListener('click', () => openConversation(conversation));
    conversationsListEl.appendChild(convEl);
    conversationsList.set(conversation.id, conversation);
  }
}

async function createConversation() {
  const title = prompt('Nom de la conversation:', 'Nouvelle Discussion');
  if (!title) return;

  try {
    const res = await fetch('/api/conversations/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
    const conversation = await res.json();
    addConversationToList(conversation);
    openConversation(conversation);
  } catch (err) {
    console.error('Error creating conversation:', err);
  }
}

function openConversation(conversation) {
  currentConversationId = conversation.id;
  
  noConversation.style.display = 'none';
  conversationArea.style.display = 'flex';
  messageInput.disabled = false;
  sendBtn.disabled = false;

  messagesContainer.innerHTML = '';

  const convo = conversationsList.get(conversation.id);
  if (convo && convo.messages) {
    convo.messages.forEach(displayMessage);
  }

  document.querySelectorAll('.conversation-item').forEach(el => {
    el.classList.remove('active');
  });
  event.target.classList.add('active');
}

function sendMessage() {
  if (!messageInput.value.trim() || !currentConversationId) return;

  const message = messageInput.value.trim();
  messageInput.value = '';

  socket.emit('message:send', {
    conversationId: currentConversationId,
    agentId: 'user',
    message
  });
}

function displayMessage(msg) {
  const messageEl = document.createElement('div');
  messageEl.className = `message ${msg.agentId === 'user' ? 'own' : 'other'}`;

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = msg.agentName?.charAt(0) || '?';

  const content = document.createElement('div');
  content.className = 'message-content';

  const header = document.createElement('div');
  header.className = 'message-header';
  header.textContent = msg.agentName || 'Unknown';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.textContent = msg.content;

  const time = document.createElement('div');
  time.className = 'message-time';
  const timestamp = new Date(msg.timestamp);
  time.textContent = timestamp.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  content.appendChild(header);
  content.appendChild(bubble);
  content.appendChild(time);

  messageEl.appendChild(avatar);
  messageEl.appendChild(content);

  messagesContainer.appendChild(messageEl);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

setInterval(loadAgents, 5000);
