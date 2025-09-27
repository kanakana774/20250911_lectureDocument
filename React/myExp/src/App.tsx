import { Routes, Route } from "react-router-dom";
import Sample from "./20250923_useRef/Sample";

function App() {
  return (
    <Routes>
      <Route path="/" element={<h1>ホームページ</h1>} />
      <Route path="/20250923_useRef" element={<Sample />} />
    </Routes>
  );
}

export default App;
