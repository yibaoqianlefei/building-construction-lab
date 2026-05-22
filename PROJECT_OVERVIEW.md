# PROJECT_OVERVIEW — 建筑构造交互系统

> 生成日期: 2026-05-22 | 版本: 1.0.0

---

## 1. 项目简介

**项目名称**: 建筑构造交互系统 (Building Construction Interactive Textbook)

**目的**: 面向建筑学教育的开源数字交互教材。通过三维可视化、分解视图和拖拽拼装游戏，帮助学生和从业者直观理解建筑构造层次的空间逻辑。

**目标用户**: 建筑学专业学生、建筑行业从业者、高校教师（可通过班级系统管理学生）。

---

## 2. 技术栈

| 类别 | 技术 | 用途 |
|------|------|------|
| 前端框架 | React 19 + React Router DOM v7 | 组件化 UI 与路由 |
| 构建工具 | Vite 8 | 开发服务器与生产构建 |
| 3D 渲染 | Three.js v0.184 + `@react-three/fiber` + `@react-three/drei` | 3D 模型加载、场景渲染、交互控制 |
| 样式方案 | Tailwind CSS 4 + `@tailwindcss/vite` | 原子化样式，自定义 gold-* 色板 |
| 字体 | Noto Serif SC (Google Fonts) | 中文字体 |
| 动画 | Framer Motion v12 | 页面过渡、弹性动画 |
| 拖拽 | `@dnd-kit` v6 | 游戏拖拽排序（SortChallenge） |
| 状态管理 | React Context (AuthContext) | 认证状态全局共享 |
| 后端/数据库 | Supabase (PostgreSQL) | 用户认证、数据库、RLS 行级安全 |
| Markdown 渲染 | `react-markdown` + `remark-gfm` | 教材内容渲染 |
| 图标 | Lucide React + React Icons | UI 图标 |
| 语言 | JavaScript (JSX, 无 TypeScript) | 全项目 |

---

## 3. 文件结构

