import { getLogger } from '@claude-zen/foundation';
import { getBrainSystem } from '@claude-zen/intelligence';
import { getDevelopmentSystem } from '@claude-zen/development';
import { getEventSystem } from '@claude-zen/infrastructure';

import { SafeIntegrationPlatform, SafePlatformConfig } from './safe-integration-platform';

const logger = getLogger('SafeObservabilityDashboard');

export interface DashboardWidget {
  id: string;
  type: 'visualization' | 'coaching' | 'gamification' | 'prediction' | 'integration';
  title: string;
  size: 'small' | 'medium' | 'large' | 'full-width';
  position: { x: number; y: number };
  roleSpecific: boolean;
  immersionLevel: 'basic' | 'enhanced' | 'production';
  data: any;
}

export interface SafeDashboardState {
  userId: string;
  userRole: SafePlatformConfig['userRole'];
  currentPI: string;
  activeWidgets: DashboardWidget[];
  immersionMode: boolean;
  aiCoachingActive: boolean;
  realTimeUpdates: boolean;
  performanceMetrics: {
    renderTime: number;
    userEngagement: number;
    predictionAccuracy: number;
    workflowEfficiency: number;
  };
}

export class SafeObservabilityDashboard {
  private eventSystem: any;
  private integration: SafeIntegrationPlatform;
  private state: SafeDashboardState;
  private brainSystem: any;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(config: SafePlatformConfig, userId: string) {
    this.integration = new SafeIntegrationPlatform(config);
    this.state = {
      userId,
      userRole: config.userRole,
      currentPI: 'PI-2025-Q1',
      activeWidgets: [],
      immersionMode: config.immersionLevel === 'production',
      aiCoachingActive: config.enableAICoaching,
      realTimeUpdates: true,
      performanceMetrics: {
        renderTime: 0,
        userEngagement: 0,
        predictionAccuracy: 0,
        workflowEfficiency: 0
      }
    };
  }

  async initialize(): Promise<void> {
    logger.info('Initializing SAFe Observability Dashboard', { userId: this.state.userId });

    // Initialize global event system
    this.eventSystem = await getEventSystem();

    // Initialize brain system
    this.brainSystem = await getBrainSystem();
    
    // Initialize platform integration
    await this.integration.initialize();

    // Create role-specific widget layout
    await this.createRoleSpecificLayout();

    // Start real-time updates
    if (this.state.realTimeUpdates) {
      this.startRealTimeUpdates();
    }

    // Set up event listeners for dashboard updates
    await this.setupDashboardEvents();

    logger.info('SAFe Observability Dashboard initialized');
  }

  private async setupDashboardEvents(): Promise<void> {
    // Listen for global SAFe events and update dashboard
    this.eventSystem.on('safe:gate_status_changed', async (event: any) => {
      await this.updateDashboardForGateChange(event);
    });

    this.eventSystem.on('safe:pi_planning_event', async (event: any) => {
      await this.updateDashboardForPIPlanning(event);
    });

    this.eventSystem.on('user:achievement_unlocked', async (event: any) => {
      await this.updateDashboardForAchievement(event);
    });

    this.eventSystem.on('brain:prediction_generated', async (event: any) => {
      await this.updateDashboardForPrediction(event);
    });
  }

  private async updateDashboardForGateChange(event: any): Promise<void> {
    // Update visualization widgets to reflect gate status changes
    const visualizationWidgets = this.state.activeWidgets.filter(w => w.type === 'visualization');
    for (const widget of visualizationWidgets) {
      widget.data = await this.updateVisualizationData(widget.data, event);
    }

    // Emit dashboard update event
    await this.emit('dashboard:updated', {
      reason: 'gate_status_changed',
      affectedWidgets: visualizationWidgets.map(w => w.id),
      timestamp: new Date()
    });
  }

