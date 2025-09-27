import { useCallback, useRef } from "react";

function Sample() {
  const domNodeRef = useRef<HTMLDivElement | null>(null);

  // コールバックrefをuseCallbackでメモ化
  const setRef = useCallback((node: HTMLDivElement) => {
    if (node) {
      domNodeRef.current = node;
      // 必要に応じてここでDOM要素に何か操作を行う
      console.log("DOM node attached:", node);
    }
  }, []); // 依存配列が空なので、一度だけ作成される

  const handleButtonClick = () => {
    if (domNodeRef.current) {
      domNodeRef.current.style.backgroundColor = "lightblue";
    }
  };

  return (
    <div>
      <div ref={setRef}>This is a div with a ref.</div>
      <button onClick={handleButtonClick}>Change background</button>
    </div>
  );
}

export default Sample;
