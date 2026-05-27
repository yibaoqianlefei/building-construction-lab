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

A digital interactive textbook for building construction education. Users explore 3D construction layer models (walls, roofs, etc.), play drag-and-drop assembly games, take notes with screenshots, and join classes managed by teachers.

## Architecture

### Routing & Layout

All routes are defined in [src/routes.jsx](src/routes.jsx) using `createBrowserRouter`. [src/App.jsx](src/App.jsx) is a backwards-compatible re-export. `AppLayout` wraps every route via `<Outlet />` and provides a sticky nav bar with back-button, system title link, and user menu (profile dropdown with role badge, "我的班级", sign-out). The home page (`/`) and auth page (`/auth`) suppress the nav bar.

Protected routes (`/classes`, `/classes/:classId`) use `ProtectedRoute` which checks `useAuth()` and redirects to `/auth` if not logged in.

### Auth Flow

[src/contexts/AuthContext.jsx](src/contexts/AuthContext.jsx) wraps the entire app (via `main.jsx`). It holds `{ user, profile, loading, signUp, signIn, signOut }`. On auth state change, it fetches the user's profile from the `profiles` table. The `profile.role` field distinguishes `"teacher"` from `"student"` — teachers see an "管理后台" link in the nav menu.

`AuthProvider` is placed in [src/main.jsx](src/main.jsx) outside `<RouterProvider>`, so auth state is available before route matching.

Supabase client is initialized in [src/lib/supabaseClient.js](src/lib/supabaseClient.js) using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars.

### 3D Model Viewer (Core Feature)

[src/components/viewer/ModelViewer.jsx](src/components/viewer/ModelViewer.jsx) is the central 3D component. It renders a Three.js `<Canvas>` with:

- **`WallAssembly`** — iterates over `layers[]`, positions each layer based on its `thickness`, and applies explode offsets driven by `explodeValue` (0–100). Explode animation is lerped smoothly via `useFrame`.
- **`CameraAdjuster`** — lerps the OrbitControls target (not camera position) so the view shifts to follow the exploded assembly center.
- **`ShadowLight`** — a directional light whose shadow camera dynamically resizes to cover the exploded bounds, keeping shadows sharp.
- Layer interaction: hover highlights, click selects and shows a floating `LayerLabel` card.
- **`ExplosionLabels`** — during explode, shows anchored labels on each layer; clicking a label expands a detail card with spring animation (merged from former `LabelDetailCard`).

Each construction node defines its layers as typed objects (see Data Model below).

### Data Model — Construction Nodes

Construction nodes are defined in [src/data/](src/data/) as JS/TS modules exporting a default object:

- [src/data/externalWall.ts](src/data/externalWall.ts) — 外墙外保温系统 (5 layers, typed `NodeData`)
- [src/data/flatRoof.js](src/data/flatRoof.js) — 上人平屋面 (6 layers, per-layer GLB)
- [src/data/membraneRoof.js](src/data/membraneRoof.js) — 卷材防水屋面 (6 layers, shared GLB + layerObjectName)
- [src/data/roofInsulation.js](src/data/roofInsulation.js) — 卷材平面屋顶保温构造 (9 layers)

Each node object has: `id`, `title`, `description`, `directionLabel`, `layers[]` (each with `name`, `material`, `thickness` in meters, `color` as hex, `description`, optional `modelPath` and `layerObjectName`), `explodeAxis` ("x"/"y"/"-x"/"-y"), `floatDirection`, `floatDistance`, optional `modelRotation`, `cameraPosition`, `layerOrderReverse`.

[src/data/nodesIndex.ts](src/data/nodesIndex.ts) maintains the `nodesIndex` metadata array and `getNodeData(id)` for async lazy loading via dynamic `import()`. `nodeService.js` has been removed — its functionality is merged into `nodesIndex.ts`.

[src/data/courseModules.js](src/data/courseModules.js) maps curriculum modules (绪论, 墙体, 屋顶, etc.) to node IDs. Only modules with `available: true` have linked nodes.

### TypeScript Types

[src/types/index.ts](src/types/index.ts) defines all shared types: `NodeData`, `LayerData`, `CourseModule`, `SectionData`, `Note`, `UserProfile`, `ClassData`, `BackgroundScene`, `ActiveCard`, `ModelInteractionState`, `PanelState`, `GameState`.

[tsconfig.json](tsconfig.json) uses `strict: true`, `allowJs: true` (for coexisting JSX files), `moduleResolution: "bundler"`, target ES2020.

### NodeDetail Page (Main Interaction View)

[src/NodeDetail.jsx](src/NodeDetail.jsx) (`/node/:nodeId`) orchestrates the main learning experience:

- Left area: `ModelViewer` (3D) + `BottomControlBar` (explode slider, auto-rotate toggle, screenshot mode, left panel toggle)
- Right sidebar: `ConstructionKnowledgePanel` (expandable layer cards with material info)
- Floating: `LayerLabel` (appears on layer click), `ScreenshotTool` (crosshair screenshot → auto-saves to notes), `ExplosionLabels` (anchored labels + detail cards during explode)
- `LeftKnowledgePanel` — slide-out panel with layer list

State is managed by two custom hooks (in `src/hooks/`, migrated to TypeScript):
- [src/hooks/useModelInteraction.ts](src/hooks/useModelInteraction.ts) — explode/hover/select/activeCard/screenshot
- [src/hooks/usePanelState.ts](src/hooks/usePanelState.ts) — left panel/expand/panelMode

State flow: `selectedLayer` is shared between the 3D viewer (highlight/dim layers) and the knowledge panel (expand corresponding card). When explode is at 0, selection is cleared.

### Games

[src/pages/GamesPage.jsx](src/pages/GamesPage.jsx) hosts a drag-and-drop assembly challenge using `@dnd-kit/core` (`DndContext` + `DragOverlay`). Components:

- [src/components/game/AssemblyLine.jsx](src/components/game/AssemblyLine.jsx) — target slots (useDroppable)
- [src/components/game/LayerCard.jsx](src/components/game/LayerCard.jsx) — draggable layer cards (useDraggable)
- [src/components/game/GameInfoPanel.jsx](src/components/game/GameInfoPanel.jsx) — progress bar, error count, layer list

User drags layer cards from a return zone into numbered slots, then clicks verify. Correct placements (slot index matches layer index) show green, wrong ones red. All correct triggers a celebration modal.

### Services

- **`classService.js`** — Supabase operations: `createClass`, `joinClass` (by code), `getMyClasses`, `getClassDetail`. Uses `supabase.auth.getUser()` for auth context.
- **`noteService.js`** — localStorage-backed notes (max 30). Each note has `id`, `nodeId`, `nodeTitle`, `image` (data URL screenshot), `text`, `createdAt`.

### Supabase Schema

Defined in [src/data/supabase_schema.sql](src/data/supabase_schema.sql). Tables: `profiles`, `classes`, `class_members`, `assignments`, `student_progress`. RLS policies enforce:
- Users read own profile; teachers insert classes; members view their classes
- Students update/read own progress
- Members view assignments for their classes

### Styling Conventions

- Tailwind CSS 4 with a custom `rose-*` color palette (rose-50 through rose-900) used as the accent color, defined in [src/index.css](src/index.css)
- Chinese UI text throughout
- Noto Serif SC font loaded from Google Fonts in [index.html](index.html)
- Frosted glass effect: `bg-white/70 backdrop-blur-md` pattern used extensively
- Rounded corners: `rounded-2xl` for cards, `rounded-full` for buttons/pills
