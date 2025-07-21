#!/usr/bin/env node
"use strict";
/**
 * Hive Mind CLI Commands Index
 *
 * Main entry point for all Hive Mind CLI commands
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.psCommand = exports.resumeCommand = exports.pauseCommand = exports.stopCommand = exports.wizardCommand = exports.taskCommand = exports.statusCommand = exports.spawnCommand = exports.initCommand = exports.hiveMindCommand = void 0;
const commander_1 = require("commander");
const init_js_1 = require("./init.js");
Object.defineProperty(exports, "initCommand", { enumerable: true, get: function () { return init_js_1.initCommand; } });
const spawn_js_1 = require("./spawn.js");
Object.defineProperty(exports, "spawnCommand", { enumerable: true, get: function () { return spawn_js_1.spawnCommand; } });
const status_js_1 = require("./status.js");
Object.defineProperty(exports, "statusCommand", { enumerable: true, get: function () { return status_js_1.statusCommand; } });
const task_js_1 = require("./task.js");
Object.defineProperty(exports, "taskCommand", { enumerable: true, get: function () { return task_js_1.taskCommand; } });
const wizard_js_1 = require("./wizard.js");
Object.defineProperty(exports, "wizardCommand", { enumerable: true, get: function () { return wizard_js_1.wizardCommand; } });
const stop_js_1 = require("./stop.js");
Object.defineProperty(exports, "stopCommand", { enumerable: true, get: function () { return stop_js_1.stopCommand; } });
const pause_js_1 = require("./pause.js");
Object.defineProperty(exports, "pauseCommand", { enumerable: true, get: function () { return pause_js_1.pauseCommand; } });
const resume_js_1 = require("./resume.js");
Object.defineProperty(exports, "resumeCommand", { enumerable: true, get: function () { return resume_js_1.resumeCommand; } });
const ps_js_1 = require("./ps.js");
Object.defineProperty(exports, "psCommand", { enumerable: true, get: function () { return ps_js_1.psCommand; } });
exports.hiveMindCommand = new commander_1.Command('hive-mind')
    .description('Hive Mind collective intelligence swarm management')
    .addCommand(init_js_1.initCommand)
    .addCommand(spawn_js_1.spawnCommand)
    .addCommand(status_js_1.statusCommand)
    .addCommand(task_js_1.taskCommand)
    .addCommand(wizard_js_1.wizardCommand)
    .addCommand(stop_js_1.stopCommand)
    .addCommand(pause_js_1.pauseCommand)
    .addCommand(resume_js_1.resumeCommand)
    .addCommand(ps_js_1.psCommand);
