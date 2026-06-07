import { createHashRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import AppLayout from "./components/AppLayout";
import HomePage from "./pages/HomePage";
import LibraryPage from "./pages/LibraryPage";
import CurriculumPage from "./pages/CurriculumPage";
import AuthPage from "./pages/AuthPage";
import NodeDetail from "./NodeDetail";
import PlaceholderPage from "./pages/PlaceholderPage";
import SectionSubPage from "./pages/SectionSubPage";
import TextbookPage from "./pages/TextbookPage";
import DeveloperRoute from "./components/DeveloperRoute";

/* ── lazy-loaded non-critical pages ── */
const NotesPage = lazy(() => import("./pages/NotesPage"));
const GamesPage = lazy(() => import("./pages/GamesPage"));
const AdminContentPage = lazy(() => import("./pages/AdminContentPage"));

function LazyFallback() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

function withSuspense(Element) {
  return (
    <Suspense fallback={<LazyFallback />}>
      <Element />
    </Suspense>
  );
}

export const router = createHashRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/library", element: <LibraryPage /> },
      { path: "/curriculum", element: <CurriculumPage /> },
      { path: "/curriculum/:moduleId", element: <SectionSubPage /> },
      { path: "/textbook/:sectionId", element: <TextbookPage /> },
      { path: "/auth", element: <AuthPage /> },
      { path: "/node/:nodeId", element: <NodeDetail /> },
      { path: "/games", element: withSuspense(GamesPage) },
      { path: "/tools", element: <PlaceholderPage /> },
      { path: "/notes", element: withSuspense(NotesPage) },
      { path: "/contribute", element: <PlaceholderPage /> },
      { path: "/admin", element: <DeveloperRoute>{withSuspense(AdminContentPage)}</DeveloperRoute> },
      { path: "/admin/:tab", element: <DeveloperRoute>{withSuspense(AdminContentPage)}</DeveloperRoute> },
    ],
  },
]);
