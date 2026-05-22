const wallSections = [
  {
    id: "wall-types",
    title: "墙体的类型与设计要求",
    icon: "🧱",
    description: "介绍承重墙、非承重墙、填充墙等墙体分类，分析结构、保温、隔声、防火等基本设计要求。",
    nodeIds: [],
    available: false,
  },
  {
    id: "wall-brick",
    title: "砖墙构造",
    icon: "🧱",
    description: "讲述实心砖墙、空斗砖墙的砌筑方式，墙厚与模数，以及砖砌体的基本构造要求。",
    nodeIds: [],
    available: false,
  },
  {
    id: "wall-block",
    title: "砌块墙构造",
    icon: "🧱",
    description: "介绍混凝土小型空心砌块、加气混凝土砌块墙体的构造特点，芯柱与构造柱设置。",
    nodeIds: [],
    available: false,
  },
  {
    id: "wall-insulation",
    title: "墙体的保温与隔热",
    icon: "🧱",
    description: "讲述外墙外保温、外墙内保温、夹心保温三种体系的构造做法与适用范围。",
    nodeIds: ["ext-wall-01"],
    available: true,
  },
  {
    id: "wall-partition",
    title: "隔墙与幕墙",
    icon: "🧱",
    description: "介绍轻钢龙骨隔墙、玻璃幕墙、石材幕墙等非承重墙体的构造方法与连接节点。",
    nodeIds: [],
    available: false,
  },
];

export default wallSections;
