/**
 * @fileoverview Product Management Types - SAFe Domain Types
 *
 * TypeScript type definitions for SAFe product management domain.
 * Provides comprehensive types for product ownership and management.
 *
 * SINGLE RESPONSIBILITY: Type definitions for product management domain
 * FOCUSES ON: Product vision, lifecycle, customer segments, market analysis
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
// =============================================================================
// PRODUCT MANAGEMENT CONFIGURATION
// =============================================================================
/**
 * Product Management Manager configuration
 */
export interface ProductManagerConfig {
  readonly enableProductVisionManagement: 'ideation')validation')development')launch')growth')maturity')decline')sunset')critical')high')medium')low')nice_to_have')immediate')short_term')medium_term')long_term')future'))  CONTINUOUS = 'continuous')daily')weekly')monthly')quarterly')annually')sporadic')one_time')primary')secondary')tertiary')minimal')deal_breaker')major')moderate')minor')easily_addressed')premium' | ' competitive'|' budget')annual| quarterly| project_based' | ' continuous');
  readonly planningHorizon: number; // months
  readonly approvalProcess: string[];
  readonly budgetSize:  { min: number, max: number};
}
// =============================================================================
// MARKET OPPORTUNITY AND STRATEGY
// =============================================================================
/**
 * Market opportunity analysis
 */
export interface MarketOpportunity {
  readonly totalAddressableMarket: number;
  readonly serviceableAddressableMarket: number;
  readonly serviceableObtainableMarket: number;
  readonly marketGrowthRate: number; // percentage
  readonly competitiveLandscape: CompetitorAnalysis[];
  readonly marketTrends: MarketTrend[];
  readonly barriers: MarketBarrier[];
  readonly opportunities: MarketDriver[];
}
/**
 * Competitor analysis
 */
export interface CompetitorAnalysis {
  readonly name: string;
  readonly marketShare: number;
  readonly strengths: string[];
  readonly weaknesses: string[];
  readonly pricing: PricingStrategy;
  readonly customerSegments: string[];
  readonly recentMoves: string[];
}
/**
 * Market trend analysis
 */
export interface MarketTrend {
  readonly trend: string;
  readonly impact : 'positive' | ' negative'|' neutral') | ' medium'|' low')premium| competitive| penetration' | ' skimming')direct' | ' indirect'|' supporting');
}
/**
 * Stakeholder alignment tracking
 */
export interface StakeholderAlignment {
  readonly stakeholder: string;
  readonly alignmentLevel: number; // 0-100%
  readonly lastReviewed: Date;
  readonly concerns: string[];
  readonly supportLevel: |'champion| supporter| neutral| skeptic' | ' blocker')};
