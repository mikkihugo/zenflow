"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentText = ContentText;
var solid_js_1 = require("solid-js");
var common_1 = require("./common");
var content_text_module_css_1 = require("./content-text.module.css");
function ContentText(props) {
    var _a = (0, solid_js_1.createSignal)(false), expanded = _a[0], setExpanded = _a[1];
    var overflow = (0, common_1.createOverflow)();
    return (<div class={content_text_module_css_1.default.root} data-expanded={expanded() || props.expand === true ? true : undefined} data-compact={props.compact === true ? true : undefined}>
      <pre data-slot="text" ref={overflow.ref}>
        {props.text}
      </pre>
      {((!props.expand && overflow.status) || expanded()) && (<button type="button" data-component="text-button" data-slot="expand-button" onClick={function () { return setExpanded(function (e) { return !e; }); }}>
          {expanded() ? "Show less" : "Show more"}
        </button>)}
    </div>);
}
