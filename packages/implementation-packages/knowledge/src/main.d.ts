/**
 * @fileoverview Knowledge Package - Simplified Main Entry
 *
 * Simplified knowledge management system for the swarm system.
 * This provides basic functionality while maintaining the package structure.
 */
export interface KnowledgeItem {
  id: string;
  content: string;
  type: 'fact|rule|pattern|insight';
  confidence: number;
  timestamp: number;
}
export interface KnowledgeStore {
  items: Map<string, KnowledgeItem>;
  add(item: KnowledgeItem): void;
  get(id: string): KnowledgeItem|undefined;
  query(type?: string): KnowledgeItem[];
}
export declare class SimpleKnowledgeStore implements KnowledgeStore {
  items: Map<string, KnowledgeItem>;
  add(item: KnowledgeItem): void;
  get(id: string): KnowledgeItem|undefined;
  query(type?: string): KnowledgeItem[];
}
export interface KnowledgeManager {
  store: KnowledgeStore;
  addKnowledge(
    content: string,
    type: KnowledgeItem['type'],
    confidence?: number
  ): string;
  getKnowledge(id: string): KnowledgeItem|undefined;
  queryKnowledge(type?: string): KnowledgeItem[];
}
export declare class BasicKnowledgeManager implements KnowledgeManager {
  store: KnowledgeStore;
  constructor(store?: KnowledgeStore);
  addKnowledge(
    content: string,
    type: KnowledgeItem['type'],
    confidence?: number
  ): string;
  getKnowledge(id: string): KnowledgeItem | undefined;
  queryKnowledge(type?: string): KnowledgeItem[];
}
export default BasicKnowledgeManager;
//# sourceMappingURL=main.d.ts.map
