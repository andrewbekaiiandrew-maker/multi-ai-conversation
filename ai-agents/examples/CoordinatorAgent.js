const BaseAgent = require('../BaseAgent');

class CoordinatorAgent extends BaseAgent {
  constructor(name = 'Coordinator') {
    super(name, 'coordinator', 'http://localhost:3000');
    this.taskQueue = [];
  }

  getDescription() {
    return 'Un agent coordinateur qui gère les tâches et la collaboration';
  }

  processMessage(msg) {
    console.log(`[${this.name}] Coordinating message from ${msg.agentName}`);
    
    if (msg.content.includes('tâche') || msg.content.includes('faire')) {
      this.addTask(msg);
      setTimeout(() => {
        this.sendMessage('✅ Tâche enregistrée! Je la mets dans la queue.');
      }, 800);
    } else {
      setTimeout(() => {
        this.sendMessage('👍 Noté!');
      }, 600);
    }
  }

  addTask(msg) {
    const task = {
      id: `task-${Date.now()}`,
      from: msg.agentName,
      content: msg.content,
      status: 'pending',
      timestamp: new Date()
    };
    this.taskQueue.push(task);
    console.log(`[${this.name}] Tâche ajoutée:`, task);
  }

  getTasks() {
    return this.taskQueue;
  }

  completedTask(taskId) {
    const task = this.taskQueue.find(t => t.id === taskId);
    if (task) {
      task.status = 'completed';
      this.sendMessage(`✨ La tâche "${task.content}" a été complétée!`);
    }
  }
}

module.exports = CoordinatorAgent;
