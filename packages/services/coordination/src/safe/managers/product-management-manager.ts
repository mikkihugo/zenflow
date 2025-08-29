/**
 * @fileoverview Product Management Manager - SAFe Product Management
 *
 * Manages product vision, customer research, and market analysis for SAFe portfolio.
 * Coordinates product ownership activities across value streams and agile release trains.
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 */
import { EventBus} from '@claude-zen/foundation')import { CustomerResearchService} from '../services/customer-research-service')import { MarketAnalysisService} from '../services/market-analysis-service')import { ProductVisionService} from '../services/product-vision-service')import type {';
  Feature,
  Logger,
  MemorySystem,
  EventBus,
} from '../types')import type {';
  CustomerSegment,
  MarketOpportunity,
  ProductLifecycleStage,
  ProductManagerConfig,
  ProductVision,
} from '../types/product-management')import { SafeCollectionUtils} from '../utilities/collections/safe-collections')import { SafeDateUtils} from '../utilities/date/safe-date-utils')import { SafeValidationUtils} from '../utilities/validation/safe-validation')/**';
 * Product management manager state
 */
interface ProductManagerState {
  readonly isInitialized: false;
  // Service delegation - initialized in initialize() method
  private visionService!:ProductVisionService;
  private researchService!:CustomerResearchService;
  private marketService!:MarketAnalysisService;
  constructor(
    config: config;
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
      this.logger.warn('Product Management Manager already initialized');
      return;
}
    try {
    ')      this.logger.info('Initializing Product Management Manager...');
      // Delegate to ProductVisionService for vision management
      if (this.config.enableProductVisionManagement) {
        this.visionService = new ProductVisionService(
          {
            visionValidationThreshold: new CustomerResearchService(
          {
            maxSegments: new MarketAnalysisService(
          {
    ')            analysisDepth : 'comprehensive,'
'            competitorTrackingCount: true;')      this.logger.info('Product Management Manager initialized successfully');')      this.emit('initialized, timestamp: await this.visionService.createProductVision({
      ...input,
      successCriteria: '12 months',)          measurement,},';
],
});
    // Update state
    this.state = {
      ...this.state,
      visionCount: await this.researchService.performResearchAnalysis();
    // Filter segments by urgency level (immediate, short_term, medium_term are high priority)
    const segments = analysis.segmentInsights
      .map((si) => si.segment)
      .filter(
        (segment) =>')          segment.urgency ==='immediate'|| segment.urgency ===short_term'|| segment.urgency ===medium_term'));
    // Update state
    this.state = {
      ...this.state,
      customerSegmentCount: await Promise.all([
      this.marketService.performMarketSizing({
        ...input,
        pricingModel: 'competitive,',
'          basePrice:  {
      ...this.state,
      lastMarketAnalysis: features.map((feature) => ({
      ...feature,
      businessValue: feature.businessValue|| 20,
      urgency: 15, // Mock urgency score
      riskReduction: 10, // Mock risk reduction score
      size: feature.stories?.length|| 8, // Use story count as size estimate
});
    const prioritizedFeatures =;
      SafeCollectionUtils.prioritizeByWSJF(featuresWithWSJF);')    this.logger.info('Feature prioritization completed,{';
      topFeature: 12
  ): Promise<{
    roadmapId: SafeDateUtils.calculateRoadmapHorizon(horizonMonths);
    const milestones = roadmapHorizon.quarters.map((quarter) => ({
      date:  {';
    ')      roadmapId,    ')      timeline: [];
    const warnings: [];
    // Validate using schema validation
    const epicValidation = SafeValidationUtils.validateEpic(productData.epic);
    if (!epicValidation.success) {
      errors.push(...epicValidation.error.errors.map((e) => e.message);
}
    if (productData.features) {
      for (const feature of productData.features) {
        const featureValidation = SafeValidationUtils.validateFeature(feature);
        if (!featureValidation.success) {
          warnings.push(
            ...featureValidation.error.errors.map((e) => e.message));
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
  getStatus():  {
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
  private initializeState():ProductManagerState {
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
    ')    this.eventBus.on('product-vision-updated,(_data) => {';
    ')      this.logger.info('Product vision updated, data');')      this.emit('vision-updated, data');
});')    this.eventBus.on('market-data-refreshed,(_data) => {';
    ')      this.logger.info('Market data refreshed, data');')      this.emit('market-data-updated, data');
});
}
  /**
   * Restore state from memory system
   */
  private async restoreState(): Promise<void> {
    try {
      const savedState = await this.memorySystem.retrieve(';)';
       'product-manager-state'));
      if (savedState) {
        this.state = { ...this.state, ...savedState};
        this.logger.info('Product manager state restored from memory');
}
} catch (error) {
    ')      this.logger.warn('Failed to restore state from memory:, error');
}
}
  /**
   * Persist current state to memory system
   */
  private async persistState(): Promise<void> {
    try {
    ')      await this.memorySystem.store('product-manager-state,{';
        visionCount: this.state.visionCount,
        lastMarketAnalysis: this.state.lastMarketAnalysis,
        customerSegmentCount: this.state.customerSegmentCount,')';
});
} catch (error) {
    ')      this.logger.warn('Failed to persist state to memory:, error');
}
};)};;
// Default export for backwards compatibility
export default ProductManagementManager;
')';