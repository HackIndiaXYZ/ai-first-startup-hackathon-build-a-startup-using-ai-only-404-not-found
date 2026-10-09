import "@fontsource-variable/archivo/wdth.css";
import "@fontsource/geist-mono/400.css";
import "@fontsource/geist-mono/600.css";
import "@fontsource/tiro-devanagari-hindi/devanagari-400.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/shell.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
