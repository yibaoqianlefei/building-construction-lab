export default {
  id: "yuncheng-c-03",
  title: "03",
  category: "案例",
  description: "郓城县南湖新区公共服务建筑C地块设计 - 构造节点03",
  diagramImage: "/images/yuncheng03.png",
  explodeAxis: null,
  floatDirection: null,
  floatDistance: 0,
  modelRotation: [0, 0, 0],
  cameraPosition: [0, 1.2, 4.0],
  layers: [
    {
      name: "屋面",
      material: "屋面构造层",
      thickness: 0.2,
      color: "#b8860b",
      layerObjectName: "屋面",
      modelPath: "/models/yuncheng-c-03/yuncheng-c-03.glb",
      description: "建筑屋面构造，包含防水、保温等层次。"
    },
    {
      name: "干挂黑色花岗岩",
      material: "黑色花岗岩",
      thickness: 0.03,
      color: "#1a1a1a",
      layerObjectName: "干挂黑色花岗岩",
      modelPath: "/models/yuncheng-c-03/yuncheng-c-03.glb",
      description: "干挂黑色花岗岩外墙饰面，质感厚重耐久。"
    },
    {
      name: "橡胶板地面",
      material: "橡胶板",
      thickness: 0.02,
      color: "#4a4a4a",
      layerObjectName: "橡胶板地面",
      modelPath: "/models/yuncheng-c-03/yuncheng-c-03.glb",
      description: "橡胶板地面铺装，具有弹性和防滑性能。"
    },
    {
      name: "花岗岩台阶",
      material: "花岗岩",
      thickness: 0.15,
      color: "#808080",
      layerObjectName: "花岗岩台阶",
      modelPath: "/models/yuncheng-c-03/yuncheng-c-03.glb",
      description: "花岗岩台阶，坚固耐用，用于建筑入口处。"
    },
    {
      name: "铝合金压顶及封檐",
      material: "铝合金",
      thickness: 0.015,
      color: "#c0c0c0",
      layerObjectName: "铝合金压顶及封檐",
      modelPath: "/models/yuncheng-c-03/yuncheng-c-03.glb",
      description: "铝合金压顶及封檐，保护墙顶和檐口。"
    },
    {
      name: "其余构件",
      material: "综合",
      thickness: 0,
      color: "#cccccc",
      modelPath: "/models/yuncheng-c-03/yuncheng-c-03.glb",
      description: "建筑其余非交互部分。",
      excludeNames: ["屋面", "干挂黑色花岗岩", "橡胶板地面", "花岗岩台阶", "铝合金压顶及封檐"],
      interactive: false
    }
  ]
};
