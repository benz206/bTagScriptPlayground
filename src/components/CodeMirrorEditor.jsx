import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import { ensureTseMode } from "../lib/tseMode.js";

export function CodeMirrorEditor({ value, onChange, onProcess }) {
    const textareaRef = useRef(null);
    const editorRef = useRef(null);
    const lastValueRef = useRef(value ?? "");

    useEffect(() => {
        ensureTseMode();
        const ta = textareaRef.current;
        if (!ta) return;
        if (editorRef.current) return;

        const editor = CodeMirror.fromTextArea(ta, {
            mode: "tse",
            theme: "tse",
            lineWrapping: true,
        });

        editor.on("change", () => {
            const next = editor.getValue();
            lastValueRef.current = next;
            onChange?.(next);
        });

        if (onProcess) {
            editor.addKeyMap({
                "Cmd-Enter": onProcess,
                "Ctrl-Enter": onProcess,
            });
        }

        editorRef.current = editor;
        editor.setValue(value ?? "");

        return () => {
            editor.toTextArea();
            editorRef.current = null;
        };
    }, [onChange, onProcess]);

    useEffect(() => {
        const editor = editorRef.current;
        const next = value ?? "";
        if (!editor) {
            lastValueRef.current = next;
            return;
        }
        if (next === lastValueRef.current) return;
        lastValueRef.current = next;
        editor.setValue(next);
    }, [value]);

    return <textarea ref={textareaRef} value={value ?? ""} readOnly rows={5} />;
}
