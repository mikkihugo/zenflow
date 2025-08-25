/**
 * @fileoverview Product Management Manager - SAFe Product Management
 *
 * Manages product vision, customer research, and market analysis for SAFe portfolio.
 * Coordinates product ownership activities across value streams and agile release trains.
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 */

import { TypedEventBase } from '@claude-zen/foundation';
import type {
  Logger,
  MemorySystem,
  TypeSafeEventBus,
  PortfolioEpic,
  ValueStream,
  Feature,
  AgileReleaseTrain,
} from '../types';
import type {
  ProductManagerConfig,
  ProductVision,
  CustomerSegment,
  MarketOpportunity,
  ProductLifecycleStage,
} from '../types/product-management';
import { ProductVisionService } from '../services/product-vision-service';
import { CustomerResearchService } from '../services/customer-research-service';
import { MarketAnalysisService } from '../services/market-analysis-service';
import { SafeCollectionUtils } from '../utilities/collections/safe-collections';
import { SafeDateUtils } from '../utilities/date/safe-date-utils';
import { SafeValidationUtils } from '../utilities/validation/safe-validation';

/**
 * Product management manager state
 */
interface ProductManagerState {
  readonly isInitialized: boolean;
  readonly activeProducts: Map<string, ProductLifecycleStage>;
  readonly visionCount: number;
  readonly lastMarketAnalysis: Date|null;
  readonly customerSegmentCount: number;
}

/**
 * Product Management Manager - Lightweight facade for product management coordination
 */
export class ProductManagementManager extends TypedEventBase {
  private readonly config: ProductManagerConfig;
  private readonly logger: Logger;
  private readonly memorySystem: MemorySystem;
  private readonly eventBus: TypeSafeEventBus;
  private state: ProductManagerState;
  private initialized = false;

  // Service delegation - initialized in initialize() method
  private visionService!: ProductVisionService;
  private researchService!: CustomerResearchService;
  private marketService!: MarketAnalysisService;

  constructor(
    config: ProductManagerConfig,
    logger: Logger,
    memorySystem: MemorySystem,
    eventBus: TypeSafeEventBus
  ) {
    super();
    this.config = config;
    this.logger = logger;
    this.memorySystem = memorySystem;
    this.eventBus = eventBus;
    this.state = this.initializeState();

    this.setupEventHandlers();
  }

  /**
   * Initialize the Product Management Manager with service delegation
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn('Product Management Manager already initialized');'
      return;
    }

    try {
      this.logger.info('Initializing Product Management Manager...');'

      // Delegate to ProductVisionService for vision management
      if (this.config.enableProductVisionManagement) {
        this.visionService = new ProductVisionService(
          {
            visionValidationThreshold: this.config.minimumViabilityThreshold,
            stakeholderAlignmentTarget: this.config.customerSatisfactionTarget,
            visionReviewCycle: this.config.performanceReviewCycle,
            maxVisionLength: 500,
            enableAutoAlignment: true,
          },
          this.logger
        );
      }

      // Delegate to CustomerResearchService for market research
      if (this.config.enableMarketResearch) {
        this.researchService = new CustomerResearchService(
          {
            maxSegments: 10,
            feedbackRetentionDays: 90,
            competitorAnalysisFrequency: this.config.marketAnalysisCycle,
            customerInterviewQuota: 20,
            marketResearchDepth: 'comprehensive',
          },
          this.logger
        );
      }

      // Delegate to MarketAnalysisService for competitive analysis
      if (this.config.enableCompetitiveAnalysis) {
        this.marketService = new MarketAnalysisService(
          {
            analysisDepth: 'comprehensive',
            competitorTrackingCount: 15,
            trendAnalysisHorizon: this.config.roadmapHorizonMonths,
            marketDataRefreshDays: this.config.marketAnalysisCycle,
            confidenceThreshold: 70,
          },
          this.logger
        );
      }

      // Restore state from memory if available
      await this.restoreState();

      this.initialized = true;
      this.logger.info('Product Management Manager initialized successfully');'

      this.emit('initialized', { timestamp: SafeDateUtils.formatISOString() });'
    } catch (error) {
      this.logger.error(
        'Failed to initialize Product Management Manager:',
        error
      );
      throw error;
    }
  }

  /**
   * Create product vision - delegates to ProductVisionService
   */
  async createProductVision(input: {
    productId: string;
    visionStatement: string;
    targetCustomers: CustomerSegment[];
    valueProposition: string;
    keyBenefits: string[];
    differentiators: string[];
    marketOpportunity: MarketOpportunity;
    strategicThemes: string[];
  }): Promise<ProductVision> {
    if (!this.initialized) await this.initialize();

    this.logger.info('Creating product vision', { productId: input.productId });'

    const vision = await this.visionService.createProductVision({
      ...input,
      successCriteria: [
        {
          metric: 'Customer Satisfaction',
          target: this.config.customerSatisfactionTarget,
          timeframe: '12 months',
          measurement: 'NPS Score',
        },
      ],
    });

    // Update state
    this.state = {
      ...this.state,
      visionCount: this.state.visionCount + 1,
    };

    await this.persistState();
    this.emit('vision-created', {'
      vision,
      timestamp: SafeDateUtils.formatISOString(),
    });

    return vision;
  }

