/**
 * RoadmapService - Manages roadmap generation and lifecycle for approved visions
 * Integrates with Vision-to-Code system for strategic planning and technical implementation
 */

import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { ApiError } from '../../../shared/middleware/src/errorHandler.js';

export default class RoadmapService extends EventEmitter {
  constructor(server) {
    super();
    this.server = server;
    this.db = server.db;
    this.aiModels = server.aiModels || {};
    this.visionProcessor = server.visionProcessor;
    
    // Roadmap generation configuration
    this.config = {
      aiModel: process.env.ROADMAP_AI_MODEL || 'claude-3-5-sonnet-20241022',
      geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
      maxPhases: 8,
      defaultTimeframe: '6-months',
      riskAssessment: true,
      resourceEstimation: true
    };
  }

  /**
   * Get roadmap for a specific vision
   */
  async getRoadmap(visionId) {
    try {
      const roadmap = await this.db.get(`
        SELECT r.*, v.title as vision_title, v.description as vision_description 
        FROM roadmaps r
        JOIN visions v ON r.vision_id = v.id
        WHERE r.vision_id = ?
      `, [visionId]);

      if (roadmap && roadmap.phases) {
        roadmap.phases = JSON.parse(roadmap.phases);
      }
      if (roadmap && roadmap.dependencies) {
        roadmap.dependencies = JSON.parse(roadmap.dependencies);
      }
      if (roadmap && roadmap.risks) {
        roadmap.risks = JSON.parse(roadmap.risks);
      }
      if (roadmap && roadmap.resources) {
        roadmap.resources = JSON.parse(roadmap.resources);
      }

      return roadmap;
    } catch (error) {
      throw new ApiError('DATABASE_ERROR', `Failed to retrieve roadmap: ${error.message}`);
    }
  }

  /**
   * Generate or regenerate roadmap for a vision
   */
  async generateRoadmap(visionId, options = {}) {
    try {
      // Get vision details
      const vision = await this.db.get('SELECT * FROM visions WHERE id = ?', [visionId]);
      
      if (!vision) {
        throw new ApiError('NOT_FOUND', 'Vision not found');
      }

      if (vision.status !== 'approved') {
        throw new ApiError('INVALID_STATUS', 'Only approved visions can have roadmaps generated');
      }

      // Generate comprehensive roadmap using AI
      const roadmapData = await this._generateRoadmapWithAI(vision, options);
      
      // Check if roadmap already exists
      const existingRoadmap = await this.getRoadmap(visionId);
      
      if (existingRoadmap) {
        // Update existing roadmap
        return await this._updateRoadmap(visionId, roadmapData);
      } else {
        // Create new roadmap
        return await this._createRoadmap(visionId, roadmapData);
      }
    } catch (error) {
      this.emit('roadmapGenerationFailed', { visionId, error: error.message });
      throw error;
    }
  }

  /**
   * Update roadmap phases and milestones
   */
  async updateRoadmapPhase(visionId, phaseId, updates) {
    try {
      const roadmap = await this.getRoadmap(visionId);
      
      if (!roadmap) {
        throw new ApiError('NOT_FOUND', 'Roadmap not found');
      }

      const phases = roadmap.phases || [];
      const phaseIndex = phases.findIndex(p => p.id === phaseId);
      
      if (phaseIndex === -1) {
        throw new ApiError('NOT_FOUND', 'Phase not found');
      }

      // Update phase
      phases[phaseIndex] = { ...phases[phaseIndex], ...updates };
      
      // Update roadmap
      await this.db.run(`
        UPDATE roadmaps 
        SET phases = ?, updated_at = CURRENT_TIMESTAMP
        WHERE vision_id = ?
      `, [JSON.stringify(phases), visionId]);

      this.emit('roadmapPhaseUpdated', { visionId, phaseId, updates });
      
      return await this.getRoadmap(visionId);
    } catch (error) {
      throw new ApiError('UPDATE_ERROR', `Failed to update roadmap phase: ${error.message}`);
    }
  }

