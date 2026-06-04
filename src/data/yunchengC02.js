export default {
  id: "yuncheng-c-02",
  title: "02",
  category: "案例",
  description: "郓城县南湖新区公共服务建筑C地块设计 - 构造节点02",
  diagramImage: "/images/yuncheng02.png",
  explodeAxis: null,
  floatDirection: null,
  floatDistance: 0,
  modelRotation: [0, 0, 0],
  cameraPosition: [0, 1.2, 4.0],
  layers: [
    {
      name: "地面",
      material: "地面材质",
      thickness: 0.15,
      color: "#8b7355",
      layerObjectName: "地面",
      modelPath: "/models/yuncheng-c-02/yuncheng-c-02.glb",
      description: "建筑首层地面构造，包含垫层、面层等。"
    },
    {
      name: "干挂黑色磨光花岗岩板",
      material: "黑色磨光花岗岩",
      thickness: 0.03,
      color: "#1a1a1a",
      layerObjectName: "干挂黑色磨光花岗岩板",
      modelPath: "/models/yuncheng-c-02/yuncheng-c-02.glb",
      description: "干挂黑色磨光花岗岩板外墙饰面，质感高级。"
    },
    {
      name: "花岗岩面层有保温上人屋面",
      material: "花岗岩面层+保温层",
      thickness: 0.2,
      color: "#a0522d",
      layerObjectName: "花岗岩面层有保温上人屋面",
      modelPath: "/models/yuncheng-c-02/yuncheng-c-02.glb",
      description: "上人屋面，花岗岩面层，含保温构造。"
    },
    {
      name: "其余构件",
      material: "综合",
      thickness: 0,
      color: "#cccccc",
      modelPath: "/models/yuncheng-c-02/yuncheng-c-02.glb",
      description: "建筑其余非交互部分。",
      excludeNames: ["地面", "干挂黑色磨光花岗岩板", "花岗岩面层有保温上人屋面"],
      interactive: false
    }
  ]
};
