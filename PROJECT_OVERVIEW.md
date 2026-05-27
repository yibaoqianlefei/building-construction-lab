# PROJECT_OVERVIEW — 建筑构造交互系统

> 生成日期: 2026-05-23 | 版本: 1.0.0 | 更新: 2026-05-27 知识卡片系统重构

---

## 1. 项目简介

**项目名称**: 建筑构造交互系统 (Building Construction Interactive Textbook)

**目的**: 面向建筑学教育的开源数字交互教材。通过三维可视化、分解视图和交互式探索，帮助学生和从业者直观理解建筑构造层次的空间逻辑。

**目标用户**: 建筑学专业学生、建筑行业从业者、高校教师（可通过班级系统管理学生）。

---

## 2. 技术栈

| 类别 | 技术 | 用途 |
|------|------|------|
| 前端框架 | React 19 + React Router DOM v7 (`createBrowserRouter`) | 组件化 UI 与路由 |
| 构建工具 | Vite 8 | 开发服务器与生产构建 |
| 3D 渲染 | Three.js v0.184 + `@react-three/fiber` + `@react-three/drei` | 3D 模型加载、场景渲染、交互控制 |
| 样式方案 | Tailwind CSS 4 + `@tailwindcss/vite` | 原子化样式，自定义 rose-* 色板 |
| 字体 | Noto Serif SC (Google Fonts) | 中文字体 |
| 动画 | Framer Motion v12 | 页面过渡、弹性动画 |
| 状态管理 | React Context (AuthContext) + Custom Hooks | 认证全局共享 + 页面状态封装 |
| 后端/数据库 | Supabase (PostgreSQL) | 用户认证、数据库、RLS 行级安全 |
| Markdown 渲染 | `react-markdown` + `remark-gfm` | 教材内容渲染 |
| 拖拽交互 | `@dnd-kit/core` | 2D 拼装游戏拖拽 |
| 图标 | Lucide React + React Icons | UI 图标 |
| 语言 | TypeScript + JavaScript (JSX/TSX, 渐进迁移中) | 全项目 |

---

## 3. 文件结构

