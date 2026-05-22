# 内容管理指南

本项目采用三层内容架构：**模块 → 子章节 → 教材内容**。所有内容通过数据文件 + Markdown 文件组合管理。

---

## 目录结构总览

```
src/data/
  courseModules.js              # 第 1 层：顶层模块（墙体、屋顶、楼梯...）
  sections/                     # 第 2 层：每个模块的子章节列表
    wallSections.js
    roofSections.js
    stairsSections.js
    ...
  nodesIndex.js                 # 3D 模型节点注册（单一来源）
  externalWall.js               # 节点数据（含 layers、modelPath 等）
  membraneRoof.js
  ...

public/
  textbook/                     # 第 3 层：子章节的教材内容（Markdown）
    roof-membrane/
      content.md                # 教材正文
      images/                   # 该章节专属图片（可选）
        layers-diagram.png
    wall-insulation/
      content.md
      images/
        detail.png
  images/                       # 全局共享图片（节点背景等）
    membrane-roof-bg.png
```

---

## 第 1 层：顶层模块

**文件**：`src/data/courseModules.js`

每个模块一个对象，定义模块的基本信息：

```js
{
  id: "stairs",           // 唯一 ID，对应 sections/stairsSections.js
  title: "楼梯",
  icon: "📐",
  description: "楼梯、台阶与坡道构造",
  nodeIds: [],            // 直接关联的节点 ID（可选）
  available: true,        // false = 不可点击，显示"即将上线"
}
```

**添加新模块**：

1. 在 `courseModules.js` 中加一条记录，设置 `available: true`
2. 创建 `src/data/sections/stairsSections.js`

---

## 第 2 层：子章节

**文件**：`src/data/sections/{moduleId}Sections.js`

每个子章节一个对象：

```js
{
  id: "stairs-rc",              // 唯一 ID，对应 public/textbook/{id}/content.md
  title: "钢筋混凝土楼梯",
  icon: "📐",                    // 可选，卡片图标
  description: "现浇与预制钢筋混凝土楼梯的构造做法。",
  nodeIds: ["stairs-01"],       // 关联的 3D 模型节点 ID
  available: true,              // false = 不可点击，显示"即将上线"
  hasTextbook: true,            // 是否有教材内容（读取 public/textbook/{id}/content.md）
  children: [],                 // 子子章节（递归，见下方说明）
}
```

### 子章节的点击行为（自动判断）

| 条件 | 点击跳转 |
|------|---------|
| `hasTextbook: true` | → `/textbook/{section.id}`  加载 Markdown 教材 |
| 无 `hasTextbook` 但有 `nodeIds` | → `/node/{nodeIds[0]}`  打开 3D 交互模型 |
| `available: false` | 不可点击，显示"即将上线" |

### 递归子章节（children）

如果某个子章节需要再细分：

```js
{
  id: "stairs-rc",
  title: "钢筋混凝土楼梯",
  description: "...",
  available: true,
  children: [
    {
      id: "stairs-rc-beam",
      title: "梁式楼梯",
      description: "梯段由踏步板和斜梁组成...",
      hasTextbook: true,
    },
    {
      id: "stairs-rc-slab",
      title: "板式楼梯",
      description: "梯段为整体现浇板...",
      nodeIds: ["stairs-01"],
    },
  ],
}
```

> 注：`children` 支持任意深度，但建议不超过 3 层。如需深层嵌套，可在前端增加面包屑导航。

---

## 第 3 层：教材内容（Markdown）

**文件**：`public/textbook/{sectionId}/content.md`

纯 Markdown 文件，支持以下扩展语法：

### 基本 Markdown

```md
## 标题

正文段落，**加粗**，*斜体*。

- 列表项
- 列表项

1. 有序列表
2. 有序列表
```

### 表格（GFM）

```md
| 列 1 | 列 2 | 列 3 |
|------|------|------|
| 数据 | 数据 | 数据 |
```

### 图片

```md
![描述文字](/textbook/roof-membrane/images/diagram.png)
```

