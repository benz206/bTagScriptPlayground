import React from "react";
import { Layout } from "./components/Layout.jsx";

export function DocsApp() {
    return (
        <Layout active="docs">
            <div className="page-header">
                <h3 className="page-title">Docs</h3>
            </div>
            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-body">
                            <h4 className="card-title">Documentation</h4>
                            <p className="card-description">
                                Tagscript documentation can be viewed{" "}
                                <a
                                    href="https://btagscript.readthedocs.io/en/latest/APIReference/block.html"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    here
                                </a>
                                , or alternatively for Carl-bot,{" "}
                                <a
                                    href="https://docs.carl.gg/tags-and-triggers/tags-advanced-usage/"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    here
                                </a>
                                .
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}


