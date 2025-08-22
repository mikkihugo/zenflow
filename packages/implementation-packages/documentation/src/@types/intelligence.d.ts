declare module '@claude-zen/intelligence' {
  export interface BrainCoordinator {
    store(key: string, data: any, category?: string): Promise<void>;
  }
}