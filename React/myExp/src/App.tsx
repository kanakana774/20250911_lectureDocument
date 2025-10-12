import { Routes, Route } from "react-router-dom";
import Sample from "./20250923_useRef/Sample";
import SampleMemo from "./20250928_memo/SampleMemo";
import Memo1 from "./20250928_memo/Memo1";
import UseMemo1 from "./20250928_memo/UseMemo1";

function App() {
  return (
    <Routes>
      <Route path="/" element={<h1>root</h1>} />
      <Route path="/20250923_useRef" element={<Sample />} />
      <Route path="/20250928_memo" element={<UseMemo1 />} />
    </Routes>
  );
}

export default App;