> 路径建议用绝对路径，从 `/textbook/` 开始。也可引用全局图片 `/images/xxx.png`。

### 3D 模型卡片

```md
在文中插入可点击的模型入口：

[model: membrane-roof-01]
```

点击后跳转到 `/node/membrane-roof-01` 交互页面。

### 并排布局

```md
将图片和模型卡片放在同一行：

[side-by-side]
![示意图](/textbook/roof-membrane/images/diagram.png)
[model: membrane-roof-01]
[/side-by-side]
```

桌面端左右并排，移动端自动上下堆叠。

---

## 完整示例：添加"楼梯"模块

### 步骤 1：创建 3D 模型节点（可选）

在 `nodesIndex.js` 注册，创建 `src/data/stairs.js`。

### 步骤 2：创建子章节数据

`src/data/sections/stairsSections.js`：

```js
const stairsSections = [
  {
    id: "stairs-overview",
    title: "楼梯的类型与设计要求",
    icon: "📐",
    description: "介绍直跑楼梯、双跑楼梯、剪刀梯等形式及其设计规范。",
    nodeIds: [],
    available: false,
  },
  {
    id: "stairs-rc",
    title: "钢筋混凝土楼梯",
    icon: "📐",
    description: "现浇与预制钢筋混凝土楼梯的构造做法。",
    nodeIds: ["stairs-01"],
    available: true,
    hasTextbook: true,
  },
  {
    id: "stairs-steel",
    title: "钢楼梯",
    icon: "📐",
    description: "钢结构楼梯的梯段、平台、栏杆连接构造。",
    nodeIds: [],
    available: false,
  },
];

export default stairsSections;
```

### 步骤 3：编写教材 Markdown

`public/textbook/stairs-rc/content.md`：

```md
## 钢筋混凝土楼梯

钢筋混凝土楼梯是最常见的楼梯形式...

### 构造要点

1. 梯段厚度不宜小于 100mm
2. 平台板配筋应双向布置

![梁式楼梯详图](/textbook/stairs-rc/images/beam-detail.png)

| 部位 | 最小厚度 | 配筋要求 |
|------|---------|---------|
| 梯段板 | 100mm | φ8@150 |
| 平台板 | 80mm | φ6@200 |

[model: stairs-01]
```

### 步骤 4：配置课程模块

在 `courseModules.js` 中将 `stairs` 模块设为 `available: true`：

```js
{
  id: "stairs",
  available: true,
}
```

---

## 数据字段速查

### courseModules 条目

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 唯一 ID，对应 sections/{id}Sections.js |
| `title` | string | 显示名称 |
| `icon` | string | emoji 图标 |
| `description` | string | 简述 |
| `nodeIds` | string[] | 关联节点 |
| `available` | boolean | 是否可用 |

### sections 条目

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 唯一 ID，对应 textbook/{id}/content.md |
| `title` | string | 显示名称 |
| `icon` | string | emoji（可选） |
| `description` | string | 卡片简述 |
| `nodeIds` | string[] | 关联的 3D 节点 ID |
| `available` | boolean | false 则灰色不可点击 |
| `hasTextbook` | boolean | true 则点击跳转教材页 |
| `children` | array | 子子章节（递归，可选） |

### Markdown 扩展语法

| 语法 | 渲染效果 |
|------|---------|
| `[model: node-id]` | 可点击模型卡片 → `/node/node-id` |
| `[side-by-side]...[/side-by-side]` | 图片+卡片并排布局 |
| `![alt](path)` | 圆角图片 |
| `\| 表 \| 格 \|` | 学术风格表格 |

---

## 快速添加清单

- [ ] `nodesIndex.js` 注册节点（如有 3D 模型）
- [ ] `src/data/sections/xxxSections.js` 新建子章节数组
- [ ] `public/textbook/{sectionId}/content.md` 编写教材（可选）
- [ ] `public/textbook/{sectionId}/images/` 存放图片（可选）
- [ ] `courseModules.js` 设置 `available: true`
- [ ] `npm run build` 验证无错误
- [ ] `npm run dev` 浏览器测试
