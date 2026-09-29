"use client";

import CodeMirror from "@uiw/react-codemirror";
import {
    StreamLanguage,
    HighlightStyle,
    syntaxHighlighting,
} from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { tags } from "@lezer/highlight";

const language = StreamLanguage.define({
    token(stream) {
        if (stream.match(/\{=\(comment\):[^}]*\}/)) return "comment";
        if (stream.match(/[{}]/)) return "bracket";
        if (stream.match(/[():|=+*/<>!-]/)) return "operator";
        if (stream.match(/\d+(\.\d+)?/)) return "number";
        if (
            stream.match(
                /\b(?:args|user|target|channel|if|math|range|random|let|assign|upper|lower)\b/,
            )
        )
            return "keyword";
        stream.next();
        return null;
    },
});
const extensions = [
    language,
    EditorView.lineWrapping,
    syntaxHighlighting(
        HighlightStyle.define([
            { tag: tags.keyword, color: "#78935b" },
            { tag: tags.bracket, color: "#bc785d" },
            { tag: tags.operator, color: "#b0926a" },
            { tag: tags.number, color: "#9980b3" },
            { tag: tags.comment, color: "#858d7d", fontStyle: "italic" },
        ]),
    ),
];

export function ScriptEditor({
    value,
    onChange,
    fontSize,
}: {
    value: string;
    onChange: (value: string) => void;
    fontSize: number;
}) {
    return (
        <div className="code-editor" style={{ fontSize }}>
            <CodeMirror
                value={value}
                onChange={onChange}
                extensions={extensions}
                aria-label="TagScript editor"
                minHeight="340px"
                basicSetup={{
                    foldGutter: false,
                    highlightActiveLine: true,
                    autocompletion: false,
                }}
            />
        </div>
    );
}