```
02-2/
├── index.html                     # 入口 HTML，加载 Noto Serif SC 字体
├── package.json                   # 依赖与脚本
├── tsconfig.json                  # TypeScript 配置（strict, ES2020, bundler）
├── PROJECT_OVERVIEW.md            # 本文件
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
    ├── main.jsx                   # React 入口：AuthProvider + RouterProvider
    ├── routes.jsx                 # 路由配置（createBrowserRouter 数组）
    ├── App.jsx                    # 向后兼容 re-export（路由已迁移至 routes.jsx）
    ├── NodeDetail.jsx             # 核心页面：异步数据加载 + 自定义 Hooks
    ├── index.css                  # Tailwind 入口 + rose 色板定义
    │
    ├── types/                     # TypeScript 类型定义
    │   └── index.ts               # 核心类型：NodeData, LayerData, UserProfile, Note 等
    │
    ├── hooks/                     # 自定义 Hooks（页面状态封装）
    │   ├── useModelInteraction.ts # 3D 模型交互状态（explode/hover/select/screenshot）
    │   └── usePanelState.ts       # 面板模式（knowledge/practice/textbook）
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
    │   │   ├── MenuBackground.jsx # 主菜单 3D 背景（GLB + OrbitControls + autoRotate + 场景切换 + 加载回调）
    │   │   ├── LoadingOverlay.jsx # 加载动画覆盖层（Framer Motion 构造层堆叠动画）
    │   │   ├── BottomControlBar.jsx   # 底部控制栏：爆炸滑块/旋转/截图/面板
    │   │   ├── ConstructionKnowledgePanel.jsx  # 右侧知识卡面板
    │   │   ├── LeftKnowledgePanel.jsx  # 左滑出全部构件面板
    │   │   ├── ScreenshotTool.jsx # 框选截图工具（保存到笔记）
    │   │   ├── ExplodeControls.jsx    # 爆炸控制（独立组件）
    │   │   └── ExplosionLabels.jsx # 爆炸标注（引导线+极简 pill 标签）
    │   └── game/                  # 游戏组件
    │       ├── AssemblyLine.jsx   # 2D 拼装目标区（useDroppable 槽位）
    │       ├── LayerCard.jsx      # 可拖拽构件卡片（useDraggable + 颜色条 + 名称）
    │       └── GameInfoPanel.jsx  # 游戏信息面板（进度条/错误计数/选中提示）
    ├── pages/                     # 页面组件
    │   ├── HomePage.jsx           # 首页：侧边菜单 + 3D 背景
    │   ├── AuthPage.jsx           # 登录/注册页
    │   ├── LibraryPage.jsx        # 节点库：按分类展示所有构造节点
    │   ├── CurriculumPage.jsx     # 课程目录：课程模块网格 → 章节列表
    │   ├── SectionSubPage.jsx     # 章节子页面：动态加载章节数据
    │   ├── TextbookPage.jsx       # 教材阅读页：Markdown + [model]/[side-by-side] 标记
    │   ├── NotesPage.jsx          # 笔记管理：截图查看/备注/对比
    │   ├── GamesPage.jsx          # 游戏页：拖拽拼装构件（@dnd-kit）
    │   ├── ClassesPage.jsx        # 班级列表：创建/加入班级
    │   ├── ClassDetailPage.jsx    # 班级详情：课程/任务/成员标签
    │   └── PlaceholderPage.jsx    # 占位页：/tools /contribute /admin
    │
    ├── data/                      # 数据层
    │   ├── backgroundScenes.js    # 主菜单背景场景列表（GLB路径 + position配置）
    │   ├── nodesIndex.ts          # 节点统一入口：NodeIndexEntry[] + nodeLoaders + getNodeData
    │   ├── courseModules.js       # 课程模块定义（绪论/墙体/屋顶/...）
    │   ├── externalWall.ts        # 外墙外保温节点数据（5层，程序化Box + 类型标注）
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
        ├── classService.js        # 班级 CRUD（Supabase 操作）
        └── noteService.js         # 笔记 CRUD（localStorage 操作）
```

### 2026-05-27 知识卡片系统重构

| 变更类型 | 文件 | 说明 |
|----------|------|------|
| **重写** | `ConstructionKnowledgePanel.jsx` | 确立为唯一知识展示区，手风琴卡片，双向联动 activeLayer |
| **简化** | `ExplosionLabels.jsx` | 仅保留引导线+极简 pill 标签，点击仅更新 activeLayer，不弹出详情 |
| **删除** | `LayerLabel.jsx` | 浮层卡片被右侧面板替代 |
| **删除** | `LeftKnowledgePanel.jsx` | 左侧滑出面板被右侧面板替代 |
| **清理** | `useModelInteraction.ts` | 移除 activeCard 相关状态和逻辑 |
| **清理** | `usePanelState.ts` | 移除 showLeftPanel 相关状态 |
| **简化** | `BottomControlBar.jsx` | 移除 PanelLeftOpen 和 Tags 按钮 |
| **重构** | `NodeDetail.jsx` | 移除 LayerLabel/LeftKnowledgePanel 渲染，统一 activeLayer 状态 |
| **清理** | `types/index.ts` | 移除 ActiveCard、ModelInteractionState 类型 |

### TypeScript 迁移（早期变更）

| 变更类型 | 文件 | 说明 |
|----------|------|------|
| **TypeScript 迁移** | `src/data/externalWall.ts` | JS → TS，添加 `NodeData` 类型标注 |
| **TypeScript 迁移** | `src/data/nodesIndex.ts` | JS → TS，添加 `NodeIndexEntry`/`NodeLoader` 类型 |
| **TypeScript 迁移** | `src/hooks/useModelInteraction.ts` | JS → TS，添加返回值类型 |
| **TypeScript 迁移** | `src/hooks/usePanelState.ts` | JS → TS，添加返回值类型 |
| **新建** | `src/types/index.ts` | 集中类型定义：NodeData, LayerData, Note, UserProfile, GameState 等 |
| **新建** | `tsconfig.json` | TypeScript 配置：strict, ES2020, bundler module resolution |
| **新建** | `npm run typecheck` | `tsc --noEmit` 类型检查脚本 |
| **重构** | `ExplosionLabels.jsx` | 合并 LabelDetailCard 功能，标签和详情卡片统一管理 |
| **删除** | `LabelDetailCard.jsx` | 功能合并至 ExplosionLabels |
| **重新引入** | `@dnd-kit/core` | 拖拽库恢复使用，2D 拼装游戏改为拖拽式交互 |

