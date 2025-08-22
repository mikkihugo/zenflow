import { getLogger } from '@claude-zen/foundation';
import { getBrainSystem } from '@claude-zen/intelligence';
import { getEventSystem } from '@claude-zen/infrastructure';

import {
  SafeObservabilityDashboard,
  SafeDashboardFactory,
} from './safe-observability-dashboard';
import {
  SafeIntegrationPlatform,
  SafePlatformFactory,
} from './safe-integration-platform';

const logger = getLogger('SafeProductionDemo');

export class SafeProductionDemo {
  private eventSystem: any;
  private dashboards: Map<string, SafeObservabilityDashboard> = new Map();
  private integrations: Map<string, SafeIntegrationPlatform> = new Map();

  async demonstrateProductionSystem(): Promise<void> {
    logger.info('🚀 Starting SAFe Production System Demo');

    // Initialize global event system
    this.eventSystem = await getEventSystem();

    // Demo 1: Multi-role production dashboards
    await this.demoProductionDashboards();

    // Demo 2: Real-time event-driven coordination
    await this.demoEventDrivenCoordination();

    // Demo 3: Production-grade observability
    await this.demoProductionObservability();

    // Demo 4: Brain-powered intelligence integration
    await this.demoBrainIntegration();

    // Demo 5: Enterprise-scale collaboration
    await this.demoEnterpriseCollaboration();

    // Demo 6: Complete PI Planning production experience
    await this.demoPIPlanningProduction();

    logger.info('✅ SAFe Production System Demo completed successfully');
  }

  private async demoProductionDashboards(): Promise<void> {
    logger.info('📊 Demo: Production-Grade Multi-Role Dashboards');

    const roles = [
      'team_member',
      'scrum_master',
      'po',
      'rte',
      'architect',
      'business_owner',
    ] as const;

    for (const role of roles) {
      const userId = `prod_${role}_001`;
      const dashboard = await SafeDashboardFactory.createForUser(userId, role, {
        immersionLevel: 'production',
      });

      this.dashboards.set(userId, dashboard);

      const state = await dashboard.exportDashboardState();
      logger.info(`Production dashboard created for ${role}`, {
        userId,
        widgetCount: state.activeWidgets.length,
        immersionMode: state.immersionMode,
        realTimeUpdates: state.realTimeUpdates,
      });

      // Demonstrate production-grade features
      const productionFeatures = state.activeWidgets.filter(
        (w) => w.immersionLevel === 'production'
      );
      for (const widget of productionFeatures) {
        logger.info(`${role} production widget: ${widget.title}`, {
          type: widget.type,
          size: widget.size,
          performanceOptimized: true,
        });
      }
    }

    logger.info('✅ Production dashboards deployed successfully');
  }

  private async demoEventDrivenCoordination(): Promise<void> {
    logger.info('⚡ Demo: Real-time Event-Driven Coordination');

    // Simulate real-world SAFe events flowing through the system
    const events = [
      {
        type: 'safe:gate_status_changed',
        data: {
          gateId: 'GATE_EPIC_APPROVAL_001',
          status: 'approved',
          approver: 'business_owner_001',
          timestamp: new Date(),
          impact: 'high',
        },
      },
      {
        type: 'safe:dependency_resolved',
        data: {
          dependencyId: 'DEP_API_INTEGRATION',
          fromTeam: 'platform_team',
          toTeam: 'mobile_team',
          resolution: 'api_contract_finalized',
          timestamp: new Date(),
        },
      },
      {
        type: 'safe:pi_planning_event',
        data: {
          phase: 'day1_morning',
          event: 'vision_presentation_completed',
          artId: 'ART_PLATFORM',
          participantCount: 45,
          timestamp: new Date(),
        },
      },
      {
        type: 'user:achievement_unlocked',
        data: {
          userId: 'prod_scrum_master_001',
          achievementId: 'dependency_master',
          points: 200,
          rarity: 'epic',
          timestamp: new Date(),
        },
      },
    ];

    // Emit events and demonstrate real-time propagation
    for (const event of events) {
      logger.info(`🌐 Broadcasting event: ${event.type}`, event.data);

      await this.eventSystem.emit(event.type, event.data);

      // Simulate small delay for real-time effect
      await new Promise((resolve) => setTimeout(resolve, 500));

      logger.info(`📡 Event processed by ${this.dashboards.size} dashboards`);
    }

    logger.info('✅ Event-driven coordination demo completed');
  }

