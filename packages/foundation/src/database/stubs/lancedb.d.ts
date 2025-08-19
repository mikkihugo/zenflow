declare module '@lancedb/lancedb' {
  export interface Database {
    createTable(name: string, data: any[], mode?: string): Promise<Table>;
    openTable(name: string): Promise<Table>;
    dropTable(name: string): Promise<void>;
  }
  
  export interface Table {
    add(data: any[]): Promise<void>;
    search(vector: number[]): VectorQuery;
    countRows(): Promise<number>;
    delete(filter: string): Promise<void>;
    createIndex(columnName: string, options: any): Promise<void>;
    schema: any;
  }
  
  export interface VectorQuery {
    select(columns: string[]): VectorQuery;
    where(filter: string): VectorQuery;
    limit(n: number): VectorQuery;
    toArray(): Promise<any[]>;
  }
  
  export interface Connection {
    createTable(name: string, data: any[], options?: any): Promise<Table>;
    openTable(name: string): Promise<Table>;
    dropTable(name: string): Promise<void>;
    tableNames(): Promise<string[]>;
    query(sql: string): Promise<any[]>;
    close(): void;
  }
  
  export function connect(uri: string): Promise<Connection>;
}