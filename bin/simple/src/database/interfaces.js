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
//# sourceMappingURL=interfaces.js.map