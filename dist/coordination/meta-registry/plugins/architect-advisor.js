/**
 * Architect Advisor Plugin
 * AI-powered system that analyzes registry usage and suggests new registries via ADRs
 */

import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';
import fs from 'fs-extra';
import path from 'path';

export class ArchitectAdvisorPlugin extends EventEmitter {
  static metadata = {
    name: 'architect-advisor',
    version: '1.0.0',
    description: 'AI architect that analyzes patterns and suggests new registry architectures',
    dependencies: ['memory-rag'],
    capabilities: ['pattern-analysis', 'architecture-suggestion', 'adr-generation', 'optimization-analysis']
  };

  constructor() {
    super();
    this.registry = null;
    this.memoryRag = null;
    this.analysisHistory = [];
    this.suggestions = new Map();
    this.adrs = new Map();
    this.architecturalPatterns = new Map();
    this.optimizationQueue = [];
  }

  async initialize(registry, options = {}) {
    this.registry = registry;
    this.options = {
      analysisInterval: options.analysisInterval || 300000, // 5 minutes
      suggestionThreshold: options.suggestionThreshold || 0.75,
      adrPath: options.adrPath || './.swarm/adrs',
      maxSuggestions: options.maxSuggestions || 10,
      claudeModel: options.claudeModel || 'claude-3-sonnet-20240229',
      enableAutoAnalysis: options.enableAutoAnalysis !== false,
      approvalRequired: options.approvalRequired !== false,
      ...options
    };

    // Get reference to memory-rag plugin
    this.memoryRag = registry.pluginSystem?.getPlugin?.('memory-rag');
    if (!this.memoryRag) {
      console.warn('ArchitectAdvisor: memory-rag plugin not found, some features will be limited');
    }

    // Initialize ADR storage
    await this.initializeADRStorage();

    // Load existing architectural patterns
    await this.loadArchitecturalPatterns();
  }

  async initializeADRStorage() {
    await fs.ensureDir(this.options.adrPath);
    this.adrIndexFile = path.join(this.options.adrPath, 'index.json');
    this.suggestionsFile = path.join(this.options.adrPath, 'suggestions.json');
    this.patternsFile = path.join(this.options.adrPath, 'architectural-patterns.json');
  }

  async loadArchitecturalPatterns() {
    try {
      if (await fs.pathExists(this.patternsFile)) {
        const patternsData = await fs.readJson(this.patternsFile);
        this.architecturalPatterns = new Map(patternsData);
      }
    } catch (error) {
      this.emit('loadError', error);
    }
  }

  async performArchitecturalAnalysis() {
    try {
      const analysis = await this.analyzeCurrentArchitecture();
      const suggestions = await this.generateArchitecturalSuggestions(analysis);
      
      for (const suggestion of suggestions) {
        if (suggestion.confidence > this.options.suggestionThreshold) {
          await this.createSuggestion(suggestion);
        }
      }

      this.emit('analysisCompleted', {
        analysis,
        suggestions: suggestions.length,
        timestamp: new Date()
      });
    } catch (error) {
      this.emit('analysisError', error);
    }
  }

  async analyzeCurrentArchitecture() {
    const recentHistory = this.analysisHistory.slice(-100);
    
    const analysis = {
      registrationPatterns: this.analyzeRegistrationPatterns(recentHistory),
      discoveryPatterns: this.analyzeDiscoveryPatterns(recentHistory),
      performanceMetrics: this.analyzePerformanceMetrics(recentHistory),
      scalabilityIndicators: await this.analyzeScalabilityIndicators(),
      bottlenecks: await this.identifyBottlenecks(),
      timestamp: new Date()
    };

    return analysis;
  }

