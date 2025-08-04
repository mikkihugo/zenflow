/**
 * DAA Cognition (Decision, Action, Adaptation)
 * Cognitive decision-making system with adaptive learning
 */

export class DAACognition {
  constructor(options = {}) {
    this.decisions = new Map();
    this.actions = new Map();
    this.adaptations = new Map();
    this.options = {
      adaptationRate: 0.05,
      decisionThreshold: 0.7,
      maxHistory: 1000,
      ...options,
    };
    this.history = [];
  }

  /**
   * Make a cognitive decision based on input data
   */
  async makeDecision(context, options = {}) {
    const decisionId = `decision_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const decision = {
      id: decisionId,
      context,
      confidence: this.calculateConfidence(context),
      timestamp: new Date(),
      options: options,
    };

    // Apply cognitive filters
    const filtered = this.applyFilters(decision);

    // Store decision
    this.decisions.set(decisionId, filtered);
    this.history.push(filtered);

    // Cleanup old history
    if (this.history.length > this.options.maxHistory) {
      this.history = this.history.slice(-this.options.maxHistory);
    }

    return filtered;
  }

  /**
   * Execute an action based on decision
   */
  async executeAction(decisionId, actionType, parameters = {}) {
    const decision = this.decisions.get(decisionId);
    if (!decision) {
      throw new Error(`Decision ${decisionId} not found`);
    }

    const action = {
      id: `action_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      decisionId,
      type: actionType,
      parameters,
      executed: new Date(),
      result: null,
    };

    // Mock action execution
    const result = await this.performAction(action);
    action.result = result;

    this.actions.set(action.id, action);
    return action;
  }

  /**
   * Adapt based on feedback
   */
  async adapt(feedback) {
    const adaptationId = `adapt_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const adaptation = {
      id: adaptationId,
      feedback,
      timestamp: new Date(),
      changes: this.calculateAdaptations(feedback),
    };

    // Apply adaptations
    this.applyAdaptations(adaptation.changes);

    this.adaptations.set(adaptationId, adaptation);
    return adaptation;
  }

  /**
   * Get decision history
   */
  getDecisionHistory(limit = 10) {
    return this.history.slice(-limit).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get cognitive metrics
   */
  getMetrics() {
    return {
      totalDecisions: this.decisions.size,
      totalActions: this.actions.size,
      totalAdaptations: this.adaptations.size,
      avgConfidence: this.calculateAverageConfidence(),
      adaptationRate: this.options.adaptationRate,
      recentDecisions: this.history.slice(-10).length,
    };
  }

  private calculateConfidence(context) {
    // Mock confidence calculation
    const baseConfidence = 0.5;
    const contextFactor = Object.keys(context).length * 0.1;
    const historyFactor = this.history.length > 0 ? 0.1 : 0;

    return Math.min(1, baseConfidence + contextFactor + historyFactor);
  }

  private applyFilters(decision) {
    // Apply cognitive filters
    const filtered = { ...decision };

    // Threshold filter
    if (filtered.confidence < this.options.decisionThreshold) {
      filtered.filtered = true;
      filtered.reason = 'Below confidence threshold';
    }

    return filtered;
  }

  private async performAction(action) {
    // Mock action performance
    await new Promise((resolve) => setTimeout(resolve, 10 + Math.random() * 40));

    return {
      success: Math.random() > 0.1, // 90% success rate
      duration: 10 + Math.random() * 40,
      output: `Result for ${action.type}`,
    };
  }

  private calculateAdaptations(feedback) {
    const changes = [];

    // Adjust adaptation rate based on feedback
    if (feedback.success !== undefined) {
      if (feedback.success) {
        changes.push({
          type: 'adaptationRate',
          delta: this.options.adaptationRate * 0.1,
        });
      } else {
        changes.push({
          type: 'adaptationRate',
          delta: -this.options.adaptationRate * 0.1,
        });
      }
    }

    // Adjust decision threshold
    if (feedback.confidence !== undefined) {
      changes.push({
        type: 'decisionThreshold',
        delta: (feedback.confidence - this.options.decisionThreshold) * 0.05,
      });
    }

    return changes;
  }

  private applyAdaptations(changes) {
    for (const change of changes) {
      switch (change.type) {
        case 'adaptationRate':
          this.options.adaptationRate = Math.max(
            0.01,
            Math.min(0.5, this.options.adaptationRate + change.delta)
          );
          break;
        case 'decisionThreshold':
          this.options.decisionThreshold = Math.max(
            0.1,
            Math.min(0.9, this.options.decisionThreshold + change.delta)
          );
          break;
      }
    }
  }

  private calculateAverageConfidence() {
    if (this.history.length === 0) return 0;

    const total = this.history.reduce((sum, decision) => sum + decision.confidence, 0);
    return total / this.history.length;
  }
}

export default DAACognition;