  private async demoProductionObservability(): Promise<void> {
    logger.info('📈 Demo: Production-Grade Observability');

    const rteUserId = 'prod_rte_001';
    const rteDashboard = this.dashboards.get(rteUserId);

    if (rteDashboard) {
      // Add production observability widgets
      const observabilityWidgets = [
        {
          type: 'visualization',
          title: 'ART Health Metrics',
          size: 'large',
          position: { x: 0, y: 2 },
          immersionLevel: 'production',
        },
        {
          type: 'prediction',
          title: 'PI Success Probability Engine',
          size: 'large',
          position: { x: 1, y: 2 },
          immersionLevel: 'production',
        },
        {
          type: 'integration',
          title: 'Tool Chain Health Monitor',
          size: 'medium',
          position: { x: 2, y: 2 },
          immersionLevel: 'production',
        },
      ];

      for (const widget of observabilityWidgets) {
        const widgetId = await rteDashboard.addWidget(widget);
        logger.info(`Added production observability widget: ${widget.title}`, {
          widgetId,
        });
      }

      // Simulate real-time metrics collection
      const metrics = {
        artHealth: 0.87,
        piSuccessProbability: 0.79,
        toolChainUptime: 99.97,
        teamVelocityTrend: 'improving',
        dependencyRiskLevel: 'medium',
        businessValueDelivery: 0.82,
      };

      logger.info('Production Metrics Collected', metrics);

      // Demonstrate alerting for production issues
      if (metrics.dependencyRiskLevel === 'medium') {
        await this.eventSystem.emit('alert:dependency_risk_detected', {
          severity: 'warning',
          message: 'Medium dependency risk detected for upcoming PI',
          affectedTeams: ['platform_team', 'mobile_team'],
          recommendedActions: [
            'Schedule dependency resolution session',
            'Review API contracts',
          ],
          timestamp: new Date(),
        });

        logger.info('🚨 Production alert triggered: Dependency risk detected');
      }
    }

    logger.info('✅ Production observability demo completed');
  }

  private async demoBrainIntegration(): Promise<void> {
    logger.info('🧠 Demo: Brain-Powered Intelligence Integration');

    const brainSystem = await getBrainSystem();
    const coordinator = brainSystem.createCoordinator();

    // Simulate complex PI planning optimization
    const optimization = await coordinator.optimizePIPlanning({
      artId: 'ART_PLATFORM',
      teams: [
        { name: 'Platform', velocity: 23, capacity: 80, riskLevel: 'low' },
        { name: 'Mobile', velocity: 19, capacity: 75, riskLevel: 'medium' },
        { name: 'Web', velocity: 21, capacity: 85, riskLevel: 'low' },
        { name: 'API', velocity: 17, capacity: 70, riskLevel: 'high' },
      ],
      dependencies: [
        { from: 'Platform', to: 'Mobile', complexity: 'high', risk: 'medium' },
        { from: 'Platform', to: 'Web', complexity: 'medium', risk: 'low' },
        { from: 'API', to: 'Platform', complexity: 'high', risk: 'high' },
      ],
      businessObjectives: [
        { id: 'OBJ-1', priority: 'critical', businessValue: 9, confidence: 7 },
        { id: 'OBJ-2', priority: 'high', businessValue: 7, confidence: 8 },
        { id: 'OBJ-3', priority: 'medium', businessValue: 6, confidence: 9 },
      ],
    });

    logger.info('Brain-Powered PI Optimization Complete', {
      recommendedTeamAdjustments: optimization.teamAdjustments,
      dependencyMitigationPlan: optimization.dependencyPlan,
      successProbability: optimization.successProbability,
      confidenceLevel: optimization.confidence,
    });

    // Broadcast brain insights through event system
    await this.eventSystem.emit('brain:optimization_completed', {
      optimizationType: 'pi_planning',
      results: optimization,
      timestamp: new Date(),
      source: 'brain_coordinator',
    });

    // Simulate continuous learning feedback
    const feedbackEvent = {
      type: 'brain:learning_feedback',
      data: {
        predictionId: optimization.predictionId,
        actualOutcome: 'successful_pi_delivery',
        accuracyScore: 0.91,
        learningPoints: [
          'API team risk assessment was accurate',
          'Dependency complexity underestimated by 10%',
          'Business value prediction within 5% of actual',
        ],
        timestamp: new Date(),
      },
    };

    await this.eventSystem.emit(feedbackEvent.type, feedbackEvent.data);
    logger.info('🎯 Brain learning feedback processed', feedbackEvent.data);

    logger.info('✅ Brain integration demo completed');
  }

