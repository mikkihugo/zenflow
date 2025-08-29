declare module '@claude-zen/intelligence' {
  export interface DocumentManager {
    initialize(): Promise<void>;
    store<T = unknown>(key: string, data: T, category?: string): Promise<void>;
  }

  export interface BrainCoordinator {
    store<T = unknown>(key: string, data: T, category?: string): Promise<void>;
  }
}
