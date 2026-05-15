import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LibraryPage from "./pages/LibraryPage";
import NodeDetail from "./NodeDetail";
import PlaceholderPage from "./pages/PlaceholderPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/node/:nodeId" element={<NodeDetail />} />
        <Route path="/curriculum" element={<PlaceholderPage />} />
        <Route path="/tools" element={<PlaceholderPage />} />
        <Route path="/notes" element={<PlaceholderPage />} />
        <Route path="/contribute" element={<PlaceholderPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
