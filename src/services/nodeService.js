export function getAllNodes() {
  return [
    { id: "ext-wall-01", title: "外墙外保温系统", category: "墙体" },
    { id: "flat-roof-01", title: "平屋面构造", category: "屋顶" },
  ];
}

const loaders = {
  "ext-wall-01": () => import("../data/externalWall"),
  "flat-roof-01": () => import("../data/flatRoof"),
};

export async function loadNodeData(nodeId) {
  const loader = loaders[nodeId];
  if (!loader) return null;
  try {
    const mod = await loader();
    return mod.default;
  } catch {
    return null;
  }
}
