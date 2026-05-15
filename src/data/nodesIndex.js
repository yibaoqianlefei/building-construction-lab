import externalWallData from "./externalWall";

const nodesIndex = [
  {
    id: "ext-wall-01",
    title: externalWallData.title,
    description:
      "适用于寒冷地区的外墙保温构造，由五层材料组成，涵盖内饰面、结构层、保温层、空气间层及外饰面。",
    category: "外墙保温系统",
    thumbnail: null,
  },
];

function getNodeData(id) {
  switch (id) {
    case "ext-wall-01":
      return externalWallData;
    default:
      return null;
  }
}

export { nodesIndex, getNodeData };
