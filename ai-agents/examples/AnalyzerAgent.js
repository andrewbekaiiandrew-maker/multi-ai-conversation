const BaseAgent = require('../BaseAgent');

class AnalyzerAgent extends BaseAgent {
  constructor(name = 'Analyzer') {
    super(name, 'analyzer', 'http://localhost:3000');
  }

  getDescription() {
    return 'Un agent spécialisé dans l\'analyse et la synthèse';
  }

  processMessage(msg) {
    console.log(`[${this.name}] Analyzing message from ${msg.agentName}`);
    
    const analysis = this.analyzeContent(msg.content);
    
    setTimeout(() => {
      this.sendMessage(`📊 Analyse: ${analysis}`);
    }, 1500);
  }

  analyzeContent(content) {
    const wordCount = content.split(' ').length;
    const hasQuestions = content.includes('?');
    const hasExclamation = content.includes('!');

    let analysis = `Longueur: ${wordCount} mots`;
    if (hasQuestions) analysis += ', contient des questions';
    if (hasExclamation) analysis += ', ton enthousiaste';

    return analysis;
  }
}

module.exports = AnalyzerAgent;
