"use strict";
/**
 * AGUI Interfaces - Self-contained interface definitions
 * Copied from /src/interfaces/agui/ to make package self-contained
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeadlessAGUI = exports.WebAGUI = void 0;
exports.createAGUI = createAGUI;
var foundation_1 = require("@claude-zen/foundation");
var foundation_2 = require("@claude-zen/foundation");
var logger = (0, foundation_2.getLogger)('AGUIAdapter');
/**
 * Web-based AGUI implementation for browser environments.
 */
var WebAGUI = /** @class */ (function (_super) {
    __extends(WebAGUI, _super);
    function WebAGUI(containerSelector) {
        var _this = _super.call(this) || this;
        _this.container = null;
        if (typeof window !== 'undefined') {
            _this.container = containerSelector
                ? document.querySelector(containerSelector)
                : document.body;
        }
        return _this;
    }
    WebAGUI.prototype.askQuestion = function (question) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        var _a, _b;
                        if (!_this.container) {
                            logger.warn('WebAGUI: No container available, returning default response');
                            resolve('Yes');
                            return;
                        }
                        // Create question modal
                        var modal = document.createElement('div');
                        modal.className = 'agui-modal';
                        modal.innerHTML = "\n        <div class=\"agui-modal-content\">\n          <h3>".concat(question.type.toUpperCase(), " Question</h3>\n          <p>").concat(question.question, "</p>\n          ").concat(question.options ? "\n            <div class=\"agui-options\">\n              ".concat(question.options.map(function (opt, idx) {
                            return "<button class=\"agui-option\" data-value=\"".concat(opt, "\">").concat(opt, "</button>");
                        }).join(''), "\n            </div>\n          ") : "\n            <input type=\"text\" class=\"agui-input\" placeholder=\"Enter your response\">\n          ", "\n          <div class=\"agui-actions\">\n            <button class=\"agui-submit\">Submit</button>\n            <button class=\"agui-cancel\">Cancel</button>\n          </div>\n        </div>\n      ");
                        _this.container.appendChild(modal);
                        // Handle responses
                        var handleResponse = function (value) {
                            var _a;
                            (_a = _this.container) === null || _a === void 0 ? void 0 : _a.removeChild(modal);
                            resolve(value);
                        };
                        // Option buttons
                        modal.querySelectorAll('.agui-option').forEach(function (btn) {
                            btn.addEventListener('click', function () {
                                var value = btn.dataset.value || '';
                                handleResponse(value);
                            });
                        });
                        // Submit button
                        (_a = modal.querySelector('.agui-submit')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function () {
                            var input = modal.querySelector('.agui-input');
                            var value = input ? input.value : 'Yes';
                            handleResponse(value);
                        });
                        // Cancel button
                        (_b = modal.querySelector('.agui-cancel')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', function () {
                            handleResponse('Cancel');
                        });
                    })];
            });
        });
    };
    WebAGUI.prototype.askBatchQuestions = function (questions) {
        return __awaiter(this, void 0, void 0, function () {
            var answers, _i, questions_1, question, answer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        answers = [];
                        _i = 0, questions_1 = questions;
                        _a.label = 1;
                    case 1:
                        if (!(_i < questions_1.length)) return [3 /*break*/, 4];
                        question = questions_1[_i];
                        return [4 /*yield*/, this.askQuestion(question)];
                    case 2:
                        answer = _a.sent();
                        answers.push(answer);
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, answers];
                }
            });
        });
    };
    WebAGUI.prototype.showProgress = function (progress) {
        return __awaiter(this, void 0, void 0, function () {
            var progressElement, prog, percentage;
            return __generator(this, function (_a) {
                if (!this.container)
                    return [2 /*return*/];
                progressElement = this.container.querySelector('.agui-progress');
                if (!progressElement) {
                    progressElement = document.createElement('div');
                    progressElement.className = 'agui-progress';
                    this.container.appendChild(progressElement);
                }
                if (typeof progress === 'object' && progress !== null) {
                    prog = progress;
                    if (prog.current !== undefined && prog.total !== undefined) {
                        percentage = Math.round((prog.current / prog.total) * 100);
                        progressElement.innerHTML = "\n          <div class=\"progress-bar\">\n            <div class=\"progress-fill\" style=\"width: ".concat(percentage, "%\"></div>\n          </div>\n          <div class=\"progress-text\">").concat(prog.current, "/").concat(prog.total, " (").concat(percentage, "%)</div>\n          ").concat(prog.description ? "<div class=\"progress-description\">".concat(prog.description, "</div>") : '', "\n        ");
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    WebAGUI.prototype.showMessage = function (message_1) {
        return __awaiter(this, arguments, void 0, function (message, type) {
            var messageElement;
            var _this = this;
            if (type === void 0) { type = 'info'; }
            return __generator(this, function (_a) {
                if (!this.container) {
                    console.log("[".concat(type.toUpperCase(), "] ").concat(message));
                    return [2 /*return*/];
                }
                messageElement = document.createElement('div');
                messageElement.className = "agui-message agui-message-".concat(type);
                messageElement.textContent = message;
                this.container.appendChild(messageElement);
                // Auto-remove after 5 seconds
                setTimeout(function () {
                    var _a;
                    if ((_a = _this.container) === null || _a === void 0 ? void 0 : _a.contains(messageElement)) {
                        _this.container.removeChild(messageElement);
                    }
                }, 5000);
                return [2 /*return*/];
            });
        });
    };
    WebAGUI.prototype.showInfo = function (title, data) {
        return __awaiter(this, void 0, void 0, function () {
            var infoElement;
            return __generator(this, function (_a) {
                if (!this.container)
                    return [2 /*return*/];
                infoElement = document.createElement('div');
                infoElement.className = 'agui-info';
                infoElement.innerHTML = "\n      <h3>".concat(title, "</h3>\n      <pre>").concat(JSON.stringify(data, null, 2), "</pre>\n    ");
                this.container.appendChild(infoElement);
                return [2 /*return*/];
            });
        });
    };
    WebAGUI.prototype.clear = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.container) {
                    this.container.innerHTML = '';
                }
                return [2 /*return*/];
            });
        });
    };
    WebAGUI.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Cleanup event listeners and DOM elements
                this.removeAllListeners();
                return [2 /*return*/];
            });
        });
    };
    return WebAGUI;
}(foundation_1.TypedEventBase));
exports.WebAGUI = WebAGUI;
/**
 * Headless AGUI for server-side and automated environments.
 * Provides automatic responses without UI components.
 */
