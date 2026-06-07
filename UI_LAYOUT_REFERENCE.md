# UI 布局与功能参考

## 项目页面总览

| 页面 | 路由 | 布局 | 核心文件 |
|------|------|------|----------|
| 首页 | `/` | 左菜单 + 中 3D 背景 + 右 AI 面板（可隐藏） | [HomePage.jsx](src/pages/HomePage.jsx) |
| 节点详情 | `/node/:nodeId` | 左剖面图 + 中 3D 视口 + 右知识面板 + AI 面板 | [NodeDetail.tsx](src/NodeDetail.tsx) |
| 课程目录 | `/curriculum` | 网格卡片 | [CurriculumPage.jsx](src/pages/CurriculumPage.jsx) |
| 节点库 | `/library` | 分类卡片列表 | [LibraryPage.jsx](src/pages/LibraryPage.jsx) |
| 章节浏览 | `/curriculum/:moduleId` | 章节列表 | [SectionSubPage.jsx](src/pages/SectionSubPage.jsx) |
| 教材阅读 | `/textbook/:sectionId` | Markdown 内容 | [TextbookPage.jsx](src/pages/TextbookPage.jsx) |
| 构建工坊 | `/games` | 拖拽拼装 | [GamesPage.jsx](src/pages/GamesPage.jsx) |
| 笔记 | `/notes` | 卡片列表 | [NotesPage.jsx](src/pages/NotesPage.jsx) |
| 管理后台 | `/admin` | 编辑面板 | [AdminContentPage.tsx](src/pages/AdminContentPage.tsx) |
| 登录 | `/auth` | 表单 | [AuthPage.jsx](src/pages/AuthPage.jsx) |

---

## 一、首页（`/`）— [HomePage.jsx](src/pages/HomePage.jsx)

### 布局结构

```
┌────────────────────┬──────────────────────────┬──────────────┐
│   左侧菜单 (aside)   │    3D 背景视口 (div)       │  AI 面板      │
│   w-96 (384px)     │    flex-1                │  w-80 (320px) │
│   flex-shrink-0    │    relative              │  可隐藏        │
│                    │                          │              │
│   [标题]           │   <Canvas>               │              │
│   建筑构造          │    MenuBackground        │              │
│   ─────            │                          │              │
│   [菜单项]         │   [右下角控件]            │              │
│   课程目录          │   场景切换 🔄            │              │
│   节点库            │   自动旋转 ⏯            │              │
│   构建工坊          │                          │              │
│   ─────            │   [💬 AI浮动按钮]         │              │
│   [用户区]         │   fixed bottom-6 right-6 │              │
│   我的笔记          │                          │              │
│   管理后台(dev)     │                          │              │
│   贡献节点          │                          │              │
│   关于项目          │                          │              │
│   ─────            │                          │              │
│   切换账号          │                          │              │
│   退出登录          │                          │              │
└────────────────────┴──────────────────────────┴──────────────┘
```

### 左侧菜单组件树

```
HomePage
├── <aside w-96>                           # 左侧固定宽度面板
│   └── MenuContent                        # 菜单内容组件
│       ├── <h1> 建筑构造                   # 照排字体标题 (font-serif text-3xl)
│       ├── <div w-12 h-0.5>               # 装饰线 (bg-primary)
│       │
│       ├── group 1: 学习探索
│       │   ├── MenuItem: 课程目录 → /curriculum     icon: BookOpen
│       │   ├── MenuItem: 节点库   → /library        icon: Layers
│       │   └── MenuItem: 构建工坊 → /games          icon: Hammer
│       │   <divider />
│       │
│       ├── group 2: 个人中心
│       │   ├── 用户头像 + 名称 + 角色                  (avatar circle)
│       │   ├── MenuItem: 我的笔记 → /notes          icon: StickyNote
│       │   └── [未登录] MenuItem: 登录/注册 → /auth  icon: LogIn
│       │   <divider />
│       │
│       ├── group 3: 项目与社区
│       │   ├── [dev] MenuItem: 管理后台 → /admin     icon: Settings
│       │   ├── MenuItem: 贡献节点 → /contribute      icon: GitPullRequest
│       │   └── MenuItem: 关于项目 → AboutModal       icon: Info
│       │   <divider />
│       │
│       └── bottom: 账号操作
│           ├── 切换账号 button                       icon: SwitchCamera
│           └── 退出登录 button                       icon: LogOut
└── AboutModal                              # 关于项目弹窗
```

### MenuItem 组件（[HomePage.jsx:69](src/pages/HomePage.jsx#L69)）

```
属性:
  item.icon    — Lucide 图标组件
  item.label   — 中文标签文字
  item.to      — React Router 路径（可选，有则用 Link，无则用 button）
  onClick      — 点击回调（可选，to 和 onClick 互斥）

样式:
  基础: w-full flex gap-3.5 px-5 py-3 rounded-lg
        border-l-4 border-transparent
  hover: bg-surface-card, border-l-primary, -translate-y-0.5
  图标: text-muted-soft, group-hover:text-primary
  文字: text-base font-medium text-muted, group-hover:text-ink

特殊:
  "切换账号" → signOut() + navigate("/auth")
  "退出登录" → 图标变红 (hover:text-error)
```

