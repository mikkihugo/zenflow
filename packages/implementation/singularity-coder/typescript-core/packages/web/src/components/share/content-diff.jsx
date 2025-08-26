"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentDiff = ContentDiff;
var diff_1 = require("diff");
var solid_js_1 = require("solid-js");
var content_code_1 = require("./content-code");
var content_diff_module_css_1 = require("./content-diff.module.css");
function ContentDiff(props) {
    var rows = (0, solid_js_1.createMemo)(function () {
        var diffRows = [];
        try {
            var patches = (0, diff_1.parsePatch)(props.diff);
            for (var _i = 0, patches_1 = patches; _i < patches_1.length; _i++) {
                var patch = patches_1[_i];
                for (var _a = 0, _b = patch.hunks; _a < _b.length; _a++) {
                    var hunk = _b[_a];
                    var lines = hunk.lines;
                    var i = 0;
                    while (i < lines.length) {
                        var line = lines[i];
                        var content = line.slice(1);
                        var prefix = line[0];
                        if (prefix === "-") {
                            // Look ahead for consecutive additions to pair with removals
                            var removals = [content];
                            var j = i + 1;
                            // Collect all consecutive removals
                            while (j < lines.length && lines[j][0] === "-") {
                                removals.push(lines[j].slice(1));
                                j++;
                            }
                            // Collect all consecutive additions that follow
                            var additions = [];
                            while (j < lines.length && lines[j][0] === "+") {
                                additions.push(lines[j].slice(1));
                                j++;
                            }
                            // Pair removals with additions
                            var maxLength = Math.max(removals.length, additions.length);
                            for (var k = 0; k < maxLength; k++) {
                                var hasLeft = k < removals.length;
                                var hasRight = k < additions.length;
                                if (hasLeft && hasRight) {
                                    // Replacement - left is removed, right is added
                                    diffRows.push({
                                        left: removals[k],
                                        right: additions[k],
                                        type: "modified",
                                    });
                                }
                                else if (hasLeft) {
                                    // Pure removal
                                    diffRows.push({
                                        left: removals[k],
                                        right: "",
                                        type: "removed",
                                    });
                                }
                                else if (hasRight) {
                                    // Pure addition - only create if we actually have content
                                    diffRows.push({
                                        left: "",
                                        right: additions[k],
                                        type: "added",
                                    });
                                }
                            }
                            i = j;
                        }
                        else if (prefix === "+") {
                            // Standalone addition (not paired with removal)
                            diffRows.push({
                                left: "",
                                right: content,
                                type: "added",
                            });
                            i++;
                        }
                        else if (prefix === " ") {
                            diffRows.push({
                                left: content === "" ? " " : content,
                                right: content === "" ? " " : content,
                                type: "unchanged",
                            });
                            i++;
                        }
                        else {
                            i++;
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error("Failed to parse patch:", error);
            return [];
        }
        return diffRows;
    });
    var mobileRows = (0, solid_js_1.createMemo)(function () {
        var mobileBlocks = [];
        var currentRows = rows();
        var i = 0;
        while (i < currentRows.length) {
            var removedLines = [];
            var addedLines = [];
            // Collect consecutive modified/removed/added rows
            while (i < currentRows.length &&
                (currentRows[i].type === "modified" ||
                    currentRows[i].type === "removed" ||
                    currentRows[i].type === "added")) {
                var row = currentRows[i];
                if (row.left && (row.type === "removed" || row.type === "modified")) {
                    removedLines.push(row.left);
                }
                if (row.right && (row.type === "added" || row.type === "modified")) {
                    addedLines.push(row.right);
                }
                i++;
            }
            // Add grouped blocks
            if (removedLines.length > 0) {
                mobileBlocks.push({ type: "removed", lines: removedLines });
            }
            if (addedLines.length > 0) {
                mobileBlocks.push({ type: "added", lines: addedLines });
            }
            // Add unchanged rows as-is
            if (i < currentRows.length && currentRows[i].type === "unchanged") {
                mobileBlocks.push({
                    type: "unchanged",
                    lines: [currentRows[i].left],
                });
                i++;
            }
        }
        return mobileBlocks;
    });
    return (<div class={content_diff_module_css_1.default.root}>
			<div data-component="desktop">
				{rows().map(function (r) { return (<div data-component="diff-row" data-type={r.type}>
						<div data-slot="before" data-diff-type={r.type === "removed" || r.type === "modified" ? "removed" : ""}>
							<content_code_1.ContentCode code={r.left} flush lang={props.lang}/>
						</div>
						<div data-slot="after" data-diff-type={r.type === "added" || r.type === "modified" ? "added" : ""}>
							<content_code_1.ContentCode code={r.right} lang={props.lang} flush/>
						</div>
					</div>); })}
			</div>

			<div data-component="mobile">
				{mobileRows().map(function (block) { return (<div data-component="diff-block" data-type={block.type}>
						{block.lines.map(function (line) { return (<div data-diff-type={block.type === "removed"
                    ? "removed"
                    : block.type === "added"
                        ? "added"
                        : ""}>
								<content_code_1.ContentCode code={line} lang={props.lang} flush/>
							</div>); })}
					</div>); })}
			</div>
		</div>);
}
// const testDiff = `--- combined_before.txt	2025-06-24 16:38:08
// +++ combined_after.txt	2025-06-24 16:38:12
// @@ -1,21 +1,25 @@
//  unchanged line
// -deleted line
// -old content
// +added line
// +new content
//
// -removed empty line below
// +added empty line above
//
// -	tab indented
// -trailing spaces
// -very long line that will definitely wrap in most editors and cause potential alignment issues when displayed in a two column diff view
// -unicode content: 🚀 ✨ 中文
// -mixed	content with	tabs and spaces
// +    space indented
// +no trailing spaces
// +short line
// +very long replacement line that will also wrap and test how the diff viewer handles long line additions after short line removals
// +different unicode: 🎉 💻 日本語
// +normalized content with consistent spacing
// +newline to content
//
// -content to remove
// -whitespace only:
// -multiple
// -consecutive
// -deletions
// -single deletion
// +
// +single addition
// +first addition
// +second addition
// +third addition
//  line before addition
// +first added line
// +
// +third added line
//  line after addition
//  final unchanged line`
