import { useState, useRef, useEffect, useCallback } from "react";

function ScreenshotTool({ containerRef, onScreenshot, onClose }) {
  const [dragging, setDragging] = useState(false);
  const [sel, setSel] = useState(null);
  const start = useRef({ x: 0, y: 0 });
  const rect = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const getPos = useCallback((e) => {
    if (!rect.current) return { x: 0, y: 0 };
    const r = rect.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }, []);

  function handleDown(e) {
    e.preventDefault();
    if (!rect.current) return;
    rect.current = e.currentTarget.getBoundingClientRect();
    const pos = getPos(e);
    start.current = pos;
    setDragging(true);
    setSel(null);
  }

  function handleMove(e) {
    if (!dragging) return;
    const pos = getPos(e);
    const x = Math.min(start.current.x, pos.x);
    const y = Math.min(start.current.y, pos.y);
    const w = Math.abs(pos.x - start.current.x);
    const h = Math.abs(pos.y - start.current.y);
    setSel({ x, y, width: w, height: h });
  }

  function handleUp() {
    setDragging(false);
    if (!sel || sel.width < 10 || sel.height < 10) {
      setSel(null);
      return;
    }
    captureScreenshot();
  }

  function captureScreenshot() {
    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas || !sel) return;

    const dpr = window.devicePixelRatio || 1;
    const containerRect = rect.current?.getBoundingClientRect();
    if (!containerRect) return;

    const scaleX = (canvas.width / dpr) / containerRect.width;
    const scaleY = (canvas.height / dpr) / containerRect.height;

    const sx = sel.x * scaleX * dpr;
    const sy = sel.y * scaleY * dpr;
    const sw = sel.width * scaleX * dpr;
    const sh = sel.height * scaleY * dpr;

    const temp = document.createElement("canvas");
    temp.width = sw;
    temp.height = sh;
    const ctx = temp.getContext("2d");
    ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);

    onScreenshot(temp.toDataURL("image/png"));
    onClose();
  }

  return (
    <div
      ref={rect}
      className="absolute inset-0 z-20 cursor-crosshair rounded-2xl overflow-hidden"
      onMouseDown={handleDown}
      onMouseMove={handleMove}
      onMouseUp={handleUp}
      style={{ background: "rgba(0,0,0,0.15)" }}
    >
      <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-gray-600 shadow-sm pointer-events-none select-none">
        拖动框选截图区域，按 ESC 取消
      </div>

      {sel && (
        <div
          className="absolute border-2 border-dashed border-gold-500 bg-gold-50/10
            shadow-[0_0_0_4px_rgba(212,164,58,0.2)] pointer-events-none"
          style={{
            left: sel.x,
            top: sel.y,
            width: sel.width,
            height: sel.height,
          }}
        />
      )}
    </div>
  );
}

export default ScreenshotTool;
