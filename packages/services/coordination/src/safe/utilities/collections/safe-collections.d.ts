/**
* @fileoverview SAFe Collections - Collection Operations
*
* Collection utilities using lodash-es for SAFe framework operations.
* Provides optimized array/object manipulations with consistent implementations.
*
* SINGLE RESPONSIBILITY: Collection operations for SAFe framework
* FOCUSES ON: Feature prioritization, epic filtering, backlog management
*
* @author Claude-Zen Team
* @since 1.0.0
* @version 1.0.0
*/
import { countBy, groupBy } from 'lodash-es';
export declare class SafeCollectionUtils {
/**
* Filter features by priority using lodash
*/
static filterByPriority<T extends {
priority: string;
'}>(items: T[], priorities: string[]): T[];
/**
* Sort epics by business value using lodash
*/
static sortByBusinessValue<T extends {
businessValue: number;
'}>(epics: T[]): T[];
/**
* Group features by ART using lodash
*/
static groupByART<T extends {
artId: groupBy;
(features: any, : any): any;
'}>(): any;
'}
/**
* SAFe portfolio and value stream utilities
*/
export declare class SafePortfolioUtils {
/**
* Calculate portfolio health metrics using lodash
*/
static calculatePortfolioMetrics<T extends {
status: countBy;
(portfolioItems: any, : any): any;
'}, const totalItems = portfolioItems.length, const healthScore = ((statusCount.green))>(): any;
'}
//# sourceMappingURL=safe-collections.d.ts.map