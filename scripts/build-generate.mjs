// Bundles a headless script (default scripts/generate.ts) into a runnable .mjs next to it.
// Usage: node scripts/build-generate.mjs [scripts/generate.ts | scripts/dump.ts]
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

// esbuild is a dependency of vite; resolve it from there (pnpm does not hoist it).
const require = createRequire(import.meta.url);
const viteRequire = createRequire(require.resolve("vite/package.json"));
const { build } = viteRequire("esbuild");

// The app imports slicer profiles as raw text (Vite's `?raw`); do the same here.
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

const entry = process.argv[2] ?? "scripts/generate.ts";
await build({
  entryPoints: [entry],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: entry.replace(/\.ts$/, ".mjs"),
  plugins: [raw],
  logLevel: "warning",
});
