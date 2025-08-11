/**
 * Unified Data Access Layer (DAL) - Core Interfaces.
 *
 * Provides generic interfaces for standardizing data access across all data sources.
 * Including Kuzu (graph), LanceDB (vector), coordination databases, memory stores,
 * relational databases, and any other data persistence mechanisms.
 */
/**
 * Entity type enums for strongly typed entity management.
 */
export var EntityTypes;
(function (EntityTypes) {
    EntityTypes["User"] = "User";
    EntityTypes["Product"] = "Product";
    EntityTypes["Order"] = "Order";
    EntityTypes["Document"] = "Document";
    EntityTypes["Task"] = "Task";
    EntityTypes["Agent"] = "Agent";
    EntityTypes["Swarm"] = "Swarm";
    EntityTypes["Memory"] = "Memory";
    EntityTypes["Vector"] = "Vector";
    EntityTypes["Graph"] = "Graph";
})(EntityTypes || (EntityTypes = {}));
/**
 * Database type enums for database selection.
 */
export var DatabaseTypes;
(function (DatabaseTypes) {
    DatabaseTypes["PostgreSQL"] = "postgresql";
    DatabaseTypes["MySQL"] = "mysql";
    DatabaseTypes["SQLite"] = "sqlite";
    DatabaseTypes["MongoDB"] = "mongodb";
    DatabaseTypes["Redis"] = "redis";
    DatabaseTypes["Memory"] = "memory";
    DatabaseTypes["Kuzu"] = "kuzu";
    DatabaseTypes["LanceDB"] = "lancedb";
    DatabaseTypes["Coordination"] = "coordination";
})(DatabaseTypes || (DatabaseTypes = {}));