### 3D 背景区域

```
<div flex-1 relative>
  <Canvas camera={{ fov: 40, position: [0, 0.5, 4.0] }}>
    <MenuBackground
      key={sceneIndex}             # 切换场景时强制重挂载
      modelPath={currentScene}     # 来自 backgroundScenes.js
      autoRotate={autoRotate}      # 受底部按钮控制
      position={currentScene.position}
    />
  </Canvas>
  <LoadingOverlay isLoading={bgLoading} />   # 场景切换时显示

  右下角控件 (absolute bottom-4 right-4):
    [🔄] 场景切换 — sceneIndex + 1
    [⏯] 自动旋转 — autoRotate toggle
</div>
```

### AI 对话面板

```
AnimatePresence
├── 关闭时: <button fixed bottom-6 right-6> 💬 浮动按钮
│   onClick → setChatOpen(true)
│
└── 打开时: <motion.aside>
    initial: width: 0, opacity: 0
    animate: width: 320, opacity: 1
    exit:    width: 0, opacity: 0
    
    └── AiChatBox (embedded 模式)
        ├── 头部: "AI 助手" + X 关闭按钮
        ├── 消息列表 (flex-1 overflow-y)
        └── 输入框 + 发送按钮
```

### 状态管理

| 状态 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modalOpen` | boolean | false | 关于弹窗 |
| `autoRotate` | boolean | true | 背景模型自动旋转 |
| `sceneIndex` | number | 0 | 当前背景场景索引 |
| `bgLoading` | boolean | true | 背景模型加载中 |
| `chatOpen` | boolean | false | AI 面板开/关 |

---

## 二、节点详情页（`/node/:nodeId`）— [NodeDetail.tsx](src/NodeDetail.tsx)

### 布局结构

```
┌───────────────────────┐
│ 面包屑: 节点库 › 节点名  │  px-6 py-2.5, bg-white, border-b
├─────────┬─────────────┬──────────────┬──────────────┐
│ 剖面图   │  3D 视口     │  知识面板      │  AI 面板      │
│ flex-[2]│  flex-[3]   │  w-[360px]   │  可隐藏        │
│ hidden  │             │  lg:w-[360px]│              │
│ lg:flex │             │  移动端全宽下方 │              │
│         │             │              │              │
│         │ [右上角]      │  标题+描述     │              │
│         │ ViewGizmo    │  ──────      │              │
│         │ (6方向+复位)  │  知识卡片列表   │              │
│         │             │  手风琴展开     │              │
│         │ [底部]       │              │              │
│         │ BottomCtrlBar│              │              │
│         │ [空间卡片]    │              │              │
│         │ SpatialLabel │              │              │
└─────────┴─────────────┴──────────────┴──────────────┘
```

### 左侧剖面图面板

```
<aside flex-[2] hidden lg:flex>
  有 diagramImage → <ZoomableImage>  可缩放/拖拽/双击重置
  无 diagramImage → 占位 "剖面图 / 即将上线"
  有 hotspots     → 可点击热区跳转到对应图层
</aside>
```

### 中央 3D 视口

```
<div flex-[3] relative>
  ┌─────────────────────────────────┐
  │  ModelErrorBoundary             │
  │  ┌───────────────────────────┐  │
  │  │  <Canvas>                 │  │
  │  │    Scene                  │  │
  │  │    ├── CameraSwitcher     │  │
  │  │    ├── SpatialLabel       │  │
  │  │    ├── WallAssembly       │  │
  │  │    │   └── ConstructionLayer × N  │
  │  │    ├── ExplosionLabels    │  │
  │  │    ├── Grid               │  │
  │  │    └── CameraAdjuster     │  │
  │  │       └── OrbitControls   │  │
  │  └───────────────────────────┘  │
  │  ┌───────────────────────────┐  │
  │  │  ViewGizmo (absolute tr)  │  │
  │  │  BottomControlBar (abs b) │  │
  │  └───────────────────────────┘  │
  └─────────────────────────────────┘
</div>
```

### 右上角 ViewGizmo（[ViewGizmo.tsx](src/components/viewer/ViewGizmo.tsx)）

```
十字布局（3行 × 最宽4列）

     [俯]                      ← Y+ 俯视图
[左] [前] [右] [后]             ← 四向立面
[仰]     [⟳]                   ← 仰视 + 透视复位

活跃按钮: bg-hairline text-primary scale-110
默认按钮: text-muted-soft hover:text-body hover:bg-surface-soft
```

### 底部控制栏（[BottomControlBar.tsx](src/components/viewer/BottomControlBar.tsx)）

```
┌───────────────────────────────────────────────────────┐
│ [◀◀] [━━━━━滑块━━━━━] [▶▶] | [🔄] [🏷] | [⋮] |
│  复原                   分解   | 旋转 标签 | 更多 |
│                                                      |
│ ⋮ 更多菜单 (弹出):                                     │
│   [📷截图] [🔗同步缩放] [📐正交/透视]                   |
└───────────────────────────────────────────────────────┘