  private async updateDashboardForPIPlanning(event: any): Promise<void> {
    // Update PI Planning specific widgets
    const planningWidgets = this.state.activeWidgets.filter(w => 
      w.title.includes('PI Planning') || w.type === 'integration'
    );
    
    for (const widget of planningWidgets) {
      widget.data = await this.updatePlanningData(widget.data, event);
    }

    await this.emit('dashboard:pi_planning_updated', {
      event,
      affectedWidgets: planningWidgets.map(w => w.id),
      timestamp: new Date()
    });
  }

  private async updateDashboardForAchievement(event: any): Promise<void> {
    // Update gamification widgets
    const gamificationWidgets = this.state.activeWidgets.filter(w => w.type === 'gamification');
    for (const widget of gamificationWidgets) {
      widget.data = await this.updateGamificationData(widget.data, event);
    }

    await this.emit('dashboard:achievement_updated', {
      achievement: event,
      userId: this.state.userId,
      timestamp: new Date()
    });
  }

  private async updateDashboardForPrediction(event: any): Promise<void> {
    // Update prediction widgets
    const predictionWidgets = this.state.activeWidgets.filter(w => w.type === 'prediction');
    for (const widget of predictionWidgets) {
      widget.data = await this.updatePredictionData(widget.data, event);
    }

    await this.emit('dashboard:prediction_updated', {
      prediction: event,
      confidence: event.confidence,
      timestamp: new Date()
    });
  }

  private async createRoleSpecificLayout(): Promise<void> {
    const widgetTemplates = await this.getRoleSpecificWidgets();
    
    for (const template of widgetTemplates) {
      const widget = await this.createWidget(template);
      this.state.activeWidgets.push(widget);
    }
  }

  private async getRoleSpecificWidgets(): Promise<Partial<DashboardWidget>[]> {
    const commonWidgets = [
      {
        type: 'prediction' as const,
        title: 'AI Insights',
        size: 'medium' as const,
        position: { x: 0, y: 0 },
        immersionLevel: 'basic' as const
      },
      {
        type: 'coaching' as const,
        title: 'AI Coach',
        size: 'small' as const,
        position: { x: 2, y: 0 },
        immersionLevel: 'basic' as const
      }
    ];

    const roleSpecificWidgets = {
      team_member: [
        {
          type: 'visualization' as const,
          title: '3D Team Universe',
          size: 'large' as const,
          position: { x: 0, y: 1 },
          immersionLevel: 'enhanced' as const
        },
        {
          type: 'gamification' as const,
          title: 'Skills & Achievements',
          size: 'medium' as const,
          position: { x: 1, y: 0 },
          immersionLevel: 'basic' as const
        }
      ],
      scrum_master: [
        {
          type: 'visualization' as const,
          title: 'Team Health Radar',
          size: 'large' as const,
          position: { x: 0, y: 1 },
          immersionLevel: 'enhanced' as const
        },
        {
          type: 'integration' as const,
          title: 'Workflow Orchestration',
          size: 'medium' as const,
          position: { x: 1, y: 0 },
          immersionLevel: 'basic' as const
        }
      ],
      po: [
        {
          type: 'visualization' as const,
          title: 'Value Stream Galaxy',
          size: 'full-width' as const,
          position: { x: 0, y: 1 },
          immersionLevel: 'production' as const
        },
        {
          type: 'prediction' as const,
          title: 'Customer Impact Forecast',
          size: 'medium' as const,
          position: { x: 1, y: 0 },
          immersionLevel: 'enhanced' as const
        }
      ],
      rte: [
        {
          type: 'visualization' as const,
          title: 'ART Constellation',
          size: 'large' as const,
          position: { x: 0, y: 1 },
          immersionLevel: 'production' as const
        },
        {
          type: 'integration' as const,
          title: 'PI Planning Command Center',
          size: 'large' as const,
          position: { x: 1, y: 1 },
          immersionLevel: 'enhanced' as const
        }
      ],
      architect: [
        {
          type: 'visualization' as const,
          title: 'System Architecture Cosmos',
          size: 'full-width' as const,
          position: { x: 0, y: 1 },
          immersionLevel: 'production' as const
        },
        {
          type: 'prediction' as const,
          title: 'Technical Debt Evolution',
          size: 'medium' as const,
          position: { x: 1, y: 0 },
          immersionLevel: 'enhanced' as const
        }
      ],
      business_owner: [
        {
          type: 'visualization' as const,
          title: 'Portfolio Universe',
          size: 'full-width' as const,
          position: { x: 0, y: 1 },
          immersionLevel: 'production' as const
        },
        {
          type: 'prediction' as const,
          title: 'Business Outcome Forecasting',
          size: 'large' as const,
          position: { x: 0, y: 2 },
          immersionLevel: 'enhanced' as const
        }
      ]
    };

    return [
      ...commonWidgets,
      ...(roleSpecificWidgets[this.state.userRole] || [])
    ];
  }

