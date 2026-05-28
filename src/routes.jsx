import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import HomePage from "./pages/HomePage";
import LibraryPage from "./pages/LibraryPage";
import CurriculumPage from "./pages/CurriculumPage";
import AuthPage from "./pages/AuthPage";
import NodeDetail from "./NodeDetail";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotesPage from "./pages/NotesPage";
import SectionSubPage from "./pages/SectionSubPage";
import TextbookPage from "./pages/TextbookPage";
import GamesPage from "./pages/GamesPage";
import AdminContentPage from "./pages/AdminContentPage";
import DeveloperRoute from "./components/DeveloperRoute";
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
      { path: "/games", element: <GamesPage /> },
      { path: "/tools", element: <PlaceholderPage /> },
      { path: "/notes", element: <NotesPage /> },
      { path: "/contribute", element: <PlaceholderPage /> },
      { path: "/admin", element: <DeveloperRoute><AdminContentPage /></DeveloperRoute> },
    ],
  },
]);