### 历史变更（2026-05 系列重构）

| 变更类型 | 文件 | 说明 |
|----------|------|------|
| **新建** | `src/routes.jsx` | 所有路由以 `createBrowserRouter` 数组集中定义 |
| **新建** | `src/components/game/GameInfoPanel.jsx` | 游戏信息面板（进度条/错误计数/选中提示/层列表） |
| **新建** | `src/pages/GamesPage.jsx` | 游戏页面：顶部节点选择器 + 左右分栏（3D 场景 + 信息面板） |
| **重写** | `src/data/nodesIndex.js` | 移除静态 import，改为 `nodeLoaders` 动态加载 + `getNodeData` 异步 |
| **重写** | `src/main.jsx` | `<BrowserRouter>` + `<App />` → `<AuthProvider>` + `<RouterProvider>` |
| **改写** | `src/App.jsx` | 路由定义移除，仅保留 re-export |
| **改写** | `src/NodeDetail.jsx` | 异步数据加载 + 改用 `useModelInteraction` / `usePanelState` hooks |
| **删除** | `src/services/nodeService.js` | 功能合并至 `nodesIndex.js` |
| **删除** | `src/pages/RoofSubPage.jsx` | 无路由引用，已被 `SectionSubPage` 替代 |

---

## 4. 功能清单

| 功能 | 路由 | 核心组件 | 数据来源 |
|------|------|----------|----------|
| **首页**（3D 背景 + 菜单 + 场景切换） | `/` | HomePage, MenuBackground | backgroundScenes.js (GLB模型列表) |
| **用户认证**（登录/注册） | `/auth` | AuthPage | Supabase Auth + profiles 表 |
| **节点库**（分类浏览） | `/library` | LibraryPage | nodesIndex.ts (元数据数组) |
| **课程目录**（模块选择） | `/curriculum` | CurriculumPage | courseModules.js |
| **章节浏览**（模块子章节） | `/curriculum/:moduleId` | SectionSubPage | sections/*.js (动态import) |
| **教材阅读**（含交互模型引用） | `/textbook/:sectionId` | TextbookPage | public/textbook/*/content.md |
| **3D 模型查看器**（核心） | `/node/:nodeId` | NodeDetail, ModelViewer, ConstructionLayer | nodesIndex.getNodeData() 异步加载 |
| **图层爆炸/分解** | `/node/:nodeId` | BottomControlBar (滑块 0-100) | useModelInteraction hook |
| **爆炸标注**（引导线+pill 标签） | `/node/:nodeId` | ExplosionLabels | 爆炸时显示引导线和极简 pill 标签，点击更新 activeLayer |
| **图层高亮/选中** | `/node/:nodeId` | ConstructionLayer (hover/select) | useModelInteraction hook |
| **知识卡片**（右侧面板） | `/node/:nodeId` | ConstructionKnowledgePanel | 唯一知识展示区，手风琴卡片双向联动 activeLayer |
| **框选截图**（保存笔记） | `/node/:nodeId` | ScreenshotTool | Canvas → dataURL |
| **笔记管理**（查看/备注/对比/删除） | `/notes` | NotesPage | localStorage (max 30条) |
| **班级管理**（创建/加入） | `/classes` | ClassesPage | classService → Supabase |
| **2D 拖拽拼装游戏**（拖拽构件卡片至槽位 + 验证） | `/games` | GamesPage, AssemblyLine, LayerCard, GameInfoPanel | nodesIndex.getNodeData() |
| **班级详情**（课程/任务/成员） | `/classes/:classId` | ClassDetailPage | classService → Supabase |
| **教师后台**（占位） | `/admin` | PlaceholderPage | — |
| **贡献节点**（占位） | `/contribute` | PlaceholderPage | — |
| **构造工具**（占位） | `/tools` | PlaceholderPage | — |

