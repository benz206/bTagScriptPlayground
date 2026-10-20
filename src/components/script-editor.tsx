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
            { tag: tags.keyword, color: "var(--ctp-mauve)" },
            { tag: tags.bracket, color: "var(--ctp-red)" },
            { tag: tags.operator, color: "var(--ctp-blue)" },
            { tag: tags.number, color: "var(--ctp-peach)" },
            { tag: tags.comment, color: "var(--faint)", fontStyle: "italic" },
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
        <div className="code-editor h-full" style={{ fontSize }}>
            <CodeMirror
                value={value}
                onChange={onChange}
                extensions={extensions}
                aria-label="TagScript editor"
                height="100%"
                basicSetup={{
                    foldGutter: false,
                    highlightActiveLine: true,
                    autocompletion: false,
                }}
            />
        </div>
    );
}
