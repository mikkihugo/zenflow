/**
 * Vision Service
 * Business logic for vision management including AI enhancement
 */

const crypto = require('crypto');
const BaseApiClient = require('../../../shared/api-client/src/base-client');

class VisionService {
  constructor(server) {
    this.server = server;
    this.eventBus = server.eventBus;
    
    // In production, this would be a database
    this.visions = new Map();

    // Initialize API clients
    this.coreClient = new BaseApiClient({
      baseURL: server.dependencies.coreService,
      serviceId: 'business-service'
    });

    this.swarmClient = new BaseApiClient({
      baseURL: server.dependencies.swarmService,
      serviceId: 'business-service'
    });
  }

  /**
   * Create a new vision with AI enhancement
   */
  async createVision(data) {
    // Generate vision ID
    const visionId = `vis_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // Create vision object
    const vision = {
      vision_id: visionId,
      title: data.title,
      description: data.description,
      strategic_goals: data.strategic_goals,
      timeline_months: data.timeline_months,
      budget_usd: data.budget_usd || null,
      stakeholders: data.stakeholders || [],
      priority: data.priority || 'medium',
      status: 'draft',
      created_at: new Date().toISOString(),
      created_by: data.created_by,
      updated_at: new Date().toISOString(),
      enhanced_with_ai: false,
      gemini_insights: null,
      workflow_id: null,
      next_steps: ['stakeholder_review', 'technical_feasibility']
    };

    // Enhance with Gemini AI (simulated for now)
    try {
      const insights = await this.enhanceWithGemini(vision);
      vision.enhanced_with_ai = true;
      vision.gemini_insights = insights;
    } catch (error) {
      console.error('Failed to enhance with Gemini:', error);
      // Continue without AI enhancement
    }

    // Generate workflow ID
    vision.workflow_id = `wf_${visionId}`;

    // Store vision
    this.visions.set(visionId, vision);

    // Register workflow with Core Service
    try {
      await this.coreClient.post('/api/v1/workflows/vision', {
        workflow_type: 'vision_to_code',
        vision_id: visionId,
        metadata: {
          source_service: 'business-service',
          priority: vision.priority,
          estimated_duration_days: vision.timeline_months * 30
        },
        circuit_breaker_config: {
          timeout_ms: 30000,
          failure_threshold: 0.5,
          reset_timeout_ms: 60000
        }
      });
    } catch (error) {
      console.error('Failed to register workflow:', error);
      // Continue - workflow registration can be retried
    }

    // Publish event
    await this.eventBus.publish('vision:created', {
      vision_id: visionId,
      title: vision.title,
      priority: vision.priority,
      request_id: data.request_id
    });

    return vision;
  }

  /**
   * Enhance vision with Gemini AI insights
   */
  async enhanceWithGemini(vision) {
    // In production, this would call Gemini API
    // For now, return simulated insights
    return {
      feasibility_score: 0.85,
      risk_assessment: 'medium',
      recommended_phases: 3,
      key_challenges: [
        'AI model accuracy requirements',
        'Scalability considerations',
        'Integration complexity'
      ],
      success_factors: [
        'Strong technical team',
        'Clear requirements',
        'Phased delivery approach'
      ],
      estimated_roi: 2.5,
      confidence: 0.78
    };
  }

  /**
   * List visions with pagination and filtering
   */
  async listVisions(options) {
    const { page, limit, status, priority, sort, order } = options;
    
    // Filter visions
    let visions = Array.from(this.visions.values());
    
    if (status) {
      visions = visions.filter(v => v.status === status);
    }
    
    if (priority) {
      visions = visions.filter(v => v.priority === priority);
    }

    // Sort
    const sortOrder = order === 'asc' ? 1 : -1;
    visions.sort((a, b) => {
      const aVal = a[sort];
      const bVal = b[sort];
      return aVal > bVal ? sortOrder : -sortOrder;
    });

    // Paginate
    const total = visions.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedVisions = visions.slice(start, start + limit);

    return {
      visions: paginatedVisions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Get a specific vision
   */
  async getVision(visionId) {
    return this.visions.get(visionId);
  }

  /**
   * Update a vision
   */
  async updateVision(visionId, updates) {
    const vision = this.visions.get(visionId);
    if (!vision) {
      return null;
    }

    // Only allow updates if vision is in draft or pending_approval status
    if (!['draft', 'pending_approval'].includes(vision.status)) {
      throw new Error('Vision cannot be updated in current status');
    }

    // Update fields
    const updatedVision = {
      ...vision,
      ...updates,
      vision_id: visionId, // Prevent ID change
      created_at: vision.created_at, // Preserve original timestamp
      created_by: vision.created_by, // Preserve creator
      updated_at: new Date().toISOString(),
      updated_by: updates.updated_by
    };

    // Re-enhance with AI if significant changes
    if (updates.strategic_goals || updates.description) {
      try {
        const insights = await this.enhanceWithGemini(updatedVision);
        updatedVision.gemini_insights = insights;
      } catch (error) {
        console.error('Failed to re-enhance with Gemini:', error);
      }
    }

    this.visions.set(visionId, updatedVision);

    // Publish event
    await this.eventBus.publish('vision:updated', {
      vision_id: visionId,
      changes: Object.keys(updates),
      request_id: updates.request_id
    });

    return updatedVision;
  }

  /**
   * Approve a vision
   */
  async approveVision(visionId, approvalData) {
    const vision = this.visions.get(visionId);
    if (!vision) {
      return null;
    }

    // Update vision status
    const approvedVision = {
      ...vision,
      status: 'approved',
      approval_timestamp: new Date().toISOString(),
      approver_email: approvalData.approver_email,
      approval_notes: approvalData.approval_notes,
      conditions: approvalData.conditions || [],
      updated_at: new Date().toISOString(),
      updated_by: approvalData.approved_by
    };

    this.visions.set(visionId, approvedVision);

    // Initialize swarm coordination
    try {
      const coordination = await this.swarmClient.post('/api/v1/coordination/vision', {
        action: 'coordinate_vision_workflow',
        vision_data: {
          vision_id: visionId,
          strategic_goals: vision.strategic_goals,
          technical_requirements: this.extractTechnicalRequirements(vision)
        },
        coordination_type: 'queen_led',
        optimization_goals: ['speed', 'quality', 'cost']
      });

      approvedVision.swarm_coordination_id = coordination.coordination_id;
      approvedVision.technical_planning_initiated = true;
    } catch (error) {
      console.error('Failed to initialize swarm coordination:', error);
      approvedVision.technical_planning_initiated = false;
    }

    // Update workflow status
    try {
      await this.coreClient.post(`/api/v1/workflows/${vision.workflow_id}/progress`, {
        workflow_id: vision.workflow_id,
        phase: 'approved',
        progress_percentage: 10,
        completed_tasks: ['vision_approval'],
        current_tasks: ['technical_planning'],
        estimated_completion: this.calculateEstimatedCompletion(vision.timeline_months)
      });
    } catch (error) {
      console.error('Failed to update workflow progress:', error);
    }

    // Publish event
    await this.eventBus.publish('vision:approved', {
      vision_id: visionId,
      workflow_id: vision.workflow_id,
      swarm_coordination_id: approvedVision.swarm_coordination_id,
      request_id: approvalData.request_id
    });

    return approvedVision;
  }

  /**
   * Reject a vision
   */
  async rejectVision(visionId, rejectionData) {
    const vision = this.visions.get(visionId);
    if (!vision) {
      return null;
    }

    const rejectedVision = {
      ...vision,
      status: 'rejected',
      rejection_timestamp: new Date().toISOString(),
      rejection_reason: rejectionData.rejection_reason,
      rejection_feedback: rejectionData.feedback,
      updated_at: new Date().toISOString(),
      updated_by: rejectionData.rejected_by
    };

    this.visions.set(visionId, rejectedVision);

    // Publish event
    await this.eventBus.publish('vision:rejected', {
      vision_id: visionId,
      reason: rejectionData.rejection_reason,
      request_id: rejectionData.request_id
    });

    return rejectedVision;
  }

  /**
   * Archive a vision
   */
  async archiveVision(visionId, archiveData) {
    const vision = this.visions.get(visionId);
    if (!vision) {
      return null;
    }

    const archivedVision = {
      ...vision,
      status: 'archived',
      archived_at: new Date().toISOString(),
      archived_by: archiveData.archived_by
    };

    this.visions.set(visionId, archivedVision);

    // Publish event
    await this.eventBus.publish('vision:archived', {
      vision_id: visionId,
      request_id: archiveData.request_id
    });

    return archivedVision;
  }

  /**
   * Extract technical requirements from vision
   */
  extractTechnicalRequirements(vision) {
    // Simple extraction logic - in production would use NLP
    const requirements = [];
    
    const techKeywords = [
      'microservices', 'ai', 'machine learning', 'real-time', 
      'scalable', 'cloud', 'mobile', 'api', 'integration'
    ];

    const text = `${vision.description} ${vision.strategic_goals.join(' ')}`.toLowerCase();
    
    techKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        requirements.push(keyword);
      }
    });

    return requirements;
  }

  /**
   * Calculate estimated completion date
   */
  calculateEstimatedCompletion(timelineMonths) {
    const date = new Date();
    date.setMonth(date.getMonth() + timelineMonths);
    return date.toISOString();
  }
}

module.exports = VisionService;