```
02-2/
├── index.html                     # 入口 HTML，加载 Noto Serif SC 字体
├── package.json                   # 依赖与脚本
├── vite.config.js                 # Vite 配置 (Tailwind CSS 插件)
├── public/
│   ├── favicon.svg
│   ├── images/                    # 教材插图
│   ├── models/                    # GLB 3D 模型文件
│   │   ├── flat-roof-01/          # 平屋面：每层独立 GLB (6 个)
│   │   ├── membrane-roof-01/      # 卷材防水屋面：单 GLB + layerObjectName
│   │   └── roof-insulation-01/    # 卷材平面屋顶保温：单 GLB + layerObjectName
│   └── textbook/                  # 教材 Markdown 文件
│       ├── roof-membrane/content.md
│       └── roof-insulation/content.md
└── src/
    ├── main.jsx                   # React 入口
    ├── App.jsx                    # 路由定义（所有路由集中在此）
    ├── NodeDetail.jsx             # 核心页面：3D 模型查看 + 知识面板 + 截图
    ├── index.css                  # Tailwind 入口 + gold 色板定义
    │
    ├── contexts/
    │   └── AuthContext.jsx        # 认证上下文：Supabase auth + profiles 表
    │
    ├── lib/
    │   └── supabaseClient.js      # Supabase 客户端初始化
    │
    ├── components/
    │   ├── AppLayout.jsx          # 全局布局：吸顶导航栏 + <Outlet>
    │   ├── ProtectedRoute.jsx     # 认证守卫：未登录重定向 /auth
    │   ├── viewer/                # 3D 查看器组件
    │   │   ├── ModelViewer.jsx    # Three.js Canvas 包装，含 WallAssembly/CameraAdjuster/ShadowLight
    │   │   ├── ConstructionLayer.jsx  # 单层渲染：GLB 模型 / 程序化 Box
    │   │   ├── BottomControlBar.jsx   # 底部控制栏：爆炸滑块/旋转/截图/面板
    │   │   ├── ConstructionKnowledgePanel.jsx  # 右侧知识卡面板
    │   │   ├── LeftKnowledgePanel.jsx  # 左滑出全部构件面板
    │   │   ├── LayerLabel.jsx     # 浮层标签卡片（点击图层弹出）
    │   │   ├── ScreenshotTool.jsx # 框选截图工具（保存到笔记）
    │   │   ├── ExplodeControls.jsx    # 爆炸控制（独立组件）
    │   │   └── MenuBackground.jsx # 首页 3D 背景动效
    │   └── game/                  # 游戏组件
    │       ├── GameAssembleScene.jsx  # 拼装游戏场景：Canvas + 拖拽层
    │       ├── DraggableLayer.jsx     # 可拖拽图层：snap 判定
    │       ├── GameModelPreview.jsx   # 游戏模型预览
    │       └── SortChallenge.jsx      # 排序挑战（@dnd-kit 实现）
    │
    ├── pages/                     # 页面组件
    │   ├── HomePage.jsx           # 首页：侧边菜单 + 3D 背景
    │   ├── AuthPage.jsx           # 登录/注册页
    │   ├── LibraryPage.jsx        # 节点库：按分类展示所有构造节点
    │   ├── CurriculumPage.jsx     # 课程目录：课程模块网格 → 章节列表
    │   ├── SectionSubPage.jsx     # 章节子页面：动态加载章节数据
    │   ├── TextbookPage.jsx       # 教材阅读页：Markdown + @model/[side-by-side]标记
    │   ├── NotesPage.jsx          # 笔记管理：截图查看/备注/对比
    │   ├── GamesPage.jsx          # 游戏页：节点选择 + 拖拽拼装
    │   ├── ClassesPage.jsx        # 班级列表：创建/加入班级
    │   ├── ClassDetailPage.jsx    # 班级详情：课程/任务/成员标签
    │   ├── RoofSubPage.jsx        # 屋顶章节（旧版路由页）
    │   └── PlaceholderPage.jsx    # 占位页：/tools /contribute /admin
    │
    ├── data/                      # 数据层
    │   ├── nodesIndex.js          # 节点索引：id→元数据映射 + getNodeData()
    │   ├── courseModules.js       # 课程模块定义（绪论/墙体/屋顶/...）
    │   ├── externalWall.js        # 外墙外保温节点数据（5层，程序化Box）
    │   ├── flatRoof.js            # 平屋面节点数据（6层，每层独立GLB）
    │   ├── membraneRoof.js        # 卷材防水屋面节点数据（6层，单GLB+layerObjectName）
    │   ├── roofInsulation.js      # 卷材平面屋顶保温节点数据（9层，单GLB+layerObjectName）
    │   ├── roofSections.js        # 屋顶章节数据
    │   ├── sections/              # 各模块章节数据（动态import）
    │   │   ├── introSections.js
    │   │   ├── structureSections.js
    │   │   ├── foundationSections.js
    │   │   ├── wallSections.js
    │   │   ├── floorSections.js
    │   │   ├── stairsSections.js
    │   │   ├── windowSections.js
    │   │   └── roofSections.js
    │   └── supabase_schema.sql    # 数据库建表 SQL（profiles/classes/class_members/assignments/student_progress）
    │
    └── services/                  # 业务逻辑层
        ├── nodeService.js         # 节点动态加载（import() 代码分割）
        ├── classService.js        # 班级 CRUD（Supabase 操作）
        └── noteService.js         # 笔记 CRUD（localStorage 操作）
```

---

## 4. 功能清单