  /**
   * Get roadmap analytics and progress metrics
   */
  async getRoadmapAnalytics(visionId) {
    try {
      const roadmap = await this.getRoadmap(visionId);
      
      if (!roadmap) {
        throw new ApiError('NOT_FOUND', 'Roadmap not found');
      }

      const phases = roadmap.phases || [];
      const totalPhases = phases.length;
      const completedPhases = phases.filter(p => p.status === 'completed').length;
      const inProgressPhases = phases.filter(p => p.status === 'in-progress').length;
      const blockedPhases = phases.filter(p => p.status === 'blocked').length;
      
      // Calculate progress
      const progressPercentage = totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0;
      
      // Risk assessment
      const risks = roadmap.risks || [];
      const highRisks = risks.filter(r => r.severity === 'high').length;
      const mediumRisks = risks.filter(r => r.severity === 'medium').length;
      
      // Timeline analysis
      const startDate = new Date(roadmap.start_date);
      const endDate = new Date(roadmap.target_completion);
      const currentDate = new Date();
      
      const totalDuration = endDate - startDate;
      const elapsed = currentDate - startDate;
      const timeProgressPercentage = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 0;
      
      return {
        roadmapId: roadmap.id,
        visionId: visionId,
        progress: {
          phases: {
            total: totalPhases,
            completed: completedPhases,
            inProgress: inProgressPhases,
            blocked: blockedPhases,
            percentage: Math.round(progressPercentage * 100) / 100
          },
          timeline: {
            startDate: roadmap.start_date,
            targetCompletion: roadmap.target_completion,
            currentProgress: Math.round(timeProgressPercentage * 100) / 100,
            onTrack: progressPercentage >= timeProgressPercentage - 10 // 10% tolerance
          }
        },
        risks: {
          total: risks.length,
          high: highRisks,
          medium: mediumRisks,
          low: risks.length - highRisks - mediumRisks
        },
        resources: roadmap.resources || {},
        lastUpdated: roadmap.updated_at
      };
    } catch (error) {
      throw new ApiError('ANALYTICS_ERROR', `Failed to generate roadmap analytics: ${error.message}`);
    }
  }

  /**
   * Generate roadmap using AI models
   */
  async _generateRoadmapWithAI(vision, options) {
    try {
      // Prepare vision context for AI
      const visionContext = {
        title: vision.title,
        description: vision.description,
        category: vision.category,
        priority: vision.priority,
        expectedRoi: vision.expected_roi,
        timeframe: options.timeframe || this.config.defaultTimeframe,
        constraints: options.constraints || [],
        requirements: options.requirements || []
      };

      // Generate strategic roadmap with Claude
      const strategicPrompt = this._buildStrategicPrompt(visionContext);
      let strategicRoadmap;
      
      if (this.aiModels.claude) {
        strategicRoadmap = await this.aiModels.claude.generateContent(strategicPrompt);
      } else if (this.visionProcessor) {
        strategicRoadmap = await this.visionProcessor.processVisionToStrategy(visionContext);
      } else {
        // Fallback to structured roadmap generation
        strategicRoadmap = this._generateFallbackRoadmap(visionContext);
      }

      // Enhance with technical analysis using Gemini
      let technicalEnhancement;
      if (this.aiModels.gemini) {
        const technicalPrompt = this._buildTechnicalPrompt(visionContext, strategicRoadmap);
        technicalEnhancement = await this.aiModels.gemini.generateContent(technicalPrompt);
      }

      // Combine strategic and technical insights
      return this._combineRoadmapInsights(strategicRoadmap, technicalEnhancement, visionContext);

    } catch (error) {
      throw new ApiError('AI_GENERATION_ERROR', `Failed to generate AI roadmap: ${error.message}`);
    }
  }

  /**
   * Build strategic analysis prompt
   */
  _buildStrategicPrompt(visionContext) {
    return `Generate a comprehensive strategic roadmap for the following vision:

Title: ${visionContext.title}
Description: ${visionContext.description}
Category: ${visionContext.category}
Priority: ${visionContext.priority}
Expected ROI: ${visionContext.expectedRoi}
Timeframe: ${visionContext.timeframe}

Please provide:
1. 6-8 strategic phases with clear milestones
2. Dependencies between phases
3. Risk assessment and mitigation strategies
4. Resource requirements (human, technical, financial)
5. Success criteria for each phase
6. Timeline estimates

Format the response as a structured JSON object with phases, dependencies, risks, and resources.`;
  }

