"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Part = Part;
exports.TodoWriteTool = TodoWriteTool;
exports.GrepTool = GrepTool;
exports.ListTool = ListTool;
exports.WebFetchTool = WebFetchTool;
exports.ReadTool = ReadTool;
exports.WriteTool = WriteTool;
exports.EditTool = EditTool;
exports.BashTool = BashTool;
exports.GlobTool = GlobTool;
exports.Spacer = Spacer;
exports.FallbackTool = FallbackTool;
exports.ProviderIcon = ProviderIcon;
var lang_map_1 = require("lang-map");
var luxon_1 = require("luxon");
var solid_js_1 = require("solid-js");
var icons_1 = require("../icons");
var custom_1 = require("../icons/custom");
var common_1 = require("../share/common");
var content_bash_1 = require("./content-bash");
var content_code_1 = require("./content-code");
var content_diff_1 = require("./content-diff");
var content_error_1 = require("./content-error");
var content_markdown_1 = require("./content-markdown");
var content_text_1 = require("./content-text");
var part_module_css_1 = require("./part.module.css");
var MIN_DURATION = 2000;
function Part(props) {
    var _a = (0, solid_js_1.createSignal)(false), copied = _a[0], setCopied = _a[1];
    var id = (0, solid_js_1.createMemo)(function () { return "".concat(props.message.id, "-").concat(props.index); });
    return (<div class={part_module_css_1.default.root} id={id()} data-component="part" data-type={props.part.type} data-role={props.message.role} data-copied={copied() ? true : undefined}>
      <div data-component="decoration">
        <div data-slot="anchor" title="Link to this message">
          <a href={"#".concat(id())} onClick={function (e) {
            e.preventDefault();
            var anchor = e.currentTarget;
            var hash = anchor.getAttribute("href") || "";
            var _a = window.location, origin = _a.origin, pathname = _a.pathname, search = _a.search;
            navigator.clipboard
                .writeText("".concat(origin).concat(pathname).concat(search).concat(hash))
                .catch(function (err) { return console.error("Copy failed", err); });
            setCopied(true);
            setTimeout(function () { return setCopied(false); }, 3000);
        }}>
            <solid_js_1.Switch>
              <solid_js_1.Match when={props.message.role === "user" && props.part.type === "text"}>
                <icons_1.IconUserCircle width={18} height={18}/>
              </solid_js_1.Match>
              <solid_js_1.Match when={props.message.role === "user" && props.part.type === "file"}>
                <icons_1.IconPaperClip width={18} height={18}/>
              </solid_js_1.Match>
              <solid_js_1.Match when={props.part.type === "step-start" && props.message.role === "assistant" && props.message.modelID}>
                {function (model) { return <ProviderIcon model={model()} size={18}/>; }}
              </solid_js_1.Match>
              <solid_js_1.Match when={props.part.type === "tool" && props.part.tool === "todowrite"}>
                <icons_1.IconQueueList width={18} height={18}/>
              </solid_js_1.Match>
              <solid_js_1.Match when={props.part.type === "tool" && props.part.tool === "todoread"}>
                <icons_1.IconQueueList width={18} height={18}/>
              </solid_js_1.Match>
              <solid_js_1.Match when={props.part.type === "tool" && props.part.tool === "bash"}>
                <icons_1.IconCommandLine width={18} height={18}/>
              </solid_js_1.Match>
              <solid_js_1.Match when={props.part.type === "tool" && props.part.tool === "edit"}>
                <icons_1.IconPencilSquare width={18} height={18}/>
              </solid_js_1.Match>
              <solid_js_1.Match when={props.part.type === "tool" && props.part.tool === "write"}>
                <icons_1.IconDocumentPlus width={18} height={18}/>
              </solid_js_1.Match>
              <solid_js_1.Match when={props.part.type === "tool" && props.part.tool === "read"}>
                <icons_1.IconDocument width={18} height={18}/>
              </solid_js_1.Match>
              <solid_js_1.Match when={props.part.type === "tool" && props.part.tool === "grep"}>
                <icons_1.IconDocumentMagnifyingGlass width={18} height={18}/>
              </solid_js_1.Match>
              <solid_js_1.Match when={props.part.type === "tool" && props.part.tool === "list"}>
                <icons_1.IconRectangleStack width={18} height={18}/>
              </solid_js_1.Match>
              <solid_js_1.Match when={props.part.type === "tool" && props.part.tool === "glob"}>
                <icons_1.IconMagnifyingGlass width={18} height={18}/>
              </solid_js_1.Match>
              <solid_js_1.Match when={props.part.type === "tool" && props.part.tool === "webfetch"}>
                <icons_1.IconGlobeAlt width={18} height={18}/>
              </solid_js_1.Match>
              <solid_js_1.Match when={props.part.type === "tool" && props.part.tool === "task"}>
                <custom_1.IconRobot width={18} height={18}/>
              </solid_js_1.Match>
              <solid_js_1.Match when={true}>
                <icons_1.IconSparkles width={18} height={18}/>
              </solid_js_1.Match>
            </solid_js_1.Switch>
            <icons_1.IconHashtag width={18} height={18}/>
            <icons_1.IconCheckCircle width={18} height={18}/>
          </a>
          <span data-slot="tooltip">Copied!</span>
        </div>
        <div data-slot="bar"></div>
      </div>
      <div data-component="content">
        {props.message.role === "user" && props.part.type === "text" && (<div data-component="user-text">
            <content_text_1.ContentText text={props.part.text} expand={props.last}/>
          </div>)}
        {props.message.role === "assistant" && props.part.type === "text" && (<div data-component="assistant-text">
            <div data-component="assistant-text-markdown">
              <content_markdown_1.ContentMarkdown expand={props.last} text={props.part.text}/>
            </div>
            {props.last && props.message.role === "assistant" && props.message.time.completed && (<Footer title={luxon_1.DateTime.fromMillis(props.message.time.completed).toLocaleString(luxon_1.DateTime.DATETIME_FULL_WITH_SECONDS)}>
                {luxon_1.DateTime.fromMillis(props.message.time.completed).toLocaleString(luxon_1.DateTime.DATETIME_MED)}
              </Footer>)}
          </div>)}
        {props.message.role === "user" && props.part.type === "file" && (<div data-component="attachment">
            <div data-slot="copy">Attachment</div>
            <div data-slot="filename">{props.part.filename}</div>
          </div>)}
        {props.part.type === "step-start" && props.message.role === "assistant" && (<div data-component="step-start">
            <div data-slot="provider">{props.message.providerID}</div>
            <div data-slot="model">{props.message.modelID}</div>
          </div>)}
        {props.part.type === "tool" && props.part.state.status === "error" && (<div data-component="tool" data-tool="error">
            <content_error_1.ContentError>{formatErrorString(props.part.state.error)}</content_error_1.ContentError>
            <Spacer />
          </div>)}
        {props.part.type === "tool" &&
            props.part.state.status === "completed" &&
            props.message.role === "assistant" && (<>
              <div data-component="tool" data-tool={props.part.tool}>
                <solid_js_1.Switch>
                  <solid_js_1.Match when={props.part.tool === "grep"}>
                    <GrepTool message={props.message} id={props.part.id} tool={props.part.tool} state={props.part.state}/>
                  </solid_js_1.Match>
                  <solid_js_1.Match when={props.part.tool === "glob"}>
                    <GlobTool message={props.message} id={props.part.id} tool={props.part.tool} state={props.part.state}/>
                  </solid_js_1.Match>
                  <solid_js_1.Match when={props.part.tool === "list"}>
                    <ListTool message={props.message} id={props.part.id} tool={props.part.tool} state={props.part.state}/>
                  </solid_js_1.Match>
                  <solid_js_1.Match when={props.part.tool === "read"}>
                    <ReadTool message={props.message} id={props.part.id} tool={props.part.tool} state={props.part.state}/>
                  </solid_js_1.Match>
                  <solid_js_1.Match when={props.part.tool === "write"}>
                    <WriteTool message={props.message} id={props.part.id} tool={props.part.tool} state={props.part.state}/>
                  </solid_js_1.Match>
                  <solid_js_1.Match when={props.part.tool === "edit"}>
                    <EditTool message={props.message} id={props.part.id} tool={props.part.tool} state={props.part.state}/>
                  </solid_js_1.Match>
                  <solid_js_1.Match when={props.part.tool === "bash"}>
                    <BashTool id={props.part.id} tool={props.part.tool} state={props.part.state} message={props.message}/>
                  </solid_js_1.Match>
                  <solid_js_1.Match when={props.part.tool === "todowrite"}>
                    <TodoWriteTool message={props.message} id={props.part.id} tool={props.part.tool} state={props.part.state}/>
                  </solid_js_1.Match>
                  <solid_js_1.Match when={props.part.tool === "webfetch"}>
                    <WebFetchTool message={props.message} id={props.part.id} tool={props.part.tool} state={props.part.state}/>
                  </solid_js_1.Match>
                  <solid_js_1.Match when={props.part.tool === "task"}>
                    <TaskTool id={props.part.id} tool={props.part.tool} message={props.message} state={props.part.state}/>
                  </solid_js_1.Match>
                  <solid_js_1.Match when={true}>
                    <FallbackTool message={props.message} id={props.part.id} tool={props.part.tool} state={props.part.state}/>
                  </solid_js_1.Match>
                </solid_js_1.Switch>
              </div>
              <ToolFooter time={luxon_1.DateTime.fromMillis(props.part.state.time.end)
                .diff(luxon_1.DateTime.fromMillis(props.part.state.time.start))
                .toMillis()}/>
            </>)}
      </div>
    </div>);
}
function stripWorkingDirectory(filePath, workingDir) {
    if (filePath === undefined || workingDir === undefined)
        return filePath;
    var prefix = workingDir.endsWith("/") ? workingDir : "".concat(workingDir, "/");
    if (filePath === workingDir) {
        return "";
    }
    if (filePath.startsWith(prefix)) {
        return filePath.slice(prefix.length);
    }
    return filePath;
}
function getShikiLang(filename) {
    var _a, _b, _c, _d;
    var ext = (_b = (_a = filename.split(".").pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : "";
    var langs = lang_map_1.default.languages(ext);
    var type = (_c = langs === null || langs === void 0 ? void 0 : langs[0]) === null || _c === void 0 ? void 0 : _c.toLowerCase();
    var overrides = {
        conf: "shellscript",
    };
    return type ? ((_d = overrides[type]) !== null && _d !== void 0 ? _d : type) : "plaintext";
}
function getDiagnostics(diagnosticsByFile, currentFile) {
    var result = [];
    if (diagnosticsByFile === undefined || diagnosticsByFile[currentFile] === undefined)
        return result;
    for (var _i = 0, _a = Object.values(diagnosticsByFile); _i < _a.length; _i++) {
        var diags = _a[_i];
        for (var _b = 0, diags_1 = diags; _b < diags_1.length; _b++) {
            var d = diags_1[_b];
            if (d.severity !== 1)
                continue;
            var line = d.range.start.line + 1;
            var column = d.range.start.character + 1;
            result.push(<pre>
          <span data-color="red" data-marker="label">
            Error
          </span>
          <span data-color="dimmed" data-separator>
            [{line}:{column}]
          </span>
          <span>{d.message}</span>
        </pre>);
        }
    }
    return result;
}
function formatErrorString(error) {
    var errorMarker = "Error: ";
    var startsWithError = error.startsWith(errorMarker);
    return startsWithError ? (<pre>
      <span data-color="red" data-marker="label" data-separator>
        Error
      </span>
      <span>{error.slice(errorMarker.length)}</span>
    </pre>) : (<pre>
      <span data-color="dimmed">{error}</span>
    </pre>);
}
function TodoWriteTool(props) {
    var priority = {
        in_progress: 0,
        pending: 1,
        completed: 2,
    };
    var todos = (0, solid_js_1.createMemo)(function () { var _a, _b; return ((_b = (_a = props.state.input) === null || _a === void 0 ? void 0 : _a.todos) !== null && _b !== void 0 ? _b : []).slice().sort(function (a, b) { return priority[a.status] - priority[b.status]; }); });
    var starting = function () { return todos().every(function (t) { return t.status === "pending"; }); };
    var finished = function () { return todos().every(function (t) { return t.status === "completed"; }); };
    return (<>
      <div data-component="tool-title">
        <span data-slot="name">
          <solid_js_1.Switch fallback="Updating plan">
            <solid_js_1.Match when={starting()}>Creating plan</solid_js_1.Match>
            <solid_js_1.Match when={finished()}>Completing plan</solid_js_1.Match>
          </solid_js_1.Switch>
        </span>
      </div>
      <solid_js_1.Show when={todos().length > 0}>
        <ul data-component="todos">
          <solid_js_1.For each={todos()}>
            {function (todo) { return (<li data-slot="item" data-status={todo.status}>
                <span></span>
                {todo.content}
              </li>); }}
          </solid_js_1.For>
        </ul>
      </solid_js_1.Show>
    </>);
}
function GrepTool(props) {
    var _a, _b, _c, _d;
    return (<>
      <div data-component="tool-title">
        <span data-slot="name">Grep</span>
        <span data-slot="target">&ldquo;{props.state.input.pattern}&rdquo;</span>
      </div>
      <div data-component="tool-result">
        <solid_js_1.Switch>
          <solid_js_1.Match when={((_a = props.state.metadata) === null || _a === void 0 ? void 0 : _a.matches) && ((_b = props.state.metadata) === null || _b === void 0 ? void 0 : _b.matches) > 0}>
            <ResultsButton showCopy={((_c = props.state.metadata) === null || _c === void 0 ? void 0 : _c.matches) === 1 ? "1 match" : "".concat((_d = props.state.metadata) === null || _d === void 0 ? void 0 : _d.matches, " matches")}>
              <content_text_1.ContentText expand compact text={props.state.output}/>
            </ResultsButton>
          </solid_js_1.Match>
          <solid_js_1.Match when={props.state.output}>
            <content_text_1.ContentText expand compact text={props.state.output} data-size="sm" data-color="dimmed"/>
          </solid_js_1.Match>
        </solid_js_1.Switch>
      </div>
    </>);
}
function ListTool(props) {
    var _a;
    var path = (0, solid_js_1.createMemo)(function () {
        var _a, _b, _c;
        return ((_a = props.state.input) === null || _a === void 0 ? void 0 : _a.path) !== props.message.path.cwd
            ? stripWorkingDirectory((_b = props.state.input) === null || _b === void 0 ? void 0 : _b.path, props.message.path.cwd)
            : (_c = props.state.input) === null || _c === void 0 ? void 0 : _c.path;
    });
    return (<>
      <div data-component="tool-title">
        <span data-slot="name">LS</span>
        <span data-slot="target" title={(_a = props.state.input) === null || _a === void 0 ? void 0 : _a.path}>
          {path()}
        </span>
      </div>
      <div data-component="tool-result">
        <solid_js_1.Switch>
          <solid_js_1.Match when={props.state.output}>
            <ResultsButton>
              <content_text_1.ContentText expand compact text={props.state.output}/>
            </ResultsButton>
          </solid_js_1.Match>
        </solid_js_1.Switch>
      </div>
    </>);
}
function WebFetchTool(props) {
    var _a;
    return (<>
      <div data-component="tool-title">
        <span data-slot="name">Fetch</span>
        <span data-slot="target">{props.state.input.url}</span>
      </div>
      <div data-component="tool-result">
        <solid_js_1.Switch>
          <solid_js_1.Match when={(_a = props.state.metadata) === null || _a === void 0 ? void 0 : _a.error}>
            <content_error_1.ContentError>{formatErrorString(props.state.output)}</content_error_1.ContentError>
          </solid_js_1.Match>
          <solid_js_1.Match when={props.state.output}>
            <ResultsButton>
              <content_code_1.ContentCode lang={props.state.input.format || "text"} code={props.state.output}/>
            </ResultsButton>
          </solid_js_1.Match>
        </solid_js_1.Switch>
      </div>
    </>);
}
function ReadTool(props) {
    var _a, _b, _c, _d, _e;
    var filePath = (0, solid_js_1.createMemo)(function () { var _a; return stripWorkingDirectory((_a = props.state.input) === null || _a === void 0 ? void 0 : _a.filePath, props.message.path.cwd); });
    return (<>
      <div data-component="tool-title">
        <span data-slot="name">Read</span>
        <span data-slot="target" title={(_a = props.state.input) === null || _a === void 0 ? void 0 : _a.filePath}>
          {filePath()}
        </span>
      </div>
      <div data-component="tool-result">
        <solid_js_1.Switch>
          <solid_js_1.Match when={(_b = props.state.metadata) === null || _b === void 0 ? void 0 : _b.error}>
            <content_error_1.ContentError>{formatErrorString(props.state.output)}</content_error_1.ContentError>
          </solid_js_1.Match>
          <solid_js_1.Match when={typeof ((_c = props.state.metadata) === null || _c === void 0 ? void 0 : _c.preview) === "string"}>
            <ResultsButton showCopy="Show preview" hideCopy="Hide preview">
              <content_code_1.ContentCode lang={getShikiLang(filePath() || "")} code={(_d = props.state.metadata) === null || _d === void 0 ? void 0 : _d.preview}/>
            </ResultsButton>
          </solid_js_1.Match>
          <solid_js_1.Match when={typeof ((_e = props.state.metadata) === null || _e === void 0 ? void 0 : _e.preview) !== "string" && props.state.output}>
            <ResultsButton>
              <content_text_1.ContentText expand compact text={props.state.output}/>
            </ResultsButton>
          </solid_js_1.Match>
        </solid_js_1.Switch>
      </div>
    </>);
}
function WriteTool(props) {
    var _a, _b, _c, _d;
    var filePath = (0, solid_js_1.createMemo)(function () { var _a; return stripWorkingDirectory((_a = props.state.input) === null || _a === void 0 ? void 0 : _a.filePath, props.message.path.cwd); });
    var diagnostics = (0, solid_js_1.createMemo)(function () { var _a; return getDiagnostics((_a = props.state.metadata) === null || _a === void 0 ? void 0 : _a.diagnostics, props.state.input.filePath); });
    return (<>
      <div data-component="tool-title">
        <span data-slot="name">Write</span>
        <span data-slot="target" title={(_a = props.state.input) === null || _a === void 0 ? void 0 : _a.filePath}>
          {filePath()}
        </span>
      </div>
      <solid_js_1.Show when={diagnostics().length > 0}>
        <content_error_1.ContentError>{diagnostics()}</content_error_1.ContentError>
      </solid_js_1.Show>
      <div data-component="tool-result">
        <solid_js_1.Switch>
          <solid_js_1.Match when={(_b = props.state.metadata) === null || _b === void 0 ? void 0 : _b.error}>
            <content_error_1.ContentError>{formatErrorString(props.state.output)}</content_error_1.ContentError>
          </solid_js_1.Match>
          <solid_js_1.Match when={(_c = props.state.input) === null || _c === void 0 ? void 0 : _c.content}>
            <ResultsButton showCopy="Show contents" hideCopy="Hide contents">
              <content_code_1.ContentCode lang={getShikiLang(filePath() || "")} code={(_d = props.state.input) === null || _d === void 0 ? void 0 : _d.content}/>
            </ResultsButton>
          </solid_js_1.Match>
        </solid_js_1.Switch>
      </div>
    </>);
}
function EditTool(props) {
    var _a, _b, _c, _d, _e;
    var filePath = (0, solid_js_1.createMemo)(function () { return stripWorkingDirectory(props.state.input.filePath, props.message.path.cwd); });
    var diagnostics = (0, solid_js_1.createMemo)(function () { var _a; return getDiagnostics((_a = props.state.metadata) === null || _a === void 0 ? void 0 : _a.diagnostics, props.state.input.filePath); });
    return (<>
      <div data-component="tool-title">
        <span data-slot="name">Edit</span>
        <span data-slot="target" title={(_a = props.state.input) === null || _a === void 0 ? void 0 : _a.filePath}>
          {filePath()}
        </span>
      </div>
      <div data-component="tool-result">
        <solid_js_1.Switch>
          <solid_js_1.Match when={(_b = props.state.metadata) === null || _b === void 0 ? void 0 : _b.error}>
            <content_error_1.ContentError>{formatErrorString(((_c = props.state.metadata) === null || _c === void 0 ? void 0 : _c.message) || "")}</content_error_1.ContentError>
          </solid_js_1.Match>
          <solid_js_1.Match when={(_d = props.state.metadata) === null || _d === void 0 ? void 0 : _d.diff}>
            <div data-component="diff">
              <content_diff_1.ContentDiff diff={(_e = props.state.metadata) === null || _e === void 0 ? void 0 : _e.diff} lang={getShikiLang(filePath() || "")}/>
            </div>
          </solid_js_1.Match>
        </solid_js_1.Switch>
      </div>
      <solid_js_1.Show when={diagnostics().length > 0}>
        <content_error_1.ContentError>{diagnostics()}</content_error_1.ContentError>
      </solid_js_1.Show>
    </>);
}
function BashTool(props) {
    var _a;
    return (<content_bash_1.ContentBash command={props.state.input.command} output={((_a = props.state.metadata) === null || _a === void 0 ? void 0 : _a.stdout) || ""} description={props.state.metadata.description}/>);
}
function GlobTool(props) {
    var _a, _b, _c, _d;
    return (<>
      <div data-component="tool-title">
        <span data-slot="name">Glob</span>
        <span data-slot="target">&ldquo;{props.state.input.pattern}&rdquo;</span>
      </div>
      <solid_js_1.Switch>
        <solid_js_1.Match when={((_a = props.state.metadata) === null || _a === void 0 ? void 0 : _a.count) && ((_b = props.state.metadata) === null || _b === void 0 ? void 0 : _b.count) > 0}>
          <div data-component="tool-result">
            <ResultsButton showCopy={((_c = props.state.metadata) === null || _c === void 0 ? void 0 : _c.count) === 1 ? "1 result" : "".concat((_d = props.state.metadata) === null || _d === void 0 ? void 0 : _d.count, " results")}>
              <content_text_1.ContentText expand compact text={props.state.output}/>
            </ResultsButton>
          </div>
        </solid_js_1.Match>
        <solid_js_1.Match when={props.state.output}>
          <content_text_1.ContentText expand text={props.state.output} data-size="sm" data-color="dimmed"/>
        </solid_js_1.Match>
      </solid_js_1.Switch>
    </>);
}
function ResultsButton(props) {
    var _a = (0, solid_js_1.createSignal)(false), show = _a[0], setShow = _a[1];
    return (<>
      <button type="button" data-component="button-text" data-more onClick={function () { return setShow(function (e) { return !e; }); }}>
        <span>{show() ? props.hideCopy || "Hide results" : props.showCopy || "Show results"}</span>
        <span data-slot="icon">
          <solid_js_1.Show when={show()} fallback={<icons_1.IconChevronRight width={11} height={11}/>}>
            <icons_1.IconChevronDown width={11} height={11}/>
          </solid_js_1.Show>
        </span>
      </button>
      <solid_js_1.Show when={show()}>{props.children}</solid_js_1.Show>
    </>);
}
function Spacer() {
    return <div data-component="spacer"></div>;
}
function Footer(props) {
    return (<div data-component="content-footer" title={props.title}>
      {props.children}
    </div>);
}
function ToolFooter(props) {
    return props.time > MIN_DURATION && <Footer title={"".concat(props.time, "ms")}>{(0, common_1.formatDuration)(props.time)}</Footer>;
}
function TaskTool(props) {
    return (<>
      <div data-component="tool-title">
        <span data-slot="name">Task</span>
        <span data-slot="target">{props.state.input.description}</span>
      </div>
      <div data-component="tool-input">&ldquo;{props.state.input.prompt}&rdquo;</div>
      <ResultsButton showCopy="Show output" hideCopy="Hide output">
        <div data-component="tool-output">
          <content_markdown_1.ContentMarkdown expand text={props.state.output}/>
        </div>
      </ResultsButton>
    </>);
}
function FallbackTool(props) {
    return (<>
      <div data-component="tool-title">
        <span data-slot="name">{props.tool}</span>
      </div>
      <div data-component="tool-args">
        <solid_js_1.For each={flattenToolArgs(props.state.input)}>
          {function (arg) { return (<>
              <div></div>
              <div>{arg[0]}</div>
              <div>{arg[1]}</div>
            </>); }}
        </solid_js_1.For>
      </div>
      <solid_js_1.Switch>
        <solid_js_1.Match when={props.state.output}>
          <div data-component="tool-result">
            <ResultsButton>
              <content_text_1.ContentText expand compact text={props.state.output} data-size="sm" data-color="dimmed"/>
            </ResultsButton>
          </div>
        </solid_js_1.Match>
      </solid_js_1.Switch>
    </>);
}
// Converts nested objects/arrays into [path, value] pairs.
// E.g. {a:{b:{c:1}}, d:[{e:2}, 3]} => [["a.b.c",1], ["d[0].e",2], ["d[1]",3]]
function flattenToolArgs(obj, prefix) {
    if (prefix === void 0) { prefix = ""; }
    var entries = [];
    var _loop_1 = function (key, value) {
        var path = prefix ? "".concat(prefix, ".").concat(key) : key;
        if (value !== null && typeof value === "object") {
            if (Array.isArray(value)) {
                value.forEach(function (item, index) {
                    var arrayPath = "".concat(path, "[").concat(index, "]");
                    if (item !== null && typeof item === "object") {
                        entries.push.apply(entries, flattenToolArgs(item, arrayPath));
                    }
                    else {
                        entries.push([arrayPath, item]);
                    }
                });
            }
            else {
                entries.push.apply(entries, flattenToolArgs(value, path));
            }
        }
        else {
            entries.push([path, value]);
        }
    };
    for (var _i = 0, _a = Object.entries(obj); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        _loop_1(key, value);
    }
    return entries;
}
function getProvider(model) {
    var lowerModel = model.toLowerCase();
    if (/claude|anthropic/.test(lowerModel))
        return "anthropic";
    if (/gpt|o[1-4]|codex|openai/.test(lowerModel))
        return "openai";
    if (/gemini|palm|bard|google/.test(lowerModel))
        return "gemini";
    if (/llama|meta/.test(lowerModel))
        return "meta";
    return "any";
}
function ProviderIcon(props) {
    var provider = getProvider(props.model);
    var size = props.size || 16;
    return (<solid_js_1.Switch fallback={<icons_1.IconSparkles width={size} height={size}/>}>
      <solid_js_1.Match when={provider === "openai"}>
        <custom_1.IconOpenAI width={size} height={size}/>
      </solid_js_1.Match>
      <solid_js_1.Match when={provider === "anthropic"}>
        <custom_1.IconAnthropic width={size} height={size}/>
      </solid_js_1.Match>
      <solid_js_1.Match when={provider === "gemini"}>
        <custom_1.IconGemini width={size} height={size}/>
      </solid_js_1.Match>
      <solid_js_1.Match when={provider === "meta"}>
        <custom_1.IconMeta width={size} height={size}/>
      </solid_js_1.Match>
    </solid_js_1.Switch>);
}
