
    import { createRequire } from 'module';
    import { fileURLToPath } from 'url';
    import { dirname } from 'path';
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const require = createRequire(import.meta.url);
    
import {
  __commonJS,
  __name
} from "./chunk-O4JO3PGD.js";

// node_modules/dspy.ts/dist/lm/base.js
var require_base = __commonJS({
  "node_modules/dspy.ts/dist/lm/base.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LMError = void 0;
    var LMError = class extends Error {
      static {
        __name(this, "LMError");
      }
      constructor(message, cause) {
        super(message);
        this.cause = cause;
        this.name = "LMError";
      }
    };
    exports.LMError = LMError;
  }
});

// node_modules/dspy.ts/dist/lm/dummy.js
var require_dummy = __commonJS({
  "node_modules/dspy.ts/dist/lm/dummy.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DummyLM = void 0;
    var base_1 = require_base();
    var DummyLM = class {
      static {
        __name(this, "DummyLM");
      }
      constructor(customResponses) {
        this.initialized = false;
        this.responses = customResponses || /* @__PURE__ */ new Map();
      }
      /**
       * Initialize the dummy LM
       */
      async init() {
        this.initialized = true;
      }
      /**
       * Generate a response based on the prompt.
       * Returns either a custom response if defined, or a default response.
       */
      async generate(prompt, options) {
        if (!this.initialized) {
          throw new base_1.LMError("DummyLM not initialized. Call init() first.");
        }
        if (this.responses.has(prompt)) {
          return this.responses.get(prompt);
        }
        return this.generateDefaultResponse(prompt, options);
      }
      /**
       * Clean up any resources (no-op for DummyLM)
       */
      async cleanup() {
        this.initialized = false;
      }
      /**
       * Add or update a custom response for a specific prompt
       */
      setResponse(prompt, response) {
        this.responses.set(prompt, response);
      }
      /**
       * Clear all custom responses
       */
      clearResponses() {
        this.responses.clear();
      }
      /**
       * Generate a default response for prompts without custom responses
       */
      generateDefaultResponse(prompt, options) {
        const maxTokens = (options === null || options === void 0 ? void 0 : options.maxTokens) || 100;
        return `DummyLM response for prompt: "${prompt}" (limited to ${maxTokens} tokens)`;
      }
    };
    exports.DummyLM = DummyLM;
  }
});

// node_modules/dspy.ts/dist/index.js
var require_dist = __commonJS({
  "node_modules/dspy.ts/dist/index.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DummyLM = exports.LMError = void 0;
    exports.configureLM = configureLM;
    exports.getLM = getLM;
    var base_1 = require_base();
    var globalLM = null;
    function configureLM(lm) {
      globalLM = lm;
    }
    __name(configureLM, "configureLM");
    function getLM() {
      if (!globalLM) {
        throw new base_1.LMError("No language model configured. Call configureLM() first.");
      }
      return globalLM;
    }
    __name(getLM, "getLM");
    var base_2 = require_base();
    Object.defineProperty(exports, "LMError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return base_2.LMError;
    }, "get") });
    var dummy_1 = require_dummy();
    Object.defineProperty(exports, "DummyLM", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return dummy_1.DummyLM;
    }, "get") });
  }
});
export default require_dist();
//# sourceMappingURL=dist-3JMNQZYR.js.map
