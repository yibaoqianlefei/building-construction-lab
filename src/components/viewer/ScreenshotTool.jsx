import { useState, useRef, useEffect, useCallback } from "react";

function ScreenshotTool({ containerRef, onScreenshot, onClose }) {
  const [sel, setSel] = useState(null);
  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const overlayRef = useRef(null);

  /* ESC to cancel */
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const getPos = useCallback((e) => {
    if (!overlayRef.current) return { x: 0, y: 0 };
    const r = overlayRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }, []);

  /* native DOM events — don't trust React synthetic events over Canvas */
  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    function onDown(e) {
      e.preventDefault();
      e.stopPropagation();
      const pos = getPos(e);
      start.current = pos;
      dragging.current = true;
      setSel(null);
    }

    function onMove(e) {
      if (!dragging.current) return;
      e.preventDefault();
      const pos = getPos(e);
      const x = Math.min(start.current.x, pos.x);
      const y = Math.min(start.current.y, pos.y);
      const w = Math.abs(pos.x - start.current.x);
      const h = Math.abs(pos.y - start.current.y);
      setSel(w > 0 && h > 0 ? { x, y, width: w, height: h } : null);
    }

    function onUp(e) {
      if (!dragging.current) return;
      dragging.current = false;

      /* need to read sel synchronously — we capture the latest from the ref */
      const currentSel = selRef.current;
      if (!currentSel || currentSel.width < 10 || currentSel.height < 10) {
        setSel(null);
        return;
      }
      captureScreenshot(currentSel);
    }

    el.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      el.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []); // intentionally empty — capture via refs

  /* keep a ref copy of sel so mouseup can read it synchronously */
  const selRef = useRef(null);
  useEffect(() => { selRef.current = sel; }, [sel]);

  function captureScreenshot(currentSel) {
    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas || !currentSel) return;

    const ovRect = overlayRef.current?.getBoundingClientRect();
    if (!ovRect) return;

    /* canvas.width already includes devicePixelRatio;
       overlay CSS size maps 1:1 to canvas CSS size */
    const scaleX = canvas.width / ovRect.width;
    const scaleY = canvas.height / ovRect.height;

    const sx = Math.round(currentSel.x * scaleX);
    const sy = Math.round(currentSel.y * scaleY);
    const sw = Math.round(currentSel.width * scaleX);
    const sh = Math.round(currentSel.height * scaleY);

    if (sw <= 0 || sh <= 0) return;

    const temp = document.createElement("canvas");
    temp.width = sw;
    temp.height = sh;
    const ctx = temp.getContext("2d");
    ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);

    onScreenshot(temp.toDataURL("image/png"));
  }

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-[100] cursor-crosshair rounded-2xl overflow-hidden"
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
