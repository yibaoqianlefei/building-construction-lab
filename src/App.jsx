import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AppLayout from "./components/AppLayout";
import HomePage from "./pages/HomePage";
import LibraryPage from "./pages/LibraryPage";
import CurriculumPage from "./pages/CurriculumPage";
import AuthPage from "./pages/AuthPage";
import NodeDetail from "./NodeDetail";
import PlaceholderPage from "./pages/PlaceholderPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/curriculum" element={<CurriculumPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/node/:nodeId" element={<NodeDetail />} />
            <Route path="/tools" element={<PlaceholderPage />} />
            <Route path="/notes" element={<PlaceholderPage />} />
            <Route path="/contribute" element={<PlaceholderPage />} />
            <Route path="/classes" element={<PlaceholderPage />} />
            <Route path="/admin" element={<PlaceholderPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