  private async demoEnterpriseCollaboration(): Promise<void> {
    logger.info('🤝 Demo: Enterprise-Scale Collaboration');

    // Simulate cross-ART dependency resolution
    const crossARTScenario = {
      event: 'cross_art_dependency_session',
      participants: [
        { userId: 'prod_rte_001', role: 'rte', art: 'ART_Platform' },
        { userId: 'prod_rte_002', role: 'rte', art: 'ART_Commerce' },
        { userId: 'prod_architect_001', role: 'architect', art: 'Enterprise' },
        {
          userId: 'prod_business_owner_001',
          role: 'business_owner',
          art: 'Portfolio',
        },
      ],
      context: 'Resolving shared service dependencies for Q2 initiatives',
    };

    logger.info('Cross-ART Collaboration Session Started', crossARTScenario);

    // Demonstrate enterprise-grade workflow automations
    const automations = [
      {
        trigger: 'Cross-ART dependency identified',
        action: 'Create enterprise tracking ticket',
        status: 'executed',
        result: 'ENT-TICKET-12345 created in portfolio backlog',
      },
      {
        trigger: 'Solution architect agreement reached',
        action: 'Update enterprise architecture repository',
        status: 'executed',
        result: 'Architecture decision record ADR-089 published',
      },
      {
        trigger: 'Timeline consensus achieved',
        action: 'Sync with all affected PI planning boards',
        status: 'executed',
        result: 'PI planning boards updated across 3 ARTs',
      },
      {
        trigger: 'Risk mitigation planned',
        action: 'Schedule governance review',
        status: 'executed',
        result: 'Enterprise risk review scheduled for next week',
      },
    ];

    for (const automation of automations) {
      logger.info('🔄 Enterprise Automation Executed', automation);

      await this.eventSystem.emit('enterprise:automation_completed', {
        automation,
        timestamp: new Date(),
        scope: 'cross_art',
      });
    }

    logger.info('✅ Enterprise collaboration demo completed');
  }

