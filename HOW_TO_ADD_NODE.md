# 如何添加新的构造节点

以添加"楼梯构造"为例，完整流程共 4 步。

---

## 第 1 步：准备模型 → `public/models/`

将 GLB 模型放到对应目录：

```
public/models/stairs-01/楼梯构造.glb
```

### Blender 导出建议

- **+Y 朝上**（从下到上堆叠），与 Three.js 坐标系一致
- 每个构件命名为 `"01"`, `"02"`, `"03"` ...（从下到上递增）
- 合拢时构件紧密贴合，无可见空隙
- 导出为单个 GLB 文件（所有构件在一个文件里）

> 如果每个构件是独立 GLB 文件，命名为 `layer_01_xxx.glb`、`layer_02_xxx.glb` 等。

---

## 第 2 步：建数据文件 → `src/data/stairs.js`

```js
const stairsData = {
  id: "stairs-01",
  title: "楼梯构造",
  category: "楼梯",
  description: "典型钢筋混凝土楼梯构造，从下至上共N层。",
  directionLabel: "从下至上：结构层→面层",
  explodeAxis: "y",           // 爆炸分离轴
  floatDirection: "z",        // 选中时浮动方向
  floatDistance: 0.22,        // 浮动距离（米）
  cameraPosition: [4, 5, 6],  // 相机初始位置

  layers: [
    // ★ 从下到上排列，索引 0 = 最底层
    {
      name: "结构层",
      material: "钢筋混凝土",
      thickness: 0.15,
      color: "#808080",
      modelPath: "/models/stairs-01/楼梯构造.glb",   // 共享 GLB 路径
      layerObjectName: "01",                           // 子物体名称
      description: "承重结构层，承受楼梯全部荷载。",
      isStructural: true,
    },
    {
      name: "面层",
      material: "防滑地砖",
      thickness: 0.02,
      color: "#C4B5A5",
      modelPath: "/models/stairs-01/楼梯构造.glb",
      layerObjectName: "02",
      description: "踏步面层，兼具防滑与装饰功能。",
    },
    // ... 更多层
  ],
};

export default stairsData;
```

### 数据字段参考

| 字段 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `id` | string | 唯一标识，命名规则 `类型-序号` | 必填 |
| `title` | string | 显示名称 | 必填 |
| `category` | string | 分类：墙体/屋顶/楼梯/基础等 | 必填 |
| `description` | string | 简要描述，显示在节点详情页 | 必填 |
| `directionLabel` | string | 层次方向说明 | 可选 |
| `explodeAxis` | string | 爆炸轴：`"x"` / `"y"` / `"-y"`（负号=反向） | `"x"` |
| `floatDirection` | string | 选中浮起方向：`"x"` / `"y"` / `"z"` | `"y"` |
| `floatDistance` | number | 浮起距离（米） | `0.14` |
| `modelRotation` | array | 模型旋转修正 `[rx, ry, rz]`（弧度） | 不需要 |
| `cameraPosition` | array | 相机初始位置 `[x, y, z]` | `[1.2, 1.6, 2.8]` |

#### 层数据字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 层名称 |
| `material` | string | 材料描述 |
| `thickness` | number | 厚度（米），非共享 GLB 时必须准确 |
| `color` | string | 颜色 hex，程序化 Box 或备用显示 |
| `modelPath` | string | GLB 文件路径 |
| `layerObjectName` | string | 共享 GLB 中的子物体名（`"01"`, `"02"`...） |
| `description` | string | 详细说明 |
| `isStructural` | boolean | 是否为结构层（可选） |

### 两种模型模式

**模式 A — 共享 GLB + layerObjectName**（推荐）：
- 所有层指向同一个 GLB 文件
- 每层通过 `layerObjectName` 指定子物体名称
- `useGLTF` 自动缓存，6 层加载同一文件只解析一次
- WallAssembly 自动检测并跳过厚度计算，直接使用 GLB 原始位置
- 优点：模型位置精确，无空隙

**模式 B — 独立 GLB 文件**：
- 每层一个独立 GLB 文件
- 不设 `layerObjectName`
- 位置由 `thickness` 累加计算
- 适用于独立建模的构件

---

## 第 3 步：注册到 3 个索引文件

### ③a. `src/data/nodesIndex.js` — 3 处改动

```js
// 1) 顶部导入
import stairsData from "./stairs";

// 2) nodesIndex 数组新增条目
{
  id: "stairs-01",
  title: stairsData.title,
  description: stairsData.description,
  category: "楼梯",
  thumbnail: null,
},

// 3) getNodeData 函数新增 case
case "stairs-01":
  return stairsData;
```

### ③b. `src/services/nodeService.js` — 2 处改动

```js
// getAllNodes() 数组新增（影响构造游戏页面）
{ id: "stairs-01", title: "楼梯构造", category: "楼梯" },

// loaders 对象新增（影响懒加载）
"stairs-01": () => import("../data/stairs"),
```

### ③c. `src/data/courseModules.js` — 1 处改动

```js
{
  id: "stairs",
  title: "楼梯",
  nodeIds: ["stairs-01"],  // 原来可能是空数组
  available: true,          // 原来可能是 false
}
```

---

## 第 4 步：验证

```bash
npm run build    # 确认无编译错误
npm run dev      # 浏览器验证
```

### 验证清单

- [ ] 节点库页面（`/library`）出现新节点
- [ ] 课程目录页面（`/curriculum`）对应模块可点击进入
- [ ] 打开节点，3D 模型正确堆叠，无空隙
- [ ] 拖动爆炸滑块，各层沿设定轴均匀分离
- [ ] 点击选中构件：金色线框 + 其他层半透明
- [ ] 选中层向前浮动（Z 轴方向）
- [ ] 右侧知识栏/左侧全览面板卡片顺序正确（从上到下 = 保护层→底层）
- [ ] 构造游戏页面（`/games`）可选此节点并正常拖拽拼装
- [ ] 悬停、旋转、阴影均正常

---

## 注意事项

1. **卡片显示顺序**：UI 面板自动反转 layers 数组（`.reverse()`），所以数据文件保持"从下到上"的物理顺序即可，UI 会自动显示为"从上到下"。

2. **爆炸方向**：如果爆炸后各层移动方向反了，将 `explodeAxis` 改为 `"-y"`（加负号）。

3. **构造游戏**：游戏的拖拽拼装场景 `GameAssembleScene` 使用独立的定位逻辑，如果游戏中的位置不对，需要检查 `GameAssembleScene.jsx` 中的位置计算。

4. **旧式节点**：如果新模型使用独立 GLB 文件（无 `layerObjectName`），注意 `thickness` 必须精确，否则会出现空隙。
