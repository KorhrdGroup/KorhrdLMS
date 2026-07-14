import dotenv from "dotenv";
import { writeFileSync } from "fs";

dotenv.config({ path: ".env.local" });

const token = process.env.FIGMA_ACCESS_TOKEN;
if (!token) {
  console.error("FIGMA_ACCESS_TOKEN not set");
  process.exit(1);
}

const FILE_KEY = "HscH2nNpEmHwTKHrHMXfc0";
const NODE_ID = "20:1398";

const res = await fetch(
  `https://api.figma.com/v1/files/${FILE_KEY}/nodes?ids=${encodeURIComponent(NODE_ID)}`,
  { headers: { "X-Figma-Token": token } },
);
const body = await res.json();
if (!res.ok) {
  console.error(body.err || body.message);
  process.exit(1);
}

const root = body.nodes[NODE_ID].document;

function rgba(p) {
  if (!p || p.a === 0) return null;
  const r = Math.round((p.r ?? 0) * 255);
  const g = Math.round((p.g ?? 0) * 255);
  const b = Math.round((p.b ?? 0) * 255);
  const a = p.a ?? 1;
  if (a >= 0.99) return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
  return `rgba(${r},${g},${b},${a.toFixed(2)})`;
}

function extractFill(node) {
  const fill = node.fills?.find((f) => f.type === "SOLID" && f.visible !== false);
  return fill ? rgba(fill.color) : null;
}

function summarize(node, depth = 0, maxDepth = 4) {
  const box = node.absoluteBoundingBox;
  const info = {
    name: node.name,
    type: node.type,
    w: box ? Math.round(box.width) : null,
    h: box ? Math.round(box.height) : null,
    x: box ? Math.round(box.x) : null,
    y: box ? Math.round(box.y) : null,
    fill: extractFill(node),
    radius: node.cornerRadius ?? node.rectangleCornerRadii?.[0] ?? null,
    fontSize: node.style?.fontSize ?? null,
    fontWeight: node.style?.fontWeight ?? null,
    characters: node.type === "TEXT" ? node.characters?.slice(0, 80) : undefined,
  };
  if (depth < maxDepth && node.children?.length) {
    info.children = node.children.map((c) => summarize(c, depth + 1, maxDepth));
  }
  return info;
}

const wrapper = root.children?.find((c) => c.name === "wrapper_section");
const gnb = root.children?.find((c) => c.name === "gnb");

const spec = {
  frame: { name: root.name, w: root.absoluteBoundingBox?.width, h: root.absoluteBoundingBox?.height },
  topLevel: root.children?.map((c) => summarize(c, 0, 2)),
  wrapperSections: wrapper?.children?.map((c, i) => ({
    index: i + 1,
    ...summarize(c, 0, 3),
  })),
  gnb: gnb ? summarize(gnb, 0, 4) : null,
};

writeFileSync("figma-spec.json", JSON.stringify(spec, null, 2));
console.log("Wrote figma-spec.json");
console.log("Frame:", spec.frame.name, spec.frame.w, "x", spec.frame.h);
console.log("Wrapper sections:", spec.wrapperSections?.length ?? 0);