  /**
   * Analyze customer segments - delegates to CustomerResearchService
   */
  async analyzeCustomerSegments(productId: string): Promise<CustomerSegment[]> {
    if (!this.initialized) await this.initialize();

    this.logger.info('Analyzing customer segments', { productId });'

    const analysis = await this.researchService.performResearchAnalysis();
    // Filter segments by urgency level (immediate, short_term, medium_term are high priority)
    const segments = analysis.segmentInsights
      .map((si) => si.segment)
      .filter(
        (segment) =>
          segment.urgency === 'immediate'||segment.urgency ==='short_term'||segment.urgency ==='medium_term''
      );

    // Update state
    this.state = {
      ...this.state,
      customerSegmentCount: segments.length,
    };

    await this.persistState();
    return segments;
  }

  /**
   * Perform market analysis - delegates to MarketAnalysisService
   */
  async performMarketAnalysis(input: {
    marketCategory: string;
    geographicScope: string[];
    targetSegments: string[];
  }): Promise<{
    sizing: any;
    competitive: any;
    opportunities: any;
  }> {
    if (!this.initialized) await this.initialize();

    this.logger.info('Performing market analysis', {'
      category: input.marketCategory,
    });

    const [sizing, competitive, opportunities] = await Promise.all([
      this.marketService.performMarketSizing({
        ...input,
        pricingModel: {
          model: 'competitive',
          basePrice: 100,
          discount: 10,
          bundling: false,
        },
        assumptions: [
          'Market growth continues',
          'Competitive landscape stable',
        ],
      }),
      this.marketService.analyzeCompetitiveLandscape([]),
      this.marketService.assessOpportunity(
        {
          totalAddressableMarket: 0,
          serviceableAddressableMarket: 0,
          serviceableObtainableMarket: 0,
          marketGrowthRate: 12,
          competitiveLandscape: [],
          marketTrends: [],
          barriers: [],
          opportunities: [],
        },
        75, // competitive position
        1000000 // investment capacity
      ),
    ]);

    // Update state
    this.state = {
      ...this.state,
      lastMarketAnalysis: new Date(),
    };

    await this.persistState();
    this.emit('market-analysis-complete', {'
      sizing,
      competitive,
      opportunities,
      timestamp: SafeDateUtils.formatISOString(),
    });

    return { sizing, competitive, opportunities };
  }

  /**
   * Prioritize features using WSJF - delegates to SafeCollectionUtils
   */
  async prioritizeFeatures(features: Feature[]): Promise<Feature[]> {
    if (!this.initialized) await this.initialize();

    this.logger.info('Prioritizing features using WSJF', {'
      featureCount: features.length,
    });

    // Transform features for WSJF calculation
    const featuresWithWSJF = features.map((feature) => ({
      ...feature,
      businessValue: feature.businessValue||20,
      urgency: 15, // Mock urgency score
      riskReduction: 10, // Mock risk reduction score
      size: feature.stories?.length||8, // Use story count as size estimate
    }));

    const prioritizedFeatures =
      SafeCollectionUtils.prioritizeByWSJF(featuresWithWSJF);

    this.logger.info('Feature prioritization completed', {'
      topFeature: prioritizedFeatures[0]?.name,
    });

    return prioritizedFeatures;
  }

