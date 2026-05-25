const nodesIndex = [
  {
    id: "ext-wall-01",
    title: "外墙外保温系统",
    description:
      "适用于寒冷地区的外墙保温构造，由五层材料组成，涵盖内饰面、结构层、保温层、空气间层及外饰面。",
    category: "墙体",
    thumbnail: null,
  },
  {
    id: "flat-roof-01",
    title: "平屋面构造",
    description:
      "上人平屋面，六层构造由上至下：保护层、防水层、找平层、保温层、找坡层、结构层。",
    category: "屋顶",
    thumbnail: null,
  },
  {
    id: "membrane-roof-01",
    title: "卷材防水屋面",
    description:
      "卷材防水屋面由多层材料叠合而成，按各层的作用分别为：顶棚层、结构层、找平层、结合层、防水层、保护层。",
    category: "屋顶",
    thumbnail: null,
  },
  {
    id: "roof-insulation-01",
    title: "卷材平面屋顶保温构造",
    description:
      "典型含保温层的卷材防水屋面，由结构层至保护层共九层。",
    category: "屋顶",
    thumbnail: null,
  },
];

const nodeLoaders = {
  "ext-wall-01": () => import("./externalWall.js"),
  "flat-roof-01": () => import("./flatRoof.js"),
  "membrane-roof-01": () => import("./membraneRoof.js"),
  "roof-insulation-01": () => import("./roofInsulation.js"),
};

export async function getNodeData(id) {
  const loader = nodeLoaders[id];
  if (!loader) return null;
  try {
    const mod = await loader();
    return mod.default;
  } catch {
    return null;
  }
}

export { nodesIndex };
