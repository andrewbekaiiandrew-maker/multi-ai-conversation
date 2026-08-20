const fetch = require('node-fetch');
const ChatAgent = require('../ai-agents/examples/ChatAgent');
const AnalyzerAgent = require('../ai-agents/examples/AnalyzerAgent');
const CoordinatorAgent = require('../ai-agents/examples/CoordinatorAgent');

const SERVER_URL = 'http://localhost:3000';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runDemo() {
  console.log('🚀 Démarrage de la démo Multi-AI Conversation\n');

  const chatAgent = new ChatAgent('Alice');
  const analyzerAgent = new AnalyzerAgent('Bob');
  const coordinatorAgent = new CoordinatorAgent('Charlie');

  try {
    console.log('📡 Connexion des agents...\n');
    await chatAgent.connect();
    await sleep(500);
    await analyzerAgent.connect();
    await sleep(500);
    await coordinatorAgent.connect();
    await sleep(1000);

    console.log('💬 Création d\'une conversation...\n');
    const conversationRes = await fetch(`${SERVER_URL}/api/conversations/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Discussion Collaborative',
        participants: []
      })
    });
    const conversation = await conversationRes.json();
    console.log(`Conversation créée: ${conversation.id}\n`);

    await sleep(500);
    chatAgent.joinConversation(conversation.id);
    await sleep(300);
    analyzerAgent.joinConversation(conversation.id);
    await sleep(300);
    coordinatorAgent.joinConversation(conversation.id);
    await sleep(1000);

    console.log('🎬 Début de la conversation...\n');

    await sleep(1000);
    chatAgent.sendMessage('Bonjour! Comment allez-vous aujourd\'hui?');
    
    await sleep(3000);
    
    chatAgent.sendMessage('J\'aimerais discuter d\'une nouvelle idée pour améliorer notre système!');
    
    await sleep(4000);
    
    chatAgent.sendMessage('Quelqu\'un peut-il créer une tâche pour tester cette idée?');
    
    await sleep(3000);
    
    console.log('\n📊 === STATISTIQUES ===');
    console.log(`\nMémoire d'Alice (${chatAgent.memory.length} messages):`);
    chatAgent.memory.forEach(m => {
      console.log(`  ${m.role === 'agent' ? '🤖' : '👤'} ${m.name}: ${m.message}`);
    });

    console.log(`\nMémoire de Bob (${analyzerAgent.memory.length} messages):`);
    analyzerAgent.memory.forEach(m => {
      console.log(`  ${m.role === 'agent' ? '🤖' : '👤'} ${m.name}: ${m.message}`);
    });

    console.log(`\nTâches de Charlie: ${coordinatorAgent.getTasks().length}`);
    coordinatorAgent.getTasks().forEach(t => {
      console.log(`  - ${t.content} (${t.status})`);
    });

    await sleep(2000);

    console.log('\n👋 Déconnexion des agents...\n');
    chatAgent.disconnect();
    analyzerAgent.disconnect();
    coordinatorAgent.disconnect();

    console.log('✅ Démo terminée!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

runDemo();