  /**
   * Build technical analysis prompt
   */
  _buildTechnicalPrompt(visionContext, strategicRoadmap) {
    return `Enhance this strategic roadmap with detailed technical analysis:

Vision Context: ${JSON.stringify(visionContext)}
Strategic Roadmap: ${JSON.stringify(strategicRoadmap)}

Please provide technical enhancements:
1. Technology stack recommendations
2. Architecture patterns and design decisions
3. Implementation complexity assessment
4. Technical risks and dependencies
5. Infrastructure requirements
6. Integration points and APIs
7. Performance and scalability considerations

Return technical insights that complement the strategic phases.`;
  }

  /**
   * Generate fallback roadmap when AI is not available
   */
  _generateFallbackRoadmap(visionContext) {
    const phases = [
      {
        id: uuidv4(),
        name: 'Vision Analysis & Planning',
        description: 'Analyze requirements and create detailed project plan',
        duration: '2-4 weeks',
        status: 'pending',
        milestones: ['Requirements gathering', 'Technical analysis', 'Resource planning'],
        dependencies: []
      },
      {
        id: uuidv4(),
        name: 'System Design & Architecture',
        description: 'Design system architecture and technical specifications',
        duration: '3-6 weeks', 
        status: 'pending',
        milestones: ['Architecture design', 'Technology selection', 'Security planning'],
        dependencies: []
      },
      {
        id: uuidv4(),
        name: 'Core Development',
        description: 'Implement core functionality and features',
        duration: '8-12 weeks',
        status: 'pending',
        milestones: ['Core features', 'API development', 'Database setup'],
        dependencies: []
      },
      {
        id: uuidv4(),
        name: 'Testing & Quality Assurance',
        description: 'Comprehensive testing and quality validation',
        duration: '4-6 weeks',
        status: 'pending',
        milestones: ['Unit testing', 'Integration testing', 'Performance testing'],
        dependencies: []
      },
      {
        id: uuidv4(),
        name: 'Deployment & Launch',
        description: 'Deploy to production and launch',
        duration: '2-3 weeks',
        status: 'pending',
        milestones: ['Production deployment', 'Monitoring setup', 'Go-live'],
        dependencies: []
      }
    ];

    const risks = [
      {
        id: uuidv4(),
        description: 'Technical complexity higher than estimated',
        severity: 'medium',
        probability: 'medium',
        mitigation: 'Regular technical reviews and prototype validation'
      },
      {
        id: uuidv4(),
        description: 'Resource availability constraints',
        severity: 'high',
        probability: 'low',
        mitigation: 'Early resource allocation and backup planning'
      }
    ];

    const resources = {
      human: `${Math.ceil(Math.random() * 5) + 2} developers, 1 architect, 1 tester`,
      technical: 'Cloud infrastructure, development tools, monitoring systems',
      financial: `Estimated budget: $${(Math.random() * 200000 + 50000).toFixed(0)}`
    };

    return { phases, risks, resources };
  }

  /**
   * Combine strategic and technical roadmap insights
   */
  _combineRoadmapInsights(strategic, technical, visionContext) {
    try {
      // Parse AI responses if they're strings
      const strategicData = typeof strategic === 'string' ? 
        this._parseAIResponse(strategic) : strategic;
      const technicalData = typeof technical === 'string' ? 
        this._parseAIResponse(technical) : technical;

      // Merge insights
      const combinedPhases = strategicData.phases || [];
      if (technicalData && technicalData.technicalEnhancements) {
        combinedPhases.forEach((phase, index) => {
          if (technicalData.technicalEnhancements[index]) {
            phase.technical = technicalData.technicalEnhancements[index];
          }
        });
      }

      return {
        phases: combinedPhases,
        dependencies: strategicData.dependencies || [],
        risks: [...(strategicData.risks || []), ...(technicalData?.risks || [])],
        resources: {
          ...(strategicData.resources || {}),
          ...(technicalData?.resources || {})
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          aiModelsUsed: ['claude-3-5-sonnet', 'gemini-1.5-pro'],
          visionId: visionContext.id
        }
      };
    } catch (error) {
      // Return fallback if parsing fails
      return this._generateFallbackRoadmap(visionContext);
    }
  }

