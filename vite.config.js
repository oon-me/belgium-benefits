import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { groupByChunk } from "./src/lib/chunks.js";

const BENEFITS = fileURLToPath(new URL("./src/data/benefits.json", import.meta.url));
const ID = "virtual:benefits";

// Serves benefits.json to the app as separate chunks (see src/lib/chunks.js):
// "virtual:benefits" exports an id → chunk index and one lazy loader per chunk, and each
// "virtual:benefits/<key>" is a chunk of its own in the build.
function benefitChunks() {
  const groups = () => groupByChunk(JSON.parse(readFileSync(BENEFITS, "utf8")));
  return {
    name: "benefit-chunks",
    resolveId: (id) => (id === ID || id.startsWith(`${ID}/`) ? `\0${id}` : null),
    load(id) {
      if (!id.startsWith(`\0${ID}`)) return null;
      this.addWatchFile(BENEFITS);
      const g = groups();
      if (id === `\0${ID}`) {
        const index = {};
        for (const [k, list] of Object.entries(g)) for (const b of list) index[b.id] ??= k;
        const loaders = Object.keys(g).map((k) => `${JSON.stringify(k)}: () => import(${JSON.stringify(`${ID}/${k}`)})`);
        return `export const index = ${JSON.stringify(index)};\nexport const loaders = {${loaders.join(",")}};`;
      }
      return `export default ${JSON.stringify(g[id.slice(ID.length + 2)] ?? [])};`;
    },
  };
}

export default defineConfig({
  plugins: [react(), benefitChunks()],
});
