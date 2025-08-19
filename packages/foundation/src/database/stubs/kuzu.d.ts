declare module 'kuzu' {
  export interface Database {
    close(): void;
  }
  
  export interface Connection {
    query(cypher: string): QueryResult;
    close(): void;
  }
  
  export interface QueryResult {
    hasNext(): boolean;
    getNext(): any[];
    getColumnNames(): string[];
    getColumnDataTypes(): string[];
    close(): void;
  }
  
  export class Database {
    constructor(databasePath: string);
    close(): void;
  }
  
  export class Connection {
    constructor(database: Database);
    query(cypher: string): QueryResult;
    close(): void;
  }
}