  private async createWidget(template: Partial<DashboardWidget>): Promise<DashboardWidget> {
    const widget: DashboardWidget = {
      id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: template.type || 'prediction',
      title: template.title || 'Untitled Widget',
      size: template.size || 'medium',
      position: template.position || { x: 0, y: 0 },
      roleSpecific: true,
      immersionLevel: template.immersionLevel || 'basic',
      data: await this.generateWidgetData(template.type || 'prediction')
    };

    return widget;
  }

  private async generateWidgetData(widgetType: string): Promise<any> {
    const coordinator = this.brainSystem.createCoordinator();
    
    switch (widgetType) {
      case 'visualization':
        return await this.generate3DVisualizationData();
      
      case 'coaching':
        return await this.generateAICoachingData();
      
      case 'gamification':
        return await this.generateGamificationData();
      
      case 'prediction':
        return await this.generatePredictionData();
      
      case 'integration':
        return await this.generateIntegrationData();
      
      default:
        return { message: 'Widget data loading...', timestamp: new Date() };
    }
  }

  private async generate3DVisualizationData(): Promise<any> {
    return {
      scene: {
        universe: {
          center: { x: 0, y: 0, z: 0 },
          scale: 1.0,
          theme: 'production_safe'
        },
        objects: [
          {
            type: 'team_planet',
            id: 'team_alpha',
            position: { x: -100, y: 0, z: 50 },
            size: 15,
            health: 0.85,
            velocity: 23,
            objectives: 8
          },
          {
            type: 'epic_satellite',
            id: 'epic_user_onboarding',
            position: { x: -85, y: 20, z: 45 },
            size: 5,
            progress: 0.67,
            dependencies: ['team_beta']
          },
          {
            type: 'dependency_bridge',
            from: 'team_alpha',
            to: 'team_beta',
            strength: 0.8,
            status: 'healthy'
          }
        ],
        camera: {
          position: { x: 0, y: 50, z: 200 },
          target: { x: 0, y: 0, z: 0 },
          fov: 60
        }
      },
      interactions: {
        navigation: 'orbital_camera',
        selection: 'hover_highlight',
        details: 'context_panel'
      }
    };
  }

  private async generateAICoachingData(): Promise<any> {
    const coordinator = this.brainSystem.createCoordinator();
    const suggestions = await coordinator.generateCoachingSuggestions({
      userRole: this.state.userRole,
      currentContext: 'pi_planning_week',
      recentActivity: await this.getUserRecentActivity()
    });

    return {
      activeSession: {
        coachName: 'Alex',
        personality: 'production_focused_guide',
        currentFocus: 'operational_excellence',
        confidence: 0.92
      },
      suggestions: suggestions.slice(0, 3),
      nextActions: [
        {
          action: 'Review dependency risks',
          priority: 'high',
          estimatedTime: '15 minutes',
          reasoning: 'Two high-risk dependencies identified for next PI'
        },
        {
          action: 'Facilitate team retrospective',
          priority: 'medium',
          estimatedTime: '45 minutes',
          reasoning: 'Team velocity trend suggests process improvement opportunity'
        }
      ],
      progressTracking: {
        skillGrowth: {
          facilitation: { current: 7.2, target: 8.0, trend: 'improving' },
          stakeholderMgmt: { current: 6.8, target: 7.5, trend: 'stable' }
        }
      }
    };
  }

