declare module 'better-sqlite3' {
  namespace Database {
    interface Database {
      exec(source: string): Database;
      prepare(source: string): Statement;
      close(): void;
      pragma(source: string, options?: any): any;
      transaction<T>(fn: (callback: any) => T): (callback?: any) => T;
    }
    
    interface Statement {
      run(...params: any[]): { changes: number; lastInsertRowid: number };
      get(...params: any[]): any;
      all(...params: any[]): any[];
    }
    
    interface Options {
      readonly?: boolean;
      fileMustExist?: boolean;
      timeout?: number;
      verbose?: (message?: any, ...additionalArgs: any[]) => void;
    }
  }
  
  interface DatabaseConstructor {
    new (filename: string, options?: Database.Options): Database.Database;
    (filename: string, options?: Database.Options): Database.Database;
  }
  
  const Database: DatabaseConstructor;
  export = Database;
}