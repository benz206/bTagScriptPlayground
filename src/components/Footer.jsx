import React from "react";

export function Footer() {
    return (
        <footer className="footer">
            <p>
                Syntax Highlighting brought to you by{" "}
                <a
                    href="https://github.com/asty8926/tagscript-syntax-highlighter/blob/main/static/tse.css"
                    target="_blank"
                    rel="noreferrer"
                >
                    Asty8926
                </a>
            </p>
            <div className="d-sm-flex justify-content-center justify-content-sm-between">
                <span className="text-muted d-block text-center text-sm-left d-sm-inline-block">
                    Copyright © _Leg3ndary 2022
                </span>
                <span className="float-none float-sm-right d-block mt-1 mt-sm-0 text-center">
                    Not affiliated with{" "}
                    <a href="https://carl.gg" target="_blank" rel="noreferrer">
                        Carl-bot
                    </a>{" "}
                    or{" "}
                    <a
                        href="https://botlabs.gg"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Botlabs
                    </a>
                </span>
            </div>
        </footer>
    );
}
