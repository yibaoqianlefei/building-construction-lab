# Claude Code 协作工作流：建筑构造交互系统

## 快速命令

```bash
npm run dev        # 启动开发服务器 (HMR)
npm run build      # 生产构建
npm run typecheck  # TypeScript 类型检查
```

## 一、项目文件地图

### 核心交互文件（高频修改）

| 文件 | 职责 | 何时改 |
|------|------|--------|
| `src/components/viewer/ModelViewer.jsx` | 3D 场景总控：Canvas、WallAssembly、CameraSwitcher、OrbitControls | 相机、爆炸、渲染行为 |
| `src/components/viewer/ConstructionLayer.jsx` | 单层渲染：GLB 加载、线框、高亮、悬停、点击 | 图层视觉、交互事件 |
| `src/components/viewer/BottomControlBar.tsx` | 底部控制栏 UI | 新增按钮、控制项 |
| `src/components/viewer/ExplosionLabels.jsx` | 爆炸标注标签 | 标签样式、位置 |
| `src/components/viewer/SpatialLabel.jsx` | 点击弹出的空间知识卡片 | 卡片样式、定位 |
| `src/NodeDetail.tsx` | 节点详情页：三栏布局、状态管理、事件连接 | 页面级状态、props 透传 |

### 数据文件

| 文件 | 职责 | 何时改 |
|------|------|--------|
| `src/data/yunchengC01.js` | 郓城 C 地块节点 01 数据 | 新增/修改节点图层 |
| `src/data/yunchengC02.js` | 节点 02 数据 | 同上 |
| `src/data/nodesIndex.ts` | 节点索引 + 动态加载器 | 注册新节点 |
| `src/data/sections/caseSections.js` | 案例课程章节结构 | 新增/修改子章节 |
| `src/types/index.ts` | TypeScript 类型定义 | 新增字段 |
| `src/hooks/useModelInteraction.ts` | 交互状态 hook | 新增全局交互状态 |

### 脚本与工具

| 文件 | 用途 |
|------|------|
| `scripts/compress-models.cjs` | GLB 压缩：Draco 网格 + 纹理 WebP |

### 资源目录

```
public/models/          # GLB 模型文件（已 Draco 压缩）
public/draco/gltf/      # Draco 解码器 WASM/JS
public/images/          # 剖面图等图片
```

---

## 二、新增节点工作流（3 步）

### Step 1：创建节点数据文件

```js
// src/data/myNode.js
export default {
  id: "my-node-id",
  title: "节点名称",
  description: "描述",
  diagramImage: "/images/my-diagram.png", // 可选
  explodeAxis: null,       // null=无爆炸, "x"/"y"=单轴爆炸, "individual"=独立爆炸
  floatDirection: null,    // null=无浮动
  floatDistance: 0,
  modelRotation: [0, 0, 0],
  cameraPosition: [0, 1.2, 4.0],
  layers: [
    {
      name: "图层名称",
      material: "材料",
      thickness: 0.03,           // 米
      color: "#cccccc",
      modelPath: "/models/my-model.glb",
      layerObjectName: "GLB中的物体名", // 共享 GLB 时必填
      description: "描述文字",
      interactive: true,         // false = 不响应交互
    },
    // 非交互"其余构件"层：
    {
      name: "其余构件",
      material: "综合",
      thickness: 0,
      color: "#cccccc",
      modelPath: "/models/my-model.glb",
      description: "其余非交互部分",
      excludeNames: ["物体A", "物体B"], // 隐藏这些交互构件
      interactive: false,
    }
  ]
};
```

### Step 2：注册到节点索引

```js
// src/data/nodesIndex.ts
// 1. nodesIndex 数组加一条
{ id: "my-node-id", title: "...", description: "...", category: "...", thumbnail: null },

// 2. nodeLoaders 映射加一行
"my-node-id": () => import("./myNode"),
```

### Step 3：关联到课程章节

```js
// src/data/sections/caseSections.js（或其他 sections 文件）
{ id: "section-id", title: "子章节", nodeIds: ["my-node-id"], available: true }
```

### 确保资源就位

```bash
# 模型文件
public/models/<model-dir>/<file>.glb

# 如果模型 > 1MB，运行压缩
node scripts/compress-models.cjs
```

---

## 三、与 Claude Code 协作模式

### 模式 1：数据驱动（推荐）

> **Claude 只写数据文件，不改组件代码。**

适用于：新增节点、修改图层配置、调整颜色/厚度/文字。

**告诉 Claude**：
```
新增一个节点 my-node，数据为：
- 5 个交互图层，名称分别为 A/B/C/D/E
- 共享 GLB，layerObjectName 为 "A"~"E"
- 其余构件不交互
请创建数据文件并注册到索引。
```

### 模式 2：组件修改（需要验证）

> **Claude 修改组件 + 构建验证。**

适用于：修复 bug、优化交互、新增 UI 功能。

**告诉 Claude**：
```
问题：正交模式下空间卡片过大。
原因：Html 的 distanceFactor 在正交下失效。
方案：统一使用固定 scale=0.55。
请修改 SpatialLabel.jsx 和 ExplosionLabels.jsx。
```

### 模式 3：补丁脚本（批量操作）

> **Claude 写临时脚本执行批量修改，执行后删除脚本。**

适用于：批量更新字段、重命名、格式转换。

---

## 四、常见任务速查

### 调试 GLB 物体名称

打开节点页面，打开浏览器控制台（F12），查找 `[GLB Debug]` 输出，列出所有物体名称。对照修改 `layerObjectName`。

### 调整 UI 样式

所有 UI 使用 Tailwind 语义色变量（不要硬编码颜色）：

| 变量 | 用途 |
|------|------|
| `text-primary` | 主强调色（玫瑰红） |
| `bg-canvas` | 面板/卡片背景 |
| `bg-hairline` | 分隔线/边框色 |
| `text-body` / `text-body-strong` | 正文/强文本 |
| `text-muted-soft` | 弱文本/图标 |

### 调整 3D 视图默认值

| 参数 | 位置 | 说明 |
|------|------|------|
| 默认相机模式 | `useModelInteraction.ts:6` | `isOrthographic` 初始值 |
| 初始视角方向 | `NodeDetail.tsx:51` | `viewTarget` 初始值 |
| 透视 FOV | `ModelViewer.jsx:411` | `PERSP_FOV = 40` |
| 爆炸速度 | `ModelViewer.jsx:10` | `EXPLODE_LERP = 1.0` |

### 新增交互按钮

1. `BottomControlBar.tsx` — 添加 UI 按钮
2. `useModelInteraction.ts` — 添加状态
3. `NodeDetail.tsx` — 透传 props 和快捷键

### 修复构件识别错误

1. 浏览器控制台查看 `[GLB Debug]` 输出
2. 对比 `layerObjectName` 与实际输出名称
3. 修正 `yunchengC0X.js` 中的名称

---

## 五、提交与推送

```bash
git add -A
git commit -m "feat/fix: 简短描述"
git push
```

提交信息格式：`feat: 功能描述` / `fix: 修复描述` / `refactor: 重构描述`

---

## 六、调试检查清单

遇到模型交互问题时，按顺序排查：

1. **模型文件存在？** → `ls public/models/<dir>/`
2. **GLB 物体名称匹配？** → 控制台 `[GLB Debug]` 输出
3. **构建通过？** → `npm run build`
4. **开发服务器运行？** → `npm run dev`
5. **浏览器控制台有报错？** → F12 Console
6. **Network 404？** → F12 Network，检查 GLB 路径
7. **React 组件报错？** → 检查 props 透传链路