---

## 5. 数据流说明

### 5.1 节点数据加载

```
路由 /node/:nodeId
  → NodeDetail.jsx: useEffect → getNodeData(nodeId)
    → nodesIndex.ts: nodeLoaders[id] → import() 动态加载节点 JS/TS 文件
    → module.default 返回 NodeData 对象 (title, layers[], explodeAxis, ...)
  → 设置 data state（异步，含 loading 状态）
  → ModelViewer: 接收 layers[] 数组
    → WallAssembly: 计算初始位置（层厚累加偏移 / 模型层全为0）
      → ConstructionLayer × N: 每层渲染
        → 有 modelPath + layerObjectName → useGLTF(modelPath) → scene.getObjectByName(name) → clone
        → 有 modelPath 无 layerObjectName → useGLTF(modelPath) → clone 整个 scene
        → 无 modelPath → 程序化 Box (boxGeometry + Edges)
```

**关键点**:
- `getNodeData(id)` 是唯一的节点数据加载入口，NodeDetail 等页面统一使用
- WallAssembly 通过 `layers[0]?.layerObjectName != null` 判断是否使用模型内建坐标（全部置 0，依赖 GLB 内部坐标）还是程序化位置（按 thickness 累加偏移）
- `nodesIndex` 元数据数组供 LibraryPage/CurriculumPage/TextbookPage 等展示列表使用，不经过动态 import

### 5.2 用户认证流程

```
main.jsx: <AuthProvider> 包裹 <RouterProvider>
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

**注意**: 重构后 `AuthProvider` 已从 `App.jsx` 内部移至 `main.jsx`，包裹在 `RouterProvider` 之外，使认证状态在路由器实例外部可用。

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
  profiles        — 用户资料 (role: teacher/student)
  classes         — 班级 (join_code, teacher_id)
  class_members   — 班级成员关系
  assignments     — 任务 (node_ids JSONB)
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

### 5.5 2D 拖拽拼装游戏（@dnd-kit + 手动验证）

```
GamesPage (DndContext + DragOverlay)
  → 状态: slotOccupants (Map<slotIndex,layerIndex>) + verifiedSlots (Map<slotIndex,boolean>)
  → 上方 AssemblyLine: 每个槽位 — 空标记 (useDroppable) 或 已放置卡片 (useDraggable variant="slot")
  → 下方 ReturnZone (useDroppable id="return-zone"): 未放置卡片的拖拽回退区
  → 右侧 GameInfoPanel: 进度条、错误计数、选中提示、层列表
  → 拖拽规则:
    - 下方卡片 → 空槽位: 放入，卡片从下方消失
    - 下方卡片 → 已占槽位: 新卡片放入，旧卡片自动回下方
    - 槽位卡片 → 空槽位: 移动卡片
    - 槽位卡片 → 已占槽位: 交换
    - 槽位卡片 → ReturnZone: 卡片回下方，槽位清空
  → 验证按钮: 所有槽位填满后可点击
    - 检查 slotOccupants.get(i) === i → 正确(绿) / 错误(红)
    - 全部正确 → 庆祝弹窗；有误 → 可调整后重新验证
  → 全部重来: 清空所有槽位，重新打乱卡片顺序
```

### 5.6 路由架构

```
  <AuthProvider>                        ← 认证上下文（路由器外部）
    <RouterProvider router={router} />  ← router 对象（来自 routes.jsx）

