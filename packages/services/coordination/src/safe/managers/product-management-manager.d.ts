/**
 * @fileoverview Product Management Manager - SAFe Product Management
 *
 * Manages product vision, customer research, and market analysis for SAFe portfolio.
 * Coordinates product ownership activities across value streams and agile release trains.
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 */
import { EventBus } from '@claude-zen/foundation';
import type { Feature, Logger, MemorySystem, TypeSafeEventBus } from '../types';
import type { CustomerSegment, MarketOpportunity, ProductManagerConfig, ProductVision } from '../types/product-management';
/**
 * Product Management Manager - Lightweight facade for product management coordination
 */
export declare class ProductManagementManager extends EventBus {
    private readonly config;
    private readonly logger;
    private readonly memorySystem;
    private readonly eventBus;
    private state;
    private initialized;
    private visionService;
    private researchService;
    private marketService;
    constructor(config: ProductManagerConfig, logger: Logger, memorySystem: MemorySystem, eventBus: TypeSafeEventBus);
    /**
     * Initialize the Product Management Manager with service delegation
     */
    initialize(): Promise<void>;
    /**
     * Create product vision - delegates to ProductVisionService
     */
    createProductVision(input: {
        productId: string;
        visionStatement: string;
        targetCustomers: CustomerSegment[];
        valueProposition: string;
        keyBenefits: string[];
        differentiators: string[];
        marketOpportunity: MarketOpportunity;
        strategicThemes: string[];
    }): Promise<ProductVision>;
    /**
     * Analyze customer segments - delegates to CustomerResearchService
     */
    analyzeCustomerSegments(productId: string): Promise<CustomerSegment[]>;
    /**
     * Perform market analysis - delegates to MarketAnalysisService
     */
    performMarketAnalysis(input: {
        marketCategory: string;
        geographicScope: string[];
        targetSegments: string[];
    }): Promise<{
        sizing: any;
        competitive: any;
        opportunities: any;
    }>;
    /**
     * Prioritize features using WSJF - delegates to SafeCollectionUtils
     */
    prioritizeFeatures(features: Feature[]): Promise<Feature[]>;
    /**
     * Generate product roadmap - uses SafeDateUtils for timeline management
     */
    generateProductRoadmap(productId: string, horizonMonths?: number): Promise<{
        roadmapId: string;
        timeline: any;
        milestones: Array<{
            date: Date;
            title: string;
            description: string;
        }>;
    }>;
    const roadmap: any;
}
//# sourceMappingURL=product-management-manager.d.ts.map