Props:
  explodeValue, onExplodeChange, onExplodeReset, onExplodeMax
  autoRotate, onAutoRotateToggle
  screenshotActive, onScreenshotToggle
  showLabels, onLabelsToggle
  syncZoom, onSyncZoomToggle
  isOrthographic, onOrthographicToggle
  explodeAxis (null → 隐藏爆炸控件)
```

### 右侧知识面板（[ConstructionKnowledgePanel.jsx](src/components/viewer/ConstructionKnowledgePanel.jsx)）

```
<aside w-full lg:w-[360px] flex-shrink-0>
  ┌────────────────────┐
  │ 节点标题 + 描述      │  bg-white/80 rounded-2xl p-4
  ├────────────────────┤
  │ 知识卡片 1          │  手风琴展开
  │  ┌──────────────┐  │
  │  │ 名称 + 厚度   │  │  activeLayer 联动
  │  │ 材料 + 描述   │  │
  │  └──────────────┘  │
  │ 知识卡片 2          │
  │ ...                │
  │ 知识卡片 N          │
  └────────────────────┘
</aside>
```

### AI 对话面板

```
AiChatBox (embedded 模式 — 用于首页)
  由父组件 AnimatePresence + motion.aside 控制滑入/滑出

AiChatBox (standalone 模式 — 用于节点详情)
  自身包含 AnimatePresence 动画 + 浮动 💬 按钮
  点击构件后自动附加上下文 (layer.name/material/description)
```

### 状态管理

| 状态 | 来源 | 默认 | 说明 |
|------|------|------|------|
| `isOrthographic` | useModelInteraction | true | 正交/透视 |
| `autoRotate` | useModelInteraction | false | 自动旋转 |
| `explodeValue` | useModelInteraction | 0 | 爆炸程度 |
| `selectedLayer` | useModelInteraction | null | 选中图层索引 |
| `hoveredLayer` | useModelInteraction | null | 悬停图层索引 |
| `screenshotMode` | useModelInteraction | false | 截图模式 |
| `showLabels` | NodeDetail local | true | 显示爆炸标注 |
| `syncZoom` | NodeDetail local | false | 剖面图缩放联动 |
| `viewTarget` | NodeDetail local | "front" | 视角方向 |
| `spatialCard` | NodeDetail local | null | 空间知识卡片 |
| `chatOpen` | NodeDetail local | false | AI 面板 |

---

## 三、修改指南

### 要改什么 → 改哪个文件

| 需求 | 文件 | 位置 |
|------|------|------|
| 左侧菜单宽度 | HomePage.jsx | `<aside className="...w-96...">` (第 338 行) |
| 菜单项增删 | HomePage.jsx | `MenuContent` 函数内 `group` 区 |
| AI 面板宽度 | HomePage.jsx | `animate={{ width: 320 }}` (第 403 行) |
| 右上角 ViewGizmo | ViewGizmo.tsx | `FACES` 数组 (第 7 行) |
| 底部控制栏按钮 | BottomControlBar.tsx | `return` JSX 内各 button |
| 控制栏更多菜单 | BottomControlBar.tsx | `moreOpen` + 弹出面板 |
| 知识面板宽度 | NodeDetail.tsx | `<aside className="...lg:w-[360px]...">` (第 290 行) |
| 左侧剖面图面板 | NodeDetail.tsx | `<aside className="...flex-[2]...">` (第 199 行) |
| 3D 视口比例 | NodeDetail.tsx | `<div className="flex-[3]">` (第 218 行) |
| 空间卡片样式 | SpatialLabel.jsx | `motion.div` className |
| 全局色板 | [index.css](src/index.css) | CSS 变量定义 |
| 默认视角模式 | [useModelInteraction.ts:6](src/hooks/useModelInteraction.ts#L6) | `isOrthographic` 初始值 |
| 初始视角方向 | [NodeDetail.tsx:51](src/NodeDetail.tsx#L51) | `viewTarget` 初始值 |

### 新增菜单项模板

```jsx
// HomePage.jsx → MenuContent
<MenuItem
  item={{
    icon: LucideIcon,        // 从 lucide-react 导入
    label: "菜单名称",
    to: "/path"              // 或 onClick: () => {}
  }}
/>
```

### 新增底部按钮模板

```tsx
// BottomControlBar.tsx
{onMyToggle && (
  <>
    <div className="w-px h-5 bg-hairline mx-0.5 sm:mx-1 shrink-0" />
    <button onClick={onMyToggle}
      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center
        transition-all duration-300 relative shrink-0
        ${myActive ? "bg-hairline" : ""}`}
      title="工具名 (快捷键)"
    >
      <IconComponent size={16} className={`sm:size-[18px] transition-colors duration-300 ${
        myActive ? "text-primary" : "text-muted-soft"
      }`} strokeWidth={1.5} />
      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[10px] text-muted-soft hidden sm:block">K</span>
    </button>
  </>
)}
```
