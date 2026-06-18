# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server (HMR)
npm run build      # Production build to dist/
npm run preview    # Preview production build
npm run lint       # ESLint check
npm run typecheck  # TypeScript type check (tsc --noEmit)
```

## Tech Stack

- React 19 + Vite 8 (TypeScript + JSX, gradual migration)
- Three.js v0.184 via `@react-three/fiber` + `@react-three/drei` for 3D rendering
- Tailwind CSS 4 via `@tailwindcss/vite` plugin
- Supabase (auth + PostgreSQL) with RLS policies
- React Router DOM v7
- Framer Motion for animations
- @dnd-kit/core for drag-and-drop (used in game components)

## Project: 建筑构造交互系统 (Building Construction Interactive Textbook)

A digital interactive textbook for building construction education. Users explore 3D construction layer models (walls, roofs, etc.), play drag-and-drop assembly games, and take notes with screenshots.

## Architecture

### Routing & Layout

All routes are defined in [src/routes.jsx](src/routes.jsx) using `createHashRouter`. [src/App.jsx](src/App.jsx) is a backwards-compatible re-export. `AppLayout` wraps every route via `<Outlet />` and provides a sticky nav bar with back-button, system title link, and user menu (profile dropdown with role badge, sign-out). The home page (`/`) and auth page (`/auth`) suppress the nav bar.

Non-critical pages (Games, Notes, Admin) use `React.lazy()` + `<Suspense>` for code splitting. A shared `<LazyFallback>` spinner is shown during chunk loading.

Protected routes use `ProtectedRoute` which checks `useAuth()` and redirects to `/auth` if not logged in. Developer-only routes (`/admin`) use `DeveloperRoute` which checks `profile.role === 'developer'`.

### Auth Flow

[src/contexts/AuthContext.jsx](src/contexts/AuthContext.jsx) wraps the entire app (via `main.jsx`). It holds `{ user, profile, loading, signUp, signIn, signOut }`. On auth state change, it fetches the user's profile from the `profiles` table.

- `profile.role` is `"user"` or `"developer"`.
- `"developer"` users see the "管理后台" link in the navigation.
- There are **no** "teacher" or "student" roles — all features are accessible to any logged-in user unless restricted by `DeveloperRoute`.
- Class management features (`ClassesPage`, `ClassDetailPage`, `classService`) have been **removed**.

`AuthProvider` is placed in [src/main.jsx](src/main.jsx) outside `<RouterProvider>`, so auth state is available before route matching.

Supabase client is initialized in [src/lib/supabaseClient.js](src/lib/supabaseClient.js) using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars.

### 3D Model Viewer (Core Feature)

[src/components/viewer/ModelViewer.jsx](src/components/viewer/ModelViewer.jsx) is the central 3D component. It renders a Three.js `<Canvas>` with:

- **`WallAssembly`** — iterates over `layers[]`, positions each layer based on its `thickness`, and applies explode offsets driven by `explodeValue` (0–100). Explode animation is lerped smoothly via `useFrame`.
- **`CameraAdjuster`** — lerps the OrbitControls target (not camera position) so the view shifts to follow the exploded assembly center.
- **`ShadowLight`** — a directional light whose shadow camera dynamically resizes to cover the exploded bounds, keeping shadows sharp.
- Layer interaction: hover highlights, click selects and syncs to the knowledge panel via `onLayerClick`.
- **`ExplosionLabels`** — during explode, shows L-shaped guide lines with anchored pill labels on each layer. Labels alternate above/below (for walls, x-axis) or left/right (for roofs, y-axis). Labels fade in/out synchronized with explosion progress. Clicking a label sets `selectedLayer` to expand the corresponding knowledge card. Performance optimizations:
  - `STATE_SKIP=3` throttles React state updates to every 3 frames.
  - `smoothedExplode` is driven by `requestAnimationFrame` and `Math.exp` lerp, separate from React's render cycle.
  - `LabelButton` is wrapped in `React.memo` to prevent unnecessary re-renders.
  - Label positioning uses `computeAnchors` with alternating offsets (above/below for X-axis, left/right for Y-axis).

Each construction node defines its layers as typed objects (see Data Model below).

### Data Model — Construction Nodes

Construction nodes are defined in [src/data/](src/data/) as JS/TS modules exporting a default object:

- [src/data/flatRoof.js](src/data/flatRoof.js) — 上人平屋面 (6 layers, per-layer GLB)
- [src/data/membraneRoof.js](src/data/membraneRoof.js) — 卷材防水屋面 (6 layers, shared GLB + layerObjectName)
- [src/data/roofInsulation.js](src/data/roofInsulation.js) — 卷材平面屋顶保温构造 (9 layers)

Each node object has: `id`, `title`, `description`, `directionLabel`, `layers[]` (each with `name`, `material`, `thickness` in meters, `color` as hex, `description`, optional `modelPath` and `layerObjectName`), `explodeAxis` ("x"/"y"/"-x"/"-y"), `floatDirection`, `floatDistance`, optional `modelRotation`, `cameraPosition`, `layerOrderReverse`, `diagramImage` (URL/path to section diagram image).

[src/data/nodesIndex.ts](src/data/nodesIndex.ts) maintains the `nodesIndex` metadata array and `getNodeData(id)` for async lazy loading via dynamic `import()`.

[src/data/courseModules.js](src/data/courseModules.js) maps curriculum modules (绪论, 墙体, 屋顶, etc.) to node IDs. Only modules with `available: true` have linked nodes.

### How to Add a New Construction Node

1. Create data file in `src/data/` (e.g., `myNode.ts`) exporting a `NodeData` object.
2. In [src/data/nodesIndex.ts](src/data/nodesIndex.ts):
   - Add entry to `nodesIndex` array.
   - Add `"my-node-id": () => import("./myNode")` to `nodeLoaders`.
3. Optionally add `diagramImage` path in the node data for the left panel.
4. To make it available in the game, add its ID to the relevant `courseModules` or `sections` data.

### TypeScript Types

[src/types/index.ts](src/types/index.ts) defines all shared types: `NodeData` (incl. optional `diagramImage`), `LayerData`, `CourseModule`, `SectionData`, `Note`, `UserProfile`, `ClassData`, `BackgroundScene`, `PanelState`, `GameState`.

[tsconfig.json](tsconfig.json) uses `strict: true`, `allowJs: true` (for coexisting JSX files), `moduleResolution: "bundler"`, target ES2020.

### NodeDetail Page (Main Interaction View)

[src/NodeDetail.jsx](src/NodeDetail.jsx) (`/node/:nodeId`) uses a **three-column flex layout**:

- **Left** (`flex-[2]`): Section diagram viewer (`ZoomableImage`). Falls back to "即将上线" if no `diagramImage`. Hidden on mobile (`hidden lg:flex`).
- **Center** (`flex-[3]`): 3D model viewer and bottom control bar.
- **Right** (`w-[360px]`): Knowledge panel (expandable cards).

The left and center panels share remaining space at a 2:3 ratio after the fixed right panel.

Data loading: tries Supabase DB first (`getNodeDefinition` from `contentService`), falls back to local import (`getNodeData` from `nodesIndex`).

State is managed by two custom hooks:
- [src/hooks/useModelInteraction.ts](src/hooks/useModelInteraction.ts) — **single source of truth** for all 3D interaction state:
  - `explodeValue` / `autoRotate` / `isOrthographic` — viewport controls
  - `hoveredLayer` / `selectedLayer` / `screenshotMode` — interaction
  - `showLabels` / `syncZoom` / `viewTarget` / `spatialCard` — UI overlays
  - Provides setter functions, toggle functions, and composite callbacks (`handleLayerClickWithCard`, `handleBlankClickWithCard`, `closeSpatialCard`)
  - Full `ModelInteractionState` type defined in [src/types/index.ts](src/types/index.ts)
- [src/hooks/usePanelState.ts](src/hooks/usePanelState.ts) — panel mode (knowledge/practice/textbook)

NodeDetail no longer declares any local 3D interaction state — it destructures everything from `useModelInteraction()` and passes props to ModelViewer/BottomControlBar.
State flow: `selectedLayer` is shared between the 3D viewer (highlight/dim layers) and the knowledge panel (expand corresponding card via `activeLayer`/`onLayerSelect`). When explode is at 0, selection is cleared.

### Knowledge Card System (Post-V2 Refactor)

- **`ConstructionKnowledgePanel`** is the **single source of truth** for all layer knowledge display.
- **`ExplosionLabels`** only shows pill tags during explode; clicking a tag updates `activeLayer`.
- The old `LayerLabel` (click popup) and `LeftKnowledgePanel` (slide-out) are **completely removed**. Do not import or reference them.
- State flow: `selectedLayer` in `useModelInteraction` → `activeLayer` prop → panel expands corresponding card.
- There is no floating detail card on layer click — knowledge only appears in the right panel.

### ZoomableImage Component

[src/components/viewer/ZoomableImage.jsx](src/components/viewer/ZoomableImage.jsx) renders a section diagram with interactive zoom/pan:

- **Wheel zoom**: clamped to 0.3×–3×, ±10% per step. Non-passive listener via `useEffect` + `addEventListener`.
- **Pan**: enabled only when `scale > 1`. Uses `useRef` for drag tracking (not state) to avoid re-renders during drag; `window`-level `mousemove`/`mouseup` listeners when dragging.
- **Double-click**: resets `scale=1` and `position={0,0}`.
- **Touch**: two-finger pinch zoom via `getDist` ratio; single-finger pan when zoomed.
- **Cursor**: `default` at scale≤1, `grab` at scale>1, `grabbing` while dragging.
- **Props**: `src`, `alt`, `onError` (for graceful fallback to placeholder).

### Games

[src/pages/GamesPage.jsx](src/pages/GamesPage.jsx) hosts a drag-and-drop assembly challenge using `@dnd-kit/core` (`DndContext` + `DragOverlay`). Components:

- [src/components/game/AssemblyLine.jsx](src/components/game/AssemblyLine.jsx) — target slots (useDroppable)
- [src/components/game/LayerCard.jsx](src/components/game/LayerCard.jsx) — draggable layer cards (useDraggable)
- [src/components/game/GameInfoPanel.jsx](src/components/game/GameInfoPanel.jsx) — progress bar, error count, layer list

### Services

- **`contentService.js`** — Supabase operations: `getTextbookSection`, `listTextbookSections`, `upsertTextbookSection`, `deleteTextbookSection`, `getNodeDefinition`, `listNodeDefinitions`, `upsertNodeDefinition`, `deleteNodeDefinition`, `listMediaFiles`, `uploadMedia`. Uses `supabase.auth.getUser()` for auth context.
- **`noteService.js`** — localStorage-backed notes (max 30). Each note has `id`, `nodeId`, `nodeTitle`, `image` (data URL screenshot), `text`, `createdAt`.

### Developer Admin Backend

[src/pages/AdminContentPage.tsx](src/pages/AdminContentPage.tsx) (`/admin`) provides content management for developers:

- **章节管理 Tab**: Three-column layout (tree + Markdown editor + properties). Supports JSON export of full section tree.
- **节点管理 Tab**: Visual Layers table editor — inline editable columns (name/material/thickness/color chip/description/modelPath/layerObjectName), ▲▼ reorder, add/delete layers, per-layer GLB upload, saves full `node_data` JSON.
- **媒体库 Tab**: Image preview thumbnails, file type badges, copy URL, delete with confirmation.

Protected by [src/components/DeveloperRoute.tsx](src/components/DeveloperRoute.tsx) which checks `profile.role === 'developer'`.

### Supabase Schema

Defined in [src/data/supabase_schema.sql](src/data/supabase_schema.sql). Tables: `profiles`, `textbook_sections`, `node_definitions`, `media`. RLS policies enforce:
- Roles: `user` and `developer` only (no teacher/student)
- Developers can INSERT/UPDATE/DELETE on content tables
- Everyone can SELECT (read) content tables
- Users read/write own profile

### Styling Conventions

- Tailwind CSS 4 with a custom semantic color palette defined via `@theme` in [src/index.css](src/index.css)
  - Primary/coral: `#cc785c` (玫红调), secondary: `#5db8a6` (teal), `#e8a55a` (amber)
  - Surfaces: `--color-canvas`, `--color-surface-soft`, `--color-surface-card`
  - Text scale: `--color-ink`, `--color-body`, `--color-muted`, `--color-muted-soft`
- **Design tokens** (`@theme` spacing): `--spacing-sidebar` (384px), `--spacing-panel-kw` (360px), `--spacing-menu-item-h` (38px), `--spacing-section-gap` (28px), `--spacing-page-pt` (64px), `--spacing-page-pb` (80px)
- **Reusable component classes** (`@layer components`): `.card-glass`, `.card-frosted`, `.btn-ghost`, `.btn-primary-sm`
- Chinese UI text throughout
- Font: **Noto Sans SC** (思源黑体, SIL OFL 可免费商用), loaded from Google Fonts in [index.html](index.html)
- Frosted glass effect: `bg-white/70 backdrop-blur-md` pattern used extensively
- Rounded corners: `rounded-2xl` for cards, `rounded-[10px]` for menu items, `rounded-full` for buttons/pills
- Vite 8 code splitting: `manualChunks` separates three.js, r3f, and supabase into independent chunks

## Maintenance

- If this file becomes outdated, regenerate it by asking Claude Code to review `PROJECT_OVERVIEW.md` and the codebase, then update this document.
- Do not manually modify this file unless necessary; let Claude Code handle it to ensure accuracy.