  private async demoPIPlanningProduction(): Promise<void> {
    logger.info('🎯 Demo: Complete PI Planning Production Experience');

    const piPlanningEvent = {
      id: 'PI_2025_Q2_PLANNING',
      artName: 'Platform ART',
      startDate: '2025-03-15',
      duration: '2 days',
      teams: ['Platform', 'Mobile', 'Web', 'API'],
      participants: 67,
      facilitator: 'prod_rte_001',
      mode: 'hybrid_production',
    };

    logger.info('Production PI Planning Event Initialized', piPlanningEvent);

    // Day 1 Morning: Vision and Context with Production Features
    logger.info('🌅 PI Planning Day 1 - Production Morning Session');
    await this.simulateProductionPIPhase('day1_morning', {
      activities: [
        'Business Context',
        'Vision Presentation',
        'Architecture Vision',
        'Production Metrics Review',
      ],
      productionFeatures: [
        'Real-time stakeholder polling',
        'AI-powered context analysis',
        'Immersive vision mapping',
        'Automated alignment scoring',
      ],
    });

    // Day 1 Afternoon: Team Planning with Enterprise Integration
    logger.info('🌇 PI Planning Day 1 - Production Afternoon Session');
    await this.simulateProductionPIPhase('day1_afternoon', {
      activities: [
        'Team Breakouts',
        'Feature Planning',
        'Dependency Mapping',
        'Capacity Validation',
      ],
      productionFeatures: [
        'Virtual team collaboration spaces',
        'Real-time dependency visualization',
        'AI-powered capacity optimization',
        'Automated conflict detection',
      ],
    });

    // Day 2 Morning: Resolution and Optimization
    logger.info('🌅 PI Planning Day 2 - Production Morning Session');
    await this.simulateProductionPIPhase('day2_morning', {
      activities: [
        'Dependency Resolution',
        'Risk Mitigation',
        'Plan Optimization',
        'Cross-Team Integration',
      ],
      productionFeatures: [
        'AI-powered risk assessment',
        'Predictive dependency analysis',
        'Optimization recommendation engine',
        'Enterprise integration validation',
      ],
    });

    // Day 2 Afternoon: Finalization and Commitment
    logger.info('🌇 PI Planning Day 2 - Production Final Session');
    await this.simulateProductionPIPhase('day2_afternoon', {
      activities: [
        'Confidence Voting',
        'Plan Presentation',
        'Objective Finalization',
        'Production Deployment',
      ],
      productionFeatures: [
        'Real-time confidence tracking',
        'Achievement celebration system',
        'Automated plan documentation',
        'Production readiness validation',
      ],
    });

    // Final production metrics
    const finalMetrics = {
      participantEngagement: 0.94,
      planConfidence: 0.87,
      dependencyResolution: 0.91,
      businessAlignment: 0.89,
      productionReadiness: 0.93,
    };

    logger.info('🏆 Production PI Planning Completed', finalMetrics);

    await this.eventSystem.emit('pi_planning:production_completed', {
      event: piPlanningEvent,
      metrics: finalMetrics,
      timestamp: new Date(),
      success: true,
    });

    logger.info('✅ Complete PI Planning production experience demo completed');
  }

  private async simulateProductionPIPhase(
    phase: string,
    config: any
  ): Promise<void> {
    logger.info(`🔧 Production PI Planning Phase: ${phase}`, {
      activities: config.activities,
      productionFeatures: config.productionFeatures,
    });

    // Simulate real-time production updates
    const updates = [
      `${config.activities[0]} - Production metrics: 97% participant engagement`,
      `${config.activities[1]} - AI analysis: 23% improvement in clarity`,
      `${config.activities[2]} - Production optimization: 15% efficiency gain`,
      `${config.activities[3]} - Enterprise validation: All systems green`,
    ];

    for (const update of updates) {
      logger.info(`📊 Production Update: ${update}`);

      await this.eventSystem.emit('pi_planning:real_time_update', {
        phase,
        update,
        timestamp: new Date(),
      });
    }

    // Activate production features
    for (const feature of config.productionFeatures) {
      logger.info(`⚡ Production Feature Active: ${feature}`);

      await this.eventSystem.emit('production:feature_activated', {
        feature,
        phase,
        timestamp: new Date(),
      });
    }
  }

  async cleanup(): Promise<void> {
    logger.info('🧹 Cleaning up production demo resources');

    // Cleanup dashboards
    for (const [userId, dashboard] of this.dashboards) {
      await dashboard.destroy();
      logger.info(`Dashboard destroyed for user: ${userId}`);
    }

    // Cleanup integrations
    for (const [userId, integration] of this.integrations) {
      await integration.destroy();
      logger.info(`Integration destroyed for user: ${userId}`);
    }

    this.dashboards.clear();
    this.integrations.clear();

    // Remove event listeners
    if (this.eventSystem) {
      this.eventSystem.removeAllListeners();
    }

    logger.info('✅ Production demo cleanup completed');
  }
}

// Main production demo execution function
export async function runSafeProductionDemo(): Promise<void> {
  const demo = new SafeProductionDemo();

  try {
    await demo.demonstrateProductionSystem();
  } catch (error) {
    logger.error('Production demo execution failed', { error });
  } finally {
    await demo.cleanup();
  }
}

// Export for testing and integration
export { SafeProductionDemo };
