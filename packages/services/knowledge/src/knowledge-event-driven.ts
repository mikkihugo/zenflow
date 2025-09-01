/**
* @fileoverview Knowledge Service Implementation - 100% Event-Driven
*
* ZERO IMPORTS - Pure event-based knowledge management system
* Listens to brain events and responds with knowledge data via events only
*/

// =============================================================================
// INTERNAL LOGGER (NO FOUNDATION IMPORTS)
// =============================================================================

const createLogger = (name: string) => ({
  info: (message: string, meta?: unknown) => {
    // Internal logging - replaced console.log
    void message;
    void meta;
    void name;
  },
  debug: (message: string, meta?: unknown) => {
    // Internal logging - replaced console.log
    void message;
    void meta;
    void name;
  },
  warn: (message: string, meta?: unknown) => {
    // Internal logging - replaced console.warn
    void message;
    void meta;
    void name;
  },
  error: (message: string, meta?: unknown) => {
    // Internal logging - replaced console.error
    void message;
    void meta;
    void name;
  },
});

// =============================================================================
// EVENT INTERFACES - NO IMPORTS
// =============================================================================

interface KnowledgeEvents {
// Brain requests
'brain:knowledge:store-item': {
requestId:string;
item:KnowledgeItemInput;
timestamp:number;
};
'brain:knowledge:get-item': {
requestId:string;
itemId:string;
timestamp:number;
};
'brain:knowledge:query-items': {
requestId:string;
query:KnowledgeQuery;
timestamp:number;
};
'brain:knowledge:update-item': {
requestId:string;
itemId:string;
updates:Partial<KnowledgeItem>;
timestamp:number;
};
'brain:knowledge:delete-item': {
requestId:string;
itemId:string;
timestamp:number;
};
'brain:knowledge:get-stats': {
requestId:string;
timestamp:number;
};
'brain:knowledge:search': {
requestId:string;
searchText:string;
options?:SearchOptions;
timestamp:number;
};
'brain:knowledge:initialize': {
requestId:string;
config?:KnowledgeConfig;
timestamp:number;
};

// Knowledge responses
'knowledge:item-stored': {
requestId:string;
itemId:string;
success:boolean;
timestamp:number;
};
  'knowledge:item': {
    requestId: string;
    item: KnowledgeItem | null;
    timestamp: number;
  };
'knowledge:query-results': {
requestId:string;
items:KnowledgeItem[];
totalCount:number;
timestamp:number;
};
'knowledge:item-updated': {
requestId:string;
itemId:string;
success:boolean;
timestamp:number;
};
'knowledge:item-deleted': {
requestId:string;
itemId:string;
success:boolean;
timestamp:number;
};
'knowledge:stats': {
requestId:string;
stats:KnowledgeStats;
timestamp:number;
};
'knowledge:search-results': {
requestId:string;
results:SearchResult[];
timestamp:number;
};
'knowledge:initialized': {
requestId:string;
success:boolean;
timestamp:number;
};
'knowledge:error': {
requestId:string;
error:string;
timestamp:number;
};

// Database events (replace database imports)
'database:store-knowledge': {
collection:string;
key:string;
data:any;
timestamp:number;
};
'database:get-knowledge': {
collection:string;
key:string;
timestamp:number;
};
'database:query-knowledge': {
collection:string;
query:any;
timestamp:number;
};
'database:delete-knowledge': {
collection:string;
key:string;
timestamp:number;
};
}

// =============================================================================
// TYPE DEFINITIONS - NO IMPORTS
// =============================================================================

interface KnowledgeItem {
id:string;
content:string;
  type: 'fact' | 'rule' | 'pattern' | 'insight' | 'procedure' | 'concept';
confidence:number;
timestamp:number;
source?:string;
metadata?:Record<string, unknown>;
tags?:string[];
relatedItems?:string[];
version:number;
isActive:boolean;
}

interface KnowledgeItemInput {
content:string;
type:KnowledgeItem['type'];
confidence:number;
source?:string;
metadata?:Record<string, unknown>;
tags?:string[];
relatedItems?:string[];
}

