"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopyButton = CopyButton;
var solid_js_1 = require("solid-js");
var icons_1 = require("../icons");
var copy_button_module_css_1 = require("./copy-button.module.css");
function CopyButton(props) {
    var _a = (0, solid_js_1.createSignal)(false), copied = _a[0], setCopied = _a[1];
    function handleCopyClick() {
        if (props.text) {
            navigator.clipboard
                .writeText(props.text)
                .catch(function (err) { return console.error("Copy failed", err); });
            setCopied(true);
            setTimeout(function () { return setCopied(false); }, 2000);
        }
    }
    return (<div data-component="copy-button" class={copy_button_module_css_1.default.root}>
			<button type="button" onClick={handleCopyClick} data-copied={copied() ? true : undefined}>
				{copied() ? (<icons_1.IconCheckCircle width={16} height={16}/>) : (<icons_1.IconClipboard width={16} height={16}/>)}
			</button>
		</div>);
}
