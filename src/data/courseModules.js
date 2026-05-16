const courseModules = [
  {
    id: "wall",
    title: "墙体",
    icon: "🧱",
    description: "外墙保温系统、承重墙、非承重隔墙等墙体构造做法。",
    nodeIds: ["ext-wall-01"],
    available: true,
  },
  {
    id: "roof",
    title: "屋面",
    icon: "🏠",
    description: "平屋面、坡屋面、种植屋面等屋面防水保温构造。",
    nodeIds: [],
    available: false,
  },
  {
    id: "foundation",
    title: "基础",
    icon: "🏗️",
    description: "条形基础、筏板基础、桩基础等基础与地基构造。",
    nodeIds: [],
    available: false,
  },
  {
    id: "window-door",
    title: "门窗",
    icon: "🚪",
    description: "门窗洞口构造、密封防水、遮阳与节能设计。",
    nodeIds: [],
    available: false,
  },
  {
    id: "stair",
    title: "楼梯",
    icon: "🪜",
    description: "钢筋混凝土楼梯、钢楼梯、装配式楼梯构造。",
    nodeIds: [],
    available: false,
  },
  {
    id: "expansion-joint",
    title: "变形缝",
    icon: "🔗",
    description: "伸缩缝、沉降缝、抗震缝的构造处理与盖缝做法。",
    nodeIds: [],
    available: false,
  },
];

export default courseModules;