| 功能 | 路由 | 核心组件 | 数据来源 |
|------|------|----------|----------|
| **首页**（3D 背景 + 菜单） | `/` | HomePage, MenuBackground | externalWall.js (3D背景) |
| **用户认证**（登录/注册） | `/auth` | AuthPage | Supabase Auth + profiles 表 |
| **节点库**（分类浏览） | `/library` | LibraryPage | nodesIndex.js |
| **课程目录**（模块选择） | `/curriculum` | CurriculumPage | courseModules.js |
| **章节浏览**（模块子章节） | `/curriculum/:moduleId` | SectionSubPage | sections/*.js (动态import) |
| **教材阅读**（含交互模型引用） | `/textbook/:sectionId` | TextbookPage | public/textbook/*/content.md |
| **3D 模型查看器**（核心） | `/node/:nodeId` | NodeDetail, ModelViewer, ConstructionLayer | 节点数据文件 |
| **图层爆炸/分解** | `/node/:nodeId` | BottomControlBar (滑块 0-100) | 节点 layers[] 厚度数据 |
| **图层高亮/选中** | `/node/:nodeId` | ConstructionLayer (hover/select) | 交互状态 |
| **知识卡片**（右侧面板） | `/node/:nodeId` | ConstructionKnowledgePanel | 节点 layers[] |
| **浮层标签**（点击弹出） | `/node/:nodeId` | LayerLabel | 图层元数据 |
| **框选截图**（保存笔记） | `/node/:nodeId` | ScreenshotTool | Canvas → dataURL |
| **笔记管理**（查看/备注/对比/删除） | `/notes` | NotesPage | localStorage (max 30条) |
| **构造拼装游戏** | `/games` | GamesPage, GameAssembleScene, DraggableLayer | nodeService 动态加载 |
| **班级管理**（创建/加入） | `/classes` | ClassesPage | classService → Supabase |
| **班级详情**（课程/任务/成员） | `/classes/:classId` | ClassDetailPage | classService → Supabase |
| **教师后台**（占位） | `/admin` | PlaceholderPage | — |
| **贡献节点**（占位） | `/contribute` | PlaceholderPage | — |
| **构造工具**（占位） | `/tools` | PlaceholderPage | — |

---

## 5. 数据流说明

### 5.1 节点数据加载

```
路由 /node/:nodeId
  → NodeDetail.jsx: getNodeData(nodeId)
    → nodesIndex.js: switch(id) 返回静态 import 的节点数据
  （同时 nodeService.js 提供 loadNodeData(id) 动态 import 版本，供 GamesPage 等使用）
  → ModelViewer: 接收 layers[] 数组
    → WallAssembly: 计算初始位置（层厚累加偏移 / 模型层全为0）
      → ConstructionLayer × N: 每层渲染
        → 有 modelPath + layerObjectName → useGLTF(modelPath) → scene.getObjectByName(name) → clone
        → 有 modelPath 无 layerObjectName → useGLTF(modelPath) → clone 整个 scene
        → 无 modelPath → 程序化 Box (boxGeometry + boxGeometry edges)
```

**关键**: `WallAssembly` 通过 `layers[0]?.layerObjectName != null` 判断是否使用模型位置（全部置 0，依赖 GLB 内部坐标）还是程序化位置（按 thickness 累加偏移）。

### 5.2 用户认证流程

```
App.jsx: <AuthProvider> 包裹所有路由
  → AuthContext: supabase.auth.getSession() 恢复会话
  → supabase.auth.onAuthStateChange() 监听变化
  → fetchProfile(userId) → profiles 表查询 role/full_name
  → Context value: { user, profile, loading, signUp, signIn, signOut }

ProtectedRoute: 检查 user && !loading
  → 未登录 → <Navigate to="/auth">
  → 已登录 → 渲染 children

AuthPage: signUp() 注册 / signIn() 登录
  → Supabase trigger on_auth_user_created 自动创建 profiles 行
  → role 通过 raw_user_meta_data 传递
```

### 5.3 班级与进度系统

```
ClassesPage
  → createClass(name) → Supabase classes 表 INSERT (随机6位加入码)
  → joinClass(code) → 查 classes 表 → class_members 表 INSERT
  → getMyClasses() → 并行查询 taught (classes WHERE teacher_id) + enrolled (class_members JOIN classes)

ClassDetailPage
  → getClassDetail(id) → classes + profiles + class_members 联合查询
  → 3 个标签: 课程(复用CurriculumPage) / 任务(占位) / 成员(仅教师可见)

数据库表 (Supabase, RLS 已启用):
  profiles     — 用户资料 (role: teacher/student)
  classes      — 班级 (join_code, teacher_id)
  class_members — 班级成员关系
  assignments  — 任务 (node_ids JSONB)
  student_progress — 学生进度 (node_id + status)
```

