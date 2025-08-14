export class CognitivePatternEvolution {
    patterns;
    evolutionHistory;
    options;
    constructor(options = {}) {
        this.patterns = new Map();
        this.evolutionHistory = [];
        this.options = {
            mutationRate: 0.1,
            selectionPressure: 0.3,
            maxGenerations: 100,
            ...options,
        };
    }
    async evolvePatterns(agentId, performanceData) {
        const generation = this.evolutionHistory.length;
        const agentPatterns = Array.from(this.patterns.values()).filter((p) => p.agentId === agentId);
        const selected = this.selectPatterns(performanceData || agentPatterns);
        const evolved = this.applyEvolution(selected);
        this.updatePatterns(evolved);
        this.evolutionHistory.push({
            generation,
            patterns: evolved.length,
            avgFitness: this.calculateAverageFitness(evolved),
            timestamp: new Date(),
        });
        return evolved;
    }
    registerPattern(id, pattern) {
        this.patterns.set(id, {
            ...pattern,
            fitness: 0,
            generation: this.evolutionHistory.length,
            created: new Date(),
        });
    }
    getPattern(id) {
        return this.patterns.get(id);
    }
    getAllPatterns() {
        return Array.from(this.patterns.values());
    }
    selectPatterns(_performanceData) {
        return Array.from(this.patterns.values())
            .sort((a, b) => b.fitness - a.fitness)
            .slice(0, Math.ceil(this.patterns.size * this.options.selectionPressure));
    }
    applyEvolution(patterns) {
        return patterns.map((pattern) => ({
            ...pattern,
            fitness: pattern.fitness + (Math.random() - 0.5) * this.options.mutationRate,
            generation: this.evolutionHistory.length + 1,
        }));
    }
    updatePatterns(evolved) {
        evolved.forEach((pattern) => {
            if (this.patterns.has(pattern.id)) {
                this.patterns.set(pattern.id, pattern);
            }
        });
    }
    calculateAverageFitness(patterns) {
        if (patterns.length === 0)
            return 0;
        const total = patterns.reduce((sum, p) => sum + p.fitness, 0);
        return total / patterns.length;
    }
    async initializeAgent(agentId, config) {
        const agentPattern = {
            id: `agent_${agentId}`,
            agentId,
            config,
            patterns: [],
            fitness: 0.5,
            generation: 0,
            timestamp: new Date(),
        };
        this.patterns.set(agentPattern.id, agentPattern);
        return agentPattern;
    }
    async assessGrowth(agentId) {
        const agentPatterns = Array.from(this.patterns.values()).filter((p) => p.agentId === agentId);
        if (agentPatterns.length === 0) {
            return { growth: 0, patterns: 0 };
        }
        const avgFitness = this.calculateAverageFitness(agentPatterns);
        return {
            growth: avgFitness,
            patterns: agentPatterns.length,
            latestGeneration: Math.max(...agentPatterns.map((p) => p.generation || 0)),
        };
    }
    async enableCrossAgentEvolution(agentIds, _session) {
        for (const agentId of agentIds) {
            const patterns = Array.from(this.patterns.values()).filter((p) => p.agentId === agentId);
            for (const otherAgentId of agentIds) {
                if (otherAgentId !== agentId) {
                    for (const pattern of patterns.slice(0, 3)) {
                        const sharedPattern = {
                            ...pattern,
                            id: `shared_${pattern.id}_${otherAgentId}`,
                            agentId: otherAgentId,
                            sharedFrom: agentId,
                        };
                        this.patterns.set(sharedPattern.id, sharedPattern);
                    }
                }
            }
        }
        return { success: true, sharedPatterns: agentIds.length * 3 };
    }
    calculateAggregationWeights(gradients) {
        return gradients.map((_, _index) => {
            return 1.0 / gradients.length;
        });
    }
    async preserveHistory(agentId) {
        const agentPatterns = Array.from(this.patterns.values()).filter((p) => p.agentId === agentId);
        return {
            agentId,
            patterns: agentPatterns,
            evolutionHistory: this.evolutionHistory.filter((h) => h.agentId === agentId),
            timestamp: new Date(),
        };
    }
    async restoreHistory(_agentId, history) {
        if (history?.patterns) {
            for (const pattern of history.patterns) {
                this.patterns.set(pattern.id, pattern);
            }
        }
        return { success: true };
    }
    async extractPatterns(agentId) {
        return Array.from(this.patterns.values())
            .filter((p) => p.agentId === agentId)
            .map((p) => ({
            id: p.id,
            type: p.type || 'general',
            fitness: p.fitness,
            generation: p.generation,
        }));
    }
    async transferPatterns(agentId, patterns) {
        for (const pattern of patterns) {
            const transferredPattern = {
                ...pattern,
                id: `transferred_${pattern.id}_${agentId}`,
                agentId,
                transferred: true,
                timestamp: new Date(),
            };
            this.patterns.set(transferredPattern.id, transferredPattern);
        }
        return { success: true, transferred: patterns.length };
    }
    async applyPatternUpdates(agentId, patternUpdates) {
        const agentPatterns = Array.from(this.patterns.values()).filter((p) => p.agentId === agentId);
        for (const pattern of agentPatterns) {
            if (patternUpdates[pattern.id]) {
                Object.assign(pattern, patternUpdates[pattern.id]);
            }
        }
        return { success: true, updated: agentPatterns.length };
    }
    getStatistics() {
        return {
            totalPatterns: this.patterns.size,
            generations: this.evolutionHistory.length,
            averageFitness: this.calculateAverageFitness(Array.from(this.patterns.values())),
            options: this.options,
        };
    }
}
export default CognitivePatternEvolution;
//# sourceMappingURL=cognitive-pattern-evolution.js.map