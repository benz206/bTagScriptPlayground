import React from "react";

export function Sidebar({ active }) {
    return (
        <nav className="sidebar sidebar-offcanvas" id="sidebar">
            <div className="sidebar-brand-wrapper d-none d-lg-flex align-items-center justify-content-center fixed-top">
                <a className="sidebar-brand brand-logo" href="index.html">
                    <img src="assets/images/TagScriptLogo.svg" alt="logo" />
                </a>
                <a className="sidebar-brand brand-logo-mini" href="index.html">
                    <img src="assets/images/TagScriptLogo.svg" alt="logo" />
                </a>
            </div>
            <ul className="nav">
                <li className="nav-item nav-category">
                    <span className="nav-link">Navigation</span>
                </li>
                <li className="nav-item menu-items">
                    <a
                        className={`nav-link${
                            active === "playground" ? " active" : ""
                        }`}
                        href="index.html"
                    >
                        <span className="menu-icon">
                            <i className="mdi mdi-settings"></i>
                        </span>
                        <span className="menu-title">Playground</span>
                    </a>
                </li>
                <li className="nav-item menu-items">
                    <a
                        className={`nav-link${
                            active === "docs" ? " active" : ""
                        }`}
                        href="docs.html"
                    >
                        <span className="menu-icon">
                            <i className="mdi mdi-file-document-box"></i>
                        </span>
                        <span className="menu-title">Docs</span>
                    </a>
                </li>
            </ul>
        </nav>
    );
}