  /**
   * Generate product roadmap - uses SafeDateUtils for timeline management
   */
  async generateProductRoadmap(
    productId: string,
    horizonMonths: number = 12
  ): Promise<{
    roadmapId: string;
    timeline: any;
    milestones: Array<{ date: Date; title: string; description: string }>;
  }> {
    if (!this.initialized) await this.initialize();

    this.logger.info('Generating product roadmap', {'
      productId,
      horizonMonths,
    });

    const roadmapHorizon = SafeDateUtils.calculateRoadmapHorizon(horizonMonths);
    const milestones = roadmapHorizon.quarters.map((quarter) => ({
      date: quarter.start,
      title: `${quarter.label} Planning`,`
      description: `Quarterly planning and review for ${quarter.label}`,`
    }));

    const roadmap = {
      roadmapId: `roadmap-${productId}-${Date.now()}`,`
      timeline: roadmapHorizon,
      milestones,
    };

    this.logger.info('Product roadmap generated', {'
      roadmapId: roadmap.roadmapId,
      milestoneCount: milestones.length,
    });

    this.emit('roadmap-generated', {'
      roadmap,
      timestamp: SafeDateUtils.formatISOString(),
    });

    return roadmap;
  }

  /**
   * Validate product data - delegates to SafeValidationUtils
   */
  validateProductData(productData: any): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    this.logger.info('Validating product data');'

    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate using schema validation
    const epicValidation = SafeValidationUtils.validateEpic(productData.epic);
    if (!epicValidation.success) {
      errors.push(...epicValidation.error.errors.map((e) => e.message));
    }

    if (productData.features) {
      for (const feature of productData.features) {
        const featureValidation = SafeValidationUtils.validateFeature(feature);
        if (!featureValidation.success) {
          warnings.push(
            ...featureValidation.error.errors.map((e) => e.message)
          );
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get manager status and metrics
   */
  getStatus(): {
    initialized: boolean;
    state: ProductManagerState;
    config: ProductManagerConfig;
    lastActivity: string;
  } {
    return {
      initialized: this.initialized,
      state: this.state,
      config: this.config,
      lastActivity: SafeDateUtils.formatISOString(),
    };
  }

  // Private helper methods

  /**
   * Initialize manager state
   */
  private initializeState(): ProductManagerState {
    return {
      isInitialized: false,
      activeProducts: new Map(),
      visionCount: 0,
      lastMarketAnalysis: null,
      customerSegmentCount: 0,
    };
  }

  /**
   * Setup event handlers for coordination
   */
  private setupEventHandlers(): void {
    this.eventBus.on('product-vision-updated', (data) => {'
      this.logger.info('Product vision updated', data);'
      this.emit('vision-updated', data);'
    });

    this.eventBus.on('market-data-refreshed', (data) => {'
      this.logger.info('Market data refreshed', data);'
      this.emit('market-data-updated', data);'
    });
  }

  /**
   * Restore state from memory system
   */
  private async restoreState(): Promise<void> {
    try {
      const savedState = await this.memorySystem.retrieve(
        'product-manager-state''
      );
      if (savedState) {
        this.state = { ...this.state, ...savedState };
        this.logger.info('Product manager state restored from memory');'
      }
    } catch (error) {
      this.logger.warn('Failed to restore state from memory:', error);'
    }
  }

  /**
   * Persist current state to memory system
   */
  private async persistState(): Promise<void> {
    try {
      await this.memorySystem.store('product-manager-state', {'
        visionCount: this.state.visionCount,
        lastMarketAnalysis: this.state.lastMarketAnalysis,
        customerSegmentCount: this.state.customerSegmentCount,
      });
    } catch (error) {
      this.logger.warn('Failed to persist state to memory:', error);'
    }
  }
}

// Default export for backwards compatibility
export default ProductManagementManager;
