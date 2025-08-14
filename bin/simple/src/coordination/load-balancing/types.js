export var AgentStatus;
(function (AgentStatus) {
    AgentStatus["HEALTHY"] = "healthy";
    AgentStatus["DEGRADED"] = "degraded";
    AgentStatus["UNHEALTHY"] = "unhealthy";
    AgentStatus["OFFLINE"] = "offline";
    AgentStatus["MAINTENANCE"] = "maintenance";
})(AgentStatus || (AgentStatus = {}));
export var TaskPriority;
(function (TaskPriority) {
    TaskPriority[TaskPriority["LOW"] = 1] = "LOW";
    TaskPriority[TaskPriority["NORMAL"] = 2] = "NORMAL";
    TaskPriority[TaskPriority["HIGH"] = 3] = "HIGH";
    TaskPriority[TaskPriority["CRITICAL"] = 4] = "CRITICAL";
    TaskPriority[TaskPriority["EMERGENCY"] = 5] = "EMERGENCY";
})(TaskPriority || (TaskPriority = {}));
export var LoadBalancingAlgorithm;
(function (LoadBalancingAlgorithm) {
    LoadBalancingAlgorithm["ROUND_ROBIN"] = "round_robin";
    LoadBalancingAlgorithm["WEIGHTED_ROUND_ROBIN"] = "weighted_round_robin";
    LoadBalancingAlgorithm["LEAST_CONNECTIONS"] = "least_connections";
    LoadBalancingAlgorithm["RESOURCE_AWARE"] = "resource_aware";
    LoadBalancingAlgorithm["ML_PREDICTIVE"] = "ml_predictive";
    LoadBalancingAlgorithm["ADAPTIVE_LEARNING"] = "adaptive_learning";
})(LoadBalancingAlgorithm || (LoadBalancingAlgorithm = {}));
//# sourceMappingURL=types.js.map