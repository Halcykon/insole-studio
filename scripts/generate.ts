/**
 * Headless export for Insole Studio projects.
 *
 * Usage: node scripts/generate.mjs <project.insole.json> <outDir> <tag>
 * Writes <tag>-left.stl, <tag>-right.stl (plain geometry, millimetres)
 * and <tag>-left.3mf, <tag>-right.3mf (PrusaSlicer design-mode project with
 * local infill modifiers, original coordinates, no printer presets).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { parseInsoleProject } from "../src/insole/project";
import {
  binarySTL,
  buildInsoleGeometry,
  geometryStats,
} from "../src/insole/model";
import { prusaProject } from "../src/insole/prusa";

const [, , file, outDir, tag] = process.argv;
if (!file || !outDir || !tag) {
  console.error("usage: generate <project.insole.json> <outDir> <tag>");
  process.exit(1);
}
const project = parseInsoleProject(readFileSync(file, "utf8"));
mkdirSync(outDir, { recursive: true });
for (const side of ["left", "right"] as const) {
  const params = project.feet[side];
  const geometry = buildInsoleGeometry(params, side, 192);
  writeFileSync(`${outDir}/${tag}-${side}.stl`, Buffer.from(binarySTL(geometry)));
  const model = prusaProject(params, side, `${tag} ${side}`, {
    profileMode: "design",
    placement: "original",
  });
  writeFileSync(`${outDir}/${tag}-${side}.3mf`, model);
  console.log(`${tag} ${side}`, JSON.stringify(geometryStats(geometry)));
}
