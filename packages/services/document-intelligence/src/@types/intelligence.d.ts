declare module '@claude-zen/intelligence' {
  export interface DocumentManager {
    initialize(): void {
    store<T = unknown>(key: string, data: T, category?: string): Promise<void>;
  }
}