  private async generateGamificationData(): Promise<any> {
    const userStats = await this.integration.getCurrentUserStats();
    
    return {
      currentLevel: {
        level: 12,
        title: 'SAFe Navigator',
        progress: 0.73,
        nextLevel: 'SAFe Master',
        pointsToNext: 1250
      },
      recentAchievements: [
        {
          id: 'dependency_resolver',
          title: 'Dependency Resolver',
          description: 'Successfully resolved 5 cross-team dependencies',
          points: 150,
          rarity: 'uncommon',
          earnedAt: new Date(Date.now() - 86400000)
        },
        {
          id: 'pi_planning_facilitator',
          title: 'PI Planning Facilitator',
          description: 'Led your first PI Planning event to success',
          points: 300,
          rarity: 'rare',
          earnedAt: new Date(Date.now() - 172800000)
        }
      ],
      activeChallenges: [
        {
          id: 'innovation_week',
          title: 'Innovation Week Champion',
          description: 'Submit 3 innovation ideas during Innovation Week',
          progress: 2,
          target: 3,
          timeRemaining: '3 days',
          reward: '500 points + Innovation Badge'
        }
      ],
      leaderboards: {
        team: { rank: 2, total: 8, score: 2150 },
        art: { rank: 7, total: 45, score: 2150 },
        global: { rank: 234, total: 1580, score: 2150 }
      }
    };
  }

  private async generatePredictionData(): Promise<any> {
    return {
      piSuccessProbability: {
        current: 0.78,
        trend: 'improving',
        factors: [
          { name: 'Team Capacity', impact: 0.85, status: 'healthy' },
          { name: 'Dependency Risk', impact: 0.72, status: 'attention_needed' },
          { name: 'Scope Clarity', impact: 0.91, status: 'excellent' }
        ]
      },
      riskAlerts: [
        {
          type: 'dependency_risk',
          severity: 'medium',
          description: 'Team Beta dependency on shared service may delay Feature X',
          probability: 0.65,
          suggestedActions: ['Schedule dependency alignment meeting', 'Identify alternative approach']
        }
      ],
      opportunityInsights: [
        {
          type: 'velocity_optimization',
          description: 'Team shows 15% velocity increase potential with process adjustment',
          confidence: 0.82,
          expectedBenefit: 'Additional 3 story points per iteration'
        }
      ],
      businessOutcomeForecasts: [
        {
          metric: 'Customer Satisfaction',
          currentTrend: 4.2,
          predictedValue: 4.6,
          confidence: 0.74,
          timeframe: 'end of PI'
        }
      ]
    };
  }

  private async generateIntegrationData(): Promise<any> {
    return {
      connectedTools: [
        { name: 'Jira', status: 'healthy', syncRate: '99.8%', lastSync: '2 minutes ago' },
        { name: 'GitHub', status: 'healthy', syncRate: '99.9%', lastSync: '30 seconds ago' },
        { name: 'Slack', status: 'warning', syncRate: '95.2%', lastSync: '15 minutes ago' },
        { name: 'Confluence', status: 'healthy', syncRate: '98.7%', lastSync: '5 minutes ago' }
      ],
      workflowAutomations: [
        {
          name: 'Epic to Feature Breakdown',
          status: 'active',
          triggersToday: 12,
          successRate: '94%'
        },
        {
          name: 'Dependency Notification',
          status: 'active',
          triggersToday: 8,
          successRate: '100%'
        }
      ],
      communityInsights: {
        expertNetworkConnections: 23,
        knowledgeExchanges: 8,
        mentoringSessions: 3,
        contributionScore: 156
      }
    };
  }

