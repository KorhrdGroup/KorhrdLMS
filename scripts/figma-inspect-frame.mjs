import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const token = process.env.FIGMA_ACCESS_TOKEN;

if (!token) {
  console.log(JSON.stringify({ success: false, error: "FIGMA_ACCESS_TOKEN not set in process.env" }));
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
  console.log(
    JSON.stringify({
      success: false,
      httpStatus: res.status,
      error: body.err || body.message || "Unknown error",
    }),
  );
  process.exit(1);
}

const nodeEntry = body.nodes?.[NODE_ID];
if (!nodeEntry?.document) {
  console.log(JSON.stringify({ success: false, error: "Node document not found" }));
  process.exit(1);
}

const root = nodeEntry.document;

const typeCounts = {};
const componentRefs = new Set();
const instanceNames = new Set();

function walk(node) {
  typeCounts[node.type] = (typeCounts[node.type] || 0) + 1;

  if (node.type === "INSTANCE") {
    instanceNames.add(node.name);
    if (node.componentId) componentRefs.add(node.componentId);
  }
  if (node.type === "COMPONENT") {
    componentRefs.add(node.id);
  }

  for (const child of node.children ?? []) {
    walk(child);
  }
}

walk(root);

const sections = (root.children ?? []).map((child) => ({
  name: child.name,
  type: child.type,
  childCount: child.children?.length ?? 0,
}));

const wrapper = (root.children ?? []).find((c) => c.name === "wrapper_section");
const wrapperSections = (wrapper?.children ?? []).map((child) => ({
  name: child.name,
  type: child.type,
  childCount: child.children?.length ?? 0,
}));

console.log(
  JSON.stringify(
    {
      success: true,
      httpStatus: res.status,
      frameName: root.name,
      frameType: root.type,
      topLevelChildren: sections,
      wrapperSections,
      counts: {
        totalNodes: Object.values(typeCounts).reduce((a, b) => a + b, 0),
        byType: typeCounts,
        uniqueComponents: componentRefs.size,
        componentInstances: typeCounts.INSTANCE ?? 0,
        rectangles: typeCounts.RECTANGLE ?? 0,
        vectors: typeCounts.VECTOR ?? 0,
        frames: typeCounts.FRAME ?? 0,
        textNodes: typeCounts.TEXT ?? 0,
      },
      instanceNames: [...instanceNames].sort(),
    },
    null,
    2,
  ),
);