### 5.4 教材系统

```
路由 /textbook/:sectionId
  → TextbookPage: 从 roofSections.js 找章节元数据
  → fetch(/textbook/{sectionId}/content.md) 加载 Markdown
  → parseContent() 解析自定义标记:
    - [model: nodeId]  → 渲染 ModelCard (Link → /node/:nodeId)
    - [side-by-side]...[/side-by-side] → 渲染 SideBySide (图片+模型并排)
    - 普通 Markdown → react-markdown + remarkGfm 渲染
  → 自定义组件: img/table/thead/th/td 样式增强
```

### 5.5 构造游戏逻辑

```
GamesPage
  → getAllNodes() 展示节点选择标签
  → loadNodeData(nodeId) 动态加载选中节点数据
  → GameAssembleScene:
    - 计算 targetPositions: 按 thickness + GAP 累加
    - 打乱 startPositions: shuffle(targetPositions) 随机分配初始位置
    - lockedSlots (Set): 跟踪已正确放置的槽位
    - DraggableLayer × N:
      - DragControls (drei): 沿爆炸轴拖拉
      - handleDragEnd: 找最近的未锁定 slot，距离 < SNAP_DIST=0.2 且 slotIdx===layerIdx → 锁定
      - 全部锁定 → Celebration 球体 + 完成模态框
```

---

## 6. 关键设计模式

### 6.1 数据驱动

所有构造节点均为纯 JS 对象定义（`src/data/*.js`），包含 `id`, `title`, `layers[]`。ModelViewer、ConstructionKnowledgePanel、LeftKnowledgePanel 等组件完全由 `layers[]` 驱动，新增节点只需添加数据文件和索引注册即可。

### 6.2 组件复用

- **ConstructionLayer**: 自动检测是否有 modelPath，有则走 GLB 渲染路径，无则走程序化 Box 路径。同时处理 hover/select/dim 三种视觉状态（emissive glow/opacity 变化）。
- **KnowledgePanel** ×2: 右侧 ConstructionKnowledgePanel（可折叠卡片）+ 左侧 LeftKnowledgePanel（滑出面板），共享同一 layers 数据。

### 6.3 动态加载（代码分割）

- `nodeService.js`: `loadNodeData(id)` 通过 `import()` 动态加载节点数据文件，避免首屏加载所有大型数据。
- `SectionSubPage.jsx`: 根据 moduleId 动态 `import()` 对应 sections 数据。
- `TextbookPage`: `fetch()` 从 `/public/textbook/` 动态加载 Markdown 内容。

### 6.4 状态提升 + 回调传递

NodeDetail 持有所有核心状态（explodeValue, hoveredLayer, selectedLayer, activeCard），通过 props 向下传递给 ModelViewer 和 ConstructionKnowledgePanel。图层点击事件通过 `onLayerClick` 回传至 NodeDetail，再由 NodeDetail 分发给 LayerLabel。

### 6.5 两种模型加载模式

1. **独立 GLB 模式** (flat-roof-01): 每层一个独立 GLB 文件，`modelPath` 直接指向文件，不需要 `layerObjectName`。
2. **共享 GLB 模式** (membrane-roof-01, roof-insulation-01): 所有层共用一个 GLB 文件，每层通过 `layerObjectName` (如 "01"~"09") 从场景中提取子物体并克隆渲染。`useGLTF` 内置缓存保证同一文件只加载一次。

---

## 7. 当前数据文件索引

