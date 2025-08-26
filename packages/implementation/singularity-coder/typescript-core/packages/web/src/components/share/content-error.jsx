"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentError = ContentError;
var solid_js_1 = require("solid-js");
var common_1 = require("./common");
var content_error_module_css_1 = require("./content-error.module.css");
function ContentError(props) {
    var _a = (0, solid_js_1.createSignal)(false), expanded = _a[0], setExpanded = _a[1];
    var overflow = (0, common_1.createOverflow)();
    return (<div class={content_error_module_css_1.default.root} data-expanded={expanded() || props.expand === true ? true : undefined}>
			<div data-section="content" ref={overflow.ref}>
				{props.children}
			</div>
			{((!props.expand && overflow.status) || expanded()) && (<button type="button" data-element-button-text onClick={function () { return setExpanded(function (e) { return !e; }); }}>
					{expanded() ? "Show less" : "Show more"}
				</button>)}
		</div>);
}
