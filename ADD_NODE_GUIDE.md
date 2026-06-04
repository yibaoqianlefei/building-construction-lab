# 新增案例子章节完整工作流

以添加 `yuncheng-c-03` 为例，展示从 GLB 模型到可交互页面的全过程。

---

## 前置准备

### 你需要提供

1. **GLB 模型文件**，放入 `public/models/yuncheng-c-03/yuncheng-c-03.glb`
2. **剖面图**（可选），放入 `public/images/yuncheng03.png`
3. **交互构件清单**：哪些是交互构件、各自名称、材质、厚度、颜色

### 你需要知道的 GLB 内部物体名称

运行 `npm run dev`，打开浏览器控制台，GLB 加载后自动输出：
```
[GLB Debug] /models/yuncheng-c-03/yuncheng-c-03.glb — N named objects
"物体A" (Mesh)
"物体B" (Group)
...
```

---

## 完整操作步骤

### Step 1：创建节点数据文件

```js
// src/data/yunchengC03.js
export default {
  id: "yuncheng-c-03",
  title: "03",
  category: "案例",
  description: "描述文字",
  diagramImage: "/images/yuncheng03.png",
  explodeAxis: null,        // null = 无爆炸
  floatDirection: null,
  floatDistance: 0,
  modelRotation: [0, 0, 0],
  cameraPosition: [0, 1.2, 4.0],
  layers: [
    // ── 交互构件（每个独立可点击） ──
    {
      name: "构件A",
      material: "材质",
      thickness: 0.03,
      color: "#aabbcc",
      layerObjectName: "物体A",          // ← GLB 中的精确名称
      modelPath: "/models/yuncheng-c-03/yuncheng-c-03.glb",
      description: "简短描述。"
    },
    // ... 更多交互构件 ...

    // ── 其余构件（不响应交互） ──
    {
      name: "其余构件",
      material: "综合",
      thickness: 0,
      color: "#cccccc",
      modelPath: "/models/yuncheng-c-03/yuncheng-c-03.glb",
      description: "建筑其余非交互部分。",
      excludeNames: ["物体A", "物体B", ...],  // ← 排除所有交互构件
      interactive: false
    }
  ]
};
```

### Step 2：注册到节点索引

`src/data/nodesIndex.ts`，两处添加：

```ts
// 1. 索引数组（约第 42 行）
{
  id: "yuncheng-c-03",
  title: "03",
  description: "...",
  category: "案例",
  thumbnail: null,
},

// 2. 动态加载器（约第 59 行）
"yuncheng-c-03": () => import("./yunchengC03"),
```

### Step 3：关联到案例章节

`src/data/sections/caseSections.js`，在 `children` 数组添加：

```js
{
  id: "case-yuncheng-c-03",
  title: "03",
  description: "简短描述",
  nodeIds: ["yuncheng-c-03"],
  available: true,
},
```

### Step 4：运行压缩（>1MB 的 GLB）

```bash
node scripts/compress-models.cjs
```

### Step 5：验证

```bash
npm run build   # 构建通过
npm run dev     # 浏览器访问 /node/yuncheng-c-03
```

---

## Claude Code 实现模板

直接复制以下指令发给 Claude Code：

```
新增案例子章节 yuncheng-c-03：

## 数据
- GLB：public/models/yuncheng-c-03/yuncheng-c-03.glb
- 剖面图：public/images/yuncheng03.png（如有）
- GLB 物体名称：["物体A", "物体B", "物体C"]
- 描述：简短描述文字

## 要求
1. 创建 src/data/yunchengC03.js（3 个交互构件 + 其余构件）
2. 注册到 src/data/nodesIndex.ts
3. 更新 src/data/sections/caseSections.js
4. 构建验证
```

Claude Code 会自动：
1. 创建数据文件并填入你提供的名称
2. 在索引文件追加条目和加载器
3. 在章节文件追加子章节
4. 运行 `npm run build` 验证

---

## 交互构件独立爆炸（可选）

如果希望每个构件有独立的爆炸效果，在每个交互构件的 layer 中加：

```js
{
  name: "构件A",
  // ...其他字段...
  explodeDirection: "auto",   // 自动选择不重叠方向
  explodeDistance: 0.2,       // 爆炸移动距离（米）
}
```

并将节点顶层的 `explodeAxis` 改为 `"individual"`。

---

## 验证检查点

打开 `/node/yuncheng-c-03`：

| 检查项 | 预期 |
|--------|------|
| 模型完整显示 | ✅ 所有构件可见 |
| 悬停交互构件 | ✅ 对应构件高亮 |
| 点击交互构件 | ✅ 弹出空间卡片 + 右侧知识面板联动 |
| 点击其余区域 | ✅ 无反应 |
| 右侧面板 | ✅ 列出所有图层 |
| 切换正交/透视 | ✅ 模型大小一致 |