| 文件 | 节点/章节 ID | 标题 | layers | 模型方式 |
|------|-------------|------|--------|----------|
| `externalWall.js` | ext-wall-01 | 外墙外保温系统 | 5 层 | 程序化 Box |
| `flatRoof.js` | flat-roof-01 | 平屋面构造 | 6 层 | 每层独立 GLB |
| `membraneRoof.js` | membrane-roof-01 | 卷材防水屋面 | 6 层 | 共享 GLB + layerObjectName |
| `roofInsulation.js` | roof-insulation-01 | 卷材平面屋顶保温构造 | 9 层 | 共享 GLB + layerObjectName |
| `roofSections.js` | — | 屋顶章节索引 | — | — |
| `courseModules.js` | — | 课程模块定义 | — | 8 个模块 (2 个 available) |
| `sections/wallSections.js` | — | 墙体章节 | — | 5 个章节 (1 个 available) |
| `sections/roofSections.js` | — | 屋顶章节（动态） | — | 2 个章节 (均 available) |
| `sections/*.js` | — | 其他模块章节 | — | 均不可用 (available: false) |

**已实现课程模块**: 墙体 (wall)、屋顶 (roof)、楼梯 (stairs)  
**可用节点**: ext-wall-01, flat-roof-01, membrane-roof-01, roof-insulation-01

---

## 8. 已知约定

### 8.1 爆炸轴命名

- **x 轴**: 墙体类（沿水平方向展开）
- **y 轴**: 屋顶类（沿垂直方向展开）
- 支持负方向: `"-x"`, `"-y"` 开头表示反向爆炸

### 8.2 浮动方向 (floatDirection)

- 墙体: `"y"` — 选中层垂直浮起
- 屋顶: `"z"` — 选中层水平突出
- 浮动距离: `floatDistance` (通常 0.14 ~ 0.22)

### 8.3 模型路径与命名

- GLB 文件放在 `public/models/{nodeId}/` 目录下
- 独立层模型命名: `layer_{NN}_{name}.glb` (如 `layer_01_protection.glb`)
- 共享模型命名: `{nodeId}.glb` 或描述性名称
- 层内物体命名: `"01"`, `"02"`, ... 从下到上/从内到外编号

### 8.4 Markdown 标记语法

| 语法 | 用途 | 示例 |
|------|------|------|
| `[model: nodeId]` | 嵌入模型卡片 | `[model: membrane-roof-01]` |
| `[side-by-side]...[/side-by-side]` | 并排布局 | 内含图片和 [model:] 标记 |
| GFM 表格 | 材料/厚度表格 | `remarkGfm` 插件渲染 |

### 8.5 样式约定

- gold-500 (`#D4A43A`) 为主强调色
- 毛玻璃效果: `bg-white/70 backdrop-blur-md`
- 圆角: `rounded-2xl` (卡片), `rounded-full` (按钮)
- 字体: `Inter` + `Noto Sans SC` + 系统回退

### 8.6 笔记系统

- 存储在 localStorage key `"construction_notes"`
- 最大 30 条，超量自动删除最旧记录
- 每条笔记: `{ id, nodeId, nodeTitle, image (dataURL), text, createdAt }`

---

## 9. 未来规划

从代码中的占位和注释提取：

| 内容 | 位置 | 状态 |
|------|------|------|
| GitHub 项目地址 | HomePage.jsx:293 | 待添加 |
| 管理后台 | /admin (PlaceholderPage) | 占位 |
| 贡献节点 | /contribute (PlaceholderPage) | 占位 |
| 构造工具 | /tools (PlaceholderPage) | 占位 |
| 任务布置功能 | ClassDetailPage.jsx:96 | "即将上线" |
| 绪论模块 | courseModules.js | available: false |
| 构筑物模块 | courseModules.js | available: false |
| 地基与基础模块 | courseModules.js | available: false |
| 楼底层模块 | courseModules.js | available: false |
| 门窗模块 | courseModules.js | available: false |
| 屋顶子章节 5/8 | roofSections.js | available: false |
| 墙体子章节 4/5 | wallSections.js | available: false |
| 学生进度追踪 | student_progress 表已建 | 前端未接入 |
| 任务分配与提交 | assignments 表已建 | 前端未接入 |
| 屋顶子章节（旧路由） | RoofSubPage.jsx | 可能废弃，已被 SectionSubPage 替代 |
