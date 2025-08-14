export class DAACognition {
    decisions;
    actions;
    adaptations;
    options;
    history;
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
    async makeDecision(context, options = {}) {
        const decisionId = `decision_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const decision = {
            id: decisionId,
            context,
            confidence: this.calculateConfidence(context),
            timestamp: new Date(),
            options: options,
        };
        const filtered = this.applyFilters(decision);
        this.decisions.set(decisionId, filtered);
        this.history.push(filtered);
        if (this.history.length > (this.options.maxHistory ?? 1000)) {
            this.history = this.history.slice(-(this.options.maxHistory ?? 1000));
        }
        return filtered;
    }
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
        const result = await this.performAction(action);
        action.result = result;
        this.actions.set(action.id, action);
        return action;
    }
    async adapt(feedback) {
        const adaptationId = `adapt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const adaptation = {
            id: adaptationId,
            trigger: 'feedback_adaptation',
            change: this.calculateAdaptations(feedback),
            effectiveness: feedback.success ? 0.8 : 0.4,
        };
        this.applyAdaptations(adaptation.change);
        this.adaptations.set(adaptationId, adaptation);
        return adaptation;
    }
    getDecisionHistory(limit = 10) {
        return this.history
            .slice(-limit)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
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
    calculateConfidence(context) {
        const baseConfidence = 0.5;
        const contextFactor = Object.keys(context).length * 0.1;
        const historyFactor = this.history.length > 0 ? 0.1 : 0;
        return Math.min(1, baseConfidence + contextFactor + historyFactor);
    }
    applyFilters(decision) {
        const filtered = { ...decision };
        if (filtered.confidence < (this.options.decisionThreshold ?? 0.7)) {
            filtered.filtered = true;
            filtered.reason = 'Below confidence threshold';
        }
        return filtered;
    }
    async performAction(action) {
        await new Promise((resolve) => setTimeout(resolve, 10 + Math.random() * 40));
        return {
            success: Math.random() > 0.1,
            duration: 10 + Math.random() * 40,
            output: `Result for ${action.type}`,
        };
    }
    calculateAdaptations(feedback) {
        const changes = [];
        if (feedback.success !== undefined) {
            if (feedback.success) {
                changes.push({
                    type: 'adaptationRate',
                    delta: (this.options.adaptationRate ?? 0.05) * 0.1,
                });
            }
            else {
                changes.push({
                    type: 'adaptationRate',
                    delta: -(this.options.adaptationRate ?? 0.05) * 0.1,
                });
            }
        }
        if (feedback.confidence !== undefined) {
            changes.push({
                type: 'decisionThreshold',
                delta: (feedback.confidence - (this.options.decisionThreshold ?? 0.7)) *
                    0.05,
            });
        }
        return changes;
    }
    applyAdaptations(changes) {
        for (const change of changes) {
            switch (change.type) {
                case 'adaptationRate':
                    this.options.adaptationRate = Math.max(0.01, Math.min(0.5, (this.options.adaptationRate ?? 0.05) + change.delta));
                    break;
                case 'decisionThreshold':
                    this.options.decisionThreshold = Math.max(0.1, Math.min(0.9, (this.options.decisionThreshold ?? 0.7) + change.delta));
                    break;
            }
        }
    }
    calculateAverageConfidence() {
        if (this.history.length === 0)
            return 0;
        const total = this.history.reduce((sum, decision) => sum + decision.confidence, 0);
        return total / this.history.length;
    }
}
export default DAACognition;
//# sourceMappingURL=daa-cognition.js.map