/**
* @file Private Fact System - Knowledge Package Implementation
*
* Private fact system within the knowledge package that provides coordination
* layer integration. This encapsulates fact storage and retrieval within
* the knowledge domain, using the core fact engine.
*
* This system is PRIVATE to the knowledge package and should only be accessed
* through the knowledge package's public API.; */
interface FactClient {
initialize():Promise<void>;
store(
id:string,
data:{
content:unknown;
metadata:Record<string, unknown>;
}
):Promise<void>;
search(query:{
query:string;
sources?:string[];
limit?:number;
}):Promise<FactSearchResult[]>;
getNPMPackage?(packageName:string, version?:string): Promise<unknown>;
getGitHubRepository?(owner:string, repo:string): Promise<unknown>;
}
export interface FactSearchResult {
id:string;
content:unknown;
metadata:Record<string, unknown>;
score?:number;
}
/**
* Coordination-specific fact entry structure (simplified for coordination layer)
*/
export interface CoordinationFact {
id:string;
type:string;
data:unknown;
timestamp:Date;
source:string;
confidence:number;
tags:string[];
}
/**
* Coordination fact query interface (simplified for coordination layer)
*/
export interface CoordinationFactQuery {
type?:string;
tags?:string[];
source?:string;
minConfidence?:number;
limit?:number;
}
/**
* Private fact system implementation within the knowledge package.
* This class should NOT be exported from the knowledge package's main API.; */
declare class KnowledgeFactSystem {
private factClient;
private factBridge;
private listeners;
private coordinationFacts;
private initialized;
constructor();
/**
* Initialize the fact system using Rust fact bridge
*/
initialize():Promise<void>;
/**
* Store a coordination-specific fact
*/
storeFact(fact:Omit<CoordinationFact, 'id|timestamp''>):Promise<string>; /**
* Retrieve facts based on query
*/
queryFacts(query?:CoordinationFactQuery): Promise<CoordinationFact[]>;
/**
* Get a specific fact by ID
*/
getFact(id:string): Promise<CoordinationFact | null>;
/**
* Search facts with text-based query (for compatibility with legacy code)
*/
searchFacts(searchParams:{
query:string;
type?:string;
limit?:number;
}):Promise<CoordinationFact[]>;
/**
* Search external facts using Rust fact bridge (with foundation fallback)
*/
searchExternalFacts(
query:string,
sources?:string[],
limit?:number
):Promise<FactSearchResult[]>;
/**
* Subscribe to fact changes
*/
subscribe(listener:(fact: CoordinationFact) => void): () => void;
/**
* Clear coordination facts
*/
clear():Promise<void>;
/**
* Check if the fact system is initialized
*/
isInitialized():boolean;
/**
* Get NPM package information via high-performance Rust fact bridge
*/
getNPMPackageInfo(packageName:string, version?:string): Promise<unknown>;
/**
* Get GitHub repository information via high-performance Rust fact bridge
*/
getGitHubRepoInfo(owner:string, repo:string): Promise<unknown>;
/**
* Get foundation fact client for advanced operations (internal use only)
*/
getFoundationFactClient():FactClient | null;
/**
* Get coordination system statistics
*/
getStats():{
totalFacts:number;
factsByType:Record<string, number>;
factsBySource:Record<string, number>;
averageConfidence:number;
};
private ensureInitialized;
/**
* Notify listeners of new facts
*/
private notifyListeners;
}
declare const knowledgeFactSystem:KnowledgeFactSystem;
export { knowledgeFactSystem};
//# sourceMappingURL=fact-system.d.ts.map
