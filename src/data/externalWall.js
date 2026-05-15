const externalWallData = {
  id: "ext-wall-01",
  title: "外墙外保温系统",
  description:
    "适用于寒冷地区的外墙保温构造，由五层材料组成，从室内到室外依次为内饰面抹灰、钢筋混凝土结构层、挤塑聚苯板保温层、空气间层以及外饰面纤维水泥板。该系统能有效阻止热量流失，防止冷凝水形成。",
  directionLabel: "室内 → 室外",
  layers: [
    {
      name: "内饰面",
      material: "水泥砂浆抹灰",
      thickness: 0.02,
      color: "#D4C5B9",
      description: "室内表面抹灰层，提供平整的内墙面，作为后续装修的基层。",
    },
    {
      name: "结构层",
      material: "钢筋混凝土",
      thickness: 0.20,
      color: "#9E9E9E",
      description: "主要承重结构，提供建筑的整体稳定性和强度。",
    },
    {
      name: "保温层",
      material: "挤塑聚苯板 (XPS)",
      thickness: 0.10,
      color: "#FF9800",
      description:
        "核心保温材料，具有低导热系数，有效阻隔室内外热量传递。",
    },
    {
      name: "空气间层",
      material: "空气间层",
      thickness: 0.05,
      color: "#81D4FA",
      description:
        "空气间层提供额外的隔热和隔湿缓冲，防止冷凝水积聚。",
    },
    {
      name: "外饰面",
      material: "纤维水泥板",
      thickness: 0.03,
      color: "#8D6E63",
      description:
        "外饰面板，提供耐候保护，抵抗风雨侵蚀，同时赋予建筑外观。",
    },
  ],
};

export default externalWallData;