interface KnowledgeQuery {
type?:KnowledgeItem['type'];
tags?:string[];
confidenceMin?:number;
contentSearch?:string;
limit?:number;
offset?:number;
}

interface SearchOptions {
type?:KnowledgeItem['type'];
confidenceMin?:number;
limit?:number;
}

interface SearchResult {
item:KnowledgeItem;
relevanceScore:number;
matches:string[];
}

interface KnowledgeStats {
totalItems:number;
itemsByType:Record<KnowledgeItem['type'], number>;
averageConfidence:number;
lastUpdated:number;
  storageHealth: 'healthy' | 'degraded' | 'unhealthy';
}

interface KnowledgeConfig {
enableCaching?:boolean;
cacheSize?:number;
enableSearch?:boolean;
searchIndexing?:boolean;
retentionDays?:number;
maxItemSize?:number;
}

// =============================================================================
// EVENT-DRIVEN KNOWLEDGE SERVICE - ZERO IMPORTS
// =============================================================================

export class EventDrivenKnowledgeService {
private eventListeners:Map<string, Function[]> = new Map();
  private logger = createLogger('EventDrivenKnowledgeService');
  private config: KnowledgeConfig;
private initialized = false;
private knowledgeItems = new Map<string, KnowledgeItem>();
private searchIndex = new Map<string, Set<string>>(); // word -> item IDs
private tagIndex = new Map<string, Set<string>>(); // tag -> item IDs

constructor() {
// Default config - no foundation imports
this.config = {
enableCaching:true,
cacheSize:10000,
enableSearch:true,
searchIndexing:true,
retentionDays:365,
maxItemSize:1024 * 1024, // 1MB
};
}

// =============================================================================
// EVENT SYSTEM - NO EXTERNAL IMPORTS
// =============================================================================

addEventListener<K extends keyof KnowledgeEvents>(
event:K,
listener:(data: KnowledgeEvents[K]) => void
):void {
if (!this.eventListeners.has(event)) {
this.eventListeners.set(event, []);
}
this.eventListeners.get(event)!.push(listener);
}

private emitEvent<K extends keyof KnowledgeEvents>(
event:K,
data:KnowledgeEvents[K]
):void {
const listeners = this.eventListeners.get(event) || [];
for (const listener of listeners) {
try {
listener(data);
} catch (error) {
this.logger.error(`Event listener error for ${event}`, {
error:error instanceof Error ? error.message : String(error)
});
}
}
}

// =============================================================================
// BRAIN EVENT HANDLERS
// =============================================================================

private setupBrainEventHandlers():void {
// Handle brain initialization requests
this.addEventListener(`brain:knowledge:initialize`, async (data) => {
try {
if (data.config) {
this.config = { ...this.config, ...data.config};
}
await this.initializeInternal();
this.emitEvent('knowledge:initialized', {
requestId:data.requestId,
success:true,
timestamp:Date.now(),
});
} catch (error) {
this.emitEvent('knowledge:initialized', {
requestId:data.requestId,
success:false,
timestamp:Date.now(),
});
this.emitEvent('knowledge:error', {
requestId:data.requestId,
error:error instanceof Error ? error.message : String(error),
timestamp:Date.now(),
});
}
});

// Handle store item requests
this.addEventListener('brain:knowledge:store-item', async (data) => {
try {
const itemId = await this.storeItemInternal(data.item);
this.emitEvent('knowledge:item-stored', {
requestId:data.requestId,
itemId,
success:true,
timestamp:Date.now(),
});
} catch (error) {
this.emitEvent('knowledge:item-stored', {
requestId:data.requestId,
    itemId: '',
    success: false,
timestamp:Date.now(),
});
this.emitEvent('knowledge:error', {
requestId:data.requestId,
error:error instanceof Error ? error.message : String(error),
timestamp:Date.now(),
});
}
});

// Handle get item requests
this.addEventListener('brain:knowledge:get-item', async (data) => {
try {
const item = await this.getItemInternal(data.itemId);
this.emitEvent('knowledge:item', {
requestId:data.requestId,
item,
timestamp:Date.now(),
});
} catch (error) {
this.emitEvent('knowledge:error', {
requestId:data.requestId,
error:error instanceof Error ? error.message : String(error),
timestamp:Date.now(),
});
}
});

// Handle query items requests
this.addEventListener('brain:knowledge:query-items', async (data) => {
try {
const { items, totalCount} = await this.queryItemsInternal(data.query);
this.emitEvent('knowledge:query-results', {
requestId:data.requestId,
items,
totalCount,
timestamp:Date.now(),
});
} catch (error) {
this.emitEvent('knowledge:error', {
requestId:data.requestId,
error:error instanceof Error ? error.message : String(error),
timestamp:Date.now(),
});
}
});

// Handle update item requests
this.addEventListener('brain:knowledge:update-item', async (data) => {
try {
const success = await this.updateItemInternal(data.itemId, data.updates);
this.emitEvent('knowledge:item-updated', {
requestId:data.requestId,
itemId:data.itemId,
success,
timestamp:Date.now(),
});
} catch (error) {
this.emitEvent('knowledge:item-updated', {
requestId:data.requestId,
itemId:data.itemId,
success:false,
timestamp:Date.now(),
});
this.emitEvent('knowledge:error', {
requestId:data.requestId,
error:error instanceof Error ? error.message : String(error),
timestamp:Date.now(),
});
}
});

// Handle delete item requests
this.addEventListener('brain:knowledge:delete-item', async (data) => {
try {
const success = await this.deleteItemInternal(data.itemId);
this.emitEvent('knowledge:item-deleted', {
requestId:data.requestId,
itemId:data.itemId,
success,
timestamp:Date.now(),
});
} catch (error) {
this.emitEvent('knowledge:item-deleted', {
requestId:data.requestId,
itemId:data.itemId,
success:false,
timestamp:Date.now(),
});
this.emitEvent('knowledge:error', {
requestId:data.requestId,
error:error instanceof Error ? error.message : String(error),
timestamp:Date.now(),
});
}
});

// Handle stats requests
this.addEventListener('brain:knowledge:get-stats', async (data) => {
try {
    const stats = await this.getStatsInternal();
    this.emitEvent('knowledge:stats', {
      requestId: data.requestId,
      stats,
      timestamp: Date.now(),
    });
} catch (error) {
this.emitEvent('knowledge:error', {
requestId:data.requestId,
error:error instanceof Error ? error.message : String(error),
timestamp:Date.now(),
});
}
});

// Handle search requests
this.addEventListener('brain:knowledge:search', async (data) => {
try {
const results = await this.searchInternal(data.searchText, data.options);
this.emitEvent('knowledge:search-results', {
requestId:data.requestId,
results,
timestamp:Date.now(),
});
} catch (error) {
this.emitEvent('knowledge:error', {
requestId:data.requestId,
error:error instanceof Error ? error.message : String(error),
timestamp:Date.now(),
});
}
});
}

// =============================================================================
// INTERNAL KNOWLEDGE LOGIC - NO IMPORTS
// =============================================================================

private async initializeInternal():Promise<void> {
if (this.initialized) return;

this.logger.info(`Event-driven knowledge service initialized`, { config:this.config});
this.initialized = true;
}

private generateId():string {
// Simple ID generation without UUID imports
return `knowledge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

private async storeItemInternal(itemInput:KnowledgeItemInput): Promise<string> {
const itemId = this.generateId();

const item:KnowledgeItem = {
id:itemId,
content:itemInput.content,
type:itemInput.type,
confidence:Math.max(0, Math.min(1, itemInput.confidence)), // Clamp to 0-1
timestamp:Date.now(),
source:itemInput.source,
metadata:itemInput.metadata,
tags:itemInput.tags || [],
relatedItems:itemInput.relatedItems || [],
version:1,
isActive:true,
};

// Store in memory (would use database events in production)
this.knowledgeItems.set(itemId, item);

// Update search index
if (this.config.searchIndexing) {
this.updateSearchIndex(item);
}

// Update tag index
if (item.tags) {
for (const tag of item.tags) {
if (!this.tagIndex.has(tag)) {
this.tagIndex.set(tag, new Set());
}
this.tagIndex.get(tag)!.add(itemId);
}
}

this.logger.debug(`Knowledge item stored`, { itemId, type:item.type, confidence:item.confidence});
return itemId;
}

private async getItemInternal(itemId:string): Promise<KnowledgeItem | null> {
const item = this.knowledgeItems.get(itemId);
return item && item.isActive ? item:null;
}

private async queryItemsInternal(query:KnowledgeQuery): Promise<{ items: KnowledgeItem[]; totalCount: number}> {
let filteredItems = Array.from(this.knowledgeItems.values())
.filter(item => item.isActive);

// Apply type filter
if (query.type) {
filteredItems = filteredItems.filter(item => item.type === query.type);
}

// Apply confidence filter
if (query.confidenceMin !== undefined) {
filteredItems = filteredItems.filter(item => item.confidence >= query.confidenceMin!);
}

// Apply tag filter
if (query.tags && query.tags.length > 0) {
filteredItems = filteredItems.filter(item => item.tags && query.tags!.some(tag => item.tags!.includes(tag)));
}

// Apply content search
if (query.contentSearch) {
const searchTerm = query.contentSearch.toLowerCase();
filteredItems = filteredItems.filter(item =>
item.content.toLowerCase().includes(searchTerm)
);
}

// Sort by confidence descending, then by timestamp descending
filteredItems.sort((a, b) => {
if (a.confidence !== b.confidence) {
return b.confidence - a.confidence;
}
return b.timestamp - a.timestamp;
});

const totalCount = filteredItems.length;

// Apply pagination
const offset = query.offset || 0;
const limit = query.limit || 50;
const items = filteredItems.slice(offset, offset + limit);

return { items, totalCount};
}

private async updateItemInternal(itemId:string, updates:Partial<KnowledgeItem>): Promise<boolean> {
const item = this.knowledgeItems.get(itemId);
if (!item || !item.isActive) {
return false;
}

// Remove from old indexes before updating
if (this.config.searchIndexing) {
this.removeFromSearchIndex(item);
}
if (item.tags) {
for (const tag of item.tags) {
const tagSet = this.tagIndex.get(tag);
if (tagSet) {
tagSet.delete(itemId);
}
}
}

// Update item
const updatedItem:KnowledgeItem = {
...item,
...updates,
id:itemId, // Ensure ID doesn't change
version:item.version + 1,
timestamp:Date.now(), // Update timestamp
};

this.knowledgeItems.set(itemId, updatedItem);

// Update indexes with new data
if (this.config.searchIndexing) {
this.updateSearchIndex(updatedItem);
}
if (updatedItem.tags) {
for (const tag of updatedItem.tags) {
if (!this.tagIndex.has(tag)) {
this.tagIndex.set(tag, new Set());
}
this.tagIndex.get(tag)!.add(itemId);
}
}

this.logger.debug('Knowledge item updated', { itemId, version:updatedItem.version});
return true;
}

private async deleteItemInternal(itemId:string): Promise<boolean> {
const item = this.knowledgeItems.get(itemId);
if (!item) {
return false;
}

// Soft delete - mark as inactive
item.isActive = false;
item.version += 1;
item.timestamp = Date.now();

// Remove from indexes
if (this.config.searchIndexing) {
this.removeFromSearchIndex(item);
}
if (item.tags) {
for (const tag of item.tags) {
const tagSet = this.tagIndex.get(tag);
if (tagSet) {
tagSet.delete(itemId);
}
}
}

this.logger.debug('Knowledge item deleted (soft)', { itemId});
return true;
}

private async getStatsInternal():Promise<KnowledgeStats> {
const activeItems = Array.from(this.knowledgeItems.values())
.filter(item => item.isActive);

const itemsByType:Record<KnowledgeItem['type'], number> = {
fact:0,
rule:0,
pattern:0,
insight:0,
procedure:0,
concept:0,
};

let totalConfidence = 0;
let latestTimestamp = 0;

for (const item of activeItems) {
itemsByType[item.type]++;
totalConfidence += item.confidence;
latestTimestamp = Math.max(latestTimestamp, item.timestamp);
}

const averageConfidence = activeItems.length > 0 ? totalConfidence / activeItems.length:0;

// Simple storage health calculation
const storageHealth: KnowledgeStats['storageHealth'] =
  activeItems.length > 10000 ? 'degraded' :
  activeItems.length > 0 ? 'healthy' : 'unhealthy';

return {
totalItems:activeItems.length,
itemsByType,
averageConfidence,
lastUpdated:latestTimestamp || Date.now(),
storageHealth,
};
}

private async searchInternal(searchText:string, options?:SearchOptions): Promise<SearchResult[]> {
if (!this.config.enableSearch) {
return [];
}

const searchTerms = searchText.toLowerCase().split(/\s+/).filter(term => term.length > 0);
const results:SearchResult[] = [];

// Get all active items
let candidates = Array.from(this.knowledgeItems.values())
.filter(item => item.isActive);

// Apply type filter if specified
if (options?.type) {
candidates = candidates.filter(item => item.type === options.type);
}

// Apply confidence filter if specified
if (options?.confidenceMin !== undefined) {
candidates = candidates.filter(item => item.confidence >= options.confidenceMin!);
}

// Score each candidate
for (const item of candidates) {
const matches:string[] = [];
let relevanceScore = 0;

// Check content matches
const content = item.content.toLowerCase();
for (const term of searchTerms) {
  if (content.includes(term)) {
    matches.push(`content:${term}`);
    relevanceScore += 1;
  }
}

// Check tag matches
if (item.tags) {
  for (const tag of item.tags) {
    const tagLower = tag.toLowerCase();
    for (const term of searchTerms) {
      if (tagLower.includes(term)) {
        matches.push(`tag:${tag}`);
        relevanceScore += 0.5;
      }
    }
  }
}

// Boost score based on confidence
relevanceScore *= item.confidence;

// Only include items with matches
if (matches.length > 0) {
results.push({
item,
relevanceScore,
matches,
});
}
}

// Sort by relevance score descending
results.sort((a, b) => b.relevanceScore - a.relevanceScore);

// Apply limit
const limit = options?.limit || 20;
return results.slice(0, limit);
}

private updateSearchIndex(item:KnowledgeItem): void {
const words = item.content.toLowerCase().split(/\W+/).filter(word => word.length > 2);
for (const word of words) {
if (!this.searchIndex.has(word)) {
this.searchIndex.set(word, new Set());
}
this.searchIndex.get(word)!.add(item.id);
}
}

private removeFromSearchIndex(item:KnowledgeItem): void {
const words = item.content.toLowerCase().split(/\W+/).filter(word => word.length > 2);
for (const word of words) {
const wordSet = this.searchIndex.get(word);
if (wordSet) {
wordSet.delete(item.id);
if (wordSet.size === 0) {
this.searchIndex.delete(word);
}
}
}
}

// =============================================================================
// INITIALIZATION
// =============================================================================

  async initialize(): Promise<void> {
    this.setupBrainEventHandlers();
    this.logger.info('Event-driven knowledge service ready to receive brain events');
  }

  async shutdown(): Promise<void> {
    this.knowledgeItems.clear();
    this.searchIndex.clear();
    this.tagIndex.clear();
    this.eventListeners.clear();
    this.initialized = false;
    this.logger.info('Event-driven knowledge service shutdown complete');
  }
}

// =============================================================================
// FACTORY AND EXPORTS
// =============================================================================

export function createEventDrivenKnowledgeService():EventDrivenKnowledgeService {
return new EventDrivenKnowledgeService();
}

export default EventDrivenKnowledgeService;