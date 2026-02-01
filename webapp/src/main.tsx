import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { LogProvider } from "./context/LogContext";
import App from "./App";
import "./styles/main.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <LogProvider>
        <App />
      </LogProvider>
    </BrowserRouter>
  </React.StrictMode>
);
