const flatRoofData = {
  id: "flat-roof-01",
  title: "平屋面构造",
  category: "屋顶",
  description:
    "典型上人平屋面构造，由上至下共六层，适用于寒冷及夏热冬冷地区。",
  directionLabel: "由上至下：保护层→结构层",
  explodeAxis: "y",
  floatDirection: "z",
  cameraPosition: [4, 5, 6],
  layers: [
    {
      name: "保护层",
      material: "细石混凝土/地砖",
      thickness: 0.04,
      color: "#C4B5A5",
      description:
        "保护防水层免受机械损伤和紫外线老化，上人屋面可兼作使用面层。",
      modelPath: "/models/flat-roof-01/layer_01_protection.glb",
    },
    {
      name: "防水层",
      material: "SBS改性沥青防水卷材",
      thickness: 0.01,
      color: "#3A3A3A",
      description:
        "屋面防水核心层，防止雨水渗入结构，通常为两层或三层铺设。",
      modelPath: "/models/flat-roof-01/layer_02_waterproof.glb",
    },
    {
      name: "找平层",
      material: "1:3水泥砂浆",
      thickness: 0.02,
      color: "#B0A595",
      description:
        "为防水层提供平整、坚固的基层，厚度20mm。",
      modelPath: "/models/flat-roof-01/layer_03_leveling.glb",
    },
    {
      name: "保温层",
      material: "挤塑聚苯板 (XPS)",
      thickness: 0.10,
      color: "#F0A04B",
      description:
        "屋面保温核心层，挤塑板抗压强度高、吸水率低，适合倒置式屋面。",
      modelPath: "/models/flat-roof-01/layer_04_insulation.glb",
    },
    {
      name: "找坡层",
      material: "轻集料混凝土",
      thickness: 0.08,
      color: "#A0A0A0",
      description:
        "形成屋面排水坡度（通常2%），最薄处30mm，向落水口方向找坡。",
      modelPath: "/models/flat-roof-01/layer_05_slope.glb",
    },
    {
      name: "结构层",
      material: "钢筋混凝土屋面板",
      thickness: 0.15,
      color: "#808080",
      description:
        "建筑主体承重结构，承受屋面全部荷载并传递给梁柱。",
      modelPath: "/models/flat-roof-01/layer_06_structure.glb",
    },
  ],
};

export default flatRoofData;
