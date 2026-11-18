/** Dump outline + top-surface grid for each foot of a project, for analysis. Usage: dump <project.json> <out.json> */
import { readFileSync, writeFileSync } from "node:fs";
import { parseInsoleProject } from "../src/insole/project";
import { outlinePoints, surfaceHeight } from "../src/insole/model";
const [, , file, out] = process.argv;
const project = parseInsoleProject(readFileSync(file, "utf8"));
const result: Record<string, unknown> = {};
for (const side of ["left", "right"] as const) {
  const p = project.feet[side];
  // Canonical right-foot coordinates (negative x = medial). Mirror for left is not applied.
  const outline = outlinePoints(p, "right", 200).map(({ x, y }) => [x, y]);
  const grid: number[][] = [];
  for (let y = 0; y <= p.length; y += 2) {
    const row: number[] = [];
    for (let x = -80; x <= 90; x += 2) row.push(surfaceHeight(p, x, y));
    grid.push(row);
  }
  result[side] = { length: p.length, baseThickness: p.baseThickness, outline, grid };
}
writeFileSync(out, JSON.stringify(result));