var HeadlessAGUI = /** @class */ (function () {
    function HeadlessAGUI() {
        this.responses = new Map();
        this.defaultResponse = 'Yes';
    }
    HeadlessAGUI.prototype.setResponse = function (questionId, response) {
        this.responses.set(questionId, response);
    };
    HeadlessAGUI.prototype.setDefaultResponse = function (response) {
        this.defaultResponse = response;
    };
    HeadlessAGUI.prototype.askQuestion = function (question) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                logger.debug('Headless AGUI Question:', question);
                response = this.responses.get(question.id) || this.defaultResponse;
                return [2 /*return*/, response];
            });
        });
    };
    HeadlessAGUI.prototype.askBatchQuestions = function (questions) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                logger.debug("Headless AGUI Batch: ".concat(questions.length, " questions"));
                return [2 /*return*/, questions.map(function (q) { return _this.responses.get(q.id) || _this.defaultResponse; })];
            });
        });
    };
    HeadlessAGUI.prototype.showProgress = function (progress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                logger.debug('Headless AGUI Progress:', progress);
                return [2 /*return*/];
            });
        });
    };
    HeadlessAGUI.prototype.showMessage = function (message, type) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                logger.debug("Headless AGUI Message [".concat(type || 'info', "]:"), message);
                return [2 /*return*/];
            });
        });
    };
    HeadlessAGUI.prototype.showInfo = function (title, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                logger.debug("Headless AGUI Info [".concat(title, "]:"), data);
                return [2 /*return*/];
            });
        });
    };
    HeadlessAGUI.prototype.clear = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                logger.debug('Headless AGUI: Clear called');
                return [2 /*return*/];
            });
        });
    };
    HeadlessAGUI.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                logger.debug('Headless AGUI: Close called');
                return [2 /*return*/];
            });
        });
    };
    return HeadlessAGUI;
}());
exports.HeadlessAGUI = HeadlessAGUI;
/**
 * Factory function to create appropriate AGUI instance.
 */
function createAGUI(type, containerSelector) {
    if (type === void 0) { type = 'web'; }
    switch (type) {
        case 'headless':
            return new HeadlessAGUI();
        default:
            return new WebAGUI(containerSelector);
    }
}
