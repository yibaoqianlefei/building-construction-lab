# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server (HMR)
npm run build      # Production build to dist/
npm run preview    # Preview production build
npm run lint       # ESLint check
```

## Tech Stack

- React 19 + Vite 8 (no TypeScript, plain JSX)
- Three.js via `@react-three/fiber` + `@react-three/drei` for 3D rendering
- Tailwind CSS 4 via `@tailwindcss/vite` plugin
- Supabase (auth + PostgreSQL) with RLS policies
- React Router DOM v7
- Framer Motion for animations
- @dnd-kit for drag-and-drop (used in game components)

## Project: 建筑构造交互系统 (Building Construction Interactive Textbook)

A digital interactive textbook for building construction education. Users explore 3D construction layer models (walls, roofs, etc.), play drag-and-drop assembly games, take notes with screenshots, and join classes managed by teachers.

## Architecture

### Routing & Layout

All routes are defined in [src/App.jsx](src/App.jsx). `AppLayout` wraps every route via `<Outlet />` and provides a sticky nav bar with back-button, system title link, and user menu (profile dropdown with role badge, "我的班级", sign-out). The home page (`/`) and auth page (`/auth`) suppress the nav bar.

Protected routes (`/classes`, `/classes/:classId`) use `ProtectedRoute` which checks `useAuth()` and redirects to `/auth` if not logged in.

### Auth Flow

[src/contexts/AuthContext.jsx](src/contexts/AuthContext.jsx) wraps the entire app. It holds `{ user, profile, loading, signUp, signIn, signOut }`. On auth state change, it fetches the user's profile from the `profiles` table. The `profile.role` field distinguishes `"teacher"` from `"student"` — teachers see an "管理后台" link in the nav menu.

Supabase client is initialized in [src/lib/supabaseClient.js](src/lib/supabaseClient.js) using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars.

### 3D Model Viewer (Core Feature)

[src/components/viewer/ModelViewer.jsx](src/components/viewer/ModelViewer.jsx) is the central 3D component. It renders a Three.js `<Canvas>` with:

- **`WallAssembly`** — iterates over `layers[]`, positions each layer based on its `thickness`, and applies explode offsets driven by `explodeValue` (0–100). Explode animation is lerped smoothly via `useFrame`.
- **`CameraAdjuster`** — lerps the OrbitControls target (not camera position) so the view shifts to follow the exploded assembly center.
- **`ShadowLight`** — a directional light whose shadow camera dynamically resizes to cover the exploded bounds, keeping shadows sharp.
- Layer interaction: hover highlights, click selects and shows a floating `LayerLabel` card.

Each construction node defines its layers as plain JS objects (see Data Model below).

### Data Model — Construction Nodes

Construction nodes are defined as static JS objects in [src/data/](src/data/):

- [src/data/externalWall.js](src/data/externalWall.js) — example: 外墙外保温系统 (5 layers)
- [src/data/flatRoof.js](src/data/flatRoof.js) — 上人平屋面
- [src/data/membraneRoof.js](src/data/membraneRoof.js) — 卷材屋面

Each node object has: `id`, `title`, `description`, `directionLabel`, `layers[]` (each with `name`, `material`, `thickness` in meters, `color` as hex, `description`), `explodeAxis` ("x" or "y"), `floatDirection`, `floatDistance`, optional `modelRotation` and `cameraPosition`.

[src/data/nodesIndex.js](src/data/nodesIndex.js) maintains the node registry and `getNodeData(id)` for sync lookup. [src/services/nodeService.js](src/services/nodeService.js) provides lazy loading via dynamic `import()` for code-splitting large data files.

[src/data/courseModules.js](src/data/courseModules.js) maps curriculum modules (绪论, 墙体, 屋顶, etc.) to node IDs. Only modules with `available: true` have linked nodes.

### NodeDetail Page (Main Interaction View)

[src/NodeDetail.jsx](src/NodeDetail.jsx) (`/node/:nodeId`) orchestrates the main learning experience:

- Left area: `ModelViewer` (3D) + `BottomControlBar` (explode slider, auto-rotate toggle, screenshot mode, left panel toggle)
- Right sidebar: `ConstructionKnowledgePanel` (expandable layer cards with material info)
- Floating: `LayerLabel` (appears on layer click), `ScreenshotTool` (crosshair screenshot → auto-saves to notes)
- `LeftKnowledgePanel` — slide-out panel with layer list

State flow: `selectedLayer` is shared between the 3D viewer (highlight/dim layers) and the knowledge panel (expand corresponding card). When explode is at 0, selection is cleared.

### Games

[src/pages/GamesPage.jsx](src/pages/GamesPage.jsx) hosts a drag-and-drop assembly challenge. [src/components/game/GameAssembleScene.jsx](src/components/game/GameAssembleScene.jsx) shuffles layer start positions and uses `DraggableLayer` components. Each layer snaps to the correct slot — when all layers are placed, a completion modal appears.

### Services

- **`classService.js`** — Supabase operations: `createClass`, `joinClass` (by code), `getMyClasses`, `getClassDetail`. Uses `supabase.auth.getUser()` for auth context.
- **`noteService.js`** — localStorage-backed notes (max 30). Each note has `id`, `nodeId`, `nodeTitle`, `image` (data URL screenshot), `text`, `createdAt`.
- **`nodeService.js`** — lazy node data loading with `import()`.

### Supabase Schema

Defined in [src/data/supabase_schema.sql](src/data/supabase_schema.sql). Tables: `profiles`, `classes`, `class_members`, `assignments`, `student_progress`. RLS policies enforce:
- Users read own profile; teachers insert classes; members view their classes
- Students update/read own progress
- Members view assignments for their classes

### Styling Conventions

- Tailwind CSS 4 with a custom `gold-*` color palette (gold-50 through gold-600) used as the accent color
- Chinese UI text throughout
- Noto Serif SC font loaded from Google Fonts in [index.html](index.html)
- Frosted glass effect: `bg-white/70 backdrop-blur-md` pattern used extensively
- Rounded corners: `rounded-2xl` for cards, `rounded-full` for buttons/pills
