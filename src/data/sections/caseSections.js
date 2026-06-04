const caseSections = [
  {
    id: "case-01",
    title: "砖混结构外墙案例",
    description: "某住宅项目砖混结构外墙的构造做法与节点分析",
    nodeIds: [],
    available: false,
  },
  {
    id: "case-02",
    title: "幕墙构造案例",
    description: "商业建筑玻璃幕墙的节点构造与防水设计",
    nodeIds: [],
    available: false,
  },
  {
    id: "case-03",
    title: "坡屋顶改造案例",
    description: "老旧小区平改坡工程的构造层次与施工要点",
    nodeIds: [],
    available: false,
  },
  {
    id: "case-yuncheng-c",
    title: "郓城县南湖新区公共服务建筑C地块设计",
    description: "郓城县南湖新区公共服务建筑C地块的构造设计案例",
    nodeIds: [],
    available: true,
    children: [
      {
        id: "case-yuncheng-c-01",
        title: "01",
        description: "基础与地下室构造节点",
        nodeIds: ["yuncheng-c-01"],
        available: true,
      },
      {
        id: "case-yuncheng-c-02",
        title: "02",
        description: "花岗岩外墙、屋面及地面构造节点",
        nodeIds: ["yuncheng-c-02"],
        available: true,
      },
    ],
  },
];

export default caseSections;
