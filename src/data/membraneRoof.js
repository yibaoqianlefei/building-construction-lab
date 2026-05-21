const membraneRoofData = {
  id: "membrane-roof-01",
  title: "卷材防水屋面",
  category: "屋顶",
  description:
    "卷材防水屋面由多层材料叠合而成，按各层的作用分别为：顶棚层、结构层、找平层、结合层、防水层、保护层。",
  directionLabel: "从下至上：顶棚层→保护层",
  explodeAxis: "y",
  floatDirection: "z",
  floatDistance: 0.22,
  cameraPosition: [4, 5, 6],
  content: `# 卷材防水屋面

## 概述

卷材防水屋面是以沥青基或高分子防水卷材为主防水层的屋面形式，广泛应用于各类民用与工业建筑。其核心特点是防水层采用工厂预制成型的卷材产品，现场通过热熔、冷粘或机械固定等方式铺设，形成连续的防水膜。本节点展示的是典型六层构造体系。

## 构造层次（从下至上）

1. **顶棚层** —— 抹灰或轻钢龙骨吊顶，厚度约20mm，作为室内装饰面层，同时具有一定的隔汽和吸声作用。
2. **结构层** —— 钢筋混凝土屋面板，厚度150mm，现浇或预制，承受屋面全部荷载，是建筑的承重主体。
3. **找平层** —— 1:3水泥砂浆，厚度20mm，为防水卷材提供平整、坚固的基层，确保卷材铺设紧密贴合。
4. **结合层** —— 冷底子油或配套基层处理剂，厚度约0.5mm，在基层与卷材胶粘剂间形成胶质薄膜，增强粘结强度。
5. **防水层** —— SBS改性沥青防水卷材，厚度约10mm，是屋面防水核心层，采用热熔法铺贴，搭接宽度不小于100mm。
6. **保护层** —— 细石混凝土或地砖，厚度40mm，保护防水层免受紫外线和机械损伤。

## 设计要点

- 卷材铺设方向应顺屋面排水方向，搭接缝应顺流水方向。
- 女儿墙、出屋面管道根部须做附加防水层，上返高度不小于250mm。
- 找平层应设分格缝，纵横间距不宜大于6m。
- 冷底子油涂刷应均匀，不得漏涂，干燥后方可铺贴卷材。
- 卷材收头处应用密封膏封严。`,
  layers: [
    {
      name: "顶棚层",
      material: "抹灰/吊顶",
      thickness: 0.02,
      color: "#E5DCCF",
      modelPath: "/models/membrane-roof-01/卷材防水屋面.glb",
      layerObjectName: "01",
      description: "室内装饰层，兼有一定隔汽作用。",
    },
    {
      name: "结构层",
      material: "钢筋混凝土屋面板",
      thickness: 0.15,
      color: "#808080",
      modelPath: "/models/membrane-roof-01/卷材防水屋面.glb",
      layerObjectName: "02",
      description: "多为钢筋混凝土屋面板，可以是现浇板，也可以是预制板。",
      isStructural: true,
    },
    {
      name: "结合层",
      material: "冷底子油/粘结剂",
      thickness: 0.005,
      color: "#8B7355",
      modelPath: "/models/membrane-roof-01/卷材防水屋面.glb",
      layerObjectName: "03",
      description: "结合层的作用是在基层与卷材胶粘剂间形成一层胶质薄膜,使卷材与基层胶结牢固。沥青类卷材通常用冷底子油作结合层；高分子卷材则多采用配套基层处理剂，也有采用冷底子油或稀释乳化沥青作结合层的。",
    },
    {
      name: "找平层",
      material: "1:3水泥砂浆",
      thickness: 0.02,
      color: "#B0A595",
      modelPath: "/models/membrane-roof-01/卷材防水屋面.glb",
      layerObjectName: "04",
      description: "为防水层提供平整基层。",
    },
    {
      name: "防水层",
      material: "SBS改性沥青卷材",
      thickness: 0.01,
      color: "#3A3A3A",
      modelPath: "/models/membrane-roof-01/卷材防水屋面.glb",
      layerObjectName: "05",
      description: "核心防水层，防止雨水渗漏。",
    },
    {
      name: "保护层",
      material: "细石混凝土/地砖",
      thickness: 0.04,
      color: "#C4B5A5",
      modelPath: "/models/membrane-roof-01/卷材防水屋面.glb",
      layerObjectName: "06",
      description: "保护防水层免受紫外线及机械损伤。",
    },
  ],
};

export default membraneRoofData;
