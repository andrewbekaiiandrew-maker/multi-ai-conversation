const BaseAgent = require('../BaseAgent');

class ChatAgent extends BaseAgent {
  constructor(name = 'ChatBot') {
    super(name, 'chat', 'http://localhost:3000');
    this.responses = [
      'Intéressant! Peux-tu m\'en dire plus?',
      'Je suis d\'accord! Comment on peut progresser?',
      'C\'est une bonne observation. Qu\'en penses-tu?',
      'Je n\'avais pas pensé à ça. Merci de l\'info!',
      'Excellente question! Voyons voir...'
    ];
  }

  getDescription() {
    return 'Un agent de chat conversationnel';
  }

  processMessage(msg) {
    console.log(`[${this.name}] Processing message from ${msg.agentName}`);
    
    setTimeout(() => {
      const response = this.responses[
        Math.floor(Math.random() * this.responses.length)
      ];
      this.sendMessage(response);
    }, 1000);
  }
}

module.exports = ChatAgent;
