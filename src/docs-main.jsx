import React from "react";
import { createRoot } from "react-dom/client";
import { DocsApp } from "./DocsApp.jsx";

const el = document.getElementById("react-root");
if (el) createRoot(el).render(<DocsApp />);
