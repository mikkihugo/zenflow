
    import { createRequire } from 'module';
    import { fileURLToPath } from 'url';
    import { dirname } from 'path';
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const require = createRequire(import.meta.url);
    
import {
  wrapper_default
} from "./chunk-ZEOM7JAM.js";
import {
  __commonJS,
  __name,
  __toESM
} from "./chunk-O4JO3PGD.js";

// node_modules/react-devtools-core/dist/backend.js
var require_backend = __commonJS({
  "node_modules/react-devtools-core/dist/backend.js"(exports, module) {
    (/* @__PURE__ */ __name(function webpackUniversalModuleDefinition(root, factory) {
      if (typeof exports === "object" && typeof module === "object")
        module.exports = factory();
      else if (typeof define === "function" && define.amd)
        define([], factory);
      else if (typeof exports === "object")
        exports["ReactDevToolsBackend"] = factory();
      else
        root["ReactDevToolsBackend"] = factory();
    }, "webpackUniversalModuleDefinition"))(self, () => {
      return (
        /******/
        (() => {
          var __webpack_modules__ = {
            /***/
            602: (
              /***/
              (__unused_webpack_module, exports2, __webpack_require__2) => {
                "use strict";
                var __webpack_unused_export__;
                function _typeof(obj) {
                  "@babel/helpers - typeof";
                  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                    _typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                      return typeof obj2;
                    }, "_typeof");
                  } else {
                    _typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                      return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                    }, "_typeof");
                  }
                  return _typeof(obj);
                }
                __name(_typeof, "_typeof");
                var k = __webpack_require__2(206), p = __webpack_require__2(189), q = Object.assign, w = p.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, x = [], y = null;
                function z() {
                  if (null === y) {
                    var a = /* @__PURE__ */ new Map();
                    try {
                      A.useContext({
                        _currentValue: null
                      }), A.useState(null), A.useReducer(function(c) {
                        return c;
                      }, null), A.useRef(null), "function" === typeof A.useCacheRefresh && A.useCacheRefresh(), A.useLayoutEffect(function() {
                      }), A.useInsertionEffect(function() {
                      }), A.useEffect(function() {
                      }), A.useImperativeHandle(void 0, function() {
                        return null;
                      }), A.useDebugValue(null), A.useCallback(function() {
                      }), A.useMemo(function() {
                        return null;
                      }), "function" === typeof A.useMemoCache && A.useMemoCache(0);
                    } finally {
                      var b = x;
                      x = [];
                    }
                    for (var e = 0; e < b.length; e++) {
                      var g = b[e];
                      a.set(g.primitive, k.parse(g.stackError));
                    }
                    y = a;
                  }
                  return y;
                }
                __name(z, "z");
                var B = null;
                function C() {
                  var a = B;
                  null !== a && (B = a.next);
                  return a;
                }
                __name(C, "C");
                var A = {
                  use: /* @__PURE__ */ __name(function use() {
                    throw Error("Support for `use` not yet implemented in react-debug-tools.");
                  }, "use"),
                  readContext: /* @__PURE__ */ __name(function readContext(a) {
                    return a._currentValue;
                  }, "readContext"),
                  useCacheRefresh: /* @__PURE__ */ __name(function useCacheRefresh() {
                    var a = C();
                    x.push({
                      primitive: "CacheRefresh",
                      stackError: Error(),
                      value: null !== a ? a.memoizedState : function() {
                      }
                    });
                    return function() {
                    };
                  }, "useCacheRefresh"),
                  useCallback: /* @__PURE__ */ __name(function useCallback(a) {
                    var b = C();
                    x.push({
                      primitive: "Callback",
                      stackError: Error(),
                      value: null !== b ? b.memoizedState[0] : a
                    });
                    return a;
                  }, "useCallback"),
                  useContext: /* @__PURE__ */ __name(function useContext(a) {
                    x.push({
                      primitive: "Context",
                      stackError: Error(),
                      value: a._currentValue
                    });
                    return a._currentValue;
                  }, "useContext"),
                  useEffect: /* @__PURE__ */ __name(function useEffect(a) {
                    C();
                    x.push({
                      primitive: "Effect",
                      stackError: Error(),
                      value: a
                    });
                  }, "useEffect"),
                  useImperativeHandle: /* @__PURE__ */ __name(function useImperativeHandle(a) {
                    C();
                    var b = void 0;
                    null !== a && "object" === _typeof(a) && (b = a.current);
                    x.push({
                      primitive: "ImperativeHandle",
                      stackError: Error(),
                      value: b
                    });
                  }, "useImperativeHandle"),
                  useDebugValue: /* @__PURE__ */ __name(function useDebugValue(a, b) {
                    x.push({
                      primitive: "DebugValue",
                      stackError: Error(),
                      value: "function" === typeof b ? b(a) : a
                    });
                  }, "useDebugValue"),
                  useLayoutEffect: /* @__PURE__ */ __name(function useLayoutEffect(a) {
                    C();
                    x.push({
                      primitive: "LayoutEffect",
                      stackError: Error(),
                      value: a
                    });
                  }, "useLayoutEffect"),
                  useInsertionEffect: /* @__PURE__ */ __name(function useInsertionEffect(a) {
                    C();
                    x.push({
                      primitive: "InsertionEffect",
                      stackError: Error(),
                      value: a
                    });
                  }, "useInsertionEffect"),
                  useMemo: /* @__PURE__ */ __name(function useMemo(a) {
                    var b = C();
                    a = null !== b ? b.memoizedState[0] : a();
                    x.push({
                      primitive: "Memo",
                      stackError: Error(),
                      value: a
                    });
                    return a;
                  }, "useMemo"),
                  useMemoCache: /* @__PURE__ */ __name(function useMemoCache() {
                    return [];
                  }, "useMemoCache"),
                  useReducer: /* @__PURE__ */ __name(function useReducer(a, b, e) {
                    a = C();
                    b = null !== a ? a.memoizedState : void 0 !== e ? e(b) : b;
                    x.push({
                      primitive: "Reducer",
                      stackError: Error(),
                      value: b
                    });
                    return [b, function() {
                    }];
                  }, "useReducer"),
                  useRef: /* @__PURE__ */ __name(function useRef(a) {
                    var b = C();
                    a = null !== b ? b.memoizedState : {
                      current: a
                    };
                    x.push({
                      primitive: "Ref",
                      stackError: Error(),
                      value: a.current
                    });
                    return a;
                  }, "useRef"),
                  useState: /* @__PURE__ */ __name(function useState(a) {
                    var b = C();
                    a = null !== b ? b.memoizedState : "function" === typeof a ? a() : a;
                    x.push({
                      primitive: "State",
                      stackError: Error(),
                      value: a
                    });
                    return [a, function() {
                    }];
                  }, "useState"),
                  useTransition: /* @__PURE__ */ __name(function useTransition() {
                    C();
                    C();
                    x.push({
                      primitive: "Transition",
                      stackError: Error(),
                      value: void 0
                    });
                    return [false, function() {
                    }];
                  }, "useTransition"),
                  useSyncExternalStore: /* @__PURE__ */ __name(function useSyncExternalStore(a, b) {
                    C();
                    C();
                    a = b();
                    x.push({
                      primitive: "SyncExternalStore",
                      stackError: Error(),
                      value: a
                    });
                    return a;
                  }, "useSyncExternalStore"),
                  useDeferredValue: /* @__PURE__ */ __name(function useDeferredValue(a) {
                    var b = C();
                    x.push({
                      primitive: "DeferredValue",
                      stackError: Error(),
                      value: null !== b ? b.memoizedState : a
                    });
                    return a;
                  }, "useDeferredValue"),
                  useId: /* @__PURE__ */ __name(function useId() {
                    var a = C();
                    a = null !== a ? a.memoizedState : "";
                    x.push({
                      primitive: "Id",
                      stackError: Error(),
                      value: a
                    });
                    return a;
                  }, "useId")
                }, D = {
                  get: /* @__PURE__ */ __name(function get(a, b) {
                    if (a.hasOwnProperty(b)) return a[b];
                    a = Error("Missing method in Dispatcher: " + b);
                    a.name = "ReactDebugToolsUnsupportedHookError";
                    throw a;
                  }, "get")
                }, E = "undefined" === typeof Proxy ? A : new Proxy(A, D), F = 0;
                function G(a, b, e) {
                  var g = b[e].source, c = 0;
                  a: for (; c < a.length; c++) {
                    if (a[c].source === g) {
                      for (var h = e + 1, r = c + 1; h < b.length && r < a.length; h++, r++) {
                        if (a[r].source !== b[h].source) continue a;
                      }
                      return c;
                    }
                  }
                  return -1;
                }
                __name(G, "G");
                function H(a, b) {
                  if (!a) return false;
                  b = "use" + b;
                  return a.length < b.length ? false : a.lastIndexOf(b) === a.length - b.length;
                }
                __name(H, "H");
                function I(a, b, e) {
                  for (var g = [], c = null, h = g, r = 0, t = [], v = 0; v < b.length; v++) {
                    var u = b[v];
                    var d = a;
                    var l = k.parse(u.stackError);
                    b: {
                      var m = l, n = G(m, d, F);
                      if (-1 !== n) d = n;
                      else {
                        for (var f = 0; f < d.length && 5 > f; f++) {
                          if (n = G(m, d, f), -1 !== n) {
                            F = f;
                            d = n;
                            break b;
                          }
                        }
                        d = -1;
                      }
                    }
                    b: {
                      m = l;
                      n = z().get(u.primitive);
                      if (void 0 !== n) for (f = 0; f < n.length && f < m.length; f++) {
                        if (n[f].source !== m[f].source) {
                          f < m.length - 1 && H(m[f].functionName, u.primitive) && f++;
                          f < m.length - 1 && H(m[f].functionName, u.primitive) && f++;
                          m = f;
                          break b;
                        }
                      }
                      m = -1;
                    }
                    l = -1 === d || -1 === m || 2 > d - m ? null : l.slice(m, d - 1);
                    if (null !== l) {
                      d = 0;
                      if (null !== c) {
                        for (; d < l.length && d < c.length && l[l.length - d - 1].source === c[c.length - d - 1].source; ) {
                          d++;
                        }
                        for (c = c.length - 1; c > d; c--) {
                          h = t.pop();
                        }
                      }
                      for (c = l.length - d - 1; 1 <= c; c--) {
                        d = [], m = l[c], (n = l[c - 1].functionName) ? (f = n.lastIndexOf("."), -1 === f && (f = 0), "use" === n.slice(f, f + 3) && (f += 3), n = n.slice(f)) : n = "", n = {
                          id: null,
                          isStateEditable: false,
                          name: n,
                          value: void 0,
                          subHooks: d
                        }, e && (n.hookSource = {
                          lineNumber: m.lineNumber,
                          columnNumber: m.columnNumber,
                          functionName: m.functionName,
                          fileName: m.fileName
                        }), h.push(n), t.push(h), h = d;
                      }
                      c = l;
                    }
                    d = u.primitive;
                    u = {
                      id: "Context" === d || "DebugValue" === d ? null : r++,
                      isStateEditable: "Reducer" === d || "State" === d,
                      name: d,
                      value: u.value,
                      subHooks: []
                    };
                    e && (d = {
                      lineNumber: null,
                      functionName: null,
                      fileName: null,
                      columnNumber: null
                    }, l && 1 <= l.length && (l = l[0], d.lineNumber = l.lineNumber, d.functionName = l.functionName, d.fileName = l.fileName, d.columnNumber = l.columnNumber), u.hookSource = d);
                    h.push(u);
                  }
                  J(g, null);
                  return g;
                }
                __name(I, "I");
                function J(a, b) {
                  for (var e = [], g = 0; g < a.length; g++) {
                    var c = a[g];
                    "DebugValue" === c.name && 0 === c.subHooks.length ? (a.splice(g, 1), g--, e.push(c)) : J(c.subHooks, c);
                  }
                  null !== b && (1 === e.length ? b.value = e[0].value : 1 < e.length && (b.value = e.map(function(h) {
                    return h.value;
                  })));
                }
                __name(J, "J");
                function K(a) {
                  if (a instanceof Error && "ReactDebugToolsUnsupportedHookError" === a.name) throw a;
                  var b = Error("Error rendering inspected component", {
                    cause: a
                  });
                  b.name = "ReactDebugToolsRenderError";
                  b.cause = a;
                  throw b;
                }
                __name(K, "K");
                function L(a, b, e) {
                  var g = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : false;
                  null == e && (e = w.ReactCurrentDispatcher);
                  var c = e.current;
                  e.current = E;
                  try {
                    var h = Error();
                    a(b);
                  } catch (t) {
                    K(t);
                  } finally {
                    var r = x;
                    x = [];
                    e.current = c;
                  }
                  c = k.parse(h);
                  return I(c, r, g);
                }
                __name(L, "L");
                function M(a) {
                  a.forEach(function(b, e) {
                    return e._currentValue = b;
                  });
                }
                __name(M, "M");
                __webpack_unused_export__ = L;
                exports2.inspectHooksOfFiber = function(a, b) {
                  var e = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : false;
                  null == b && (b = w.ReactCurrentDispatcher);
                  if (0 !== a.tag && 15 !== a.tag && 11 !== a.tag) throw Error("Unknown Fiber. Needs to be a function component to inspect hooks.");
                  z();
                  var g = a.type, c = a.memoizedProps;
                  if (g !== a.elementType && g && g.defaultProps) {
                    c = q({}, c);
                    var h = g.defaultProps;
                    for (r in h) {
                      void 0 === c[r] && (c[r] = h[r]);
                    }
                  }
                  B = a.memoizedState;
                  var r = /* @__PURE__ */ new Map();
                  try {
                    for (h = a; h; ) {
                      if (10 === h.tag) {
                        var t = h.type._context;
                        r.has(t) || (r.set(t, t._currentValue), t._currentValue = h.memoizedProps.value);
                      }
                      h = h.return;
                    }
                    if (11 === a.tag) {
                      var v = g.render;
                      g = c;
                      var u = a.ref;
                      t = b;
                      var d = t.current;
                      t.current = E;
                      try {
                        var l = Error();
                        v(g, u);
                      } catch (f) {
                        K(f);
                      } finally {
                        var m = x;
                        x = [];
                        t.current = d;
                      }
                      var n = k.parse(l);
                      return I(n, m, e);
                    }
                    return L(g, c, b, e);
                  } finally {
                    B = null, M(r);
                  }
                };
              }
            ),
            /***/
            987: (
              /***/
              (module2, __unused_webpack_exports, __webpack_require__2) => {
                "use strict";
                if (true) {
                  module2.exports = __webpack_require__2(602);
                } else {
                }
              }
            ),
            /***/
            9: (
              /***/
              (__unused_webpack_module, exports2) => {
                "use strict";
                var __webpack_unused_export__;
                function _typeof(obj) {
                  "@babel/helpers - typeof";
                  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                    _typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                      return typeof obj2;
                    }, "_typeof");
                  } else {
                    _typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                      return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                    }, "_typeof");
                  }
                  return _typeof(obj);
                }
                __name(_typeof, "_typeof");
                var b = Symbol.for("react.element"), c = Symbol.for("react.portal"), d = Symbol.for("react.fragment"), e = Symbol.for("react.strict_mode"), f = Symbol.for("react.profiler"), g = Symbol.for("react.provider"), h = Symbol.for("react.context"), k = Symbol.for("react.server_context"), l = Symbol.for("react.forward_ref"), m = Symbol.for("react.suspense"), n = Symbol.for("react.suspense_list"), p = Symbol.for("react.memo"), q = Symbol.for("react.lazy"), t = Symbol.for("react.offscreen"), u = Symbol.for("react.cache"), v = Symbol.for("react.client.reference");
                function w(a) {
                  if ("object" === _typeof(a) && null !== a) {
                    var r = a.$$typeof;
                    switch (r) {
                      case b:
                        switch (a = a.type, a) {
                          case d:
                          case f:
                          case e:
                          case m:
                          case n:
                            return a;
                          default:
                            switch (a = a && a.$$typeof, a) {
                              case k:
                              case h:
                              case l:
                              case q:
                              case p:
                              case g:
                                return a;
                              default:
                                return r;
                            }
                        }
                      case c:
                        return r;
                    }
                  }
                }
                __name(w, "w");
                exports2.ContextConsumer = h;
                exports2.ContextProvider = g;
                __webpack_unused_export__ = b;
                exports2.ForwardRef = l;
                exports2.Fragment = d;
                exports2.Lazy = q;
                exports2.Memo = p;
                exports2.Portal = c;
                exports2.Profiler = f;
                exports2.StrictMode = e;
                exports2.Suspense = m;
                __webpack_unused_export__ = n;
                __webpack_unused_export__ = /* @__PURE__ */ __name(function() {
                  return false;
                }, "__webpack_unused_export__");
                __webpack_unused_export__ = /* @__PURE__ */ __name(function() {
                  return false;
                }, "__webpack_unused_export__");
                __webpack_unused_export__ = /* @__PURE__ */ __name(function(a) {
                  return w(a) === h;
                }, "__webpack_unused_export__");
                __webpack_unused_export__ = /* @__PURE__ */ __name(function(a) {
                  return w(a) === g;
                }, "__webpack_unused_export__");
                exports2.isElement = function(a) {
                  return "object" === _typeof(a) && null !== a && a.$$typeof === b;
                };
                __webpack_unused_export__ = /* @__PURE__ */ __name(function(a) {
                  return w(a) === l;
                }, "__webpack_unused_export__");
                __webpack_unused_export__ = /* @__PURE__ */ __name(function(a) {
                  return w(a) === d;
                }, "__webpack_unused_export__");
                __webpack_unused_export__ = /* @__PURE__ */ __name(function(a) {
                  return w(a) === q;
                }, "__webpack_unused_export__");
                __webpack_unused_export__ = /* @__PURE__ */ __name(function(a) {
                  return w(a) === p;
                }, "__webpack_unused_export__");
                __webpack_unused_export__ = /* @__PURE__ */ __name(function(a) {
                  return w(a) === c;
                }, "__webpack_unused_export__");
                __webpack_unused_export__ = /* @__PURE__ */ __name(function(a) {
                  return w(a) === f;
                }, "__webpack_unused_export__");
                __webpack_unused_export__ = /* @__PURE__ */ __name(function(a) {
                  return w(a) === e;
                }, "__webpack_unused_export__");
                __webpack_unused_export__ = /* @__PURE__ */ __name(function(a) {
                  return w(a) === m;
                }, "__webpack_unused_export__");
                __webpack_unused_export__ = /* @__PURE__ */ __name(function(a) {
                  return w(a) === n;
                }, "__webpack_unused_export__");
                __webpack_unused_export__ = /* @__PURE__ */ __name(function(a) {
                  return "string" === typeof a || "function" === typeof a || a === d || a === f || a === e || a === m || a === n || a === t || a === u || "object" === _typeof(a) && null !== a && (a.$$typeof === q || a.$$typeof === p || a.$$typeof === g || a.$$typeof === h || a.$$typeof === l || a.$$typeof === v || void 0 !== a.getModuleId) ? true : false;
                }, "__webpack_unused_export__");
                exports2.typeOf = w;
              }
            ),
            /***/
            550: (
              /***/
              (module2, __unused_webpack_exports, __webpack_require__2) => {
                "use strict";
                if (true) {
                  module2.exports = __webpack_require__2(9);
                } else {
                }
              }
            ),
            /***/
            978: (
              /***/
              (__unused_webpack_module, exports2) => {
                "use strict";
                function _typeof(obj) {
                  "@babel/helpers - typeof";
                  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                    _typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                      return typeof obj2;
                    }, "_typeof");
                  } else {
                    _typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                      return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                    }, "_typeof");
                  }
                  return _typeof(obj);
                }
                __name(_typeof, "_typeof");
                var l = Symbol.for("react.element"), n = Symbol.for("react.portal"), p = Symbol.for("react.fragment"), q = Symbol.for("react.strict_mode"), r = Symbol.for("react.profiler"), t = Symbol.for("react.provider"), u = Symbol.for("react.context"), v = Symbol.for("react.server_context"), w = Symbol.for("react.forward_ref"), x = Symbol.for("react.suspense"), y = Symbol.for("react.suspense_list"), z = Symbol.for("react.memo"), A = Symbol.for("react.lazy"), aa = Symbol.for("react.debug_trace_mode"), ba = Symbol.for("react.offscreen"), ca = Symbol.for("react.cache"), B = Symbol.for("react.default_value"), da = Symbol.for("react.postpone"), C = Symbol.iterator;
                function ea(a) {
                  if (null === a || "object" !== _typeof(a)) return null;
                  a = C && a[C] || a["@@iterator"];
                  return "function" === typeof a ? a : null;
                }
                __name(ea, "ea");
                var D = {
                  isMounted: /* @__PURE__ */ __name(function isMounted() {
                    return false;
                  }, "isMounted"),
                  enqueueForceUpdate: /* @__PURE__ */ __name(function enqueueForceUpdate() {
                  }, "enqueueForceUpdate"),
                  enqueueReplaceState: /* @__PURE__ */ __name(function enqueueReplaceState() {
                  }, "enqueueReplaceState"),
                  enqueueSetState: /* @__PURE__ */ __name(function enqueueSetState() {
                  }, "enqueueSetState")
                }, E = Object.assign, F = {};
                function G(a, b, c) {
                  this.props = a;
                  this.context = b;
                  this.refs = F;
                  this.updater = c || D;
                }
                __name(G, "G");
                G.prototype.isReactComponent = {};
                G.prototype.setState = function(a, b) {
                  if ("object" !== _typeof(a) && "function" !== typeof a && null != a) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
                  this.updater.enqueueSetState(this, a, b, "setState");
                };
                G.prototype.forceUpdate = function(a) {
                  this.updater.enqueueForceUpdate(this, a, "forceUpdate");
                };
                function H() {
                }
                __name(H, "H");
                H.prototype = G.prototype;
                function I(a, b, c) {
                  this.props = a;
                  this.context = b;
                  this.refs = F;
                  this.updater = c || D;
                }
                __name(I, "I");
                var J = I.prototype = new H();
                J.constructor = I;
                E(J, G.prototype);
                J.isPureReactComponent = true;
                var K = Array.isArray, L = Object.prototype.hasOwnProperty, M = {
                  current: null
                }, N = {
                  key: true,
                  ref: true,
                  __self: true,
                  __source: true
                };
                function O(a, b, c) {
                  var d, e = {}, f = null, g = null;
                  if (null != b) for (d in void 0 !== b.ref && (g = b.ref), void 0 !== b.key && (f = "" + b.key), b) {
                    L.call(b, d) && !N.hasOwnProperty(d) && (e[d] = b[d]);
                  }
                  var h = arguments.length - 2;
                  if (1 === h) e.children = c;
                  else if (1 < h) {
                    for (var k = Array(h), m = 0; m < h; m++) {
                      k[m] = arguments[m + 2];
                    }
                    e.children = k;
                  }
                  if (a && a.defaultProps) for (d in h = a.defaultProps, h) {
                    void 0 === e[d] && (e[d] = h[d]);
                  }
                  return {
                    $$typeof: l,
                    type: a,
                    key: f,
                    ref: g,
                    props: e,
                    _owner: M.current
                  };
                }
                __name(O, "O");
                function fa(a, b) {
                  return {
                    $$typeof: l,
                    type: a.type,
                    key: b,
                    ref: a.ref,
                    props: a.props,
                    _owner: a._owner
                  };
                }
                __name(fa, "fa");
                function P(a) {
                  return "object" === _typeof(a) && null !== a && a.$$typeof === l;
                }
                __name(P, "P");
                function escape(a) {
                  var b = {
                    "=": "=0",
                    ":": "=2"
                  };
                  return "$" + a.replace(/[=:]/g, function(c) {
                    return b[c];
                  });
                }
                __name(escape, "escape");
                var Q = /\/+/g;
                function R(a, b) {
                  return "object" === _typeof(a) && null !== a && null != a.key ? escape("" + a.key) : b.toString(36);
                }
                __name(R, "R");
                function S(a, b, c, d, e) {
                  var f = _typeof(a);
                  if ("undefined" === f || "boolean" === f) a = null;
                  var g = false;
                  if (null === a) g = true;
                  else switch (f) {
                    case "string":
                    case "number":
                      g = true;
                      break;
                    case "object":
                      switch (a.$$typeof) {
                        case l:
                        case n:
                          g = true;
                      }
                  }
                  if (g) return g = a, e = e(g), a = "" === d ? "." + R(g, 0) : d, K(e) ? (c = "", null != a && (c = a.replace(Q, "$&/") + "/"), S(e, b, c, "", function(m) {
                    return m;
                  })) : null != e && (P(e) && (e = fa(e, c + (!e.key || g && g.key === e.key ? "" : ("" + e.key).replace(Q, "$&/") + "/") + a)), b.push(e)), 1;
                  g = 0;
                  d = "" === d ? "." : d + ":";
                  if (K(a)) for (var h = 0; h < a.length; h++) {
                    f = a[h];
                    var k = d + R(f, h);
                    g += S(f, b, c, k, e);
                  }
                  else if (k = ea(a), "function" === typeof k) for (a = k.call(a), h = 0; !(f = a.next()).done; ) {
                    f = f.value, k = d + R(f, h++), g += S(f, b, c, k, e);
                  }
                  else if ("object" === f) throw b = String(a), Error("Objects are not valid as a React child (found: " + ("[object Object]" === b ? "object with keys {" + Object.keys(a).join(", ") + "}" : b) + "). If you meant to render a collection of children, use an array instead.");
                  return g;
                }
                __name(S, "S");
                function T(a, b, c) {
                  if (null == a) return a;
                  var d = [], e = 0;
                  S(a, d, "", "", function(f) {
                    return b.call(c, f, e++);
                  });
                  return d;
                }
                __name(T, "T");
                function ha(a) {
                  if (-1 === a._status) {
                    var b = a._result;
                    b = b();
                    b.then(function(c) {
                      if (0 === a._status || -1 === a._status) a._status = 1, a._result = c;
                    }, function(c) {
                      if (0 === a._status || -1 === a._status) a._status = 2, a._result = c;
                    });
                    -1 === a._status && (a._status = 0, a._result = b);
                  }
                  if (1 === a._status) return a._result.default;
                  throw a._result;
                }
                __name(ha, "ha");
                var U = {
                  current: null
                };
                function ia() {
                  return /* @__PURE__ */ new WeakMap();
                }
                __name(ia, "ia");
                function V() {
                  return {
                    s: 0,
                    v: void 0,
                    o: null,
                    p: null
                  };
                }
                __name(V, "V");
                var W = {
                  current: null
                };
                function X(a, b) {
                  return W.current.useOptimistic(a, b);
                }
                __name(X, "X");
                var Y = {
                  transition: null
                }, Z = {}, ja = {
                  ReactCurrentDispatcher: W,
                  ReactCurrentCache: U,
                  ReactCurrentBatchConfig: Y,
                  ReactCurrentOwner: M,
                  ContextRegistry: Z
                };
                exports2.Children = {
                  map: T,
                  forEach: /* @__PURE__ */ __name(function forEach(a, b, c) {
                    T(a, function() {
                      b.apply(this, arguments);
                    }, c);
                  }, "forEach"),
                  count: /* @__PURE__ */ __name(function count(a) {
                    var b = 0;
                    T(a, function() {
                      b++;
                    });
                    return b;
                  }, "count"),
                  toArray: /* @__PURE__ */ __name(function toArray(a) {
                    return T(a, function(b) {
                      return b;
                    }) || [];
                  }, "toArray"),
                  only: /* @__PURE__ */ __name(function only(a) {
                    if (!P(a)) throw Error("React.Children.only expected to receive a single React element child.");
                    return a;
                  }, "only")
                };
                exports2.Component = G;
                exports2.Fragment = p;
                exports2.Profiler = r;
                exports2.PureComponent = I;
                exports2.StrictMode = q;
                exports2.Suspense = x;
                exports2.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ja;
                exports2.cache = function(a) {
                  return function() {
                    var b = U.current;
                    if (!b) return a.apply(null, arguments);
                    var c = b.getCacheForType(ia);
                    b = c.get(a);
                    void 0 === b && (b = V(), c.set(a, b));
                    c = 0;
                    for (var d = arguments.length; c < d; c++) {
                      var e = arguments[c];
                      if ("function" === typeof e || "object" === _typeof(e) && null !== e) {
                        var f = b.o;
                        null === f && (b.o = f = /* @__PURE__ */ new WeakMap());
                        b = f.get(e);
                        void 0 === b && (b = V(), f.set(e, b));
                      } else f = b.p, null === f && (b.p = f = /* @__PURE__ */ new Map()), b = f.get(e), void 0 === b && (b = V(), f.set(e, b));
                    }
                    if (1 === b.s) return b.v;
                    if (2 === b.s) throw b.v;
                    try {
                      var g = a.apply(null, arguments);
                      c = b;
                      c.s = 1;
                      return c.v = g;
                    } catch (h) {
                      throw g = b, g.s = 2, g.v = h, h;
                    }
                  };
                };
                exports2.cloneElement = function(a, b, c) {
                  if (null === a || void 0 === a) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + a + ".");
                  var d = E({}, a.props), e = a.key, f = a.ref, g = a._owner;
                  if (null != b) {
                    void 0 !== b.ref && (f = b.ref, g = M.current);
                    void 0 !== b.key && (e = "" + b.key);
                    if (a.type && a.type.defaultProps) var h = a.type.defaultProps;
                    for (k in b) {
                      L.call(b, k) && !N.hasOwnProperty(k) && (d[k] = void 0 === b[k] && void 0 !== h ? h[k] : b[k]);
                    }
                  }
                  var k = arguments.length - 2;
                  if (1 === k) d.children = c;
                  else if (1 < k) {
                    h = Array(k);
                    for (var m = 0; m < k; m++) {
                      h[m] = arguments[m + 2];
                    }
                    d.children = h;
                  }
                  return {
                    $$typeof: l,
                    type: a.type,
                    key: e,
                    ref: f,
                    props: d,
                    _owner: g
                  };
                };
                exports2.createContext = function(a) {
                  a = {
                    $$typeof: u,
                    _currentValue: a,
                    _currentValue2: a,
                    _threadCount: 0,
                    Provider: null,
                    Consumer: null,
                    _defaultValue: null,
                    _globalName: null
                  };
                  a.Provider = {
                    $$typeof: t,
                    _context: a
                  };
                  return a.Consumer = a;
                };
                exports2.createElement = O;
                exports2.createFactory = function(a) {
                  var b = O.bind(null, a);
                  b.type = a;
                  return b;
                };
                exports2.createRef = function() {
                  return {
                    current: null
                  };
                };
                exports2.createServerContext = function(a, b) {
                  var c = true;
                  if (!Z[a]) {
                    c = false;
                    var d = {
                      $$typeof: v,
                      _currentValue: b,
                      _currentValue2: b,
                      _defaultValue: b,
                      _threadCount: 0,
                      Provider: null,
                      Consumer: null,
                      _globalName: a
                    };
                    d.Provider = {
                      $$typeof: t,
                      _context: d
                    };
                    Z[a] = d;
                  }
                  d = Z[a];
                  if (d._defaultValue === B) d._defaultValue = b, d._currentValue === B && (d._currentValue = b), d._currentValue2 === B && (d._currentValue2 = b);
                  else if (c) throw Error("ServerContext: " + a + " already defined");
                  return d;
                };
                exports2.experimental_useEffectEvent = function(a) {
                  return W.current.useEffectEvent(a);
                };
                exports2.experimental_useOptimistic = function(a, b) {
                  return X(a, b);
                };
                exports2.forwardRef = function(a) {
                  return {
                    $$typeof: w,
                    render: a
                  };
                };
                exports2.isValidElement = P;
                exports2.lazy = function(a) {
                  return {
                    $$typeof: A,
                    _payload: {
                      _status: -1,
                      _result: a
                    },
                    _init: ha
                  };
                };
                exports2.memo = function(a, b) {
                  return {
                    $$typeof: z,
                    type: a,
                    compare: void 0 === b ? null : b
                  };
                };
                exports2.startTransition = function(a) {
                  var b = Y.transition;
                  Y.transition = {};
                  try {
                    a();
                  } finally {
                    Y.transition = b;
                  }
                };
                exports2.unstable_Cache = ca;
                exports2.unstable_DebugTracingMode = aa;
                exports2.unstable_Offscreen = ba;
                exports2.unstable_SuspenseList = y;
                exports2.unstable_act = function() {
                  throw Error("act(...) is not supported in production builds of React.");
                };
                exports2.unstable_getCacheForType = function(a) {
                  var b = U.current;
                  return b ? b.getCacheForType(a) : a();
                };
                exports2.unstable_getCacheSignal = function() {
                  var a = U.current;
                  return a ? a.getCacheSignal() : (a = new AbortController(), a.abort(Error("This CacheSignal was requested outside React which means that it is immediately aborted.")), a.signal);
                };
                exports2.unstable_postpone = function(a) {
                  a = Error(a);
                  a.$$typeof = da;
                  throw a;
                };
                exports2.unstable_useCacheRefresh = function() {
                  return W.current.useCacheRefresh();
                };
                exports2.unstable_useMemoCache = function(a) {
                  return W.current.useMemoCache(a);
                };
                exports2.use = function(a) {
                  return W.current.use(a);
                };
                exports2.useCallback = function(a, b) {
                  return W.current.useCallback(a, b);
                };
                exports2.useContext = function(a) {
                  return W.current.useContext(a);
                };
                exports2.useDebugValue = function() {
                };
                exports2.useDeferredValue = function(a, b) {
                  return W.current.useDeferredValue(a, b);
                };
                exports2.useEffect = function(a, b) {
                  return W.current.useEffect(a, b);
                };
                exports2.useId = function() {
                  return W.current.useId();
                };
                exports2.useImperativeHandle = function(a, b, c) {
                  return W.current.useImperativeHandle(a, b, c);
                };
                exports2.useInsertionEffect = function(a, b) {
                  return W.current.useInsertionEffect(a, b);
                };
                exports2.useLayoutEffect = function(a, b) {
                  return W.current.useLayoutEffect(a, b);
                };
                exports2.useMemo = function(a, b) {
                  return W.current.useMemo(a, b);
                };
                exports2.useOptimistic = X;
                exports2.useReducer = function(a, b, c) {
                  return W.current.useReducer(a, b, c);
                };
                exports2.useRef = function(a) {
                  return W.current.useRef(a);
                };
                exports2.useState = function(a) {
                  return W.current.useState(a);
                };
                exports2.useSyncExternalStore = function(a, b, c) {
                  return W.current.useSyncExternalStore(a, b, c);
                };
                exports2.useTransition = function() {
                  return W.current.useTransition();
                };
                exports2.version = "18.3.0-experimental-51ffd3564-20231025";
              }
            ),
            /***/
            189: (
              /***/
              (module2, __unused_webpack_exports, __webpack_require__2) => {
                "use strict";
                if (true) {
                  module2.exports = __webpack_require__2(978);
                } else {
                }
              }
            ),
            /***/
            206: (
              /***/
              function(module2, exports2, __webpack_require__2) {
                var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
                function _typeof(obj) {
                  "@babel/helpers - typeof";
                  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                    _typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                      return typeof obj2;
                    }, "_typeof");
                  } else {
                    _typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                      return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                    }, "_typeof");
                  }
                  return _typeof(obj);
                }
                __name(_typeof, "_typeof");
                (function(root, factory) {
                  "use strict";
                  if (true) {
                    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__2(430)], __WEBPACK_AMD_DEFINE_FACTORY__ = factory, __WEBPACK_AMD_DEFINE_RESULT__ = typeof __WEBPACK_AMD_DEFINE_FACTORY__ === "function" ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports2, __WEBPACK_AMD_DEFINE_ARRAY__) : __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__ !== void 0 && (module2.exports = __WEBPACK_AMD_DEFINE_RESULT__));
                  } else {
                  }
                })(this, /* @__PURE__ */ __name(function ErrorStackParser(StackFrame) {
                  "use strict";
                  var FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+:\d+/;
                  var CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+:\d+|\(native\))/m;
                  var SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code])?$/;
                  return {
                    /**
                     * Given an Error object, extract the most information from it.
                     *
                     * @param {Error} error object
                     * @return {Array} of StackFrames
                     */
                    parse: /* @__PURE__ */ __name(function ErrorStackParser$$parse(error) {
                      if (typeof error.stacktrace !== "undefined" || typeof error["opera#sourceloc"] !== "undefined") {
                        return this.parseOpera(error);
                      } else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
                        return this.parseV8OrIE(error);
                      } else if (error.stack) {
                        return this.parseFFOrSafari(error);
                      } else {
                        throw new Error("Cannot parse given Error object");
                      }
                    }, "ErrorStackParser$$parse"),
                    // Separate line and column numbers from a string of the form: (URI:Line:Column)
                    extractLocation: /* @__PURE__ */ __name(function ErrorStackParser$$extractLocation(urlLike) {
                      if (urlLike.indexOf(":") === -1) {
                        return [urlLike];
                      }
                      var regExp = /(.+?)(?::(\d+))?(?::(\d+))?$/;
                      var parts = regExp.exec(urlLike.replace(/[()]/g, ""));
                      return [parts[1], parts[2] || void 0, parts[3] || void 0];
                    }, "ErrorStackParser$$extractLocation"),
                    parseV8OrIE: /* @__PURE__ */ __name(function ErrorStackParser$$parseV8OrIE(error) {
                      var filtered = error.stack.split("\n").filter(function(line) {
                        return !!line.match(CHROME_IE_STACK_REGEXP);
                      }, this);
                      return filtered.map(function(line) {
                        if (line.indexOf("(eval ") > -1) {
                          line = line.replace(/eval code/g, "eval").replace(/(\(eval at [^()]*)|(\),.*$)/g, "");
                        }
                        var sanitizedLine = line.replace(/^\s+/, "").replace(/\(eval code/g, "(");
                        var location = sanitizedLine.match(/ (\((.+):(\d+):(\d+)\)$)/);
                        sanitizedLine = location ? sanitizedLine.replace(location[0], "") : sanitizedLine;
                        var tokens = sanitizedLine.split(/\s+/).slice(1);
                        var locationParts = this.extractLocation(location ? location[1] : tokens.pop());
                        var functionName = tokens.join(" ") || void 0;
                        var fileName = ["eval", "<anonymous>"].indexOf(locationParts[0]) > -1 ? void 0 : locationParts[0];
                        return new StackFrame({
                          functionName,
                          fileName,
                          lineNumber: locationParts[1],
                          columnNumber: locationParts[2],
                          source: line
                        });
                      }, this);
                    }, "ErrorStackParser$$parseV8OrIE"),
                    parseFFOrSafari: /* @__PURE__ */ __name(function ErrorStackParser$$parseFFOrSafari(error) {
                      var filtered = error.stack.split("\n").filter(function(line) {
                        return !line.match(SAFARI_NATIVE_CODE_REGEXP);
                      }, this);
                      return filtered.map(function(line) {
                        if (line.indexOf(" > eval") > -1) {
                          line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ":$1");
                        }
                        if (line.indexOf("@") === -1 && line.indexOf(":") === -1) {
                          return new StackFrame({
                            functionName: line
                          });
                        } else {
                          var functionNameRegex = /((.*".+"[^@]*)?[^@]*)(?:@)/;
                          var matches = line.match(functionNameRegex);
                          var functionName = matches && matches[1] ? matches[1] : void 0;
                          var locationParts = this.extractLocation(line.replace(functionNameRegex, ""));
                          return new StackFrame({
                            functionName,
                            fileName: locationParts[0],
                            lineNumber: locationParts[1],
                            columnNumber: locationParts[2],
                            source: line
                          });
                        }
                      }, this);
                    }, "ErrorStackParser$$parseFFOrSafari"),
                    parseOpera: /* @__PURE__ */ __name(function ErrorStackParser$$parseOpera(e) {
                      if (!e.stacktrace || e.message.indexOf("\n") > -1 && e.message.split("\n").length > e.stacktrace.split("\n").length) {
                        return this.parseOpera9(e);
                      } else if (!e.stack) {
                        return this.parseOpera10(e);
                      } else {
                        return this.parseOpera11(e);
                      }
                    }, "ErrorStackParser$$parseOpera"),
                    parseOpera9: /* @__PURE__ */ __name(function ErrorStackParser$$parseOpera9(e) {
                      var lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
                      var lines = e.message.split("\n");
                      var result = [];
                      for (var i = 2, len = lines.length; i < len; i += 2) {
                        var match = lineRE.exec(lines[i]);
                        if (match) {
                          result.push(new StackFrame({
                            fileName: match[2],
                            lineNumber: match[1],
                            source: lines[i]
                          }));
                        }
                      }
                      return result;
                    }, "ErrorStackParser$$parseOpera9"),
                    parseOpera10: /* @__PURE__ */ __name(function ErrorStackParser$$parseOpera10(e) {
                      var lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
                      var lines = e.stacktrace.split("\n");
                      var result = [];
                      for (var i = 0, len = lines.length; i < len; i += 2) {
                        var match = lineRE.exec(lines[i]);
                        if (match) {
                          result.push(new StackFrame({
                            functionName: match[3] || void 0,
                            fileName: match[2],
                            lineNumber: match[1],
                            source: lines[i]
                          }));
                        }
                      }
                      return result;
                    }, "ErrorStackParser$$parseOpera10"),
                    // Opera 10.65+ Error.stack very similar to FF/Safari
                    parseOpera11: /* @__PURE__ */ __name(function ErrorStackParser$$parseOpera11(error) {
                      var filtered = error.stack.split("\n").filter(function(line) {
                        return !!line.match(FIREFOX_SAFARI_STACK_REGEXP) && !line.match(/^Error created at/);
                      }, this);
                      return filtered.map(function(line) {
                        var tokens = line.split("@");
                        var locationParts = this.extractLocation(tokens.pop());
                        var functionCall = tokens.shift() || "";
                        var functionName = functionCall.replace(/<anonymous function(: (\w+))?>/, "$2").replace(/\([^)]*\)/g, "") || void 0;
                        var argsRaw;
                        if (functionCall.match(/\(([^)]*)\)/)) {
                          argsRaw = functionCall.replace(/^[^(]+\(([^)]*)\)$/, "$1");
                        }
                        var args = argsRaw === void 0 || argsRaw === "[arguments not available]" ? void 0 : argsRaw.split(",");
                        return new StackFrame({
                          functionName,
                          args,
                          fileName: locationParts[0],
                          lineNumber: locationParts[1],
                          columnNumber: locationParts[2],
                          source: line
                        });
                      }, this);
                    }, "ErrorStackParser$$parseOpera11")
                  };
                }, "ErrorStackParser"));
              }
            ),
            /***/
            172: (
              /***/
              (module2) => {
                function _typeof(obj) {
                  "@babel/helpers - typeof";
                  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                    _typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                      return typeof obj2;
                    }, "_typeof");
                  } else {
                    _typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                      return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                    }, "_typeof");
                  }
                  return _typeof(obj);
                }
                __name(_typeof, "_typeof");
                var FUNC_ERROR_TEXT = "Expected a function";
                var NAN = 0 / 0;
                var symbolTag = "[object Symbol]";
                var reTrim = /^\s+|\s+$/g;
                var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
                var reIsBinary = /^0b[01]+$/i;
                var reIsOctal = /^0o[0-7]+$/i;
                var freeParseInt = parseInt;
                var freeGlobal = (typeof global === "undefined" ? "undefined" : _typeof(global)) == "object" && global && global.Object === Object && global;
                var freeSelf = (typeof self === "undefined" ? "undefined" : _typeof(self)) == "object" && self && self.Object === Object && self;
                var root = freeGlobal || freeSelf || Function("return this")();
                var objectProto = Object.prototype;
                var objectToString = objectProto.toString;
                var nativeMax = Math.max, nativeMin = Math.min;
                var now = /* @__PURE__ */ __name(function now2() {
                  return root.Date.now();
                }, "now");
                function debounce(func, wait, options) {
                  var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
                  if (typeof func != "function") {
                    throw new TypeError(FUNC_ERROR_TEXT);
                  }
                  wait = toNumber(wait) || 0;
                  if (isObject(options)) {
                    leading = !!options.leading;
                    maxing = "maxWait" in options;
                    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
                    trailing = "trailing" in options ? !!options.trailing : trailing;
                  }
                  function invokeFunc(time) {
                    var args = lastArgs, thisArg = lastThis;
                    lastArgs = lastThis = void 0;
                    lastInvokeTime = time;
                    result = func.apply(thisArg, args);
                    return result;
                  }
                  __name(invokeFunc, "invokeFunc");
                  function leadingEdge(time) {
                    lastInvokeTime = time;
                    timerId = setTimeout(timerExpired, wait);
                    return leading ? invokeFunc(time) : result;
                  }
                  __name(leadingEdge, "leadingEdge");
                  function remainingWait(time) {
                    var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, result2 = wait - timeSinceLastCall;
                    return maxing ? nativeMin(result2, maxWait - timeSinceLastInvoke) : result2;
                  }
                  __name(remainingWait, "remainingWait");
                  function shouldInvoke(time) {
                    var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
                    return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
                  }
                  __name(shouldInvoke, "shouldInvoke");
                  function timerExpired() {
                    var time = now();
                    if (shouldInvoke(time)) {
                      return trailingEdge(time);
                    }
                    timerId = setTimeout(timerExpired, remainingWait(time));
                  }
                  __name(timerExpired, "timerExpired");
                  function trailingEdge(time) {
                    timerId = void 0;
                    if (trailing && lastArgs) {
                      return invokeFunc(time);
                    }
                    lastArgs = lastThis = void 0;
                    return result;
                  }
                  __name(trailingEdge, "trailingEdge");
                  function cancel() {
                    if (timerId !== void 0) {
                      clearTimeout(timerId);
                    }
                    lastInvokeTime = 0;
                    lastArgs = lastCallTime = lastThis = timerId = void 0;
                  }
                  __name(cancel, "cancel");
                  function flush() {
                    return timerId === void 0 ? result : trailingEdge(now());
                  }
                  __name(flush, "flush");
                  function debounced() {
                    var time = now(), isInvoking = shouldInvoke(time);
                    lastArgs = arguments;
                    lastThis = this;
                    lastCallTime = time;
                    if (isInvoking) {
                      if (timerId === void 0) {
                        return leadingEdge(lastCallTime);
                      }
                      if (maxing) {
                        timerId = setTimeout(timerExpired, wait);
                        return invokeFunc(lastCallTime);
                      }
                    }
                    if (timerId === void 0) {
                      timerId = setTimeout(timerExpired, wait);
                    }
                    return result;
                  }
                  __name(debounced, "debounced");
                  debounced.cancel = cancel;
                  debounced.flush = flush;
                  return debounced;
                }
                __name(debounce, "debounce");
                function throttle(func, wait, options) {
                  var leading = true, trailing = true;
                  if (typeof func != "function") {
                    throw new TypeError(FUNC_ERROR_TEXT);
                  }
                  if (isObject(options)) {
                    leading = "leading" in options ? !!options.leading : leading;
                    trailing = "trailing" in options ? !!options.trailing : trailing;
                  }
                  return debounce(func, wait, {
                    "leading": leading,
                    "maxWait": wait,
                    "trailing": trailing
                  });
                }
                __name(throttle, "throttle");
                function isObject(value) {
                  var type = _typeof(value);
                  return !!value && (type == "object" || type == "function");
                }
                __name(isObject, "isObject");
                function isObjectLike(value) {
                  return !!value && _typeof(value) == "object";
                }
                __name(isObjectLike, "isObjectLike");
                function isSymbol(value) {
                  return _typeof(value) == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
                }
                __name(isSymbol, "isSymbol");
                function toNumber(value) {
                  if (typeof value == "number") {
                    return value;
                  }
                  if (isSymbol(value)) {
                    return NAN;
                  }
                  if (isObject(value)) {
                    var other = typeof value.valueOf == "function" ? value.valueOf() : value;
                    value = isObject(other) ? other + "" : other;
                  }
                  if (typeof value != "string") {
                    return value === 0 ? value : +value;
                  }
                  value = value.replace(reTrim, "");
                  var isBinary = reIsBinary.test(value);
                  return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
                }
                __name(toNumber, "toNumber");
                module2.exports = throttle;
              }
            ),
            /***/
            730: (
              /***/
              (module2, __unused_webpack_exports, __webpack_require__2) => {
                "use strict";
                var process = __webpack_require__2(169);
                module2.exports = LRUCache;
                var Map2 = __webpack_require__2(307);
                var util = __webpack_require__2(82);
                var Yallist = __webpack_require__2(695);
                var hasSymbol = typeof Symbol === "function" && process.env._nodeLRUCacheForceNoSymbol !== "1";
                var makeSymbol;
                if (hasSymbol) {
                  makeSymbol = /* @__PURE__ */ __name(function makeSymbol2(key) {
                    return Symbol(key);
                  }, "makeSymbol");
                } else {
                  makeSymbol = /* @__PURE__ */ __name(function makeSymbol2(key) {
                    return "_" + key;
                  }, "makeSymbol");
                }
                var MAX = makeSymbol("max");
                var LENGTH = makeSymbol("length");
                var LENGTH_CALCULATOR = makeSymbol("lengthCalculator");
                var ALLOW_STALE = makeSymbol("allowStale");
                var MAX_AGE = makeSymbol("maxAge");
                var DISPOSE = makeSymbol("dispose");
                var NO_DISPOSE_ON_SET = makeSymbol("noDisposeOnSet");
                var LRU_LIST = makeSymbol("lruList");
                var CACHE = makeSymbol("cache");
                function naiveLength() {
                  return 1;
                }
                __name(naiveLength, "naiveLength");
                function LRUCache(options) {
                  if (!(this instanceof LRUCache)) {
                    return new LRUCache(options);
                  }
                  if (typeof options === "number") {
                    options = {
                      max: options
                    };
                  }
                  if (!options) {
                    options = {};
                  }
                  var max = this[MAX] = options.max;
                  if (!max || !(typeof max === "number") || max <= 0) {
                    this[MAX] = Infinity;
                  }
                  var lc = options.length || naiveLength;
                  if (typeof lc !== "function") {
                    lc = naiveLength;
                  }
                  this[LENGTH_CALCULATOR] = lc;
                  this[ALLOW_STALE] = options.stale || false;
                  this[MAX_AGE] = options.maxAge || 0;
                  this[DISPOSE] = options.dispose;
                  this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false;
                  this.reset();
                }
                __name(LRUCache, "LRUCache");
                Object.defineProperty(LRUCache.prototype, "max", {
                  set: /* @__PURE__ */ __name(function set(mL) {
                    if (!mL || !(typeof mL === "number") || mL <= 0) {
                      mL = Infinity;
                    }
                    this[MAX] = mL;
                    trim(this);
                  }, "set"),
                  get: /* @__PURE__ */ __name(function get2() {
                    return this[MAX];
                  }, "get"),
                  enumerable: true
                });
                Object.defineProperty(LRUCache.prototype, "allowStale", {
                  set: /* @__PURE__ */ __name(function set(allowStale) {
                    this[ALLOW_STALE] = !!allowStale;
                  }, "set"),
                  get: /* @__PURE__ */ __name(function get2() {
                    return this[ALLOW_STALE];
                  }, "get"),
                  enumerable: true
                });
                Object.defineProperty(LRUCache.prototype, "maxAge", {
                  set: /* @__PURE__ */ __name(function set(mA) {
                    if (!mA || !(typeof mA === "number") || mA < 0) {
                      mA = 0;
                    }
                    this[MAX_AGE] = mA;
                    trim(this);
                  }, "set"),
                  get: /* @__PURE__ */ __name(function get2() {
                    return this[MAX_AGE];
                  }, "get"),
                  enumerable: true
                });
                Object.defineProperty(LRUCache.prototype, "lengthCalculator", {
                  set: /* @__PURE__ */ __name(function set(lC) {
                    if (typeof lC !== "function") {
                      lC = naiveLength;
                    }
                    if (lC !== this[LENGTH_CALCULATOR]) {
                      this[LENGTH_CALCULATOR] = lC;
                      this[LENGTH] = 0;
                      this[LRU_LIST].forEach(function(hit) {
                        hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key);
                        this[LENGTH] += hit.length;
                      }, this);
                    }
                    trim(this);
                  }, "set"),
                  get: /* @__PURE__ */ __name(function get2() {
                    return this[LENGTH_CALCULATOR];
                  }, "get"),
                  enumerable: true
                });
                Object.defineProperty(LRUCache.prototype, "length", {
                  get: /* @__PURE__ */ __name(function get2() {
                    return this[LENGTH];
                  }, "get"),
                  enumerable: true
                });
                Object.defineProperty(LRUCache.prototype, "itemCount", {
                  get: /* @__PURE__ */ __name(function get2() {
                    return this[LRU_LIST].length;
                  }, "get"),
                  enumerable: true
                });
                LRUCache.prototype.rforEach = function(fn, thisp) {
                  thisp = thisp || this;
                  for (var walker = this[LRU_LIST].tail; walker !== null; ) {
                    var prev = walker.prev;
                    forEachStep(this, fn, walker, thisp);
                    walker = prev;
                  }
                };
                function forEachStep(self2, fn, node, thisp) {
                  var hit = node.value;
                  if (isStale(self2, hit)) {
                    del(self2, node);
                    if (!self2[ALLOW_STALE]) {
                      hit = void 0;
                    }
                  }
                  if (hit) {
                    fn.call(thisp, hit.value, hit.key, self2);
                  }
                }
                __name(forEachStep, "forEachStep");
                LRUCache.prototype.forEach = function(fn, thisp) {
                  thisp = thisp || this;
                  for (var walker = this[LRU_LIST].head; walker !== null; ) {
                    var next = walker.next;
                    forEachStep(this, fn, walker, thisp);
                    walker = next;
                  }
                };
                LRUCache.prototype.keys = function() {
                  return this[LRU_LIST].toArray().map(function(k) {
                    return k.key;
                  }, this);
                };
                LRUCache.prototype.values = function() {
                  return this[LRU_LIST].toArray().map(function(k) {
                    return k.value;
                  }, this);
                };
                LRUCache.prototype.reset = function() {
                  if (this[DISPOSE] && this[LRU_LIST] && this[LRU_LIST].length) {
                    this[LRU_LIST].forEach(function(hit) {
                      this[DISPOSE](hit.key, hit.value);
                    }, this);
                  }
                  this[CACHE] = new Map2();
                  this[LRU_LIST] = new Yallist();
                  this[LENGTH] = 0;
                };
                LRUCache.prototype.dump = function() {
                  return this[LRU_LIST].map(function(hit) {
                    if (!isStale(this, hit)) {
                      return {
                        k: hit.key,
                        v: hit.value,
                        e: hit.now + (hit.maxAge || 0)
                      };
                    }
                  }, this).toArray().filter(function(h) {
                    return h;
                  });
                };
                LRUCache.prototype.dumpLru = function() {
                  return this[LRU_LIST];
                };
                LRUCache.prototype.inspect = function(n, opts) {
                  var str = "LRUCache {";
                  var extras = false;
                  var as = this[ALLOW_STALE];
                  if (as) {
                    str += "\n  allowStale: true";
                    extras = true;
                  }
                  var max = this[MAX];
                  if (max && max !== Infinity) {
                    if (extras) {
                      str += ",";
                    }
                    str += "\n  max: " + util.inspect(max, opts);
                    extras = true;
                  }
                  var maxAge = this[MAX_AGE];
                  if (maxAge) {
                    if (extras) {
                      str += ",";
                    }
                    str += "\n  maxAge: " + util.inspect(maxAge, opts);
                    extras = true;
                  }
                  var lc = this[LENGTH_CALCULATOR];
                  if (lc && lc !== naiveLength) {
                    if (extras) {
                      str += ",";
                    }
                    str += "\n  length: " + util.inspect(this[LENGTH], opts);
                    extras = true;
                  }
                  var didFirst = false;
                  this[LRU_LIST].forEach(function(item) {
                    if (didFirst) {
                      str += ",\n  ";
                    } else {
                      if (extras) {
                        str += ",\n";
                      }
                      didFirst = true;
                      str += "\n  ";
                    }
                    var key = util.inspect(item.key).split("\n").join("\n  ");
                    var val = {
                      value: item.value
                    };
                    if (item.maxAge !== maxAge) {
                      val.maxAge = item.maxAge;
                    }
                    if (lc !== naiveLength) {
                      val.length = item.length;
                    }
                    if (isStale(this, item)) {
                      val.stale = true;
                    }
                    val = util.inspect(val, opts).split("\n").join("\n  ");
                    str += key + " => " + val;
                  });
                  if (didFirst || extras) {
                    str += "\n";
                  }
                  str += "}";
                  return str;
                };
                LRUCache.prototype.set = function(key, value, maxAge) {
                  maxAge = maxAge || this[MAX_AGE];
                  var now = maxAge ? Date.now() : 0;
                  var len = this[LENGTH_CALCULATOR](value, key);
                  if (this[CACHE].has(key)) {
                    if (len > this[MAX]) {
                      del(this, this[CACHE].get(key));
                      return false;
                    }
                    var node = this[CACHE].get(key);
                    var item = node.value;
                    if (this[DISPOSE]) {
                      if (!this[NO_DISPOSE_ON_SET]) {
                        this[DISPOSE](key, item.value);
                      }
                    }
                    item.now = now;
                    item.maxAge = maxAge;
                    item.value = value;
                    this[LENGTH] += len - item.length;
                    item.length = len;
                    this.get(key);
                    trim(this);
                    return true;
                  }
                  var hit = new Entry(key, value, len, now, maxAge);
                  if (hit.length > this[MAX]) {
                    if (this[DISPOSE]) {
                      this[DISPOSE](key, value);
                    }
                    return false;
                  }
                  this[LENGTH] += hit.length;
                  this[LRU_LIST].unshift(hit);
                  this[CACHE].set(key, this[LRU_LIST].head);
                  trim(this);
                  return true;
                };
                LRUCache.prototype.has = function(key) {
                  if (!this[CACHE].has(key)) return false;
                  var hit = this[CACHE].get(key).value;
                  if (isStale(this, hit)) {
                    return false;
                  }
                  return true;
                };
                LRUCache.prototype.get = function(key) {
                  return get(this, key, true);
                };
                LRUCache.prototype.peek = function(key) {
                  return get(this, key, false);
                };
                LRUCache.prototype.pop = function() {
                  var node = this[LRU_LIST].tail;
                  if (!node) return null;
                  del(this, node);
                  return node.value;
                };
                LRUCache.prototype.del = function(key) {
                  del(this, this[CACHE].get(key));
                };
                LRUCache.prototype.load = function(arr) {
                  this.reset();
                  var now = Date.now();
                  for (var l = arr.length - 1; l >= 0; l--) {
                    var hit = arr[l];
                    var expiresAt = hit.e || 0;
                    if (expiresAt === 0) {
                      this.set(hit.k, hit.v);
                    } else {
                      var maxAge = expiresAt - now;
                      if (maxAge > 0) {
                        this.set(hit.k, hit.v, maxAge);
                      }
                    }
                  }
                };
                LRUCache.prototype.prune = function() {
                  var self2 = this;
                  this[CACHE].forEach(function(value, key) {
                    get(self2, key, false);
                  });
                };
                function get(self2, key, doUse) {
                  var node = self2[CACHE].get(key);
                  if (node) {
                    var hit = node.value;
                    if (isStale(self2, hit)) {
                      del(self2, node);
                      if (!self2[ALLOW_STALE]) hit = void 0;
                    } else {
                      if (doUse) {
                        self2[LRU_LIST].unshiftNode(node);
                      }
                    }
                    if (hit) hit = hit.value;
                  }
                  return hit;
                }
                __name(get, "get");
                function isStale(self2, hit) {
                  if (!hit || !hit.maxAge && !self2[MAX_AGE]) {
                    return false;
                  }
                  var stale = false;
                  var diff = Date.now() - hit.now;
                  if (hit.maxAge) {
                    stale = diff > hit.maxAge;
                  } else {
                    stale = self2[MAX_AGE] && diff > self2[MAX_AGE];
                  }
                  return stale;
                }
                __name(isStale, "isStale");
                function trim(self2) {
                  if (self2[LENGTH] > self2[MAX]) {
                    for (var walker = self2[LRU_LIST].tail; self2[LENGTH] > self2[MAX] && walker !== null; ) {
                      var prev = walker.prev;
                      del(self2, walker);
                      walker = prev;
                    }
                  }
                }
                __name(trim, "trim");
                function del(self2, node) {
                  if (node) {
                    var hit = node.value;
                    if (self2[DISPOSE]) {
                      self2[DISPOSE](hit.key, hit.value);
                    }
                    self2[LENGTH] -= hit.length;
                    self2[CACHE].delete(hit.key);
                    self2[LRU_LIST].removeNode(node);
                  }
                }
                __name(del, "del");
                function Entry(key, value, length, now, maxAge) {
                  this.key = key;
                  this.value = value;
                  this.length = length;
                  this.now = now;
                  this.maxAge = maxAge || 0;
                }
                __name(Entry, "Entry");
              }
            ),
            /***/
            169: (
              /***/
              (module2) => {
                var process = module2.exports = {};
                var cachedSetTimeout;
                var cachedClearTimeout;
                function defaultSetTimout() {
                  throw new Error("setTimeout has not been defined");
                }
                __name(defaultSetTimout, "defaultSetTimout");
                function defaultClearTimeout() {
                  throw new Error("clearTimeout has not been defined");
                }
                __name(defaultClearTimeout, "defaultClearTimeout");
                (function() {
                  try {
                    if (typeof setTimeout === "function") {
                      cachedSetTimeout = setTimeout;
                    } else {
                      cachedSetTimeout = defaultSetTimout;
                    }
                  } catch (e) {
                    cachedSetTimeout = defaultSetTimout;
                  }
                  try {
                    if (typeof clearTimeout === "function") {
                      cachedClearTimeout = clearTimeout;
                    } else {
                      cachedClearTimeout = defaultClearTimeout;
                    }
                  } catch (e) {
                    cachedClearTimeout = defaultClearTimeout;
                  }
                })();
                function runTimeout(fun) {
                  if (cachedSetTimeout === setTimeout) {
                    return setTimeout(fun, 0);
                  }
                  if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
                    cachedSetTimeout = setTimeout;
                    return setTimeout(fun, 0);
                  }
                  try {
                    return cachedSetTimeout(fun, 0);
                  } catch (e) {
                    try {
                      return cachedSetTimeout.call(null, fun, 0);
                    } catch (e2) {
                      return cachedSetTimeout.call(this, fun, 0);
                    }
                  }
                }
                __name(runTimeout, "runTimeout");
                function runClearTimeout(marker) {
                  if (cachedClearTimeout === clearTimeout) {
                    return clearTimeout(marker);
                  }
                  if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
                    cachedClearTimeout = clearTimeout;
                    return clearTimeout(marker);
                  }
                  try {
                    return cachedClearTimeout(marker);
                  } catch (e) {
                    try {
                      return cachedClearTimeout.call(null, marker);
                    } catch (e2) {
                      return cachedClearTimeout.call(this, marker);
                    }
                  }
                }
                __name(runClearTimeout, "runClearTimeout");
                var queue = [];
                var draining = false;
                var currentQueue;
                var queueIndex = -1;
                function cleanUpNextTick() {
                  if (!draining || !currentQueue) {
                    return;
                  }
                  draining = false;
                  if (currentQueue.length) {
                    queue = currentQueue.concat(queue);
                  } else {
                    queueIndex = -1;
                  }
                  if (queue.length) {
                    drainQueue();
                  }
                }
                __name(cleanUpNextTick, "cleanUpNextTick");
                function drainQueue() {
                  if (draining) {
                    return;
                  }
                  var timeout = runTimeout(cleanUpNextTick);
                  draining = true;
                  var len = queue.length;
                  while (len) {
                    currentQueue = queue;
                    queue = [];
                    while (++queueIndex < len) {
                      if (currentQueue) {
                        currentQueue[queueIndex].run();
                      }
                    }
                    queueIndex = -1;
                    len = queue.length;
                  }
                  currentQueue = null;
                  draining = false;
                  runClearTimeout(timeout);
                }
                __name(drainQueue, "drainQueue");
                process.nextTick = function(fun) {
                  var args = new Array(arguments.length - 1);
                  if (arguments.length > 1) {
                    for (var i = 1; i < arguments.length; i++) {
                      args[i - 1] = arguments[i];
                    }
                  }
                  queue.push(new Item(fun, args));
                  if (queue.length === 1 && !draining) {
                    runTimeout(drainQueue);
                  }
                };
                function Item(fun, array) {
                  this.fun = fun;
                  this.array = array;
                }
                __name(Item, "Item");
                Item.prototype.run = function() {
                  this.fun.apply(null, this.array);
                };
                process.title = "browser";
                process.browser = true;
                process.env = {};
                process.argv = [];
                process.version = "";
                process.versions = {};
                function noop() {
                }
                __name(noop, "noop");
                process.on = noop;
                process.addListener = noop;
                process.once = noop;
                process.off = noop;
                process.removeListener = noop;
                process.removeAllListeners = noop;
                process.emit = noop;
                process.prependListener = noop;
                process.prependOnceListener = noop;
                process.listeners = function(name) {
                  return [];
                };
                process.binding = function(name) {
                  throw new Error("process.binding is not supported");
                };
                process.cwd = function() {
                  return "/";
                };
                process.chdir = function(dir) {
                  throw new Error("process.chdir is not supported");
                };
                process.umask = function() {
                  return 0;
                };
              }
            ),
            /***/
            307: (
              /***/
              (module2, __unused_webpack_exports, __webpack_require__2) => {
                var process = __webpack_require__2(169);
                if (process.env.npm_package_name === "pseudomap" && process.env.npm_lifecycle_script === "test") process.env.TEST_PSEUDOMAP = "true";
                if (typeof Map === "function" && !process.env.TEST_PSEUDOMAP) {
                  module2.exports = Map;
                } else {
                  module2.exports = __webpack_require__2(761);
                }
              }
            ),
            /***/
            761: (
              /***/
              (module2) => {
                var hasOwnProperty = Object.prototype.hasOwnProperty;
                module2.exports = PseudoMap;
                function PseudoMap(set2) {
                  if (!(this instanceof PseudoMap))
                    throw new TypeError("Constructor PseudoMap requires 'new'");
                  this.clear();
                  if (set2) {
                    if (set2 instanceof PseudoMap || typeof Map === "function" && set2 instanceof Map) set2.forEach(function(value, key) {
                      this.set(key, value);
                    }, this);
                    else if (Array.isArray(set2)) set2.forEach(function(kv) {
                      this.set(kv[0], kv[1]);
                    }, this);
                    else throw new TypeError("invalid argument");
                  }
                }
                __name(PseudoMap, "PseudoMap");
                PseudoMap.prototype.forEach = function(fn, thisp) {
                  thisp = thisp || this;
                  Object.keys(this._data).forEach(function(k) {
                    if (k !== "size") fn.call(thisp, this._data[k].value, this._data[k].key);
                  }, this);
                };
                PseudoMap.prototype.has = function(k) {
                  return !!find(this._data, k);
                };
                PseudoMap.prototype.get = function(k) {
                  var res = find(this._data, k);
                  return res && res.value;
                };
                PseudoMap.prototype.set = function(k, v) {
                  set(this._data, k, v);
                };
                PseudoMap.prototype.delete = function(k) {
                  var res = find(this._data, k);
                  if (res) {
                    delete this._data[res._index];
                    this._data.size--;
                  }
                };
                PseudoMap.prototype.clear = function() {
                  var data = /* @__PURE__ */ Object.create(null);
                  data.size = 0;
                  Object.defineProperty(this, "_data", {
                    value: data,
                    enumerable: false,
                    configurable: true,
                    writable: false
                  });
                };
                Object.defineProperty(PseudoMap.prototype, "size", {
                  get: /* @__PURE__ */ __name(function get() {
                    return this._data.size;
                  }, "get"),
                  set: /* @__PURE__ */ __name(function set2(n) {
                  }, "set"),
                  enumerable: true,
                  configurable: true
                });
                PseudoMap.prototype.values = PseudoMap.prototype.keys = PseudoMap.prototype.entries = function() {
                  throw new Error("iterators are not implemented in this version");
                };
                function same(a, b) {
                  return a === b || a !== a && b !== b;
                }
                __name(same, "same");
                function Entry(k, v, i) {
                  this.key = k;
                  this.value = v;
                  this._index = i;
                }
                __name(Entry, "Entry");
                function find(data, k) {
                  for (var i = 0, s = "_" + k, key = s; hasOwnProperty.call(data, key); key = s + i++) {
                    if (same(data[key].key, k)) return data[key];
                  }
                }
                __name(find, "find");
                function set(data, k, v) {
                  for (var i = 0, s = "_" + k, key = s; hasOwnProperty.call(data, key); key = s + i++) {
                    if (same(data[key].key, k)) {
                      data[key].value = v;
                      return;
                    }
                  }
                  data.size++;
                  data[key] = new Entry(k, v, key);
                }
                __name(set, "set");
              }
            ),
            /***/
            430: (
              /***/
              function(module2, exports2) {
                var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
                function _typeof(obj) {
                  "@babel/helpers - typeof";
                  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                    _typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                      return typeof obj2;
                    }, "_typeof");
                  } else {
                    _typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                      return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                    }, "_typeof");
                  }
                  return _typeof(obj);
                }
                __name(_typeof, "_typeof");
                (function(root, factory) {
                  "use strict";
                  if (true) {
                    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = factory, __WEBPACK_AMD_DEFINE_RESULT__ = typeof __WEBPACK_AMD_DEFINE_FACTORY__ === "function" ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports2, __WEBPACK_AMD_DEFINE_ARRAY__) : __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__ !== void 0 && (module2.exports = __WEBPACK_AMD_DEFINE_RESULT__));
                  } else {
                  }
                })(this, function() {
                  "use strict";
                  function _isNumber(n) {
                    return !isNaN(parseFloat(n)) && isFinite(n);
                  }
                  __name(_isNumber, "_isNumber");
                  function _capitalize(str) {
                    return str.charAt(0).toUpperCase() + str.substring(1);
                  }
                  __name(_capitalize, "_capitalize");
                  function _getter(p) {
                    return function() {
                      return this[p];
                    };
                  }
                  __name(_getter, "_getter");
                  var booleanProps = ["isConstructor", "isEval", "isNative", "isToplevel"];
                  var numericProps = ["columnNumber", "lineNumber"];
                  var stringProps = ["fileName", "functionName", "source"];
                  var arrayProps = ["args"];
                  var props = booleanProps.concat(numericProps, stringProps, arrayProps);
                  function StackFrame(obj) {
                    if (!obj) return;
                    for (var i2 = 0; i2 < props.length; i2++) {
                      if (obj[props[i2]] !== void 0) {
                        this["set" + _capitalize(props[i2])](obj[props[i2]]);
                      }
                    }
                  }
                  __name(StackFrame, "StackFrame");
                  StackFrame.prototype = {
                    getArgs: /* @__PURE__ */ __name(function getArgs() {
                      return this.args;
                    }, "getArgs"),
                    setArgs: /* @__PURE__ */ __name(function setArgs(v) {
                      if (Object.prototype.toString.call(v) !== "[object Array]") {
                        throw new TypeError("Args must be an Array");
                      }
                      this.args = v;
                    }, "setArgs"),
                    getEvalOrigin: /* @__PURE__ */ __name(function getEvalOrigin() {
                      return this.evalOrigin;
                    }, "getEvalOrigin"),
                    setEvalOrigin: /* @__PURE__ */ __name(function setEvalOrigin(v) {
                      if (v instanceof StackFrame) {
                        this.evalOrigin = v;
                      } else if (v instanceof Object) {
                        this.evalOrigin = new StackFrame(v);
                      } else {
                        throw new TypeError("Eval Origin must be an Object or StackFrame");
                      }
                    }, "setEvalOrigin"),
                    toString: /* @__PURE__ */ __name(function toString() {
                      var fileName = this.getFileName() || "";
                      var lineNumber = this.getLineNumber() || "";
                      var columnNumber = this.getColumnNumber() || "";
                      var functionName = this.getFunctionName() || "";
                      if (this.getIsEval()) {
                        if (fileName) {
                          return "[eval] (" + fileName + ":" + lineNumber + ":" + columnNumber + ")";
                        }
                        return "[eval]:" + lineNumber + ":" + columnNumber;
                      }
                      if (functionName) {
                        return functionName + " (" + fileName + ":" + lineNumber + ":" + columnNumber + ")";
                      }
                      return fileName + ":" + lineNumber + ":" + columnNumber;
                    }, "toString")
                  };
                  StackFrame.fromString = /* @__PURE__ */ __name(function StackFrame$$fromString(str) {
                    var argsStartIndex = str.indexOf("(");
                    var argsEndIndex = str.lastIndexOf(")");
                    var functionName = str.substring(0, argsStartIndex);
                    var args = str.substring(argsStartIndex + 1, argsEndIndex).split(",");
                    var locationString = str.substring(argsEndIndex + 1);
                    if (locationString.indexOf("@") === 0) {
                      var parts = /@(.+?)(?::(\d+))?(?::(\d+))?$/.exec(locationString, "");
                      var fileName = parts[1];
                      var lineNumber = parts[2];
                      var columnNumber = parts[3];
                    }
                    return new StackFrame({
                      functionName,
                      args: args || void 0,
                      fileName,
                      lineNumber: lineNumber || void 0,
                      columnNumber: columnNumber || void 0
                    });
                  }, "StackFrame$$fromString");
                  for (var i = 0; i < booleanProps.length; i++) {
                    StackFrame.prototype["get" + _capitalize(booleanProps[i])] = _getter(booleanProps[i]);
                    StackFrame.prototype["set" + _capitalize(booleanProps[i])] = /* @__PURE__ */ function(p) {
                      return function(v) {
                        this[p] = Boolean(v);
                      };
                    }(booleanProps[i]);
                  }
                  for (var j = 0; j < numericProps.length; j++) {
                    StackFrame.prototype["get" + _capitalize(numericProps[j])] = _getter(numericProps[j]);
                    StackFrame.prototype["set" + _capitalize(numericProps[j])] = /* @__PURE__ */ function(p) {
                      return function(v) {
                        if (!_isNumber(v)) {
                          throw new TypeError(p + " must be a Number");
                        }
                        this[p] = Number(v);
                      };
                    }(numericProps[j]);
                  }
                  for (var k = 0; k < stringProps.length; k++) {
                    StackFrame.prototype["get" + _capitalize(stringProps[k])] = _getter(stringProps[k]);
                    StackFrame.prototype["set" + _capitalize(stringProps[k])] = /* @__PURE__ */ function(p) {
                      return function(v) {
                        this[p] = String(v);
                      };
                    }(stringProps[k]);
                  }
                  return StackFrame;
                });
              }
            ),
            /***/
            718: (
              /***/
              (module2) => {
                if (typeof Object.create === "function") {
                  module2.exports = /* @__PURE__ */ __name(function inherits(ctor, superCtor) {
                    ctor.super_ = superCtor;
                    ctor.prototype = Object.create(superCtor.prototype, {
                      constructor: {
                        value: ctor,
                        enumerable: false,
                        writable: true,
                        configurable: true
                      }
                    });
                  }, "inherits");
                } else {
                  module2.exports = /* @__PURE__ */ __name(function inherits(ctor, superCtor) {
                    ctor.super_ = superCtor;
                    var TempCtor = /* @__PURE__ */ __name(function TempCtor2() {
                    }, "TempCtor");
                    TempCtor.prototype = superCtor.prototype;
                    ctor.prototype = new TempCtor();
                    ctor.prototype.constructor = ctor;
                  }, "inherits");
                }
              }
            ),
            /***/
            715: (
              /***/
              (module2) => {
                function _typeof(obj) {
                  "@babel/helpers - typeof";
                  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                    _typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                      return typeof obj2;
                    }, "_typeof");
                  } else {
                    _typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                      return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                    }, "_typeof");
                  }
                  return _typeof(obj);
                }
                __name(_typeof, "_typeof");
                module2.exports = /* @__PURE__ */ __name(function isBuffer(arg) {
                  return arg && _typeof(arg) === "object" && typeof arg.copy === "function" && typeof arg.fill === "function" && typeof arg.readUInt8 === "function";
                }, "isBuffer");
              }
            ),
            /***/
            82: (
              /***/
              (__unused_webpack_module, exports2, __webpack_require__2) => {
                var process = __webpack_require__2(169);
                function _typeof(obj) {
                  "@babel/helpers - typeof";
                  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                    _typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                      return typeof obj2;
                    }, "_typeof");
                  } else {
                    _typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                      return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                    }, "_typeof");
                  }
                  return _typeof(obj);
                }
                __name(_typeof, "_typeof");
                var formatRegExp = /%[sdj%]/g;
                exports2.format = function(f) {
                  if (!isString(f)) {
                    var objects = [];
                    for (var i = 0; i < arguments.length; i++) {
                      objects.push(inspect(arguments[i]));
                    }
                    return objects.join(" ");
                  }
                  var i = 1;
                  var args = arguments;
                  var len = args.length;
                  var str = String(f).replace(formatRegExp, function(x2) {
                    if (x2 === "%%") return "%";
                    if (i >= len) return x2;
                    switch (x2) {
                      case "%s":
                        return String(args[i++]);
                      case "%d":
                        return Number(args[i++]);
                      case "%j":
                        try {
                          return JSON.stringify(args[i++]);
                        } catch (_) {
                          return "[Circular]";
                        }
                      default:
                        return x2;
                    }
                  });
                  for (var x = args[i]; i < len; x = args[++i]) {
                    if (isNull(x) || !isObject(x)) {
                      str += " " + x;
                    } else {
                      str += " " + inspect(x);
                    }
                  }
                  return str;
                };
                exports2.deprecate = function(fn, msg) {
                  if (isUndefined(global.process)) {
                    return function() {
                      return exports2.deprecate(fn, msg).apply(this, arguments);
                    };
                  }
                  if (process.noDeprecation === true) {
                    return fn;
                  }
                  var warned = false;
                  function deprecated() {
                    if (!warned) {
                      if (process.throwDeprecation) {
                        throw new Error(msg);
                      } else if (process.traceDeprecation) {
                        console.trace(msg);
                      } else {
                        console.error(msg);
                      }
                      warned = true;
                    }
                    return fn.apply(this, arguments);
                  }
                  __name(deprecated, "deprecated");
                  return deprecated;
                };
                var debugs = {};
                var debugEnviron;
                exports2.debuglog = function(set) {
                  if (isUndefined(debugEnviron)) debugEnviron = process.env.NODE_DEBUG || "";
                  set = set.toUpperCase();
                  if (!debugs[set]) {
                    if (new RegExp("\\b" + set + "\\b", "i").test(debugEnviron)) {
                      var pid = process.pid;
                      debugs[set] = function() {
                        var msg = exports2.format.apply(exports2, arguments);
                        console.error("%s %d: %s", set, pid, msg);
                      };
                    } else {
                      debugs[set] = function() {
                      };
                    }
                  }
                  return debugs[set];
                };
                function inspect(obj, opts) {
                  var ctx = {
                    seen: [],
                    stylize: stylizeNoColor
                  };
                  if (arguments.length >= 3) ctx.depth = arguments[2];
                  if (arguments.length >= 4) ctx.colors = arguments[3];
                  if (isBoolean(opts)) {
                    ctx.showHidden = opts;
                  } else if (opts) {
                    exports2._extend(ctx, opts);
                  }
                  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
                  if (isUndefined(ctx.depth)) ctx.depth = 2;
                  if (isUndefined(ctx.colors)) ctx.colors = false;
                  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
                  if (ctx.colors) ctx.stylize = stylizeWithColor;
                  return formatValue(ctx, obj, ctx.depth);
                }
                __name(inspect, "inspect");
                exports2.inspect = inspect;
                inspect.colors = {
                  "bold": [1, 22],
                  "italic": [3, 23],
                  "underline": [4, 24],
                  "inverse": [7, 27],
                  "white": [37, 39],
                  "grey": [90, 39],
                  "black": [30, 39],
                  "blue": [34, 39],
                  "cyan": [36, 39],
                  "green": [32, 39],
                  "magenta": [35, 39],
                  "red": [31, 39],
                  "yellow": [33, 39]
                };
                inspect.styles = {
                  "special": "cyan",
                  "number": "yellow",
                  "boolean": "yellow",
                  "undefined": "grey",
                  "null": "bold",
                  "string": "green",
                  "date": "magenta",
                  // "name": intentionally not styling
                  "regexp": "red"
                };
                function stylizeWithColor(str, styleType) {
                  var style = inspect.styles[styleType];
                  if (style) {
                    return "\x1B[" + inspect.colors[style][0] + "m" + str + "\x1B[" + inspect.colors[style][1] + "m";
                  } else {
                    return str;
                  }
                }
                __name(stylizeWithColor, "stylizeWithColor");
                function stylizeNoColor(str, styleType) {
                  return str;
                }
                __name(stylizeNoColor, "stylizeNoColor");
                function arrayToHash(array) {
                  var hash = {};
                  array.forEach(function(val, idx) {
                    hash[val] = true;
                  });
                  return hash;
                }
                __name(arrayToHash, "arrayToHash");
                function formatValue(ctx, value, recurseTimes) {
                  if (ctx.customInspect && value && isFunction(value.inspect) && // Filter out the util module, it's inspect function is special
                  value.inspect !== exports2.inspect && // Also filter out any prototype objects using the circular check.
                  !(value.constructor && value.constructor.prototype === value)) {
                    var ret = value.inspect(recurseTimes, ctx);
                    if (!isString(ret)) {
                      ret = formatValue(ctx, ret, recurseTimes);
                    }
                    return ret;
                  }
                  var primitive = formatPrimitive(ctx, value);
                  if (primitive) {
                    return primitive;
                  }
                  var keys = Object.keys(value);
                  var visibleKeys = arrayToHash(keys);
                  if (ctx.showHidden) {
                    keys = Object.getOwnPropertyNames(value);
                  }
                  if (isError(value) && (keys.indexOf("message") >= 0 || keys.indexOf("description") >= 0)) {
                    return formatError(value);
                  }
                  if (keys.length === 0) {
                    if (isFunction(value)) {
                      var name = value.name ? ": " + value.name : "";
                      return ctx.stylize("[Function" + name + "]", "special");
                    }
                    if (isRegExp(value)) {
                      return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
                    }
                    if (isDate(value)) {
                      return ctx.stylize(Date.prototype.toString.call(value), "date");
                    }
                    if (isError(value)) {
                      return formatError(value);
                    }
                  }
                  var base = "", array = false, braces = ["{", "}"];
                  if (isArray(value)) {
                    array = true;
                    braces = ["[", "]"];
                  }
                  if (isFunction(value)) {
                    var n = value.name ? ": " + value.name : "";
                    base = " [Function" + n + "]";
                  }
                  if (isRegExp(value)) {
                    base = " " + RegExp.prototype.toString.call(value);
                  }
                  if (isDate(value)) {
                    base = " " + Date.prototype.toUTCString.call(value);
                  }
                  if (isError(value)) {
                    base = " " + formatError(value);
                  }
                  if (keys.length === 0 && (!array || value.length == 0)) {
                    return braces[0] + base + braces[1];
                  }
                  if (recurseTimes < 0) {
                    if (isRegExp(value)) {
                      return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
                    } else {
                      return ctx.stylize("[Object]", "special");
                    }
                  }
                  ctx.seen.push(value);
                  var output;
                  if (array) {
                    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
                  } else {
                    output = keys.map(function(key) {
                      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
                    });
                  }
                  ctx.seen.pop();
                  return reduceToSingleString(output, base, braces);
                }
                __name(formatValue, "formatValue");
                function formatPrimitive(ctx, value) {
                  if (isUndefined(value)) return ctx.stylize("undefined", "undefined");
                  if (isString(value)) {
                    var simple = "'" + JSON.stringify(value).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
                    return ctx.stylize(simple, "string");
                  }
                  if (isNumber(value)) return ctx.stylize("" + value, "number");
                  if (isBoolean(value)) return ctx.stylize("" + value, "boolean");
                  if (isNull(value)) return ctx.stylize("null", "null");
                }
                __name(formatPrimitive, "formatPrimitive");
                function formatError(value) {
                  return "[" + Error.prototype.toString.call(value) + "]";
                }
                __name(formatError, "formatError");
                function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
                  var output = [];
                  for (var i = 0, l = value.length; i < l; ++i) {
                    if (hasOwnProperty(value, String(i))) {
                      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true));
                    } else {
                      output.push("");
                    }
                  }
                  keys.forEach(function(key) {
                    if (!key.match(/^\d+$/)) {
                      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true));
                    }
                  });
                  return output;
                }
                __name(formatArray, "formatArray");
                function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
                  var name, str, desc;
                  desc = Object.getOwnPropertyDescriptor(value, key) || {
                    value: value[key]
                  };
                  if (desc.get) {
                    if (desc.set) {
                      str = ctx.stylize("[Getter/Setter]", "special");
                    } else {
                      str = ctx.stylize("[Getter]", "special");
                    }
                  } else {
                    if (desc.set) {
                      str = ctx.stylize("[Setter]", "special");
                    }
                  }
                  if (!hasOwnProperty(visibleKeys, key)) {
                    name = "[" + key + "]";
                  }
                  if (!str) {
                    if (ctx.seen.indexOf(desc.value) < 0) {
                      if (isNull(recurseTimes)) {
                        str = formatValue(ctx, desc.value, null);
                      } else {
                        str = formatValue(ctx, desc.value, recurseTimes - 1);
                      }
                      if (str.indexOf("\n") > -1) {
                        if (array) {
                          str = str.split("\n").map(function(line) {
                            return "  " + line;
                          }).join("\n").substr(2);
                        } else {
                          str = "\n" + str.split("\n").map(function(line) {
                            return "   " + line;
                          }).join("\n");
                        }
                      }
                    } else {
                      str = ctx.stylize("[Circular]", "special");
                    }
                  }
                  if (isUndefined(name)) {
                    if (array && key.match(/^\d+$/)) {
                      return str;
                    }
                    name = JSON.stringify("" + key);
                    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
                      name = name.substr(1, name.length - 2);
                      name = ctx.stylize(name, "name");
                    } else {
                      name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
                      name = ctx.stylize(name, "string");
                    }
                  }
                  return name + ": " + str;
                }
                __name(formatProperty, "formatProperty");
                function reduceToSingleString(output, base, braces) {
                  var numLinesEst = 0;
                  var length = output.reduce(function(prev, cur) {
                    numLinesEst++;
                    if (cur.indexOf("\n") >= 0) numLinesEst++;
                    return prev + cur.replace(/\u001b\[\d\d?m/g, "").length + 1;
                  }, 0);
                  if (length > 60) {
                    return braces[0] + (base === "" ? "" : base + "\n ") + " " + output.join(",\n  ") + " " + braces[1];
                  }
                  return braces[0] + base + " " + output.join(", ") + " " + braces[1];
                }
                __name(reduceToSingleString, "reduceToSingleString");
                function isArray(ar) {
                  return Array.isArray(ar);
                }
                __name(isArray, "isArray");
                exports2.isArray = isArray;
                function isBoolean(arg) {
                  return typeof arg === "boolean";
                }
                __name(isBoolean, "isBoolean");
                exports2.isBoolean = isBoolean;
                function isNull(arg) {
                  return arg === null;
                }
                __name(isNull, "isNull");
                exports2.isNull = isNull;
                function isNullOrUndefined(arg) {
                  return arg == null;
                }
                __name(isNullOrUndefined, "isNullOrUndefined");
                exports2.isNullOrUndefined = isNullOrUndefined;
                function isNumber(arg) {
                  return typeof arg === "number";
                }
                __name(isNumber, "isNumber");
                exports2.isNumber = isNumber;
                function isString(arg) {
                  return typeof arg === "string";
                }
                __name(isString, "isString");
                exports2.isString = isString;
                function isSymbol(arg) {
                  return _typeof(arg) === "symbol";
                }
                __name(isSymbol, "isSymbol");
                exports2.isSymbol = isSymbol;
                function isUndefined(arg) {
                  return arg === void 0;
                }
                __name(isUndefined, "isUndefined");
                exports2.isUndefined = isUndefined;
                function isRegExp(re) {
                  return isObject(re) && objectToString(re) === "[object RegExp]";
                }
                __name(isRegExp, "isRegExp");
                exports2.isRegExp = isRegExp;
                function isObject(arg) {
                  return _typeof(arg) === "object" && arg !== null;
                }
                __name(isObject, "isObject");
                exports2.isObject = isObject;
                function isDate(d) {
                  return isObject(d) && objectToString(d) === "[object Date]";
                }
                __name(isDate, "isDate");
                exports2.isDate = isDate;
                function isError(e) {
                  return isObject(e) && (objectToString(e) === "[object Error]" || e instanceof Error);
                }
                __name(isError, "isError");
                exports2.isError = isError;
                function isFunction(arg) {
                  return typeof arg === "function";
                }
                __name(isFunction, "isFunction");
                exports2.isFunction = isFunction;
                function isPrimitive(arg) {
                  return arg === null || typeof arg === "boolean" || typeof arg === "number" || typeof arg === "string" || _typeof(arg) === "symbol" || // ES6 symbol
                  typeof arg === "undefined";
                }
                __name(isPrimitive, "isPrimitive");
                exports2.isPrimitive = isPrimitive;
                exports2.isBuffer = __webpack_require__2(715);
                function objectToString(o) {
                  return Object.prototype.toString.call(o);
                }
                __name(objectToString, "objectToString");
                function pad(n) {
                  return n < 10 ? "0" + n.toString(10) : n.toString(10);
                }
                __name(pad, "pad");
                var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                function timestamp() {
                  var d = /* @__PURE__ */ new Date();
                  var time = [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(":");
                  return [d.getDate(), months[d.getMonth()], time].join(" ");
                }
                __name(timestamp, "timestamp");
                exports2.log = function() {
                  console.log("%s - %s", timestamp(), exports2.format.apply(exports2, arguments));
                };
                exports2.inherits = __webpack_require__2(718);
                exports2._extend = function(origin, add) {
                  if (!add || !isObject(add)) return origin;
                  var keys = Object.keys(add);
                  var i = keys.length;
                  while (i--) {
                    origin[keys[i]] = add[keys[i]];
                  }
                  return origin;
                };
                function hasOwnProperty(obj, prop) {
                  return Object.prototype.hasOwnProperty.call(obj, prop);
                }
                __name(hasOwnProperty, "hasOwnProperty");
              }
            ),
            /***/
            695: (
              /***/
              (module2) => {
                module2.exports = Yallist;
                Yallist.Node = Node2;
                Yallist.create = Yallist;
                function Yallist(list) {
                  var self2 = this;
                  if (!(self2 instanceof Yallist)) {
                    self2 = new Yallist();
                  }
                  self2.tail = null;
                  self2.head = null;
                  self2.length = 0;
                  if (list && typeof list.forEach === "function") {
                    list.forEach(function(item) {
                      self2.push(item);
                    });
                  } else if (arguments.length > 0) {
                    for (var i = 0, l = arguments.length; i < l; i++) {
                      self2.push(arguments[i]);
                    }
                  }
                  return self2;
                }
                __name(Yallist, "Yallist");
                Yallist.prototype.removeNode = function(node) {
                  if (node.list !== this) {
                    throw new Error("removing node which does not belong to this list");
                  }
                  var next = node.next;
                  var prev = node.prev;
                  if (next) {
                    next.prev = prev;
                  }
                  if (prev) {
                    prev.next = next;
                  }
                  if (node === this.head) {
                    this.head = next;
                  }
                  if (node === this.tail) {
                    this.tail = prev;
                  }
                  node.list.length--;
                  node.next = null;
                  node.prev = null;
                  node.list = null;
                };
                Yallist.prototype.unshiftNode = function(node) {
                  if (node === this.head) {
                    return;
                  }
                  if (node.list) {
                    node.list.removeNode(node);
                  }
                  var head = this.head;
                  node.list = this;
                  node.next = head;
                  if (head) {
                    head.prev = node;
                  }
                  this.head = node;
                  if (!this.tail) {
                    this.tail = node;
                  }
                  this.length++;
                };
                Yallist.prototype.pushNode = function(node) {
                  if (node === this.tail) {
                    return;
                  }
                  if (node.list) {
                    node.list.removeNode(node);
                  }
                  var tail = this.tail;
                  node.list = this;
                  node.prev = tail;
                  if (tail) {
                    tail.next = node;
                  }
                  this.tail = node;
                  if (!this.head) {
                    this.head = node;
                  }
                  this.length++;
                };
                Yallist.prototype.push = function() {
                  for (var i = 0, l = arguments.length; i < l; i++) {
                    push(this, arguments[i]);
                  }
                  return this.length;
                };
                Yallist.prototype.unshift = function() {
                  for (var i = 0, l = arguments.length; i < l; i++) {
                    unshift(this, arguments[i]);
                  }
                  return this.length;
                };
                Yallist.prototype.pop = function() {
                  if (!this.tail) {
                    return void 0;
                  }
                  var res = this.tail.value;
                  this.tail = this.tail.prev;
                  if (this.tail) {
                    this.tail.next = null;
                  } else {
                    this.head = null;
                  }
                  this.length--;
                  return res;
                };
                Yallist.prototype.shift = function() {
                  if (!this.head) {
                    return void 0;
                  }
                  var res = this.head.value;
                  this.head = this.head.next;
                  if (this.head) {
                    this.head.prev = null;
                  } else {
                    this.tail = null;
                  }
                  this.length--;
                  return res;
                };
                Yallist.prototype.forEach = function(fn, thisp) {
                  thisp = thisp || this;
                  for (var walker = this.head, i = 0; walker !== null; i++) {
                    fn.call(thisp, walker.value, i, this);
                    walker = walker.next;
                  }
                };
                Yallist.prototype.forEachReverse = function(fn, thisp) {
                  thisp = thisp || this;
                  for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
                    fn.call(thisp, walker.value, i, this);
                    walker = walker.prev;
                  }
                };
                Yallist.prototype.get = function(n) {
                  for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
                    walker = walker.next;
                  }
                  if (i === n && walker !== null) {
                    return walker.value;
                  }
                };
                Yallist.prototype.getReverse = function(n) {
                  for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
                    walker = walker.prev;
                  }
                  if (i === n && walker !== null) {
                    return walker.value;
                  }
                };
                Yallist.prototype.map = function(fn, thisp) {
                  thisp = thisp || this;
                  var res = new Yallist();
                  for (var walker = this.head; walker !== null; ) {
                    res.push(fn.call(thisp, walker.value, this));
                    walker = walker.next;
                  }
                  return res;
                };
                Yallist.prototype.mapReverse = function(fn, thisp) {
                  thisp = thisp || this;
                  var res = new Yallist();
                  for (var walker = this.tail; walker !== null; ) {
                    res.push(fn.call(thisp, walker.value, this));
                    walker = walker.prev;
                  }
                  return res;
                };
                Yallist.prototype.reduce = function(fn, initial) {
                  var acc;
                  var walker = this.head;
                  if (arguments.length > 1) {
                    acc = initial;
                  } else if (this.head) {
                    walker = this.head.next;
                    acc = this.head.value;
                  } else {
                    throw new TypeError("Reduce of empty list with no initial value");
                  }
                  for (var i = 0; walker !== null; i++) {
                    acc = fn(acc, walker.value, i);
                    walker = walker.next;
                  }
                  return acc;
                };
                Yallist.prototype.reduceReverse = function(fn, initial) {
                  var acc;
                  var walker = this.tail;
                  if (arguments.length > 1) {
                    acc = initial;
                  } else if (this.tail) {
                    walker = this.tail.prev;
                    acc = this.tail.value;
                  } else {
                    throw new TypeError("Reduce of empty list with no initial value");
                  }
                  for (var i = this.length - 1; walker !== null; i--) {
                    acc = fn(acc, walker.value, i);
                    walker = walker.prev;
                  }
                  return acc;
                };
                Yallist.prototype.toArray = function() {
                  var arr = new Array(this.length);
                  for (var i = 0, walker = this.head; walker !== null; i++) {
                    arr[i] = walker.value;
                    walker = walker.next;
                  }
                  return arr;
                };
                Yallist.prototype.toArrayReverse = function() {
                  var arr = new Array(this.length);
                  for (var i = 0, walker = this.tail; walker !== null; i++) {
                    arr[i] = walker.value;
                    walker = walker.prev;
                  }
                  return arr;
                };
                Yallist.prototype.slice = function(from, to) {
                  to = to || this.length;
                  if (to < 0) {
                    to += this.length;
                  }
                  from = from || 0;
                  if (from < 0) {
                    from += this.length;
                  }
                  var ret = new Yallist();
                  if (to < from || to < 0) {
                    return ret;
                  }
                  if (from < 0) {
                    from = 0;
                  }
                  if (to > this.length) {
                    to = this.length;
                  }
                  for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
                    walker = walker.next;
                  }
                  for (; walker !== null && i < to; i++, walker = walker.next) {
                    ret.push(walker.value);
                  }
                  return ret;
                };
                Yallist.prototype.sliceReverse = function(from, to) {
                  to = to || this.length;
                  if (to < 0) {
                    to += this.length;
                  }
                  from = from || 0;
                  if (from < 0) {
                    from += this.length;
                  }
                  var ret = new Yallist();
                  if (to < from || to < 0) {
                    return ret;
                  }
                  if (from < 0) {
                    from = 0;
                  }
                  if (to > this.length) {
                    to = this.length;
                  }
                  for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
                    walker = walker.prev;
                  }
                  for (; walker !== null && i > from; i--, walker = walker.prev) {
                    ret.push(walker.value);
                  }
                  return ret;
                };
                Yallist.prototype.reverse = function() {
                  var head = this.head;
                  var tail = this.tail;
                  for (var walker = head; walker !== null; walker = walker.prev) {
                    var p = walker.prev;
                    walker.prev = walker.next;
                    walker.next = p;
                  }
                  this.head = tail;
                  this.tail = head;
                  return this;
                };
                function push(self2, item) {
                  self2.tail = new Node2(item, self2.tail, null, self2);
                  if (!self2.head) {
                    self2.head = self2.tail;
                  }
                  self2.length++;
                }
                __name(push, "push");
                function unshift(self2, item) {
                  self2.head = new Node2(item, null, self2.head, self2);
                  if (!self2.tail) {
                    self2.tail = self2.head;
                  }
                  self2.length++;
                }
                __name(unshift, "unshift");
                function Node2(value, prev, next, list) {
                  if (!(this instanceof Node2)) {
                    return new Node2(value, prev, next, list);
                  }
                  this.list = list;
                  this.value = value;
                  if (prev) {
                    prev.next = this;
                    this.prev = prev;
                  } else {
                    this.prev = null;
                  }
                  if (next) {
                    next.prev = this;
                    this.next = next;
                  } else {
                    this.next = null;
                  }
                }
                __name(Node2, "Node");
              }
            )
            /******/
          };
          var __webpack_module_cache__ = {};
          function __webpack_require__(moduleId) {
            var cachedModule = __webpack_module_cache__[moduleId];
            if (cachedModule !== void 0) {
              return cachedModule.exports;
            }
            var module2 = __webpack_module_cache__[moduleId] = {
              /******/
              // no module.id needed
              /******/
              // no module.loaded needed
              /******/
              exports: {}
              /******/
            };
            __webpack_modules__[moduleId].call(module2.exports, module2, module2.exports, __webpack_require__);
            return module2.exports;
          }
          __name(__webpack_require__, "__webpack_require__");
          (() => {
            __webpack_require__.n = (module2) => {
              var getter = module2 && module2.__esModule ? (
                /******/
                () => module2["default"]
              ) : (
                /******/
                () => module2
              );
              __webpack_require__.d(getter, { a: getter });
              return getter;
            };
          })();
          (() => {
            __webpack_require__.d = (exports2, definition) => {
              for (var key in definition) {
                if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports2, key)) {
                  Object.defineProperty(exports2, key, { enumerable: true, get: definition[key] });
                }
              }
            };
          })();
          (() => {
            __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
          })();
          (() => {
            __webpack_require__.r = (exports2) => {
              if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
                Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
              }
              Object.defineProperty(exports2, "__esModule", { value: true });
            };
          })();
          var __webpack_exports__ = {};
          (() => {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            __webpack_require__.d(__webpack_exports__, {
              "connectToDevTools": /* @__PURE__ */ __name(() => (
                /* binding */
                connectToDevTools
              ), "connectToDevTools")
            });
            ;
            function _classCallCheck(instance, Constructor) {
              if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
              }
            }
            __name(_classCallCheck, "_classCallCheck");
            function _defineProperties(target, props) {
              for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
              }
            }
            __name(_defineProperties, "_defineProperties");
            function _createClass(Constructor, protoProps, staticProps) {
              if (protoProps) _defineProperties(Constructor.prototype, protoProps);
              if (staticProps) _defineProperties(Constructor, staticProps);
              return Constructor;
            }
            __name(_createClass, "_createClass");
            function _defineProperty(obj, key, value) {
              if (key in obj) {
                Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
              } else {
                obj[key] = value;
              }
              return obj;
            }
            __name(_defineProperty, "_defineProperty");
            var EventEmitter = /* @__PURE__ */ function() {
              function EventEmitter2() {
                _classCallCheck(this, EventEmitter2);
                _defineProperty(this, "listenersMap", /* @__PURE__ */ new Map());
              }
              __name(EventEmitter2, "EventEmitter");
              _createClass(EventEmitter2, [{
                key: "addListener",
                value: /* @__PURE__ */ __name(function addListener(event, listener) {
                  var listeners = this.listenersMap.get(event);
                  if (listeners === void 0) {
                    this.listenersMap.set(event, [listener]);
                  } else {
                    var index = listeners.indexOf(listener);
                    if (index < 0) {
                      listeners.push(listener);
                    }
                  }
                }, "addListener")
              }, {
                key: "emit",
                value: /* @__PURE__ */ __name(function emit(event) {
                  var listeners = this.listenersMap.get(event);
                  if (listeners !== void 0) {
                    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                      args[_key - 1] = arguments[_key];
                    }
                    if (listeners.length === 1) {
                      var listener = listeners[0];
                      listener.apply(null, args);
                    } else {
                      var didThrow = false;
                      var caughtError = null;
                      var clonedListeners = Array.from(listeners);
                      for (var i = 0; i < clonedListeners.length; i++) {
                        var _listener = clonedListeners[i];
                        try {
                          _listener.apply(null, args);
                        } catch (error) {
                          if (caughtError === null) {
                            didThrow = true;
                            caughtError = error;
                          }
                        }
                      }
                      if (didThrow) {
                        throw caughtError;
                      }
                    }
                  }
                }, "emit")
              }, {
                key: "removeAllListeners",
                value: /* @__PURE__ */ __name(function removeAllListeners() {
                  this.listenersMap.clear();
                }, "removeAllListeners")
              }, {
                key: "removeListener",
                value: /* @__PURE__ */ __name(function removeListener(event, listener) {
                  var listeners = this.listenersMap.get(event);
                  if (listeners !== void 0) {
                    var index = listeners.indexOf(listener);
                    if (index >= 0) {
                      listeners.splice(index, 1);
                    }
                  }
                }, "removeListener")
              }]);
              return EventEmitter2;
            }();
            var lodash_throttle = __webpack_require__(172);
            var lodash_throttle_default = /* @__PURE__ */ __webpack_require__.n(lodash_throttle);
            ;
            var CHROME_WEBSTORE_EXTENSION_ID = "fmkadmapgofadopljbjfkapdkoienihi";
            var INTERNAL_EXTENSION_ID = "dnjnjgbfilfphmojnmhliehogmojhclc";
            var LOCAL_EXTENSION_ID = "ikiahnapldjmdmpkmfhjdjilojjhgcbf";
            var __DEBUG__ = false;
            var __PERFORMANCE_PROFILE__ = false;
            var TREE_OPERATION_ADD = 1;
            var TREE_OPERATION_REMOVE = 2;
            var TREE_OPERATION_REORDER_CHILDREN = 3;
            var TREE_OPERATION_UPDATE_TREE_BASE_DURATION = 4;
            var TREE_OPERATION_UPDATE_ERRORS_OR_WARNINGS = 5;
            var TREE_OPERATION_REMOVE_ROOT = 6;
            var TREE_OPERATION_SET_SUBTREE_MODE = 7;
            var PROFILING_FLAG_BASIC_SUPPORT = 1;
            var PROFILING_FLAG_TIMELINE_SUPPORT = 2;
            var LOCAL_STORAGE_DEFAULT_TAB_KEY = "React::DevTools::defaultTab";
            var constants_LOCAL_STORAGE_COMPONENT_FILTER_PREFERENCES_KEY = "React::DevTools::componentFilters";
            var SESSION_STORAGE_LAST_SELECTION_KEY = "React::DevTools::lastSelection";
            var constants_LOCAL_STORAGE_OPEN_IN_EDITOR_URL = "React::DevTools::openInEditorUrl";
            var LOCAL_STORAGE_OPEN_IN_EDITOR_URL_PRESET = "React::DevTools::openInEditorUrlPreset";
            var LOCAL_STORAGE_PARSE_HOOK_NAMES_KEY = "React::DevTools::parseHookNames";
            var SESSION_STORAGE_RECORD_CHANGE_DESCRIPTIONS_KEY = "React::DevTools::recordChangeDescriptions";
            var SESSION_STORAGE_RELOAD_AND_PROFILE_KEY = "React::DevTools::reloadAndProfile";
            var constants_LOCAL_STORAGE_SHOULD_BREAK_ON_CONSOLE_ERRORS = "React::DevTools::breakOnConsoleErrors";
            var LOCAL_STORAGE_BROWSER_THEME = "React::DevTools::theme";
            var constants_LOCAL_STORAGE_SHOULD_APPEND_COMPONENT_STACK_KEY = "React::DevTools::appendComponentStack";
            var constants_LOCAL_STORAGE_SHOW_INLINE_WARNINGS_AND_ERRORS_KEY = "React::DevTools::showInlineWarningsAndErrors";
            var LOCAL_STORAGE_TRACE_UPDATES_ENABLED_KEY = "React::DevTools::traceUpdatesEnabled";
            var constants_LOCAL_STORAGE_HIDE_CONSOLE_LOGS_IN_STRICT_MODE = "React::DevTools::hideConsoleLogsInStrictMode";
            var LOCAL_STORAGE_SUPPORTS_PROFILING_KEY = "React::DevTools::supportsProfiling";
            var PROFILER_EXPORT_VERSION = 5;
            ;
            function storage_localStorageGetItem(key) {
              try {
                return localStorage.getItem(key);
              } catch (error) {
                return null;
              }
            }
            __name(storage_localStorageGetItem, "storage_localStorageGetItem");
            function localStorageRemoveItem(key) {
              try {
                localStorage.removeItem(key);
              } catch (error) {
              }
            }
            __name(localStorageRemoveItem, "localStorageRemoveItem");
            function storage_localStorageSetItem(key, value) {
              try {
                return localStorage.setItem(key, value);
              } catch (error) {
              }
            }
            __name(storage_localStorageSetItem, "storage_localStorageSetItem");
            function sessionStorageGetItem(key) {
              try {
                return sessionStorage.getItem(key);
              } catch (error) {
                return null;
              }
            }
            __name(sessionStorageGetItem, "sessionStorageGetItem");
            function sessionStorageRemoveItem(key) {
              try {
                sessionStorage.removeItem(key);
              } catch (error) {
              }
            }
            __name(sessionStorageRemoveItem, "sessionStorageRemoveItem");
            function sessionStorageSetItem(key, value) {
              try {
                return sessionStorage.setItem(key, value);
              } catch (error) {
              }
            }
            __name(sessionStorageSetItem, "sessionStorageSetItem");
            ;
            var simpleIsEqual = /* @__PURE__ */ __name(function simpleIsEqual2(a, b) {
              return a === b;
            }, "simpleIsEqual");
            function esm(resultFn) {
              var isEqual = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : simpleIsEqual;
              var lastThis = void 0;
              var lastArgs = [];
              var lastResult = void 0;
              var calledOnce = false;
              var isNewArgEqualToLast = /* @__PURE__ */ __name(function isNewArgEqualToLast2(newArg, index) {
                return isEqual(newArg, lastArgs[index]);
              }, "isNewArgEqualToLast");
              var result = /* @__PURE__ */ __name(function result2() {
                for (var _len = arguments.length, newArgs = Array(_len), _key = 0; _key < _len; _key++) {
                  newArgs[_key] = arguments[_key];
                }
                if (calledOnce && lastThis === this && newArgs.length === lastArgs.length && newArgs.every(isNewArgEqualToLast)) {
                  return lastResult;
                }
                calledOnce = true;
                lastThis = this;
                lastArgs = newArgs;
                lastResult = resultFn.apply(this, newArgs);
                return lastResult;
              }, "result");
              return result;
            }
            __name(esm, "esm");
            ;
            function getOwnerWindow(node) {
              if (!node.ownerDocument) {
                return null;
              }
              return node.ownerDocument.defaultView;
            }
            __name(getOwnerWindow, "getOwnerWindow");
            function getOwnerIframe(node) {
              var nodeWindow = getOwnerWindow(node);
              if (nodeWindow) {
                return nodeWindow.frameElement;
              }
              return null;
            }
            __name(getOwnerIframe, "getOwnerIframe");
            function getBoundingClientRectWithBorderOffset(node) {
              var dimensions = getElementDimensions(node);
              return mergeRectOffsets([node.getBoundingClientRect(), {
                top: dimensions.borderTop,
                left: dimensions.borderLeft,
                bottom: dimensions.borderBottom,
                right: dimensions.borderRight,
                // This width and height won't get used by mergeRectOffsets (since this
                // is not the first rect in the array), but we set them so that this
                // object type checks as a ClientRect.
                width: 0,
                height: 0
              }]);
            }
            __name(getBoundingClientRectWithBorderOffset, "getBoundingClientRectWithBorderOffset");
            function mergeRectOffsets(rects) {
              return rects.reduce(function(previousRect, rect) {
                if (previousRect == null) {
                  return rect;
                }
                return {
                  top: previousRect.top + rect.top,
                  left: previousRect.left + rect.left,
                  width: previousRect.width,
                  height: previousRect.height,
                  bottom: previousRect.bottom + rect.bottom,
                  right: previousRect.right + rect.right
                };
              });
            }
            __name(mergeRectOffsets, "mergeRectOffsets");
            function getNestedBoundingClientRect(node, boundaryWindow) {
              var ownerIframe = getOwnerIframe(node);
              if (ownerIframe && ownerIframe !== boundaryWindow) {
                var rects = [node.getBoundingClientRect()];
                var currentIframe = ownerIframe;
                var onlyOneMore = false;
                while (currentIframe) {
                  var rect = getBoundingClientRectWithBorderOffset(currentIframe);
                  rects.push(rect);
                  currentIframe = getOwnerIframe(currentIframe);
                  if (onlyOneMore) {
                    break;
                  }
                  if (currentIframe && getOwnerWindow(currentIframe) === boundaryWindow) {
                    onlyOneMore = true;
                  }
                }
                return mergeRectOffsets(rects);
              } else {
                return node.getBoundingClientRect();
              }
            }
            __name(getNestedBoundingClientRect, "getNestedBoundingClientRect");
            function getElementDimensions(domElement) {
              var calculatedStyle = window.getComputedStyle(domElement);
              return {
                borderLeft: parseInt(calculatedStyle.borderLeftWidth, 10),
                borderRight: parseInt(calculatedStyle.borderRightWidth, 10),
                borderTop: parseInt(calculatedStyle.borderTopWidth, 10),
                borderBottom: parseInt(calculatedStyle.borderBottomWidth, 10),
                marginLeft: parseInt(calculatedStyle.marginLeft, 10),
                marginRight: parseInt(calculatedStyle.marginRight, 10),
                marginTop: parseInt(calculatedStyle.marginTop, 10),
                marginBottom: parseInt(calculatedStyle.marginBottom, 10),
                paddingLeft: parseInt(calculatedStyle.paddingLeft, 10),
                paddingRight: parseInt(calculatedStyle.paddingRight, 10),
                paddingTop: parseInt(calculatedStyle.paddingTop, 10),
                paddingBottom: parseInt(calculatedStyle.paddingBottom, 10)
              };
            }
            __name(getElementDimensions, "getElementDimensions");
            ;
            function Overlay_classCallCheck(instance, Constructor) {
              if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
              }
            }
            __name(Overlay_classCallCheck, "Overlay_classCallCheck");
            function Overlay_defineProperties(target, props) {
              for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
              }
            }
            __name(Overlay_defineProperties, "Overlay_defineProperties");
            function Overlay_createClass(Constructor, protoProps, staticProps) {
              if (protoProps) Overlay_defineProperties(Constructor.prototype, protoProps);
              if (staticProps) Overlay_defineProperties(Constructor, staticProps);
              return Constructor;
            }
            __name(Overlay_createClass, "Overlay_createClass");
            var Overlay_assign = Object.assign;
            var OverlayRect = /* @__PURE__ */ function() {
              function OverlayRect2(doc, container) {
                Overlay_classCallCheck(this, OverlayRect2);
                this.node = doc.createElement("div");
                this.border = doc.createElement("div");
                this.padding = doc.createElement("div");
                this.content = doc.createElement("div");
                this.border.style.borderColor = overlayStyles.border;
                this.padding.style.borderColor = overlayStyles.padding;
                this.content.style.backgroundColor = overlayStyles.background;
                Overlay_assign(this.node.style, {
                  borderColor: overlayStyles.margin,
                  pointerEvents: "none",
                  position: "fixed"
                });
                this.node.style.zIndex = "10000000";
                this.node.appendChild(this.border);
                this.border.appendChild(this.padding);
                this.padding.appendChild(this.content);
                container.appendChild(this.node);
              }
              __name(OverlayRect2, "OverlayRect");
              Overlay_createClass(OverlayRect2, [{
                key: "remove",
                value: /* @__PURE__ */ __name(function remove() {
                  if (this.node.parentNode) {
                    this.node.parentNode.removeChild(this.node);
                  }
                }, "remove")
              }, {
                key: "update",
                value: /* @__PURE__ */ __name(function update(box, dims) {
                  boxWrap(dims, "margin", this.node);
                  boxWrap(dims, "border", this.border);
                  boxWrap(dims, "padding", this.padding);
                  Overlay_assign(this.content.style, {
                    height: box.height - dims.borderTop - dims.borderBottom - dims.paddingTop - dims.paddingBottom + "px",
                    width: box.width - dims.borderLeft - dims.borderRight - dims.paddingLeft - dims.paddingRight + "px"
                  });
                  Overlay_assign(this.node.style, {
                    top: box.top - dims.marginTop + "px",
                    left: box.left - dims.marginLeft + "px"
                  });
                }, "update")
              }]);
              return OverlayRect2;
            }();
            var OverlayTip = /* @__PURE__ */ function() {
              function OverlayTip2(doc, container) {
                Overlay_classCallCheck(this, OverlayTip2);
                this.tip = doc.createElement("div");
                Overlay_assign(this.tip.style, {
                  display: "flex",
                  flexFlow: "row nowrap",
                  backgroundColor: "#333740",
                  borderRadius: "2px",
                  fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
                  fontWeight: "bold",
                  padding: "3px 5px",
                  pointerEvents: "none",
                  position: "fixed",
                  fontSize: "12px",
                  whiteSpace: "nowrap"
                });
                this.nameSpan = doc.createElement("span");
                this.tip.appendChild(this.nameSpan);
                Overlay_assign(this.nameSpan.style, {
                  color: "#ee78e6",
                  borderRight: "1px solid #aaaaaa",
                  paddingRight: "0.5rem",
                  marginRight: "0.5rem"
                });
                this.dimSpan = doc.createElement("span");
                this.tip.appendChild(this.dimSpan);
                Overlay_assign(this.dimSpan.style, {
                  color: "#d7d7d7"
                });
                this.tip.style.zIndex = "10000000";
                container.appendChild(this.tip);
              }
              __name(OverlayTip2, "OverlayTip");
              Overlay_createClass(OverlayTip2, [{
                key: "remove",
                value: /* @__PURE__ */ __name(function remove() {
                  if (this.tip.parentNode) {
                    this.tip.parentNode.removeChild(this.tip);
                  }
                }, "remove")
              }, {
                key: "updateText",
                value: /* @__PURE__ */ __name(function updateText(name, width, height) {
                  this.nameSpan.textContent = name;
                  this.dimSpan.textContent = Math.round(width) + "px \xD7 " + Math.round(height) + "px";
                }, "updateText")
              }, {
                key: "updatePosition",
                value: /* @__PURE__ */ __name(function updatePosition(dims, bounds) {
                  var tipRect = this.tip.getBoundingClientRect();
                  var tipPos = findTipPos(dims, bounds, {
                    width: tipRect.width,
                    height: tipRect.height
                  });
                  Overlay_assign(this.tip.style, tipPos.style);
                }, "updatePosition")
              }]);
              return OverlayTip2;
            }();
            var Overlay = /* @__PURE__ */ function() {
              function Overlay2(agent2) {
                Overlay_classCallCheck(this, Overlay2);
                var currentWindow = window.__REACT_DEVTOOLS_TARGET_WINDOW__ || window;
                this.window = currentWindow;
                var tipBoundsWindow = window.__REACT_DEVTOOLS_TARGET_WINDOW__ || window;
                this.tipBoundsWindow = tipBoundsWindow;
                var doc = currentWindow.document;
                this.container = doc.createElement("div");
                this.container.style.zIndex = "10000000";
                this.tip = new OverlayTip(doc, this.container);
                this.rects = [];
                this.agent = agent2;
                doc.body.appendChild(this.container);
              }
              __name(Overlay2, "Overlay");
              Overlay_createClass(Overlay2, [{
                key: "remove",
                value: /* @__PURE__ */ __name(function remove() {
                  this.tip.remove();
                  this.rects.forEach(function(rect) {
                    rect.remove();
                  });
                  this.rects.length = 0;
                  if (this.container.parentNode) {
                    this.container.parentNode.removeChild(this.container);
                  }
                }, "remove")
              }, {
                key: "inspect",
                value: /* @__PURE__ */ __name(function inspect(nodes, name) {
                  var _this = this;
                  var elements = nodes.filter(function(node2) {
                    return node2.nodeType === Node.ELEMENT_NODE;
                  });
                  while (this.rects.length > elements.length) {
                    var rect = this.rects.pop();
                    rect.remove();
                  }
                  if (elements.length === 0) {
                    return;
                  }
                  while (this.rects.length < elements.length) {
                    this.rects.push(new OverlayRect(this.window.document, this.container));
                  }
                  var outerBox = {
                    top: Number.POSITIVE_INFINITY,
                    right: Number.NEGATIVE_INFINITY,
                    bottom: Number.NEGATIVE_INFINITY,
                    left: Number.POSITIVE_INFINITY
                  };
                  elements.forEach(function(element, index) {
                    var box = getNestedBoundingClientRect(element, _this.window);
                    var dims = getElementDimensions(element);
                    outerBox.top = Math.min(outerBox.top, box.top - dims.marginTop);
                    outerBox.right = Math.max(outerBox.right, box.left + box.width + dims.marginRight);
                    outerBox.bottom = Math.max(outerBox.bottom, box.top + box.height + dims.marginBottom);
                    outerBox.left = Math.min(outerBox.left, box.left - dims.marginLeft);
                    var rect2 = _this.rects[index];
                    rect2.update(box, dims);
                  });
                  if (!name) {
                    name = elements[0].nodeName.toLowerCase();
                    var node = elements[0];
                    var rendererInterface = this.agent.getBestMatchingRendererInterface(node);
                    if (rendererInterface) {
                      var id = rendererInterface.getFiberIDForNative(node, true);
                      if (id) {
                        var ownerName = rendererInterface.getDisplayNameForFiberID(id, true);
                        if (ownerName) {
                          name += " (in " + ownerName + ")";
                        }
                      }
                    }
                  }
                  this.tip.updateText(name, outerBox.right - outerBox.left, outerBox.bottom - outerBox.top);
                  var tipBounds = getNestedBoundingClientRect(this.tipBoundsWindow.document.documentElement, this.window);
                  this.tip.updatePosition({
                    top: outerBox.top,
                    left: outerBox.left,
                    height: outerBox.bottom - outerBox.top,
                    width: outerBox.right - outerBox.left
                  }, {
                    top: tipBounds.top + this.tipBoundsWindow.scrollY,
                    left: tipBounds.left + this.tipBoundsWindow.scrollX,
                    height: this.tipBoundsWindow.innerHeight,
                    width: this.tipBoundsWindow.innerWidth
                  });
                }, "inspect")
              }]);
              return Overlay2;
            }();
            function findTipPos(dims, bounds, tipSize) {
              var tipHeight = Math.max(tipSize.height, 20);
              var tipWidth = Math.max(tipSize.width, 60);
              var margin = 5;
              var top;
              if (dims.top + dims.height + tipHeight <= bounds.top + bounds.height) {
                if (dims.top + dims.height < bounds.top + 0) {
                  top = bounds.top + margin;
                } else {
                  top = dims.top + dims.height + margin;
                }
              } else if (dims.top - tipHeight <= bounds.top + bounds.height) {
                if (dims.top - tipHeight - margin < bounds.top + margin) {
                  top = bounds.top + margin;
                } else {
                  top = dims.top - tipHeight - margin;
                }
              } else {
                top = bounds.top + bounds.height - tipHeight - margin;
              }
              var left = dims.left + margin;
              if (dims.left < bounds.left) {
                left = bounds.left + margin;
              }
              if (dims.left + tipWidth > bounds.left + bounds.width) {
                left = bounds.left + bounds.width - tipWidth - margin;
              }
              top += "px";
              left += "px";
              return {
                style: {
                  top,
                  left
                }
              };
            }
            __name(findTipPos, "findTipPos");
            function boxWrap(dims, what, node) {
              Overlay_assign(node.style, {
                borderTopWidth: dims[what + "Top"] + "px",
                borderLeftWidth: dims[what + "Left"] + "px",
                borderRightWidth: dims[what + "Right"] + "px",
                borderBottomWidth: dims[what + "Bottom"] + "px",
                borderStyle: "solid"
              });
            }
            __name(boxWrap, "boxWrap");
            var overlayStyles = {
              background: "rgba(120, 170, 210, 0.7)",
              padding: "rgba(77, 200, 0, 0.3)",
              margin: "rgba(255, 155, 0, 0.3)",
              border: "rgba(255, 200, 50, 0.3)"
            };
            ;
            var SHOW_DURATION = 2e3;
            var timeoutID = null;
            var overlay = null;
            function hideOverlay(agent2) {
              if (window.document == null) {
                agent2.emit("hideNativeHighlight");
                return;
              }
              timeoutID = null;
              if (overlay !== null) {
                overlay.remove();
                overlay = null;
              }
            }
            __name(hideOverlay, "hideOverlay");
            function showOverlay(elements, componentName, agent2, hideAfterTimeout) {
              if (window.document == null) {
                if (elements != null && elements[0] != null) {
                  agent2.emit("showNativeHighlight", elements[0]);
                }
                return;
              }
              if (timeoutID !== null) {
                clearTimeout(timeoutID);
              }
              if (elements == null) {
                return;
              }
              if (overlay === null) {
                overlay = new Overlay(agent2);
              }
              overlay.inspect(elements, componentName);
              if (hideAfterTimeout) {
                timeoutID = setTimeout(function() {
                  return hideOverlay(agent2);
                }, SHOW_DURATION);
              }
            }
            __name(showOverlay, "showOverlay");
            ;
            var iframesListeningTo = /* @__PURE__ */ new Set();
            function setupHighlighter(bridge, agent2) {
              bridge.addListener("clearNativeElementHighlight", clearNativeElementHighlight);
              bridge.addListener("highlightNativeElement", highlightNativeElement);
              bridge.addListener("shutdown", stopInspectingNative);
              bridge.addListener("startInspectingNative", startInspectingNative);
              bridge.addListener("stopInspectingNative", stopInspectingNative);
              function startInspectingNative() {
                registerListenersOnWindow(window);
              }
              __name(startInspectingNative, "startInspectingNative");
              function registerListenersOnWindow(window2) {
                if (window2 && typeof window2.addEventListener === "function") {
                  window2.addEventListener("click", onClick, true);
                  window2.addEventListener("mousedown", onMouseEvent, true);
                  window2.addEventListener("mouseover", onMouseEvent, true);
                  window2.addEventListener("mouseup", onMouseEvent, true);
                  window2.addEventListener("pointerdown", onPointerDown, true);
                  window2.addEventListener("pointermove", onPointerMove, true);
                  window2.addEventListener("pointerup", onPointerUp, true);
                } else {
                  agent2.emit("startInspectingNative");
                }
              }
              __name(registerListenersOnWindow, "registerListenersOnWindow");
              function stopInspectingNative() {
                hideOverlay(agent2);
                removeListenersOnWindow(window);
                iframesListeningTo.forEach(function(frame) {
                  try {
                    removeListenersOnWindow(frame.contentWindow);
                  } catch (error) {
                  }
                });
                iframesListeningTo = /* @__PURE__ */ new Set();
              }
              __name(stopInspectingNative, "stopInspectingNative");
              function removeListenersOnWindow(window2) {
                if (window2 && typeof window2.removeEventListener === "function") {
                  window2.removeEventListener("click", onClick, true);
                  window2.removeEventListener("mousedown", onMouseEvent, true);
                  window2.removeEventListener("mouseover", onMouseEvent, true);
                  window2.removeEventListener("mouseup", onMouseEvent, true);
                  window2.removeEventListener("pointerdown", onPointerDown, true);
                  window2.removeEventListener("pointermove", onPointerMove, true);
                  window2.removeEventListener("pointerup", onPointerUp, true);
                } else {
                  agent2.emit("stopInspectingNative");
                }
              }
              __name(removeListenersOnWindow, "removeListenersOnWindow");
              function clearNativeElementHighlight() {
                hideOverlay(agent2);
              }
              __name(clearNativeElementHighlight, "clearNativeElementHighlight");
              function highlightNativeElement(_ref) {
                var displayName = _ref.displayName, hideAfterTimeout = _ref.hideAfterTimeout, id = _ref.id, openNativeElementsPanel = _ref.openNativeElementsPanel, rendererID = _ref.rendererID, scrollIntoView = _ref.scrollIntoView;
                var renderer = agent2.rendererInterfaces[rendererID];
                if (renderer == null) {
                  console.warn('Invalid renderer id "'.concat(rendererID, '" for element "').concat(id, '"'));
                  hideOverlay(agent2);
                  return;
                }
                if (!renderer.hasFiberWithId(id)) {
                  hideOverlay(agent2);
                  return;
                }
                var nodes = renderer.findNativeNodesForFiberID(id);
                if (nodes != null && nodes[0] != null) {
                  var node = nodes[0];
                  if (scrollIntoView && typeof node.scrollIntoView === "function") {
                    node.scrollIntoView({
                      block: "nearest",
                      inline: "nearest"
                    });
                  }
                  showOverlay(nodes, displayName, agent2, hideAfterTimeout);
                  if (openNativeElementsPanel) {
                    window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$0 = node;
                    bridge.send("syncSelectionToNativeElementsPanel");
                  }
                } else {
                  hideOverlay(agent2);
                }
              }
              __name(highlightNativeElement, "highlightNativeElement");
              function onClick(event) {
                event.preventDefault();
                event.stopPropagation();
                stopInspectingNative();
                bridge.send("stopInspectingNative", true);
              }
              __name(onClick, "onClick");
              function onMouseEvent(event) {
                event.preventDefault();
                event.stopPropagation();
              }
              __name(onMouseEvent, "onMouseEvent");
              function onPointerDown(event) {
                event.preventDefault();
                event.stopPropagation();
                selectFiberForNode(getEventTarget(event));
              }
              __name(onPointerDown, "onPointerDown");
              var lastHoveredNode = null;
              function onPointerMove(event) {
                event.preventDefault();
                event.stopPropagation();
                var target = getEventTarget(event);
                if (lastHoveredNode === target) return;
                lastHoveredNode = target;
                if (target.tagName === "IFRAME") {
                  var iframe = target;
                  try {
                    if (!iframesListeningTo.has(iframe)) {
                      var _window = iframe.contentWindow;
                      registerListenersOnWindow(_window);
                      iframesListeningTo.add(iframe);
                    }
                  } catch (error) {
                  }
                }
                showOverlay([target], null, agent2, false);
                selectFiberForNode(target);
              }
              __name(onPointerMove, "onPointerMove");
              function onPointerUp(event) {
                event.preventDefault();
                event.stopPropagation();
              }
              __name(onPointerUp, "onPointerUp");
              var selectFiberForNode = lodash_throttle_default()(
                esm(function(node) {
                  var id = agent2.getIDForNode(node);
                  if (id !== null) {
                    bridge.send("selectFiber", id);
                  }
                }),
                200,
                // Don't change the selection in the very first 200ms
                // because those are usually unintentional as you lift the cursor.
                {
                  leading: false
                }
              );
              function getEventTarget(event) {
                if (event.composed) {
                  return event.composedPath()[0];
                }
                return event.target;
              }
              __name(getEventTarget, "getEventTarget");
            }
            __name(setupHighlighter, "setupHighlighter");
            ;
            var OUTLINE_COLOR = "#f0f0f0";
            var COLORS = ["#37afa9", "#63b19e", "#80b393", "#97b488", "#abb67d", "#beb771", "#cfb965", "#dfba57", "#efbb49", "#febc38"];
            var canvas = null;
            function draw(nodeToData2, agent2) {
              if (window.document == null) {
                var nodesToDraw = [];
                iterateNodes(nodeToData2, function(_, color, node) {
                  nodesToDraw.push({
                    node,
                    color
                  });
                });
                agent2.emit("drawTraceUpdates", nodesToDraw);
                return;
              }
              if (canvas === null) {
                initialize();
              }
              var canvasFlow = canvas;
              canvasFlow.width = window.innerWidth;
              canvasFlow.height = window.innerHeight;
              var context = canvasFlow.getContext("2d");
              context.clearRect(0, 0, canvasFlow.width, canvasFlow.height);
              iterateNodes(nodeToData2, function(rect, color) {
                if (rect !== null) {
                  drawBorder(context, rect, color);
                }
              });
            }
            __name(draw, "draw");
            function iterateNodes(nodeToData2, execute) {
              nodeToData2.forEach(function(_ref, node) {
                var count = _ref.count, rect = _ref.rect;
                var colorIndex = Math.min(COLORS.length - 1, count - 1);
                var color = COLORS[colorIndex];
                execute(rect, color, node);
              });
            }
            __name(iterateNodes, "iterateNodes");
            function drawBorder(context, rect, color) {
              var height = rect.height, left = rect.left, top = rect.top, width = rect.width;
              context.lineWidth = 1;
              context.strokeStyle = OUTLINE_COLOR;
              context.strokeRect(left - 1, top - 1, width + 2, height + 2);
              context.lineWidth = 1;
              context.strokeStyle = OUTLINE_COLOR;
              context.strokeRect(left + 1, top + 1, width - 1, height - 1);
              context.strokeStyle = color;
              context.setLineDash([0]);
              context.lineWidth = 1;
              context.strokeRect(left, top, width - 1, height - 1);
              context.setLineDash([0]);
            }
            __name(drawBorder, "drawBorder");
            function destroy(agent2) {
              if (window.document == null) {
                agent2.emit("disableTraceUpdates");
                return;
              }
              if (canvas !== null) {
                if (canvas.parentNode != null) {
                  canvas.parentNode.removeChild(canvas);
                }
                canvas = null;
              }
            }
            __name(destroy, "destroy");
            function initialize() {
              canvas = window.document.createElement("canvas");
              canvas.style.cssText = "\n    xx-background-color: red;\n    xx-opacity: 0.5;\n    bottom: 0;\n    left: 0;\n    pointer-events: none;\n    position: fixed;\n    right: 0;\n    top: 0;\n    z-index: 1000000000;\n  ";
              var root = window.document.documentElement;
              root.insertBefore(canvas, root.firstChild);
            }
            __name(initialize, "initialize");
            ;
            function _typeof(obj) {
              "@babel/helpers - typeof";
              if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                _typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                  return typeof obj2;
                }, "_typeof");
              } else {
                _typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                  return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                }, "_typeof");
              }
              return _typeof(obj);
            }
            __name(_typeof, "_typeof");
            var DISPLAY_DURATION = 250;
            var MAX_DISPLAY_DURATION = 3e3;
            var REMEASUREMENT_AFTER_DURATION = 250;
            var getCurrentTime = (
              // $FlowFixMe[method-unbinding]
              (typeof performance === "undefined" ? "undefined" : _typeof(performance)) === "object" && typeof performance.now === "function" ? function() {
                return performance.now();
              } : function() {
                return Date.now();
              }
            );
            var nodeToData = /* @__PURE__ */ new Map();
            var agent = null;
            var drawAnimationFrameID = null;
            var isEnabled = false;
            var redrawTimeoutID = null;
            function TraceUpdates_initialize(injectedAgent) {
              agent = injectedAgent;
              agent.addListener("traceUpdates", traceUpdates);
            }
            __name(TraceUpdates_initialize, "TraceUpdates_initialize");
            function toggleEnabled(value) {
              isEnabled = value;
              if (!isEnabled) {
                nodeToData.clear();
                if (drawAnimationFrameID !== null) {
                  cancelAnimationFrame(drawAnimationFrameID);
                  drawAnimationFrameID = null;
                }
                if (redrawTimeoutID !== null) {
                  clearTimeout(redrawTimeoutID);
                  redrawTimeoutID = null;
                }
                destroy(agent);
              }
            }
            __name(toggleEnabled, "toggleEnabled");
            function traceUpdates(nodes) {
              if (!isEnabled) {
                return;
              }
              nodes.forEach(function(node) {
                var data = nodeToData.get(node);
                var now = getCurrentTime();
                var lastMeasuredAt = data != null ? data.lastMeasuredAt : 0;
                var rect = data != null ? data.rect : null;
                if (rect === null || lastMeasuredAt + REMEASUREMENT_AFTER_DURATION < now) {
                  lastMeasuredAt = now;
                  rect = measureNode(node);
                }
                nodeToData.set(node, {
                  count: data != null ? data.count + 1 : 1,
                  expirationTime: data != null ? Math.min(now + MAX_DISPLAY_DURATION, data.expirationTime + DISPLAY_DURATION) : now + DISPLAY_DURATION,
                  lastMeasuredAt,
                  rect
                });
              });
              if (redrawTimeoutID !== null) {
                clearTimeout(redrawTimeoutID);
                redrawTimeoutID = null;
              }
              if (drawAnimationFrameID === null) {
                drawAnimationFrameID = requestAnimationFrame(prepareToDraw);
              }
            }
            __name(traceUpdates, "traceUpdates");
            function prepareToDraw() {
              drawAnimationFrameID = null;
              redrawTimeoutID = null;
              var now = getCurrentTime();
              var earliestExpiration = Number.MAX_VALUE;
              nodeToData.forEach(function(data, node) {
                if (data.expirationTime < now) {
                  nodeToData.delete(node);
                } else {
                  earliestExpiration = Math.min(earliestExpiration, data.expirationTime);
                }
              });
              draw(nodeToData, agent);
              if (earliestExpiration !== Number.MAX_VALUE) {
                redrawTimeoutID = setTimeout(prepareToDraw, earliestExpiration - now);
              }
            }
            __name(prepareToDraw, "prepareToDraw");
            function measureNode(node) {
              if (!node || typeof node.getBoundingClientRect !== "function") {
                return null;
              }
              var currentWindow = window.__REACT_DEVTOOLS_TARGET_WINDOW__ || window;
              return getNestedBoundingClientRect(node, currentWindow);
            }
            __name(measureNode, "measureNode");
            ;
            function esm_typeof(obj) {
              "@babel/helpers - typeof";
              if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                esm_typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                  return typeof obj2;
                }, "_typeof");
              } else {
                esm_typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                  return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                }, "_typeof");
              }
              return esm_typeof(obj);
            }
            __name(esm_typeof, "esm_typeof");
            function _slicedToArray(arr, i) {
              return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
            }
            __name(_slicedToArray, "_slicedToArray");
            function _nonIterableRest() {
              throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
            }
            __name(_nonIterableRest, "_nonIterableRest");
            function _unsupportedIterableToArray(o, minLen) {
              if (!o) return;
              if (typeof o === "string") return _arrayLikeToArray(o, minLen);
              var n = Object.prototype.toString.call(o).slice(8, -1);
              if (n === "Object" && o.constructor) n = o.constructor.name;
              if (n === "Map" || n === "Set") return Array.from(o);
              if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
            }
            __name(_unsupportedIterableToArray, "_unsupportedIterableToArray");
            function _arrayLikeToArray(arr, len) {
              if (len == null || len > arr.length) len = arr.length;
              for (var i = 0, arr2 = new Array(len); i < len; i++) {
                arr2[i] = arr[i];
              }
              return arr2;
            }
            __name(_arrayLikeToArray, "_arrayLikeToArray");
            function _iterableToArrayLimit(arr, i) {
              if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
              var _arr = [];
              var _n = true;
              var _d = false;
              var _e = void 0;
              try {
                for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                  _arr.push(_s.value);
                  if (i && _arr.length === i) break;
                }
              } catch (err) {
                _d = true;
                _e = err;
              } finally {
                try {
                  if (!_n && _i["return"] != null) _i["return"]();
                } finally {
                  if (_d) throw _e;
                }
              }
              return _arr;
            }
            __name(_iterableToArrayLimit, "_iterableToArrayLimit");
            function _arrayWithHoles(arr) {
              if (Array.isArray(arr)) return arr;
            }
            __name(_arrayWithHoles, "_arrayWithHoles");
            var compareVersions = /* @__PURE__ */ __name(function compareVersions2(v1, v2) {
              var n1 = validateAndParse(v1);
              var n2 = validateAndParse(v2);
              var p1 = n1.pop();
              var p2 = n2.pop();
              var r = compareSegments(n1, n2);
              if (r !== 0) return r;
              if (p1 && p2) {
                return compareSegments(p1.split("."), p2.split("."));
              } else if (p1 || p2) {
                return p1 ? -1 : 1;
              }
              return 0;
            }, "compareVersions");
            var validate = /* @__PURE__ */ __name(function validate2(version) {
              return typeof version === "string" && /^[v\d]/.test(version) && semver.test(version);
            }, "validate");
            var compare = /* @__PURE__ */ __name(function compare2(v1, v2, operator) {
              assertValidOperator(operator);
              var res = compareVersions(v1, v2);
              return operatorResMap[operator].includes(res);
            }, "compare");
            var satisfies = /* @__PURE__ */ __name(function satisfies2(version, range) {
              var m = range.match(/^([<>=~^]+)/);
              var op = m ? m[1] : "=";
              if (op !== "^" && op !== "~") return compare(version, range, op);
              var _validateAndParse = validateAndParse(version), _validateAndParse2 = _slicedToArray(_validateAndParse, 5), v1 = _validateAndParse2[0], v2 = _validateAndParse2[1], v3 = _validateAndParse2[2], vp = _validateAndParse2[4];
              var _validateAndParse3 = validateAndParse(range), _validateAndParse4 = _slicedToArray(_validateAndParse3, 5), r1 = _validateAndParse4[0], r2 = _validateAndParse4[1], r3 = _validateAndParse4[2], rp = _validateAndParse4[4];
              var v = [v1, v2, v3];
              var r = [r1, r2 !== null && r2 !== void 0 ? r2 : "x", r3 !== null && r3 !== void 0 ? r3 : "x"];
              if (rp) {
                if (!vp) return false;
                if (compareSegments(v, r) !== 0) return false;
                if (compareSegments(vp.split("."), rp.split(".")) === -1) return false;
              }
              var nonZero = r.findIndex(function(v4) {
                return v4 !== "0";
              }) + 1;
              var i = op === "~" ? 2 : nonZero > 1 ? nonZero : 1;
              if (compareSegments(v.slice(0, i), r.slice(0, i)) !== 0) return false;
              if (compareSegments(v.slice(i), r.slice(i)) === -1) return false;
              return true;
            }, "satisfies");
            var semver = /^[v^~<>=]*?(\d+)(?:\.([x*]|\d+)(?:\.([x*]|\d+)(?:\.([x*]|\d+))?(?:-([\da-z\-]+(?:\.[\da-z\-]+)*))?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?)?)?$/i;
            var validateAndParse = /* @__PURE__ */ __name(function validateAndParse2(version) {
              if (typeof version !== "string") {
                throw new TypeError("Invalid argument expected string");
              }
              var match = version.match(semver);
              if (!match) {
                throw new Error("Invalid argument not valid semver ('".concat(version, "' received)"));
              }
              match.shift();
              return match;
            }, "validateAndParse");
            var isWildcard = /* @__PURE__ */ __name(function isWildcard2(s) {
              return s === "*" || s === "x" || s === "X";
            }, "isWildcard");
            var tryParse = /* @__PURE__ */ __name(function tryParse2(v) {
              var n = parseInt(v, 10);
              return isNaN(n) ? v : n;
            }, "tryParse");
            var forceType = /* @__PURE__ */ __name(function forceType2(a, b) {
              return esm_typeof(a) !== esm_typeof(b) ? [String(a), String(b)] : [a, b];
            }, "forceType");
            var compareStrings = /* @__PURE__ */ __name(function compareStrings2(a, b) {
              if (isWildcard(a) || isWildcard(b)) return 0;
              var _forceType = forceType(tryParse(a), tryParse(b)), _forceType2 = _slicedToArray(_forceType, 2), ap = _forceType2[0], bp = _forceType2[1];
              if (ap > bp) return 1;
              if (ap < bp) return -1;
              return 0;
            }, "compareStrings");
            var compareSegments = /* @__PURE__ */ __name(function compareSegments2(a, b) {
              for (var i = 0; i < Math.max(a.length, b.length); i++) {
                var r = compareStrings(a[i] || "0", b[i] || "0");
                if (r !== 0) return r;
              }
              return 0;
            }, "compareSegments");
            var operatorResMap = {
              ">": [1],
              ">=": [0, 1],
              "=": [0],
              "<=": [-1, 0],
              "<": [-1]
            };
            var allowedOperators = Object.keys(operatorResMap);
            var assertValidOperator = /* @__PURE__ */ __name(function assertValidOperator2(op) {
              if (typeof op !== "string") {
                throw new TypeError("Invalid operator type, expected string but got ".concat(esm_typeof(op)));
              }
              if (allowedOperators.indexOf(op) === -1) {
                throw new Error("Invalid operator, expected one of ".concat(allowedOperators.join("|")));
              }
            }, "assertValidOperator");
            var lru_cache = __webpack_require__(730);
            var lru_cache_default = /* @__PURE__ */ __webpack_require__.n(lru_cache);
            var react_is = __webpack_require__(550);
            ;
            function ReactSymbols_typeof(obj) {
              "@babel/helpers - typeof";
              if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                ReactSymbols_typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                  return typeof obj2;
                }, "_typeof");
              } else {
                ReactSymbols_typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                  return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                }, "_typeof");
              }
              return ReactSymbols_typeof(obj);
            }
            __name(ReactSymbols_typeof, "ReactSymbols_typeof");
            var REACT_ELEMENT_TYPE = Symbol.for("react.element");
            var REACT_PORTAL_TYPE = Symbol.for("react.portal");
            var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
            var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
            var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
            var REACT_PROVIDER_TYPE = Symbol.for("react.provider");
            var REACT_CONTEXT_TYPE = Symbol.for("react.context");
            var REACT_SERVER_CONTEXT_TYPE = Symbol.for("react.server_context");
            var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
            var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
            var REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list");
            var REACT_MEMO_TYPE = Symbol.for("react.memo");
            var REACT_LAZY_TYPE = Symbol.for("react.lazy");
            var REACT_SCOPE_TYPE = Symbol.for("react.scope");
            var REACT_DEBUG_TRACING_MODE_TYPE = Symbol.for("react.debug_trace_mode");
            var REACT_OFFSCREEN_TYPE = Symbol.for("react.offscreen");
            var REACT_LEGACY_HIDDEN_TYPE = Symbol.for("react.legacy_hidden");
            var REACT_CACHE_TYPE = Symbol.for("react.cache");
            var REACT_TRACING_MARKER_TYPE = Symbol.for("react.tracing_marker");
            var REACT_SERVER_CONTEXT_DEFAULT_VALUE_NOT_LOADED = Symbol.for("react.default_value");
            var REACT_MEMO_CACHE_SENTINEL = Symbol.for("react.memo_cache_sentinel");
            var REACT_POSTPONE_TYPE = Symbol.for("react.postpone");
            var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
            var FAUX_ITERATOR_SYMBOL = "@@iterator";
            function getIteratorFn(maybeIterable) {
              if (maybeIterable === null || ReactSymbols_typeof(maybeIterable) !== "object") {
                return null;
              }
              var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
              if (typeof maybeIterator === "function") {
                return maybeIterator;
              }
              return null;
            }
            __name(getIteratorFn, "getIteratorFn");
            ;
            var types_ElementTypeClass = 1;
            var ElementTypeContext = 2;
            var types_ElementTypeFunction = 5;
            var types_ElementTypeForwardRef = 6;
            var ElementTypeHostComponent = 7;
            var types_ElementTypeMemo = 8;
            var ElementTypeOtherOrUnknown = 9;
            var ElementTypeProfiler = 10;
            var ElementTypeRoot = 11;
            var ElementTypeSuspense = 12;
            var ElementTypeSuspenseList = 13;
            var ElementTypeTracingMarker = 14;
            var ComponentFilterElementType = 1;
            var ComponentFilterDisplayName = 2;
            var ComponentFilterLocation = 3;
            var ComponentFilterHOC = 4;
            var StrictMode = 1;
            ;
            var isArray = Array.isArray;
            const src_isArray = isArray;
            ;
            var process = __webpack_require__(169);
            function utils_typeof(obj) {
              "@babel/helpers - typeof";
              if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                utils_typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                  return typeof obj2;
                }, "_typeof");
              } else {
                utils_typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                  return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                }, "_typeof");
              }
              return utils_typeof(obj);
            }
            __name(utils_typeof, "utils_typeof");
            function _toConsumableArray(arr) {
              return _arrayWithoutHoles(arr) || _iterableToArray(arr) || utils_unsupportedIterableToArray(arr) || _nonIterableSpread();
            }
            __name(_toConsumableArray, "_toConsumableArray");
            function _nonIterableSpread() {
              throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
            }
            __name(_nonIterableSpread, "_nonIterableSpread");
            function utils_unsupportedIterableToArray(o, minLen) {
              if (!o) return;
              if (typeof o === "string") return utils_arrayLikeToArray(o, minLen);
              var n = Object.prototype.toString.call(o).slice(8, -1);
              if (n === "Object" && o.constructor) n = o.constructor.name;
              if (n === "Map" || n === "Set") return Array.from(o);
              if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return utils_arrayLikeToArray(o, minLen);
            }
            __name(utils_unsupportedIterableToArray, "utils_unsupportedIterableToArray");
            function _iterableToArray(iter) {
              if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
            }
            __name(_iterableToArray, "_iterableToArray");
            function _arrayWithoutHoles(arr) {
              if (Array.isArray(arr)) return utils_arrayLikeToArray(arr);
            }
            __name(_arrayWithoutHoles, "_arrayWithoutHoles");
            function utils_arrayLikeToArray(arr, len) {
              if (len == null || len > arr.length) len = arr.length;
              for (var i = 0, arr2 = new Array(len); i < len; i++) {
                arr2[i] = arr[i];
              }
              return arr2;
            }
            __name(utils_arrayLikeToArray, "utils_arrayLikeToArray");
            var utils_hasOwnProperty = Object.prototype.hasOwnProperty;
            var cachedDisplayNames = /* @__PURE__ */ new WeakMap();
            var encodedStringCache = new (lru_cache_default())({
              max: 1e3
            });
            function alphaSortKeys(a, b) {
              if (a.toString() > b.toString()) {
                return 1;
              } else if (b.toString() > a.toString()) {
                return -1;
              } else {
                return 0;
              }
            }
            __name(alphaSortKeys, "alphaSortKeys");
            function getAllEnumerableKeys(obj) {
              var keys = /* @__PURE__ */ new Set();
              var current = obj;
              var _loop = /* @__PURE__ */ __name(function _loop2() {
                var currentKeys = [].concat(_toConsumableArray(Object.keys(current)), _toConsumableArray(Object.getOwnPropertySymbols(current)));
                var descriptors = Object.getOwnPropertyDescriptors(current);
                currentKeys.forEach(function(key) {
                  if (descriptors[key].enumerable) {
                    keys.add(key);
                  }
                });
                current = Object.getPrototypeOf(current);
              }, "_loop");
              while (current != null) {
                _loop();
              }
              return keys;
            }
            __name(getAllEnumerableKeys, "getAllEnumerableKeys");
            function getWrappedDisplayName(outerType, innerType, wrapperName, fallbackName) {
              var displayName = outerType.displayName;
              return displayName || "".concat(wrapperName, "(").concat(getDisplayName(innerType, fallbackName), ")");
            }
            __name(getWrappedDisplayName, "getWrappedDisplayName");
            function getDisplayName(type) {
              var fallbackName = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "Anonymous";
              var nameFromCache = cachedDisplayNames.get(type);
              if (nameFromCache != null) {
                return nameFromCache;
              }
              var displayName = fallbackName;
              if (typeof type.displayName === "string") {
                displayName = type.displayName;
              } else if (typeof type.name === "string" && type.name !== "") {
                displayName = type.name;
              }
              cachedDisplayNames.set(type, displayName);
              return displayName;
            }
            __name(getDisplayName, "getDisplayName");
            var uidCounter = 0;
            function getUID() {
              return ++uidCounter;
            }
            __name(getUID, "getUID");
            function utfDecodeString(array) {
              var string = "";
              for (var i = 0; i < array.length; i++) {
                var char = array[i];
                string += String.fromCodePoint(char);
              }
              return string;
            }
            __name(utfDecodeString, "utfDecodeString");
            function surrogatePairToCodePoint(charCode1, charCode2) {
              return ((charCode1 & 1023) << 10) + (charCode2 & 1023) + 65536;
            }
            __name(surrogatePairToCodePoint, "surrogatePairToCodePoint");
            function utfEncodeString(string) {
              var cached = encodedStringCache.get(string);
              if (cached !== void 0) {
                return cached;
              }
              var encoded = [];
              var i = 0;
              var charCode;
              while (i < string.length) {
                charCode = string.charCodeAt(i);
                if ((charCode & 63488) === 55296) {
                  encoded.push(surrogatePairToCodePoint(charCode, string.charCodeAt(++i)));
                } else {
                  encoded.push(charCode);
                }
                ++i;
              }
              encodedStringCache.set(string, encoded);
              return encoded;
            }
            __name(utfEncodeString, "utfEncodeString");
            function printOperationsArray(operations) {
              var rendererID = operations[0];
              var rootID = operations[1];
              var logs = ["operations for renderer:".concat(rendererID, " and root:").concat(rootID)];
              var i = 2;
              var stringTable = [
                null
                // ID = 0 corresponds to the null string.
              ];
              var stringTableSize = operations[i++];
              var stringTableEnd = i + stringTableSize;
              while (i < stringTableEnd) {
                var nextLength = operations[i++];
                var nextString = utfDecodeString(operations.slice(i, i + nextLength));
                stringTable.push(nextString);
                i += nextLength;
              }
              while (i < operations.length) {
                var operation = operations[i];
                switch (operation) {
                  case TREE_OPERATION_ADD: {
                    var _id = operations[i + 1];
                    var type = operations[i + 2];
                    i += 3;
                    if (type === ElementTypeRoot) {
                      logs.push("Add new root node ".concat(_id));
                      i++;
                      i++;
                      i++;
                      i++;
                    } else {
                      var parentID = operations[i];
                      i++;
                      i++;
                      var displayNameStringID = operations[i];
                      var displayName = stringTable[displayNameStringID];
                      i++;
                      i++;
                      logs.push("Add node ".concat(_id, " (").concat(displayName || "null", ") as child of ").concat(parentID));
                    }
                    break;
                  }
                  case TREE_OPERATION_REMOVE: {
                    var removeLength = operations[i + 1];
                    i += 2;
                    for (var removeIndex = 0; removeIndex < removeLength; removeIndex++) {
                      var _id2 = operations[i];
                      i += 1;
                      logs.push("Remove node ".concat(_id2));
                    }
                    break;
                  }
                  case TREE_OPERATION_REMOVE_ROOT: {
                    i += 1;
                    logs.push("Remove root ".concat(rootID));
                    break;
                  }
                  case TREE_OPERATION_SET_SUBTREE_MODE: {
                    var _id3 = operations[i + 1];
                    var mode = operations[i + 1];
                    i += 3;
                    logs.push("Mode ".concat(mode, " set for subtree with root ").concat(_id3));
                    break;
                  }
                  case TREE_OPERATION_REORDER_CHILDREN: {
                    var _id4 = operations[i + 1];
                    var numChildren = operations[i + 2];
                    i += 3;
                    var children = operations.slice(i, i + numChildren);
                    i += numChildren;
                    logs.push("Re-order node ".concat(_id4, " children ").concat(children.join(",")));
                    break;
                  }
                  case TREE_OPERATION_UPDATE_TREE_BASE_DURATION:
                    i += 3;
                    break;
                  case TREE_OPERATION_UPDATE_ERRORS_OR_WARNINGS:
                    var id = operations[i + 1];
                    var numErrors = operations[i + 2];
                    var numWarnings = operations[i + 3];
                    i += 4;
                    logs.push("Node ".concat(id, " has ").concat(numErrors, " errors and ").concat(numWarnings, " warnings"));
                    break;
                  default:
                    throw Error('Unsupported Bridge operation "'.concat(operation, '"'));
                }
              }
              console.log(logs.join("\n  "));
            }
            __name(printOperationsArray, "printOperationsArray");
            function getDefaultComponentFilters() {
              return [{
                type: ComponentFilterElementType,
                value: ElementTypeHostComponent,
                isEnabled: true
              }];
            }
            __name(getDefaultComponentFilters, "getDefaultComponentFilters");
            function getSavedComponentFilters() {
              try {
                var raw = localStorageGetItem(LOCAL_STORAGE_COMPONENT_FILTER_PREFERENCES_KEY);
                if (raw != null) {
                  return JSON.parse(raw);
                }
              } catch (error) {
              }
              return getDefaultComponentFilters();
            }
            __name(getSavedComponentFilters, "getSavedComponentFilters");
            function setSavedComponentFilters(componentFilters) {
              localStorageSetItem(LOCAL_STORAGE_COMPONENT_FILTER_PREFERENCES_KEY, JSON.stringify(componentFilters));
            }
            __name(setSavedComponentFilters, "setSavedComponentFilters");
            function parseBool(s) {
              if (s === "true") {
                return true;
              }
              if (s === "false") {
                return false;
              }
            }
            __name(parseBool, "parseBool");
            function castBool(v) {
              if (v === true || v === false) {
                return v;
              }
            }
            __name(castBool, "castBool");
            function castBrowserTheme(v) {
              if (v === "light" || v === "dark" || v === "auto") {
                return v;
              }
            }
            __name(castBrowserTheme, "castBrowserTheme");
            function getAppendComponentStack() {
              var _parseBool;
              var raw = localStorageGetItem(LOCAL_STORAGE_SHOULD_APPEND_COMPONENT_STACK_KEY);
              return (_parseBool = parseBool(raw)) !== null && _parseBool !== void 0 ? _parseBool : true;
            }
            __name(getAppendComponentStack, "getAppendComponentStack");
            function getBreakOnConsoleErrors() {
              var _parseBool2;
              var raw = localStorageGetItem(LOCAL_STORAGE_SHOULD_BREAK_ON_CONSOLE_ERRORS);
              return (_parseBool2 = parseBool(raw)) !== null && _parseBool2 !== void 0 ? _parseBool2 : false;
            }
            __name(getBreakOnConsoleErrors, "getBreakOnConsoleErrors");
            function getHideConsoleLogsInStrictMode() {
              var _parseBool3;
              var raw = localStorageGetItem(LOCAL_STORAGE_HIDE_CONSOLE_LOGS_IN_STRICT_MODE);
              return (_parseBool3 = parseBool(raw)) !== null && _parseBool3 !== void 0 ? _parseBool3 : false;
            }
            __name(getHideConsoleLogsInStrictMode, "getHideConsoleLogsInStrictMode");
            function getShowInlineWarningsAndErrors() {
              var _parseBool4;
              var raw = localStorageGetItem(LOCAL_STORAGE_SHOW_INLINE_WARNINGS_AND_ERRORS_KEY);
              return (_parseBool4 = parseBool(raw)) !== null && _parseBool4 !== void 0 ? _parseBool4 : true;
            }
            __name(getShowInlineWarningsAndErrors, "getShowInlineWarningsAndErrors");
            function getDefaultOpenInEditorURL() {
              return typeof process.env.EDITOR_URL === "string" ? process.env.EDITOR_URL : "";
            }
            __name(getDefaultOpenInEditorURL, "getDefaultOpenInEditorURL");
            function getOpenInEditorURL() {
              try {
                var raw = localStorageGetItem(LOCAL_STORAGE_OPEN_IN_EDITOR_URL);
                if (raw != null) {
                  return JSON.parse(raw);
                }
              } catch (error) {
              }
              return getDefaultOpenInEditorURL();
            }
            __name(getOpenInEditorURL, "getOpenInEditorURL");
            function separateDisplayNameAndHOCs(displayName, type) {
              if (displayName === null) {
                return [null, null];
              }
              var hocDisplayNames = null;
              switch (type) {
                case ElementTypeClass:
                case ElementTypeForwardRef:
                case ElementTypeFunction:
                case ElementTypeMemo:
                  if (displayName.indexOf("(") >= 0) {
                    var matches = displayName.match(/[^()]+/g);
                    if (matches != null) {
                      displayName = matches.pop();
                      hocDisplayNames = matches;
                    }
                  }
                  break;
                default:
                  break;
              }
              return [displayName, hocDisplayNames];
            }
            __name(separateDisplayNameAndHOCs, "separateDisplayNameAndHOCs");
            function shallowDiffers(prev, next) {
              for (var attribute in prev) {
                if (!(attribute in next)) {
                  return true;
                }
              }
              for (var _attribute in next) {
                if (prev[_attribute] !== next[_attribute]) {
                  return true;
                }
              }
              return false;
            }
            __name(shallowDiffers, "shallowDiffers");
            function utils_getInObject(object, path) {
              return path.reduce(function(reduced, attr) {
                if (reduced) {
                  if (utils_hasOwnProperty.call(reduced, attr)) {
                    return reduced[attr];
                  }
                  if (typeof reduced[Symbol.iterator] === "function") {
                    return Array.from(reduced)[attr];
                  }
                }
                return null;
              }, object);
            }
            __name(utils_getInObject, "utils_getInObject");
            function deletePathInObject(object, path) {
              var length = path.length;
              var last = path[length - 1];
              if (object != null) {
                var parent = utils_getInObject(object, path.slice(0, length - 1));
                if (parent) {
                  if (src_isArray(parent)) {
                    parent.splice(last, 1);
                  } else {
                    delete parent[last];
                  }
                }
              }
            }
            __name(deletePathInObject, "deletePathInObject");
            function renamePathInObject(object, oldPath, newPath) {
              var length = oldPath.length;
              if (object != null) {
                var parent = utils_getInObject(object, oldPath.slice(0, length - 1));
                if (parent) {
                  var lastOld = oldPath[length - 1];
                  var lastNew = newPath[length - 1];
                  parent[lastNew] = parent[lastOld];
                  if (src_isArray(parent)) {
                    parent.splice(lastOld, 1);
                  } else {
                    delete parent[lastOld];
                  }
                }
              }
            }
            __name(renamePathInObject, "renamePathInObject");
            function utils_setInObject(object, path, value) {
              var length = path.length;
              var last = path[length - 1];
              if (object != null) {
                var parent = utils_getInObject(object, path.slice(0, length - 1));
                if (parent) {
                  parent[last] = value;
                }
              }
            }
            __name(utils_setInObject, "utils_setInObject");
            function getDataType(data) {
              if (data === null) {
                return "null";
              } else if (data === void 0) {
                return "undefined";
              }
              if ((0, react_is.isElement)(data)) {
                return "react_element";
              }
              if (typeof HTMLElement !== "undefined" && data instanceof HTMLElement) {
                return "html_element";
              }
              var type = utils_typeof(data);
              switch (type) {
                case "bigint":
                  return "bigint";
                case "boolean":
                  return "boolean";
                case "function":
                  return "function";
                case "number":
                  if (Number.isNaN(data)) {
                    return "nan";
                  } else if (!Number.isFinite(data)) {
                    return "infinity";
                  } else {
                    return "number";
                  }
                case "object":
                  if (src_isArray(data)) {
                    return "array";
                  } else if (ArrayBuffer.isView(data)) {
                    return utils_hasOwnProperty.call(data.constructor, "BYTES_PER_ELEMENT") ? "typed_array" : "data_view";
                  } else if (data.constructor && data.constructor.name === "ArrayBuffer") {
                    return "array_buffer";
                  } else if (typeof data[Symbol.iterator] === "function") {
                    var iterator = data[Symbol.iterator]();
                    if (!iterator) {
                    } else {
                      return iterator === data ? "opaque_iterator" : "iterator";
                    }
                  } else if (data.constructor && data.constructor.name === "RegExp") {
                    return "regexp";
                  } else {
                    var toStringValue = Object.prototype.toString.call(data);
                    if (toStringValue === "[object Date]") {
                      return "date";
                    } else if (toStringValue === "[object HTMLAllCollection]") {
                      return "html_all_collection";
                    }
                  }
                  if (!isPlainObject(data)) {
                    return "class_instance";
                  }
                  return "object";
                case "string":
                  return "string";
                case "symbol":
                  return "symbol";
                case "undefined":
                  if (
                    // $FlowFixMe[method-unbinding]
                    Object.prototype.toString.call(data) === "[object HTMLAllCollection]"
                  ) {
                    return "html_all_collection";
                  }
                  return "undefined";
                default:
                  return "unknown";
              }
            }
            __name(getDataType, "getDataType");
            function getDisplayNameForReactElement(element) {
              var elementType = (0, react_is.typeOf)(element);
              switch (elementType) {
                case react_is.ContextConsumer:
                  return "ContextConsumer";
                case react_is.ContextProvider:
                  return "ContextProvider";
                case react_is.ForwardRef:
                  return "ForwardRef";
                case react_is.Fragment:
                  return "Fragment";
                case react_is.Lazy:
                  return "Lazy";
                case react_is.Memo:
                  return "Memo";
                case react_is.Portal:
                  return "Portal";
                case react_is.Profiler:
                  return "Profiler";
                case react_is.StrictMode:
                  return "StrictMode";
                case react_is.Suspense:
                  return "Suspense";
                case REACT_SUSPENSE_LIST_TYPE:
                  return "SuspenseList";
                case REACT_TRACING_MARKER_TYPE:
                  return "TracingMarker";
                default:
                  var type = element.type;
                  if (typeof type === "string") {
                    return type;
                  } else if (typeof type === "function") {
                    return getDisplayName(type, "Anonymous");
                  } else if (type != null) {
                    return "NotImplementedInDevtools";
                  } else {
                    return "Element";
                  }
              }
            }
            __name(getDisplayNameForReactElement, "getDisplayNameForReactElement");
            var MAX_PREVIEW_STRING_LENGTH = 50;
            function truncateForDisplay(string) {
              var length = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : MAX_PREVIEW_STRING_LENGTH;
              if (string.length > length) {
                return string.slice(0, length) + "\u2026";
              } else {
                return string;
              }
            }
            __name(truncateForDisplay, "truncateForDisplay");
            function formatDataForPreview(data, showFormattedValue) {
              if (data != null && utils_hasOwnProperty.call(data, meta.type)) {
                return showFormattedValue ? data[meta.preview_long] : data[meta.preview_short];
              }
              var type = getDataType(data);
              switch (type) {
                case "html_element":
                  return "<".concat(truncateForDisplay(data.tagName.toLowerCase()), " />");
                case "function":
                  return truncateForDisplay("\u0192 ".concat(typeof data.name === "function" ? "" : data.name, "() {}"));
                case "string":
                  return '"'.concat(data, '"');
                case "bigint":
                  return truncateForDisplay(data.toString() + "n");
                case "regexp":
                  return truncateForDisplay(data.toString());
                case "symbol":
                  return truncateForDisplay(data.toString());
                case "react_element":
                  return "<".concat(truncateForDisplay(getDisplayNameForReactElement(data) || "Unknown"), " />");
                case "array_buffer":
                  return "ArrayBuffer(".concat(data.byteLength, ")");
                case "data_view":
                  return "DataView(".concat(data.buffer.byteLength, ")");
                case "array":
                  if (showFormattedValue) {
                    var formatted = "";
                    for (var i = 0; i < data.length; i++) {
                      if (i > 0) {
                        formatted += ", ";
                      }
                      formatted += formatDataForPreview(data[i], false);
                      if (formatted.length > MAX_PREVIEW_STRING_LENGTH) {
                        break;
                      }
                    }
                    return "[".concat(truncateForDisplay(formatted), "]");
                  } else {
                    var length = utils_hasOwnProperty.call(data, meta.size) ? data[meta.size] : data.length;
                    return "Array(".concat(length, ")");
                  }
                case "typed_array":
                  var shortName = "".concat(data.constructor.name, "(").concat(data.length, ")");
                  if (showFormattedValue) {
                    var _formatted = "";
                    for (var _i = 0; _i < data.length; _i++) {
                      if (_i > 0) {
                        _formatted += ", ";
                      }
                      _formatted += data[_i];
                      if (_formatted.length > MAX_PREVIEW_STRING_LENGTH) {
                        break;
                      }
                    }
                    return "".concat(shortName, " [").concat(truncateForDisplay(_formatted), "]");
                  } else {
                    return shortName;
                  }
                case "iterator":
                  var name = data.constructor.name;
                  if (showFormattedValue) {
                    var array = Array.from(data);
                    var _formatted2 = "";
                    for (var _i2 = 0; _i2 < array.length; _i2++) {
                      var entryOrEntries = array[_i2];
                      if (_i2 > 0) {
                        _formatted2 += ", ";
                      }
                      if (src_isArray(entryOrEntries)) {
                        var key = formatDataForPreview(entryOrEntries[0], true);
                        var value = formatDataForPreview(entryOrEntries[1], false);
                        _formatted2 += "".concat(key, " => ").concat(value);
                      } else {
                        _formatted2 += formatDataForPreview(entryOrEntries, false);
                      }
                      if (_formatted2.length > MAX_PREVIEW_STRING_LENGTH) {
                        break;
                      }
                    }
                    return "".concat(name, "(").concat(data.size, ") {").concat(truncateForDisplay(_formatted2), "}");
                  } else {
                    return "".concat(name, "(").concat(data.size, ")");
                  }
                case "opaque_iterator": {
                  return data[Symbol.toStringTag];
                }
                case "date":
                  return data.toString();
                case "class_instance":
                  return data.constructor.name;
                case "object":
                  if (showFormattedValue) {
                    var keys = Array.from(getAllEnumerableKeys(data)).sort(alphaSortKeys);
                    var _formatted3 = "";
                    for (var _i3 = 0; _i3 < keys.length; _i3++) {
                      var _key = keys[_i3];
                      if (_i3 > 0) {
                        _formatted3 += ", ";
                      }
                      _formatted3 += "".concat(_key.toString(), ": ").concat(formatDataForPreview(data[_key], false));
                      if (_formatted3.length > MAX_PREVIEW_STRING_LENGTH) {
                        break;
                      }
                    }
                    return "{".concat(truncateForDisplay(_formatted3), "}");
                  } else {
                    return "{\u2026}";
                  }
                case "boolean":
                case "number":
                case "infinity":
                case "nan":
                case "null":
                case "undefined":
                  return data;
                default:
                  try {
                    return truncateForDisplay(String(data));
                  } catch (error) {
                    return "unserializable";
                  }
              }
            }
            __name(formatDataForPreview, "formatDataForPreview");
            var isPlainObject = /* @__PURE__ */ __name(function isPlainObject2(object) {
              var objectPrototype = Object.getPrototypeOf(object);
              if (!objectPrototype) return true;
              var objectParentPrototype = Object.getPrototypeOf(objectPrototype);
              return !objectParentPrototype;
            }, "isPlainObject");
            ;
            function ownKeys(object, enumerableOnly) {
              var keys = Object.keys(object);
              if (Object.getOwnPropertySymbols) {
                var symbols = Object.getOwnPropertySymbols(object);
                if (enumerableOnly) symbols = symbols.filter(function(sym) {
                  return Object.getOwnPropertyDescriptor(object, sym).enumerable;
                });
                keys.push.apply(keys, symbols);
              }
              return keys;
            }
            __name(ownKeys, "ownKeys");
            function _objectSpread(target) {
              for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i] != null ? arguments[i] : {};
                if (i % 2) {
                  ownKeys(Object(source), true).forEach(function(key) {
                    hydration_defineProperty(target, key, source[key]);
                  });
                } else if (Object.getOwnPropertyDescriptors) {
                  Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
                } else {
                  ownKeys(Object(source)).forEach(function(key) {
                    Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
                  });
                }
              }
              return target;
            }
            __name(_objectSpread, "_objectSpread");
            function hydration_defineProperty(obj, key, value) {
              if (key in obj) {
                Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
              } else {
                obj[key] = value;
              }
              return obj;
            }
            __name(hydration_defineProperty, "hydration_defineProperty");
            var meta = {
              inspectable: Symbol("inspectable"),
              inspected: Symbol("inspected"),
              name: Symbol("name"),
              preview_long: Symbol("preview_long"),
              preview_short: Symbol("preview_short"),
              readonly: Symbol("readonly"),
              size: Symbol("size"),
              type: Symbol("type"),
              unserializable: Symbol("unserializable")
            };
            var LEVEL_THRESHOLD = 2;
            function createDehydrated(type, inspectable, data, cleaned, path) {
              cleaned.push(path);
              var dehydrated = {
                inspectable,
                type,
                preview_long: formatDataForPreview(data, true),
                preview_short: formatDataForPreview(data, false),
                name: !data.constructor || data.constructor.name === "Object" ? "" : data.constructor.name
              };
              if (type === "array" || type === "typed_array") {
                dehydrated.size = data.length;
              } else if (type === "object") {
                dehydrated.size = Object.keys(data).length;
              }
              if (type === "iterator" || type === "typed_array") {
                dehydrated.readonly = true;
              }
              return dehydrated;
            }
            __name(createDehydrated, "createDehydrated");
            function dehydrate(data, cleaned, unserializable, path, isPathAllowed) {
              var level = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : 0;
              var type = getDataType(data);
              var isPathAllowedCheck;
              switch (type) {
                case "html_element":
                  cleaned.push(path);
                  return {
                    inspectable: false,
                    preview_short: formatDataForPreview(data, false),
                    preview_long: formatDataForPreview(data, true),
                    name: data.tagName,
                    type
                  };
                case "function":
                  cleaned.push(path);
                  return {
                    inspectable: false,
                    preview_short: formatDataForPreview(data, false),
                    preview_long: formatDataForPreview(data, true),
                    name: typeof data.name === "function" || !data.name ? "function" : data.name,
                    type
                  };
                case "string":
                  isPathAllowedCheck = isPathAllowed(path);
                  if (isPathAllowedCheck) {
                    return data;
                  } else {
                    return data.length <= 500 ? data : data.slice(0, 500) + "...";
                  }
                case "bigint":
                  cleaned.push(path);
                  return {
                    inspectable: false,
                    preview_short: formatDataForPreview(data, false),
                    preview_long: formatDataForPreview(data, true),
                    name: data.toString(),
                    type
                  };
                case "symbol":
                  cleaned.push(path);
                  return {
                    inspectable: false,
                    preview_short: formatDataForPreview(data, false),
                    preview_long: formatDataForPreview(data, true),
                    name: data.toString(),
                    type
                  };
                // React Elements aren't very inspector-friendly,
                // and often contain private fields or circular references.
                case "react_element":
                  cleaned.push(path);
                  return {
                    inspectable: false,
                    preview_short: formatDataForPreview(data, false),
                    preview_long: formatDataForPreview(data, true),
                    name: getDisplayNameForReactElement(data) || "Unknown",
                    type
                  };
                // ArrayBuffers error if you try to inspect them.
                case "array_buffer":
                case "data_view":
                  cleaned.push(path);
                  return {
                    inspectable: false,
                    preview_short: formatDataForPreview(data, false),
                    preview_long: formatDataForPreview(data, true),
                    name: type === "data_view" ? "DataView" : "ArrayBuffer",
                    size: data.byteLength,
                    type
                  };
                case "array":
                  isPathAllowedCheck = isPathAllowed(path);
                  if (level >= LEVEL_THRESHOLD && !isPathAllowedCheck) {
                    return createDehydrated(type, true, data, cleaned, path);
                  }
                  return data.map(function(item, i) {
                    return dehydrate(item, cleaned, unserializable, path.concat([i]), isPathAllowed, isPathAllowedCheck ? 1 : level + 1);
                  });
                case "html_all_collection":
                case "typed_array":
                case "iterator":
                  isPathAllowedCheck = isPathAllowed(path);
                  if (level >= LEVEL_THRESHOLD && !isPathAllowedCheck) {
                    return createDehydrated(type, true, data, cleaned, path);
                  } else {
                    var unserializableValue = {
                      unserializable: true,
                      type,
                      readonly: true,
                      size: type === "typed_array" ? data.length : void 0,
                      preview_short: formatDataForPreview(data, false),
                      preview_long: formatDataForPreview(data, true),
                      name: !data.constructor || data.constructor.name === "Object" ? "" : data.constructor.name
                    };
                    Array.from(data).forEach(function(item, i) {
                      return unserializableValue[i] = dehydrate(item, cleaned, unserializable, path.concat([i]), isPathAllowed, isPathAllowedCheck ? 1 : level + 1);
                    });
                    unserializable.push(path);
                    return unserializableValue;
                  }
                case "opaque_iterator":
                  cleaned.push(path);
                  return {
                    inspectable: false,
                    preview_short: formatDataForPreview(data, false),
                    preview_long: formatDataForPreview(data, true),
                    name: data[Symbol.toStringTag],
                    type
                  };
                case "date":
                  cleaned.push(path);
                  return {
                    inspectable: false,
                    preview_short: formatDataForPreview(data, false),
                    preview_long: formatDataForPreview(data, true),
                    name: data.toString(),
                    type
                  };
                case "regexp":
                  cleaned.push(path);
                  return {
                    inspectable: false,
                    preview_short: formatDataForPreview(data, false),
                    preview_long: formatDataForPreview(data, true),
                    name: data.toString(),
                    type
                  };
                case "object":
                  isPathAllowedCheck = isPathAllowed(path);
                  if (level >= LEVEL_THRESHOLD && !isPathAllowedCheck) {
                    return createDehydrated(type, true, data, cleaned, path);
                  } else {
                    var object = {};
                    getAllEnumerableKeys(data).forEach(function(key) {
                      var name = key.toString();
                      object[name] = dehydrate(data[key], cleaned, unserializable, path.concat([name]), isPathAllowed, isPathAllowedCheck ? 1 : level + 1);
                    });
                    return object;
                  }
                case "class_instance":
                  isPathAllowedCheck = isPathAllowed(path);
                  if (level >= LEVEL_THRESHOLD && !isPathAllowedCheck) {
                    return createDehydrated(type, true, data, cleaned, path);
                  }
                  var value = {
                    unserializable: true,
                    type,
                    readonly: true,
                    preview_short: formatDataForPreview(data, false),
                    preview_long: formatDataForPreview(data, true),
                    name: data.constructor.name
                  };
                  getAllEnumerableKeys(data).forEach(function(key) {
                    var keyAsString = key.toString();
                    value[keyAsString] = dehydrate(data[key], cleaned, unserializable, path.concat([keyAsString]), isPathAllowed, isPathAllowedCheck ? 1 : level + 1);
                  });
                  unserializable.push(path);
                  return value;
                case "infinity":
                case "nan":
                case "undefined":
                  cleaned.push(path);
                  return {
                    type
                  };
                default:
                  return data;
              }
            }
            __name(dehydrate, "dehydrate");
            function fillInPath(object, data, path, value) {
              var target = getInObject(object, path);
              if (target != null) {
                if (!target[meta.unserializable]) {
                  delete target[meta.inspectable];
                  delete target[meta.inspected];
                  delete target[meta.name];
                  delete target[meta.preview_long];
                  delete target[meta.preview_short];
                  delete target[meta.readonly];
                  delete target[meta.size];
                  delete target[meta.type];
                }
              }
              if (value !== null && data.unserializable.length > 0) {
                var unserializablePath = data.unserializable[0];
                var isMatch = unserializablePath.length === path.length;
                for (var i = 0; i < path.length; i++) {
                  if (path[i] !== unserializablePath[i]) {
                    isMatch = false;
                    break;
                  }
                }
                if (isMatch) {
                  upgradeUnserializable(value, value);
                }
              }
              setInObject(object, path, value);
            }
            __name(fillInPath, "fillInPath");
            function hydrate(object, cleaned, unserializable) {
              cleaned.forEach(function(path) {
                var length = path.length;
                var last = path[length - 1];
                var parent = getInObject(object, path.slice(0, length - 1));
                if (!parent || !parent.hasOwnProperty(last)) {
                  return;
                }
                var value = parent[last];
                if (!value) {
                  return;
                } else if (value.type === "infinity") {
                  parent[last] = Infinity;
                } else if (value.type === "nan") {
                  parent[last] = NaN;
                } else if (value.type === "undefined") {
                  parent[last] = void 0;
                } else {
                  var replaced = {};
                  replaced[meta.inspectable] = !!value.inspectable;
                  replaced[meta.inspected] = false;
                  replaced[meta.name] = value.name;
                  replaced[meta.preview_long] = value.preview_long;
                  replaced[meta.preview_short] = value.preview_short;
                  replaced[meta.size] = value.size;
                  replaced[meta.readonly] = !!value.readonly;
                  replaced[meta.type] = value.type;
                  parent[last] = replaced;
                }
              });
              unserializable.forEach(function(path) {
                var length = path.length;
                var last = path[length - 1];
                var parent = getInObject(object, path.slice(0, length - 1));
                if (!parent || !parent.hasOwnProperty(last)) {
                  return;
                }
                var node = parent[last];
                var replacement = _objectSpread({}, node);
                upgradeUnserializable(replacement, node);
                parent[last] = replacement;
              });
              return object;
            }
            __name(hydrate, "hydrate");
            function upgradeUnserializable(destination, source) {
              var _Object$definePropert;
              Object.defineProperties(destination, (_Object$definePropert = {}, hydration_defineProperty(_Object$definePropert, meta.inspected, {
                configurable: true,
                enumerable: false,
                value: !!source.inspected
              }), hydration_defineProperty(_Object$definePropert, meta.name, {
                configurable: true,
                enumerable: false,
                value: source.name
              }), hydration_defineProperty(_Object$definePropert, meta.preview_long, {
                configurable: true,
                enumerable: false,
                value: source.preview_long
              }), hydration_defineProperty(_Object$definePropert, meta.preview_short, {
                configurable: true,
                enumerable: false,
                value: source.preview_short
              }), hydration_defineProperty(_Object$definePropert, meta.size, {
                configurable: true,
                enumerable: false,
                value: source.size
              }), hydration_defineProperty(_Object$definePropert, meta.readonly, {
                configurable: true,
                enumerable: false,
                value: !!source.readonly
              }), hydration_defineProperty(_Object$definePropert, meta.type, {
                configurable: true,
                enumerable: false,
                value: source.type
              }), hydration_defineProperty(_Object$definePropert, meta.unserializable, {
                configurable: true,
                enumerable: false,
                value: !!source.unserializable
              }), _Object$definePropert));
              delete destination.inspected;
              delete destination.name;
              delete destination.preview_long;
              delete destination.preview_short;
              delete destination.size;
              delete destination.readonly;
              delete destination.type;
              delete destination.unserializable;
            }
            __name(upgradeUnserializable, "upgradeUnserializable");
            ;
            var isArrayImpl = Array.isArray;
            function isArray_isArray(a) {
              return isArrayImpl(a);
            }
            __name(isArray_isArray, "isArray_isArray");
            const shared_isArray = isArray_isArray;
            ;
            function utils_toConsumableArray(arr) {
              return utils_arrayWithoutHoles(arr) || utils_iterableToArray(arr) || backend_utils_unsupportedIterableToArray(arr) || utils_nonIterableSpread();
            }
            __name(utils_toConsumableArray, "utils_toConsumableArray");
            function utils_nonIterableSpread() {
              throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
            }
            __name(utils_nonIterableSpread, "utils_nonIterableSpread");
            function backend_utils_unsupportedIterableToArray(o, minLen) {
              if (!o) return;
              if (typeof o === "string") return backend_utils_arrayLikeToArray(o, minLen);
              var n = Object.prototype.toString.call(o).slice(8, -1);
              if (n === "Object" && o.constructor) n = o.constructor.name;
              if (n === "Map" || n === "Set") return Array.from(o);
              if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return backend_utils_arrayLikeToArray(o, minLen);
            }
            __name(backend_utils_unsupportedIterableToArray, "backend_utils_unsupportedIterableToArray");
            function utils_iterableToArray(iter) {
              if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
            }
            __name(utils_iterableToArray, "utils_iterableToArray");
            function utils_arrayWithoutHoles(arr) {
              if (Array.isArray(arr)) return backend_utils_arrayLikeToArray(arr);
            }
            __name(utils_arrayWithoutHoles, "utils_arrayWithoutHoles");
            function backend_utils_arrayLikeToArray(arr, len) {
              if (len == null || len > arr.length) len = arr.length;
              for (var i = 0, arr2 = new Array(len); i < len; i++) {
                arr2[i] = arr[i];
              }
              return arr2;
            }
            __name(backend_utils_arrayLikeToArray, "backend_utils_arrayLikeToArray");
            function backend_utils_typeof(obj) {
              "@babel/helpers - typeof";
              if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                backend_utils_typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                  return typeof obj2;
                }, "_typeof");
              } else {
                backend_utils_typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                  return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                }, "_typeof");
              }
              return backend_utils_typeof(obj);
            }
            __name(backend_utils_typeof, "backend_utils_typeof");
            function utils_ownKeys(object, enumerableOnly) {
              var keys = Object.keys(object);
              if (Object.getOwnPropertySymbols) {
                var symbols = Object.getOwnPropertySymbols(object);
                if (enumerableOnly) symbols = symbols.filter(function(sym) {
                  return Object.getOwnPropertyDescriptor(object, sym).enumerable;
                });
                keys.push.apply(keys, symbols);
              }
              return keys;
            }
            __name(utils_ownKeys, "utils_ownKeys");
            function utils_objectSpread(target) {
              for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i] != null ? arguments[i] : {};
                if (i % 2) {
                  utils_ownKeys(Object(source), true).forEach(function(key) {
                    utils_defineProperty(target, key, source[key]);
                  });
                } else if (Object.getOwnPropertyDescriptors) {
                  Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
                } else {
                  utils_ownKeys(Object(source)).forEach(function(key) {
                    Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
                  });
                }
              }
              return target;
            }
            __name(utils_objectSpread, "utils_objectSpread");
            function utils_defineProperty(obj, key, value) {
              if (key in obj) {
                Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
              } else {
                obj[key] = value;
              }
              return obj;
            }
            __name(utils_defineProperty, "utils_defineProperty");
            var FIRST_DEVTOOLS_BACKEND_LOCKSTEP_VER = "999.9.9";
            function hasAssignedBackend(version) {
              if (version == null || version === "") {
                return false;
              }
              return gte(version, FIRST_DEVTOOLS_BACKEND_LOCKSTEP_VER);
            }
            __name(hasAssignedBackend, "hasAssignedBackend");
            function cleanForBridge(data, isPathAllowed) {
              var path = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [];
              if (data !== null) {
                var cleanedPaths = [];
                var unserializablePaths = [];
                var cleanedData = dehydrate(data, cleanedPaths, unserializablePaths, path, isPathAllowed);
                return {
                  data: cleanedData,
                  cleaned: cleanedPaths,
                  unserializable: unserializablePaths
                };
              } else {
                return null;
              }
            }
            __name(cleanForBridge, "cleanForBridge");
            function copyWithDelete(obj, path) {
              var index = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0;
              var key = path[index];
              var updated = shared_isArray(obj) ? obj.slice() : utils_objectSpread({}, obj);
              if (index + 1 === path.length) {
                if (shared_isArray(updated)) {
                  updated.splice(key, 1);
                } else {
                  delete updated[key];
                }
              } else {
                updated[key] = copyWithDelete(obj[key], path, index + 1);
              }
              return updated;
            }
            __name(copyWithDelete, "copyWithDelete");
            function copyWithRename(obj, oldPath, newPath) {
              var index = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
              var oldKey = oldPath[index];
              var updated = shared_isArray(obj) ? obj.slice() : utils_objectSpread({}, obj);
              if (index + 1 === oldPath.length) {
                var newKey = newPath[index];
                updated[newKey] = updated[oldKey];
                if (shared_isArray(updated)) {
                  updated.splice(oldKey, 1);
                } else {
                  delete updated[oldKey];
                }
              } else {
                updated[oldKey] = copyWithRename(obj[oldKey], oldPath, newPath, index + 1);
              }
              return updated;
            }
            __name(copyWithRename, "copyWithRename");
            function copyWithSet(obj, path, value) {
              var index = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
              if (index >= path.length) {
                return value;
              }
              var key = path[index];
              var updated = shared_isArray(obj) ? obj.slice() : utils_objectSpread({}, obj);
              updated[key] = copyWithSet(obj[key], path, value, index + 1);
              return updated;
            }
            __name(copyWithSet, "copyWithSet");
            function getEffectDurations(root) {
              var effectDuration = null;
              var passiveEffectDuration = null;
              var hostRoot = root.current;
              if (hostRoot != null) {
                var stateNode = hostRoot.stateNode;
                if (stateNode != null) {
                  effectDuration = stateNode.effectDuration != null ? stateNode.effectDuration : null;
                  passiveEffectDuration = stateNode.passiveEffectDuration != null ? stateNode.passiveEffectDuration : null;
                }
              }
              return {
                effectDuration,
                passiveEffectDuration
              };
            }
            __name(getEffectDurations, "getEffectDurations");
            function serializeToString(data) {
              if (data === void 0) {
                return "undefined";
              }
              var cache = /* @__PURE__ */ new Set();
              return JSON.stringify(data, function(key, value) {
                if (backend_utils_typeof(value) === "object" && value !== null) {
                  if (cache.has(value)) {
                    return;
                  }
                  cache.add(value);
                }
                if (typeof value === "bigint") {
                  return value.toString() + "n";
                }
                return value;
              }, 2);
            }
            __name(serializeToString, "serializeToString");
            function formatWithStyles(inputArgs, style) {
              if (inputArgs === void 0 || inputArgs === null || inputArgs.length === 0 || // Matches any of %c but not %%c
              typeof inputArgs[0] === "string" && inputArgs[0].match(/([^%]|^)(%c)/g) || style === void 0) {
                return inputArgs;
              }
              var REGEXP = /([^%]|^)((%%)*)(%([oOdisf]))/g;
              if (typeof inputArgs[0] === "string" && inputArgs[0].match(REGEXP)) {
                return ["%c".concat(inputArgs[0]), style].concat(utils_toConsumableArray(inputArgs.slice(1)));
              } else {
                var firstArg = inputArgs.reduce(function(formatStr, elem, i) {
                  if (i > 0) {
                    formatStr += " ";
                  }
                  switch (backend_utils_typeof(elem)) {
                    case "string":
                    case "boolean":
                    case "symbol":
                      return formatStr += "%s";
                    case "number":
                      var formatting = Number.isInteger(elem) ? "%i" : "%f";
                      return formatStr += formatting;
                    default:
                      return formatStr += "%o";
                  }
                }, "%c");
                return [firstArg, style].concat(utils_toConsumableArray(inputArgs));
              }
            }
            __name(formatWithStyles, "formatWithStyles");
            function format(maybeMessage) {
              for (var _len = arguments.length, inputArgs = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                inputArgs[_key - 1] = arguments[_key];
              }
              var args = inputArgs.slice();
              var formatted = String(maybeMessage);
              if (typeof maybeMessage === "string") {
                if (args.length) {
                  var REGEXP = /(%?)(%([jds]))/g;
                  formatted = formatted.replace(REGEXP, function(match, escaped, ptn, flag) {
                    var arg = args.shift();
                    switch (flag) {
                      case "s":
                        arg += "";
                        break;
                      case "d":
                      case "i":
                        arg = parseInt(arg, 10).toString();
                        break;
                      case "f":
                        arg = parseFloat(arg).toString();
                        break;
                    }
                    if (!escaped) {
                      return arg;
                    }
                    args.unshift(arg);
                    return match;
                  });
                }
              }
              if (args.length) {
                for (var i = 0; i < args.length; i++) {
                  formatted += " " + String(args[i]);
                }
              }
              formatted = formatted.replace(/%{2,2}/g, "%");
              return String(formatted);
            }
            __name(format, "format");
            function isSynchronousXHRSupported() {
              return !!(window.document && window.document.featurePolicy && window.document.featurePolicy.allowsFeature("sync-xhr"));
            }
            __name(isSynchronousXHRSupported, "isSynchronousXHRSupported");
            function gt() {
              var a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
              var b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
              return compareVersions(a, b) === 1;
            }
            __name(gt, "gt");
            function gte() {
              var a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
              var b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
              return compareVersions(a, b) > -1;
            }
            __name(gte, "gte");
            var react_debug_tools = __webpack_require__(987);
            ;
            var CONCURRENT_MODE_NUMBER = 60111;
            var CONCURRENT_MODE_SYMBOL_STRING = "Symbol(react.concurrent_mode)";
            var CONTEXT_NUMBER = 60110;
            var CONTEXT_SYMBOL_STRING = "Symbol(react.context)";
            var SERVER_CONTEXT_SYMBOL_STRING = "Symbol(react.server_context)";
            var DEPRECATED_ASYNC_MODE_SYMBOL_STRING = "Symbol(react.async_mode)";
            var ELEMENT_NUMBER = 60103;
            var ELEMENT_SYMBOL_STRING = "Symbol(react.element)";
            var DEBUG_TRACING_MODE_NUMBER = 60129;
            var DEBUG_TRACING_MODE_SYMBOL_STRING = "Symbol(react.debug_trace_mode)";
            var ReactSymbols_FORWARD_REF_NUMBER = 60112;
            var ReactSymbols_FORWARD_REF_SYMBOL_STRING = "Symbol(react.forward_ref)";
            var FRAGMENT_NUMBER = 60107;
            var FRAGMENT_SYMBOL_STRING = "Symbol(react.fragment)";
            var ReactSymbols_LAZY_NUMBER = 60116;
            var ReactSymbols_LAZY_SYMBOL_STRING = "Symbol(react.lazy)";
            var ReactSymbols_MEMO_NUMBER = 60115;
            var ReactSymbols_MEMO_SYMBOL_STRING = "Symbol(react.memo)";
            var PORTAL_NUMBER = 60106;
            var PORTAL_SYMBOL_STRING = "Symbol(react.portal)";
            var PROFILER_NUMBER = 60114;
            var PROFILER_SYMBOL_STRING = "Symbol(react.profiler)";
            var PROVIDER_NUMBER = 60109;
            var PROVIDER_SYMBOL_STRING = "Symbol(react.provider)";
            var SCOPE_NUMBER = 60119;
            var SCOPE_SYMBOL_STRING = "Symbol(react.scope)";
            var STRICT_MODE_NUMBER = 60108;
            var STRICT_MODE_SYMBOL_STRING = "Symbol(react.strict_mode)";
            var ReactSymbols_SUSPENSE_NUMBER = 60113;
            var ReactSymbols_SUSPENSE_SYMBOL_STRING = "Symbol(react.suspense)";
            var ReactSymbols_SUSPENSE_LIST_NUMBER = 60120;
            var ReactSymbols_SUSPENSE_LIST_SYMBOL_STRING = "Symbol(react.suspense_list)";
            var SERVER_CONTEXT_DEFAULT_VALUE_NOT_LOADED_SYMBOL_STRING = "Symbol(react.server_context.defaultValue)";
            ;
            var consoleManagedByDevToolsDuringStrictMode = false;
            var enableLogger = false;
            var enableStyleXFeatures = false;
            var isInternalFacebookBuild = false;
            null;
            ;
            function is(x, y) {
              return x === y && (x !== 0 || 1 / x === 1 / y) || x !== x && y !== y;
            }
            __name(is, "is");
            var objectIs = (
              // $FlowFixMe[method-unbinding]
              typeof Object.is === "function" ? Object.is : is
            );
            const shared_objectIs = objectIs;
            ;
            var hasOwnProperty_hasOwnProperty = Object.prototype.hasOwnProperty;
            const shared_hasOwnProperty = hasOwnProperty_hasOwnProperty;
            ;
            var cachedStyleNameToValueMap = /* @__PURE__ */ new Map();
            function getStyleXData(data) {
              var sources = /* @__PURE__ */ new Set();
              var resolvedStyles = {};
              crawlData(data, sources, resolvedStyles);
              return {
                sources: Array.from(sources).sort(),
                resolvedStyles
              };
            }
            __name(getStyleXData, "getStyleXData");
            function crawlData(data, sources, resolvedStyles) {
              if (data == null) {
                return;
              }
              if (src_isArray(data)) {
                data.forEach(function(entry) {
                  if (entry == null) {
                    return;
                  }
                  if (src_isArray(entry)) {
                    crawlData(entry, sources, resolvedStyles);
                  } else {
                    crawlObjectProperties(entry, sources, resolvedStyles);
                  }
                });
              } else {
                crawlObjectProperties(data, sources, resolvedStyles);
              }
              resolvedStyles = Object.fromEntries(Object.entries(resolvedStyles).sort());
            }
            __name(crawlData, "crawlData");
            function crawlObjectProperties(entry, sources, resolvedStyles) {
              var keys = Object.keys(entry);
              keys.forEach(function(key) {
                var value = entry[key];
                if (typeof value === "string") {
                  if (key === value) {
                    sources.add(key);
                  } else {
                    var propertyValue = getPropertyValueForStyleName(value);
                    if (propertyValue != null) {
                      resolvedStyles[key] = propertyValue;
                    }
                  }
                } else {
                  var nestedStyle = {};
                  resolvedStyles[key] = nestedStyle;
                  crawlData([value], sources, nestedStyle);
                }
              });
            }
            __name(crawlObjectProperties, "crawlObjectProperties");
            function getPropertyValueForStyleName(styleName) {
              if (cachedStyleNameToValueMap.has(styleName)) {
                return cachedStyleNameToValueMap.get(styleName);
              }
              for (var styleSheetIndex = 0; styleSheetIndex < document.styleSheets.length; styleSheetIndex++) {
                var styleSheet = document.styleSheets[styleSheetIndex];
                var rules = null;
                try {
                  rules = styleSheet.cssRules;
                } catch (_e) {
                  continue;
                }
                for (var ruleIndex = 0; ruleIndex < rules.length; ruleIndex++) {
                  if (!(rules[ruleIndex] instanceof CSSStyleRule)) {
                    continue;
                  }
                  var rule = rules[ruleIndex];
                  var cssText = rule.cssText, selectorText = rule.selectorText, style = rule.style;
                  if (selectorText != null) {
                    if (selectorText.startsWith(".".concat(styleName))) {
                      var match = cssText.match(/{ *([a-z\-]+):/);
                      if (match !== null) {
                        var property = match[1];
                        var value = style.getPropertyValue(property);
                        cachedStyleNameToValueMap.set(styleName, value);
                        return value;
                      } else {
                        return null;
                      }
                    }
                  }
                }
              }
              return null;
            }
            __name(getPropertyValueForStyleName, "getPropertyValueForStyleName");
            ;
            var CHANGE_LOG_URL = "https://github.com/facebook/react/blob/main/packages/react-devtools/CHANGELOG.md";
            var UNSUPPORTED_VERSION_URL = "https://reactjs.org/blog/2019/08/15/new-react-devtools.html#how-do-i-get-the-old-version-back";
            var REACT_DEVTOOLS_WORKPLACE_URL = "https://fburl.com/react-devtools-workplace-group";
            var THEME_STYLES = {
              light: {
                "--color-attribute-name": "#ef6632",
                "--color-attribute-name-not-editable": "#23272f",
                "--color-attribute-name-inverted": "rgba(255, 255, 255, 0.7)",
                "--color-attribute-value": "#1a1aa6",
                "--color-attribute-value-inverted": "#ffffff",
                "--color-attribute-editable-value": "#1a1aa6",
                "--color-background": "#ffffff",
                "--color-background-hover": "rgba(0, 136, 250, 0.1)",
                "--color-background-inactive": "#e5e5e5",
                "--color-background-invalid": "#fff0f0",
                "--color-background-selected": "#0088fa",
                "--color-button-background": "#ffffff",
                "--color-button-background-focus": "#ededed",
                "--color-button": "#5f6673",
                "--color-button-disabled": "#cfd1d5",
                "--color-button-active": "#0088fa",
                "--color-button-focus": "#23272f",
                "--color-button-hover": "#23272f",
                "--color-border": "#eeeeee",
                "--color-commit-did-not-render-fill": "#cfd1d5",
                "--color-commit-did-not-render-fill-text": "#000000",
                "--color-commit-did-not-render-pattern": "#cfd1d5",
                "--color-commit-did-not-render-pattern-text": "#333333",
                "--color-commit-gradient-0": "#37afa9",
                "--color-commit-gradient-1": "#63b19e",
                "--color-commit-gradient-2": "#80b393",
                "--color-commit-gradient-3": "#97b488",
                "--color-commit-gradient-4": "#abb67d",
                "--color-commit-gradient-5": "#beb771",
                "--color-commit-gradient-6": "#cfb965",
                "--color-commit-gradient-7": "#dfba57",
                "--color-commit-gradient-8": "#efbb49",
                "--color-commit-gradient-9": "#febc38",
                "--color-commit-gradient-text": "#000000",
                "--color-component-name": "#6a51b2",
                "--color-component-name-inverted": "#ffffff",
                "--color-component-badge-background": "rgba(0, 0, 0, 0.1)",
                "--color-component-badge-background-inverted": "rgba(255, 255, 255, 0.25)",
                "--color-component-badge-count": "#777d88",
                "--color-component-badge-count-inverted": "rgba(255, 255, 255, 0.7)",
                "--color-console-error-badge-text": "#ffffff",
                "--color-console-error-background": "#fff0f0",
                "--color-console-error-border": "#ffd6d6",
                "--color-console-error-icon": "#eb3941",
                "--color-console-error-text": "#fe2e31",
                "--color-console-warning-badge-text": "#000000",
                "--color-console-warning-background": "#fffbe5",
                "--color-console-warning-border": "#fff5c1",
                "--color-console-warning-icon": "#f4bd00",
                "--color-console-warning-text": "#64460c",
                "--color-context-background": "rgba(0,0,0,.9)",
                "--color-context-background-hover": "rgba(255, 255, 255, 0.1)",
                "--color-context-background-selected": "#178fb9",
                "--color-context-border": "#3d424a",
                "--color-context-text": "#ffffff",
                "--color-context-text-selected": "#ffffff",
                "--color-dim": "#777d88",
                "--color-dimmer": "#cfd1d5",
                "--color-dimmest": "#eff0f1",
                "--color-error-background": "hsl(0, 100%, 97%)",
                "--color-error-border": "hsl(0, 100%, 92%)",
                "--color-error-text": "#ff0000",
                "--color-expand-collapse-toggle": "#777d88",
                "--color-link": "#0000ff",
                "--color-modal-background": "rgba(255, 255, 255, 0.75)",
                "--color-bridge-version-npm-background": "#eff0f1",
                "--color-bridge-version-npm-text": "#000000",
                "--color-bridge-version-number": "#0088fa",
                "--color-primitive-hook-badge-background": "#e5e5e5",
                "--color-primitive-hook-badge-text": "#5f6673",
                "--color-record-active": "#fc3a4b",
                "--color-record-hover": "#3578e5",
                "--color-record-inactive": "#0088fa",
                "--color-resize-bar": "#eeeeee",
                "--color-resize-bar-active": "#dcdcdc",
                "--color-resize-bar-border": "#d1d1d1",
                "--color-resize-bar-dot": "#333333",
                "--color-timeline-internal-module": "#d1d1d1",
                "--color-timeline-internal-module-hover": "#c9c9c9",
                "--color-timeline-internal-module-text": "#444",
                "--color-timeline-native-event": "#ccc",
                "--color-timeline-native-event-hover": "#aaa",
                "--color-timeline-network-primary": "#fcf3dc",
                "--color-timeline-network-primary-hover": "#f0e7d1",
                "--color-timeline-network-secondary": "#efc457",
                "--color-timeline-network-secondary-hover": "#e3ba52",
                "--color-timeline-priority-background": "#f6f6f6",
                "--color-timeline-priority-border": "#eeeeee",
                "--color-timeline-user-timing": "#c9cacd",
                "--color-timeline-user-timing-hover": "#93959a",
                "--color-timeline-react-idle": "#d3e5f6",
                "--color-timeline-react-idle-hover": "#c3d9ef",
                "--color-timeline-react-render": "#9fc3f3",
                "--color-timeline-react-render-hover": "#83afe9",
                "--color-timeline-react-render-text": "#11365e",
                "--color-timeline-react-commit": "#c88ff0",
                "--color-timeline-react-commit-hover": "#b281d6",
                "--color-timeline-react-commit-text": "#3e2c4a",
                "--color-timeline-react-layout-effects": "#b281d6",
                "--color-timeline-react-layout-effects-hover": "#9d71bd",
                "--color-timeline-react-layout-effects-text": "#3e2c4a",
                "--color-timeline-react-passive-effects": "#b281d6",
                "--color-timeline-react-passive-effects-hover": "#9d71bd",
                "--color-timeline-react-passive-effects-text": "#3e2c4a",
                "--color-timeline-react-schedule": "#9fc3f3",
                "--color-timeline-react-schedule-hover": "#2683E2",
                "--color-timeline-react-suspense-rejected": "#f1cc14",
                "--color-timeline-react-suspense-rejected-hover": "#ffdf37",
                "--color-timeline-react-suspense-resolved": "#a6e59f",
                "--color-timeline-react-suspense-resolved-hover": "#89d281",
                "--color-timeline-react-suspense-unresolved": "#c9cacd",
                "--color-timeline-react-suspense-unresolved-hover": "#93959a",
                "--color-timeline-thrown-error": "#ee1638",
                "--color-timeline-thrown-error-hover": "#da1030",
                "--color-timeline-text-color": "#000000",
                "--color-timeline-text-dim-color": "#ccc",
                "--color-timeline-react-work-border": "#eeeeee",
                "--color-search-match": "yellow",
                "--color-search-match-current": "#f7923b",
                "--color-selected-tree-highlight-active": "rgba(0, 136, 250, 0.1)",
                "--color-selected-tree-highlight-inactive": "rgba(0, 0, 0, 0.05)",
                "--color-scroll-caret": "rgba(150, 150, 150, 0.5)",
                "--color-tab-selected-border": "#0088fa",
                "--color-text": "#000000",
                "--color-text-invalid": "#ff0000",
                "--color-text-selected": "#ffffff",
                "--color-toggle-background-invalid": "#fc3a4b",
                "--color-toggle-background-on": "#0088fa",
                "--color-toggle-background-off": "#cfd1d5",
                "--color-toggle-text": "#ffffff",
                "--color-warning-background": "#fb3655",
                "--color-warning-background-hover": "#f82042",
                "--color-warning-text-color": "#ffffff",
                "--color-warning-text-color-inverted": "#fd4d69",
                // The styles below should be kept in sync with 'root.css'
                // They are repeated there because they're used by e.g. tooltips or context menus
                // which get rendered outside of the DOM subtree (where normal theme/styles are written).
                "--color-scroll-thumb": "#c2c2c2",
                "--color-scroll-track": "#fafafa",
                "--color-tooltip-background": "rgba(0, 0, 0, 0.9)",
                "--color-tooltip-text": "#ffffff"
              },
              dark: {
                "--color-attribute-name": "#9d87d2",
                "--color-attribute-name-not-editable": "#ededed",
                "--color-attribute-name-inverted": "#282828",
                "--color-attribute-value": "#cedae0",
                "--color-attribute-value-inverted": "#ffffff",
                "--color-attribute-editable-value": "yellow",
                "--color-background": "#282c34",
                "--color-background-hover": "rgba(255, 255, 255, 0.1)",
                "--color-background-inactive": "#3d424a",
                "--color-background-invalid": "#5c0000",
                "--color-background-selected": "#178fb9",
                "--color-button-background": "#282c34",
                "--color-button-background-focus": "#3d424a",
                "--color-button": "#afb3b9",
                "--color-button-active": "#61dafb",
                "--color-button-disabled": "#4f5766",
                "--color-button-focus": "#a2e9fc",
                "--color-button-hover": "#ededed",
                "--color-border": "#3d424a",
                "--color-commit-did-not-render-fill": "#777d88",
                "--color-commit-did-not-render-fill-text": "#000000",
                "--color-commit-did-not-render-pattern": "#666c77",
                "--color-commit-did-not-render-pattern-text": "#ffffff",
                "--color-commit-gradient-0": "#37afa9",
                "--color-commit-gradient-1": "#63b19e",
                "--color-commit-gradient-2": "#80b393",
                "--color-commit-gradient-3": "#97b488",
                "--color-commit-gradient-4": "#abb67d",
                "--color-commit-gradient-5": "#beb771",
                "--color-commit-gradient-6": "#cfb965",
                "--color-commit-gradient-7": "#dfba57",
                "--color-commit-gradient-8": "#efbb49",
                "--color-commit-gradient-9": "#febc38",
                "--color-commit-gradient-text": "#000000",
                "--color-component-name": "#61dafb",
                "--color-component-name-inverted": "#282828",
                "--color-component-badge-background": "rgba(255, 255, 255, 0.25)",
                "--color-component-badge-background-inverted": "rgba(0, 0, 0, 0.25)",
                "--color-component-badge-count": "#8f949d",
                "--color-component-badge-count-inverted": "rgba(255, 255, 255, 0.7)",
                "--color-console-error-badge-text": "#000000",
                "--color-console-error-background": "#290000",
                "--color-console-error-border": "#5c0000",
                "--color-console-error-icon": "#eb3941",
                "--color-console-error-text": "#fc7f7f",
                "--color-console-warning-badge-text": "#000000",
                "--color-console-warning-background": "#332b00",
                "--color-console-warning-border": "#665500",
                "--color-console-warning-icon": "#f4bd00",
                "--color-console-warning-text": "#f5f2ed",
                "--color-context-background": "rgba(255,255,255,.95)",
                "--color-context-background-hover": "rgba(0, 136, 250, 0.1)",
                "--color-context-background-selected": "#0088fa",
                "--color-context-border": "#eeeeee",
                "--color-context-text": "#000000",
                "--color-context-text-selected": "#ffffff",
                "--color-dim": "#8f949d",
                "--color-dimmer": "#777d88",
                "--color-dimmest": "#4f5766",
                "--color-error-background": "#200",
                "--color-error-border": "#900",
                "--color-error-text": "#f55",
                "--color-expand-collapse-toggle": "#8f949d",
                "--color-link": "#61dafb",
                "--color-modal-background": "rgba(0, 0, 0, 0.75)",
                "--color-bridge-version-npm-background": "rgba(0, 0, 0, 0.25)",
                "--color-bridge-version-npm-text": "#ffffff",
                "--color-bridge-version-number": "yellow",
                "--color-primitive-hook-badge-background": "rgba(0, 0, 0, 0.25)",
                "--color-primitive-hook-badge-text": "rgba(255, 255, 255, 0.7)",
                "--color-record-active": "#fc3a4b",
                "--color-record-hover": "#a2e9fc",
                "--color-record-inactive": "#61dafb",
                "--color-resize-bar": "#282c34",
                "--color-resize-bar-active": "#31363f",
                "--color-resize-bar-border": "#3d424a",
                "--color-resize-bar-dot": "#cfd1d5",
                "--color-timeline-internal-module": "#303542",
                "--color-timeline-internal-module-hover": "#363b4a",
                "--color-timeline-internal-module-text": "#7f8899",
                "--color-timeline-native-event": "#b2b2b2",
                "--color-timeline-native-event-hover": "#949494",
                "--color-timeline-network-primary": "#fcf3dc",
                "--color-timeline-network-primary-hover": "#e3dbc5",
                "--color-timeline-network-secondary": "#efc457",
                "--color-timeline-network-secondary-hover": "#d6af4d",
                "--color-timeline-priority-background": "#1d2129",
                "--color-timeline-priority-border": "#282c34",
                "--color-timeline-user-timing": "#c9cacd",
                "--color-timeline-user-timing-hover": "#93959a",
                "--color-timeline-react-idle": "#3d485b",
                "--color-timeline-react-idle-hover": "#465269",
                "--color-timeline-react-render": "#2683E2",
                "--color-timeline-react-render-hover": "#1a76d4",
                "--color-timeline-react-render-text": "#11365e",
                "--color-timeline-react-commit": "#731fad",
                "--color-timeline-react-commit-hover": "#611b94",
                "--color-timeline-react-commit-text": "#e5c1ff",
                "--color-timeline-react-layout-effects": "#611b94",
                "--color-timeline-react-layout-effects-hover": "#51167a",
                "--color-timeline-react-layout-effects-text": "#e5c1ff",
                "--color-timeline-react-passive-effects": "#611b94",
                "--color-timeline-react-passive-effects-hover": "#51167a",
                "--color-timeline-react-passive-effects-text": "#e5c1ff",
                "--color-timeline-react-schedule": "#2683E2",
                "--color-timeline-react-schedule-hover": "#1a76d4",
                "--color-timeline-react-suspense-rejected": "#f1cc14",
                "--color-timeline-react-suspense-rejected-hover": "#e4c00f",
                "--color-timeline-react-suspense-resolved": "#a6e59f",
                "--color-timeline-react-suspense-resolved-hover": "#89d281",
                "--color-timeline-react-suspense-unresolved": "#c9cacd",
                "--color-timeline-react-suspense-unresolved-hover": "#93959a",
                "--color-timeline-thrown-error": "#fb3655",
                "--color-timeline-thrown-error-hover": "#f82042",
                "--color-timeline-text-color": "#282c34",
                "--color-timeline-text-dim-color": "#555b66",
                "--color-timeline-react-work-border": "#3d424a",
                "--color-search-match": "yellow",
                "--color-search-match-current": "#f7923b",
                "--color-selected-tree-highlight-active": "rgba(23, 143, 185, 0.15)",
                "--color-selected-tree-highlight-inactive": "rgba(255, 255, 255, 0.05)",
                "--color-scroll-caret": "#4f5766",
                "--color-shadow": "rgba(0, 0, 0, 0.5)",
                "--color-tab-selected-border": "#178fb9",
                "--color-text": "#ffffff",
                "--color-text-invalid": "#ff8080",
                "--color-text-selected": "#ffffff",
                "--color-toggle-background-invalid": "#fc3a4b",
                "--color-toggle-background-on": "#178fb9",
                "--color-toggle-background-off": "#777d88",
                "--color-toggle-text": "#ffffff",
                "--color-warning-background": "#ee1638",
                "--color-warning-background-hover": "#da1030",
                "--color-warning-text-color": "#ffffff",
                "--color-warning-text-color-inverted": "#ee1638",
                // The styles below should be kept in sync with 'root.css'
                // They are repeated there because they're used by e.g. tooltips or context menus
                // which get rendered outside of the DOM subtree (where normal theme/styles are written).
                "--color-scroll-thumb": "#afb3b9",
                "--color-scroll-track": "#313640",
                "--color-tooltip-background": "rgba(255, 255, 255, 0.95)",
                "--color-tooltip-text": "#000000"
              },
              compact: {
                "--font-size-monospace-small": "9px",
                "--font-size-monospace-normal": "11px",
                "--font-size-monospace-large": "15px",
                "--font-size-sans-small": "10px",
                "--font-size-sans-normal": "12px",
                "--font-size-sans-large": "14px",
                "--line-height-data": "18px"
              },
              comfortable: {
                "--font-size-monospace-small": "10px",
                "--font-size-monospace-normal": "13px",
                "--font-size-monospace-large": "17px",
                "--font-size-sans-small": "12px",
                "--font-size-sans-normal": "14px",
                "--font-size-sans-large": "16px",
                "--line-height-data": "22px"
              }
            };
            var COMFORTABLE_LINE_HEIGHT = parseInt(THEME_STYLES.comfortable["--line-height-data"], 10);
            var COMPACT_LINE_HEIGHT = parseInt(THEME_STYLES.compact["--line-height-data"], 10);
            ;
            var REACT_TOTAL_NUM_LANES = 31;
            var SCHEDULING_PROFILER_VERSION = 1;
            var SNAPSHOT_MAX_HEIGHT = 60;
            ;
            function DevToolsConsolePatching_ownKeys(object, enumerableOnly) {
              var keys = Object.keys(object);
              if (Object.getOwnPropertySymbols) {
                var symbols = Object.getOwnPropertySymbols(object);
                if (enumerableOnly) symbols = symbols.filter(function(sym) {
                  return Object.getOwnPropertyDescriptor(object, sym).enumerable;
                });
                keys.push.apply(keys, symbols);
              }
              return keys;
            }
            __name(DevToolsConsolePatching_ownKeys, "DevToolsConsolePatching_ownKeys");
            function DevToolsConsolePatching_objectSpread(target) {
              for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i] != null ? arguments[i] : {};
                if (i % 2) {
                  DevToolsConsolePatching_ownKeys(Object(source), true).forEach(function(key) {
                    DevToolsConsolePatching_defineProperty(target, key, source[key]);
                  });
                } else if (Object.getOwnPropertyDescriptors) {
                  Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
                } else {
                  DevToolsConsolePatching_ownKeys(Object(source)).forEach(function(key) {
                    Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
                  });
                }
              }
              return target;
            }
            __name(DevToolsConsolePatching_objectSpread, "DevToolsConsolePatching_objectSpread");
            function DevToolsConsolePatching_defineProperty(obj, key, value) {
              if (key in obj) {
                Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
              } else {
                obj[key] = value;
              }
              return obj;
            }
            __name(DevToolsConsolePatching_defineProperty, "DevToolsConsolePatching_defineProperty");
            var disabledDepth = 0;
            var prevLog;
            var prevInfo;
            var prevWarn;
            var prevError;
            var prevGroup;
            var prevGroupCollapsed;
            var prevGroupEnd;
            function disabledLog() {
            }
            __name(disabledLog, "disabledLog");
            disabledLog.__reactDisabledLog = true;
            function disableLogs() {
              if (disabledDepth === 0) {
                prevLog = console.log;
                prevInfo = console.info;
                prevWarn = console.warn;
                prevError = console.error;
                prevGroup = console.group;
                prevGroupCollapsed = console.groupCollapsed;
                prevGroupEnd = console.groupEnd;
                var props = {
                  configurable: true,
                  enumerable: true,
                  value: disabledLog,
                  writable: true
                };
                Object.defineProperties(console, {
                  info: props,
                  log: props,
                  warn: props,
                  error: props,
                  group: props,
                  groupCollapsed: props,
                  groupEnd: props
                });
              }
              disabledDepth++;
            }
            __name(disableLogs, "disableLogs");
            function reenableLogs() {
              disabledDepth--;
              if (disabledDepth === 0) {
                var props = {
                  configurable: true,
                  enumerable: true,
                  writable: true
                };
                Object.defineProperties(console, {
                  log: DevToolsConsolePatching_objectSpread(DevToolsConsolePatching_objectSpread({}, props), {}, {
                    value: prevLog
                  }),
                  info: DevToolsConsolePatching_objectSpread(DevToolsConsolePatching_objectSpread({}, props), {}, {
                    value: prevInfo
                  }),
                  warn: DevToolsConsolePatching_objectSpread(DevToolsConsolePatching_objectSpread({}, props), {}, {
                    value: prevWarn
                  }),
                  error: DevToolsConsolePatching_objectSpread(DevToolsConsolePatching_objectSpread({}, props), {}, {
                    value: prevError
                  }),
                  group: DevToolsConsolePatching_objectSpread(DevToolsConsolePatching_objectSpread({}, props), {}, {
                    value: prevGroup
                  }),
                  groupCollapsed: DevToolsConsolePatching_objectSpread(DevToolsConsolePatching_objectSpread({}, props), {}, {
                    value: prevGroupCollapsed
                  }),
                  groupEnd: DevToolsConsolePatching_objectSpread(DevToolsConsolePatching_objectSpread({}, props), {}, {
                    value: prevGroupEnd
                  })
                });
              }
              if (disabledDepth < 0) {
                console.error("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
              }
            }
            __name(reenableLogs, "reenableLogs");
            ;
            function DevToolsComponentStackFrame_typeof(obj) {
              "@babel/helpers - typeof";
              if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                DevToolsComponentStackFrame_typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                  return typeof obj2;
                }, "_typeof");
              } else {
                DevToolsComponentStackFrame_typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                  return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                }, "_typeof");
              }
              return DevToolsComponentStackFrame_typeof(obj);
            }
            __name(DevToolsComponentStackFrame_typeof, "DevToolsComponentStackFrame_typeof");
            var prefix;
            function describeBuiltInComponentFrame(name, ownerFn) {
              if (prefix === void 0) {
                try {
                  throw Error();
                } catch (x) {
                  var match = x.stack.trim().match(/\n( *(at )?)/);
                  prefix = match && match[1] || "";
                }
              }
              return "\n" + prefix + name;
            }
            __name(describeBuiltInComponentFrame, "describeBuiltInComponentFrame");
            var reentry = false;
            var componentFrameCache;
            if (false) {
              var PossiblyWeakMap;
            }
            function describeNativeComponentFrame(fn, construct, currentDispatcherRef) {
              if (!fn || reentry) {
                return "";
              }
              if (false) {
                var frame;
              }
              var control;
              var previousPrepareStackTrace = Error.prepareStackTrace;
              Error.prepareStackTrace = void 0;
              reentry = true;
              var previousDispatcher = currentDispatcherRef.current;
              currentDispatcherRef.current = null;
              disableLogs();
              try {
                if (construct) {
                  var Fake = /* @__PURE__ */ __name(function Fake2() {
                    throw Error();
                  }, "Fake");
                  Object.defineProperty(Fake.prototype, "props", {
                    set: /* @__PURE__ */ __name(function set() {
                      throw Error();
                    }, "set")
                  });
                  if ((typeof Reflect === "undefined" ? "undefined" : DevToolsComponentStackFrame_typeof(Reflect)) === "object" && Reflect.construct) {
                    try {
                      Reflect.construct(Fake, []);
                    } catch (x) {
                      control = x;
                    }
                    Reflect.construct(fn, [], Fake);
                  } else {
                    try {
                      Fake.call();
                    } catch (x) {
                      control = x;
                    }
                    fn.call(Fake.prototype);
                  }
                } else {
                  try {
                    throw Error();
                  } catch (x) {
                    control = x;
                  }
                  fn();
                }
              } catch (sample) {
                if (sample && control && typeof sample.stack === "string") {
                  var sampleLines = sample.stack.split("\n");
                  var controlLines = control.stack.split("\n");
                  var s = sampleLines.length - 1;
                  var c = controlLines.length - 1;
                  while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
                    c--;
                  }
                  for (; s >= 1 && c >= 0; s--, c--) {
                    if (sampleLines[s] !== controlLines[c]) {
                      if (s !== 1 || c !== 1) {
                        do {
                          s--;
                          c--;
                          if (c < 0 || sampleLines[s] !== controlLines[c]) {
                            var _frame = "\n" + sampleLines[s].replace(" at new ", " at ");
                            if (false) {
                            }
                            return _frame;
                          }
                        } while (s >= 1 && c >= 0);
                      }
                      break;
                    }
                  }
                }
              } finally {
                reentry = false;
                Error.prepareStackTrace = previousPrepareStackTrace;
                currentDispatcherRef.current = previousDispatcher;
                reenableLogs();
              }
              var name = fn ? fn.displayName || fn.name : "";
              var syntheticFrame = name ? describeBuiltInComponentFrame(name) : "";
              if (false) {
              }
              return syntheticFrame;
            }
            __name(describeNativeComponentFrame, "describeNativeComponentFrame");
            function describeClassComponentFrame(ctor, ownerFn, currentDispatcherRef) {
              return describeNativeComponentFrame(ctor, true, currentDispatcherRef);
            }
            __name(describeClassComponentFrame, "describeClassComponentFrame");
            function describeFunctionComponentFrame(fn, ownerFn, currentDispatcherRef) {
              return describeNativeComponentFrame(fn, false, currentDispatcherRef);
            }
            __name(describeFunctionComponentFrame, "describeFunctionComponentFrame");
            function shouldConstruct(Component) {
              var prototype = Component.prototype;
              return !!(prototype && prototype.isReactComponent);
            }
            __name(shouldConstruct, "shouldConstruct");
            function describeUnknownElementTypeFrameInDEV(type, ownerFn, currentDispatcherRef) {
              if (true) {
                return "";
              }
              if (type == null) {
                return "";
              }
              if (typeof type === "function") {
                return describeNativeComponentFrame(type, shouldConstruct(type), currentDispatcherRef);
              }
              if (typeof type === "string") {
                return describeBuiltInComponentFrame(type, ownerFn);
              }
              switch (type) {
                case SUSPENSE_NUMBER:
                case SUSPENSE_SYMBOL_STRING:
                  return describeBuiltInComponentFrame("Suspense", ownerFn);
                case SUSPENSE_LIST_NUMBER:
                case SUSPENSE_LIST_SYMBOL_STRING:
                  return describeBuiltInComponentFrame("SuspenseList", ownerFn);
              }
              if (DevToolsComponentStackFrame_typeof(type) === "object") {
                switch (type.$$typeof) {
                  case FORWARD_REF_NUMBER:
                  case FORWARD_REF_SYMBOL_STRING:
                    return describeFunctionComponentFrame(type.render, ownerFn, currentDispatcherRef);
                  case MEMO_NUMBER:
                  case MEMO_SYMBOL_STRING:
                    return describeUnknownElementTypeFrameInDEV(type.type, ownerFn, currentDispatcherRef);
                  case LAZY_NUMBER:
                  case LAZY_SYMBOL_STRING: {
                    var lazyComponent = type;
                    var payload = lazyComponent._payload;
                    var init = lazyComponent._init;
                    try {
                      return describeUnknownElementTypeFrameInDEV(init(payload), ownerFn, currentDispatcherRef);
                    } catch (x) {
                    }
                  }
                }
              }
              return "";
            }
            __name(describeUnknownElementTypeFrameInDEV, "describeUnknownElementTypeFrameInDEV");
            ;
            function describeFiber(workTagMap, workInProgress, currentDispatcherRef) {
              var HostComponent = workTagMap.HostComponent, LazyComponent = workTagMap.LazyComponent, SuspenseComponent = workTagMap.SuspenseComponent, SuspenseListComponent = workTagMap.SuspenseListComponent, FunctionComponent = workTagMap.FunctionComponent, IndeterminateComponent = workTagMap.IndeterminateComponent, SimpleMemoComponent = workTagMap.SimpleMemoComponent, ForwardRef = workTagMap.ForwardRef, ClassComponent = workTagMap.ClassComponent;
              var owner = false ? 0 : null;
              switch (workInProgress.tag) {
                case HostComponent:
                  return describeBuiltInComponentFrame(workInProgress.type, owner);
                case LazyComponent:
                  return describeBuiltInComponentFrame("Lazy", owner);
                case SuspenseComponent:
                  return describeBuiltInComponentFrame("Suspense", owner);
                case SuspenseListComponent:
                  return describeBuiltInComponentFrame("SuspenseList", owner);
                case FunctionComponent:
                case IndeterminateComponent:
                case SimpleMemoComponent:
                  return describeFunctionComponentFrame(workInProgress.type, owner, currentDispatcherRef);
                case ForwardRef:
                  return describeFunctionComponentFrame(workInProgress.type.render, owner, currentDispatcherRef);
                case ClassComponent:
                  return describeClassComponentFrame(workInProgress.type, owner, currentDispatcherRef);
                default:
                  return "";
              }
            }
            __name(describeFiber, "describeFiber");
            function getStackByFiberInDevAndProd(workTagMap, workInProgress, currentDispatcherRef) {
              try {
                var info = "";
                var node = workInProgress;
                do {
                  info += describeFiber(workTagMap, node, currentDispatcherRef);
                  node = node.return;
                } while (node);
                return info;
              } catch (x) {
                return "\nError generating stack: " + x.message + "\n" + x.stack;
              }
            }
            __name(getStackByFiberInDevAndProd, "getStackByFiberInDevAndProd");
            ;
            function profilingHooks_slicedToArray(arr, i) {
              return profilingHooks_arrayWithHoles(arr) || profilingHooks_iterableToArrayLimit(arr, i) || profilingHooks_unsupportedIterableToArray(arr, i) || profilingHooks_nonIterableRest();
            }
            __name(profilingHooks_slicedToArray, "profilingHooks_slicedToArray");
            function profilingHooks_nonIterableRest() {
              throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
            }
            __name(profilingHooks_nonIterableRest, "profilingHooks_nonIterableRest");
            function profilingHooks_unsupportedIterableToArray(o, minLen) {
              if (!o) return;
              if (typeof o === "string") return profilingHooks_arrayLikeToArray(o, minLen);
              var n = Object.prototype.toString.call(o).slice(8, -1);
              if (n === "Object" && o.constructor) n = o.constructor.name;
              if (n === "Map" || n === "Set") return Array.from(o);
              if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return profilingHooks_arrayLikeToArray(o, minLen);
            }
            __name(profilingHooks_unsupportedIterableToArray, "profilingHooks_unsupportedIterableToArray");
            function profilingHooks_arrayLikeToArray(arr, len) {
              if (len == null || len > arr.length) len = arr.length;
              for (var i = 0, arr2 = new Array(len); i < len; i++) {
                arr2[i] = arr[i];
              }
              return arr2;
            }
            __name(profilingHooks_arrayLikeToArray, "profilingHooks_arrayLikeToArray");
            function profilingHooks_iterableToArrayLimit(arr, i) {
              if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
              var _arr = [];
              var _n = true;
              var _d = false;
              var _e = void 0;
              try {
                for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                  _arr.push(_s.value);
                  if (i && _arr.length === i) break;
                }
              } catch (err) {
                _d = true;
                _e = err;
              } finally {
                try {
                  if (!_n && _i["return"] != null) _i["return"]();
                } finally {
                  if (_d) throw _e;
                }
              }
              return _arr;
            }
            __name(profilingHooks_iterableToArrayLimit, "profilingHooks_iterableToArrayLimit");
            function profilingHooks_arrayWithHoles(arr) {
              if (Array.isArray(arr)) return arr;
            }
            __name(profilingHooks_arrayWithHoles, "profilingHooks_arrayWithHoles");
            function profilingHooks_typeof(obj) {
              "@babel/helpers - typeof";
              if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                profilingHooks_typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                  return typeof obj2;
                }, "_typeof");
              } else {
                profilingHooks_typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                  return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                }, "_typeof");
              }
              return profilingHooks_typeof(obj);
            }
            __name(profilingHooks_typeof, "profilingHooks_typeof");
            var TIME_OFFSET = 10;
            var performanceTarget = null;
            var supportsUserTiming = typeof performance !== "undefined" && // $FlowFixMe[method-unbinding]
            typeof performance.mark === "function" && // $FlowFixMe[method-unbinding]
            typeof performance.clearMarks === "function";
            var supportsUserTimingV3 = false;
            if (supportsUserTiming) {
              var CHECK_V3_MARK = "__v3";
              var markOptions = {};
              Object.defineProperty(markOptions, "startTime", {
                get: /* @__PURE__ */ __name(function get() {
                  supportsUserTimingV3 = true;
                  return 0;
                }, "get"),
                set: /* @__PURE__ */ __name(function set() {
                }, "set")
              });
              try {
                performance.mark(CHECK_V3_MARK, markOptions);
              } catch (error) {
              } finally {
                performance.clearMarks(CHECK_V3_MARK);
              }
            }
            if (supportsUserTimingV3) {
              performanceTarget = performance;
            }
            var profilingHooks_getCurrentTime = (
              // $FlowFixMe[method-unbinding]
              (typeof performance === "undefined" ? "undefined" : profilingHooks_typeof(performance)) === "object" && typeof performance.now === "function" ? function() {
                return performance.now();
              } : function() {
                return Date.now();
              }
            );
            function setPerformanceMock_ONLY_FOR_TESTING(performanceMock) {
              performanceTarget = performanceMock;
              supportsUserTiming = performanceMock !== null;
              supportsUserTimingV3 = performanceMock !== null;
            }
            __name(setPerformanceMock_ONLY_FOR_TESTING, "setPerformanceMock_ONLY_FOR_TESTING");
            function createProfilingHooks(_ref) {
              var getDisplayNameForFiber = _ref.getDisplayNameForFiber, getIsProfiling = _ref.getIsProfiling, getLaneLabelMap = _ref.getLaneLabelMap, workTagMap = _ref.workTagMap, currentDispatcherRef = _ref.currentDispatcherRef, reactVersion = _ref.reactVersion;
              var currentBatchUID = 0;
              var currentReactComponentMeasure = null;
              var currentReactMeasuresStack = [];
              var currentTimelineData = null;
              var currentFiberStacks = /* @__PURE__ */ new Map();
              var isProfiling = false;
              var nextRenderShouldStartNewBatch = false;
              function getRelativeTime() {
                var currentTime = profilingHooks_getCurrentTime();
                if (currentTimelineData) {
                  if (currentTimelineData.startTime === 0) {
                    currentTimelineData.startTime = currentTime - TIME_OFFSET;
                  }
                  return currentTime - currentTimelineData.startTime;
                }
                return 0;
              }
              __name(getRelativeTime, "getRelativeTime");
              function getInternalModuleRanges() {
                if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.getInternalModuleRanges === "function") {
                  var ranges = __REACT_DEVTOOLS_GLOBAL_HOOK__.getInternalModuleRanges();
                  if (shared_isArray(ranges)) {
                    return ranges;
                  }
                }
                return null;
              }
              __name(getInternalModuleRanges, "getInternalModuleRanges");
              function getTimelineData() {
                return currentTimelineData;
              }
              __name(getTimelineData, "getTimelineData");
              function laneToLanesArray(lanes) {
                var lanesArray = [];
                var lane = 1;
                for (var index = 0; index < REACT_TOTAL_NUM_LANES; index++) {
                  if (lane & lanes) {
                    lanesArray.push(lane);
                  }
                  lane *= 2;
                }
                return lanesArray;
              }
              __name(laneToLanesArray, "laneToLanesArray");
              var laneToLabelMap = typeof getLaneLabelMap === "function" ? getLaneLabelMap() : null;
              function markMetadata() {
                markAndClear("--react-version-".concat(reactVersion));
                markAndClear("--profiler-version-".concat(SCHEDULING_PROFILER_VERSION));
                var ranges = getInternalModuleRanges();
                if (ranges) {
                  for (var i = 0; i < ranges.length; i++) {
                    var range = ranges[i];
                    if (shared_isArray(range) && range.length === 2) {
                      var _ranges$i = profilingHooks_slicedToArray(ranges[i], 2), startStackFrame = _ranges$i[0], stopStackFrame = _ranges$i[1];
                      markAndClear("--react-internal-module-start-".concat(startStackFrame));
                      markAndClear("--react-internal-module-stop-".concat(stopStackFrame));
                    }
                  }
                }
                if (laneToLabelMap != null) {
                  var labels = Array.from(laneToLabelMap.values()).join(",");
                  markAndClear("--react-lane-labels-".concat(labels));
                }
              }
              __name(markMetadata, "markMetadata");
              function markAndClear(markName) {
                performanceTarget.mark(markName);
                performanceTarget.clearMarks(markName);
              }
              __name(markAndClear, "markAndClear");
              function recordReactMeasureStarted(type, lanes) {
                var depth = 0;
                if (currentReactMeasuresStack.length > 0) {
                  var top = currentReactMeasuresStack[currentReactMeasuresStack.length - 1];
                  depth = top.type === "render-idle" ? top.depth : top.depth + 1;
                }
                var lanesArray = laneToLanesArray(lanes);
                var reactMeasure = {
                  type,
                  batchUID: currentBatchUID,
                  depth,
                  lanes: lanesArray,
                  timestamp: getRelativeTime(),
                  duration: 0
                };
                currentReactMeasuresStack.push(reactMeasure);
                if (currentTimelineData) {
                  var _currentTimelineData = currentTimelineData, batchUIDToMeasuresMap = _currentTimelineData.batchUIDToMeasuresMap, laneToReactMeasureMap = _currentTimelineData.laneToReactMeasureMap;
                  var reactMeasures = batchUIDToMeasuresMap.get(currentBatchUID);
                  if (reactMeasures != null) {
                    reactMeasures.push(reactMeasure);
                  } else {
                    batchUIDToMeasuresMap.set(currentBatchUID, [reactMeasure]);
                  }
                  lanesArray.forEach(function(lane) {
                    reactMeasures = laneToReactMeasureMap.get(lane);
                    if (reactMeasures) {
                      reactMeasures.push(reactMeasure);
                    }
                  });
                }
              }
              __name(recordReactMeasureStarted, "recordReactMeasureStarted");
              function recordReactMeasureCompleted(type) {
                var currentTime = getRelativeTime();
                if (currentReactMeasuresStack.length === 0) {
                  console.error('Unexpected type "%s" completed at %sms while currentReactMeasuresStack is empty.', type, currentTime);
                  return;
                }
                var top = currentReactMeasuresStack.pop();
                if (top.type !== type) {
                  console.error('Unexpected type "%s" completed at %sms before "%s" completed.', type, currentTime, top.type);
                }
                top.duration = currentTime - top.timestamp;
                if (currentTimelineData) {
                  currentTimelineData.duration = getRelativeTime() + TIME_OFFSET;
                }
              }
              __name(recordReactMeasureCompleted, "recordReactMeasureCompleted");
              function markCommitStarted(lanes) {
                if (isProfiling) {
                  recordReactMeasureStarted("commit", lanes);
                  nextRenderShouldStartNewBatch = true;
                }
                if (supportsUserTimingV3) {
                  markAndClear("--commit-start-".concat(lanes));
                  markMetadata();
                }
              }
              __name(markCommitStarted, "markCommitStarted");
              function markCommitStopped() {
                if (isProfiling) {
                  recordReactMeasureCompleted("commit");
                  recordReactMeasureCompleted("render-idle");
                }
                if (supportsUserTimingV3) {
                  markAndClear("--commit-stop");
                }
              }
              __name(markCommitStopped, "markCommitStopped");
              function markComponentRenderStarted(fiber) {
                if (isProfiling || supportsUserTimingV3) {
                  var componentName = getDisplayNameForFiber(fiber) || "Unknown";
                  if (isProfiling) {
                    if (isProfiling) {
                      currentReactComponentMeasure = {
                        componentName,
                        duration: 0,
                        timestamp: getRelativeTime(),
                        type: "render",
                        warning: null
                      };
                    }
                  }
                  if (supportsUserTimingV3) {
                    markAndClear("--component-render-start-".concat(componentName));
                  }
                }
              }
              __name(markComponentRenderStarted, "markComponentRenderStarted");
              function markComponentRenderStopped() {
                if (isProfiling) {
                  if (currentReactComponentMeasure) {
                    if (currentTimelineData) {
                      currentTimelineData.componentMeasures.push(currentReactComponentMeasure);
                    }
                    currentReactComponentMeasure.duration = // $FlowFixMe[incompatible-use] found when upgrading Flow
                    getRelativeTime() - currentReactComponentMeasure.timestamp;
                    currentReactComponentMeasure = null;
                  }
                }
                if (supportsUserTimingV3) {
                  markAndClear("--component-render-stop");
                }
              }
              __name(markComponentRenderStopped, "markComponentRenderStopped");
              function markComponentLayoutEffectMountStarted(fiber) {
                if (isProfiling || supportsUserTimingV3) {
                  var componentName = getDisplayNameForFiber(fiber) || "Unknown";
                  if (isProfiling) {
                    if (isProfiling) {
                      currentReactComponentMeasure = {
                        componentName,
                        duration: 0,
                        timestamp: getRelativeTime(),
                        type: "layout-effect-mount",
                        warning: null
                      };
                    }
                  }
                  if (supportsUserTimingV3) {
                    markAndClear("--component-layout-effect-mount-start-".concat(componentName));
                  }
                }
              }
              __name(markComponentLayoutEffectMountStarted, "markComponentLayoutEffectMountStarted");
              function markComponentLayoutEffectMountStopped() {
                if (isProfiling) {
                  if (currentReactComponentMeasure) {
                    if (currentTimelineData) {
                      currentTimelineData.componentMeasures.push(currentReactComponentMeasure);
                    }
                    currentReactComponentMeasure.duration = // $FlowFixMe[incompatible-use] found when upgrading Flow
                    getRelativeTime() - currentReactComponentMeasure.timestamp;
                    currentReactComponentMeasure = null;
                  }
                }
                if (supportsUserTimingV3) {
                  markAndClear("--component-layout-effect-mount-stop");
                }
              }
              __name(markComponentLayoutEffectMountStopped, "markComponentLayoutEffectMountStopped");
              function markComponentLayoutEffectUnmountStarted(fiber) {
                if (isProfiling || supportsUserTimingV3) {
                  var componentName = getDisplayNameForFiber(fiber) || "Unknown";
                  if (isProfiling) {
                    if (isProfiling) {
                      currentReactComponentMeasure = {
                        componentName,
                        duration: 0,
                        timestamp: getRelativeTime(),
                        type: "layout-effect-unmount",
                        warning: null
                      };
                    }
                  }
                  if (supportsUserTimingV3) {
                    markAndClear("--component-layout-effect-unmount-start-".concat(componentName));
                  }
                }
              }
              __name(markComponentLayoutEffectUnmountStarted, "markComponentLayoutEffectUnmountStarted");
              function markComponentLayoutEffectUnmountStopped() {
                if (isProfiling) {
                  if (currentReactComponentMeasure) {
                    if (currentTimelineData) {
                      currentTimelineData.componentMeasures.push(currentReactComponentMeasure);
                    }
                    currentReactComponentMeasure.duration = // $FlowFixMe[incompatible-use] found when upgrading Flow
                    getRelativeTime() - currentReactComponentMeasure.timestamp;
                    currentReactComponentMeasure = null;
                  }
                }
                if (supportsUserTimingV3) {
                  markAndClear("--component-layout-effect-unmount-stop");
                }
              }
              __name(markComponentLayoutEffectUnmountStopped, "markComponentLayoutEffectUnmountStopped");
              function markComponentPassiveEffectMountStarted(fiber) {
                if (isProfiling || supportsUserTimingV3) {
                  var componentName = getDisplayNameForFiber(fiber) || "Unknown";
                  if (isProfiling) {
                    if (isProfiling) {
                      currentReactComponentMeasure = {
                        componentName,
                        duration: 0,
                        timestamp: getRelativeTime(),
                        type: "passive-effect-mount",
                        warning: null
                      };
                    }
                  }
                  if (supportsUserTimingV3) {
                    markAndClear("--component-passive-effect-mount-start-".concat(componentName));
                  }
                }
              }
              __name(markComponentPassiveEffectMountStarted, "markComponentPassiveEffectMountStarted");
              function markComponentPassiveEffectMountStopped() {
                if (isProfiling) {
                  if (currentReactComponentMeasure) {
                    if (currentTimelineData) {
                      currentTimelineData.componentMeasures.push(currentReactComponentMeasure);
                    }
                    currentReactComponentMeasure.duration = // $FlowFixMe[incompatible-use] found when upgrading Flow
                    getRelativeTime() - currentReactComponentMeasure.timestamp;
                    currentReactComponentMeasure = null;
                  }
                }
                if (supportsUserTimingV3) {
                  markAndClear("--component-passive-effect-mount-stop");
                }
              }
              __name(markComponentPassiveEffectMountStopped, "markComponentPassiveEffectMountStopped");
              function markComponentPassiveEffectUnmountStarted(fiber) {
                if (isProfiling || supportsUserTimingV3) {
                  var componentName = getDisplayNameForFiber(fiber) || "Unknown";
                  if (isProfiling) {
                    if (isProfiling) {
                      currentReactComponentMeasure = {
                        componentName,
                        duration: 0,
                        timestamp: getRelativeTime(),
                        type: "passive-effect-unmount",
                        warning: null
                      };
                    }
                  }
                  if (supportsUserTimingV3) {
                    markAndClear("--component-passive-effect-unmount-start-".concat(componentName));
                  }
                }
              }
              __name(markComponentPassiveEffectUnmountStarted, "markComponentPassiveEffectUnmountStarted");
              function markComponentPassiveEffectUnmountStopped() {
                if (isProfiling) {
                  if (currentReactComponentMeasure) {
                    if (currentTimelineData) {
                      currentTimelineData.componentMeasures.push(currentReactComponentMeasure);
                    }
                    currentReactComponentMeasure.duration = // $FlowFixMe[incompatible-use] found when upgrading Flow
                    getRelativeTime() - currentReactComponentMeasure.timestamp;
                    currentReactComponentMeasure = null;
                  }
                }
                if (supportsUserTimingV3) {
                  markAndClear("--component-passive-effect-unmount-stop");
                }
              }
              __name(markComponentPassiveEffectUnmountStopped, "markComponentPassiveEffectUnmountStopped");
              function markComponentErrored(fiber, thrownValue, lanes) {
                if (isProfiling || supportsUserTimingV3) {
                  var componentName = getDisplayNameForFiber(fiber) || "Unknown";
                  var phase = fiber.alternate === null ? "mount" : "update";
                  var message = "";
                  if (thrownValue !== null && profilingHooks_typeof(thrownValue) === "object" && typeof thrownValue.message === "string") {
                    message = thrownValue.message;
                  } else if (typeof thrownValue === "string") {
                    message = thrownValue;
                  }
                  if (isProfiling) {
                    if (currentTimelineData) {
                      currentTimelineData.thrownErrors.push({
                        componentName,
                        message,
                        phase,
                        timestamp: getRelativeTime(),
                        type: "thrown-error"
                      });
                    }
                  }
                  if (supportsUserTimingV3) {
                    markAndClear("--error-".concat(componentName, "-").concat(phase, "-").concat(message));
                  }
                }
              }
              __name(markComponentErrored, "markComponentErrored");
              var PossiblyWeakMap2 = typeof WeakMap === "function" ? WeakMap : Map;
              var wakeableIDs = new PossiblyWeakMap2();
              var wakeableID = 0;
              function getWakeableID(wakeable) {
                if (!wakeableIDs.has(wakeable)) {
                  wakeableIDs.set(wakeable, wakeableID++);
                }
                return wakeableIDs.get(wakeable);
              }
              __name(getWakeableID, "getWakeableID");
              function markComponentSuspended(fiber, wakeable, lanes) {
                if (isProfiling || supportsUserTimingV3) {
                  var eventType = wakeableIDs.has(wakeable) ? "resuspend" : "suspend";
                  var id = getWakeableID(wakeable);
                  var componentName = getDisplayNameForFiber(fiber) || "Unknown";
                  var phase = fiber.alternate === null ? "mount" : "update";
                  var displayName = wakeable.displayName || "";
                  var suspenseEvent = null;
                  if (isProfiling) {
                    suspenseEvent = {
                      componentName,
                      depth: 0,
                      duration: 0,
                      id: "".concat(id),
                      phase,
                      promiseName: displayName,
                      resolution: "unresolved",
                      timestamp: getRelativeTime(),
                      type: "suspense",
                      warning: null
                    };
                    if (currentTimelineData) {
                      currentTimelineData.suspenseEvents.push(suspenseEvent);
                    }
                  }
                  if (supportsUserTimingV3) {
                    markAndClear("--suspense-".concat(eventType, "-").concat(id, "-").concat(componentName, "-").concat(phase, "-").concat(lanes, "-").concat(displayName));
                  }
                  wakeable.then(function() {
                    if (suspenseEvent) {
                      suspenseEvent.duration = getRelativeTime() - suspenseEvent.timestamp;
                      suspenseEvent.resolution = "resolved";
                    }
                    if (supportsUserTimingV3) {
                      markAndClear("--suspense-resolved-".concat(id, "-").concat(componentName));
                    }
                  }, function() {
                    if (suspenseEvent) {
                      suspenseEvent.duration = getRelativeTime() - suspenseEvent.timestamp;
                      suspenseEvent.resolution = "rejected";
                    }
                    if (supportsUserTimingV3) {
                      markAndClear("--suspense-rejected-".concat(id, "-").concat(componentName));
                    }
                  });
                }
              }
              __name(markComponentSuspended, "markComponentSuspended");
              function markLayoutEffectsStarted(lanes) {
                if (isProfiling) {
                  recordReactMeasureStarted("layout-effects", lanes);
                }
                if (supportsUserTimingV3) {
                  markAndClear("--layout-effects-start-".concat(lanes));
                }
              }
              __name(markLayoutEffectsStarted, "markLayoutEffectsStarted");
              function markLayoutEffectsStopped() {
                if (isProfiling) {
                  recordReactMeasureCompleted("layout-effects");
                }
                if (supportsUserTimingV3) {
                  markAndClear("--layout-effects-stop");
                }
              }
              __name(markLayoutEffectsStopped, "markLayoutEffectsStopped");
              function markPassiveEffectsStarted(lanes) {
                if (isProfiling) {
                  recordReactMeasureStarted("passive-effects", lanes);
                }
                if (supportsUserTimingV3) {
                  markAndClear("--passive-effects-start-".concat(lanes));
                }
              }
              __name(markPassiveEffectsStarted, "markPassiveEffectsStarted");
              function markPassiveEffectsStopped() {
                if (isProfiling) {
                  recordReactMeasureCompleted("passive-effects");
                }
                if (supportsUserTimingV3) {
                  markAndClear("--passive-effects-stop");
                }
              }
              __name(markPassiveEffectsStopped, "markPassiveEffectsStopped");
              function markRenderStarted(lanes) {
                if (isProfiling) {
                  if (nextRenderShouldStartNewBatch) {
                    nextRenderShouldStartNewBatch = false;
                    currentBatchUID++;
                  }
                  if (currentReactMeasuresStack.length === 0 || currentReactMeasuresStack[currentReactMeasuresStack.length - 1].type !== "render-idle") {
                    recordReactMeasureStarted("render-idle", lanes);
                  }
                  recordReactMeasureStarted("render", lanes);
                }
                if (supportsUserTimingV3) {
                  markAndClear("--render-start-".concat(lanes));
                }
              }
              __name(markRenderStarted, "markRenderStarted");
              function markRenderYielded() {
                if (isProfiling) {
                  recordReactMeasureCompleted("render");
                }
                if (supportsUserTimingV3) {
                  markAndClear("--render-yield");
                }
              }
              __name(markRenderYielded, "markRenderYielded");
              function markRenderStopped() {
                if (isProfiling) {
                  recordReactMeasureCompleted("render");
                }
                if (supportsUserTimingV3) {
                  markAndClear("--render-stop");
                }
              }
              __name(markRenderStopped, "markRenderStopped");
              function markRenderScheduled(lane) {
                if (isProfiling) {
                  if (currentTimelineData) {
                    currentTimelineData.schedulingEvents.push({
                      lanes: laneToLanesArray(lane),
                      timestamp: getRelativeTime(),
                      type: "schedule-render",
                      warning: null
                    });
                  }
                }
                if (supportsUserTimingV3) {
                  markAndClear("--schedule-render-".concat(lane));
                }
              }
              __name(markRenderScheduled, "markRenderScheduled");
              function markForceUpdateScheduled(fiber, lane) {
                if (isProfiling || supportsUserTimingV3) {
                  var componentName = getDisplayNameForFiber(fiber) || "Unknown";
                  if (isProfiling) {
                    if (currentTimelineData) {
                      currentTimelineData.schedulingEvents.push({
                        componentName,
                        lanes: laneToLanesArray(lane),
                        timestamp: getRelativeTime(),
                        type: "schedule-force-update",
                        warning: null
                      });
                    }
                  }
                  if (supportsUserTimingV3) {
                    markAndClear("--schedule-forced-update-".concat(lane, "-").concat(componentName));
                  }
                }
              }
              __name(markForceUpdateScheduled, "markForceUpdateScheduled");
              function getParentFibers(fiber) {
                var parents = [];
                var parent = fiber;
                while (parent !== null) {
                  parents.push(parent);
                  parent = parent.return;
                }
                return parents;
              }
              __name(getParentFibers, "getParentFibers");
              function markStateUpdateScheduled(fiber, lane) {
                if (isProfiling || supportsUserTimingV3) {
                  var componentName = getDisplayNameForFiber(fiber) || "Unknown";
                  if (isProfiling) {
                    if (currentTimelineData) {
                      var event = {
                        componentName,
                        // Store the parent fibers so we can post process
                        // them after we finish profiling
                        lanes: laneToLanesArray(lane),
                        timestamp: getRelativeTime(),
                        type: "schedule-state-update",
                        warning: null
                      };
                      currentFiberStacks.set(event, getParentFibers(fiber));
                      currentTimelineData.schedulingEvents.push(event);
                    }
                  }
                  if (supportsUserTimingV3) {
                    markAndClear("--schedule-state-update-".concat(lane, "-").concat(componentName));
                  }
                }
              }
              __name(markStateUpdateScheduled, "markStateUpdateScheduled");
              function toggleProfilingStatus(value) {
                if (isProfiling !== value) {
                  isProfiling = value;
                  if (isProfiling) {
                    var internalModuleSourceToRanges = /* @__PURE__ */ new Map();
                    if (supportsUserTimingV3) {
                      var ranges = getInternalModuleRanges();
                      if (ranges) {
                        for (var i = 0; i < ranges.length; i++) {
                          var range = ranges[i];
                          if (shared_isArray(range) && range.length === 2) {
                            var _ranges$i2 = profilingHooks_slicedToArray(ranges[i], 2), startStackFrame = _ranges$i2[0], stopStackFrame = _ranges$i2[1];
                            markAndClear("--react-internal-module-start-".concat(startStackFrame));
                            markAndClear("--react-internal-module-stop-".concat(stopStackFrame));
                          }
                        }
                      }
                    }
                    var laneToReactMeasureMap = /* @__PURE__ */ new Map();
                    var lane = 1;
                    for (var index = 0; index < REACT_TOTAL_NUM_LANES; index++) {
                      laneToReactMeasureMap.set(lane, []);
                      lane *= 2;
                    }
                    currentBatchUID = 0;
                    currentReactComponentMeasure = null;
                    currentReactMeasuresStack = [];
                    currentFiberStacks = /* @__PURE__ */ new Map();
                    currentTimelineData = {
                      // Session wide metadata; only collected once.
                      internalModuleSourceToRanges,
                      laneToLabelMap: laneToLabelMap || /* @__PURE__ */ new Map(),
                      reactVersion,
                      // Data logged by React during profiling session.
                      componentMeasures: [],
                      schedulingEvents: [],
                      suspenseEvents: [],
                      thrownErrors: [],
                      // Data inferred based on what React logs.
                      batchUIDToMeasuresMap: /* @__PURE__ */ new Map(),
                      duration: 0,
                      laneToReactMeasureMap,
                      startTime: 0,
                      // Data only available in Chrome profiles.
                      flamechart: [],
                      nativeEvents: [],
                      networkMeasures: [],
                      otherUserTimingMarks: [],
                      snapshots: [],
                      snapshotHeight: 0
                    };
                    nextRenderShouldStartNewBatch = true;
                  } else {
                    if (currentTimelineData !== null) {
                      currentTimelineData.schedulingEvents.forEach(function(event) {
                        if (event.type === "schedule-state-update") {
                          var fiberStack = currentFiberStacks.get(event);
                          if (fiberStack && currentDispatcherRef != null) {
                            event.componentStack = fiberStack.reduce(function(trace, fiber) {
                              return trace + describeFiber(workTagMap, fiber, currentDispatcherRef);
                            }, "");
                          }
                        }
                      });
                    }
                    currentFiberStacks.clear();
                  }
                }
              }
              __name(toggleProfilingStatus, "toggleProfilingStatus");
              return {
                getTimelineData,
                profilingHooks: {
                  markCommitStarted,
                  markCommitStopped,
                  markComponentRenderStarted,
                  markComponentRenderStopped,
                  markComponentPassiveEffectMountStarted,
                  markComponentPassiveEffectMountStopped,
                  markComponentPassiveEffectUnmountStarted,
                  markComponentPassiveEffectUnmountStopped,
                  markComponentLayoutEffectMountStarted,
                  markComponentLayoutEffectMountStopped,
                  markComponentLayoutEffectUnmountStarted,
                  markComponentLayoutEffectUnmountStopped,
                  markComponentErrored,
                  markComponentSuspended,
                  markLayoutEffectsStarted,
                  markLayoutEffectsStopped,
                  markPassiveEffectsStarted,
                  markPassiveEffectsStopped,
                  markRenderStarted,
                  markRenderYielded,
                  markRenderStopped,
                  markRenderScheduled,
                  markForceUpdateScheduled,
                  markStateUpdateScheduled
                },
                toggleProfilingStatus
              };
            }
            __name(createProfilingHooks, "createProfilingHooks");
            ;
            function _objectWithoutProperties(source, excluded) {
              if (source == null) return {};
              var target = _objectWithoutPropertiesLoose(source, excluded);
              var key, i;
              if (Object.getOwnPropertySymbols) {
                var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
                for (i = 0; i < sourceSymbolKeys.length; i++) {
                  key = sourceSymbolKeys[i];
                  if (excluded.indexOf(key) >= 0) continue;
                  if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
                  target[key] = source[key];
                }
              }
              return target;
            }
            __name(_objectWithoutProperties, "_objectWithoutProperties");
            function _objectWithoutPropertiesLoose(source, excluded) {
              if (source == null) return {};
              var target = {};
              var sourceKeys = Object.keys(source);
              var key, i;
              for (i = 0; i < sourceKeys.length; i++) {
                key = sourceKeys[i];
                if (excluded.indexOf(key) >= 0) continue;
                target[key] = source[key];
              }
              return target;
            }
            __name(_objectWithoutPropertiesLoose, "_objectWithoutPropertiesLoose");
            function renderer_ownKeys(object, enumerableOnly) {
              var keys = Object.keys(object);
              if (Object.getOwnPropertySymbols) {
                var symbols = Object.getOwnPropertySymbols(object);
                if (enumerableOnly) symbols = symbols.filter(function(sym) {
                  return Object.getOwnPropertyDescriptor(object, sym).enumerable;
                });
                keys.push.apply(keys, symbols);
              }
              return keys;
            }
            __name(renderer_ownKeys, "renderer_ownKeys");
            function renderer_objectSpread(target) {
              for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i] != null ? arguments[i] : {};
                if (i % 2) {
                  renderer_ownKeys(Object(source), true).forEach(function(key) {
                    renderer_defineProperty(target, key, source[key]);
                  });
                } else if (Object.getOwnPropertyDescriptors) {
                  Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
                } else {
                  renderer_ownKeys(Object(source)).forEach(function(key) {
                    Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
                  });
                }
              }
              return target;
            }
            __name(renderer_objectSpread, "renderer_objectSpread");
            function renderer_defineProperty(obj, key, value) {
              if (key in obj) {
                Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
              } else {
                obj[key] = value;
              }
              return obj;
            }
            __name(renderer_defineProperty, "renderer_defineProperty");
            function renderer_slicedToArray(arr, i) {
              return renderer_arrayWithHoles(arr) || renderer_iterableToArrayLimit(arr, i) || renderer_unsupportedIterableToArray(arr, i) || renderer_nonIterableRest();
            }
            __name(renderer_slicedToArray, "renderer_slicedToArray");
            function renderer_nonIterableRest() {
              throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
            }
            __name(renderer_nonIterableRest, "renderer_nonIterableRest");
            function renderer_iterableToArrayLimit(arr, i) {
              if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
              var _arr = [];
              var _n = true;
              var _d = false;
              var _e = void 0;
              try {
                for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                  _arr.push(_s.value);
                  if (i && _arr.length === i) break;
                }
              } catch (err) {
                _d = true;
                _e = err;
              } finally {
                try {
                  if (!_n && _i["return"] != null) _i["return"]();
                } finally {
                  if (_d) throw _e;
                }
              }
              return _arr;
            }
            __name(renderer_iterableToArrayLimit, "renderer_iterableToArrayLimit");
            function renderer_arrayWithHoles(arr) {
              if (Array.isArray(arr)) return arr;
            }
            __name(renderer_arrayWithHoles, "renderer_arrayWithHoles");
            function renderer_toConsumableArray(arr) {
              return renderer_arrayWithoutHoles(arr) || renderer_iterableToArray(arr) || renderer_unsupportedIterableToArray(arr) || renderer_nonIterableSpread();
            }
            __name(renderer_toConsumableArray, "renderer_toConsumableArray");
            function renderer_nonIterableSpread() {
              throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
            }
            __name(renderer_nonIterableSpread, "renderer_nonIterableSpread");
            function renderer_iterableToArray(iter) {
              if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
            }
            __name(renderer_iterableToArray, "renderer_iterableToArray");
            function renderer_arrayWithoutHoles(arr) {
              if (Array.isArray(arr)) return renderer_arrayLikeToArray(arr);
            }
            __name(renderer_arrayWithoutHoles, "renderer_arrayWithoutHoles");
            function _createForOfIteratorHelper(o, allowArrayLike) {
              var it;
              if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
                if (Array.isArray(o) || (it = renderer_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
                  if (it) o = it;
                  var i = 0;
                  var F = /* @__PURE__ */ __name(function F2() {
                  }, "F");
                  return { s: F, n: /* @__PURE__ */ __name(function n() {
                    if (i >= o.length) return { done: true };
                    return { done: false, value: o[i++] };
                  }, "n"), e: /* @__PURE__ */ __name(function e(_e2) {
                    throw _e2;
                  }, "e"), f: F };
                }
                throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
              }
              var normalCompletion = true, didErr = false, err;
              return { s: /* @__PURE__ */ __name(function s() {
                it = o[Symbol.iterator]();
              }, "s"), n: /* @__PURE__ */ __name(function n() {
                var step = it.next();
                normalCompletion = step.done;
                return step;
              }, "n"), e: /* @__PURE__ */ __name(function e(_e3) {
                didErr = true;
                err = _e3;
              }, "e"), f: /* @__PURE__ */ __name(function f() {
                try {
                  if (!normalCompletion && it.return != null) it.return();
                } finally {
                  if (didErr) throw err;
                }
              }, "f") };
            }
            __name(_createForOfIteratorHelper, "_createForOfIteratorHelper");
            function renderer_unsupportedIterableToArray(o, minLen) {
              if (!o) return;
              if (typeof o === "string") return renderer_arrayLikeToArray(o, minLen);
              var n = Object.prototype.toString.call(o).slice(8, -1);
              if (n === "Object" && o.constructor) n = o.constructor.name;
              if (n === "Map" || n === "Set") return Array.from(o);
              if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return renderer_arrayLikeToArray(o, minLen);
            }
            __name(renderer_unsupportedIterableToArray, "renderer_unsupportedIterableToArray");
            function renderer_arrayLikeToArray(arr, len) {
              if (len == null || len > arr.length) len = arr.length;
              for (var i = 0, arr2 = new Array(len); i < len; i++) {
                arr2[i] = arr[i];
              }
              return arr2;
            }
            __name(renderer_arrayLikeToArray, "renderer_arrayLikeToArray");
            function renderer_typeof(obj) {
              "@babel/helpers - typeof";
              if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                renderer_typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                  return typeof obj2;
                }, "_typeof");
              } else {
                renderer_typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                  return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                }, "_typeof");
              }
              return renderer_typeof(obj);
            }
            __name(renderer_typeof, "renderer_typeof");
            function getFiberFlags(fiber) {
              return fiber.flags !== void 0 ? fiber.flags : fiber.effectTag;
            }
            __name(getFiberFlags, "getFiberFlags");
            var renderer_getCurrentTime = (
              // $FlowFixMe[method-unbinding]
              (typeof performance === "undefined" ? "undefined" : renderer_typeof(performance)) === "object" && typeof performance.now === "function" ? function() {
                return performance.now();
              } : function() {
                return Date.now();
              }
            );
            function getInternalReactConstants(version) {
              var ReactPriorityLevels = {
                ImmediatePriority: 99,
                UserBlockingPriority: 98,
                NormalPriority: 97,
                LowPriority: 96,
                IdlePriority: 95,
                NoPriority: 90
              };
              if (gt(version, "17.0.2")) {
                ReactPriorityLevels = {
                  ImmediatePriority: 1,
                  UserBlockingPriority: 2,
                  NormalPriority: 3,
                  LowPriority: 4,
                  IdlePriority: 5,
                  NoPriority: 0
                };
              }
              var StrictModeBits = 0;
              if (gte(version, "18.0.0-alpha")) {
                StrictModeBits = 24;
              } else if (gte(version, "16.9.0")) {
                StrictModeBits = 1;
              } else if (gte(version, "16.3.0")) {
                StrictModeBits = 2;
              }
              var ReactTypeOfWork = null;
              if (gt(version, "17.0.1")) {
                ReactTypeOfWork = {
                  CacheComponent: 24,
                  // Experimental
                  ClassComponent: 1,
                  ContextConsumer: 9,
                  ContextProvider: 10,
                  CoroutineComponent: -1,
                  // Removed
                  CoroutineHandlerPhase: -1,
                  // Removed
                  DehydratedSuspenseComponent: 18,
                  // Behind a flag
                  ForwardRef: 11,
                  Fragment: 7,
                  FunctionComponent: 0,
                  HostComponent: 5,
                  HostPortal: 4,
                  HostRoot: 3,
                  HostHoistable: 26,
                  // In reality, 18.2+. But doesn't hurt to include it here
                  HostSingleton: 27,
                  // Same as above
                  HostText: 6,
                  IncompleteClassComponent: 17,
                  IndeterminateComponent: 2,
                  LazyComponent: 16,
                  LegacyHiddenComponent: 23,
                  MemoComponent: 14,
                  Mode: 8,
                  OffscreenComponent: 22,
                  // Experimental
                  Profiler: 12,
                  ScopeComponent: 21,
                  // Experimental
                  SimpleMemoComponent: 15,
                  SuspenseComponent: 13,
                  SuspenseListComponent: 19,
                  // Experimental
                  TracingMarkerComponent: 25,
                  // Experimental - This is technically in 18 but we don't
                  // want to fork again so we're adding it here instead
                  YieldComponent: -1
                  // Removed
                };
              } else if (gte(version, "17.0.0-alpha")) {
                ReactTypeOfWork = {
                  CacheComponent: -1,
                  // Doesn't exist yet
                  ClassComponent: 1,
                  ContextConsumer: 9,
                  ContextProvider: 10,
                  CoroutineComponent: -1,
                  // Removed
                  CoroutineHandlerPhase: -1,
                  // Removed
                  DehydratedSuspenseComponent: 18,
                  // Behind a flag
                  ForwardRef: 11,
                  Fragment: 7,
                  FunctionComponent: 0,
                  HostComponent: 5,
                  HostPortal: 4,
                  HostRoot: 3,
                  HostHoistable: -1,
                  // Doesn't exist yet
                  HostSingleton: -1,
                  // Doesn't exist yet
                  HostText: 6,
                  IncompleteClassComponent: 17,
                  IndeterminateComponent: 2,
                  LazyComponent: 16,
                  LegacyHiddenComponent: 24,
                  MemoComponent: 14,
                  Mode: 8,
                  OffscreenComponent: 23,
                  // Experimental
                  Profiler: 12,
                  ScopeComponent: 21,
                  // Experimental
                  SimpleMemoComponent: 15,
                  SuspenseComponent: 13,
                  SuspenseListComponent: 19,
                  // Experimental
                  TracingMarkerComponent: -1,
                  // Doesn't exist yet
                  YieldComponent: -1
                  // Removed
                };
              } else if (gte(version, "16.6.0-beta.0")) {
                ReactTypeOfWork = {
                  CacheComponent: -1,
                  // Doesn't exist yet
                  ClassComponent: 1,
                  ContextConsumer: 9,
                  ContextProvider: 10,
                  CoroutineComponent: -1,
                  // Removed
                  CoroutineHandlerPhase: -1,
                  // Removed
                  DehydratedSuspenseComponent: 18,
                  // Behind a flag
                  ForwardRef: 11,
                  Fragment: 7,
                  FunctionComponent: 0,
                  HostComponent: 5,
                  HostPortal: 4,
                  HostRoot: 3,
                  HostHoistable: -1,
                  // Doesn't exist yet
                  HostSingleton: -1,
                  // Doesn't exist yet
                  HostText: 6,
                  IncompleteClassComponent: 17,
                  IndeterminateComponent: 2,
                  LazyComponent: 16,
                  LegacyHiddenComponent: -1,
                  MemoComponent: 14,
                  Mode: 8,
                  OffscreenComponent: -1,
                  // Experimental
                  Profiler: 12,
                  ScopeComponent: -1,
                  // Experimental
                  SimpleMemoComponent: 15,
                  SuspenseComponent: 13,
                  SuspenseListComponent: 19,
                  // Experimental
                  TracingMarkerComponent: -1,
                  // Doesn't exist yet
                  YieldComponent: -1
                  // Removed
                };
              } else if (gte(version, "16.4.3-alpha")) {
                ReactTypeOfWork = {
                  CacheComponent: -1,
                  // Doesn't exist yet
                  ClassComponent: 2,
                  ContextConsumer: 11,
                  ContextProvider: 12,
                  CoroutineComponent: -1,
                  // Removed
                  CoroutineHandlerPhase: -1,
                  // Removed
                  DehydratedSuspenseComponent: -1,
                  // Doesn't exist yet
                  ForwardRef: 13,
                  Fragment: 9,
                  FunctionComponent: 0,
                  HostComponent: 7,
                  HostPortal: 6,
                  HostRoot: 5,
                  HostHoistable: -1,
                  // Doesn't exist yet
                  HostSingleton: -1,
                  // Doesn't exist yet
                  HostText: 8,
                  IncompleteClassComponent: -1,
                  // Doesn't exist yet
                  IndeterminateComponent: 4,
                  LazyComponent: -1,
                  // Doesn't exist yet
                  LegacyHiddenComponent: -1,
                  MemoComponent: -1,
                  // Doesn't exist yet
                  Mode: 10,
                  OffscreenComponent: -1,
                  // Experimental
                  Profiler: 15,
                  ScopeComponent: -1,
                  // Experimental
                  SimpleMemoComponent: -1,
                  // Doesn't exist yet
                  SuspenseComponent: 16,
                  SuspenseListComponent: -1,
                  // Doesn't exist yet
                  TracingMarkerComponent: -1,
                  // Doesn't exist yet
                  YieldComponent: -1
                  // Removed
                };
              } else {
                ReactTypeOfWork = {
                  CacheComponent: -1,
                  // Doesn't exist yet
                  ClassComponent: 2,
                  ContextConsumer: 12,
                  ContextProvider: 13,
                  CoroutineComponent: 7,
                  CoroutineHandlerPhase: 8,
                  DehydratedSuspenseComponent: -1,
                  // Doesn't exist yet
                  ForwardRef: 14,
                  Fragment: 10,
                  FunctionComponent: 1,
                  HostComponent: 5,
                  HostPortal: 4,
                  HostRoot: 3,
                  HostHoistable: -1,
                  // Doesn't exist yet
                  HostSingleton: -1,
                  // Doesn't exist yet
                  HostText: 6,
                  IncompleteClassComponent: -1,
                  // Doesn't exist yet
                  IndeterminateComponent: 0,
                  LazyComponent: -1,
                  // Doesn't exist yet
                  LegacyHiddenComponent: -1,
                  MemoComponent: -1,
                  // Doesn't exist yet
                  Mode: 11,
                  OffscreenComponent: -1,
                  // Experimental
                  Profiler: 15,
                  ScopeComponent: -1,
                  // Experimental
                  SimpleMemoComponent: -1,
                  // Doesn't exist yet
                  SuspenseComponent: 16,
                  SuspenseListComponent: -1,
                  // Doesn't exist yet
                  TracingMarkerComponent: -1,
                  // Doesn't exist yet
                  YieldComponent: 9
                };
              }
              function getTypeSymbol(type) {
                var symbolOrNumber = renderer_typeof(type) === "object" && type !== null ? type.$$typeof : type;
                return renderer_typeof(symbolOrNumber) === "symbol" ? (
                  // $FlowFixMe[incompatible-return] `toString()` doesn't match the type signature?
                  symbolOrNumber.toString()
                ) : symbolOrNumber;
              }
              __name(getTypeSymbol, "getTypeSymbol");
              var _ReactTypeOfWork = ReactTypeOfWork, CacheComponent = _ReactTypeOfWork.CacheComponent, ClassComponent = _ReactTypeOfWork.ClassComponent, IncompleteClassComponent = _ReactTypeOfWork.IncompleteClassComponent, FunctionComponent = _ReactTypeOfWork.FunctionComponent, IndeterminateComponent = _ReactTypeOfWork.IndeterminateComponent, ForwardRef = _ReactTypeOfWork.ForwardRef, HostRoot = _ReactTypeOfWork.HostRoot, HostHoistable = _ReactTypeOfWork.HostHoistable, HostSingleton = _ReactTypeOfWork.HostSingleton, HostComponent = _ReactTypeOfWork.HostComponent, HostPortal = _ReactTypeOfWork.HostPortal, HostText = _ReactTypeOfWork.HostText, Fragment = _ReactTypeOfWork.Fragment, LazyComponent = _ReactTypeOfWork.LazyComponent, LegacyHiddenComponent = _ReactTypeOfWork.LegacyHiddenComponent, MemoComponent = _ReactTypeOfWork.MemoComponent, OffscreenComponent = _ReactTypeOfWork.OffscreenComponent, Profiler = _ReactTypeOfWork.Profiler, ScopeComponent = _ReactTypeOfWork.ScopeComponent, SimpleMemoComponent = _ReactTypeOfWork.SimpleMemoComponent, SuspenseComponent = _ReactTypeOfWork.SuspenseComponent, SuspenseListComponent = _ReactTypeOfWork.SuspenseListComponent, TracingMarkerComponent = _ReactTypeOfWork.TracingMarkerComponent;
              function resolveFiberType(type) {
                var typeSymbol = getTypeSymbol(type);
                switch (typeSymbol) {
                  case ReactSymbols_MEMO_NUMBER:
                  case ReactSymbols_MEMO_SYMBOL_STRING:
                    return resolveFiberType(type.type);
                  case ReactSymbols_FORWARD_REF_NUMBER:
                  case ReactSymbols_FORWARD_REF_SYMBOL_STRING:
                    return type.render;
                  default:
                    return type;
                }
              }
              __name(resolveFiberType, "resolveFiberType");
              function getDisplayNameForFiber(fiber) {
                var elementType = fiber.elementType, type = fiber.type, tag = fiber.tag;
                var resolvedType = type;
                if (renderer_typeof(type) === "object" && type !== null) {
                  resolvedType = resolveFiberType(type);
                }
                var resolvedContext = null;
                switch (tag) {
                  case CacheComponent:
                    return "Cache";
                  case ClassComponent:
                  case IncompleteClassComponent:
                    return getDisplayName(resolvedType);
                  case FunctionComponent:
                  case IndeterminateComponent:
                    return getDisplayName(resolvedType);
                  case ForwardRef:
                    return getWrappedDisplayName(elementType, resolvedType, "ForwardRef", "Anonymous");
                  case HostRoot:
                    var fiberRoot = fiber.stateNode;
                    if (fiberRoot != null && fiberRoot._debugRootType !== null) {
                      return fiberRoot._debugRootType;
                    }
                    return null;
                  case HostComponent:
                  case HostSingleton:
                  case HostHoistable:
                    return type;
                  case HostPortal:
                  case HostText:
                    return null;
                  case Fragment:
                    return "Fragment";
                  case LazyComponent:
                    return "Lazy";
                  case MemoComponent:
                  case SimpleMemoComponent:
                    return getWrappedDisplayName(elementType, resolvedType, "Memo", "Anonymous");
                  case SuspenseComponent:
                    return "Suspense";
                  case LegacyHiddenComponent:
                    return "LegacyHidden";
                  case OffscreenComponent:
                    return "Offscreen";
                  case ScopeComponent:
                    return "Scope";
                  case SuspenseListComponent:
                    return "SuspenseList";
                  case Profiler:
                    return "Profiler";
                  case TracingMarkerComponent:
                    return "TracingMarker";
                  default:
                    var typeSymbol = getTypeSymbol(type);
                    switch (typeSymbol) {
                      case CONCURRENT_MODE_NUMBER:
                      case CONCURRENT_MODE_SYMBOL_STRING:
                      case DEPRECATED_ASYNC_MODE_SYMBOL_STRING:
                        return null;
                      case PROVIDER_NUMBER:
                      case PROVIDER_SYMBOL_STRING:
                        resolvedContext = fiber.type._context || fiber.type.context;
                        return "".concat(resolvedContext.displayName || "Context", ".Provider");
                      case CONTEXT_NUMBER:
                      case CONTEXT_SYMBOL_STRING:
                      case SERVER_CONTEXT_SYMBOL_STRING:
                        resolvedContext = fiber.type._context || fiber.type;
                        return "".concat(resolvedContext.displayName || "Context", ".Consumer");
                      case STRICT_MODE_NUMBER:
                      case STRICT_MODE_SYMBOL_STRING:
                        return null;
                      case PROFILER_NUMBER:
                      case PROFILER_SYMBOL_STRING:
                        return "Profiler(".concat(fiber.memoizedProps.id, ")");
                      case SCOPE_NUMBER:
                      case SCOPE_SYMBOL_STRING:
                        return "Scope";
                      default:
                        return null;
                    }
                }
              }
              __name(getDisplayNameForFiber, "getDisplayNameForFiber");
              return {
                getDisplayNameForFiber,
                getTypeSymbol,
                ReactPriorityLevels,
                ReactTypeOfWork,
                StrictModeBits
              };
            }
            __name(getInternalReactConstants, "getInternalReactConstants");
            var fiberToIDMap = /* @__PURE__ */ new Map();
            var idToArbitraryFiberMap = /* @__PURE__ */ new Map();
            function attach(hook2, rendererID, renderer, global2) {
              var version = renderer.reconcilerVersion || renderer.version;
              var _getInternalReactCons = getInternalReactConstants(version), getDisplayNameForFiber = _getInternalReactCons.getDisplayNameForFiber, getTypeSymbol = _getInternalReactCons.getTypeSymbol, ReactPriorityLevels = _getInternalReactCons.ReactPriorityLevels, ReactTypeOfWork = _getInternalReactCons.ReactTypeOfWork, StrictModeBits = _getInternalReactCons.StrictModeBits;
              var CacheComponent = ReactTypeOfWork.CacheComponent, ClassComponent = ReactTypeOfWork.ClassComponent, ContextConsumer = ReactTypeOfWork.ContextConsumer, DehydratedSuspenseComponent = ReactTypeOfWork.DehydratedSuspenseComponent, ForwardRef = ReactTypeOfWork.ForwardRef, Fragment = ReactTypeOfWork.Fragment, FunctionComponent = ReactTypeOfWork.FunctionComponent, HostRoot = ReactTypeOfWork.HostRoot, HostHoistable = ReactTypeOfWork.HostHoistable, HostSingleton = ReactTypeOfWork.HostSingleton, HostPortal = ReactTypeOfWork.HostPortal, HostComponent = ReactTypeOfWork.HostComponent, HostText = ReactTypeOfWork.HostText, IncompleteClassComponent = ReactTypeOfWork.IncompleteClassComponent, IndeterminateComponent = ReactTypeOfWork.IndeterminateComponent, LegacyHiddenComponent = ReactTypeOfWork.LegacyHiddenComponent, MemoComponent = ReactTypeOfWork.MemoComponent, OffscreenComponent = ReactTypeOfWork.OffscreenComponent, SimpleMemoComponent = ReactTypeOfWork.SimpleMemoComponent, SuspenseComponent = ReactTypeOfWork.SuspenseComponent, SuspenseListComponent = ReactTypeOfWork.SuspenseListComponent, TracingMarkerComponent = ReactTypeOfWork.TracingMarkerComponent;
              var ImmediatePriority = ReactPriorityLevels.ImmediatePriority, UserBlockingPriority = ReactPriorityLevels.UserBlockingPriority, NormalPriority = ReactPriorityLevels.NormalPriority, LowPriority = ReactPriorityLevels.LowPriority, IdlePriority = ReactPriorityLevels.IdlePriority, NoPriority = ReactPriorityLevels.NoPriority;
              var getLaneLabelMap = renderer.getLaneLabelMap, injectProfilingHooks = renderer.injectProfilingHooks, overrideHookState = renderer.overrideHookState, overrideHookStateDeletePath = renderer.overrideHookStateDeletePath, overrideHookStateRenamePath = renderer.overrideHookStateRenamePath, overrideProps = renderer.overrideProps, overridePropsDeletePath = renderer.overridePropsDeletePath, overridePropsRenamePath = renderer.overridePropsRenamePath, scheduleRefresh = renderer.scheduleRefresh, setErrorHandler = renderer.setErrorHandler, setSuspenseHandler = renderer.setSuspenseHandler, scheduleUpdate = renderer.scheduleUpdate;
              var supportsTogglingError = typeof setErrorHandler === "function" && typeof scheduleUpdate === "function";
              var supportsTogglingSuspense = typeof setSuspenseHandler === "function" && typeof scheduleUpdate === "function";
              if (typeof scheduleRefresh === "function") {
                renderer.scheduleRefresh = function() {
                  try {
                    hook2.emit("fastRefreshScheduled");
                  } finally {
                    return scheduleRefresh.apply(void 0, arguments);
                  }
                };
              }
              var getTimelineData = null;
              var toggleProfilingStatus = null;
              if (typeof injectProfilingHooks === "function") {
                var response = createProfilingHooks({
                  getDisplayNameForFiber,
                  getIsProfiling: /* @__PURE__ */ __name(function getIsProfiling() {
                    return isProfiling;
                  }, "getIsProfiling"),
                  getLaneLabelMap,
                  currentDispatcherRef: renderer.currentDispatcherRef,
                  workTagMap: ReactTypeOfWork,
                  reactVersion: version
                });
                injectProfilingHooks(response.profilingHooks);
                getTimelineData = response.getTimelineData;
                toggleProfilingStatus = response.toggleProfilingStatus;
              }
              var fibersWithChangedErrorOrWarningCounts = /* @__PURE__ */ new Set();
              var pendingFiberToErrorsMap = /* @__PURE__ */ new Map();
              var pendingFiberToWarningsMap = /* @__PURE__ */ new Map();
              var fiberIDToErrorsMap = /* @__PURE__ */ new Map();
              var fiberIDToWarningsMap = /* @__PURE__ */ new Map();
              function clearErrorsAndWarnings() {
                var _iterator = _createForOfIteratorHelper(fiberIDToErrorsMap.keys()), _step;
                try {
                  for (_iterator.s(); !(_step = _iterator.n()).done; ) {
                    var id = _step.value;
                    var _fiber = idToArbitraryFiberMap.get(id);
                    if (_fiber != null) {
                      fibersWithChangedErrorOrWarningCounts.add(_fiber);
                      updateMostRecentlyInspectedElementIfNecessary(id);
                    }
                  }
                } catch (err) {
                  _iterator.e(err);
                } finally {
                  _iterator.f();
                }
                var _iterator2 = _createForOfIteratorHelper(fiberIDToWarningsMap.keys()), _step2;
                try {
                  for (_iterator2.s(); !(_step2 = _iterator2.n()).done; ) {
                    var _id = _step2.value;
                    var _fiber2 = idToArbitraryFiberMap.get(_id);
                    if (_fiber2 != null) {
                      fibersWithChangedErrorOrWarningCounts.add(_fiber2);
                      updateMostRecentlyInspectedElementIfNecessary(_id);
                    }
                  }
                } catch (err) {
                  _iterator2.e(err);
                } finally {
                  _iterator2.f();
                }
                fiberIDToErrorsMap.clear();
                fiberIDToWarningsMap.clear();
                flushPendingEvents();
              }
              __name(clearErrorsAndWarnings, "clearErrorsAndWarnings");
              function clearMessageCountHelper(fiberID, pendingFiberToMessageCountMap, fiberIDToMessageCountMap) {
                var fiber = idToArbitraryFiberMap.get(fiberID);
                if (fiber != null) {
                  pendingFiberToErrorsMap.delete(fiber);
                  if (fiberIDToMessageCountMap.has(fiberID)) {
                    fiberIDToMessageCountMap.delete(fiberID);
                    fibersWithChangedErrorOrWarningCounts.add(fiber);
                    flushPendingEvents();
                    updateMostRecentlyInspectedElementIfNecessary(fiberID);
                  } else {
                    fibersWithChangedErrorOrWarningCounts.delete(fiber);
                  }
                }
              }
              __name(clearMessageCountHelper, "clearMessageCountHelper");
              function clearErrorsForFiberID(fiberID) {
                clearMessageCountHelper(fiberID, pendingFiberToErrorsMap, fiberIDToErrorsMap);
              }
              __name(clearErrorsForFiberID, "clearErrorsForFiberID");
              function clearWarningsForFiberID(fiberID) {
                clearMessageCountHelper(fiberID, pendingFiberToWarningsMap, fiberIDToWarningsMap);
              }
              __name(clearWarningsForFiberID, "clearWarningsForFiberID");
              function updateMostRecentlyInspectedElementIfNecessary(fiberID) {
                if (mostRecentlyInspectedElement !== null && mostRecentlyInspectedElement.id === fiberID) {
                  hasElementUpdatedSinceLastInspected = true;
                }
              }
              __name(updateMostRecentlyInspectedElementIfNecessary, "updateMostRecentlyInspectedElementIfNecessary");
              function onErrorOrWarning(fiber, type, args) {
                if (type === "error") {
                  var maybeID = getFiberIDUnsafe(fiber);
                  if (maybeID != null && forceErrorForFiberIDs.get(maybeID) === true) {
                    return;
                  }
                }
                var message = format.apply(void 0, renderer_toConsumableArray(args));
                if (__DEBUG__) {
                  debug2("onErrorOrWarning", fiber, null, "".concat(type, ': "').concat(message, '"'));
                }
                fibersWithChangedErrorOrWarningCounts.add(fiber);
                var fiberMap = type === "error" ? pendingFiberToErrorsMap : pendingFiberToWarningsMap;
                var messageMap = fiberMap.get(fiber);
                if (messageMap != null) {
                  var count = messageMap.get(message) || 0;
                  messageMap.set(message, count + 1);
                } else {
                  fiberMap.set(fiber, /* @__PURE__ */ new Map([[message, 1]]));
                }
                flushPendingErrorsAndWarningsAfterDelay();
              }
              __name(onErrorOrWarning, "onErrorOrWarning");
              registerRenderer(renderer, onErrorOrWarning);
              patchConsoleUsingWindowValues();
              var debug2 = /* @__PURE__ */ __name(function debug3(name, fiber, parentFiber) {
                var extraString = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "";
                if (__DEBUG__) {
                  var displayName = fiber.tag + ":" + (getDisplayNameForFiber(fiber) || "null");
                  var maybeID = getFiberIDUnsafe(fiber) || "<no id>";
                  var parentDisplayName = parentFiber ? parentFiber.tag + ":" + (getDisplayNameForFiber(parentFiber) || "null") : "";
                  var maybeParentID = parentFiber ? getFiberIDUnsafe(parentFiber) || "<no-id>" : "";
                  console.groupCollapsed("[renderer] %c".concat(name, " %c").concat(displayName, " (").concat(maybeID, ") %c").concat(parentFiber ? "".concat(parentDisplayName, " (").concat(maybeParentID, ")") : "", " %c").concat(extraString), "color: red; font-weight: bold;", "color: blue;", "color: purple;", "color: black;");
                  console.log(new Error().stack.split("\n").slice(1).join("\n"));
                  console.groupEnd();
                }
              }, "debug");
              var hideElementsWithDisplayNames = /* @__PURE__ */ new Set();
              var hideElementsWithPaths = /* @__PURE__ */ new Set();
              var hideElementsWithTypes = /* @__PURE__ */ new Set();
              var traceUpdatesEnabled = false;
              var traceUpdatesForNodes = /* @__PURE__ */ new Set();
              function applyComponentFilters(componentFilters) {
                hideElementsWithTypes.clear();
                hideElementsWithDisplayNames.clear();
                hideElementsWithPaths.clear();
                componentFilters.forEach(function(componentFilter) {
                  if (!componentFilter.isEnabled) {
                    return;
                  }
                  switch (componentFilter.type) {
                    case ComponentFilterDisplayName:
                      if (componentFilter.isValid && componentFilter.value !== "") {
                        hideElementsWithDisplayNames.add(new RegExp(componentFilter.value, "i"));
                      }
                      break;
                    case ComponentFilterElementType:
                      hideElementsWithTypes.add(componentFilter.value);
                      break;
                    case ComponentFilterLocation:
                      if (componentFilter.isValid && componentFilter.value !== "") {
                        hideElementsWithPaths.add(new RegExp(componentFilter.value, "i"));
                      }
                      break;
                    case ComponentFilterHOC:
                      hideElementsWithDisplayNames.add(new RegExp("\\("));
                      break;
                    default:
                      console.warn('Invalid component filter type "'.concat(componentFilter.type, '"'));
                      break;
                  }
                });
              }
              __name(applyComponentFilters, "applyComponentFilters");
              if (window.__REACT_DEVTOOLS_COMPONENT_FILTERS__ != null) {
                applyComponentFilters(window.__REACT_DEVTOOLS_COMPONENT_FILTERS__);
              } else {
                applyComponentFilters(getDefaultComponentFilters());
              }
              function updateComponentFilters(componentFilters) {
                if (isProfiling) {
                  throw Error("Cannot modify filter preferences while profiling");
                }
                hook2.getFiberRoots(rendererID).forEach(function(root) {
                  currentRootID = getOrGenerateFiberID(root.current);
                  pushOperation(TREE_OPERATION_REMOVE_ROOT);
                  flushPendingEvents(root);
                  currentRootID = -1;
                });
                applyComponentFilters(componentFilters);
                rootDisplayNameCounter.clear();
                hook2.getFiberRoots(rendererID).forEach(function(root) {
                  currentRootID = getOrGenerateFiberID(root.current);
                  setRootPseudoKey(currentRootID, root.current);
                  mountFiberRecursively(root.current, null, false, false);
                  flushPendingEvents(root);
                  currentRootID = -1;
                });
                reevaluateErrorsAndWarnings();
                flushPendingEvents();
              }
              __name(updateComponentFilters, "updateComponentFilters");
              function shouldFilterFiber(fiber) {
                var _debugSource = fiber._debugSource, tag = fiber.tag, type = fiber.type, key = fiber.key;
                switch (tag) {
                  case DehydratedSuspenseComponent:
                    return true;
                  case HostPortal:
                  case HostText:
                  case LegacyHiddenComponent:
                  case OffscreenComponent:
                    return true;
                  case HostRoot:
                    return false;
                  case Fragment:
                    return key === null;
                  default:
                    var typeSymbol = getTypeSymbol(type);
                    switch (typeSymbol) {
                      case CONCURRENT_MODE_NUMBER:
                      case CONCURRENT_MODE_SYMBOL_STRING:
                      case DEPRECATED_ASYNC_MODE_SYMBOL_STRING:
                      case STRICT_MODE_NUMBER:
                      case STRICT_MODE_SYMBOL_STRING:
                        return true;
                      default:
                        break;
                    }
                }
                var elementType = getElementTypeForFiber(fiber);
                if (hideElementsWithTypes.has(elementType)) {
                  return true;
                }
                if (hideElementsWithDisplayNames.size > 0) {
                  var displayName = getDisplayNameForFiber(fiber);
                  if (displayName != null) {
                    var _iterator3 = _createForOfIteratorHelper(hideElementsWithDisplayNames), _step3;
                    try {
                      for (_iterator3.s(); !(_step3 = _iterator3.n()).done; ) {
                        var displayNameRegExp = _step3.value;
                        if (displayNameRegExp.test(displayName)) {
                          return true;
                        }
                      }
                    } catch (err) {
                      _iterator3.e(err);
                    } finally {
                      _iterator3.f();
                    }
                  }
                }
                if (_debugSource != null && hideElementsWithPaths.size > 0) {
                  var fileName = _debugSource.fileName;
                  var _iterator4 = _createForOfIteratorHelper(hideElementsWithPaths), _step4;
                  try {
                    for (_iterator4.s(); !(_step4 = _iterator4.n()).done; ) {
                      var pathRegExp = _step4.value;
                      if (pathRegExp.test(fileName)) {
                        return true;
                      }
                    }
                  } catch (err) {
                    _iterator4.e(err);
                  } finally {
                    _iterator4.f();
                  }
                }
                return false;
              }
              __name(shouldFilterFiber, "shouldFilterFiber");
              function getElementTypeForFiber(fiber) {
                var type = fiber.type, tag = fiber.tag;
                switch (tag) {
                  case ClassComponent:
                  case IncompleteClassComponent:
                    return types_ElementTypeClass;
                  case FunctionComponent:
                  case IndeterminateComponent:
                    return types_ElementTypeFunction;
                  case ForwardRef:
                    return types_ElementTypeForwardRef;
                  case HostRoot:
                    return ElementTypeRoot;
                  case HostComponent:
                  case HostHoistable:
                  case HostSingleton:
                    return ElementTypeHostComponent;
                  case HostPortal:
                  case HostText:
                  case Fragment:
                    return ElementTypeOtherOrUnknown;
                  case MemoComponent:
                  case SimpleMemoComponent:
                    return types_ElementTypeMemo;
                  case SuspenseComponent:
                    return ElementTypeSuspense;
                  case SuspenseListComponent:
                    return ElementTypeSuspenseList;
                  case TracingMarkerComponent:
                    return ElementTypeTracingMarker;
                  default:
                    var typeSymbol = getTypeSymbol(type);
                    switch (typeSymbol) {
                      case CONCURRENT_MODE_NUMBER:
                      case CONCURRENT_MODE_SYMBOL_STRING:
                      case DEPRECATED_ASYNC_MODE_SYMBOL_STRING:
                        return ElementTypeOtherOrUnknown;
                      case PROVIDER_NUMBER:
                      case PROVIDER_SYMBOL_STRING:
                        return ElementTypeContext;
                      case CONTEXT_NUMBER:
                      case CONTEXT_SYMBOL_STRING:
                        return ElementTypeContext;
                      case STRICT_MODE_NUMBER:
                      case STRICT_MODE_SYMBOL_STRING:
                        return ElementTypeOtherOrUnknown;
                      case PROFILER_NUMBER:
                      case PROFILER_SYMBOL_STRING:
                        return ElementTypeProfiler;
                      default:
                        return ElementTypeOtherOrUnknown;
                    }
                }
              }
              __name(getElementTypeForFiber, "getElementTypeForFiber");
              var idToTreeBaseDurationMap = /* @__PURE__ */ new Map();
              var idToRootMap = /* @__PURE__ */ new Map();
              var currentRootID = -1;
              function getOrGenerateFiberID(fiber) {
                var id = null;
                if (fiberToIDMap.has(fiber)) {
                  id = fiberToIDMap.get(fiber);
                } else {
                  var _alternate = fiber.alternate;
                  if (_alternate !== null && fiberToIDMap.has(_alternate)) {
                    id = fiberToIDMap.get(_alternate);
                  }
                }
                var didGenerateID = false;
                if (id === null) {
                  didGenerateID = true;
                  id = getUID();
                }
                var refinedID = id;
                if (!fiberToIDMap.has(fiber)) {
                  fiberToIDMap.set(fiber, refinedID);
                  idToArbitraryFiberMap.set(refinedID, fiber);
                }
                var alternate = fiber.alternate;
                if (alternate !== null) {
                  if (!fiberToIDMap.has(alternate)) {
                    fiberToIDMap.set(alternate, refinedID);
                  }
                }
                if (__DEBUG__) {
                  if (didGenerateID) {
                    debug2("getOrGenerateFiberID()", fiber, fiber.return, "Generated a new UID");
                  }
                }
                return refinedID;
              }
              __name(getOrGenerateFiberID, "getOrGenerateFiberID");
              function getFiberIDThrows(fiber) {
                var maybeID = getFiberIDUnsafe(fiber);
                if (maybeID !== null) {
                  return maybeID;
                }
                throw Error('Could not find ID for Fiber "'.concat(getDisplayNameForFiber(fiber) || "", '"'));
              }
              __name(getFiberIDThrows, "getFiberIDThrows");
              function getFiberIDUnsafe(fiber) {
                if (fiberToIDMap.has(fiber)) {
                  return fiberToIDMap.get(fiber);
                } else {
                  var alternate = fiber.alternate;
                  if (alternate !== null && fiberToIDMap.has(alternate)) {
                    return fiberToIDMap.get(alternate);
                  }
                }
                return null;
              }
              __name(getFiberIDUnsafe, "getFiberIDUnsafe");
              function untrackFiberID(fiber) {
                if (__DEBUG__) {
                  debug2("untrackFiberID()", fiber, fiber.return, "schedule after delay");
                }
                untrackFibersSet.add(fiber);
                var alternate = fiber.alternate;
                if (alternate !== null) {
                  untrackFibersSet.add(alternate);
                }
                if (untrackFibersTimeoutID === null) {
                  untrackFibersTimeoutID = setTimeout(untrackFibers, 1e3);
                }
              }
              __name(untrackFiberID, "untrackFiberID");
              var untrackFibersSet = /* @__PURE__ */ new Set();
              var untrackFibersTimeoutID = null;
              function untrackFibers() {
                if (untrackFibersTimeoutID !== null) {
                  clearTimeout(untrackFibersTimeoutID);
                  untrackFibersTimeoutID = null;
                }
                untrackFibersSet.forEach(function(fiber) {
                  var fiberID = getFiberIDUnsafe(fiber);
                  if (fiberID !== null) {
                    idToArbitraryFiberMap.delete(fiberID);
                    clearErrorsForFiberID(fiberID);
                    clearWarningsForFiberID(fiberID);
                  }
                  fiberToIDMap.delete(fiber);
                  var alternate = fiber.alternate;
                  if (alternate !== null) {
                    fiberToIDMap.delete(alternate);
                  }
                  if (forceErrorForFiberIDs.has(fiberID)) {
                    forceErrorForFiberIDs.delete(fiberID);
                    if (forceErrorForFiberIDs.size === 0 && setErrorHandler != null) {
                      setErrorHandler(shouldErrorFiberAlwaysNull);
                    }
                  }
                });
                untrackFibersSet.clear();
              }
              __name(untrackFibers, "untrackFibers");
              function getChangeDescription(prevFiber, nextFiber) {
                switch (getElementTypeForFiber(nextFiber)) {
                  case types_ElementTypeClass:
                  case types_ElementTypeFunction:
                  case types_ElementTypeMemo:
                  case types_ElementTypeForwardRef:
                    if (prevFiber === null) {
                      return {
                        context: null,
                        didHooksChange: false,
                        isFirstMount: true,
                        props: null,
                        state: null
                      };
                    } else {
                      var data = {
                        context: getContextChangedKeys(nextFiber),
                        didHooksChange: false,
                        isFirstMount: false,
                        props: getChangedKeys(prevFiber.memoizedProps, nextFiber.memoizedProps),
                        state: getChangedKeys(prevFiber.memoizedState, nextFiber.memoizedState)
                      };
                      var indices = getChangedHooksIndices(prevFiber.memoizedState, nextFiber.memoizedState);
                      data.hooks = indices;
                      data.didHooksChange = indices !== null && indices.length > 0;
                      return data;
                    }
                  default:
                    return null;
                }
              }
              __name(getChangeDescription, "getChangeDescription");
              function updateContextsForFiber(fiber) {
                switch (getElementTypeForFiber(fiber)) {
                  case types_ElementTypeClass:
                  case types_ElementTypeForwardRef:
                  case types_ElementTypeFunction:
                  case types_ElementTypeMemo:
                    if (idToContextsMap !== null) {
                      var id = getFiberIDThrows(fiber);
                      var contexts = getContextsForFiber(fiber);
                      if (contexts !== null) {
                        idToContextsMap.set(id, contexts);
                      }
                    }
                    break;
                  default:
                    break;
                }
              }
              __name(updateContextsForFiber, "updateContextsForFiber");
              var NO_CONTEXT = {};
              function getContextsForFiber(fiber) {
                var legacyContext = NO_CONTEXT;
                var modernContext = NO_CONTEXT;
                switch (getElementTypeForFiber(fiber)) {
                  case types_ElementTypeClass:
                    var instance = fiber.stateNode;
                    if (instance != null) {
                      if (instance.constructor && instance.constructor.contextType != null) {
                        modernContext = instance.context;
                      } else {
                        legacyContext = instance.context;
                        if (legacyContext && Object.keys(legacyContext).length === 0) {
                          legacyContext = NO_CONTEXT;
                        }
                      }
                    }
                    return [legacyContext, modernContext];
                  case types_ElementTypeForwardRef:
                  case types_ElementTypeFunction:
                  case types_ElementTypeMemo:
                    var dependencies = fiber.dependencies;
                    if (dependencies && dependencies.firstContext) {
                      modernContext = dependencies.firstContext;
                    }
                    return [legacyContext, modernContext];
                  default:
                    return null;
                }
              }
              __name(getContextsForFiber, "getContextsForFiber");
              function crawlToInitializeContextsMap(fiber) {
                var id = getFiberIDUnsafe(fiber);
                if (id !== null) {
                  updateContextsForFiber(fiber);
                  var current = fiber.child;
                  while (current !== null) {
                    crawlToInitializeContextsMap(current);
                    current = current.sibling;
                  }
                }
              }
              __name(crawlToInitializeContextsMap, "crawlToInitializeContextsMap");
              function getContextChangedKeys(fiber) {
                if (idToContextsMap !== null) {
                  var id = getFiberIDThrows(fiber);
                  var prevContexts = idToContextsMap.has(id) ? (
                    // $FlowFixMe[incompatible-use] found when upgrading Flow
                    idToContextsMap.get(id)
                  ) : null;
                  var nextContexts = getContextsForFiber(fiber);
                  if (prevContexts == null || nextContexts == null) {
                    return null;
                  }
                  var _prevContexts = renderer_slicedToArray(prevContexts, 2), prevLegacyContext = _prevContexts[0], prevModernContext = _prevContexts[1];
                  var _nextContexts = renderer_slicedToArray(nextContexts, 2), nextLegacyContext = _nextContexts[0], nextModernContext = _nextContexts[1];
                  switch (getElementTypeForFiber(fiber)) {
                    case types_ElementTypeClass:
                      if (prevContexts && nextContexts) {
                        if (nextLegacyContext !== NO_CONTEXT) {
                          return getChangedKeys(prevLegacyContext, nextLegacyContext);
                        } else if (nextModernContext !== NO_CONTEXT) {
                          return prevModernContext !== nextModernContext;
                        }
                      }
                      break;
                    case types_ElementTypeForwardRef:
                    case types_ElementTypeFunction:
                    case types_ElementTypeMemo:
                      if (nextModernContext !== NO_CONTEXT) {
                        var prevContext = prevModernContext;
                        var nextContext = nextModernContext;
                        while (prevContext && nextContext) {
                          if (!shared_objectIs(prevContext.memoizedValue, nextContext.memoizedValue)) {
                            return true;
                          }
                          prevContext = prevContext.next;
                          nextContext = nextContext.next;
                        }
                        return false;
                      }
                      break;
                    default:
                      break;
                  }
                }
                return null;
              }
              __name(getContextChangedKeys, "getContextChangedKeys");
              function isHookThatCanScheduleUpdate(hookObject) {
                var queue = hookObject.queue;
                if (!queue) {
                  return false;
                }
                var boundHasOwnProperty = shared_hasOwnProperty.bind(queue);
                if (boundHasOwnProperty("pending")) {
                  return true;
                }
                return boundHasOwnProperty("value") && boundHasOwnProperty("getSnapshot") && typeof queue.getSnapshot === "function";
              }
              __name(isHookThatCanScheduleUpdate, "isHookThatCanScheduleUpdate");
              function didStatefulHookChange(prev, next) {
                var prevMemoizedState = prev.memoizedState;
                var nextMemoizedState = next.memoizedState;
                if (isHookThatCanScheduleUpdate(prev)) {
                  return prevMemoizedState !== nextMemoizedState;
                }
                return false;
              }
              __name(didStatefulHookChange, "didStatefulHookChange");
              function getChangedHooksIndices(prev, next) {
                if (prev == null || next == null) {
                  return null;
                }
                var indices = [];
                var index = 0;
                if (next.hasOwnProperty("baseState") && next.hasOwnProperty("memoizedState") && next.hasOwnProperty("next") && next.hasOwnProperty("queue")) {
                  while (next !== null) {
                    if (didStatefulHookChange(prev, next)) {
                      indices.push(index);
                    }
                    next = next.next;
                    prev = prev.next;
                    index++;
                  }
                }
                return indices;
              }
              __name(getChangedHooksIndices, "getChangedHooksIndices");
              function getChangedKeys(prev, next) {
                if (prev == null || next == null) {
                  return null;
                }
                if (next.hasOwnProperty("baseState") && next.hasOwnProperty("memoizedState") && next.hasOwnProperty("next") && next.hasOwnProperty("queue")) {
                  return null;
                }
                var keys = new Set([].concat(renderer_toConsumableArray(Object.keys(prev)), renderer_toConsumableArray(Object.keys(next))));
                var changedKeys = [];
                var _iterator5 = _createForOfIteratorHelper(keys), _step5;
                try {
                  for (_iterator5.s(); !(_step5 = _iterator5.n()).done; ) {
                    var key = _step5.value;
                    if (prev[key] !== next[key]) {
                      changedKeys.push(key);
                    }
                  }
                } catch (err) {
                  _iterator5.e(err);
                } finally {
                  _iterator5.f();
                }
                return changedKeys;
              }
              __name(getChangedKeys, "getChangedKeys");
              function didFiberRender(prevFiber, nextFiber) {
                switch (nextFiber.tag) {
                  case ClassComponent:
                  case FunctionComponent:
                  case ContextConsumer:
                  case MemoComponent:
                  case SimpleMemoComponent:
                  case ForwardRef:
                    var PerformedWork = 1;
                    return (getFiberFlags(nextFiber) & PerformedWork) === PerformedWork;
                  // Note: ContextConsumer only gets PerformedWork effect in 16.3.3+
                  // so it won't get highlighted with React 16.3.0 to 16.3.2.
                  default:
                    return prevFiber.memoizedProps !== nextFiber.memoizedProps || prevFiber.memoizedState !== nextFiber.memoizedState || prevFiber.ref !== nextFiber.ref;
                }
              }
              __name(didFiberRender, "didFiberRender");
              var pendingOperations = [];
              var pendingRealUnmountedIDs = [];
              var pendingSimulatedUnmountedIDs = [];
              var pendingOperationsQueue = [];
              var pendingStringTable = /* @__PURE__ */ new Map();
              var pendingStringTableLength = 0;
              var pendingUnmountedRootID = null;
              function pushOperation(op) {
                if (false) {
                }
                pendingOperations.push(op);
              }
              __name(pushOperation, "pushOperation");
              function shouldBailoutWithPendingOperations() {
                if (isProfiling) {
                  if (currentCommitProfilingMetadata != null && currentCommitProfilingMetadata.durations.length > 0) {
                    return false;
                  }
                }
                return pendingOperations.length === 0 && pendingRealUnmountedIDs.length === 0 && pendingSimulatedUnmountedIDs.length === 0 && pendingUnmountedRootID === null;
              }
              __name(shouldBailoutWithPendingOperations, "shouldBailoutWithPendingOperations");
              function flushOrQueueOperations(operations) {
                if (shouldBailoutWithPendingOperations()) {
                  return;
                }
                if (pendingOperationsQueue !== null) {
                  pendingOperationsQueue.push(operations);
                } else {
                  hook2.emit("operations", operations);
                }
              }
              __name(flushOrQueueOperations, "flushOrQueueOperations");
              var flushPendingErrorsAndWarningsAfterDelayTimeoutID = null;
              function clearPendingErrorsAndWarningsAfterDelay() {
                if (flushPendingErrorsAndWarningsAfterDelayTimeoutID !== null) {
                  clearTimeout(flushPendingErrorsAndWarningsAfterDelayTimeoutID);
                  flushPendingErrorsAndWarningsAfterDelayTimeoutID = null;
                }
              }
              __name(clearPendingErrorsAndWarningsAfterDelay, "clearPendingErrorsAndWarningsAfterDelay");
              function flushPendingErrorsAndWarningsAfterDelay() {
                clearPendingErrorsAndWarningsAfterDelay();
                flushPendingErrorsAndWarningsAfterDelayTimeoutID = setTimeout(function() {
                  flushPendingErrorsAndWarningsAfterDelayTimeoutID = null;
                  if (pendingOperations.length > 0) {
                    return;
                  }
                  recordPendingErrorsAndWarnings();
                  if (shouldBailoutWithPendingOperations()) {
                    return;
                  }
                  var operations = new Array(3 + pendingOperations.length);
                  operations[0] = rendererID;
                  operations[1] = currentRootID;
                  operations[2] = 0;
                  for (var j = 0; j < pendingOperations.length; j++) {
                    operations[3 + j] = pendingOperations[j];
                  }
                  flushOrQueueOperations(operations);
                  pendingOperations.length = 0;
                }, 1e3);
              }
              __name(flushPendingErrorsAndWarningsAfterDelay, "flushPendingErrorsAndWarningsAfterDelay");
              function reevaluateErrorsAndWarnings() {
                fibersWithChangedErrorOrWarningCounts.clear();
                fiberIDToErrorsMap.forEach(function(countMap, fiberID) {
                  var fiber = idToArbitraryFiberMap.get(fiberID);
                  if (fiber != null) {
                    fibersWithChangedErrorOrWarningCounts.add(fiber);
                  }
                });
                fiberIDToWarningsMap.forEach(function(countMap, fiberID) {
                  var fiber = idToArbitraryFiberMap.get(fiberID);
                  if (fiber != null) {
                    fibersWithChangedErrorOrWarningCounts.add(fiber);
                  }
                });
                recordPendingErrorsAndWarnings();
              }
              __name(reevaluateErrorsAndWarnings, "reevaluateErrorsAndWarnings");
              function mergeMapsAndGetCountHelper(fiber, fiberID, pendingFiberToMessageCountMap, fiberIDToMessageCountMap) {
                var newCount = 0;
                var messageCountMap = fiberIDToMessageCountMap.get(fiberID);
                var pendingMessageCountMap = pendingFiberToMessageCountMap.get(fiber);
                if (pendingMessageCountMap != null) {
                  if (messageCountMap == null) {
                    messageCountMap = pendingMessageCountMap;
                    fiberIDToMessageCountMap.set(fiberID, pendingMessageCountMap);
                  } else {
                    var refinedMessageCountMap = messageCountMap;
                    pendingMessageCountMap.forEach(function(pendingCount, message) {
                      var previousCount = refinedMessageCountMap.get(message) || 0;
                      refinedMessageCountMap.set(message, previousCount + pendingCount);
                    });
                  }
                }
                if (!shouldFilterFiber(fiber)) {
                  if (messageCountMap != null) {
                    messageCountMap.forEach(function(count) {
                      newCount += count;
                    });
                  }
                }
                pendingFiberToMessageCountMap.delete(fiber);
                return newCount;
              }
              __name(mergeMapsAndGetCountHelper, "mergeMapsAndGetCountHelper");
              function recordPendingErrorsAndWarnings() {
                clearPendingErrorsAndWarningsAfterDelay();
                fibersWithChangedErrorOrWarningCounts.forEach(function(fiber) {
                  var fiberID = getFiberIDUnsafe(fiber);
                  if (fiberID === null) {
                  } else {
                    var errorCount = mergeMapsAndGetCountHelper(fiber, fiberID, pendingFiberToErrorsMap, fiberIDToErrorsMap);
                    var warningCount = mergeMapsAndGetCountHelper(fiber, fiberID, pendingFiberToWarningsMap, fiberIDToWarningsMap);
                    pushOperation(TREE_OPERATION_UPDATE_ERRORS_OR_WARNINGS);
                    pushOperation(fiberID);
                    pushOperation(errorCount);
                    pushOperation(warningCount);
                  }
                  pendingFiberToErrorsMap.delete(fiber);
                  pendingFiberToWarningsMap.delete(fiber);
                });
                fibersWithChangedErrorOrWarningCounts.clear();
              }
              __name(recordPendingErrorsAndWarnings, "recordPendingErrorsAndWarnings");
              function flushPendingEvents(root) {
                recordPendingErrorsAndWarnings();
                if (shouldBailoutWithPendingOperations()) {
                  return;
                }
                var numUnmountIDs = pendingRealUnmountedIDs.length + pendingSimulatedUnmountedIDs.length + (pendingUnmountedRootID === null ? 0 : 1);
                var operations = new Array(
                  // Identify which renderer this update is coming from.
                  2 + // [rendererID, rootFiberID]
                  // How big is the string table?
                  1 + // [stringTableLength]
                  // Then goes the actual string table.
                  pendingStringTableLength + // All unmounts are batched in a single message.
                  // [TREE_OPERATION_REMOVE, removedIDLength, ...ids]
                  (numUnmountIDs > 0 ? 2 + numUnmountIDs : 0) + // Regular operations
                  pendingOperations.length
                );
                var i = 0;
                operations[i++] = rendererID;
                operations[i++] = currentRootID;
                operations[i++] = pendingStringTableLength;
                pendingStringTable.forEach(function(entry, stringKey) {
                  var encodedString = entry.encodedString;
                  var length = encodedString.length;
                  operations[i++] = length;
                  for (var j2 = 0; j2 < length; j2++) {
                    operations[i + j2] = encodedString[j2];
                  }
                  i += length;
                });
                if (numUnmountIDs > 0) {
                  operations[i++] = TREE_OPERATION_REMOVE;
                  operations[i++] = numUnmountIDs;
                  for (var j = pendingRealUnmountedIDs.length - 1; j >= 0; j--) {
                    operations[i++] = pendingRealUnmountedIDs[j];
                  }
                  for (var _j = 0; _j < pendingSimulatedUnmountedIDs.length; _j++) {
                    operations[i + _j] = pendingSimulatedUnmountedIDs[_j];
                  }
                  i += pendingSimulatedUnmountedIDs.length;
                  if (pendingUnmountedRootID !== null) {
                    operations[i] = pendingUnmountedRootID;
                    i++;
                  }
                }
                for (var _j2 = 0; _j2 < pendingOperations.length; _j2++) {
                  operations[i + _j2] = pendingOperations[_j2];
                }
                i += pendingOperations.length;
                flushOrQueueOperations(operations);
                pendingOperations.length = 0;
                pendingRealUnmountedIDs.length = 0;
                pendingSimulatedUnmountedIDs.length = 0;
                pendingUnmountedRootID = null;
                pendingStringTable.clear();
                pendingStringTableLength = 0;
              }
              __name(flushPendingEvents, "flushPendingEvents");
              function getStringID(string) {
                if (string === null) {
                  return 0;
                }
                var existingEntry = pendingStringTable.get(string);
                if (existingEntry !== void 0) {
                  return existingEntry.id;
                }
                var id = pendingStringTable.size + 1;
                var encodedString = utfEncodeString(string);
                pendingStringTable.set(string, {
                  encodedString,
                  id
                });
                pendingStringTableLength += encodedString.length + 1;
                return id;
              }
              __name(getStringID, "getStringID");
              function recordMount(fiber, parentFiber) {
                var isRoot = fiber.tag === HostRoot;
                var id = getOrGenerateFiberID(fiber);
                if (__DEBUG__) {
                  debug2("recordMount()", fiber, parentFiber);
                }
                var hasOwnerMetadata = fiber.hasOwnProperty("_debugOwner");
                var isProfilingSupported = fiber.hasOwnProperty("treeBaseDuration");
                var profilingFlags = 0;
                if (isProfilingSupported) {
                  profilingFlags = PROFILING_FLAG_BASIC_SUPPORT;
                  if (typeof injectProfilingHooks === "function") {
                    profilingFlags |= PROFILING_FLAG_TIMELINE_SUPPORT;
                  }
                }
                if (isRoot) {
                  pushOperation(TREE_OPERATION_ADD);
                  pushOperation(id);
                  pushOperation(ElementTypeRoot);
                  pushOperation((fiber.mode & StrictModeBits) !== 0 ? 1 : 0);
                  pushOperation(profilingFlags);
                  pushOperation(StrictModeBits !== 0 ? 1 : 0);
                  pushOperation(hasOwnerMetadata ? 1 : 0);
                  if (isProfiling) {
                    if (displayNamesByRootID !== null) {
                      displayNamesByRootID.set(id, getDisplayNameForRoot(fiber));
                    }
                  }
                } else {
                  var key = fiber.key;
                  var displayName = getDisplayNameForFiber(fiber);
                  var elementType = getElementTypeForFiber(fiber);
                  var _debugOwner = fiber._debugOwner;
                  var ownerID = _debugOwner != null ? getOrGenerateFiberID(_debugOwner) : 0;
                  var parentID = parentFiber ? getFiberIDThrows(parentFiber) : 0;
                  var displayNameStringID = getStringID(displayName);
                  var keyString = key === null ? null : String(key);
                  var keyStringID = getStringID(keyString);
                  pushOperation(TREE_OPERATION_ADD);
                  pushOperation(id);
                  pushOperation(elementType);
                  pushOperation(parentID);
                  pushOperation(ownerID);
                  pushOperation(displayNameStringID);
                  pushOperation(keyStringID);
                  if ((fiber.mode & StrictModeBits) !== 0 && (parentFiber.mode & StrictModeBits) === 0) {
                    pushOperation(TREE_OPERATION_SET_SUBTREE_MODE);
                    pushOperation(id);
                    pushOperation(StrictMode);
                  }
                }
                if (isProfilingSupported) {
                  idToRootMap.set(id, currentRootID);
                  recordProfilingDurations(fiber);
                }
              }
              __name(recordMount, "recordMount");
              function recordUnmount(fiber, isSimulated) {
                if (__DEBUG__) {
                  debug2("recordUnmount()", fiber, null, isSimulated ? "unmount is simulated" : "");
                }
                if (trackedPathMatchFiber !== null) {
                  if (fiber === trackedPathMatchFiber || fiber === trackedPathMatchFiber.alternate) {
                    setTrackedPath(null);
                  }
                }
                var unsafeID = getFiberIDUnsafe(fiber);
                if (unsafeID === null) {
                  return;
                }
                var id = unsafeID;
                var isRoot = fiber.tag === HostRoot;
                if (isRoot) {
                  pendingUnmountedRootID = id;
                } else if (!shouldFilterFiber(fiber)) {
                  if (isSimulated) {
                    pendingSimulatedUnmountedIDs.push(id);
                  } else {
                    pendingRealUnmountedIDs.push(id);
                  }
                }
                if (!fiber._debugNeedsRemount) {
                  untrackFiberID(fiber);
                  var isProfilingSupported = fiber.hasOwnProperty("treeBaseDuration");
                  if (isProfilingSupported) {
                    idToRootMap.delete(id);
                    idToTreeBaseDurationMap.delete(id);
                  }
                }
              }
              __name(recordUnmount, "recordUnmount");
              function mountFiberRecursively(firstChild, parentFiber, traverseSiblings, traceNearestHostComponentUpdate) {
                var fiber = firstChild;
                while (fiber !== null) {
                  getOrGenerateFiberID(fiber);
                  if (__DEBUG__) {
                    debug2("mountFiberRecursively()", fiber, parentFiber);
                  }
                  var mightSiblingsBeOnTrackedPath = updateTrackedPathStateBeforeMount(fiber);
                  var shouldIncludeInTree = !shouldFilterFiber(fiber);
                  if (shouldIncludeInTree) {
                    recordMount(fiber, parentFiber);
                  }
                  if (traceUpdatesEnabled) {
                    if (traceNearestHostComponentUpdate) {
                      var elementType = getElementTypeForFiber(fiber);
                      if (elementType === ElementTypeHostComponent) {
                        traceUpdatesForNodes.add(fiber.stateNode);
                        traceNearestHostComponentUpdate = false;
                      }
                    }
                  }
                  var isSuspense = fiber.tag === ReactTypeOfWork.SuspenseComponent;
                  if (isSuspense) {
                    var isTimedOut = fiber.memoizedState !== null;
                    if (isTimedOut) {
                      var primaryChildFragment = fiber.child;
                      var fallbackChildFragment = primaryChildFragment ? primaryChildFragment.sibling : null;
                      var fallbackChild = fallbackChildFragment ? fallbackChildFragment.child : null;
                      if (fallbackChild !== null) {
                        mountFiberRecursively(fallbackChild, shouldIncludeInTree ? fiber : parentFiber, true, traceNearestHostComponentUpdate);
                      }
                    } else {
                      var primaryChild = null;
                      var areSuspenseChildrenConditionallyWrapped = OffscreenComponent === -1;
                      if (areSuspenseChildrenConditionallyWrapped) {
                        primaryChild = fiber.child;
                      } else if (fiber.child !== null) {
                        primaryChild = fiber.child.child;
                      }
                      if (primaryChild !== null) {
                        mountFiberRecursively(primaryChild, shouldIncludeInTree ? fiber : parentFiber, true, traceNearestHostComponentUpdate);
                      }
                    }
                  } else {
                    if (fiber.child !== null) {
                      mountFiberRecursively(fiber.child, shouldIncludeInTree ? fiber : parentFiber, true, traceNearestHostComponentUpdate);
                    }
                  }
                  updateTrackedPathStateAfterMount(mightSiblingsBeOnTrackedPath);
                  fiber = traverseSiblings ? fiber.sibling : null;
                }
              }
              __name(mountFiberRecursively, "mountFiberRecursively");
              function unmountFiberChildrenRecursively(fiber) {
                if (__DEBUG__) {
                  debug2("unmountFiberChildrenRecursively()", fiber);
                }
                var isTimedOutSuspense = fiber.tag === ReactTypeOfWork.SuspenseComponent && fiber.memoizedState !== null;
                var child = fiber.child;
                if (isTimedOutSuspense) {
                  var primaryChildFragment = fiber.child;
                  var fallbackChildFragment = primaryChildFragment ? primaryChildFragment.sibling : null;
                  child = fallbackChildFragment ? fallbackChildFragment.child : null;
                }
                while (child !== null) {
                  if (child.return !== null) {
                    unmountFiberChildrenRecursively(child);
                    recordUnmount(child, true);
                  }
                  child = child.sibling;
                }
              }
              __name(unmountFiberChildrenRecursively, "unmountFiberChildrenRecursively");
              function recordProfilingDurations(fiber) {
                var id = getFiberIDThrows(fiber);
                var actualDuration = fiber.actualDuration, treeBaseDuration = fiber.treeBaseDuration;
                idToTreeBaseDurationMap.set(id, treeBaseDuration || 0);
                if (isProfiling) {
                  var alternate = fiber.alternate;
                  if (alternate == null || treeBaseDuration !== alternate.treeBaseDuration) {
                    var convertedTreeBaseDuration = Math.floor((treeBaseDuration || 0) * 1e3);
                    pushOperation(TREE_OPERATION_UPDATE_TREE_BASE_DURATION);
                    pushOperation(id);
                    pushOperation(convertedTreeBaseDuration);
                  }
                  if (alternate == null || didFiberRender(alternate, fiber)) {
                    if (actualDuration != null) {
                      var selfDuration = actualDuration;
                      var child = fiber.child;
                      while (child !== null) {
                        selfDuration -= child.actualDuration || 0;
                        child = child.sibling;
                      }
                      var metadata = currentCommitProfilingMetadata;
                      metadata.durations.push(id, actualDuration, selfDuration);
                      metadata.maxActualDuration = Math.max(metadata.maxActualDuration, actualDuration);
                      if (recordChangeDescriptions) {
                        var changeDescription = getChangeDescription(alternate, fiber);
                        if (changeDescription !== null) {
                          if (metadata.changeDescriptions !== null) {
                            metadata.changeDescriptions.set(id, changeDescription);
                          }
                        }
                        updateContextsForFiber(fiber);
                      }
                    }
                  }
                }
              }
              __name(recordProfilingDurations, "recordProfilingDurations");
              function recordResetChildren(fiber, childSet) {
                if (__DEBUG__) {
                  debug2("recordResetChildren()", childSet, fiber);
                }
                var nextChildren = [];
                var child = childSet;
                while (child !== null) {
                  findReorderedChildrenRecursively(child, nextChildren);
                  child = child.sibling;
                }
                var numChildren = nextChildren.length;
                if (numChildren < 2) {
                  return;
                }
                pushOperation(TREE_OPERATION_REORDER_CHILDREN);
                pushOperation(getFiberIDThrows(fiber));
                pushOperation(numChildren);
                for (var i = 0; i < nextChildren.length; i++) {
                  pushOperation(nextChildren[i]);
                }
              }
              __name(recordResetChildren, "recordResetChildren");
              function findReorderedChildrenRecursively(fiber, nextChildren) {
                if (!shouldFilterFiber(fiber)) {
                  nextChildren.push(getFiberIDThrows(fiber));
                } else {
                  var child = fiber.child;
                  var isTimedOutSuspense = fiber.tag === SuspenseComponent && fiber.memoizedState !== null;
                  if (isTimedOutSuspense) {
                    var primaryChildFragment = fiber.child;
                    var fallbackChildFragment = primaryChildFragment ? primaryChildFragment.sibling : null;
                    var fallbackChild = fallbackChildFragment ? fallbackChildFragment.child : null;
                    if (fallbackChild !== null) {
                      child = fallbackChild;
                    }
                  }
                  while (child !== null) {
                    findReorderedChildrenRecursively(child, nextChildren);
                    child = child.sibling;
                  }
                }
              }
              __name(findReorderedChildrenRecursively, "findReorderedChildrenRecursively");
              function updateFiberRecursively(nextFiber, prevFiber, parentFiber, traceNearestHostComponentUpdate) {
                var id = getOrGenerateFiberID(nextFiber);
                if (__DEBUG__) {
                  debug2("updateFiberRecursively()", nextFiber, parentFiber);
                }
                if (traceUpdatesEnabled) {
                  var elementType = getElementTypeForFiber(nextFiber);
                  if (traceNearestHostComponentUpdate) {
                    if (elementType === ElementTypeHostComponent) {
                      traceUpdatesForNodes.add(nextFiber.stateNode);
                      traceNearestHostComponentUpdate = false;
                    }
                  } else {
                    if (elementType === types_ElementTypeFunction || elementType === types_ElementTypeClass || elementType === ElementTypeContext || elementType === types_ElementTypeMemo || elementType === types_ElementTypeForwardRef) {
                      traceNearestHostComponentUpdate = didFiberRender(prevFiber, nextFiber);
                    }
                  }
                }
                if (mostRecentlyInspectedElement !== null && mostRecentlyInspectedElement.id === id && didFiberRender(prevFiber, nextFiber)) {
                  hasElementUpdatedSinceLastInspected = true;
                }
                var shouldIncludeInTree = !shouldFilterFiber(nextFiber);
                var isSuspense = nextFiber.tag === SuspenseComponent;
                var shouldResetChildren = false;
                var prevDidTimeout = isSuspense && prevFiber.memoizedState !== null;
                var nextDidTimeOut = isSuspense && nextFiber.memoizedState !== null;
                if (prevDidTimeout && nextDidTimeOut) {
                  var nextFiberChild = nextFiber.child;
                  var nextFallbackChildSet = nextFiberChild ? nextFiberChild.sibling : null;
                  var prevFiberChild = prevFiber.child;
                  var prevFallbackChildSet = prevFiberChild ? prevFiberChild.sibling : null;
                  if (prevFallbackChildSet == null && nextFallbackChildSet != null) {
                    mountFiberRecursively(nextFallbackChildSet, shouldIncludeInTree ? nextFiber : parentFiber, true, traceNearestHostComponentUpdate);
                    shouldResetChildren = true;
                  }
                  if (nextFallbackChildSet != null && prevFallbackChildSet != null && updateFiberRecursively(nextFallbackChildSet, prevFallbackChildSet, nextFiber, traceNearestHostComponentUpdate)) {
                    shouldResetChildren = true;
                  }
                } else if (prevDidTimeout && !nextDidTimeOut) {
                  var nextPrimaryChildSet = nextFiber.child;
                  if (nextPrimaryChildSet !== null) {
                    mountFiberRecursively(nextPrimaryChildSet, shouldIncludeInTree ? nextFiber : parentFiber, true, traceNearestHostComponentUpdate);
                  }
                  shouldResetChildren = true;
                } else if (!prevDidTimeout && nextDidTimeOut) {
                  unmountFiberChildrenRecursively(prevFiber);
                  var _nextFiberChild = nextFiber.child;
                  var _nextFallbackChildSet = _nextFiberChild ? _nextFiberChild.sibling : null;
                  if (_nextFallbackChildSet != null) {
                    mountFiberRecursively(_nextFallbackChildSet, shouldIncludeInTree ? nextFiber : parentFiber, true, traceNearestHostComponentUpdate);
                    shouldResetChildren = true;
                  }
                } else {
                  if (nextFiber.child !== prevFiber.child) {
                    var nextChild = nextFiber.child;
                    var prevChildAtSameIndex = prevFiber.child;
                    while (nextChild) {
                      if (nextChild.alternate) {
                        var prevChild = nextChild.alternate;
                        if (updateFiberRecursively(nextChild, prevChild, shouldIncludeInTree ? nextFiber : parentFiber, traceNearestHostComponentUpdate)) {
                          shouldResetChildren = true;
                        }
                        if (prevChild !== prevChildAtSameIndex) {
                          shouldResetChildren = true;
                        }
                      } else {
                        mountFiberRecursively(nextChild, shouldIncludeInTree ? nextFiber : parentFiber, false, traceNearestHostComponentUpdate);
                        shouldResetChildren = true;
                      }
                      nextChild = nextChild.sibling;
                      if (!shouldResetChildren && prevChildAtSameIndex !== null) {
                        prevChildAtSameIndex = prevChildAtSameIndex.sibling;
                      }
                    }
                    if (prevChildAtSameIndex !== null) {
                      shouldResetChildren = true;
                    }
                  } else {
                    if (traceUpdatesEnabled) {
                      if (traceNearestHostComponentUpdate) {
                        var hostFibers = findAllCurrentHostFibers(getFiberIDThrows(nextFiber));
                        hostFibers.forEach(function(hostFiber) {
                          traceUpdatesForNodes.add(hostFiber.stateNode);
                        });
                      }
                    }
                  }
                }
                if (shouldIncludeInTree) {
                  var isProfilingSupported = nextFiber.hasOwnProperty("treeBaseDuration");
                  if (isProfilingSupported) {
                    recordProfilingDurations(nextFiber);
                  }
                }
                if (shouldResetChildren) {
                  if (shouldIncludeInTree) {
                    var nextChildSet = nextFiber.child;
                    if (nextDidTimeOut) {
                      var _nextFiberChild2 = nextFiber.child;
                      nextChildSet = _nextFiberChild2 ? _nextFiberChild2.sibling : null;
                    }
                    if (nextChildSet != null) {
                      recordResetChildren(nextFiber, nextChildSet);
                    }
                    return false;
                  } else {
                    return true;
                  }
                } else {
                  return false;
                }
              }
              __name(updateFiberRecursively, "updateFiberRecursively");
              function cleanup() {
              }
              __name(cleanup, "cleanup");
              function rootSupportsProfiling(root) {
                if (root.memoizedInteractions != null) {
                  return true;
                } else if (root.current != null && root.current.hasOwnProperty("treeBaseDuration")) {
                  return true;
                } else {
                  return false;
                }
              }
              __name(rootSupportsProfiling, "rootSupportsProfiling");
              function flushInitialOperations() {
                var localPendingOperationsQueue = pendingOperationsQueue;
                pendingOperationsQueue = null;
                if (localPendingOperationsQueue !== null && localPendingOperationsQueue.length > 0) {
                  localPendingOperationsQueue.forEach(function(operations) {
                    hook2.emit("operations", operations);
                  });
                } else {
                  if (trackedPath !== null) {
                    mightBeOnTrackedPath = true;
                  }
                  hook2.getFiberRoots(rendererID).forEach(function(root) {
                    currentRootID = getOrGenerateFiberID(root.current);
                    setRootPseudoKey(currentRootID, root.current);
                    if (isProfiling && rootSupportsProfiling(root)) {
                      currentCommitProfilingMetadata = {
                        changeDescriptions: recordChangeDescriptions ? /* @__PURE__ */ new Map() : null,
                        durations: [],
                        commitTime: renderer_getCurrentTime() - profilingStartTime,
                        maxActualDuration: 0,
                        priorityLevel: null,
                        updaters: getUpdatersList(root),
                        effectDuration: null,
                        passiveEffectDuration: null
                      };
                    }
                    mountFiberRecursively(root.current, null, false, false);
                    flushPendingEvents(root);
                    currentRootID = -1;
                  });
                }
              }
              __name(flushInitialOperations, "flushInitialOperations");
              function getUpdatersList(root) {
                return root.memoizedUpdaters != null ? Array.from(root.memoizedUpdaters).filter(function(fiber) {
                  return getFiberIDUnsafe(fiber) !== null;
                }).map(fiberToSerializedElement) : null;
              }
              __name(getUpdatersList, "getUpdatersList");
              function handleCommitFiberUnmount(fiber) {
                if (!untrackFibersSet.has(fiber)) {
                  recordUnmount(fiber, false);
                }
              }
              __name(handleCommitFiberUnmount, "handleCommitFiberUnmount");
              function handlePostCommitFiberRoot(root) {
                if (isProfiling && rootSupportsProfiling(root)) {
                  if (currentCommitProfilingMetadata !== null) {
                    var _getEffectDurations = getEffectDurations(root), effectDuration = _getEffectDurations.effectDuration, passiveEffectDuration = _getEffectDurations.passiveEffectDuration;
                    currentCommitProfilingMetadata.effectDuration = effectDuration;
                    currentCommitProfilingMetadata.passiveEffectDuration = passiveEffectDuration;
                  }
                }
              }
              __name(handlePostCommitFiberRoot, "handlePostCommitFiberRoot");
              function handleCommitFiberRoot(root, priorityLevel) {
                var current = root.current;
                var alternate = current.alternate;
                untrackFibers();
                currentRootID = getOrGenerateFiberID(current);
                if (trackedPath !== null) {
                  mightBeOnTrackedPath = true;
                }
                if (traceUpdatesEnabled) {
                  traceUpdatesForNodes.clear();
                }
                var isProfilingSupported = rootSupportsProfiling(root);
                if (isProfiling && isProfilingSupported) {
                  currentCommitProfilingMetadata = {
                    changeDescriptions: recordChangeDescriptions ? /* @__PURE__ */ new Map() : null,
                    durations: [],
                    commitTime: renderer_getCurrentTime() - profilingStartTime,
                    maxActualDuration: 0,
                    priorityLevel: priorityLevel == null ? null : formatPriorityLevel(priorityLevel),
                    updaters: getUpdatersList(root),
                    // Initialize to null; if new enough React version is running,
                    // these values will be read during separate handlePostCommitFiberRoot() call.
                    effectDuration: null,
                    passiveEffectDuration: null
                  };
                }
                if (alternate) {
                  var wasMounted = alternate.memoizedState != null && alternate.memoizedState.element != null && // A dehydrated root is not considered mounted
                  alternate.memoizedState.isDehydrated !== true;
                  var isMounted = current.memoizedState != null && current.memoizedState.element != null && // A dehydrated root is not considered mounted
                  current.memoizedState.isDehydrated !== true;
                  if (!wasMounted && isMounted) {
                    setRootPseudoKey(currentRootID, current);
                    mountFiberRecursively(current, null, false, false);
                  } else if (wasMounted && isMounted) {
                    updateFiberRecursively(current, alternate, null, false);
                  } else if (wasMounted && !isMounted) {
                    removeRootPseudoKey(currentRootID);
                    recordUnmount(current, false);
                  }
                } else {
                  setRootPseudoKey(currentRootID, current);
                  mountFiberRecursively(current, null, false, false);
                }
                if (isProfiling && isProfilingSupported) {
                  if (!shouldBailoutWithPendingOperations()) {
                    var commitProfilingMetadata = rootToCommitProfilingMetadataMap.get(currentRootID);
                    if (commitProfilingMetadata != null) {
                      commitProfilingMetadata.push(currentCommitProfilingMetadata);
                    } else {
                      rootToCommitProfilingMetadataMap.set(currentRootID, [currentCommitProfilingMetadata]);
                    }
                  }
                }
                flushPendingEvents(root);
                if (traceUpdatesEnabled) {
                  hook2.emit("traceUpdates", traceUpdatesForNodes);
                }
                currentRootID = -1;
              }
              __name(handleCommitFiberRoot, "handleCommitFiberRoot");
              function findAllCurrentHostFibers(id) {
                var fibers = [];
                var fiber = findCurrentFiberUsingSlowPathById(id);
                if (!fiber) {
                  return fibers;
                }
                var node = fiber;
                while (true) {
                  if (node.tag === HostComponent || node.tag === HostText) {
                    fibers.push(node);
                  } else if (node.child) {
                    node.child.return = node;
                    node = node.child;
                    continue;
                  }
                  if (node === fiber) {
                    return fibers;
                  }
                  while (!node.sibling) {
                    if (!node.return || node.return === fiber) {
                      return fibers;
                    }
                    node = node.return;
                  }
                  node.sibling.return = node.return;
                  node = node.sibling;
                }
                return fibers;
              }
              __name(findAllCurrentHostFibers, "findAllCurrentHostFibers");
              function findNativeNodesForFiberID(id) {
                try {
                  var _fiber3 = findCurrentFiberUsingSlowPathById(id);
                  if (_fiber3 === null) {
                    return null;
                  }
                  var hostFibers = findAllCurrentHostFibers(id);
                  return hostFibers.map(function(hostFiber) {
                    return hostFiber.stateNode;
                  }).filter(Boolean);
                } catch (err) {
                  return null;
                }
              }
              __name(findNativeNodesForFiberID, "findNativeNodesForFiberID");
              function getDisplayNameForFiberID(id) {
                var fiber = idToArbitraryFiberMap.get(id);
                return fiber != null ? getDisplayNameForFiber(fiber) : null;
              }
              __name(getDisplayNameForFiberID, "getDisplayNameForFiberID");
              function getFiberForNative(hostInstance) {
                return renderer.findFiberByHostInstance(hostInstance);
              }
              __name(getFiberForNative, "getFiberForNative");
              function getFiberIDForNative(hostInstance) {
                var findNearestUnfilteredAncestor = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
                var fiber = renderer.findFiberByHostInstance(hostInstance);
                if (fiber != null) {
                  if (findNearestUnfilteredAncestor) {
                    while (fiber !== null && shouldFilterFiber(fiber)) {
                      fiber = fiber.return;
                    }
                  }
                  return getFiberIDThrows(fiber);
                }
                return null;
              }
              __name(getFiberIDForNative, "getFiberIDForNative");
              function assertIsMounted(fiber) {
                if (getNearestMountedFiber(fiber) !== fiber) {
                  throw new Error("Unable to find node on an unmounted component.");
                }
              }
              __name(assertIsMounted, "assertIsMounted");
              function getNearestMountedFiber(fiber) {
                var node = fiber;
                var nearestMounted = fiber;
                if (!fiber.alternate) {
                  var nextNode = node;
                  do {
                    node = nextNode;
                    var Placement = 2;
                    var Hydrating = 4096;
                    if ((node.flags & (Placement | Hydrating)) !== 0) {
                      nearestMounted = node.return;
                    }
                    nextNode = node.return;
                  } while (nextNode);
                } else {
                  while (node.return) {
                    node = node.return;
                  }
                }
                if (node.tag === HostRoot) {
                  return nearestMounted;
                }
                return null;
              }
              __name(getNearestMountedFiber, "getNearestMountedFiber");
              function findCurrentFiberUsingSlowPathById(id) {
                var fiber = idToArbitraryFiberMap.get(id);
                if (fiber == null) {
                  console.warn('Could not find Fiber with id "'.concat(id, '"'));
                  return null;
                }
                var alternate = fiber.alternate;
                if (!alternate) {
                  var nearestMounted = getNearestMountedFiber(fiber);
                  if (nearestMounted === null) {
                    throw new Error("Unable to find node on an unmounted component.");
                  }
                  if (nearestMounted !== fiber) {
                    return null;
                  }
                  return fiber;
                }
                var a = fiber;
                var b = alternate;
                while (true) {
                  var parentA = a.return;
                  if (parentA === null) {
                    break;
                  }
                  var parentB = parentA.alternate;
                  if (parentB === null) {
                    var nextParent = parentA.return;
                    if (nextParent !== null) {
                      a = b = nextParent;
                      continue;
                    }
                    break;
                  }
                  if (parentA.child === parentB.child) {
                    var child = parentA.child;
                    while (child) {
                      if (child === a) {
                        assertIsMounted(parentA);
                        return fiber;
                      }
                      if (child === b) {
                        assertIsMounted(parentA);
                        return alternate;
                      }
                      child = child.sibling;
                    }
                    throw new Error("Unable to find node on an unmounted component.");
                  }
                  if (a.return !== b.return) {
                    a = parentA;
                    b = parentB;
                  } else {
                    var didFindChild = false;
                    var _child = parentA.child;
                    while (_child) {
                      if (_child === a) {
                        didFindChild = true;
                        a = parentA;
                        b = parentB;
                        break;
                      }
                      if (_child === b) {
                        didFindChild = true;
                        b = parentA;
                        a = parentB;
                        break;
                      }
                      _child = _child.sibling;
                    }
                    if (!didFindChild) {
                      _child = parentB.child;
                      while (_child) {
                        if (_child === a) {
                          didFindChild = true;
                          a = parentB;
                          b = parentA;
                          break;
                        }
                        if (_child === b) {
                          didFindChild = true;
                          b = parentB;
                          a = parentA;
                          break;
                        }
                        _child = _child.sibling;
                      }
                      if (!didFindChild) {
                        throw new Error("Child was not found in either parent set. This indicates a bug in React related to the return pointer. Please file an issue.");
                      }
                    }
                  }
                  if (a.alternate !== b) {
                    throw new Error("Return fibers should always be each others' alternates. This error is likely caused by a bug in React. Please file an issue.");
                  }
                }
                if (a.tag !== HostRoot) {
                  throw new Error("Unable to find node on an unmounted component.");
                }
                if (a.stateNode.current === a) {
                  return fiber;
                }
                return alternate;
              }
              __name(findCurrentFiberUsingSlowPathById, "findCurrentFiberUsingSlowPathById");
              function prepareViewAttributeSource(id, path) {
                if (isMostRecentlyInspectedElement(id)) {
                  window.$attribute = utils_getInObject(mostRecentlyInspectedElement, path);
                }
              }
              __name(prepareViewAttributeSource, "prepareViewAttributeSource");
              function prepareViewElementSource(id) {
                var fiber = idToArbitraryFiberMap.get(id);
                if (fiber == null) {
                  console.warn('Could not find Fiber with id "'.concat(id, '"'));
                  return;
                }
                var elementType = fiber.elementType, tag = fiber.tag, type = fiber.type;
                switch (tag) {
                  case ClassComponent:
                  case IncompleteClassComponent:
                  case IndeterminateComponent:
                  case FunctionComponent:
                    global2.$type = type;
                    break;
                  case ForwardRef:
                    global2.$type = type.render;
                    break;
                  case MemoComponent:
                  case SimpleMemoComponent:
                    global2.$type = elementType != null && elementType.type != null ? elementType.type : type;
                    break;
                  default:
                    global2.$type = null;
                    break;
                }
              }
              __name(prepareViewElementSource, "prepareViewElementSource");
              function fiberToSerializedElement(fiber) {
                return {
                  displayName: getDisplayNameForFiber(fiber) || "Anonymous",
                  id: getFiberIDThrows(fiber),
                  key: fiber.key,
                  type: getElementTypeForFiber(fiber)
                };
              }
              __name(fiberToSerializedElement, "fiberToSerializedElement");
              function getOwnersList(id) {
                var fiber = findCurrentFiberUsingSlowPathById(id);
                if (fiber == null) {
                  return null;
                }
                var _debugOwner = fiber._debugOwner;
                var owners = [fiberToSerializedElement(fiber)];
                if (_debugOwner) {
                  var owner = _debugOwner;
                  while (owner !== null) {
                    owners.unshift(fiberToSerializedElement(owner));
                    owner = owner._debugOwner || null;
                  }
                }
                return owners;
              }
              __name(getOwnersList, "getOwnersList");
              function getInstanceAndStyle(id) {
                var instance = null;
                var style = null;
                var fiber = findCurrentFiberUsingSlowPathById(id);
                if (fiber !== null) {
                  instance = fiber.stateNode;
                  if (fiber.memoizedProps !== null) {
                    style = fiber.memoizedProps.style;
                  }
                }
                return {
                  instance,
                  style
                };
              }
              __name(getInstanceAndStyle, "getInstanceAndStyle");
              function isErrorBoundary(fiber) {
                var tag = fiber.tag, type = fiber.type;
                switch (tag) {
                  case ClassComponent:
                  case IncompleteClassComponent:
                    var instance = fiber.stateNode;
                    return typeof type.getDerivedStateFromError === "function" || instance !== null && typeof instance.componentDidCatch === "function";
                  default:
                    return false;
                }
              }
              __name(isErrorBoundary, "isErrorBoundary");
              function getNearestErrorBoundaryID(fiber) {
                var parent = fiber.return;
                while (parent !== null) {
                  if (isErrorBoundary(parent)) {
                    return getFiberIDUnsafe(parent);
                  }
                  parent = parent.return;
                }
                return null;
              }
              __name(getNearestErrorBoundaryID, "getNearestErrorBoundaryID");
              function inspectElementRaw(id) {
                var fiber = findCurrentFiberUsingSlowPathById(id);
                if (fiber == null) {
                  return null;
                }
                var _debugOwner = fiber._debugOwner, _debugSource = fiber._debugSource, stateNode = fiber.stateNode, key = fiber.key, memoizedProps = fiber.memoizedProps, memoizedState = fiber.memoizedState, dependencies = fiber.dependencies, tag = fiber.tag, type = fiber.type;
                var elementType = getElementTypeForFiber(fiber);
                var usesHooks = (tag === FunctionComponent || tag === SimpleMemoComponent || tag === ForwardRef) && (!!memoizedState || !!dependencies);
                var showState = !usesHooks && tag !== CacheComponent;
                var typeSymbol = getTypeSymbol(type);
                var canViewSource = false;
                var context = null;
                if (tag === ClassComponent || tag === FunctionComponent || tag === IncompleteClassComponent || tag === IndeterminateComponent || tag === MemoComponent || tag === ForwardRef || tag === SimpleMemoComponent) {
                  canViewSource = true;
                  if (stateNode && stateNode.context != null) {
                    var shouldHideContext = elementType === types_ElementTypeClass && !(type.contextTypes || type.contextType);
                    if (!shouldHideContext) {
                      context = stateNode.context;
                    }
                  }
                } else if (typeSymbol === CONTEXT_NUMBER || typeSymbol === CONTEXT_SYMBOL_STRING) {
                  var consumerResolvedContext = type._context || type;
                  context = consumerResolvedContext._currentValue || null;
                  var _current = fiber.return;
                  while (_current !== null) {
                    var currentType = _current.type;
                    var currentTypeSymbol = getTypeSymbol(currentType);
                    if (currentTypeSymbol === PROVIDER_NUMBER || currentTypeSymbol === PROVIDER_SYMBOL_STRING) {
                      var providerResolvedContext = currentType._context || currentType.context;
                      if (providerResolvedContext === consumerResolvedContext) {
                        context = _current.memoizedProps.value;
                        break;
                      }
                    }
                    _current = _current.return;
                  }
                }
                var hasLegacyContext = false;
                if (context !== null) {
                  hasLegacyContext = !!type.contextTypes;
                  context = {
                    value: context
                  };
                }
                var owners = null;
                if (_debugOwner) {
                  owners = [];
                  var owner = _debugOwner;
                  while (owner !== null) {
                    owners.push(fiberToSerializedElement(owner));
                    owner = owner._debugOwner || null;
                  }
                }
                var isTimedOutSuspense = tag === SuspenseComponent && memoizedState !== null;
                var hooks = null;
                if (usesHooks) {
                  var originalConsoleMethods = {};
                  for (var method2 in console) {
                    try {
                      originalConsoleMethods[method2] = console[method2];
                      console[method2] = function() {
                      };
                    } catch (error) {
                    }
                  }
                  try {
                    hooks = (0, react_debug_tools.inspectHooksOfFiber)(
                      fiber,
                      renderer.currentDispatcherRef,
                      true
                      // Include source location info for hooks
                    );
                  } finally {
                    for (var _method in originalConsoleMethods) {
                      try {
                        console[_method] = originalConsoleMethods[_method];
                      } catch (error) {
                      }
                    }
                  }
                }
                var rootType = null;
                var current = fiber;
                while (current.return !== null) {
                  current = current.return;
                }
                var fiberRoot = current.stateNode;
                if (fiberRoot != null && fiberRoot._debugRootType !== null) {
                  rootType = fiberRoot._debugRootType;
                }
                var errors = fiberIDToErrorsMap.get(id) || /* @__PURE__ */ new Map();
                var warnings = fiberIDToWarningsMap.get(id) || /* @__PURE__ */ new Map();
                var isErrored = false;
                var targetErrorBoundaryID;
                if (isErrorBoundary(fiber)) {
                  var DidCapture = 128;
                  isErrored = (fiber.flags & DidCapture) !== 0 || forceErrorForFiberIDs.get(id) === true;
                  targetErrorBoundaryID = isErrored ? id : getNearestErrorBoundaryID(fiber);
                } else {
                  targetErrorBoundaryID = getNearestErrorBoundaryID(fiber);
                }
                var plugins = {
                  stylex: null
                };
                if (enableStyleXFeatures) {
                  if (memoizedProps != null && memoizedProps.hasOwnProperty("xstyle")) {
                    plugins.stylex = getStyleXData(memoizedProps.xstyle);
                  }
                }
                return {
                  id,
                  // Does the current renderer support editable hooks and function props?
                  canEditHooks: typeof overrideHookState === "function",
                  canEditFunctionProps: typeof overrideProps === "function",
                  // Does the current renderer support advanced editing interface?
                  canEditHooksAndDeletePaths: typeof overrideHookStateDeletePath === "function",
                  canEditHooksAndRenamePaths: typeof overrideHookStateRenamePath === "function",
                  canEditFunctionPropsDeletePaths: typeof overridePropsDeletePath === "function",
                  canEditFunctionPropsRenamePaths: typeof overridePropsRenamePath === "function",
                  canToggleError: supportsTogglingError && targetErrorBoundaryID != null,
                  // Is this error boundary in error state.
                  isErrored,
                  targetErrorBoundaryID,
                  canToggleSuspense: supportsTogglingSuspense && // If it's showing the real content, we can always flip fallback.
                  (!isTimedOutSuspense || // If it's showing fallback because we previously forced it to,
                  // allow toggling it back to remove the fallback override.
                  forceFallbackForSuspenseIDs.has(id)),
                  // Can view component source location.
                  canViewSource,
                  // Does the component have legacy context attached to it.
                  hasLegacyContext,
                  key: key != null ? key : null,
                  displayName: getDisplayNameForFiber(fiber),
                  type: elementType,
                  // Inspectable properties.
                  // TODO Review sanitization approach for the below inspectable values.
                  context,
                  hooks,
                  props: memoizedProps,
                  state: showState ? memoizedState : null,
                  errors: Array.from(errors.entries()),
                  warnings: Array.from(warnings.entries()),
                  // List of owners
                  owners,
                  // Location of component in source code.
                  source: _debugSource || null,
                  rootType,
                  rendererPackageName: renderer.rendererPackageName,
                  rendererVersion: renderer.version,
                  plugins
                };
              }
              __name(inspectElementRaw, "inspectElementRaw");
              var mostRecentlyInspectedElement = null;
              var hasElementUpdatedSinceLastInspected = false;
              var currentlyInspectedPaths = {};
              function isMostRecentlyInspectedElement(id) {
                return mostRecentlyInspectedElement !== null && mostRecentlyInspectedElement.id === id;
              }
              __name(isMostRecentlyInspectedElement, "isMostRecentlyInspectedElement");
              function isMostRecentlyInspectedElementCurrent(id) {
                return isMostRecentlyInspectedElement(id) && !hasElementUpdatedSinceLastInspected;
              }
              __name(isMostRecentlyInspectedElementCurrent, "isMostRecentlyInspectedElementCurrent");
              function mergeInspectedPaths(path) {
                var current = currentlyInspectedPaths;
                path.forEach(function(key) {
                  if (!current[key]) {
                    current[key] = {};
                  }
                  current = current[key];
                });
              }
              __name(mergeInspectedPaths, "mergeInspectedPaths");
              function createIsPathAllowed(key, secondaryCategory) {
                return /* @__PURE__ */ __name(function isPathAllowed(path) {
                  switch (secondaryCategory) {
                    case "hooks":
                      if (path.length === 1) {
                        return true;
                      }
                      if (path[path.length - 2] === "hookSource" && path[path.length - 1] === "fileName") {
                        return true;
                      }
                      if (path[path.length - 1] === "subHooks" || path[path.length - 2] === "subHooks") {
                        return true;
                      }
                      break;
                    default:
                      break;
                  }
                  var current = key === null ? currentlyInspectedPaths : currentlyInspectedPaths[key];
                  if (!current) {
                    return false;
                  }
                  for (var i = 0; i < path.length; i++) {
                    current = current[path[i]];
                    if (!current) {
                      return false;
                    }
                  }
                  return true;
                }, "isPathAllowed");
              }
              __name(createIsPathAllowed, "createIsPathAllowed");
              function updateSelectedElement(inspectedElement) {
                var hooks = inspectedElement.hooks, id = inspectedElement.id, props = inspectedElement.props;
                var fiber = idToArbitraryFiberMap.get(id);
                if (fiber == null) {
                  console.warn('Could not find Fiber with id "'.concat(id, '"'));
                  return;
                }
                var elementType = fiber.elementType, stateNode = fiber.stateNode, tag = fiber.tag, type = fiber.type;
                switch (tag) {
                  case ClassComponent:
                  case IncompleteClassComponent:
                  case IndeterminateComponent:
                    global2.$r = stateNode;
                    break;
                  case FunctionComponent:
                    global2.$r = {
                      hooks,
                      props,
                      type
                    };
                    break;
                  case ForwardRef:
                    global2.$r = {
                      hooks,
                      props,
                      type: type.render
                    };
                    break;
                  case MemoComponent:
                  case SimpleMemoComponent:
                    global2.$r = {
                      hooks,
                      props,
                      type: elementType != null && elementType.type != null ? elementType.type : type
                    };
                    break;
                  default:
                    global2.$r = null;
                    break;
                }
              }
              __name(updateSelectedElement, "updateSelectedElement");
              function storeAsGlobal(id, path, count) {
                if (isMostRecentlyInspectedElement(id)) {
                  var value = utils_getInObject(mostRecentlyInspectedElement, path);
                  var key = "$reactTemp".concat(count);
                  window[key] = value;
                  console.log(key);
                  console.log(value);
                }
              }
              __name(storeAsGlobal, "storeAsGlobal");
              function getSerializedElementValueByPath(id, path) {
                if (isMostRecentlyInspectedElement(id)) {
                  var valueToCopy = utils_getInObject(mostRecentlyInspectedElement, path);
                  return serializeToString(valueToCopy);
                }
              }
              __name(getSerializedElementValueByPath, "getSerializedElementValueByPath");
              function inspectElement(requestID, id, path, forceFullData) {
                if (path !== null) {
                  mergeInspectedPaths(path);
                }
                if (isMostRecentlyInspectedElement(id) && !forceFullData) {
                  if (!hasElementUpdatedSinceLastInspected) {
                    if (path !== null) {
                      var secondaryCategory = null;
                      if (path[0] === "hooks") {
                        secondaryCategory = "hooks";
                      }
                      return {
                        id,
                        responseID: requestID,
                        type: "hydrated-path",
                        path,
                        value: cleanForBridge(utils_getInObject(mostRecentlyInspectedElement, path), createIsPathAllowed(null, secondaryCategory), path)
                      };
                    } else {
                      return {
                        id,
                        responseID: requestID,
                        type: "no-change"
                      };
                    }
                  }
                } else {
                  currentlyInspectedPaths = {};
                }
                hasElementUpdatedSinceLastInspected = false;
                try {
                  mostRecentlyInspectedElement = inspectElementRaw(id);
                } catch (error) {
                  if (error.name === "ReactDebugToolsRenderError") {
                    var message = "Error rendering inspected element.";
                    var stack;
                    console.error(message + "\n\n", error);
                    if (error.cause != null) {
                      var _fiber4 = findCurrentFiberUsingSlowPathById(id);
                      var componentName = _fiber4 != null ? getDisplayNameForFiber(_fiber4) : null;
                      console.error("React DevTools encountered an error while trying to inspect hooks. This is most likely caused by an error in current inspected component" + (componentName != null ? ': "'.concat(componentName, '".') : ".") + "\nThe error thrown in the component is: \n\n", error.cause);
                      if (error.cause instanceof Error) {
                        message = error.cause.message || message;
                        stack = error.cause.stack;
                      }
                    }
                    return {
                      type: "error",
                      errorType: "user",
                      id,
                      responseID: requestID,
                      message,
                      stack
                    };
                  }
                  if (error.name === "ReactDebugToolsUnsupportedHookError") {
                    return {
                      type: "error",
                      errorType: "unknown-hook",
                      id,
                      responseID: requestID,
                      message: "Unsupported hook in the react-debug-tools package: " + error.message
                    };
                  }
                  console.error("Error inspecting element.\n\n", error);
                  return {
                    type: "error",
                    errorType: "uncaught",
                    id,
                    responseID: requestID,
                    message: error.message,
                    stack: error.stack
                  };
                }
                if (mostRecentlyInspectedElement === null) {
                  return {
                    id,
                    responseID: requestID,
                    type: "not-found"
                  };
                }
                updateSelectedElement(mostRecentlyInspectedElement);
                var cleanedInspectedElement = renderer_objectSpread({}, mostRecentlyInspectedElement);
                cleanedInspectedElement.context = cleanForBridge(cleanedInspectedElement.context, createIsPathAllowed("context", null));
                cleanedInspectedElement.hooks = cleanForBridge(cleanedInspectedElement.hooks, createIsPathAllowed("hooks", "hooks"));
                cleanedInspectedElement.props = cleanForBridge(cleanedInspectedElement.props, createIsPathAllowed("props", null));
                cleanedInspectedElement.state = cleanForBridge(cleanedInspectedElement.state, createIsPathAllowed("state", null));
                return {
                  id,
                  responseID: requestID,
                  type: "full-data",
                  // $FlowFixMe[prop-missing] found when upgrading Flow
                  value: cleanedInspectedElement
                };
              }
              __name(inspectElement, "inspectElement");
              function logElementToConsole(id) {
                var result = isMostRecentlyInspectedElementCurrent(id) ? mostRecentlyInspectedElement : inspectElementRaw(id);
                if (result === null) {
                  console.warn('Could not find Fiber with id "'.concat(id, '"'));
                  return;
                }
                var supportsGroup = typeof console.groupCollapsed === "function";
                if (supportsGroup) {
                  console.groupCollapsed(
                    "[Click to expand] %c<".concat(result.displayName || "Component", " />"),
                    // --dom-tag-name-color is the CSS variable Chrome styles HTML elements with in the console.
                    "color: var(--dom-tag-name-color); font-weight: normal;"
                  );
                }
                if (result.props !== null) {
                  console.log("Props:", result.props);
                }
                if (result.state !== null) {
                  console.log("State:", result.state);
                }
                if (result.hooks !== null) {
                  console.log("Hooks:", result.hooks);
                }
                var nativeNodes = findNativeNodesForFiberID(id);
                if (nativeNodes !== null) {
                  console.log("Nodes:", nativeNodes);
                }
                if (result.source !== null) {
                  console.log("Location:", result.source);
                }
                if (window.chrome || /firefox/i.test(navigator.userAgent)) {
                  console.log("Right-click any value to save it as a global variable for further inspection.");
                }
                if (supportsGroup) {
                  console.groupEnd();
                }
              }
              __name(logElementToConsole, "logElementToConsole");
              function deletePath(type, id, hookID, path) {
                var fiber = findCurrentFiberUsingSlowPathById(id);
                if (fiber !== null) {
                  var instance = fiber.stateNode;
                  switch (type) {
                    case "context":
                      path = path.slice(1);
                      switch (fiber.tag) {
                        case ClassComponent:
                          if (path.length === 0) {
                          } else {
                            deletePathInObject(instance.context, path);
                          }
                          instance.forceUpdate();
                          break;
                        case FunctionComponent:
                          break;
                      }
                      break;
                    case "hooks":
                      if (typeof overrideHookStateDeletePath === "function") {
                        overrideHookStateDeletePath(fiber, hookID, path);
                      }
                      break;
                    case "props":
                      if (instance === null) {
                        if (typeof overridePropsDeletePath === "function") {
                          overridePropsDeletePath(fiber, path);
                        }
                      } else {
                        fiber.pendingProps = copyWithDelete(instance.props, path);
                        instance.forceUpdate();
                      }
                      break;
                    case "state":
                      deletePathInObject(instance.state, path);
                      instance.forceUpdate();
                      break;
                  }
                }
              }
              __name(deletePath, "deletePath");
              function renamePath(type, id, hookID, oldPath, newPath) {
                var fiber = findCurrentFiberUsingSlowPathById(id);
                if (fiber !== null) {
                  var instance = fiber.stateNode;
                  switch (type) {
                    case "context":
                      oldPath = oldPath.slice(1);
                      newPath = newPath.slice(1);
                      switch (fiber.tag) {
                        case ClassComponent:
                          if (oldPath.length === 0) {
                          } else {
                            renamePathInObject(instance.context, oldPath, newPath);
                          }
                          instance.forceUpdate();
                          break;
                        case FunctionComponent:
                          break;
                      }
                      break;
                    case "hooks":
                      if (typeof overrideHookStateRenamePath === "function") {
                        overrideHookStateRenamePath(fiber, hookID, oldPath, newPath);
                      }
                      break;
                    case "props":
                      if (instance === null) {
                        if (typeof overridePropsRenamePath === "function") {
                          overridePropsRenamePath(fiber, oldPath, newPath);
                        }
                      } else {
                        fiber.pendingProps = copyWithRename(instance.props, oldPath, newPath);
                        instance.forceUpdate();
                      }
                      break;
                    case "state":
                      renamePathInObject(instance.state, oldPath, newPath);
                      instance.forceUpdate();
                      break;
                  }
                }
              }
              __name(renamePath, "renamePath");
              function overrideValueAtPath(type, id, hookID, path, value) {
                var fiber = findCurrentFiberUsingSlowPathById(id);
                if (fiber !== null) {
                  var instance = fiber.stateNode;
                  switch (type) {
                    case "context":
                      path = path.slice(1);
                      switch (fiber.tag) {
                        case ClassComponent:
                          if (path.length === 0) {
                            instance.context = value;
                          } else {
                            utils_setInObject(instance.context, path, value);
                          }
                          instance.forceUpdate();
                          break;
                        case FunctionComponent:
                          break;
                      }
                      break;
                    case "hooks":
                      if (typeof overrideHookState === "function") {
                        overrideHookState(fiber, hookID, path, value);
                      }
                      break;
                    case "props":
                      switch (fiber.tag) {
                        case ClassComponent:
                          fiber.pendingProps = copyWithSet(instance.props, path, value);
                          instance.forceUpdate();
                          break;
                        default:
                          if (typeof overrideProps === "function") {
                            overrideProps(fiber, path, value);
                          }
                          break;
                      }
                      break;
                    case "state":
                      switch (fiber.tag) {
                        case ClassComponent:
                          utils_setInObject(instance.state, path, value);
                          instance.forceUpdate();
                          break;
                      }
                      break;
                  }
                }
              }
              __name(overrideValueAtPath, "overrideValueAtPath");
              var currentCommitProfilingMetadata = null;
              var displayNamesByRootID = null;
              var idToContextsMap = null;
              var initialTreeBaseDurationsMap = null;
              var initialIDToRootMap = null;
              var isProfiling = false;
              var profilingStartTime = 0;
              var recordChangeDescriptions = false;
              var rootToCommitProfilingMetadataMap = null;
              function getProfilingData() {
                var dataForRoots = [];
                if (rootToCommitProfilingMetadataMap === null) {
                  throw Error("getProfilingData() called before any profiling data was recorded");
                }
                rootToCommitProfilingMetadataMap.forEach(function(commitProfilingMetadata, rootID) {
                  var commitData = [];
                  var initialTreeBaseDurations = [];
                  var displayName = displayNamesByRootID !== null && displayNamesByRootID.get(rootID) || "Unknown";
                  if (initialTreeBaseDurationsMap != null) {
                    initialTreeBaseDurationsMap.forEach(function(treeBaseDuration, id) {
                      if (initialIDToRootMap != null && initialIDToRootMap.get(id) === rootID) {
                        initialTreeBaseDurations.push([id, treeBaseDuration]);
                      }
                    });
                  }
                  commitProfilingMetadata.forEach(function(commitProfilingData, commitIndex) {
                    var changeDescriptions = commitProfilingData.changeDescriptions, durations = commitProfilingData.durations, effectDuration = commitProfilingData.effectDuration, maxActualDuration = commitProfilingData.maxActualDuration, passiveEffectDuration = commitProfilingData.passiveEffectDuration, priorityLevel = commitProfilingData.priorityLevel, commitTime = commitProfilingData.commitTime, updaters = commitProfilingData.updaters;
                    var fiberActualDurations = [];
                    var fiberSelfDurations = [];
                    for (var i = 0; i < durations.length; i += 3) {
                      var fiberID = durations[i];
                      fiberActualDurations.push([fiberID, durations[i + 1]]);
                      fiberSelfDurations.push([fiberID, durations[i + 2]]);
                    }
                    commitData.push({
                      changeDescriptions: changeDescriptions !== null ? Array.from(changeDescriptions.entries()) : null,
                      duration: maxActualDuration,
                      effectDuration,
                      fiberActualDurations,
                      fiberSelfDurations,
                      passiveEffectDuration,
                      priorityLevel,
                      timestamp: commitTime,
                      updaters
                    });
                  });
                  dataForRoots.push({
                    commitData,
                    displayName,
                    initialTreeBaseDurations,
                    rootID
                  });
                });
                var timelineData = null;
                if (typeof getTimelineData === "function") {
                  var currentTimelineData = getTimelineData();
                  if (currentTimelineData) {
                    var batchUIDToMeasuresMap = currentTimelineData.batchUIDToMeasuresMap, internalModuleSourceToRanges = currentTimelineData.internalModuleSourceToRanges, laneToLabelMap = currentTimelineData.laneToLabelMap, laneToReactMeasureMap = currentTimelineData.laneToReactMeasureMap, rest = _objectWithoutProperties(currentTimelineData, ["batchUIDToMeasuresMap", "internalModuleSourceToRanges", "laneToLabelMap", "laneToReactMeasureMap"]);
                    timelineData = renderer_objectSpread(renderer_objectSpread({}, rest), {}, {
                      // Most of the data is safe to parse as-is,
                      // but we need to convert the nested Arrays back to Maps.
                      // Most of the data is safe to serialize as-is,
                      // but we need to convert the Maps to nested Arrays.
                      batchUIDToMeasuresKeyValueArray: Array.from(batchUIDToMeasuresMap.entries()),
                      internalModuleSourceToRanges: Array.from(internalModuleSourceToRanges.entries()),
                      laneToLabelKeyValueArray: Array.from(laneToLabelMap.entries()),
                      laneToReactMeasureKeyValueArray: Array.from(laneToReactMeasureMap.entries())
                    });
                  }
                }
                return {
                  dataForRoots,
                  rendererID,
                  timelineData
                };
              }
              __name(getProfilingData, "getProfilingData");
              function startProfiling(shouldRecordChangeDescriptions) {
                if (isProfiling) {
                  return;
                }
                recordChangeDescriptions = shouldRecordChangeDescriptions;
                displayNamesByRootID = /* @__PURE__ */ new Map();
                initialTreeBaseDurationsMap = new Map(idToTreeBaseDurationMap);
                initialIDToRootMap = new Map(idToRootMap);
                idToContextsMap = /* @__PURE__ */ new Map();
                hook2.getFiberRoots(rendererID).forEach(function(root) {
                  var rootID = getFiberIDThrows(root.current);
                  displayNamesByRootID.set(rootID, getDisplayNameForRoot(root.current));
                  if (shouldRecordChangeDescriptions) {
                    crawlToInitializeContextsMap(root.current);
                  }
                });
                isProfiling = true;
                profilingStartTime = renderer_getCurrentTime();
                rootToCommitProfilingMetadataMap = /* @__PURE__ */ new Map();
                if (toggleProfilingStatus !== null) {
                  toggleProfilingStatus(true);
                }
              }
              __name(startProfiling, "startProfiling");
              function stopProfiling() {
                isProfiling = false;
                recordChangeDescriptions = false;
                if (toggleProfilingStatus !== null) {
                  toggleProfilingStatus(false);
                }
              }
              __name(stopProfiling, "stopProfiling");
              if (sessionStorageGetItem(SESSION_STORAGE_RELOAD_AND_PROFILE_KEY) === "true") {
                startProfiling(sessionStorageGetItem(SESSION_STORAGE_RECORD_CHANGE_DESCRIPTIONS_KEY) === "true");
              }
              function shouldErrorFiberAlwaysNull() {
                return null;
              }
              __name(shouldErrorFiberAlwaysNull, "shouldErrorFiberAlwaysNull");
              var forceErrorForFiberIDs = /* @__PURE__ */ new Map();
              function shouldErrorFiberAccordingToMap(fiber) {
                if (typeof setErrorHandler !== "function") {
                  throw new Error("Expected overrideError() to not get called for earlier React versions.");
                }
                var id = getFiberIDUnsafe(fiber);
                if (id === null) {
                  return null;
                }
                var status = null;
                if (forceErrorForFiberIDs.has(id)) {
                  status = forceErrorForFiberIDs.get(id);
                  if (status === false) {
                    forceErrorForFiberIDs.delete(id);
                    if (forceErrorForFiberIDs.size === 0) {
                      setErrorHandler(shouldErrorFiberAlwaysNull);
                    }
                  }
                }
                return status;
              }
              __name(shouldErrorFiberAccordingToMap, "shouldErrorFiberAccordingToMap");
              function overrideError(id, forceError) {
                if (typeof setErrorHandler !== "function" || typeof scheduleUpdate !== "function") {
                  throw new Error("Expected overrideError() to not get called for earlier React versions.");
                }
                forceErrorForFiberIDs.set(id, forceError);
                if (forceErrorForFiberIDs.size === 1) {
                  setErrorHandler(shouldErrorFiberAccordingToMap);
                }
                var fiber = idToArbitraryFiberMap.get(id);
                if (fiber != null) {
                  scheduleUpdate(fiber);
                }
              }
              __name(overrideError, "overrideError");
              function shouldSuspendFiberAlwaysFalse() {
                return false;
              }
              __name(shouldSuspendFiberAlwaysFalse, "shouldSuspendFiberAlwaysFalse");
              var forceFallbackForSuspenseIDs = /* @__PURE__ */ new Set();
              function shouldSuspendFiberAccordingToSet(fiber) {
                var maybeID = getFiberIDUnsafe(fiber);
                return maybeID !== null && forceFallbackForSuspenseIDs.has(maybeID);
              }
              __name(shouldSuspendFiberAccordingToSet, "shouldSuspendFiberAccordingToSet");
              function overrideSuspense(id, forceFallback) {
                if (typeof setSuspenseHandler !== "function" || typeof scheduleUpdate !== "function") {
                  throw new Error("Expected overrideSuspense() to not get called for earlier React versions.");
                }
                if (forceFallback) {
                  forceFallbackForSuspenseIDs.add(id);
                  if (forceFallbackForSuspenseIDs.size === 1) {
                    setSuspenseHandler(shouldSuspendFiberAccordingToSet);
                  }
                } else {
                  forceFallbackForSuspenseIDs.delete(id);
                  if (forceFallbackForSuspenseIDs.size === 0) {
                    setSuspenseHandler(shouldSuspendFiberAlwaysFalse);
                  }
                }
                var fiber = idToArbitraryFiberMap.get(id);
                if (fiber != null) {
                  scheduleUpdate(fiber);
                }
              }
              __name(overrideSuspense, "overrideSuspense");
              var trackedPath = null;
              var trackedPathMatchFiber = null;
              var trackedPathMatchDepth = -1;
              var mightBeOnTrackedPath = false;
              function setTrackedPath(path) {
                if (path === null) {
                  trackedPathMatchFiber = null;
                  trackedPathMatchDepth = -1;
                  mightBeOnTrackedPath = false;
                }
                trackedPath = path;
              }
              __name(setTrackedPath, "setTrackedPath");
              function updateTrackedPathStateBeforeMount(fiber) {
                if (trackedPath === null || !mightBeOnTrackedPath) {
                  return false;
                }
                var returnFiber = fiber.return;
                var returnAlternate = returnFiber !== null ? returnFiber.alternate : null;
                if (trackedPathMatchFiber === returnFiber || trackedPathMatchFiber === returnAlternate && returnAlternate !== null) {
                  var actualFrame = getPathFrame(fiber);
                  var expectedFrame = trackedPath[trackedPathMatchDepth + 1];
                  if (expectedFrame === void 0) {
                    throw new Error("Expected to see a frame at the next depth.");
                  }
                  if (actualFrame.index === expectedFrame.index && actualFrame.key === expectedFrame.key && actualFrame.displayName === expectedFrame.displayName) {
                    trackedPathMatchFiber = fiber;
                    trackedPathMatchDepth++;
                    if (trackedPathMatchDepth === trackedPath.length - 1) {
                      mightBeOnTrackedPath = false;
                    } else {
                      mightBeOnTrackedPath = true;
                    }
                    return false;
                  }
                }
                mightBeOnTrackedPath = false;
                return true;
              }
              __name(updateTrackedPathStateBeforeMount, "updateTrackedPathStateBeforeMount");
              function updateTrackedPathStateAfterMount(mightSiblingsBeOnTrackedPath) {
                mightBeOnTrackedPath = mightSiblingsBeOnTrackedPath;
              }
              __name(updateTrackedPathStateAfterMount, "updateTrackedPathStateAfterMount");
              var rootPseudoKeys = /* @__PURE__ */ new Map();
              var rootDisplayNameCounter = /* @__PURE__ */ new Map();
              function setRootPseudoKey(id, fiber) {
                var name = getDisplayNameForRoot(fiber);
                var counter = rootDisplayNameCounter.get(name) || 0;
                rootDisplayNameCounter.set(name, counter + 1);
                var pseudoKey = "".concat(name, ":").concat(counter);
                rootPseudoKeys.set(id, pseudoKey);
              }
              __name(setRootPseudoKey, "setRootPseudoKey");
              function removeRootPseudoKey(id) {
                var pseudoKey = rootPseudoKeys.get(id);
                if (pseudoKey === void 0) {
                  throw new Error("Expected root pseudo key to be known.");
                }
                var name = pseudoKey.slice(0, pseudoKey.lastIndexOf(":"));
                var counter = rootDisplayNameCounter.get(name);
                if (counter === void 0) {
                  throw new Error("Expected counter to be known.");
                }
                if (counter > 1) {
                  rootDisplayNameCounter.set(name, counter - 1);
                } else {
                  rootDisplayNameCounter.delete(name);
                }
                rootPseudoKeys.delete(id);
              }
              __name(removeRootPseudoKey, "removeRootPseudoKey");
              function getDisplayNameForRoot(fiber) {
                var preferredDisplayName = null;
                var fallbackDisplayName = null;
                var child = fiber.child;
                for (var i = 0; i < 3; i++) {
                  if (child === null) {
                    break;
                  }
                  var displayName = getDisplayNameForFiber(child);
                  if (displayName !== null) {
                    if (typeof child.type === "function") {
                      preferredDisplayName = displayName;
                    } else if (fallbackDisplayName === null) {
                      fallbackDisplayName = displayName;
                    }
                  }
                  if (preferredDisplayName !== null) {
                    break;
                  }
                  child = child.child;
                }
                return preferredDisplayName || fallbackDisplayName || "Anonymous";
              }
              __name(getDisplayNameForRoot, "getDisplayNameForRoot");
              function getPathFrame(fiber) {
                var key = fiber.key;
                var displayName = getDisplayNameForFiber(fiber);
                var index = fiber.index;
                switch (fiber.tag) {
                  case HostRoot:
                    var id = getFiberIDThrows(fiber);
                    var pseudoKey = rootPseudoKeys.get(id);
                    if (pseudoKey === void 0) {
                      throw new Error("Expected mounted root to have known pseudo key.");
                    }
                    displayName = pseudoKey;
                    break;
                  case HostComponent:
                    displayName = fiber.type;
                    break;
                  default:
                    break;
                }
                return {
                  displayName,
                  key,
                  index
                };
              }
              __name(getPathFrame, "getPathFrame");
              function getPathForElement(id) {
                var fiber = idToArbitraryFiberMap.get(id);
                if (fiber == null) {
                  return null;
                }
                var keyPath = [];
                while (fiber !== null) {
                  keyPath.push(getPathFrame(fiber));
                  fiber = fiber.return;
                }
                keyPath.reverse();
                return keyPath;
              }
              __name(getPathForElement, "getPathForElement");
              function getBestMatchForTrackedPath() {
                if (trackedPath === null) {
                  return null;
                }
                if (trackedPathMatchFiber === null) {
                  return null;
                }
                var fiber = trackedPathMatchFiber;
                while (fiber !== null && shouldFilterFiber(fiber)) {
                  fiber = fiber.return;
                }
                if (fiber === null) {
                  return null;
                }
                return {
                  id: getFiberIDThrows(fiber),
                  // $FlowFixMe[incompatible-use] found when upgrading Flow
                  isFullMatch: trackedPathMatchDepth === trackedPath.length - 1
                };
              }
              __name(getBestMatchForTrackedPath, "getBestMatchForTrackedPath");
              var formatPriorityLevel = /* @__PURE__ */ __name(function formatPriorityLevel2(priorityLevel) {
                if (priorityLevel == null) {
                  return "Unknown";
                }
                switch (priorityLevel) {
                  case ImmediatePriority:
                    return "Immediate";
                  case UserBlockingPriority:
                    return "User-Blocking";
                  case NormalPriority:
                    return "Normal";
                  case LowPriority:
                    return "Low";
                  case IdlePriority:
                    return "Idle";
                  case NoPriority:
                  default:
                    return "Unknown";
                }
              }, "formatPriorityLevel");
              function setTraceUpdatesEnabled(isEnabled2) {
                traceUpdatesEnabled = isEnabled2;
              }
              __name(setTraceUpdatesEnabled, "setTraceUpdatesEnabled");
              function hasFiberWithId(id) {
                return idToArbitraryFiberMap.has(id);
              }
              __name(hasFiberWithId, "hasFiberWithId");
              return {
                cleanup,
                clearErrorsAndWarnings,
                clearErrorsForFiberID,
                clearWarningsForFiberID,
                getSerializedElementValueByPath,
                deletePath,
                findNativeNodesForFiberID,
                flushInitialOperations,
                getBestMatchForTrackedPath,
                getDisplayNameForFiberID,
                getFiberForNative,
                getFiberIDForNative,
                getInstanceAndStyle,
                getOwnersList,
                getPathForElement,
                getProfilingData,
                handleCommitFiberRoot,
                handleCommitFiberUnmount,
                handlePostCommitFiberRoot,
                hasFiberWithId,
                inspectElement,
                logElementToConsole,
                patchConsoleForStrictMode: patchForStrictMode,
                prepareViewAttributeSource,
                prepareViewElementSource,
                overrideError,
                overrideSuspense,
                overrideValueAtPath,
                renamePath,
                renderer,
                setTraceUpdatesEnabled,
                setTrackedPath,
                startProfiling,
                stopProfiling,
                storeAsGlobal,
                unpatchConsoleForStrictMode: unpatchForStrictMode,
                updateComponentFilters
              };
            }
            __name(attach, "attach");
            ;
            function console_toConsumableArray(arr) {
              return console_arrayWithoutHoles(arr) || console_iterableToArray(arr) || console_unsupportedIterableToArray(arr) || console_nonIterableSpread();
            }
            __name(console_toConsumableArray, "console_toConsumableArray");
            function console_nonIterableSpread() {
              throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
            }
            __name(console_nonIterableSpread, "console_nonIterableSpread");
            function console_iterableToArray(iter) {
              if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
            }
            __name(console_iterableToArray, "console_iterableToArray");
            function console_arrayWithoutHoles(arr) {
              if (Array.isArray(arr)) return console_arrayLikeToArray(arr);
            }
            __name(console_arrayWithoutHoles, "console_arrayWithoutHoles");
            function console_createForOfIteratorHelper(o, allowArrayLike) {
              var it;
              if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
                if (Array.isArray(o) || (it = console_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
                  if (it) o = it;
                  var i = 0;
                  var F = /* @__PURE__ */ __name(function F2() {
                  }, "F");
                  return { s: F, n: /* @__PURE__ */ __name(function n() {
                    if (i >= o.length) return { done: true };
                    return { done: false, value: o[i++] };
                  }, "n"), e: /* @__PURE__ */ __name(function e(_e) {
                    throw _e;
                  }, "e"), f: F };
                }
                throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
              }
              var normalCompletion = true, didErr = false, err;
              return { s: /* @__PURE__ */ __name(function s() {
                it = o[Symbol.iterator]();
              }, "s"), n: /* @__PURE__ */ __name(function n() {
                var step = it.next();
                normalCompletion = step.done;
                return step;
              }, "n"), e: /* @__PURE__ */ __name(function e(_e2) {
                didErr = true;
                err = _e2;
              }, "e"), f: /* @__PURE__ */ __name(function f() {
                try {
                  if (!normalCompletion && it.return != null) it.return();
                } finally {
                  if (didErr) throw err;
                }
              }, "f") };
            }
            __name(console_createForOfIteratorHelper, "console_createForOfIteratorHelper");
            function console_unsupportedIterableToArray(o, minLen) {
              if (!o) return;
              if (typeof o === "string") return console_arrayLikeToArray(o, minLen);
              var n = Object.prototype.toString.call(o).slice(8, -1);
              if (n === "Object" && o.constructor) n = o.constructor.name;
              if (n === "Map" || n === "Set") return Array.from(o);
              if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return console_arrayLikeToArray(o, minLen);
            }
            __name(console_unsupportedIterableToArray, "console_unsupportedIterableToArray");
            function console_arrayLikeToArray(arr, len) {
              if (len == null || len > arr.length) len = arr.length;
              for (var i = 0, arr2 = new Array(len); i < len; i++) {
                arr2[i] = arr[i];
              }
              return arr2;
            }
            __name(console_arrayLikeToArray, "console_arrayLikeToArray");
            var OVERRIDE_CONSOLE_METHODS = ["error", "trace", "warn"];
            var DIMMED_NODE_CONSOLE_COLOR = "\x1B[2m%s\x1B[0m";
            var PREFIX_REGEX = /\s{4}(in|at)\s{1}/;
            var ROW_COLUMN_NUMBER_REGEX = /:\d+:\d+(\n|$)/;
            function isStringComponentStack(text) {
              return PREFIX_REGEX.test(text) || ROW_COLUMN_NUMBER_REGEX.test(text);
            }
            __name(isStringComponentStack, "isStringComponentStack");
            var STYLE_DIRECTIVE_REGEX = /^%c/;
            function isStrictModeOverride(args, method2) {
              return args.length >= 2 && STYLE_DIRECTIVE_REGEX.test(args[0]) && args[1] === "color: ".concat(getConsoleColor(method2) || "");
            }
            __name(isStrictModeOverride, "isStrictModeOverride");
            function getConsoleColor(method2) {
              switch (method2) {
                case "warn":
                  return consoleSettingsRef.browserTheme === "light" ? "rgba(250, 180, 50, 0.75)" : "rgba(250, 180, 50, 0.5)";
                case "error":
                  return consoleSettingsRef.browserTheme === "light" ? "rgba(250, 123, 130, 0.75)" : "rgba(250, 123, 130, 0.5)";
                case "log":
                default:
                  return consoleSettingsRef.browserTheme === "light" ? "rgba(125, 125, 125, 0.75)" : "rgba(125, 125, 125, 0.5)";
              }
            }
            __name(getConsoleColor, "getConsoleColor");
            var injectedRenderers = /* @__PURE__ */ new Map();
            var targetConsole = console;
            var targetConsoleMethods = {};
            for (var method in console) {
              targetConsoleMethods[method] = console[method];
            }
            var unpatchFn = null;
            var isNode = false;
            try {
              isNode = void 0 === global;
            } catch (error) {
            }
            function dangerous_setTargetConsoleForTesting(targetConsoleForTesting) {
              targetConsole = targetConsoleForTesting;
              targetConsoleMethods = {};
              for (var _method in targetConsole) {
                targetConsoleMethods[_method] = console[_method];
              }
            }
            __name(dangerous_setTargetConsoleForTesting, "dangerous_setTargetConsoleForTesting");
            function registerRenderer(renderer, onErrorOrWarning) {
              var currentDispatcherRef = renderer.currentDispatcherRef, getCurrentFiber = renderer.getCurrentFiber, findFiberByHostInstance = renderer.findFiberByHostInstance, version = renderer.version;
              if (typeof findFiberByHostInstance !== "function") {
                return;
              }
              if (currentDispatcherRef != null && typeof getCurrentFiber === "function") {
                var _getInternalReactCons = getInternalReactConstants(version), ReactTypeOfWork = _getInternalReactCons.ReactTypeOfWork;
                injectedRenderers.set(renderer, {
                  currentDispatcherRef,
                  getCurrentFiber,
                  workTagMap: ReactTypeOfWork,
                  onErrorOrWarning
                });
              }
            }
            __name(registerRenderer, "registerRenderer");
            var consoleSettingsRef = {
              appendComponentStack: false,
              breakOnConsoleErrors: false,
              showInlineWarningsAndErrors: false,
              hideConsoleLogsInStrictMode: false,
              browserTheme: "dark"
            };
            function patch(_ref) {
              var appendComponentStack = _ref.appendComponentStack, breakOnConsoleErrors = _ref.breakOnConsoleErrors, showInlineWarningsAndErrors = _ref.showInlineWarningsAndErrors, hideConsoleLogsInStrictMode = _ref.hideConsoleLogsInStrictMode, browserTheme = _ref.browserTheme;
              consoleSettingsRef.appendComponentStack = appendComponentStack;
              consoleSettingsRef.breakOnConsoleErrors = breakOnConsoleErrors;
              consoleSettingsRef.showInlineWarningsAndErrors = showInlineWarningsAndErrors;
              consoleSettingsRef.hideConsoleLogsInStrictMode = hideConsoleLogsInStrictMode;
              consoleSettingsRef.browserTheme = browserTheme;
              if (appendComponentStack || breakOnConsoleErrors || showInlineWarningsAndErrors) {
                if (unpatchFn !== null) {
                  return;
                }
                var originalConsoleMethods = {};
                unpatchFn = /* @__PURE__ */ __name(function unpatchFn2() {
                  for (var _method2 in originalConsoleMethods) {
                    try {
                      targetConsole[_method2] = originalConsoleMethods[_method2];
                    } catch (error) {
                    }
                  }
                }, "unpatchFn");
                OVERRIDE_CONSOLE_METHODS.forEach(function(method2) {
                  try {
                    var originalMethod = originalConsoleMethods[method2] = targetConsole[method2].__REACT_DEVTOOLS_ORIGINAL_METHOD__ ? targetConsole[method2].__REACT_DEVTOOLS_ORIGINAL_METHOD__ : targetConsole[method2];
                    var overrideMethod = /* @__PURE__ */ __name(function overrideMethod2() {
                      var shouldAppendWarningStack = false;
                      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                        args[_key] = arguments[_key];
                      }
                      if (method2 !== "log") {
                        if (consoleSettingsRef.appendComponentStack) {
                          var lastArg = args.length > 0 ? args[args.length - 1] : null;
                          var alreadyHasComponentStack = typeof lastArg === "string" && isStringComponentStack(lastArg);
                          shouldAppendWarningStack = !alreadyHasComponentStack;
                        }
                      }
                      var shouldShowInlineWarningsAndErrors = consoleSettingsRef.showInlineWarningsAndErrors && (method2 === "error" || method2 === "warn");
                      var _iterator = console_createForOfIteratorHelper(injectedRenderers.values()), _step;
                      try {
                        for (_iterator.s(); !(_step = _iterator.n()).done; ) {
                          var _step$value = _step.value, currentDispatcherRef = _step$value.currentDispatcherRef, getCurrentFiber = _step$value.getCurrentFiber, onErrorOrWarning = _step$value.onErrorOrWarning, workTagMap = _step$value.workTagMap;
                          var current = getCurrentFiber();
                          if (current != null) {
                            try {
                              if (shouldShowInlineWarningsAndErrors) {
                                if (typeof onErrorOrWarning === "function") {
                                  onErrorOrWarning(
                                    current,
                                    method2,
                                    // Copy args before we mutate them (e.g. adding the component stack)
                                    args.slice()
                                  );
                                }
                              }
                              if (shouldAppendWarningStack) {
                                var componentStack = getStackByFiberInDevAndProd(workTagMap, current, currentDispatcherRef);
                                if (componentStack !== "") {
                                  if (isStrictModeOverride(args, method2)) {
                                    args[0] = "".concat(args[0], " %s");
                                    args.push(componentStack);
                                  } else {
                                    args.push(componentStack);
                                  }
                                }
                              }
                            } catch (error) {
                              setTimeout(function() {
                                throw error;
                              }, 0);
                            } finally {
                              break;
                            }
                          }
                        }
                      } catch (err) {
                        _iterator.e(err);
                      } finally {
                        _iterator.f();
                      }
                      if (consoleSettingsRef.breakOnConsoleErrors) {
                        debugger;
                      }
                      originalMethod.apply(void 0, args);
                    }, "overrideMethod");
                    overrideMethod.__REACT_DEVTOOLS_ORIGINAL_METHOD__ = originalMethod;
                    originalMethod.__REACT_DEVTOOLS_OVERRIDE_METHOD__ = overrideMethod;
                    targetConsole[method2] = overrideMethod;
                  } catch (error) {
                  }
                });
              } else {
                unpatch();
              }
            }
            __name(patch, "patch");
            function unpatch() {
              if (unpatchFn !== null) {
                unpatchFn();
                unpatchFn = null;
              }
            }
            __name(unpatch, "unpatch");
            var unpatchForStrictModeFn = null;
            function patchForStrictMode() {
              if (consoleManagedByDevToolsDuringStrictMode) {
                var overrideConsoleMethods = ["error", "group", "groupCollapsed", "info", "log", "trace", "warn"];
                if (unpatchForStrictModeFn !== null) {
                  return;
                }
                var originalConsoleMethods = {};
                unpatchForStrictModeFn = /* @__PURE__ */ __name(function unpatchForStrictModeFn2() {
                  for (var _method3 in originalConsoleMethods) {
                    try {
                      targetConsole[_method3] = originalConsoleMethods[_method3];
                    } catch (error) {
                    }
                  }
                }, "unpatchForStrictModeFn");
                overrideConsoleMethods.forEach(function(method2) {
                  try {
                    var originalMethod = originalConsoleMethods[method2] = targetConsole[method2].__REACT_DEVTOOLS_STRICT_MODE_ORIGINAL_METHOD__ ? targetConsole[method2].__REACT_DEVTOOLS_STRICT_MODE_ORIGINAL_METHOD__ : targetConsole[method2];
                    var overrideMethod = /* @__PURE__ */ __name(function overrideMethod2() {
                      if (!consoleSettingsRef.hideConsoleLogsInStrictMode) {
                        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                          args[_key2] = arguments[_key2];
                        }
                        if (isNode) {
                          originalMethod(DIMMED_NODE_CONSOLE_COLOR, format.apply(void 0, args));
                        } else {
                          var color = getConsoleColor(method2);
                          if (color) {
                            originalMethod.apply(void 0, console_toConsumableArray(formatWithStyles(args, "color: ".concat(color))));
                          } else {
                            throw Error("Console color is not defined");
                          }
                        }
                      }
                    }, "overrideMethod");
                    overrideMethod.__REACT_DEVTOOLS_STRICT_MODE_ORIGINAL_METHOD__ = originalMethod;
                    originalMethod.__REACT_DEVTOOLS_STRICT_MODE_OVERRIDE_METHOD__ = overrideMethod;
                    targetConsole[method2] = overrideMethod;
                  } catch (error) {
                  }
                });
              }
            }
            __name(patchForStrictMode, "patchForStrictMode");
            function unpatchForStrictMode() {
              if (consoleManagedByDevToolsDuringStrictMode) {
                if (unpatchForStrictModeFn !== null) {
                  unpatchForStrictModeFn();
                  unpatchForStrictModeFn = null;
                }
              }
            }
            __name(unpatchForStrictMode, "unpatchForStrictMode");
            function patchConsoleUsingWindowValues() {
              var _castBool, _castBool2, _castBool3, _castBool4, _castBrowserTheme;
              var appendComponentStack = (_castBool = castBool(window.__REACT_DEVTOOLS_APPEND_COMPONENT_STACK__)) !== null && _castBool !== void 0 ? _castBool : true;
              var breakOnConsoleErrors = (_castBool2 = castBool(window.__REACT_DEVTOOLS_BREAK_ON_CONSOLE_ERRORS__)) !== null && _castBool2 !== void 0 ? _castBool2 : false;
              var showInlineWarningsAndErrors = (_castBool3 = castBool(window.__REACT_DEVTOOLS_SHOW_INLINE_WARNINGS_AND_ERRORS__)) !== null && _castBool3 !== void 0 ? _castBool3 : true;
              var hideConsoleLogsInStrictMode = (_castBool4 = castBool(window.__REACT_DEVTOOLS_HIDE_CONSOLE_LOGS_IN_STRICT_MODE__)) !== null && _castBool4 !== void 0 ? _castBool4 : false;
              var browserTheme = (_castBrowserTheme = castBrowserTheme(window.__REACT_DEVTOOLS_BROWSER_THEME__)) !== null && _castBrowserTheme !== void 0 ? _castBrowserTheme : "dark";
              patch({
                appendComponentStack,
                breakOnConsoleErrors,
                showInlineWarningsAndErrors,
                hideConsoleLogsInStrictMode,
                browserTheme
              });
            }
            __name(patchConsoleUsingWindowValues, "patchConsoleUsingWindowValues");
            function writeConsolePatchSettingsToWindow(settings) {
              window.__REACT_DEVTOOLS_APPEND_COMPONENT_STACK__ = settings.appendComponentStack;
              window.__REACT_DEVTOOLS_BREAK_ON_CONSOLE_ERRORS__ = settings.breakOnConsoleErrors;
              window.__REACT_DEVTOOLS_SHOW_INLINE_WARNINGS_AND_ERRORS__ = settings.showInlineWarningsAndErrors;
              window.__REACT_DEVTOOLS_HIDE_CONSOLE_LOGS_IN_STRICT_MODE__ = settings.hideConsoleLogsInStrictMode;
              window.__REACT_DEVTOOLS_BROWSER_THEME__ = settings.browserTheme;
            }
            __name(writeConsolePatchSettingsToWindow, "writeConsolePatchSettingsToWindow");
            function installConsoleFunctionsToWindow() {
              window.__REACT_DEVTOOLS_CONSOLE_FUNCTIONS__ = {
                patchConsoleUsingWindowValues,
                registerRendererWithConsole: registerRenderer
              };
            }
            __name(installConsoleFunctionsToWindow, "installConsoleFunctionsToWindow");
            ;
            function bridge_typeof(obj) {
              "@babel/helpers - typeof";
              if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                bridge_typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                  return typeof obj2;
                }, "_typeof");
              } else {
                bridge_typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                  return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                }, "_typeof");
              }
              return bridge_typeof(obj);
            }
            __name(bridge_typeof, "bridge_typeof");
            function bridge_toConsumableArray(arr) {
              return bridge_arrayWithoutHoles(arr) || bridge_iterableToArray(arr) || bridge_unsupportedIterableToArray(arr) || bridge_nonIterableSpread();
            }
            __name(bridge_toConsumableArray, "bridge_toConsumableArray");
            function bridge_nonIterableSpread() {
              throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
            }
            __name(bridge_nonIterableSpread, "bridge_nonIterableSpread");
            function bridge_unsupportedIterableToArray(o, minLen) {
              if (!o) return;
              if (typeof o === "string") return bridge_arrayLikeToArray(o, minLen);
              var n = Object.prototype.toString.call(o).slice(8, -1);
              if (n === "Object" && o.constructor) n = o.constructor.name;
              if (n === "Map" || n === "Set") return Array.from(o);
              if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return bridge_arrayLikeToArray(o, minLen);
            }
            __name(bridge_unsupportedIterableToArray, "bridge_unsupportedIterableToArray");
            function bridge_iterableToArray(iter) {
              if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
            }
            __name(bridge_iterableToArray, "bridge_iterableToArray");
            function bridge_arrayWithoutHoles(arr) {
              if (Array.isArray(arr)) return bridge_arrayLikeToArray(arr);
            }
            __name(bridge_arrayWithoutHoles, "bridge_arrayWithoutHoles");
            function bridge_arrayLikeToArray(arr, len) {
              if (len == null || len > arr.length) len = arr.length;
              for (var i = 0, arr2 = new Array(len); i < len; i++) {
                arr2[i] = arr[i];
              }
              return arr2;
            }
            __name(bridge_arrayLikeToArray, "bridge_arrayLikeToArray");
            function bridge_classCallCheck(instance, Constructor) {
              if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
              }
            }
            __name(bridge_classCallCheck, "bridge_classCallCheck");
            function bridge_defineProperties(target, props) {
              for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
              }
            }
            __name(bridge_defineProperties, "bridge_defineProperties");
            function bridge_createClass(Constructor, protoProps, staticProps) {
              if (protoProps) bridge_defineProperties(Constructor.prototype, protoProps);
              if (staticProps) bridge_defineProperties(Constructor, staticProps);
              return Constructor;
            }
            __name(bridge_createClass, "bridge_createClass");
            function _inherits(subClass, superClass) {
              if (typeof superClass !== "function" && superClass !== null) {
                throw new TypeError("Super expression must either be null or a function");
              }
              subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
              if (superClass) _setPrototypeOf(subClass, superClass);
            }
            __name(_inherits, "_inherits");
            function _setPrototypeOf(o, p) {
              _setPrototypeOf = Object.setPrototypeOf || /* @__PURE__ */ __name(function _setPrototypeOf2(o2, p2) {
                o2.__proto__ = p2;
                return o2;
              }, "_setPrototypeOf");
              return _setPrototypeOf(o, p);
            }
            __name(_setPrototypeOf, "_setPrototypeOf");
            function _createSuper(Derived) {
              var hasNativeReflectConstruct = _isNativeReflectConstruct();
              return /* @__PURE__ */ __name(function _createSuperInternal() {
                var Super = _getPrototypeOf(Derived), result;
                if (hasNativeReflectConstruct) {
                  var NewTarget = _getPrototypeOf(this).constructor;
                  result = Reflect.construct(Super, arguments, NewTarget);
                } else {
                  result = Super.apply(this, arguments);
                }
                return _possibleConstructorReturn(this, result);
              }, "_createSuperInternal");
            }
            __name(_createSuper, "_createSuper");
            function _possibleConstructorReturn(self2, call) {
              if (call && (bridge_typeof(call) === "object" || typeof call === "function")) {
                return call;
              }
              return _assertThisInitialized(self2);
            }
            __name(_possibleConstructorReturn, "_possibleConstructorReturn");
            function _assertThisInitialized(self2) {
              if (self2 === void 0) {
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
              }
              return self2;
            }
            __name(_assertThisInitialized, "_assertThisInitialized");
            function _isNativeReflectConstruct() {
              if (typeof Reflect === "undefined" || !Reflect.construct) return false;
              if (Reflect.construct.sham) return false;
              if (typeof Proxy === "function") return true;
              try {
                Date.prototype.toString.call(Reflect.construct(Date, [], function() {
                }));
                return true;
              } catch (e) {
                return false;
              }
            }
            __name(_isNativeReflectConstruct, "_isNativeReflectConstruct");
            function _getPrototypeOf(o) {
              _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : /* @__PURE__ */ __name(function _getPrototypeOf2(o2) {
                return o2.__proto__ || Object.getPrototypeOf(o2);
              }, "_getPrototypeOf");
              return _getPrototypeOf(o);
            }
            __name(_getPrototypeOf, "_getPrototypeOf");
            function bridge_defineProperty(obj, key, value) {
              if (key in obj) {
                Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
              } else {
                obj[key] = value;
              }
              return obj;
            }
            __name(bridge_defineProperty, "bridge_defineProperty");
            var BATCH_DURATION = 100;
            var BRIDGE_PROTOCOL = [
              // This version technically never existed,
              // but a backwards breaking change was added in 4.11,
              // so the safest guess to downgrade the frontend would be to version 4.10.
              {
                version: 0,
                minNpmVersion: '"<4.11.0"',
                maxNpmVersion: '"<4.11.0"'
              },
              // Versions 4.11.x – 4.12.x contained the backwards breaking change,
              // but we didn't add the "fix" of checking the protocol version until 4.13,
              // so we don't recommend downgrading to 4.11 or 4.12.
              {
                version: 1,
                minNpmVersion: "4.13.0",
                maxNpmVersion: "4.21.0"
              },
              // Version 2 adds a StrictMode-enabled and supports-StrictMode bits to add-root operation.
              {
                version: 2,
                minNpmVersion: "4.22.0",
                maxNpmVersion: null
              }
            ];
            var currentBridgeProtocol = BRIDGE_PROTOCOL[BRIDGE_PROTOCOL.length - 1];
            var Bridge = /* @__PURE__ */ function(_EventEmitter) {
              _inherits(Bridge2, _EventEmitter);
              var _super = _createSuper(Bridge2);
              function Bridge2(wall) {
                var _this;
                bridge_classCallCheck(this, Bridge2);
                _this = _super.call(this);
                bridge_defineProperty(_assertThisInitialized(_this), "_isShutdown", false);
                bridge_defineProperty(_assertThisInitialized(_this), "_messageQueue", []);
                bridge_defineProperty(_assertThisInitialized(_this), "_timeoutID", null);
                bridge_defineProperty(_assertThisInitialized(_this), "_wallUnlisten", null);
                bridge_defineProperty(_assertThisInitialized(_this), "_flush", function() {
                  if (_this._timeoutID !== null) {
                    clearTimeout(_this._timeoutID);
                    _this._timeoutID = null;
                  }
                  if (_this._messageQueue.length) {
                    for (var i = 0; i < _this._messageQueue.length; i += 2) {
                      var _this$_wall;
                      (_this$_wall = _this._wall).send.apply(_this$_wall, [_this._messageQueue[i]].concat(bridge_toConsumableArray(_this._messageQueue[i + 1])));
                    }
                    _this._messageQueue.length = 0;
                    _this._timeoutID = setTimeout(_this._flush, BATCH_DURATION);
                  }
                });
                bridge_defineProperty(_assertThisInitialized(_this), "overrideValueAtPath", function(_ref) {
                  var id = _ref.id, path = _ref.path, rendererID = _ref.rendererID, type = _ref.type, value = _ref.value;
                  switch (type) {
                    case "context":
                      _this.send("overrideContext", {
                        id,
                        path,
                        rendererID,
                        wasForwarded: true,
                        value
                      });
                      break;
                    case "hooks":
                      _this.send("overrideHookState", {
                        id,
                        path,
                        rendererID,
                        wasForwarded: true,
                        value
                      });
                      break;
                    case "props":
                      _this.send("overrideProps", {
                        id,
                        path,
                        rendererID,
                        wasForwarded: true,
                        value
                      });
                      break;
                    case "state":
                      _this.send("overrideState", {
                        id,
                        path,
                        rendererID,
                        wasForwarded: true,
                        value
                      });
                      break;
                  }
                });
                _this._wall = wall;
                _this._wallUnlisten = wall.listen(function(message) {
                  if (message && message.event) {
                    _assertThisInitialized(_this).emit(message.event, message.payload);
                  }
                }) || null;
                _this.addListener("overrideValueAtPath", _this.overrideValueAtPath);
                return _this;
              }
              __name(Bridge2, "Bridge");
              bridge_createClass(Bridge2, [{
                key: "send",
                value: /* @__PURE__ */ __name(function send(event) {
                  if (this._isShutdown) {
                    console.warn('Cannot send message "'.concat(event, '" through a Bridge that has been shutdown.'));
                    return;
                  }
                  for (var _len = arguments.length, payload = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    payload[_key - 1] = arguments[_key];
                  }
                  this._messageQueue.push(event, payload);
                  if (!this._timeoutID) {
                    this._timeoutID = setTimeout(this._flush, 0);
                  }
                }, "send")
              }, {
                key: "shutdown",
                value: /* @__PURE__ */ __name(function shutdown() {
                  if (this._isShutdown) {
                    console.warn("Bridge was already shutdown.");
                    return;
                  }
                  this.emit("shutdown");
                  this.send("shutdown");
                  this._isShutdown = true;
                  this.addListener = function() {
                  };
                  this.emit = function() {
                  };
                  this.removeAllListeners();
                  var wallUnlisten = this._wallUnlisten;
                  if (wallUnlisten) {
                    wallUnlisten();
                  }
                  do {
                    this._flush();
                  } while (this._messageQueue.length);
                  if (this._timeoutID !== null) {
                    clearTimeout(this._timeoutID);
                    this._timeoutID = null;
                  }
                }, "shutdown")
              }, {
                key: "wall",
                get: /* @__PURE__ */ __name(function get() {
                  return this._wall;
                }, "get")
              }]);
              return Bridge2;
            }(EventEmitter);
            const src_bridge = Bridge;
            ;
            function agent_typeof(obj) {
              "@babel/helpers - typeof";
              if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                agent_typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                  return typeof obj2;
                }, "_typeof");
              } else {
                agent_typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                  return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                }, "_typeof");
              }
              return agent_typeof(obj);
            }
            __name(agent_typeof, "agent_typeof");
            function agent_classCallCheck(instance, Constructor) {
              if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
              }
            }
            __name(agent_classCallCheck, "agent_classCallCheck");
            function agent_defineProperties(target, props) {
              for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
              }
            }
            __name(agent_defineProperties, "agent_defineProperties");
            function agent_createClass(Constructor, protoProps, staticProps) {
              if (protoProps) agent_defineProperties(Constructor.prototype, protoProps);
              if (staticProps) agent_defineProperties(Constructor, staticProps);
              return Constructor;
            }
            __name(agent_createClass, "agent_createClass");
            function agent_inherits(subClass, superClass) {
              if (typeof superClass !== "function" && superClass !== null) {
                throw new TypeError("Super expression must either be null or a function");
              }
              subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
              if (superClass) agent_setPrototypeOf(subClass, superClass);
            }
            __name(agent_inherits, "agent_inherits");
            function agent_setPrototypeOf(o, p) {
              agent_setPrototypeOf = Object.setPrototypeOf || /* @__PURE__ */ __name(function _setPrototypeOf2(o2, p2) {
                o2.__proto__ = p2;
                return o2;
              }, "_setPrototypeOf");
              return agent_setPrototypeOf(o, p);
            }
            __name(agent_setPrototypeOf, "agent_setPrototypeOf");
            function agent_createSuper(Derived) {
              var hasNativeReflectConstruct = agent_isNativeReflectConstruct();
              return /* @__PURE__ */ __name(function _createSuperInternal() {
                var Super = agent_getPrototypeOf(Derived), result;
                if (hasNativeReflectConstruct) {
                  var NewTarget = agent_getPrototypeOf(this).constructor;
                  result = Reflect.construct(Super, arguments, NewTarget);
                } else {
                  result = Super.apply(this, arguments);
                }
                return agent_possibleConstructorReturn(this, result);
              }, "_createSuperInternal");
            }
            __name(agent_createSuper, "agent_createSuper");
            function agent_possibleConstructorReturn(self2, call) {
              if (call && (agent_typeof(call) === "object" || typeof call === "function")) {
                return call;
              }
              return agent_assertThisInitialized(self2);
            }
            __name(agent_possibleConstructorReturn, "agent_possibleConstructorReturn");
            function agent_assertThisInitialized(self2) {
              if (self2 === void 0) {
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
              }
              return self2;
            }
            __name(agent_assertThisInitialized, "agent_assertThisInitialized");
            function agent_isNativeReflectConstruct() {
              if (typeof Reflect === "undefined" || !Reflect.construct) return false;
              if (Reflect.construct.sham) return false;
              if (typeof Proxy === "function") return true;
              try {
                Date.prototype.toString.call(Reflect.construct(Date, [], function() {
                }));
                return true;
              } catch (e) {
                return false;
              }
            }
            __name(agent_isNativeReflectConstruct, "agent_isNativeReflectConstruct");
            function agent_getPrototypeOf(o) {
              agent_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : /* @__PURE__ */ __name(function _getPrototypeOf2(o2) {
                return o2.__proto__ || Object.getPrototypeOf(o2);
              }, "_getPrototypeOf");
              return agent_getPrototypeOf(o);
            }
            __name(agent_getPrototypeOf, "agent_getPrototypeOf");
            function agent_defineProperty(obj, key, value) {
              if (key in obj) {
                Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
              } else {
                obj[key] = value;
              }
              return obj;
            }
            __name(agent_defineProperty, "agent_defineProperty");
            var debug = /* @__PURE__ */ __name(function debug2(methodName) {
              if (__DEBUG__) {
                var _console;
                for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                  args[_key - 1] = arguments[_key];
                }
                (_console = console).log.apply(_console, ["%cAgent %c".concat(methodName), "color: purple; font-weight: bold;", "font-weight: bold;"].concat(args));
              }
            }, "debug");
            var Agent = /* @__PURE__ */ function(_EventEmitter) {
              agent_inherits(Agent2, _EventEmitter);
              var _super = agent_createSuper(Agent2);
              function Agent2(bridge) {
                var _this;
                agent_classCallCheck(this, Agent2);
                _this = _super.call(this);
                agent_defineProperty(agent_assertThisInitialized(_this), "_isProfiling", false);
                agent_defineProperty(agent_assertThisInitialized(_this), "_recordChangeDescriptions", false);
                agent_defineProperty(agent_assertThisInitialized(_this), "_rendererInterfaces", {});
                agent_defineProperty(agent_assertThisInitialized(_this), "_persistedSelection", null);
                agent_defineProperty(agent_assertThisInitialized(_this), "_persistedSelectionMatch", null);
                agent_defineProperty(agent_assertThisInitialized(_this), "_traceUpdatesEnabled", false);
                agent_defineProperty(agent_assertThisInitialized(_this), "clearErrorsAndWarnings", function(_ref) {
                  var rendererID = _ref.rendererID;
                  var renderer = _this._rendererInterfaces[rendererID];
                  if (renderer == null) {
                    console.warn('Invalid renderer id "'.concat(rendererID, '"'));
                  } else {
                    renderer.clearErrorsAndWarnings();
                  }
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "clearErrorsForFiberID", function(_ref2) {
                  var id = _ref2.id, rendererID = _ref2.rendererID;
                  var renderer = _this._rendererInterfaces[rendererID];
                  if (renderer == null) {
                    console.warn('Invalid renderer id "'.concat(rendererID, '"'));
                  } else {
                    renderer.clearErrorsForFiberID(id);
                  }
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "clearWarningsForFiberID", function(_ref3) {
                  var id = _ref3.id, rendererID = _ref3.rendererID;
                  var renderer = _this._rendererInterfaces[rendererID];
                  if (renderer == null) {
                    console.warn('Invalid renderer id "'.concat(rendererID, '"'));
                  } else {
                    renderer.clearWarningsForFiberID(id);
                  }
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "copyElementPath", function(_ref4) {
                  var id = _ref4.id, path = _ref4.path, rendererID = _ref4.rendererID;
                  var renderer = _this._rendererInterfaces[rendererID];
                  if (renderer == null) {
                    console.warn('Invalid renderer id "'.concat(rendererID, '" for element "').concat(id, '"'));
                  } else {
                    var value = renderer.getSerializedElementValueByPath(id, path);
                    if (value != null) {
                      _this._bridge.send("saveToClipboard", value);
                    } else {
                      console.warn('Unable to obtain serialized value for element "'.concat(id, '"'));
                    }
                  }
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "deletePath", function(_ref5) {
                  var hookID = _ref5.hookID, id = _ref5.id, path = _ref5.path, rendererID = _ref5.rendererID, type = _ref5.type;
                  var renderer = _this._rendererInterfaces[rendererID];
                  if (renderer == null) {
                    console.warn('Invalid renderer id "'.concat(rendererID, '" for element "').concat(id, '"'));
                  } else {
                    renderer.deletePath(type, id, hookID, path);
                  }
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "getBackendVersion", function() {
                  var version = "4.28.5-ef8a840bd";
                  if (version) {
                    _this._bridge.send("backendVersion", version);
                  }
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "getBridgeProtocol", function() {
                  _this._bridge.send("bridgeProtocol", currentBridgeProtocol);
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "getProfilingData", function(_ref6) {
                  var rendererID = _ref6.rendererID;
                  var renderer = _this._rendererInterfaces[rendererID];
                  if (renderer == null) {
                    console.warn('Invalid renderer id "'.concat(rendererID, '"'));
                  }
                  _this._bridge.send("profilingData", renderer.getProfilingData());
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "getProfilingStatus", function() {
                  _this._bridge.send("profilingStatus", _this._isProfiling);
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "getOwnersList", function(_ref7) {
                  var id = _ref7.id, rendererID = _ref7.rendererID;
                  var renderer = _this._rendererInterfaces[rendererID];
                  if (renderer == null) {
                    console.warn('Invalid renderer id "'.concat(rendererID, '" for element "').concat(id, '"'));
                  } else {
                    var owners = renderer.getOwnersList(id);
                    _this._bridge.send("ownersList", {
                      id,
                      owners
                    });
                  }
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "inspectElement", function(_ref8) {
                  var forceFullData = _ref8.forceFullData, id = _ref8.id, path = _ref8.path, rendererID = _ref8.rendererID, requestID = _ref8.requestID;
                  var renderer = _this._rendererInterfaces[rendererID];
                  if (renderer == null) {
                    console.warn('Invalid renderer id "'.concat(rendererID, '" for element "').concat(id, '"'));
                  } else {
                    _this._bridge.send("inspectedElement", renderer.inspectElement(requestID, id, path, forceFullData));
                    if (_this._persistedSelectionMatch === null || _this._persistedSelectionMatch.id !== id) {
                      _this._persistedSelection = null;
                      _this._persistedSelectionMatch = null;
                      renderer.setTrackedPath(null);
                      _this._throttledPersistSelection(rendererID, id);
                    }
                  }
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "logElementToConsole", function(_ref9) {
                  var id = _ref9.id, rendererID = _ref9.rendererID;
                  var renderer = _this._rendererInterfaces[rendererID];
                  if (renderer == null) {
                    console.warn('Invalid renderer id "'.concat(rendererID, '" for element "').concat(id, '"'));
                  } else {
                    renderer.logElementToConsole(id);
                  }
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "overrideError", function(_ref10) {
                  var id = _ref10.id, rendererID = _ref10.rendererID, forceError = _ref10.forceError;
                  var renderer = _this._rendererInterfaces[rendererID];
                  if (renderer == null) {
                    console.warn('Invalid renderer id "'.concat(rendererID, '" for element "').concat(id, '"'));
                  } else {
                    renderer.overrideError(id, forceError);
                  }
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "overrideSuspense", function(_ref11) {
                  var id = _ref11.id, rendererID = _ref11.rendererID, forceFallback = _ref11.forceFallback;
                  var renderer = _this._rendererInterfaces[rendererID];
                  if (renderer == null) {
                    console.warn('Invalid renderer id "'.concat(rendererID, '" for element "').concat(id, '"'));
                  } else {
                    renderer.overrideSuspense(id, forceFallback);
                  }
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "overrideValueAtPath", function(_ref12) {
                  var hookID = _ref12.hookID, id = _ref12.id, path = _ref12.path, rendererID = _ref12.rendererID, type = _ref12.type, value = _ref12.value;
                  var renderer = _this._rendererInterfaces[rendererID];
                  if (renderer == null) {
                    console.warn('Invalid renderer id "'.concat(rendererID, '" for element "').concat(id, '"'));
                  } else {
                    renderer.overrideValueAtPath(type, id, hookID, path, value);
                  }
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "overrideContext", function(_ref13) {
                  var id = _ref13.id, path = _ref13.path, rendererID = _ref13.rendererID, wasForwarded = _ref13.wasForwarded, value = _ref13.value;
                  if (!wasForwarded) {
                    _this.overrideValueAtPath({
                      id,
                      path,
                      rendererID,
                      type: "context",
                      value
                    });
                  }
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "overrideHookState", function(_ref14) {
                  var id = _ref14.id, hookID = _ref14.hookID, path = _ref14.path, rendererID = _ref14.rendererID, wasForwarded = _ref14.wasForwarded, value = _ref14.value;
                  if (!wasForwarded) {
                    _this.overrideValueAtPath({
                      id,
                      path,
                      rendererID,
                      type: "hooks",
                      value
                    });
                  }
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "overrideProps", function(_ref15) {
                  var id = _ref15.id, path = _ref15.path, rendererID = _ref15.rendererID, wasForwarded = _ref15.wasForwarded, value = _ref15.value;
                  if (!wasForwarded) {
                    _this.overrideValueAtPath({
                      id,
                      path,
                      rendererID,
                      type: "props",
                      value
                    });
                  }
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "overrideState", function(_ref16) {
                  var id = _ref16.id, path = _ref16.path, rendererID = _ref16.rendererID, wasForwarded = _ref16.wasForwarded, value = _ref16.value;
                  if (!wasForwarded) {
                    _this.overrideValueAtPath({
                      id,
                      path,
                      rendererID,
                      type: "state",
                      value
                    });
                  }
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "reloadAndProfile", function(recordChangeDescriptions) {
                  sessionStorageSetItem(SESSION_STORAGE_RELOAD_AND_PROFILE_KEY, "true");
                  sessionStorageSetItem(SESSION_STORAGE_RECORD_CHANGE_DESCRIPTIONS_KEY, recordChangeDescriptions ? "true" : "false");
                  _this._bridge.send("reloadAppForProfiling");
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "renamePath", function(_ref17) {
                  var hookID = _ref17.hookID, id = _ref17.id, newPath = _ref17.newPath, oldPath = _ref17.oldPath, rendererID = _ref17.rendererID, type = _ref17.type;
                  var renderer = _this._rendererInterfaces[rendererID];
                  if (renderer == null) {
                    console.warn('Invalid renderer id "'.concat(rendererID, '" for element "').concat(id, '"'));
                  } else {
                    renderer.renamePath(type, id, hookID, oldPath, newPath);
                  }
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "setTraceUpdatesEnabled", function(traceUpdatesEnabled) {
                  _this._traceUpdatesEnabled = traceUpdatesEnabled;
                  toggleEnabled(traceUpdatesEnabled);
                  for (var rendererID in _this._rendererInterfaces) {
                    var renderer = _this._rendererInterfaces[rendererID];
                    renderer.setTraceUpdatesEnabled(traceUpdatesEnabled);
                  }
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "syncSelectionFromNativeElementsPanel", function() {
                  var target = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$0;
                  if (target == null) {
                    return;
                  }
                  _this.selectNode(target);
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "shutdown", function() {
                  _this.emit("shutdown");
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "startProfiling", function(recordChangeDescriptions) {
                  _this._recordChangeDescriptions = recordChangeDescriptions;
                  _this._isProfiling = true;
                  for (var rendererID in _this._rendererInterfaces) {
                    var renderer = _this._rendererInterfaces[rendererID];
                    renderer.startProfiling(recordChangeDescriptions);
                  }
                  _this._bridge.send("profilingStatus", _this._isProfiling);
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "stopProfiling", function() {
                  _this._isProfiling = false;
                  _this._recordChangeDescriptions = false;
                  for (var rendererID in _this._rendererInterfaces) {
                    var renderer = _this._rendererInterfaces[rendererID];
                    renderer.stopProfiling();
                  }
                  _this._bridge.send("profilingStatus", _this._isProfiling);
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "stopInspectingNative", function(selected) {
                  _this._bridge.send("stopInspectingNative", selected);
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "storeAsGlobal", function(_ref18) {
                  var count = _ref18.count, id = _ref18.id, path = _ref18.path, rendererID = _ref18.rendererID;
                  var renderer = _this._rendererInterfaces[rendererID];
                  if (renderer == null) {
                    console.warn('Invalid renderer id "'.concat(rendererID, '" for element "').concat(id, '"'));
                  } else {
                    renderer.storeAsGlobal(id, path, count);
                  }
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "updateConsolePatchSettings", function(_ref19) {
                  var appendComponentStack = _ref19.appendComponentStack, breakOnConsoleErrors = _ref19.breakOnConsoleErrors, showInlineWarningsAndErrors = _ref19.showInlineWarningsAndErrors, hideConsoleLogsInStrictMode = _ref19.hideConsoleLogsInStrictMode, browserTheme = _ref19.browserTheme;
                  patch({
                    appendComponentStack,
                    breakOnConsoleErrors,
                    showInlineWarningsAndErrors,
                    hideConsoleLogsInStrictMode,
                    browserTheme
                  });
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "updateComponentFilters", function(componentFilters) {
                  for (var rendererID in _this._rendererInterfaces) {
                    var renderer = _this._rendererInterfaces[rendererID];
                    renderer.updateComponentFilters(componentFilters);
                  }
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "viewAttributeSource", function(_ref20) {
                  var id = _ref20.id, path = _ref20.path, rendererID = _ref20.rendererID;
                  var renderer = _this._rendererInterfaces[rendererID];
                  if (renderer == null) {
                    console.warn('Invalid renderer id "'.concat(rendererID, '" for element "').concat(id, '"'));
                  } else {
                    renderer.prepareViewAttributeSource(id, path);
                  }
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "viewElementSource", function(_ref21) {
                  var id = _ref21.id, rendererID = _ref21.rendererID;
                  var renderer = _this._rendererInterfaces[rendererID];
                  if (renderer == null) {
                    console.warn('Invalid renderer id "'.concat(rendererID, '" for element "').concat(id, '"'));
                  } else {
                    renderer.prepareViewElementSource(id);
                  }
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "onTraceUpdates", function(nodes) {
                  _this.emit("traceUpdates", nodes);
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "onFastRefreshScheduled", function() {
                  if (__DEBUG__) {
                    debug("onFastRefreshScheduled");
                  }
                  _this._bridge.send("fastRefreshScheduled");
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "onHookOperations", function(operations) {
                  if (__DEBUG__) {
                    debug("onHookOperations", "(".concat(operations.length, ") [").concat(operations.join(", "), "]"));
                  }
                  _this._bridge.send("operations", operations);
                  if (_this._persistedSelection !== null) {
                    var rendererID = operations[0];
                    if (_this._persistedSelection.rendererID === rendererID) {
                      var renderer = _this._rendererInterfaces[rendererID];
                      if (renderer == null) {
                        console.warn('Invalid renderer id "'.concat(rendererID, '"'));
                      } else {
                        var prevMatch = _this._persistedSelectionMatch;
                        var nextMatch = renderer.getBestMatchForTrackedPath();
                        _this._persistedSelectionMatch = nextMatch;
                        var prevMatchID = prevMatch !== null ? prevMatch.id : null;
                        var nextMatchID = nextMatch !== null ? nextMatch.id : null;
                        if (prevMatchID !== nextMatchID) {
                          if (nextMatchID !== null) {
                            _this._bridge.send("selectFiber", nextMatchID);
                          }
                        }
                        if (nextMatch !== null && nextMatch.isFullMatch) {
                          _this._persistedSelection = null;
                          _this._persistedSelectionMatch = null;
                          renderer.setTrackedPath(null);
                        }
                      }
                    }
                  }
                });
                agent_defineProperty(agent_assertThisInitialized(_this), "_throttledPersistSelection", lodash_throttle_default()(function(rendererID, id) {
                  var renderer = _this._rendererInterfaces[rendererID];
                  var path = renderer != null ? renderer.getPathForElement(id) : null;
                  if (path !== null) {
                    sessionStorageSetItem(SESSION_STORAGE_LAST_SELECTION_KEY, JSON.stringify({
                      rendererID,
                      path
                    }));
                  } else {
                    sessionStorageRemoveItem(SESSION_STORAGE_LAST_SELECTION_KEY);
                  }
                }, 1e3));
                if (sessionStorageGetItem(SESSION_STORAGE_RELOAD_AND_PROFILE_KEY) === "true") {
                  _this._recordChangeDescriptions = sessionStorageGetItem(SESSION_STORAGE_RECORD_CHANGE_DESCRIPTIONS_KEY) === "true";
                  _this._isProfiling = true;
                  sessionStorageRemoveItem(SESSION_STORAGE_RECORD_CHANGE_DESCRIPTIONS_KEY);
                  sessionStorageRemoveItem(SESSION_STORAGE_RELOAD_AND_PROFILE_KEY);
                }
                var persistedSelectionString = sessionStorageGetItem(SESSION_STORAGE_LAST_SELECTION_KEY);
                if (persistedSelectionString != null) {
                  _this._persistedSelection = JSON.parse(persistedSelectionString);
                }
                _this._bridge = bridge;
                bridge.addListener("clearErrorsAndWarnings", _this.clearErrorsAndWarnings);
                bridge.addListener("clearErrorsForFiberID", _this.clearErrorsForFiberID);
                bridge.addListener("clearWarningsForFiberID", _this.clearWarningsForFiberID);
                bridge.addListener("copyElementPath", _this.copyElementPath);
                bridge.addListener("deletePath", _this.deletePath);
                bridge.addListener("getBackendVersion", _this.getBackendVersion);
                bridge.addListener("getBridgeProtocol", _this.getBridgeProtocol);
                bridge.addListener("getProfilingData", _this.getProfilingData);
                bridge.addListener("getProfilingStatus", _this.getProfilingStatus);
                bridge.addListener("getOwnersList", _this.getOwnersList);
                bridge.addListener("inspectElement", _this.inspectElement);
                bridge.addListener("logElementToConsole", _this.logElementToConsole);
                bridge.addListener("overrideError", _this.overrideError);
                bridge.addListener("overrideSuspense", _this.overrideSuspense);
                bridge.addListener("overrideValueAtPath", _this.overrideValueAtPath);
                bridge.addListener("reloadAndProfile", _this.reloadAndProfile);
                bridge.addListener("renamePath", _this.renamePath);
                bridge.addListener("setTraceUpdatesEnabled", _this.setTraceUpdatesEnabled);
                bridge.addListener("startProfiling", _this.startProfiling);
                bridge.addListener("stopProfiling", _this.stopProfiling);
                bridge.addListener("storeAsGlobal", _this.storeAsGlobal);
                bridge.addListener("syncSelectionFromNativeElementsPanel", _this.syncSelectionFromNativeElementsPanel);
                bridge.addListener("shutdown", _this.shutdown);
                bridge.addListener("updateConsolePatchSettings", _this.updateConsolePatchSettings);
                bridge.addListener("updateComponentFilters", _this.updateComponentFilters);
                bridge.addListener("viewAttributeSource", _this.viewAttributeSource);
                bridge.addListener("viewElementSource", _this.viewElementSource);
                bridge.addListener("overrideContext", _this.overrideContext);
                bridge.addListener("overrideHookState", _this.overrideHookState);
                bridge.addListener("overrideProps", _this.overrideProps);
                bridge.addListener("overrideState", _this.overrideState);
                if (_this._isProfiling) {
                  bridge.send("profilingStatus", true);
                }
                var _version = "4.28.5-ef8a840bd";
                if (_version) {
                  _this._bridge.send("backendVersion", _version);
                }
                _this._bridge.send("bridgeProtocol", currentBridgeProtocol);
                var isBackendStorageAPISupported = false;
                try {
                  localStorage.getItem("test");
                  isBackendStorageAPISupported = true;
                } catch (error) {
                }
                bridge.send("isBackendStorageAPISupported", isBackendStorageAPISupported);
                bridge.send("isSynchronousXHRSupported", isSynchronousXHRSupported());
                setupHighlighter(bridge, agent_assertThisInitialized(_this));
                TraceUpdates_initialize(agent_assertThisInitialized(_this));
                return _this;
              }
              __name(Agent2, "Agent");
              agent_createClass(Agent2, [{
                key: "getInstanceAndStyle",
                value: /* @__PURE__ */ __name(function getInstanceAndStyle(_ref22) {
                  var id = _ref22.id, rendererID = _ref22.rendererID;
                  var renderer = this._rendererInterfaces[rendererID];
                  if (renderer == null) {
                    console.warn('Invalid renderer id "'.concat(rendererID, '"'));
                    return null;
                  }
                  return renderer.getInstanceAndStyle(id);
                }, "getInstanceAndStyle")
              }, {
                key: "getBestMatchingRendererInterface",
                value: /* @__PURE__ */ __name(function getBestMatchingRendererInterface(node) {
                  var bestMatch = null;
                  for (var rendererID in this._rendererInterfaces) {
                    var renderer = this._rendererInterfaces[rendererID];
                    var fiber = renderer.getFiberForNative(node);
                    if (fiber !== null) {
                      if (fiber.stateNode === node) {
                        return renderer;
                      } else if (bestMatch === null) {
                        bestMatch = renderer;
                      }
                    }
                  }
                  return bestMatch;
                }, "getBestMatchingRendererInterface")
              }, {
                key: "getIDForNode",
                value: /* @__PURE__ */ __name(function getIDForNode(node) {
                  var rendererInterface = this.getBestMatchingRendererInterface(node);
                  if (rendererInterface != null) {
                    try {
                      return rendererInterface.getFiberIDForNative(node, true);
                    } catch (error) {
                    }
                  }
                  return null;
                }, "getIDForNode")
              }, {
                key: "selectNode",
                value: /* @__PURE__ */ __name(function selectNode(target) {
                  var id = this.getIDForNode(target);
                  if (id !== null) {
                    this._bridge.send("selectFiber", id);
                  }
                }, "selectNode")
              }, {
                key: "setRendererInterface",
                value: /* @__PURE__ */ __name(function setRendererInterface(rendererID, rendererInterface) {
                  this._rendererInterfaces[rendererID] = rendererInterface;
                  if (this._isProfiling) {
                    rendererInterface.startProfiling(this._recordChangeDescriptions);
                  }
                  rendererInterface.setTraceUpdatesEnabled(this._traceUpdatesEnabled);
                  var selection = this._persistedSelection;
                  if (selection !== null && selection.rendererID === rendererID) {
                    rendererInterface.setTrackedPath(selection.path);
                  }
                }, "setRendererInterface")
              }, {
                key: "onUnsupportedRenderer",
                value: /* @__PURE__ */ __name(function onUnsupportedRenderer(rendererID) {
                  this._bridge.send("unsupportedRendererVersion", rendererID);
                }, "onUnsupportedRenderer")
              }, {
                key: "rendererInterfaces",
                get: /* @__PURE__ */ __name(function get() {
                  return this._rendererInterfaces;
                }, "get")
              }]);
              return Agent2;
            }(EventEmitter);
            ;
            function hook_typeof(obj) {
              "@babel/helpers - typeof";
              if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                hook_typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                  return typeof obj2;
                }, "_typeof");
              } else {
                hook_typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                  return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                }, "_typeof");
              }
              return hook_typeof(obj);
            }
            __name(hook_typeof, "hook_typeof");
            function hook_toConsumableArray(arr) {
              return hook_arrayWithoutHoles(arr) || hook_iterableToArray(arr) || hook_unsupportedIterableToArray(arr) || hook_nonIterableSpread();
            }
            __name(hook_toConsumableArray, "hook_toConsumableArray");
            function hook_nonIterableSpread() {
              throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
            }
            __name(hook_nonIterableSpread, "hook_nonIterableSpread");
            function hook_unsupportedIterableToArray(o, minLen) {
              if (!o) return;
              if (typeof o === "string") return hook_arrayLikeToArray(o, minLen);
              var n = Object.prototype.toString.call(o).slice(8, -1);
              if (n === "Object" && o.constructor) n = o.constructor.name;
              if (n === "Map" || n === "Set") return Array.from(o);
              if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return hook_arrayLikeToArray(o, minLen);
            }
            __name(hook_unsupportedIterableToArray, "hook_unsupportedIterableToArray");
            function hook_iterableToArray(iter) {
              if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
            }
            __name(hook_iterableToArray, "hook_iterableToArray");
            function hook_arrayWithoutHoles(arr) {
              if (Array.isArray(arr)) return hook_arrayLikeToArray(arr);
            }
            __name(hook_arrayWithoutHoles, "hook_arrayWithoutHoles");
            function hook_arrayLikeToArray(arr, len) {
              if (len == null || len > arr.length) len = arr.length;
              for (var i = 0, arr2 = new Array(len); i < len; i++) {
                arr2[i] = arr[i];
              }
              return arr2;
            }
            __name(hook_arrayLikeToArray, "hook_arrayLikeToArray");
            function installHook(target) {
              if (target.hasOwnProperty("__REACT_DEVTOOLS_GLOBAL_HOOK__")) {
                return null;
              }
              var targetConsole2 = console;
              var targetConsoleMethods2 = {};
              for (var method2 in console) {
                targetConsoleMethods2[method2] = console[method2];
              }
              function dangerous_setTargetConsoleForTesting2(targetConsoleForTesting) {
                targetConsole2 = targetConsoleForTesting;
                targetConsoleMethods2 = {};
                for (var _method in targetConsole2) {
                  targetConsoleMethods2[_method] = console[_method];
                }
              }
              __name(dangerous_setTargetConsoleForTesting2, "dangerous_setTargetConsoleForTesting");
              function detectReactBuildType(renderer) {
                try {
                  if (typeof renderer.version === "string") {
                    if (renderer.bundleType > 0) {
                      return "development";
                    }
                    return "production";
                  }
                  var _toString = Function.prototype.toString;
                  if (renderer.Mount && renderer.Mount._renderNewRootComponent) {
                    var renderRootCode = _toString.call(renderer.Mount._renderNewRootComponent);
                    if (renderRootCode.indexOf("function") !== 0) {
                      return "production";
                    }
                    if (renderRootCode.indexOf("storedMeasure") !== -1) {
                      return "development";
                    }
                    if (renderRootCode.indexOf("should be a pure function") !== -1) {
                      if (renderRootCode.indexOf("NODE_ENV") !== -1) {
                        return "development";
                      }
                      if (renderRootCode.indexOf("development") !== -1) {
                        return "development";
                      }
                      if (renderRootCode.indexOf("true") !== -1) {
                        return "development";
                      }
                      if (
                        // 0.13 to 15
                        renderRootCode.indexOf("nextElement") !== -1 || // 0.12
                        renderRootCode.indexOf("nextComponent") !== -1
                      ) {
                        return "unminified";
                      } else {
                        return "development";
                      }
                    }
                    if (
                      // 0.13 to 15
                      renderRootCode.indexOf("nextElement") !== -1 || // 0.12
                      renderRootCode.indexOf("nextComponent") !== -1
                    ) {
                      return "unminified";
                    }
                    return "outdated";
                  }
                } catch (err) {
                }
                return "production";
              }
              __name(detectReactBuildType, "detectReactBuildType");
              function checkDCE(fn) {
                try {
                  var _toString2 = Function.prototype.toString;
                  var code = _toString2.call(fn);
                  if (code.indexOf("^_^") > -1) {
                    hasDetectedBadDCE = true;
                    setTimeout(function() {
                      throw new Error("React is running in production mode, but dead code elimination has not been applied. Read how to correctly configure React for production: https://reactjs.org/link/perf-use-production-build");
                    });
                  }
                } catch (err) {
                }
              }
              __name(checkDCE, "checkDCE");
              function formatWithStyles2(inputArgs, style) {
                if (inputArgs === void 0 || inputArgs === null || inputArgs.length === 0 || // Matches any of %c but not %%c
                typeof inputArgs[0] === "string" && inputArgs[0].match(/([^%]|^)(%c)/g) || style === void 0) {
                  return inputArgs;
                }
                var REGEXP = /([^%]|^)((%%)*)(%([oOdisf]))/g;
                if (typeof inputArgs[0] === "string" && inputArgs[0].match(REGEXP)) {
                  return ["%c".concat(inputArgs[0]), style].concat(hook_toConsumableArray(inputArgs.slice(1)));
                } else {
                  var firstArg = inputArgs.reduce(function(formatStr, elem, i) {
                    if (i > 0) {
                      formatStr += " ";
                    }
                    switch (hook_typeof(elem)) {
                      case "string":
                      case "boolean":
                      case "symbol":
                        return formatStr += "%s";
                      case "number":
                        var formatting = Number.isInteger(elem) ? "%i" : "%f";
                        return formatStr += formatting;
                      default:
                        return formatStr += "%o";
                    }
                  }, "%c");
                  return [firstArg, style].concat(hook_toConsumableArray(inputArgs));
                }
              }
              __name(formatWithStyles2, "formatWithStyles");
              var unpatchFn2 = null;
              function patchConsoleForInitialRenderInStrictMode(_ref) {
                var hideConsoleLogsInStrictMode = _ref.hideConsoleLogsInStrictMode, browserTheme = _ref.browserTheme;
                var overrideConsoleMethods = ["error", "group", "groupCollapsed", "info", "log", "trace", "warn"];
                if (unpatchFn2 !== null) {
                  return;
                }
                var originalConsoleMethods = {};
                unpatchFn2 = /* @__PURE__ */ __name(function unpatchFn3() {
                  for (var _method2 in originalConsoleMethods) {
                    try {
                      targetConsole2[_method2] = originalConsoleMethods[_method2];
                    } catch (error) {
                    }
                  }
                }, "unpatchFn");
                overrideConsoleMethods.forEach(function(method3) {
                  try {
                    var originalMethod = originalConsoleMethods[method3] = targetConsole2[method3].__REACT_DEVTOOLS_STRICT_MODE_ORIGINAL_METHOD__ ? targetConsole2[method3].__REACT_DEVTOOLS_STRICT_MODE_ORIGINAL_METHOD__ : targetConsole2[method3];
                    var overrideMethod = /* @__PURE__ */ __name(function overrideMethod2() {
                      if (!hideConsoleLogsInStrictMode) {
                        var color;
                        switch (method3) {
                          case "warn":
                            color = browserTheme === "light" ? "rgba(250, 180, 50, 0.75)" : "rgba(250, 180, 50, 0.5)";
                            break;
                          case "error":
                            color = browserTheme === "light" ? "rgba(250, 123, 130, 0.75)" : "rgba(250, 123, 130, 0.5)";
                            break;
                          case "log":
                          default:
                            color = browserTheme === "light" ? "rgba(125, 125, 125, 0.75)" : "rgba(125, 125, 125, 0.5)";
                            break;
                        }
                        if (color) {
                          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                            args[_key] = arguments[_key];
                          }
                          originalMethod.apply(void 0, hook_toConsumableArray(formatWithStyles2(args, "color: ".concat(color))));
                        } else {
                          throw Error("Console color is not defined");
                        }
                      }
                    }, "overrideMethod");
                    overrideMethod.__REACT_DEVTOOLS_STRICT_MODE_ORIGINAL_METHOD__ = originalMethod;
                    originalMethod.__REACT_DEVTOOLS_STRICT_MODE_OVERRIDE_METHOD__ = overrideMethod;
                    targetConsole2[method3] = overrideMethod;
                  } catch (error) {
                  }
                });
              }
              __name(patchConsoleForInitialRenderInStrictMode, "patchConsoleForInitialRenderInStrictMode");
              function unpatchConsoleForInitialRenderInStrictMode() {
                if (unpatchFn2 !== null) {
                  unpatchFn2();
                  unpatchFn2 = null;
                }
              }
              __name(unpatchConsoleForInitialRenderInStrictMode, "unpatchConsoleForInitialRenderInStrictMode");
              var uidCounter2 = 0;
              function inject(renderer) {
                var id = ++uidCounter2;
                renderers.set(id, renderer);
                var reactBuildType = hasDetectedBadDCE ? "deadcode" : detectReactBuildType(renderer);
                if (target.hasOwnProperty("__REACT_DEVTOOLS_CONSOLE_FUNCTIONS__")) {
                  var _target$__REACT_DEVTO = target.__REACT_DEVTOOLS_CONSOLE_FUNCTIONS__, registerRendererWithConsole = _target$__REACT_DEVTO.registerRendererWithConsole, patchConsoleUsingWindowValues2 = _target$__REACT_DEVTO.patchConsoleUsingWindowValues;
                  if (typeof registerRendererWithConsole === "function" && typeof patchConsoleUsingWindowValues2 === "function") {
                    registerRendererWithConsole(renderer);
                    patchConsoleUsingWindowValues2();
                  }
                }
                var attach2 = target.__REACT_DEVTOOLS_ATTACH__;
                if (typeof attach2 === "function") {
                  var rendererInterface = attach2(hook2, id, renderer, target);
                  hook2.rendererInterfaces.set(id, rendererInterface);
                }
                hook2.emit("renderer", {
                  id,
                  renderer,
                  reactBuildType
                });
                return id;
              }
              __name(inject, "inject");
              var hasDetectedBadDCE = false;
              function sub(event, fn) {
                hook2.on(event, fn);
                return function() {
                  return hook2.off(event, fn);
                };
              }
              __name(sub, "sub");
              function on(event, fn) {
                if (!listeners[event]) {
                  listeners[event] = [];
                }
                listeners[event].push(fn);
              }
              __name(on, "on");
              function off(event, fn) {
                if (!listeners[event]) {
                  return;
                }
                var index = listeners[event].indexOf(fn);
                if (index !== -1) {
                  listeners[event].splice(index, 1);
                }
                if (!listeners[event].length) {
                  delete listeners[event];
                }
              }
              __name(off, "off");
              function emit(event, data) {
                if (listeners[event]) {
                  listeners[event].map(function(fn) {
                    return fn(data);
                  });
                }
              }
              __name(emit, "emit");
              function getFiberRoots(rendererID) {
                var roots = fiberRoots;
                if (!roots[rendererID]) {
                  roots[rendererID] = /* @__PURE__ */ new Set();
                }
                return roots[rendererID];
              }
              __name(getFiberRoots, "getFiberRoots");
              function onCommitFiberUnmount(rendererID, fiber) {
                var rendererInterface = rendererInterfaces.get(rendererID);
                if (rendererInterface != null) {
                  rendererInterface.handleCommitFiberUnmount(fiber);
                }
              }
              __name(onCommitFiberUnmount, "onCommitFiberUnmount");
              function onCommitFiberRoot(rendererID, root, priorityLevel) {
                var mountedRoots = hook2.getFiberRoots(rendererID);
                var current = root.current;
                var isKnownRoot = mountedRoots.has(root);
                var isUnmounting = current.memoizedState == null || current.memoizedState.element == null;
                if (!isKnownRoot && !isUnmounting) {
                  mountedRoots.add(root);
                } else if (isKnownRoot && isUnmounting) {
                  mountedRoots.delete(root);
                }
                var rendererInterface = rendererInterfaces.get(rendererID);
                if (rendererInterface != null) {
                  rendererInterface.handleCommitFiberRoot(root, priorityLevel);
                }
              }
              __name(onCommitFiberRoot, "onCommitFiberRoot");
              function onPostCommitFiberRoot(rendererID, root) {
                var rendererInterface = rendererInterfaces.get(rendererID);
                if (rendererInterface != null) {
                  rendererInterface.handlePostCommitFiberRoot(root);
                }
              }
              __name(onPostCommitFiberRoot, "onPostCommitFiberRoot");
              function setStrictMode(rendererID, isStrictMode) {
                var rendererInterface = rendererInterfaces.get(rendererID);
                if (rendererInterface != null) {
                  if (isStrictMode) {
                    rendererInterface.patchConsoleForStrictMode();
                  } else {
                    rendererInterface.unpatchConsoleForStrictMode();
                  }
                } else {
                  if (isStrictMode) {
                    var hideConsoleLogsInStrictMode = window.__REACT_DEVTOOLS_HIDE_CONSOLE_LOGS_IN_STRICT_MODE__ === true;
                    var browserTheme = window.__REACT_DEVTOOLS_BROWSER_THEME__;
                    patchConsoleForInitialRenderInStrictMode({
                      hideConsoleLogsInStrictMode,
                      browserTheme
                    });
                  } else {
                    unpatchConsoleForInitialRenderInStrictMode();
                  }
                }
              }
              __name(setStrictMode, "setStrictMode");
              var openModuleRangesStack = [];
              var moduleRanges = [];
              function getTopStackFrameString(error) {
                var frames = error.stack.split("\n");
                var frame = frames.length > 1 ? frames[1] : null;
                return frame;
              }
              __name(getTopStackFrameString, "getTopStackFrameString");
              function getInternalModuleRanges() {
                return moduleRanges;
              }
              __name(getInternalModuleRanges, "getInternalModuleRanges");
              function registerInternalModuleStart(error) {
                var startStackFrame = getTopStackFrameString(error);
                if (startStackFrame !== null) {
                  openModuleRangesStack.push(startStackFrame);
                }
              }
              __name(registerInternalModuleStart, "registerInternalModuleStart");
              function registerInternalModuleStop(error) {
                if (openModuleRangesStack.length > 0) {
                  var startStackFrame = openModuleRangesStack.pop();
                  var stopStackFrame = getTopStackFrameString(error);
                  if (stopStackFrame !== null) {
                    moduleRanges.push([startStackFrame, stopStackFrame]);
                  }
                }
              }
              __name(registerInternalModuleStop, "registerInternalModuleStop");
              var fiberRoots = {};
              var rendererInterfaces = /* @__PURE__ */ new Map();
              var listeners = {};
              var renderers = /* @__PURE__ */ new Map();
              var backends = /* @__PURE__ */ new Map();
              var hook2 = {
                rendererInterfaces,
                listeners,
                backends,
                // Fast Refresh for web relies on this.
                renderers,
                emit,
                getFiberRoots,
                inject,
                on,
                off,
                sub,
                // This is a legacy flag.
                // React v16 checks the hook for this to ensure DevTools is new enough.
                supportsFiber: true,
                // React calls these methods.
                checkDCE,
                onCommitFiberUnmount,
                onCommitFiberRoot,
                onPostCommitFiberRoot,
                setStrictMode,
                // Schedule Profiler runtime helpers.
                // These internal React modules to report their own boundaries
                // which in turn enables the profiler to dim or filter internal frames.
                getInternalModuleRanges,
                registerInternalModuleStart,
                registerInternalModuleStop
              };
              if (false) {
              }
              Object.defineProperty(target, "__REACT_DEVTOOLS_GLOBAL_HOOK__", {
                // This property needs to be configurable for the test environment,
                // else we won't be able to delete and recreate it between tests.
                configurable: false,
                enumerable: false,
                get: /* @__PURE__ */ __name(function get() {
                  return hook2;
                }, "get")
              });
              return hook2;
            }
            __name(installHook, "installHook");
            ;
            function decorate(object, attr, fn) {
              var old = object[attr];
              object[attr] = function(instance) {
                return fn.call(this, old, arguments);
              };
              return old;
            }
            __name(decorate, "decorate");
            function decorateMany(source, fns) {
              var olds = {};
              for (var name in fns) {
                olds[name] = decorate(source, name, fns[name]);
              }
              return olds;
            }
            __name(decorateMany, "decorateMany");
            function restoreMany(source, olds) {
              for (var name in olds) {
                source[name] = olds[name];
              }
            }
            __name(restoreMany, "restoreMany");
            function forceUpdate(instance) {
              if (typeof instance.forceUpdate === "function") {
                instance.forceUpdate();
              } else if (instance.updater != null && typeof instance.updater.enqueueForceUpdate === "function") {
                instance.updater.enqueueForceUpdate(this, function() {
                }, "forceUpdate");
              }
            }
            __name(forceUpdate, "forceUpdate");
            ;
            function legacy_renderer_ownKeys(object, enumerableOnly) {
              var keys = Object.keys(object);
              if (Object.getOwnPropertySymbols) {
                var symbols = Object.getOwnPropertySymbols(object);
                if (enumerableOnly) symbols = symbols.filter(function(sym) {
                  return Object.getOwnPropertyDescriptor(object, sym).enumerable;
                });
                keys.push.apply(keys, symbols);
              }
              return keys;
            }
            __name(legacy_renderer_ownKeys, "legacy_renderer_ownKeys");
            function legacy_renderer_objectSpread(target) {
              for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i] != null ? arguments[i] : {};
                if (i % 2) {
                  legacy_renderer_ownKeys(Object(source), true).forEach(function(key) {
                    legacy_renderer_defineProperty(target, key, source[key]);
                  });
                } else if (Object.getOwnPropertyDescriptors) {
                  Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
                } else {
                  legacy_renderer_ownKeys(Object(source)).forEach(function(key) {
                    Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
                  });
                }
              }
              return target;
            }
            __name(legacy_renderer_objectSpread, "legacy_renderer_objectSpread");
            function legacy_renderer_defineProperty(obj, key, value) {
              if (key in obj) {
                Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
              } else {
                obj[key] = value;
              }
              return obj;
            }
            __name(legacy_renderer_defineProperty, "legacy_renderer_defineProperty");
            function legacy_renderer_typeof(obj) {
              "@babel/helpers - typeof";
              if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                legacy_renderer_typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                  return typeof obj2;
                }, "_typeof");
              } else {
                legacy_renderer_typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                  return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                }, "_typeof");
              }
              return legacy_renderer_typeof(obj);
            }
            __name(legacy_renderer_typeof, "legacy_renderer_typeof");
            function getData(internalInstance) {
              var displayName = null;
              var key = null;
              if (internalInstance._currentElement != null) {
                if (internalInstance._currentElement.key) {
                  key = String(internalInstance._currentElement.key);
                }
                var elementType = internalInstance._currentElement.type;
                if (typeof elementType === "string") {
                  displayName = elementType;
                } else if (typeof elementType === "function") {
                  displayName = getDisplayName(elementType);
                }
              }
              return {
                displayName,
                key
              };
            }
            __name(getData, "getData");
            function getElementType(internalInstance) {
              if (internalInstance._currentElement != null) {
                var elementType = internalInstance._currentElement.type;
                if (typeof elementType === "function") {
                  var publicInstance = internalInstance.getPublicInstance();
                  if (publicInstance !== null) {
                    return types_ElementTypeClass;
                  } else {
                    return types_ElementTypeFunction;
                  }
                } else if (typeof elementType === "string") {
                  return ElementTypeHostComponent;
                }
              }
              return ElementTypeOtherOrUnknown;
            }
            __name(getElementType, "getElementType");
            function getChildren(internalInstance) {
              var children = [];
              if (legacy_renderer_typeof(internalInstance) !== "object") {
              } else if (internalInstance._currentElement === null || internalInstance._currentElement === false) {
              } else if (internalInstance._renderedComponent) {
                var child = internalInstance._renderedComponent;
                if (getElementType(child) !== ElementTypeOtherOrUnknown) {
                  children.push(child);
                }
              } else if (internalInstance._renderedChildren) {
                var renderedChildren = internalInstance._renderedChildren;
                for (var name in renderedChildren) {
                  var _child = renderedChildren[name];
                  if (getElementType(_child) !== ElementTypeOtherOrUnknown) {
                    children.push(_child);
                  }
                }
              }
              return children;
            }
            __name(getChildren, "getChildren");
            function renderer_attach(hook2, rendererID, renderer, global2) {
              var idToInternalInstanceMap = /* @__PURE__ */ new Map();
              var internalInstanceToIDMap = /* @__PURE__ */ new WeakMap();
              var internalInstanceToRootIDMap = /* @__PURE__ */ new WeakMap();
              var getInternalIDForNative = null;
              var findNativeNodeForInternalID;
              var getFiberForNative = /* @__PURE__ */ __name(function getFiberForNative2(node) {
                return null;
              }, "getFiberForNative");
              if (renderer.ComponentTree) {
                getInternalIDForNative = /* @__PURE__ */ __name(function getInternalIDForNative2(node, findNearestUnfilteredAncestor) {
                  var internalInstance = renderer.ComponentTree.getClosestInstanceFromNode(node);
                  return internalInstanceToIDMap.get(internalInstance) || null;
                }, "getInternalIDForNative");
                findNativeNodeForInternalID = /* @__PURE__ */ __name(function findNativeNodeForInternalID2(id) {
                  var internalInstance = idToInternalInstanceMap.get(id);
                  return renderer.ComponentTree.getNodeFromInstance(internalInstance);
                }, "findNativeNodeForInternalID");
                getFiberForNative = /* @__PURE__ */ __name(function getFiberForNative2(node) {
                  return renderer.ComponentTree.getClosestInstanceFromNode(node);
                }, "getFiberForNative");
              } else if (renderer.Mount.getID && renderer.Mount.getNode) {
                getInternalIDForNative = /* @__PURE__ */ __name(function getInternalIDForNative2(node, findNearestUnfilteredAncestor) {
                  return null;
                }, "getInternalIDForNative");
                findNativeNodeForInternalID = /* @__PURE__ */ __name(function findNativeNodeForInternalID2(id) {
                  return null;
                }, "findNativeNodeForInternalID");
              }
              function getDisplayNameForFiberID(id) {
                var internalInstance = idToInternalInstanceMap.get(id);
                return internalInstance ? getData(internalInstance).displayName : null;
              }
              __name(getDisplayNameForFiberID, "getDisplayNameForFiberID");
              function getID(internalInstance) {
                if (legacy_renderer_typeof(internalInstance) !== "object" || internalInstance === null) {
                  throw new Error("Invalid internal instance: " + internalInstance);
                }
                if (!internalInstanceToIDMap.has(internalInstance)) {
                  var _id = getUID();
                  internalInstanceToIDMap.set(internalInstance, _id);
                  idToInternalInstanceMap.set(_id, internalInstance);
                }
                return internalInstanceToIDMap.get(internalInstance);
              }
              __name(getID, "getID");
              function areEqualArrays(a, b) {
                if (a.length !== b.length) {
                  return false;
                }
                for (var i = 0; i < a.length; i++) {
                  if (a[i] !== b[i]) {
                    return false;
                  }
                }
                return true;
              }
              __name(areEqualArrays, "areEqualArrays");
              var parentIDStack = [];
              var oldReconcilerMethods = null;
              if (renderer.Reconciler) {
                oldReconcilerMethods = decorateMany(renderer.Reconciler, {
                  mountComponent: /* @__PURE__ */ __name(function mountComponent(fn, args) {
                    var internalInstance = args[0];
                    var hostContainerInfo = args[3];
                    if (getElementType(internalInstance) === ElementTypeOtherOrUnknown) {
                      return fn.apply(this, args);
                    }
                    if (hostContainerInfo._topLevelWrapper === void 0) {
                      return fn.apply(this, args);
                    }
                    var id = getID(internalInstance);
                    var parentID = parentIDStack.length > 0 ? parentIDStack[parentIDStack.length - 1] : 0;
                    recordMount(internalInstance, id, parentID);
                    parentIDStack.push(id);
                    internalInstanceToRootIDMap.set(internalInstance, getID(hostContainerInfo._topLevelWrapper));
                    try {
                      var result = fn.apply(this, args);
                      parentIDStack.pop();
                      return result;
                    } catch (err) {
                      parentIDStack = [];
                      throw err;
                    } finally {
                      if (parentIDStack.length === 0) {
                        var rootID = internalInstanceToRootIDMap.get(internalInstance);
                        if (rootID === void 0) {
                          throw new Error("Expected to find root ID.");
                        }
                        flushPendingEvents(rootID);
                      }
                    }
                  }, "mountComponent"),
                  performUpdateIfNecessary: /* @__PURE__ */ __name(function performUpdateIfNecessary(fn, args) {
                    var internalInstance = args[0];
                    if (getElementType(internalInstance) === ElementTypeOtherOrUnknown) {
                      return fn.apply(this, args);
                    }
                    var id = getID(internalInstance);
                    parentIDStack.push(id);
                    var prevChildren = getChildren(internalInstance);
                    try {
                      var result = fn.apply(this, args);
                      var nextChildren = getChildren(internalInstance);
                      if (!areEqualArrays(prevChildren, nextChildren)) {
                        recordReorder(internalInstance, id, nextChildren);
                      }
                      parentIDStack.pop();
                      return result;
                    } catch (err) {
                      parentIDStack = [];
                      throw err;
                    } finally {
                      if (parentIDStack.length === 0) {
                        var rootID = internalInstanceToRootIDMap.get(internalInstance);
                        if (rootID === void 0) {
                          throw new Error("Expected to find root ID.");
                        }
                        flushPendingEvents(rootID);
                      }
                    }
                  }, "performUpdateIfNecessary"),
                  receiveComponent: /* @__PURE__ */ __name(function receiveComponent(fn, args) {
                    var internalInstance = args[0];
                    if (getElementType(internalInstance) === ElementTypeOtherOrUnknown) {
                      return fn.apply(this, args);
                    }
                    var id = getID(internalInstance);
                    parentIDStack.push(id);
                    var prevChildren = getChildren(internalInstance);
                    try {
                      var result = fn.apply(this, args);
                      var nextChildren = getChildren(internalInstance);
                      if (!areEqualArrays(prevChildren, nextChildren)) {
                        recordReorder(internalInstance, id, nextChildren);
                      }
                      parentIDStack.pop();
                      return result;
                    } catch (err) {
                      parentIDStack = [];
                      throw err;
                    } finally {
                      if (parentIDStack.length === 0) {
                        var rootID = internalInstanceToRootIDMap.get(internalInstance);
                        if (rootID === void 0) {
                          throw new Error("Expected to find root ID.");
                        }
                        flushPendingEvents(rootID);
                      }
                    }
                  }, "receiveComponent"),
                  unmountComponent: /* @__PURE__ */ __name(function unmountComponent(fn, args) {
                    var internalInstance = args[0];
                    if (getElementType(internalInstance) === ElementTypeOtherOrUnknown) {
                      return fn.apply(this, args);
                    }
                    var id = getID(internalInstance);
                    parentIDStack.push(id);
                    try {
                      var result = fn.apply(this, args);
                      parentIDStack.pop();
                      recordUnmount(internalInstance, id);
                      return result;
                    } catch (err) {
                      parentIDStack = [];
                      throw err;
                    } finally {
                      if (parentIDStack.length === 0) {
                        var rootID = internalInstanceToRootIDMap.get(internalInstance);
                        if (rootID === void 0) {
                          throw new Error("Expected to find root ID.");
                        }
                        flushPendingEvents(rootID);
                      }
                    }
                  }, "unmountComponent")
                });
              }
              function cleanup() {
                if (oldReconcilerMethods !== null) {
                  if (renderer.Component) {
                    restoreMany(renderer.Component.Mixin, oldReconcilerMethods);
                  } else {
                    restoreMany(renderer.Reconciler, oldReconcilerMethods);
                  }
                }
                oldReconcilerMethods = null;
              }
              __name(cleanup, "cleanup");
              function recordMount(internalInstance, id, parentID) {
                var isRoot = parentID === 0;
                if (__DEBUG__) {
                  console.log("%crecordMount()", "color: green; font-weight: bold;", id, getData(internalInstance).displayName);
                }
                if (isRoot) {
                  var hasOwnerMetadata = internalInstance._currentElement != null && internalInstance._currentElement._owner != null;
                  pushOperation(TREE_OPERATION_ADD);
                  pushOperation(id);
                  pushOperation(ElementTypeRoot);
                  pushOperation(0);
                  pushOperation(0);
                  pushOperation(0);
                  pushOperation(hasOwnerMetadata ? 1 : 0);
                } else {
                  var type = getElementType(internalInstance);
                  var _getData = getData(internalInstance), displayName = _getData.displayName, key = _getData.key;
                  var ownerID = internalInstance._currentElement != null && internalInstance._currentElement._owner != null ? getID(internalInstance._currentElement._owner) : 0;
                  var displayNameStringID = getStringID(displayName);
                  var keyStringID = getStringID(key);
                  pushOperation(TREE_OPERATION_ADD);
                  pushOperation(id);
                  pushOperation(type);
                  pushOperation(parentID);
                  pushOperation(ownerID);
                  pushOperation(displayNameStringID);
                  pushOperation(keyStringID);
                }
              }
              __name(recordMount, "recordMount");
              function recordReorder(internalInstance, id, nextChildren) {
                pushOperation(TREE_OPERATION_REORDER_CHILDREN);
                pushOperation(id);
                var nextChildIDs = nextChildren.map(getID);
                pushOperation(nextChildIDs.length);
                for (var i = 0; i < nextChildIDs.length; i++) {
                  pushOperation(nextChildIDs[i]);
                }
              }
              __name(recordReorder, "recordReorder");
              function recordUnmount(internalInstance, id) {
                pendingUnmountedIDs.push(id);
                idToInternalInstanceMap.delete(id);
              }
              __name(recordUnmount, "recordUnmount");
              function crawlAndRecordInitialMounts(id, parentID, rootID) {
                if (__DEBUG__) {
                  console.group("crawlAndRecordInitialMounts() id:", id);
                }
                var internalInstance = idToInternalInstanceMap.get(id);
                if (internalInstance != null) {
                  internalInstanceToRootIDMap.set(internalInstance, rootID);
                  recordMount(internalInstance, id, parentID);
                  getChildren(internalInstance).forEach(function(child) {
                    return crawlAndRecordInitialMounts(getID(child), id, rootID);
                  });
                }
                if (__DEBUG__) {
                  console.groupEnd();
                }
              }
              __name(crawlAndRecordInitialMounts, "crawlAndRecordInitialMounts");
              function flushInitialOperations() {
                var roots = renderer.Mount._instancesByReactRootID || renderer.Mount._instancesByContainerID;
                for (var key in roots) {
                  var internalInstance = roots[key];
                  var _id2 = getID(internalInstance);
                  crawlAndRecordInitialMounts(_id2, 0, _id2);
                  flushPendingEvents(_id2);
                }
              }
              __name(flushInitialOperations, "flushInitialOperations");
              var pendingOperations = [];
              var pendingStringTable = /* @__PURE__ */ new Map();
              var pendingUnmountedIDs = [];
              var pendingStringTableLength = 0;
              var pendingUnmountedRootID = null;
              function flushPendingEvents(rootID) {
                if (pendingOperations.length === 0 && pendingUnmountedIDs.length === 0 && pendingUnmountedRootID === null) {
                  return;
                }
                var numUnmountIDs = pendingUnmountedIDs.length + (pendingUnmountedRootID === null ? 0 : 1);
                var operations = new Array(
                  // Identify which renderer this update is coming from.
                  2 + // [rendererID, rootFiberID]
                  // How big is the string table?
                  1 + // [stringTableLength]
                  // Then goes the actual string table.
                  pendingStringTableLength + // All unmounts are batched in a single message.
                  // [TREE_OPERATION_REMOVE, removedIDLength, ...ids]
                  (numUnmountIDs > 0 ? 2 + numUnmountIDs : 0) + // Mount operations
                  pendingOperations.length
                );
                var i = 0;
                operations[i++] = rendererID;
                operations[i++] = rootID;
                operations[i++] = pendingStringTableLength;
                pendingStringTable.forEach(function(value, key) {
                  operations[i++] = key.length;
                  var encodedKey = utfEncodeString(key);
                  for (var j2 = 0; j2 < encodedKey.length; j2++) {
                    operations[i + j2] = encodedKey[j2];
                  }
                  i += key.length;
                });
                if (numUnmountIDs > 0) {
                  operations[i++] = TREE_OPERATION_REMOVE;
                  operations[i++] = numUnmountIDs;
                  for (var j = 0; j < pendingUnmountedIDs.length; j++) {
                    operations[i++] = pendingUnmountedIDs[j];
                  }
                  if (pendingUnmountedRootID !== null) {
                    operations[i] = pendingUnmountedRootID;
                    i++;
                  }
                }
                for (var _j = 0; _j < pendingOperations.length; _j++) {
                  operations[i + _j] = pendingOperations[_j];
                }
                i += pendingOperations.length;
                if (__DEBUG__) {
                  printOperationsArray(operations);
                }
                hook2.emit("operations", operations);
                pendingOperations.length = 0;
                pendingUnmountedIDs = [];
                pendingUnmountedRootID = null;
                pendingStringTable.clear();
                pendingStringTableLength = 0;
              }
              __name(flushPendingEvents, "flushPendingEvents");
              function pushOperation(op) {
                if (false) {
                }
                pendingOperations.push(op);
              }
              __name(pushOperation, "pushOperation");
              function getStringID(str) {
                if (str === null) {
                  return 0;
                }
                var existingID = pendingStringTable.get(str);
                if (existingID !== void 0) {
                  return existingID;
                }
                var stringID = pendingStringTable.size + 1;
                pendingStringTable.set(str, stringID);
                pendingStringTableLength += str.length + 1;
                return stringID;
              }
              __name(getStringID, "getStringID");
              var currentlyInspectedElementID = null;
              var currentlyInspectedPaths = {};
              function mergeInspectedPaths(path) {
                var current = currentlyInspectedPaths;
                path.forEach(function(key) {
                  if (!current[key]) {
                    current[key] = {};
                  }
                  current = current[key];
                });
              }
              __name(mergeInspectedPaths, "mergeInspectedPaths");
              function createIsPathAllowed(key) {
                return /* @__PURE__ */ __name(function isPathAllowed(path) {
                  var current = currentlyInspectedPaths[key];
                  if (!current) {
                    return false;
                  }
                  for (var i = 0; i < path.length; i++) {
                    current = current[path[i]];
                    if (!current) {
                      return false;
                    }
                  }
                  return true;
                }, "isPathAllowed");
              }
              __name(createIsPathAllowed, "createIsPathAllowed");
              function getInstanceAndStyle(id) {
                var instance = null;
                var style = null;
                var internalInstance = idToInternalInstanceMap.get(id);
                if (internalInstance != null) {
                  instance = internalInstance._instance || null;
                  var element = internalInstance._currentElement;
                  if (element != null && element.props != null) {
                    style = element.props.style || null;
                  }
                }
                return {
                  instance,
                  style
                };
              }
              __name(getInstanceAndStyle, "getInstanceAndStyle");
              function updateSelectedElement(id) {
                var internalInstance = idToInternalInstanceMap.get(id);
                if (internalInstance == null) {
                  console.warn('Could not find instance with id "'.concat(id, '"'));
                  return;
                }
                switch (getElementType(internalInstance)) {
                  case types_ElementTypeClass:
                    global2.$r = internalInstance._instance;
                    break;
                  case types_ElementTypeFunction:
                    var element = internalInstance._currentElement;
                    if (element == null) {
                      console.warn('Could not find element with id "'.concat(id, '"'));
                      return;
                    }
                    global2.$r = {
                      props: element.props,
                      type: element.type
                    };
                    break;
                  default:
                    global2.$r = null;
                    break;
                }
              }
              __name(updateSelectedElement, "updateSelectedElement");
              function storeAsGlobal(id, path, count) {
                var inspectedElement = inspectElementRaw(id);
                if (inspectedElement !== null) {
                  var value = utils_getInObject(inspectedElement, path);
                  var key = "$reactTemp".concat(count);
                  window[key] = value;
                  console.log(key);
                  console.log(value);
                }
              }
              __name(storeAsGlobal, "storeAsGlobal");
              function getSerializedElementValueByPath(id, path) {
                var inspectedElement = inspectElementRaw(id);
                if (inspectedElement !== null) {
                  var valueToCopy = utils_getInObject(inspectedElement, path);
                  return serializeToString(valueToCopy);
                }
              }
              __name(getSerializedElementValueByPath, "getSerializedElementValueByPath");
              function inspectElement(requestID, id, path, forceFullData) {
                if (forceFullData || currentlyInspectedElementID !== id) {
                  currentlyInspectedElementID = id;
                  currentlyInspectedPaths = {};
                }
                var inspectedElement = inspectElementRaw(id);
                if (inspectedElement === null) {
                  return {
                    id,
                    responseID: requestID,
                    type: "not-found"
                  };
                }
                if (path !== null) {
                  mergeInspectedPaths(path);
                }
                updateSelectedElement(id);
                inspectedElement.context = cleanForBridge(inspectedElement.context, createIsPathAllowed("context"));
                inspectedElement.props = cleanForBridge(inspectedElement.props, createIsPathAllowed("props"));
                inspectedElement.state = cleanForBridge(inspectedElement.state, createIsPathAllowed("state"));
                return {
                  id,
                  responseID: requestID,
                  type: "full-data",
                  value: inspectedElement
                };
              }
              __name(inspectElement, "inspectElement");
              function inspectElementRaw(id) {
                var internalInstance = idToInternalInstanceMap.get(id);
                if (internalInstance == null) {
                  return null;
                }
                var _getData2 = getData(internalInstance), displayName = _getData2.displayName, key = _getData2.key;
                var type = getElementType(internalInstance);
                var context = null;
                var owners = null;
                var props = null;
                var state = null;
                var source = null;
                var element = internalInstance._currentElement;
                if (element !== null) {
                  props = element.props;
                  source = element._source != null ? element._source : null;
                  var owner = element._owner;
                  if (owner) {
                    owners = [];
                    while (owner != null) {
                      owners.push({
                        displayName: getData(owner).displayName || "Unknown",
                        id: getID(owner),
                        key: element.key,
                        type: getElementType(owner)
                      });
                      if (owner._currentElement) {
                        owner = owner._currentElement._owner;
                      }
                    }
                  }
                }
                var publicInstance = internalInstance._instance;
                if (publicInstance != null) {
                  context = publicInstance.context || null;
                  state = publicInstance.state || null;
                }
                var errors = [];
                var warnings = [];
                return {
                  id,
                  // Does the current renderer support editable hooks and function props?
                  canEditHooks: false,
                  canEditFunctionProps: false,
                  // Does the current renderer support advanced editing interface?
                  canEditHooksAndDeletePaths: false,
                  canEditHooksAndRenamePaths: false,
                  canEditFunctionPropsDeletePaths: false,
                  canEditFunctionPropsRenamePaths: false,
                  // Toggle error boundary did not exist in legacy versions
                  canToggleError: false,
                  isErrored: false,
                  targetErrorBoundaryID: null,
                  // Suspense did not exist in legacy versions
                  canToggleSuspense: false,
                  // Can view component source location.
                  canViewSource: type === types_ElementTypeClass || type === types_ElementTypeFunction,
                  // Only legacy context exists in legacy versions.
                  hasLegacyContext: true,
                  displayName,
                  type,
                  key: key != null ? key : null,
                  // Inspectable properties.
                  context,
                  hooks: null,
                  props,
                  state,
                  errors,
                  warnings,
                  // List of owners
                  owners,
                  // Location of component in source code.
                  source,
                  rootType: null,
                  rendererPackageName: null,
                  rendererVersion: null,
                  plugins: {
                    stylex: null
                  }
                };
              }
              __name(inspectElementRaw, "inspectElementRaw");
              function logElementToConsole(id) {
                var result = inspectElementRaw(id);
                if (result === null) {
                  console.warn('Could not find element with id "'.concat(id, '"'));
                  return;
                }
                var supportsGroup = typeof console.groupCollapsed === "function";
                if (supportsGroup) {
                  console.groupCollapsed(
                    "[Click to expand] %c<".concat(result.displayName || "Component", " />"),
                    // --dom-tag-name-color is the CSS variable Chrome styles HTML elements with in the console.
                    "color: var(--dom-tag-name-color); font-weight: normal;"
                  );
                }
                if (result.props !== null) {
                  console.log("Props:", result.props);
                }
                if (result.state !== null) {
                  console.log("State:", result.state);
                }
                if (result.context !== null) {
                  console.log("Context:", result.context);
                }
                var nativeNode = findNativeNodeForInternalID(id);
                if (nativeNode !== null) {
                  console.log("Node:", nativeNode);
                }
                if (window.chrome || /firefox/i.test(navigator.userAgent)) {
                  console.log("Right-click any value to save it as a global variable for further inspection.");
                }
                if (supportsGroup) {
                  console.groupEnd();
                }
              }
              __name(logElementToConsole, "logElementToConsole");
              function prepareViewAttributeSource(id, path) {
                var inspectedElement = inspectElementRaw(id);
                if (inspectedElement !== null) {
                  window.$attribute = utils_getInObject(inspectedElement, path);
                }
              }
              __name(prepareViewAttributeSource, "prepareViewAttributeSource");
              function prepareViewElementSource(id) {
                var internalInstance = idToInternalInstanceMap.get(id);
                if (internalInstance == null) {
                  console.warn('Could not find instance with id "'.concat(id, '"'));
                  return;
                }
                var element = internalInstance._currentElement;
                if (element == null) {
                  console.warn('Could not find element with id "'.concat(id, '"'));
                  return;
                }
                global2.$type = element.type;
              }
              __name(prepareViewElementSource, "prepareViewElementSource");
              function deletePath(type, id, hookID, path) {
                var internalInstance = idToInternalInstanceMap.get(id);
                if (internalInstance != null) {
                  var publicInstance = internalInstance._instance;
                  if (publicInstance != null) {
                    switch (type) {
                      case "context":
                        deletePathInObject(publicInstance.context, path);
                        forceUpdate(publicInstance);
                        break;
                      case "hooks":
                        throw new Error("Hooks not supported by this renderer");
                      case "props":
                        var element = internalInstance._currentElement;
                        internalInstance._currentElement = legacy_renderer_objectSpread(legacy_renderer_objectSpread({}, element), {}, {
                          props: copyWithDelete(element.props, path)
                        });
                        forceUpdate(publicInstance);
                        break;
                      case "state":
                        deletePathInObject(publicInstance.state, path);
                        forceUpdate(publicInstance);
                        break;
                    }
                  }
                }
              }
              __name(deletePath, "deletePath");
              function renamePath(type, id, hookID, oldPath, newPath) {
                var internalInstance = idToInternalInstanceMap.get(id);
                if (internalInstance != null) {
                  var publicInstance = internalInstance._instance;
                  if (publicInstance != null) {
                    switch (type) {
                      case "context":
                        renamePathInObject(publicInstance.context, oldPath, newPath);
                        forceUpdate(publicInstance);
                        break;
                      case "hooks":
                        throw new Error("Hooks not supported by this renderer");
                      case "props":
                        var element = internalInstance._currentElement;
                        internalInstance._currentElement = legacy_renderer_objectSpread(legacy_renderer_objectSpread({}, element), {}, {
                          props: copyWithRename(element.props, oldPath, newPath)
                        });
                        forceUpdate(publicInstance);
                        break;
                      case "state":
                        renamePathInObject(publicInstance.state, oldPath, newPath);
                        forceUpdate(publicInstance);
                        break;
                    }
                  }
                }
              }
              __name(renamePath, "renamePath");
              function overrideValueAtPath(type, id, hookID, path, value) {
                var internalInstance = idToInternalInstanceMap.get(id);
                if (internalInstance != null) {
                  var publicInstance = internalInstance._instance;
                  if (publicInstance != null) {
                    switch (type) {
                      case "context":
                        utils_setInObject(publicInstance.context, path, value);
                        forceUpdate(publicInstance);
                        break;
                      case "hooks":
                        throw new Error("Hooks not supported by this renderer");
                      case "props":
                        var element = internalInstance._currentElement;
                        internalInstance._currentElement = legacy_renderer_objectSpread(legacy_renderer_objectSpread({}, element), {}, {
                          props: copyWithSet(element.props, path, value)
                        });
                        forceUpdate(publicInstance);
                        break;
                      case "state":
                        utils_setInObject(publicInstance.state, path, value);
                        forceUpdate(publicInstance);
                        break;
                    }
                  }
                }
              }
              __name(overrideValueAtPath, "overrideValueAtPath");
              var getProfilingData = /* @__PURE__ */ __name(function getProfilingData2() {
                throw new Error("getProfilingData not supported by this renderer");
              }, "getProfilingData");
              var handleCommitFiberRoot = /* @__PURE__ */ __name(function handleCommitFiberRoot2() {
                throw new Error("handleCommitFiberRoot not supported by this renderer");
              }, "handleCommitFiberRoot");
              var handleCommitFiberUnmount = /* @__PURE__ */ __name(function handleCommitFiberUnmount2() {
                throw new Error("handleCommitFiberUnmount not supported by this renderer");
              }, "handleCommitFiberUnmount");
              var handlePostCommitFiberRoot = /* @__PURE__ */ __name(function handlePostCommitFiberRoot2() {
                throw new Error("handlePostCommitFiberRoot not supported by this renderer");
              }, "handlePostCommitFiberRoot");
              var overrideError = /* @__PURE__ */ __name(function overrideError2() {
                throw new Error("overrideError not supported by this renderer");
              }, "overrideError");
              var overrideSuspense = /* @__PURE__ */ __name(function overrideSuspense2() {
                throw new Error("overrideSuspense not supported by this renderer");
              }, "overrideSuspense");
              var startProfiling = /* @__PURE__ */ __name(function startProfiling2() {
              }, "startProfiling");
              var stopProfiling = /* @__PURE__ */ __name(function stopProfiling2() {
              }, "stopProfiling");
              function getBestMatchForTrackedPath() {
                return null;
              }
              __name(getBestMatchForTrackedPath, "getBestMatchForTrackedPath");
              function getPathForElement(id) {
                return null;
              }
              __name(getPathForElement, "getPathForElement");
              function updateComponentFilters(componentFilters) {
              }
              __name(updateComponentFilters, "updateComponentFilters");
              function setTraceUpdatesEnabled(enabled) {
              }
              __name(setTraceUpdatesEnabled, "setTraceUpdatesEnabled");
              function setTrackedPath(path) {
              }
              __name(setTrackedPath, "setTrackedPath");
              function getOwnersList(id) {
                return null;
              }
              __name(getOwnersList, "getOwnersList");
              function clearErrorsAndWarnings() {
              }
              __name(clearErrorsAndWarnings, "clearErrorsAndWarnings");
              function clearErrorsForFiberID(id) {
              }
              __name(clearErrorsForFiberID, "clearErrorsForFiberID");
              function clearWarningsForFiberID(id) {
              }
              __name(clearWarningsForFiberID, "clearWarningsForFiberID");
              function patchConsoleForStrictMode() {
              }
              __name(patchConsoleForStrictMode, "patchConsoleForStrictMode");
              function unpatchConsoleForStrictMode() {
              }
              __name(unpatchConsoleForStrictMode, "unpatchConsoleForStrictMode");
              function hasFiberWithId(id) {
                return idToInternalInstanceMap.has(id);
              }
              __name(hasFiberWithId, "hasFiberWithId");
              return {
                clearErrorsAndWarnings,
                clearErrorsForFiberID,
                clearWarningsForFiberID,
                cleanup,
                getSerializedElementValueByPath,
                deletePath,
                flushInitialOperations,
                getBestMatchForTrackedPath,
                getDisplayNameForFiberID,
                getFiberForNative,
                getFiberIDForNative: getInternalIDForNative,
                getInstanceAndStyle,
                findNativeNodesForFiberID: /* @__PURE__ */ __name(function findNativeNodesForFiberID(id) {
                  var nativeNode = findNativeNodeForInternalID(id);
                  return nativeNode == null ? null : [nativeNode];
                }, "findNativeNodesForFiberID"),
                getOwnersList,
                getPathForElement,
                getProfilingData,
                handleCommitFiberRoot,
                handleCommitFiberUnmount,
                handlePostCommitFiberRoot,
                hasFiberWithId,
                inspectElement,
                logElementToConsole,
                overrideError,
                overrideSuspense,
                overrideValueAtPath,
                renamePath,
                patchConsoleForStrictMode,
                prepareViewAttributeSource,
                prepareViewElementSource,
                renderer,
                setTraceUpdatesEnabled,
                setTrackedPath,
                startProfiling,
                stopProfiling,
                storeAsGlobal,
                unpatchConsoleForStrictMode,
                updateComponentFilters
              };
            }
            __name(renderer_attach, "renderer_attach");
            ;
            function isMatchingRender(version) {
              return !hasAssignedBackend(version);
            }
            __name(isMatchingRender, "isMatchingRender");
            function initBackend(hook2, agent2, global2) {
              if (hook2 == null) {
                return function() {
                };
              }
              var subs = [
                hook2.sub("renderer-attached", function(_ref) {
                  var id = _ref.id, renderer = _ref.renderer, rendererInterface = _ref.rendererInterface;
                  agent2.setRendererInterface(id, rendererInterface);
                  rendererInterface.flushInitialOperations();
                }),
                hook2.sub("unsupported-renderer-version", function(id) {
                  agent2.onUnsupportedRenderer(id);
                }),
                hook2.sub("fastRefreshScheduled", agent2.onFastRefreshScheduled),
                hook2.sub("operations", agent2.onHookOperations),
                hook2.sub("traceUpdates", agent2.onTraceUpdates)
                // TODO Add additional subscriptions required for profiling mode
              ];
              var attachRenderer = /* @__PURE__ */ __name(function attachRenderer2(id, renderer) {
                if (!isMatchingRender(renderer.reconcilerVersion || renderer.version)) {
                  return;
                }
                var rendererInterface = hook2.rendererInterfaces.get(id);
                if (rendererInterface == null) {
                  if (typeof renderer.findFiberByHostInstance === "function") {
                    rendererInterface = attach(hook2, id, renderer, global2);
                  } else if (renderer.ComponentTree) {
                    rendererInterface = renderer_attach(hook2, id, renderer, global2);
                  } else {
                  }
                  if (rendererInterface != null) {
                    hook2.rendererInterfaces.set(id, rendererInterface);
                  }
                }
                if (rendererInterface != null) {
                  hook2.emit("renderer-attached", {
                    id,
                    renderer,
                    rendererInterface
                  });
                } else {
                  hook2.emit("unsupported-renderer-version", id);
                }
              }, "attachRenderer");
              hook2.renderers.forEach(function(renderer, id) {
                attachRenderer(id, renderer);
              });
              subs.push(hook2.sub("renderer", function(_ref2) {
                var id = _ref2.id, renderer = _ref2.renderer;
                attachRenderer(id, renderer);
              }));
              hook2.emit("react-devtools", agent2);
              hook2.reactDevtoolsAgent = agent2;
              var onAgentShutdown = /* @__PURE__ */ __name(function onAgentShutdown2() {
                subs.forEach(function(fn) {
                  return fn();
                });
                hook2.rendererInterfaces.forEach(function(rendererInterface) {
                  rendererInterface.cleanup();
                });
                hook2.reactDevtoolsAgent = null;
              }, "onAgentShutdown");
              agent2.addListener("shutdown", onAgentShutdown);
              subs.push(function() {
                agent2.removeListener("shutdown", onAgentShutdown);
              });
              return function() {
                subs.forEach(function(fn) {
                  return fn();
                });
              };
            }
            __name(initBackend, "initBackend");
            ;
            function resolveBoxStyle(prefix2, style) {
              var hasParts = false;
              var result = {
                bottom: 0,
                left: 0,
                right: 0,
                top: 0
              };
              var styleForAll = style[prefix2];
              if (styleForAll != null) {
                for (var _i = 0, _Object$keys = Object.keys(result); _i < _Object$keys.length; _i++) {
                  var key = _Object$keys[_i];
                  result[key] = styleForAll;
                }
                hasParts = true;
              }
              var styleForHorizontal = style[prefix2 + "Horizontal"];
              if (styleForHorizontal != null) {
                result.left = styleForHorizontal;
                result.right = styleForHorizontal;
                hasParts = true;
              } else {
                var styleForLeft = style[prefix2 + "Left"];
                if (styleForLeft != null) {
                  result.left = styleForLeft;
                  hasParts = true;
                }
                var styleForRight = style[prefix2 + "Right"];
                if (styleForRight != null) {
                  result.right = styleForRight;
                  hasParts = true;
                }
                var styleForEnd = style[prefix2 + "End"];
                if (styleForEnd != null) {
                  result.right = styleForEnd;
                  hasParts = true;
                }
                var styleForStart = style[prefix2 + "Start"];
                if (styleForStart != null) {
                  result.left = styleForStart;
                  hasParts = true;
                }
              }
              var styleForVertical = style[prefix2 + "Vertical"];
              if (styleForVertical != null) {
                result.bottom = styleForVertical;
                result.top = styleForVertical;
                hasParts = true;
              } else {
                var styleForBottom = style[prefix2 + "Bottom"];
                if (styleForBottom != null) {
                  result.bottom = styleForBottom;
                  hasParts = true;
                }
                var styleForTop = style[prefix2 + "Top"];
                if (styleForTop != null) {
                  result.top = styleForTop;
                  hasParts = true;
                }
              }
              return hasParts ? result : null;
            }
            __name(resolveBoxStyle, "resolveBoxStyle");
            ;
            function setupNativeStyleEditor_typeof(obj) {
              "@babel/helpers - typeof";
              if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                setupNativeStyleEditor_typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                  return typeof obj2;
                }, "_typeof");
              } else {
                setupNativeStyleEditor_typeof = /* @__PURE__ */ __name(function _typeof2(obj2) {
                  return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                }, "_typeof");
              }
              return setupNativeStyleEditor_typeof(obj);
            }
            __name(setupNativeStyleEditor_typeof, "setupNativeStyleEditor_typeof");
            function setupNativeStyleEditor_defineProperty(obj, key, value) {
              if (key in obj) {
                Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
              } else {
                obj[key] = value;
              }
              return obj;
            }
            __name(setupNativeStyleEditor_defineProperty, "setupNativeStyleEditor_defineProperty");
            function setupNativeStyleEditor(bridge, agent2, resolveNativeStyle, validAttributes) {
              bridge.addListener("NativeStyleEditor_measure", function(_ref) {
                var id = _ref.id, rendererID = _ref.rendererID;
                measureStyle(agent2, bridge, resolveNativeStyle, id, rendererID);
              });
              bridge.addListener("NativeStyleEditor_renameAttribute", function(_ref2) {
                var id = _ref2.id, rendererID = _ref2.rendererID, oldName = _ref2.oldName, newName = _ref2.newName, value = _ref2.value;
                renameStyle(agent2, id, rendererID, oldName, newName, value);
                setTimeout(function() {
                  return measureStyle(agent2, bridge, resolveNativeStyle, id, rendererID);
                });
              });
              bridge.addListener("NativeStyleEditor_setValue", function(_ref3) {
                var id = _ref3.id, rendererID = _ref3.rendererID, name = _ref3.name, value = _ref3.value;
                setStyle(agent2, id, rendererID, name, value);
                setTimeout(function() {
                  return measureStyle(agent2, bridge, resolveNativeStyle, id, rendererID);
                });
              });
              bridge.send("isNativeStyleEditorSupported", {
                isSupported: true,
                validAttributes
              });
            }
            __name(setupNativeStyleEditor, "setupNativeStyleEditor");
            var EMPTY_BOX_STYLE = {
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            };
            var componentIDToStyleOverrides = /* @__PURE__ */ new Map();
            function measureStyle(agent2, bridge, resolveNativeStyle, id, rendererID) {
              var data = agent2.getInstanceAndStyle({
                id,
                rendererID
              });
              if (!data || !data.style) {
                bridge.send("NativeStyleEditor_styleAndLayout", {
                  id,
                  layout: null,
                  style: null
                });
                return;
              }
              var instance = data.instance, style = data.style;
              var resolvedStyle = resolveNativeStyle(style);
              var styleOverrides = componentIDToStyleOverrides.get(id);
              if (styleOverrides != null) {
                resolvedStyle = Object.assign({}, resolvedStyle, styleOverrides);
              }
              if (!instance || typeof instance.measure !== "function") {
                bridge.send("NativeStyleEditor_styleAndLayout", {
                  id,
                  layout: null,
                  style: resolvedStyle || null
                });
                return;
              }
              instance.measure(function(x, y, width, height, left, top) {
                if (typeof x !== "number") {
                  bridge.send("NativeStyleEditor_styleAndLayout", {
                    id,
                    layout: null,
                    style: resolvedStyle || null
                  });
                  return;
                }
                var margin = resolvedStyle != null && resolveBoxStyle("margin", resolvedStyle) || EMPTY_BOX_STYLE;
                var padding = resolvedStyle != null && resolveBoxStyle("padding", resolvedStyle) || EMPTY_BOX_STYLE;
                bridge.send("NativeStyleEditor_styleAndLayout", {
                  id,
                  layout: {
                    x,
                    y,
                    width,
                    height,
                    left,
                    top,
                    margin,
                    padding
                  },
                  style: resolvedStyle || null
                });
              });
            }
            __name(measureStyle, "measureStyle");
            function shallowClone(object) {
              var cloned = {};
              for (var n in object) {
                cloned[n] = object[n];
              }
              return cloned;
            }
            __name(shallowClone, "shallowClone");
            function renameStyle(agent2, id, rendererID, oldName, newName, value) {
              var _ref4;
              var data = agent2.getInstanceAndStyle({
                id,
                rendererID
              });
              if (!data || !data.style) {
                return;
              }
              var instance = data.instance, style = data.style;
              var newStyle = newName ? (_ref4 = {}, setupNativeStyleEditor_defineProperty(_ref4, oldName, void 0), setupNativeStyleEditor_defineProperty(_ref4, newName, value), _ref4) : setupNativeStyleEditor_defineProperty({}, oldName, void 0);
              var customStyle;
              if (instance !== null && typeof instance.setNativeProps === "function") {
                var styleOverrides = componentIDToStyleOverrides.get(id);
                if (!styleOverrides) {
                  componentIDToStyleOverrides.set(id, newStyle);
                } else {
                  Object.assign(styleOverrides, newStyle);
                }
                instance.setNativeProps({
                  style: newStyle
                });
              } else if (src_isArray(style)) {
                var lastIndex = style.length - 1;
                if (setupNativeStyleEditor_typeof(style[lastIndex]) === "object" && !src_isArray(style[lastIndex])) {
                  customStyle = shallowClone(style[lastIndex]);
                  delete customStyle[oldName];
                  if (newName) {
                    customStyle[newName] = value;
                  } else {
                    customStyle[oldName] = void 0;
                  }
                  agent2.overrideValueAtPath({
                    type: "props",
                    id,
                    rendererID,
                    path: ["style", lastIndex],
                    value: customStyle
                  });
                } else {
                  agent2.overrideValueAtPath({
                    type: "props",
                    id,
                    rendererID,
                    path: ["style"],
                    value: style.concat([newStyle])
                  });
                }
              } else if (setupNativeStyleEditor_typeof(style) === "object") {
                customStyle = shallowClone(style);
                delete customStyle[oldName];
                if (newName) {
                  customStyle[newName] = value;
                } else {
                  customStyle[oldName] = void 0;
                }
                agent2.overrideValueAtPath({
                  type: "props",
                  id,
                  rendererID,
                  path: ["style"],
                  value: customStyle
                });
              } else {
                agent2.overrideValueAtPath({
                  type: "props",
                  id,
                  rendererID,
                  path: ["style"],
                  value: [style, newStyle]
                });
              }
              agent2.emit("hideNativeHighlight");
            }
            __name(renameStyle, "renameStyle");
            function setStyle(agent2, id, rendererID, name, value) {
              var data = agent2.getInstanceAndStyle({
                id,
                rendererID
              });
              if (!data || !data.style) {
                return;
              }
              var instance = data.instance, style = data.style;
              var newStyle = setupNativeStyleEditor_defineProperty({}, name, value);
              if (instance !== null && typeof instance.setNativeProps === "function") {
                var styleOverrides = componentIDToStyleOverrides.get(id);
                if (!styleOverrides) {
                  componentIDToStyleOverrides.set(id, newStyle);
                } else {
                  Object.assign(styleOverrides, newStyle);
                }
                instance.setNativeProps({
                  style: newStyle
                });
              } else if (src_isArray(style)) {
                var lastLength = style.length - 1;
                if (setupNativeStyleEditor_typeof(style[lastLength]) === "object" && !src_isArray(style[lastLength])) {
                  agent2.overrideValueAtPath({
                    type: "props",
                    id,
                    rendererID,
                    path: ["style", lastLength, name],
                    value
                  });
                } else {
                  agent2.overrideValueAtPath({
                    type: "props",
                    id,
                    rendererID,
                    path: ["style"],
                    value: style.concat([newStyle])
                  });
                }
              } else {
                agent2.overrideValueAtPath({
                  type: "props",
                  id,
                  rendererID,
                  path: ["style"],
                  value: [style, newStyle]
                });
              }
              agent2.emit("hideNativeHighlight");
            }
            __name(setStyle, "setStyle");
            ;
            function initializeUsingCachedSettings(devToolsSettingsManager) {
              initializeConsolePatchSettings(devToolsSettingsManager);
            }
            __name(initializeUsingCachedSettings, "initializeUsingCachedSettings");
            function initializeConsolePatchSettings(devToolsSettingsManager) {
              if (devToolsSettingsManager.getConsolePatchSettings == null) {
                return;
              }
              var consolePatchSettingsString = devToolsSettingsManager.getConsolePatchSettings();
              if (consolePatchSettingsString == null) {
                return;
              }
              var parsedConsolePatchSettings = parseConsolePatchSettings(consolePatchSettingsString);
              if (parsedConsolePatchSettings == null) {
                return;
              }
              writeConsolePatchSettingsToWindow(parsedConsolePatchSettings);
            }
            __name(initializeConsolePatchSettings, "initializeConsolePatchSettings");
            function parseConsolePatchSettings(consolePatchSettingsString) {
              var _castBool, _castBool2, _castBool3, _castBool4, _castBrowserTheme;
              var parsedValue = JSON.parse(consolePatchSettingsString !== null && consolePatchSettingsString !== void 0 ? consolePatchSettingsString : "{}");
              var appendComponentStack = parsedValue.appendComponentStack, breakOnConsoleErrors = parsedValue.breakOnConsoleErrors, showInlineWarningsAndErrors = parsedValue.showInlineWarningsAndErrors, hideConsoleLogsInStrictMode = parsedValue.hideConsoleLogsInStrictMode, browserTheme = parsedValue.browserTheme;
              return {
                appendComponentStack: (_castBool = castBool(appendComponentStack)) !== null && _castBool !== void 0 ? _castBool : true,
                breakOnConsoleErrors: (_castBool2 = castBool(breakOnConsoleErrors)) !== null && _castBool2 !== void 0 ? _castBool2 : false,
                showInlineWarningsAndErrors: (_castBool3 = castBool(showInlineWarningsAndErrors)) !== null && _castBool3 !== void 0 ? _castBool3 : true,
                hideConsoleLogsInStrictMode: (_castBool4 = castBool(hideConsoleLogsInStrictMode)) !== null && _castBool4 !== void 0 ? _castBool4 : false,
                browserTheme: (_castBrowserTheme = castBrowserTheme(browserTheme)) !== null && _castBrowserTheme !== void 0 ? _castBrowserTheme : "dark"
              };
            }
            __name(parseConsolePatchSettings, "parseConsolePatchSettings");
            function cacheConsolePatchSettings(devToolsSettingsManager, value) {
              if (devToolsSettingsManager.setConsolePatchSettings == null) {
                return;
              }
              devToolsSettingsManager.setConsolePatchSettings(JSON.stringify(value));
            }
            __name(cacheConsolePatchSettings, "cacheConsolePatchSettings");
            ;
            installConsoleFunctionsToWindow();
            installHook(window);
            var hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
            var savedComponentFilters = getDefaultComponentFilters();
            function backend_debug(methodName) {
              if (__DEBUG__) {
                var _console;
                for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                  args[_key - 1] = arguments[_key];
                }
                (_console = console).log.apply(_console, ["%c[core/backend] %c".concat(methodName), "color: teal; font-weight: bold;", "font-weight: bold;"].concat(args));
              }
            }
            __name(backend_debug, "backend_debug");
            function connectToDevTools(options) {
              if (hook == null) {
                return;
              }
              var _ref = options || {}, _ref$host = _ref.host, host = _ref$host === void 0 ? "localhost" : _ref$host, nativeStyleEditorValidAttributes = _ref.nativeStyleEditorValidAttributes, _ref$useHttps = _ref.useHttps, useHttps = _ref$useHttps === void 0 ? false : _ref$useHttps, _ref$port = _ref.port, port = _ref$port === void 0 ? 8097 : _ref$port, websocket = _ref.websocket, _ref$resolveRNStyle = _ref.resolveRNStyle, resolveRNStyle = _ref$resolveRNStyle === void 0 ? null : _ref$resolveRNStyle, _ref$retryConnectionD = _ref.retryConnectionDelay, retryConnectionDelay = _ref$retryConnectionD === void 0 ? 2e3 : _ref$retryConnectionD, _ref$isAppActive = _ref.isAppActive, isAppActive = _ref$isAppActive === void 0 ? function() {
                return true;
              } : _ref$isAppActive, devToolsSettingsManager = _ref.devToolsSettingsManager;
              var protocol = useHttps ? "wss" : "ws";
              var retryTimeoutID = null;
              function scheduleRetry() {
                if (retryTimeoutID === null) {
                  retryTimeoutID = setTimeout(function() {
                    return connectToDevTools(options);
                  }, retryConnectionDelay);
                }
              }
              __name(scheduleRetry, "scheduleRetry");
              if (devToolsSettingsManager != null) {
                try {
                  initializeUsingCachedSettings(devToolsSettingsManager);
                } catch (e) {
                  console.error(e);
                }
              }
              if (!isAppActive()) {
                scheduleRetry();
                return;
              }
              var bridge = null;
              var messageListeners = [];
              var uri = protocol + "://" + host + ":" + port;
              var ws = websocket ? websocket : new window.WebSocket(uri);
              ws.onclose = handleClose;
              ws.onerror = handleFailed;
              ws.onmessage = handleMessage;
              ws.onopen = function() {
                bridge = new src_bridge({
                  listen: /* @__PURE__ */ __name(function listen(fn) {
                    messageListeners.push(fn);
                    return function() {
                      var index = messageListeners.indexOf(fn);
                      if (index >= 0) {
                        messageListeners.splice(index, 1);
                      }
                    };
                  }, "listen"),
                  send: /* @__PURE__ */ __name(function send(event, payload, transferable) {
                    if (ws.readyState === ws.OPEN) {
                      if (__DEBUG__) {
                        backend_debug("wall.send()", event, payload);
                      }
                      ws.send(JSON.stringify({
                        event,
                        payload
                      }));
                    } else {
                      if (__DEBUG__) {
                        backend_debug("wall.send()", "Shutting down bridge because of closed WebSocket connection");
                      }
                      if (bridge !== null) {
                        bridge.shutdown();
                      }
                      scheduleRetry();
                    }
                  }, "send")
                });
                bridge.addListener("updateComponentFilters", function(componentFilters) {
                  savedComponentFilters = componentFilters;
                });
                if (devToolsSettingsManager != null && bridge != null) {
                  bridge.addListener("updateConsolePatchSettings", function(consolePatchSettings) {
                    return cacheConsolePatchSettings(devToolsSettingsManager, consolePatchSettings);
                  });
                }
                if (window.__REACT_DEVTOOLS_COMPONENT_FILTERS__ == null) {
                  bridge.send("overrideComponentFilters", savedComponentFilters);
                }
                var agent2 = new Agent(bridge);
                agent2.addListener("shutdown", function() {
                  hook.emit("shutdown");
                });
                initBackend(hook, agent2, window);
                if (resolveRNStyle != null || hook.resolveRNStyle != null) {
                  setupNativeStyleEditor(
                    // $FlowFixMe[incompatible-call] found when upgrading Flow
                    bridge,
                    agent2,
                    resolveRNStyle || hook.resolveRNStyle,
                    nativeStyleEditorValidAttributes || hook.nativeStyleEditorValidAttributes || null
                  );
                } else {
                  var lazyResolveRNStyle;
                  var lazyNativeStyleEditorValidAttributes;
                  var initAfterTick = /* @__PURE__ */ __name(function initAfterTick2() {
                    if (bridge !== null) {
                      setupNativeStyleEditor(bridge, agent2, lazyResolveRNStyle, lazyNativeStyleEditorValidAttributes);
                    }
                  }, "initAfterTick");
                  if (!hook.hasOwnProperty("resolveRNStyle")) {
                    Object.defineProperty(hook, "resolveRNStyle", {
                      enumerable: false,
                      get: /* @__PURE__ */ __name(function get() {
                        return lazyResolveRNStyle;
                      }, "get"),
                      set: /* @__PURE__ */ __name(function set(value) {
                        lazyResolveRNStyle = value;
                        initAfterTick();
                      }, "set")
                    });
                  }
                  if (!hook.hasOwnProperty("nativeStyleEditorValidAttributes")) {
                    Object.defineProperty(hook, "nativeStyleEditorValidAttributes", {
                      enumerable: false,
                      get: /* @__PURE__ */ __name(function get() {
                        return lazyNativeStyleEditorValidAttributes;
                      }, "get"),
                      set: /* @__PURE__ */ __name(function set(value) {
                        lazyNativeStyleEditorValidAttributes = value;
                        initAfterTick();
                      }, "set")
                    });
                  }
                }
              };
              function handleClose() {
                if (__DEBUG__) {
                  backend_debug("WebSocket.onclose");
                }
                if (bridge !== null) {
                  bridge.emit("shutdown");
                }
                scheduleRetry();
              }
              __name(handleClose, "handleClose");
              function handleFailed() {
                if (__DEBUG__) {
                  backend_debug("WebSocket.onerror");
                }
                scheduleRetry();
              }
              __name(handleFailed, "handleFailed");
              function handleMessage(event) {
                var data;
                try {
                  if (typeof event.data === "string") {
                    data = JSON.parse(event.data);
                    if (__DEBUG__) {
                      backend_debug("WebSocket.onmessage", data);
                    }
                  } else {
                    throw Error();
                  }
                } catch (e) {
                  console.error("[React DevTools] Failed to parse JSON: " + event.data);
                  return;
                }
                messageListeners.forEach(function(fn) {
                  try {
                    fn(data);
                  } catch (error) {
                    console.log("[React DevTools] Error calling listener", data);
                    console.log("error:", error);
                    throw error;
                  }
                });
              }
              __name(handleMessage, "handleMessage");
            }
            __name(connectToDevTools, "connectToDevTools");
          })();
          return __webpack_exports__;
        })()
      );
    });
  }
});

// node_modules/ink/build/devtools-window-polyfill.js
var customGlobal = global;
customGlobal.WebSocket ||= wrapper_default;
customGlobal.window ||= global;
customGlobal.self ||= global;
customGlobal.window.__REACT_DEVTOOLS_COMPONENT_FILTERS__ = [
  {
    // ComponentFilterElementType
    type: 1,
    // ElementTypeHostComponent
    value: 7,
    isEnabled: true
  },
  {
    // ComponentFilterDisplayName
    type: 2,
    value: "InternalApp",
    isEnabled: true,
    isValid: true
  },
  {
    // ComponentFilterDisplayName
    type: 2,
    value: "InternalAppContext",
    isEnabled: true,
    isValid: true
  },
  {
    // ComponentFilterDisplayName
    type: 2,
    value: "InternalStdoutContext",
    isEnabled: true,
    isValid: true
  },
  {
    // ComponentFilterDisplayName
    type: 2,
    value: "InternalStderrContext",
    isEnabled: true,
    isValid: true
  },
  {
    // ComponentFilterDisplayName
    type: 2,
    value: "InternalStdinContext",
    isEnabled: true,
    isValid: true
  },
  {
    // ComponentFilterDisplayName
    type: 2,
    value: "InternalFocusContext",
    isEnabled: true,
    isValid: true
  }
];

// node_modules/ink/build/devtools.js
var import_react_devtools_core = __toESM(require_backend(), 1);
import_react_devtools_core.default.connectToDevTools();
/*! Bundled license information:

react-devtools-core/dist/backend.js:
  (**
   * @license React
   * react-debug-tools.production.min.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
  (**
   * @license React
   * react-is.production.min.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
  (**
   * @license React
   * react.production.min.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
//# sourceMappingURL=devtools-PYJJA3JG.js.map
