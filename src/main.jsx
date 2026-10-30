import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { keysForRoute, loadKeys } from "./lib/data.js";
import "./index.css";

// Fetch this page's benefit chunks before the first render: until then the prerendered HTML stays
// on screen, so a visitor never sees it swapped for a loading line. If the fetch fails, the page
// renders anyway and shows the error itself.
loadKeys(keysForRoute(window.location.pathname, window.location.search))
  .catch(() => {})
  .finally(() => {
    ReactDOM.createRoot(document.getElementById("root")).render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    );
  });
