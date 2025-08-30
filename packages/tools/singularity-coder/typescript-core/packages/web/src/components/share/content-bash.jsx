"use strict"
const __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value)
          })
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value))
        } catch (e) {
          reject(e)
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
  }
const __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    let _ = {
        label: 0,
        sent () {
          if (t[0] & 1) throw t[1]
          return t[1]
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype)
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this
        }),
      g
    )
    function verb(n) {
      return function (v) {
        return step([n, v])
      }
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.")
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t
          if (((y = 0), t)) op = [op[0] & 2, t.value]
          switch (op[0]) {
            case 0:
            case 1:
              t = op
              break
            case 4:
              _.label++
              return { value: op[1], done: false }
            case 5:
              _.label++
              y = op[1]
              op = [0]
              continue
            case 7:
              op = _.ops.pop()
              _.trys.pop()
              continue
            default:
              if (!((t = _.trys), (t = t.length > 0 && t[t.length - 1])) && (op[0] === 6 || op[0] === 2)) {
                _ = 0
                continue
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1]
                break
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1]
                t = op
                break
              }
              if (t && _.label < t[2]) {
                _.label = t[2]
                _.ops.push(op)
                break
              }
              if (t[2]) _.ops.pop()
              _.trys.pop()
              continue
          }
          op = body.call(thisArg, _)
        } catch (e) {
          op = [6, e]
          y = 0
        } finally {
          f = t = 0
        }
      if (op[0] & 5) throw op[1]
      return { value: op[0] ? op[1] : void 0, done: true }
    }
  }
Object.defineProperty(exports, "__esModule", { value: true })
exports.ContentBash = ContentBash
const shiki_1 = require("shiki")
const solid_js_1 = require("solid-js")
const common_1 = require("./common")
const content_bash_module_css_1 = require("./content-bash.module.css")
function ContentBash(props) {
  const _this = this
  const commandHtml = (0, solid_js_1.createResource)(
    () => {
      return props.command
    },
    (command) => {
      return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          return [
            2 /*return*/,
            (0, shiki_1.codeToHtml)(command || "", {
              lang: "bash",
              themes: {
                light: "github-light",
                dark: "github-dark",
              },
            }),
          ]
        })
      })
    },
  )[0]
  const outputHtml = (0, solid_js_1.createResource)(
    () => {
      return props.output
    },
    (output) => {
      return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          return [
            2 /*return*/,
            (0, shiki_1.codeToHtml)(output || "", {
              lang: "console",
              themes: {
                light: "github-light",
                dark: "github-dark",
              },
            }),
          ]
        })
      })
    },
  )[0]
  const _a = (0, solid_js_1.createSignal)(false),
    expanded = _a[0],
    setExpanded = _a[1]
  const overflow = (0, common_1.createOverflow)()
  return (
    <div
      class={content_bash_module_css_1.default.root}
      data-expanded={expanded() || props.expand === true ? true : undefined}
    >
      <div data-slot="body">
        <div data-slot="header">
          <span>{props.description}</span>
        </div>
        <div data-slot="content">
          <div innerHTML={commandHtml()} />
          <div data-slot="output" ref={overflow.ref} innerHTML={outputHtml()} />
        </div>
      </div>

      {!props.expand && overflow.status && (
        <button
          type="button"
          data-component="text-button"
          data-slot="expand-button"
          onClick={function () {
            return setExpanded((e) => {
              return !e
            })
          }}
        >
          {expanded() ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  )
}
