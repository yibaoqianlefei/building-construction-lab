import externalWallData from "./externalWall";
import flatRoofData from "./flatRoof";

const nodesIndex = [
  {
    id: "ext-wall-01",
    title: externalWallData.title,
    description:
      "适用于寒冷地区的外墙保温构造，由五层材料组成，涵盖内饰面、结构层、保温层、空气间层及外饰面。",
    category: "墙体",
    thumbnail: null,
  },
  {
    id: "flat-roof-01",
    title: flatRoofData.title,
    description:
      "上人平屋面，六层构造由上至下：保护层、防水层、找平层、保温层、找坡层、结构层。",
    category: "屋顶",
    thumbnail: null,
  },
];

function getNodeData(id) {
  switch (id) {
    case "ext-wall-01":
      return externalWallData;
    case "flat-roof-01":
      return flatRoofData;
    default:
      return null;
  }
}

export { nodesIndex, getNodeData };
