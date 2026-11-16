import { build } from "../node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/lib/main.js";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
const raw = {
  name: "raw",
  setup(b) {
    b.onResolve({ filter: /\?raw$/ }, (a) => ({
      path: resolve(a.resolveDir, a.path.replace(/\?raw$/, "")),
      namespace: "raw",
    }));
    b.onLoad({ filter: /.*/, namespace: "raw" }, (a) => ({
      contents: readFileSync(a.path, "utf8"),
      loader: "text",
    }));
  },
};
await build({
  entryPoints: ["scripts/generate.ts"],
  bundle: true, platform: "node", format: "esm",
  outfile: "scripts/generate.mjs", plugins: [raw], logLevel: "warning",
});