  /**
   * Parse AI response to extract structured data
   */
  _parseAIResponse(response) {
    try {
      // Try to find JSON in the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback parsing for structured text
      return this._parseStructuredText(response);
    } catch (error) {
      console.warn('Failed to parse AI response:', error.message);
      return { phases: [], dependencies: [], risks: [], resources: {} };
    }
  }

  /**
   * Parse structured text response from AI
   */
  _parseStructuredText(text) {
    // Simple fallback parser for non-JSON responses
    const phases = [];
    const risks = [];
    
    // Extract phases (basic pattern matching)
    const phaseMatches = text.match(/Phase \d+:.*?(?=Phase \d+:|$)/gs) || [];
    phaseMatches.forEach((match, index) => {
      phases.push({
        id: uuidv4(),
        name: `Phase ${index + 1}`,
        description: match.replace(/Phase \d+:\s*/, '').trim(),
        status: 'pending',
        milestones: [],
        dependencies: []
      });
    });

    // Extract risks (basic pattern matching)
    const riskMatches = text.match(/Risk:.*?(?=Risk:|$)/gs) || [];
    riskMatches.forEach(match => {
      risks.push({
        id: uuidv4(),
        description: match.replace(/Risk:\s*/, '').trim(),
        severity: 'medium',
        probability: 'medium',
        mitigation: 'To be determined'
      });
    });

    return { phases, risks, dependencies: [], resources: {} };
  }

  /**
   * Create new roadmap in database
   */
  async _createRoadmap(visionId, roadmapData) {
    const roadmapId = uuidv4();
    const startDate = new Date().toISOString();
    const targetCompletion = this._calculateTargetCompletion(startDate, roadmapData.phases);

    try {
      await this.db.run(`
        INSERT INTO roadmaps (
          id, vision_id, phases, dependencies, risks, resources,
          start_date, target_completion, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        roadmapId,
        visionId,
        JSON.stringify(roadmapData.phases),
        JSON.stringify(roadmapData.dependencies),
        JSON.stringify(roadmapData.risks),
        JSON.stringify(roadmapData.resources),
        startDate,
        targetCompletion
      ]);

      this.emit('roadmapCreated', { visionId, roadmapId });
      
      return await this.getRoadmap(visionId);
    } catch (error) {
      throw new ApiError('CREATE_ERROR', `Failed to create roadmap: ${error.message}`);
    }
  }

  /**
   * Update existing roadmap
   */
  async _updateRoadmap(visionId, roadmapData) {
    try {
      const targetCompletion = this._calculateTargetCompletion(
        new Date().toISOString(), 
        roadmapData.phases
      );

      await this.db.run(`
        UPDATE roadmaps 
        SET phases = ?, dependencies = ?, risks = ?, resources = ?,
            target_completion = ?, updated_at = CURRENT_TIMESTAMP
        WHERE vision_id = ?
      `, [
        JSON.stringify(roadmapData.phases),
        JSON.stringify(roadmapData.dependencies),
        JSON.stringify(roadmapData.risks),
        JSON.stringify(roadmapData.resources),
        targetCompletion,
        visionId
      ]);

      this.emit('roadmapUpdated', { visionId });
      
      return await this.getRoadmap(visionId);
    } catch (error) {
      throw new ApiError('UPDATE_ERROR', `Failed to update roadmap: ${error.message}`);
    }
  }

  /**
   * Calculate target completion date based on phases
   */
  _calculateTargetCompletion(startDate, phases) {
    const start = new Date(startDate);
    let totalWeeks = 0;

    phases.forEach(phase => {
      // Extract weeks from duration strings like "2-4 weeks"
      const durationMatch = phase.duration?.match(/(\d+)-?(\d+)?\s*weeks?/i);
      if (durationMatch) {
        const minWeeks = parseInt(durationMatch[1]);
        const maxWeeks = parseInt(durationMatch[2]) || minWeeks;
        totalWeeks += Math.ceil((minWeeks + maxWeeks) / 2);
      } else {
        // Default to 4 weeks if no duration specified
        totalWeeks += 4;
      }
    });

    const targetDate = new Date(start);
    targetDate.setDate(targetDate.getDate() + (totalWeeks * 7));
    
    return targetDate.toISOString();
  }
}