  private async getUserRecentActivity(): Promise<any[]> {
    return [
      { action: 'Updated story estimates', timestamp: Date.now() - 3600000 },
      { action: 'Resolved dependency with Team Beta', timestamp: Date.now() - 7200000 },
      { action: 'Participated in PI Planning Day 1', timestamp: Date.now() - 86400000 }
    ];
  }

  private startRealTimeUpdates(): void {
    this.updateInterval = setInterval(async () => {
      await this.updateDashboardData();
    }, 30000); // Update every 30 seconds
  }

  private async updateDashboardData(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Update widgets with fresh data
      for (const widget of this.state.activeWidgets) {
        widget.data = await this.generateWidgetData(widget.type);
      }

      // Update performance metrics
      this.state.performanceMetrics.renderTime = Date.now() - startTime;
      
      // Optimize user experience based on performance
      await this.integration.optimizeUserExperience();
      
    } catch (error) {
      logger.error('Error updating dashboard data', { error });
    }
  }

  private async updateVisualizationData(currentData: any, event: any): Promise<any> {
    // Update visualization based on event
    return { ...currentData, lastUpdate: new Date(), event };
  }

  private async updatePlanningData(currentData: any, event: any): Promise<any> {
    // Update planning widgets based on event
    return { ...currentData, lastPlanningUpdate: new Date(), event };
  }

  private async updateGamificationData(currentData: any, event: any): Promise<any> {
    // Update gamification based on achievement
    return { ...currentData, lastAchievement: new Date(), event };
  }

  private async updatePredictionData(currentData: any, event: any): Promise<any> {
    // Update predictions based on new brain insights
    return { ...currentData, lastPrediction: new Date(), event };
  }

  async exportDashboardState(): Promise<SafeDashboardState> {
    return { ...this.state };
  }

  async customizeWidget(widgetId: string, customization: Partial<DashboardWidget>): Promise<void> {
    const widget = this.state.activeWidgets.find(w => w.id === widgetId);
    if (widget) {
      Object.assign(widget, customization);
      widget.data = await this.generateWidgetData(widget.type);
    }
  }

  async addWidget(template: Partial<DashboardWidget>): Promise<string> {
    const widget = await this.createWidget(template);
    this.state.activeWidgets.push(widget);
    return widget.id;
  }

  async removeWidget(widgetId: string): Promise<void> {
    this.state.activeWidgets = this.state.activeWidgets.filter(w => w.id !== widgetId);
  }

  // Event emission through global event system
  async emit(eventType: string, eventData: any): Promise<void> {
    await this.eventSystem.emit(eventType, {
      ...eventData,
      source: 'safe_observability_dashboard',
      userId: this.state.userId,
      timestamp: new Date()
    });
  }

  async destroy(): Promise<void> {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    if (this.integration) {
      await this.integration.destroy();
    }

    if (this.eventSystem) {
      this.eventSystem.removeAllListeners();
    }
    
    logger.info('SAFe Observability Dashboard destroyed');
  }
}

export class SafeDashboardFactory {
  static async createForUser(
    userId: string,
    userRole: SafePlatformConfig['userRole'],
    preferences?: Partial<SafePlatformConfig>
  ): Promise<SafeObservabilityDashboard> {
    const defaultConfig: SafePlatformConfig = {
      enable3DVisualization: true,
      enableAICoaching: true,
      enableGamification: true,
      enablePredictiveIntelligence: true,
      enableEcosystemIntegration: true,
      immersionLevel: 'enhanced',
      userRole
    };

    const config = { ...defaultConfig, ...preferences };
    const dashboard = new SafeObservabilityDashboard(config, userId);
    
    await dashboard.initialize();
    return dashboard;
  }
}