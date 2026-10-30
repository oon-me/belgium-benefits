import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import App from "./App.jsx";
import benefits from "./data/benefits.json";
import { seed } from "./lib/data.js";

// The prerender has every benefit at hand, so pages render synchronously with their content.
seed(benefits);

// Used only by scripts/prerender.mjs at build time.
export function render(url) {
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  );
}
