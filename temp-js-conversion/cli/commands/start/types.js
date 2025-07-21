"use strict";
/**
 * Type definitions for the start command module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessStatus = exports.ProcessType = void 0;
var ProcessType;
(function (ProcessType) {
    ProcessType["ORCHESTRATOR"] = "orchestrator";
    ProcessType["MCP_SERVER"] = "mcp-server";
    ProcessType["MEMORY_MANAGER"] = "memory-manager";
    ProcessType["TERMINAL_POOL"] = "terminal-pool";
    ProcessType["COORDINATOR"] = "coordinator";
    ProcessType["EVENT_BUS"] = "event-bus";
})(ProcessType || (exports.ProcessType = ProcessType = {}));
var ProcessStatus;
(function (ProcessStatus) {
    ProcessStatus["STOPPED"] = "stopped";
    ProcessStatus["STARTING"] = "starting";
    ProcessStatus["RUNNING"] = "running";
    ProcessStatus["STOPPING"] = "stopping";
    ProcessStatus["ERROR"] = "error";
    ProcessStatus["CRASHED"] = "crashed";
})(ProcessStatus || (exports.ProcessStatus = ProcessStatus = {}));
