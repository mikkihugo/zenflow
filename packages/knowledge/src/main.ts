/**
 * @fileoverview Knowledge Package - Simplified Main Entry
 * 
 * Simplified knowledge management system for the swarm system.
 * This provides basic functionality while maintaining the package structure.
 */

export interface KnowledgeItem {
  id: string;
  content: string;
  type: 'fact' | 'rule' | 'pattern' | 'insight';
  confidence: number;
  timestamp: number;
}

export interface KnowledgeStore {
  items: Map<string, KnowledgeItem>;
  add(item: KnowledgeItem): void;
  get(id: string): KnowledgeItem | undefined;
  query(type?: string): KnowledgeItem[];
}

export class SimpleKnowledgeStore implements KnowledgeStore {
  items = new Map<string, KnowledgeItem>();

  add(item: KnowledgeItem): void {
    this.items.set(item.id, item);
  }

  get(id: string): KnowledgeItem | undefined {
    return this.items.get(id);
  }

  query(type?: string): KnowledgeItem[] {
    const allItems = Array.from(this.items.values());
    if (type) {
      return allItems.filter(item => item.type === type);
    }
    return allItems;
  }
}

export interface KnowledgeManager {
  store: KnowledgeStore;
  addKnowledge(content: string, type: KnowledgeItem['type'], confidence?: number): string;
  getKnowledge(id: string): KnowledgeItem | undefined;
  queryKnowledge(type?: string): KnowledgeItem[];
}

export class BasicKnowledgeManager implements KnowledgeManager {
  store: KnowledgeStore;

  constructor(store?: KnowledgeStore) {
    this.store = store || new SimpleKnowledgeStore();
  }

  addKnowledge(content: string, type: KnowledgeItem['type'], confidence = 0.8): string {
    const id = `knowledge-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const item: KnowledgeItem = {
      id,
      content,
      type,
      confidence,
      timestamp: Date.now()
    };
    this.store.add(item);
    return id;
  }

  getKnowledge(id: string): KnowledgeItem | undefined {
    return this.store.get(id);
  }

  queryKnowledge(type?: string): KnowledgeItem[] {
    return this.store.query(type);
  }
}

// Default export for simple usage
export default BasicKnowledgeManager;