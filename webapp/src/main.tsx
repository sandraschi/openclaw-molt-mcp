import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { LogProvider } from "./context/LogContext";
import "./styles/main.css";

const root = document.getElementById("root");
if (root === null) {
  throw new Error("Root element #root not found");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter>
      <LogProvider>
        <App />
      </LogProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
