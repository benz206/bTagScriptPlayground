import React from "react";
import { Sidebar } from "./Sidebar.jsx";
import { Navbar } from "./Navbar.jsx";
import { Footer } from "./Footer.jsx";

export function Layout({ active, children }) {
    return (
        <div className="container-scroller">
            <Sidebar active={active} />
            <div className="container-fluid page-body-wrapper">
                <Navbar />
                <div className="main-panel">
                    <div className="content-wrapper">{children}</div>
                    <Footer />
                </div>
            </div>
        </div>
    );
}