routes.jsx — createBrowserRouter([
  {
    element: <AppLayout />,             ← 全局导航栏 + <Outlet />
    children: [
      public routes:    / /auth /library /curriculum /node/:nodeId ...
      protected routes: /classes /classes/:classId (ProtectedRoute 包裹)
    ]
  }
])
```

---

## 6. 关键设计模式

### 6.1 数据驱动

所有构造节点均为 JS/TS 对象定义（`src/data/*.js` / `src/data/*.ts`），包含 `id`, `title`, `layers[]`。ModelViewer、ConstructionKnowledgePanel、LeftKnowledgePanel 等组件完全由 `layers[]` 驱动，新增节点只需添加数据文件和索引注册即可。

**新增节点流程**（2 步）:
1. `nodesIndex.ts` → `nodesIndex` 数组加一条 `NodeIndexEntry`
2. `nodesIndex.ts` → `nodeLoaders` 映射加一行 `import()`

### 6.2 组件复用

- **ConstructionLayer**: 自动检测是否有 modelPath，有则走 GLB 渲染路径，无则走程序化 Box 路径。同时处理 hover/select/dim 三种视觉状态（emissive glow/opacity 变化）。
- **KnowledgePanel** ×2: 右侧 ConstructionKnowledgePanel（可折叠卡片）+ 左侧 LeftKnowledgePanel（滑出面板），共享同一 layers 数据。
- **ExplosionLabels**: 合并了原 LabelDetailCard 功能，在爆炸标注标签内直接集成详情卡片弹出逻辑，减少组件层级。

### 6.3 动态加载（代码分割）

- **节点数据**: `nodesIndex.ts` 的 `nodeLoaders[id]()` 通过 `import()` 动态加载节点数据文件，避免首屏加载所有大型数据。`getNodeData` 统一入口，替代了旧的 `nodeService.js`。
- **章节数据**: `SectionSubPage.jsx` 根据 moduleId 动态 `import()` 对应 sections 数据。
- **教材内容**: `TextbookPage` 通过 `fetch()` 从 `/public/textbook/` 动态加载 Markdown 文件。

### 6.4 自定义 Hooks 模式（已迁移至 TypeScript）

重构后，NodeDetail 的核心状态被抽取为两个自定义 Hooks（已迁移至 `.ts`）：

- **`useModelInteraction.ts`**: 管理 3D 模型交互状态
  - `explodeValue` / `autoRotate` / `hoveredLayer` / `selectedLayer`
  - `screenshotMode`
  - 处理函数: `handleLayerClick`, `handlePanelSelect`, `handleBlankClick`
  - 自动清除: `explodeValue === 0` 时重置选中状态

- **`usePanelState.ts`**: 管理面板模式
  - `knowledgePanelExpanded` / `panelMode`
  - `panelMode` 预留 "knowledge" / "practice" / "textbook" 三态切换

NodeDetail.jsx 本身仅保留组件组合、异步数据加载、截图笔记保存等顶层逻辑。

### 6.5 两种模型加载模式

1. **独立 GLB 模式** (flat-roof-01): 每层一个独立 GLB 文件，`modelPath` 直接指向文件，不需要 `layerObjectName`。
2. **共享 GLB 模式** (membrane-roof-01, roof-insulation-01): 所有层共用一个 GLB 文件，每层通过 `layerObjectName` (如 "01"~"09") 从场景中提取子物体并克隆渲染。`useGLTF` 内置缓存保证同一文件只加载一次。

### 6.6 路由集中管理

所有路由在 `src/routes.jsx` 中以 `createBrowserRouter` 数组形式集中定义。AuthProvider 提升至 `main.jsx` 包裹 RouterProvider，确保认证状态在路由匹配前可用。`<AppLayout>` 作为根路由元素，通过 `<Outlet>` 渲染子路由。

### 6.7 TypeScript 类型系统

`src/types/index.ts` 定义所有核心类型，渐进式迁移中：

- **数据模型**: `NodeData`, `LayerData`, `CourseModule`, `SectionData`
- **运行时实体**: `Note`, `UserProfile`, `ClassData`, `BackgroundScene`
- **交互状态**: `ActiveCard`, `ModelInteractionState`, `PanelState`, `GameState`

已迁移至 TypeScript 的文件通过 `import type` 引用类型，编译由 `tsc --noEmit` 检查。配置文件 `tsconfig.json` 启用 strict 模式，`allowJs: true` 兼容现有 JSX 文件。

---

## 7. 当前数据文件索引

| 文件 | 节点/章节 ID | 标题 | layers | 模型方式 | 语言 |
|------|-------------|------|--------|----------|------|
| `externalWall.ts` | ext-wall-01 | 外墙外保温系统 | 5 层 | 程序化 Box | TypeScript |
| `flatRoof.js` | flat-roof-01 | 平屋面构造 | 6 层 | 每层独立 GLB | JavaScript |
| `membraneRoof.js` | membrane-roof-01 | 卷材防水屋面 | 6 层 | 共享 GLB + layerObjectName | JavaScript |
| `roofInsulation.js` | roof-insulation-01 | 卷材平面屋顶保温构造 | 9 层 | 共享 GLB + layerObjectName | JavaScript |
| `backgroundScenes.js` | — | **背景场景列表** | — | GLB路径 + position 配置 | JavaScript |
| `nodesIndex.ts` | — | **节点统一入口** | — | `nodeLoaders` 映射 + 元数据数组 | TypeScript |
| `roofSections.js` | — | 屋顶章节索引 | — | — | JavaScript |
| `courseModules.js` | — | 课程模块定义 | — | 8 个模块 (2 个 available) | JavaScript |
| `sections/wallSections.js` | — | 墙体章节 | — | 5 个章节 (1 个 available) | JavaScript |
| `sections/roofSections.js` | — | 屋顶章节（动态） | — | 2 个章节 (均 available) | JavaScript |
| `sections/*.js` | — | 其他模块章节 | — | 均不可用 (available: false) | JavaScript |

**已实现课程模块**: 墙体 (wall)、屋顶 (roof)、楼梯 (stairs)
**可用节点**: ext-wall-01, flat-roof-01, membrane-roof-01, roof-insulation-04

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

- rose-500 (`#ff3d58`) 为主强调色
- 毛玻璃效果: `bg-white/70 backdrop-blur-md`
- 圆角: `rounded-2xl` (卡片), `rounded-full` (按钮)
- 字体: Noto Serif SC + 系统回退

### 8.6 笔记系统

- 存储在 localStorage key `"construction_notes"`
- 最大 30 条，超量自动删除最旧记录
- 每条笔记: `{ id, nodeId, nodeTitle, image (dataURL), text, createdAt }`
- 类型定义见 `src/types/index.ts` → `Note` interface

### 8.7 Hooks 拆分约定

- NodeDetail 的状态逻辑封装在 `src/hooks/` 目录下的独立 `.ts` 文件中
- `useModelInteraction` 管理所有 3D 模型交互状态，不涉及 UI 面板
- `usePanelState` 管理所有面板/标签 UI 状态
- Hooks 返回原始值和方法，由页面组件自行传递给子组件

### 8.8 新增节点流程

在 `src/data/nodesIndex.ts` 中：
1. `nodesIndex` 数组加一条 `NodeIndexEntry` 元数据 `{ id, title, description, category, thumbnail }`
2. `nodeLoaders` 映射加一行 `"my-node": () => import("./myNode")`

无需修改其他任何文件。

### 8.9 TypeScript 约定（渐进迁移）

- `tsconfig.json` 配置 `allowJs: true`，兼容现有 JSX 文件
- `skitLibCheck: true` 跳过库类型检查
- 新文件优先使用 `.ts` / `.tsx`
- 类型定义集中在 `src/types/index.ts`
- 通过 `npm run typecheck` 进行类型检查

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
| panelMode 练习/教材标签 | usePanelState.ts | 状态已预留，UI 未接入 |
| 绪论模块 | courseModules.js | available: false |
| 构筑物模块 | courseModules.js | available: false |
| 地基与基础模块 | courseModules.js | available: false |
| 楼底层模块 | courseModules.js | available: false |
| 门窗模块 | courseModules.js | available: false |
| 屋顶子章节 5/8 | roofSections.js | available: false |
| 墙体子章节 4/5 | wallSections.js | available: false |
| 学生进度追踪 | student_progress 表已建 | 前端未接入 |
| 任务分配与提交 | assignments 表已建 | 前端未接入 |
| TypeScript 全量迁移 | src/ 全部 .jsx → .tsx | 进行中（4 文件已迁移） |
