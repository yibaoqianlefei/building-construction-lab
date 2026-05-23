import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LibraryPage from "./pages/LibraryPage";
import CurriculumPage from "./pages/CurriculumPage";
import AuthPage from "./pages/AuthPage";
import ClassesPage from "./pages/ClassesPage";
import ClassDetailPage from "./pages/ClassDetailPage";
import NodeDetail from "./NodeDetail";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotesPage from "./pages/NotesPage";
import GamesPage from "./pages/GamesPage";
import SectionSubPage from "./pages/SectionSubPage";
import TextbookPage from "./pages/TextbookPage";

export const router = createBrowserRouter([
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
      { path: "/tools", element: <PlaceholderPage /> },
      { path: "/notes", element: <NotesPage /> },
      { path: "/games", element: <GamesPage /> },
      { path: "/contribute", element: <PlaceholderPage /> },
      { path: "/admin", element: <PlaceholderPage /> },
      {
        path: "/classes",
        element: (
          <ProtectedRoute>
            <ClassesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/classes/:classId",
        element: (
          <ProtectedRoute>
            <ClassDetailPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
