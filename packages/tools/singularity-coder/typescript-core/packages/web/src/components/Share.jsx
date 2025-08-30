"use strict"
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i]
          for (const p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]
        }
        return t
      }
    return __assign.apply(this, arguments)
  }
const __rest =
  (this && this.__rest) ||
  function (s, e) {
    const t = {}
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p]
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]]
      }
    return t
  }
const __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i)
          ar[i] = from[i]
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from))
  }
Object.defineProperty(exports, "__esModule", { value: true })
exports.default = Share
exports.fromV1 = fromV1
const luxon_1 = require("luxon")
const solid_js_1 = require("solid-js")
const store_1 = require("solid-js/store")
const icons_1 = require("./icons")
const custom_1 = require("./icons/custom")
const part_1 = require("./share/part")
const share_module_css_1 = require("./share.module.css")
function scrollToAnchor(id) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: "smooth" })
}
function getStatusText(status) {
  switch (status[0]) {
    case "connected":
      return "Connected, waiting for messages..."
    case "connecting":
      return "Connecting..."
    case "disconnected":
      return "Disconnected"
    case "reconnecting":
      return "Reconnecting..."
    case "error":
      return status[1] || "Error"
    default:
      return "Unknown"
  }
}
function Share(props) {
  let _a
  let _b, _c, _d
  let lastScrollY = 0
  let hasScrolledToAnchor = false
  let scrollTimeout
  let scrollSentinel
  let scrollObserver
  const id = props.id
  const params = new URLSearchParams(window.location.search)
  const debug = params.get("debug") === "true"
  const _e = (0, solid_js_1.createSignal)(false),
    showScrollButton = _e[0],
    setShowScrollButton = _e[1]
  const _f = (0, solid_js_1.createSignal)(false),
    isButtonHovered = _f[0],
    setIsButtonHovered = _f[1]
  const _g = (0, solid_js_1.createSignal)(false),
    isNearBottom = _g[0],
    setIsNearBottom = _g[1]
  const _h = (0, store_1.createStore)({ info: props.info, messages: props.messages }),
    store = _h[0],
    setStore = _h[1]
  const messages = (0, solid_js_1.createMemo)(() => {
    return Object.values(store.messages).toSorted((a, b) => {
      let _a
      return (_a = a.id) === null || _a === void 0 ? void 0 : _a.localeCompare(b.id)
    })
  })
  const _j = (0, solid_js_1.createSignal)(["disconnected", "Disconnected"]),
    connectionStatus = _j[0],
    setConnectionStatus = _j[1]
  ;(0, solid_js_1.createEffect)(() => {
    console.log((0, store_1.unwrap)(store))
  })
  ;(0, solid_js_1.onMount)(() => {
    const apiUrl = props.api
    if (!id) {
      setConnectionStatus(["error", "id not found"])
      return
    }
    if (!apiUrl) {
      console.error("API URL not found in environment variables")
      setConnectionStatus(["error", "API URL not found"])
      return
    }
    let reconnectTimer
    let socket = null
    // Function to create and set up WebSocket with auto-reconnect
    const setupWebSocket = function () {
      // Close any existing connection
      if (socket) {
        socket.close()
      }
      setConnectionStatus(["connecting"])
      // Always use secure WebSocket protocol (wss)
      const wsBaseUrl = apiUrl.replace(/^https?:\/\//, "wss://")
      const wsUrl = "".concat(wsBaseUrl, "/share_poll?id=").concat(id)
      console.log("Connecting to WebSocket URL:", wsUrl)
      // Create WebSocket connection
      socket = new WebSocket(wsUrl)
      // Handle connection opening
      socket.onopen = function () {
        setConnectionStatus(["connected"])
        console.log("WebSocket connection established")
      }
      // Handle incoming messages
      socket.onmessage = function (event) {
        let _a, _b, _c
        console.log("WebSocket message received")
        try {
          const d_1 = JSON.parse(event.data)
          const _d = d_1.key.split("/"),
            root = _d[0],
            type = _d[1],
            splits = _d.slice(2)
          if (root !== "session") return
          if (type === "info") {
            setStore("info", (0, store_1.reconcile)(d_1.content))
            return
          }
          if (type === "message") {
            const messageID = splits[1]
            if ("metadata" in d_1.content) {
              d_1.content = fromV1(d_1.content)
            }
            d_1.content.parts =
              (_c =
                (_a = d_1.content.parts) !== null && _a !== void 0
                  ? _a
                  : (_b = store.messages[messageID]) === null || _b === void 0
                    ? void 0
                    : _b.parts) !== null && _c !== void 0
                ? _c
                : []
            setStore("messages", messageID, (0, store_1.reconcile)(d_1.content))
          }
          if (type === "part") {
            setStore("messages", d_1.content.messageID, "parts", (arr) => {
              const index = arr.findIndex((x) => {
                return x.id === d_1.content.id
              })
              if (index === -1) arr.push(d_1.content)
              if (index > -1) arr[index] = d_1.content
              return __spreadArray([], arr, true)
            })
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }
      // Handle errors
      socket.onerror = function (error) {
        console.error("WebSocket error:", error)
        setConnectionStatus(["error", "Connection failed"])
      }
      // Handle connection close and reconnection
      socket.onclose = function (event) {
        console.log("WebSocket closed: ".concat(event.code, " ").concat(event.reason))
        setConnectionStatus(["reconnecting"])
        // Try to reconnect after 2 seconds
        clearTimeout(reconnectTimer)
        reconnectTimer = window.setTimeout(setupWebSocket, 2000)
      }
    }
    // Initial connection
    setupWebSocket()
    // Clean up on component unmount
    ;(0, solid_js_1.onCleanup)(() => {
      console.log("Cleaning up WebSocket connection")
      if (socket) {
        socket.close()
      }
      clearTimeout(reconnectTimer)
    })
  })
  function checkScrollNeed() {
    const currentScrollY = window.scrollY
    const isScrollingDown = currentScrollY > lastScrollY
    const scrolled = currentScrollY > 200 // Show after scrolling 200px
    // Only show when scrolling down, scrolled enough, and not near bottom
    const shouldShow = isScrollingDown && scrolled && !isNearBottom()
    // Update last scroll position
    lastScrollY = currentScrollY
    if (shouldShow) {
      setShowScrollButton(true)
      // Clear existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      // Hide button after 3 seconds of no scrolling (unless hovered)
      scrollTimeout = window.setTimeout(() => {
        if (!isButtonHovered()) {
          setShowScrollButton(false)
        }
      }, 1500)
    } else if (!isButtonHovered()) {
      // Only hide if not hovered (to prevent disappearing while user is about to click)
      setShowScrollButton(false)
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
    }
  }
  ;(0, solid_js_1.onMount)(() => {
    lastScrollY = window.scrollY // Initialize scroll position
    // Create sentinel element
    const sentinel = document.createElement("div")
    sentinel.style.height = "1px"
    sentinel.style.position = "absolute"
    sentinel.style.bottom = "100px"
    sentinel.style.width = "100%"
    sentinel.style.pointerEvents = "none"
    document.body.appendChild(sentinel)
    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
      setIsNearBottom(entries[0].isIntersecting)
    })
    observer.observe(sentinel)
    // Store references for cleanup
    scrollSentinel = sentinel
    scrollObserver = observer
    checkScrollNeed()
    window.addEventListener("scroll", checkScrollNeed)
    window.addEventListener("resize", checkScrollNeed)
  })
  ;(0, solid_js_1.onCleanup)(() => {
    window.removeEventListener("scroll", checkScrollNeed)
    window.removeEventListener("resize", checkScrollNeed)
    // Clean up observer and sentinel
    if (scrollObserver) {
      scrollObserver.disconnect()
    }
    if (scrollSentinel) {
      document.body.removeChild(scrollSentinel)
    }
    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
    }
  })
  const data = (0, solid_js_1.createMemo)(() => {
    const result = {
      rootDir: undefined,
      created: undefined,
      completed: undefined,
      messages: [],
      models: {},
      cost: 0,
      tokens: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
    }
    result.created = props.info.time.created
    const msgs = messages()
    for (let _i = 0, msgs_1 = msgs; _i < msgs_1.length; _i++) {
      const msg = msgs_1[_i]
      result.messages.push(msg)
      if (msg.role === "assistant") {
        result.cost += msg.cost
        result.tokens.input += msg.tokens.input
        result.tokens.output += msg.tokens.output
        result.tokens.reasoning += msg.tokens.reasoning
        result.models["".concat(msg.providerID, " ").concat(msg.modelID)] = [msg.providerID, msg.modelID]
        if (msg.path.root) {
          result.rootDir = msg.path.root
        }
        if (msg.time.completed) {
          result.completed = msg.time.completed
        }
      }
    }
    return result
  })
  return (
    <main classList={((_a = {}), (_a[share_module_css_1.default.root] = true), (_a["not-content"] = true), _a)}>
      <div data-component="header">
        <h1 data-component="header-title">{(_b = store.info) === null || _b === void 0 ? void 0 : _b.title}</h1>
        <div data-component="header-details">
          <ul data-component="header-stats">
            <li title="opencode version" data-slot="item">
              <div data-slot="icon" title="opencode">
                <custom_1.IconOpencode width={16} height={16} />
              </div>
              <solid_js_1.Show
                when={(_c = store.info) === null || _c === void 0 ? void 0 : _c.version}
                fallback="v0.0.1"
              >
                <span>v{(_d = store.info) === null || _d === void 0 ? void 0 : _d.version}</span>
              </solid_js_1.Show>
            </li>
            {Object.values(data().models).length > 0 ? (
              <solid_js_1.For each={Object.values(data().models)}>
                {function (_a) {
                  const provider = _a[0],
                    model = _a[1]
                  return (
                    <li data-slot="item">
                      <div data-slot="icon" title={provider}>
                        <part_1.ProviderIcon model={model} />
                      </div>
                      <span data-slot="model">{model}</span>
                    </li>
                  )
                }}
              </solid_js_1.For>
            ) : (
              <li>
                <span data-element-label>Models</span>
                <span data-placeholder>&mdash;</span>
              </li>
            )}
          </ul>
          <div
            data-component="header-time"
            title={luxon_1.DateTime.fromMillis(data().created || 0).toLocaleString(
              luxon_1.DateTime.DATETIME_FULL_WITH_SECONDS,
            )}
          >
            {luxon_1.DateTime.fromMillis(data().created || 0).toLocaleString(luxon_1.DateTime.DATETIME_MED)}
          </div>
        </div>
      </div>

      <div>
        <solid_js_1.Show when={data().messages.length > 0} fallback={<p>Waiting for messages...</p>}>
          <div class={share_module_css_1.default.parts}>
            <solid_js_1.SuspenseList revealOrder="forwards">
              <solid_js_1.For each={data().messages}>
                {function (msg, msgIndex) {
                  const filteredParts = (0, solid_js_1.createMemo)(() => {
                    return msg.parts.filter((x, index) => {
                      if (x.type === "step-start" && index > 0) return false
                      if (x.type === "snapshot") return false
                      if (x.type === "step-finish") return false
                      if (x.type === "text" && x.synthetic === true) return false
                      if (x.type === "tool" && x.tool === "todoread") return false
                      if (x.type === "text" && !x.text) return false
                      if (x.type === "tool" && (x.state.status === "pending" || x.state.status === "running"))
                        return false
                      return true
                    })
                  })
                  return (
                    <solid_js_1.Suspense>
                      <solid_js_1.For each={filteredParts()}>
                        {function (part, partIndex) {
                          const last = (0, solid_js_1.createMemo)(() => {
                            return (
                              data().messages.length === msgIndex() + 1 && filteredParts().length === partIndex() + 1
                            )
                          })
                          ;(0, solid_js_1.onMount)(() => {
                            const hash = window.location.hash.slice(1)
                            // Wait till all parts are loaded
                            if (
                              hash !== "" &&
                              !hasScrolledToAnchor &&
                              filteredParts().length === partIndex() + 1 &&
                              data().messages.length === msgIndex() + 1
                            ) {
                              hasScrolledToAnchor = true
                              scrollToAnchor(hash)
                            }
                          })
                          return <part_1.Part last={last()} part={part} index={partIndex()} message={msg} />
                        }}
                      </solid_js_1.For>
                    </solid_js_1.Suspense>
                  )
                }}
              </solid_js_1.For>
            </solid_js_1.SuspenseList>
            <div data-section="part" data-part-type="summary">
              <div data-section="decoration">
                <span data-status={connectionStatus()[0]}></span>
              </div>
              <div data-section="content">
                <p data-section="copy">{getStatusText(connectionStatus())}</p>
                <ul data-section="stats">
                  <li>
                    <span data-element-label>Cost</span>
                    {data().cost !== undefined ? (
                      <span>${data().cost.toFixed(2)}</span>
                    ) : (
                      <span data-placeholder>&mdash;</span>
                    )}
                  </li>
                  <li>
                    <span data-element-label>Input Tokens</span>
                    {data().tokens.input ? <span>{data().tokens.input}</span> : <span data-placeholder>&mdash;</span>}
                  </li>
                  <li>
                    <span data-element-label>Output Tokens</span>
                    {data().tokens.output ? <span>{data().tokens.output}</span> : <span data-placeholder>&mdash;</span>}
                  </li>
                  <li>
                    <span data-element-label>Reasoning Tokens</span>
                    {data().tokens.reasoning ? (
                      <span>{data().tokens.reasoning}</span>
                    ) : (
                      <span data-placeholder>&mdash;</span>
                    )}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </solid_js_1.Show>
      </div>

      <solid_js_1.Show when={debug}>
        <div style={{ margin: "2rem 0" }}>
          <div
            style={{
              border: "1px solid #ccc",
              padding: "1rem",
              "overflow-y": "auto",
            }}
          >
            <solid_js_1.Show when={data().messages.length > 0} fallback={<p>Waiting for messages...</p>}>
              <ul style={{ "list-style-type": "none", padding: 0 }}>
                <solid_js_1.For each={data().messages}>
                  {function (msg) {
                    return (
                      <li
                        style={{
                          padding: "0.75rem",
                          margin: "0.75rem 0",
                          "box-shadow": "0 1px 3px rgba(0,0,0,0.1)",
                        }}
                      >
                        <div>
                          <strong>Key:</strong> {msg.id}
                        </div>
                        <pre>{JSON.stringify(msg, null, 2)}</pre>
                      </li>
                    )
                  }}
                </solid_js_1.For>
              </ul>
            </solid_js_1.Show>
          </div>
        </div>
      </solid_js_1.Show>

      <solid_js_1.Show when={showScrollButton()}>
        <button
          type="button"
          class={share_module_css_1.default["scroll-button"]}
          onClick={function () {
            return document.body.scrollIntoView({ behavior: "smooth", block: "end" })
          }}
          onMouseEnter={function () {
            setIsButtonHovered(true)
            if (scrollTimeout) {
              clearTimeout(scrollTimeout)
            }
          }}
          onMouseLeave={function () {
            setIsButtonHovered(false)
            if (showScrollButton()) {
              scrollTimeout = window.setTimeout(() => {
                if (!isButtonHovered()) {
                  setShowScrollButton(false)
                }
              }, 3000)
            }
          }}
          title="Scroll to bottom"
          aria-label="Scroll to bottom"
        >
          <icons_1.IconArrowDown width={20} height={20} />
        </button>
      </solid_js_1.Show>
    </main>
  )
}
function fromV1(v1) {
  let _a, _b, _c, _d, _e, _f, _g, _h
  if (v1.role === "assistant") {
    return {
      id: v1.id,
      sessionID: v1.metadata.sessionID,
      role: "assistant",
      time: {
        created: v1.metadata.time.created,
        completed: v1.metadata.time.completed,
      },
      cost: (_a = v1.metadata.assistant) === null || _a === void 0 ? void 0 : _a.cost,
      path: (_b = v1.metadata.assistant) === null || _b === void 0 ? void 0 : _b.path,
      summary: (_c = v1.metadata.assistant) === null || _c === void 0 ? void 0 : _c.summary,
      tokens:
        (_e = (_d = v1.metadata.assistant) === null || _d === void 0 ? void 0 : _d.tokens) !== null && _e !== void 0
          ? _e
          : {
              input: 0,
              output: 0,
              cache: {
                read: 0,
                write: 0,
              },
              reasoning: 0,
            },
      modelID: (_f = v1.metadata.assistant) === null || _f === void 0 ? void 0 : _f.modelID,
      providerID: (_g = v1.metadata.assistant) === null || _g === void 0 ? void 0 : _g.providerID,
      system: (_h = v1.metadata.assistant) === null || _h === void 0 ? void 0 : _h.system,
      error: v1.metadata.error,
      parts: v1.parts.flatMap((part, index) => {
        const base = {
          id: index.toString(),
          messageID: v1.id,
          sessionID: v1.metadata.sessionID,
        }
        if (part.type === "text") {
          return [__assign(__assign({}, base), { type: "text", text: part.text })]
        }
        if (part.type === "step-start") {
          return [__assign(__assign({}, base), { type: "step-start" })]
        }
        if (part.type === "tool-invocation") {
          return [
            __assign(__assign({}, base), {
              type: "tool",
              callID: part.toolInvocation.toolCallId,
              tool: part.toolInvocation.toolName,
              state: (function () {
                if (part.toolInvocation.state === "partial-call") {
                  return {
                    status: "pending",
                  }
                }
                const _a = v1.metadata.tool[part.toolInvocation.toolCallId],
                  title = _a.title,
                  time = _a.time,
                  metadata = __rest(_a, ["title", "time"])
                if (part.toolInvocation.state === "call") {
                  return {
                    status: "running",
                    input: part.toolInvocation.args,
                    time: {
                      start: time.start,
                    },
                  }
                }
                if (part.toolInvocation.state === "result") {
                  return {
                    status: "completed",
                    input: part.toolInvocation.args,
                    output: part.toolInvocation.result,
                    title,
                    time,
                    metadata,
                  }
                }
                throw new Error("unknown tool invocation state")
              })(),
            }),
          ]
        }
        return []
      }),
    }
  }
  if (v1.role === "user") {
    return {
      id: v1.id,
      sessionID: v1.metadata.sessionID,
      role: "user",
      time: {
        created: v1.metadata.time.created,
      },
      parts: v1.parts.flatMap((part, index) => {
        const base = {
          id: index.toString(),
          messageID: v1.id,
          sessionID: v1.metadata.sessionID,
        }
        if (part.type === "text") {
          return [__assign(__assign({}, base), { type: "text", text: part.text })]
        }
        if (part.type === "file") {
          return [
            __assign(__assign({}, base), {
              type: "file",
              mime: part.mediaType,
              filename: part.filename,
              url: part.url,
            }),
          ]
        }
        return []
      }),
    }
  }
  throw new Error("unknown message type")
}
