"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnchorIcon = AnchorIcon;
exports.createOverflow = createOverflow;
exports.formatDuration = formatDuration;
var solid_js_1 = require("solid-js");
var icons_1 = require("../icons");
function AnchorIcon(props) {
    var _a = (0, solid_js_1.splitProps)(props, ["id", "children"]), local = _a[0], rest = _a[1];
    var _b = (0, solid_js_1.createSignal)(false), copied = _b[0], setCopied = _b[1];
    return (<div {...rest} data-element-anchor title="Link to this message" data-status={copied() ? "copied" : ""}>
      <a href={"#".concat(local.id)} onClick={function (e) {
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
        {local.children}
        <icons_1.IconHashtag width={18} height={18}/>
        <icons_1.IconCheckCircle width={18} height={18}/>
      </a>
      <span data-element-tooltip>Copied!</span>
    </div>);
}
function createOverflow() {
    var _a = (0, solid_js_1.createSignal)(false), overflow = _a[0], setOverflow = _a[1];
    return {
        get status() {
            return overflow();
        },
        ref: function (el) {
            var ro = new ResizeObserver(function () {
                if (el.scrollHeight > el.clientHeight + 1) {
                    setOverflow(true);
                }
                return;
            });
            ro.observe(el);
            (0, solid_js_1.onCleanup)(function () {
                ro.disconnect();
            });
        },
    };
}
function formatDuration(ms) {
    var ONE_SECOND = 1000;
    var ONE_MINUTE = 60 * ONE_SECOND;
    if (ms >= ONE_MINUTE) {
        var minutes = Math.floor(ms / ONE_MINUTE);
        return minutes === 1 ? "1min" : "".concat(minutes, "mins");
    }
    if (ms >= ONE_SECOND) {
        var seconds = Math.floor(ms / ONE_SECOND);
        return "".concat(seconds, "s");
    }
    return "".concat(ms, "ms");
}
