import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NodeDetail from "./NodeDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/node/:nodeId" element={<NodeDetail />} />
        <Route path="/about" element={<div />} />
        <Route path="/dashboard" element={<div />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
