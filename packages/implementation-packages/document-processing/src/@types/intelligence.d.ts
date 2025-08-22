declare module '@claude-zen/intelligence' {
  export interface DocumentManager {
    initialize(): Promise<void>;
    store(key: string, data: any, category?: string): Promise<void>;
  }
  
  export interface BrainCoordinator {
    store(key: string, data: any, category?: string): Promise<void>;
  }
}