  async generateArchitecturalSuggestions(analysis) {
    const suggestions = [];

    // Generate suggestions based on analysis
    suggestions.push(...await this.suggestPerformanceOptimizations(analysis));
    suggestions.push(...await this.suggestScalabilityImprovements(analysis));

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  async suggestPerformanceOptimizations(analysis) {
    const suggestions = [];

    // Analyze query performance
    if (analysis.performanceMetrics.averageDiscoveryTime > 100) {
      suggestions.push({
        id: nanoid(),
        type: 'performance-optimization',
        title: 'Implement Query Indexing Registry',
        description: 'High discovery times detected. Consider implementing a specialized indexing registry.',
        confidence: 0.85,
        impact: 'high',
        effort: 'medium',
        reasoning: `Average discovery time of ${analysis.performanceMetrics.averageDiscoveryTime}ms exceeds optimal threshold`
      });
    }

    return suggestions;
  }

  async suggestScalabilityImprovements(analysis) {
    const suggestions = [];

    // Horizontal scaling suggestion
    if (analysis.scalabilityIndicators?.loadDistribution < 0.7) {
      suggestions.push({
        id: nanoid(),
        type: 'scalability-improvement',
        title: 'Implement Distributed Registry Federation',
        description: 'Uneven load distribution detected. Consider implementing federated registry architecture.',
        confidence: 0.90,
        impact: 'high',
        effort: 'high',
        reasoning: `Load distribution of ${analysis.scalabilityIndicators.loadDistribution} indicates need for better scaling`
      });
    }

    return suggestions;
  }

  async createSuggestion(suggestion) {
    const suggestionId = suggestion.id;
    suggestion.created = new Date();
    suggestion.status = 'pending';
    suggestion.votes = { approve: 0, reject: 0, abstain: 0 };
    
    this.suggestions.set(suggestionId, suggestion);
    
    // Persist suggestion
    await this.persistSuggestions();
    
    this.emit('suggestionCreated', {
      id: suggestionId,
      suggestion
    });
    
    return suggestionId;
  }

  // Analysis helper methods
  analyzeRegistrationPatterns(history) {
    const registrations = history.filter(h => h.type === 'registration');
    
    return {
      totalRegistrations: registrations.length,
      averagePerHour: this.calculateRate(registrations, 'hour'),
      eventDriven: this.calculateEventDrivenRatio(registrations),
      temporalData: this.calculateTemporalDataRatio(registrations)
    };
  }

  analyzeDiscoveryPatterns(history) {
    const discoveries = history.filter(h => h.type === 'discovery');
    
    return {
      totalDiscoveries: discoveries.length,
      averagePerHour: this.calculateRate(discoveries, 'hour'),
      repeatQueryRate: this.calculateRepeatQueryRate(discoveries),
      averageResultCount: discoveries.length > 0 ? 
        discoveries.reduce((sum, d) => sum + (d.resultCount || 0), 0) / discoveries.length : 0
    };
  }

  analyzePerformanceMetrics(history) {
    const discoveries = history.filter(h => h.type === 'discovery' && h.performance);
    
    return {
      averageDiscoveryTime: discoveries.length > 0 ?
        discoveries.reduce((sum, d) => sum + (d.performance?.time || 0), 0) / discoveries.length : 0,
      memoryUsageGrowth: this.calculateMemoryGrowth(history),
      throughput: this.calculateThroughput(history)
    };
  }

  async analyzeScalabilityIndicators() {
    return {
      activeConnections: 0,
      loadDistribution: 0.75,
      resourceUtilization: 0.5,
      growthTrend: 0.15
    };
  }

  async identifyBottlenecks() {
    return [];
  }

  // Utility methods
  calculateEventDrivenRatio(registrations) {
    const eventDriven = registrations.filter(r => 
      r.key?.includes('event') || 
      r.value?.type === 'event' ||
      r.options?.tags?.some(tag => tag.includes('event'))
    ).length;
    
    return registrations.length > 0 ? eventDriven / registrations.length : 0;
  }

  calculateTemporalDataRatio(registrations) {
    const temporal = registrations.filter(r => 
      r.value?.timestamp || 
      r.value?.createdAt ||
      r.value?.updatedAt ||
      r.options?.tags?.some(tag => tag.includes('time') || tag.includes('temporal'))
    ).length;
    
    return registrations.length > 0 ? temporal / registrations.length : 0;
  }

  calculateRepeatQueryRate(discoveries) {
    const queryHashes = new Map();
    
    for (const discovery of discoveries) {
      const hash = JSON.stringify(discovery.query);
      queryHashes.set(hash, (queryHashes.get(hash) || 0) + 1);
    }
    
    const repeats = Array.from(queryHashes.values()).filter(count => count > 1).length;
    return queryHashes.size > 0 ? repeats / queryHashes.size : 0;
  }

  // Persistence methods
  async persistSuggestions() {
    const suggestionsData = Array.from(this.suggestions.entries());
    await fs.writeJson(this.suggestionsFile, suggestionsData, { spaces: 2 });
  }

  // API methods
  async getSuggestions(filter = {}) {
    let suggestions = Array.from(this.suggestions.values());
    
    if (filter.status) {
      suggestions = suggestions.filter(s => s.status === filter.status);
    }
    
    if (filter.type) {
      suggestions = suggestions.filter(s => s.type === filter.type);
    }
    
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  getStats() {
    return {
      suggestions: {
        total: this.suggestions.size,
        pending: Array.from(this.suggestions.values()).filter(s => s.status === 'pending').length,
        approved: Array.from(this.suggestions.values()).filter(s => s.status === 'approved').length,
        rejected: Array.from(this.suggestions.values()).filter(s => s.status === 'rejected').length
      },
      adrs: {
        total: this.adrs.size
      },
      analysis: {
        historySize: this.analysisHistory.length,
        patternsDetected: this.architecturalPatterns.size
      }
    };
  }

  // Simplified helper methods
  calculateRate(items, period) {
    if (items.length === 0) return 0;
    
    const now = Date.now();
    const periodMs = period === 'hour' ? 3600000 : 86400000;
    const recent = items.filter(item => now - item.timestamp.getTime() < periodMs);
    
    return recent.length;
  }

  calculateMemoryGrowth(history) {
    return 0.1; // 10% growth
  }

  calculateThroughput(history) {
    const recent = history.slice(-20);
    return recent.length;
  }

  // Cleanup
  async cleanup() {
    // Final persistence
    await this.persistSuggestions();

    // Clear memory
    this.analysisHistory.length = 0;
    this.suggestions.clear();
    this.adrs.clear();
    this.architecturalPatterns.clear();
  }
}

export default ArchitectAdvisorPlugin;