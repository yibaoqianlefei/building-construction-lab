import { useState, useRef, useCallback, useEffect } from "react";
import { assetPath } from "../../utils/baseUrl";

const MIN_SCALE = 0.3;
const MAX_SCALE = 3.0;
const ZOOM_STEP = 0.1;

function clampScale(s: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));
}

/* ref to latest callback without re-creating listeners */
function useLatest<T extends (...args: any[]) => any>(fn: T) {
  const ref = useRef(fn);
  ref.current = fn;
  return ref;
}

interface DiagramHotspot {
  x: number;
  y: number;
  width: number;
  height: number;
  layerIndex: number;
}

interface ZoomableImageProps {
  src: string;
  alt: string;
  onError?: () => void;
  hotspots?: DiagramHotspot[] | null;
  onHotspotClick?: (layerIndex: number) => void;
  onScaleChange?: (scale: number) => void;
  syncScale?: number;
  onPositionChange?: (pos: { x: number; y: number }, size: { width: number; height: number }) => void;
}

export default function ZoomableImage({
  src, alt, onError, hotspots, onHotspotClick, onScaleChange, syncScale, onPositionChange,
}: ZoomableImageProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null!);
  const onScaleRef = useLatest(onScaleChange);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    posStartX: 0,
    posStartY: 0,
  });
  const pinchRef = useRef({
    lastDist: 0,
    scaleStart: 1,
  });

  /* ── notify parent of scale changes (safe: fires after render, not during) ── */
  useEffect(() => {
    if (onScaleRef.current) onScaleRef.current(scale);
  }, [scale]);

  /* ── wheel zoom (non-passive to preventDefault) ── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setScale((prev) => clampScale(prev + delta));
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  /* ── mouse drag ── */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (scale <= 1) return;
      e.preventDefault();
      dragRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        posStartX: position.x,
        posStartY: position.y,
      };
      setDragging(true);
    },
    [scale, position]
  );

  /* ── notify parent on drag end ── */
  const prevDragging = useRef(false);
  useEffect(() => {
    if (prevDragging.current && !dragging && onPositionChange && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      onPositionChange({ x: position.x, y: position.y }, { width: rect.width, height: rect.height });
    }
    prevDragging.current = dragging;
  }, [dragging, position, onPositionChange]);

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d.active) return;
      setPosition({
        x: d.posStartX + (e.clientX - d.startX),
        y: d.posStartY + (e.clientY - d.startY),
      });
    };

    const onUp = () => {
      dragRef.current.active = false;
      setDragging(false);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  /* ── double-click reset ── */
  const handleDoubleClick = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    if (onScaleChange) onScaleChange(1);
    if (onPositionChange && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      onPositionChange({ x: 0, y: 0 }, { width: rect.width, height: rect.height });
    }
  }, [onScaleChange, onPositionChange]);

  /* ── touch pinch zoom + single-finger drag ── */
  const getDist = (touches: React.TouchList | TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        pinchRef.current = {
          lastDist: getDist(e.touches),
          scaleStart: scale,
        };
      } else if (e.touches.length === 1 && scale > 1) {
        dragRef.current = {
          active: true,
          startX: e.touches[0].clientX,
          startY: e.touches[0].clientY,
          posStartX: position.x,
          posStartY: position.y,
        };
        setDragging(true);
      }
    },
    [scale, position]
  );

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = getDist(e.touches);
      const ratio = dist / pinchRef.current.lastDist;
      const ns = clampScale(pinchRef.current.scaleStart * ratio);
      setScale(ns);
    } else if (e.touches.length === 1 && dragRef.current.active) {
      const d = dragRef.current;
      setPosition({
        x: d.posStartX + (e.touches[0].clientX - d.startX),
        y: d.posStartY + (e.touches[0].clientY - d.startY),
      });
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (dragRef.current.active && onPositionChange && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      onPositionChange({ x: position.x, y: position.y }, { width: rect.width, height: rect.height });
    }
    dragRef.current.active = false;
    setDragging(false);
  }, [position, onPositionChange]);

  /* ── hotspot click ── */
  const handleHotspotClick = useCallback(
    (e: React.MouseEvent, layerIndex: number) => {
      e.stopPropagation();
      if (onHotspotClick) onHotspotClick(layerIndex);
    },
    [onHotspotClick]
  );

  /* ── sync external scale (from 3D model zoom) ── */
  useEffect(() => {
    if (syncScale !== undefined && syncScale !== scale) {
      setScale(clampScale(syncScale));
    }
  }, [syncScale]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── cursor ── */
  const cursor = scale > 1 ? (dragging ? "grabbing" : "grab") : "default";

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden flex items-center justify-center relative"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleClick}
      style={{ cursor }}
    >
      <img
        src={assetPath(src)}
        alt={alt}
        className="max-w-full max-h-full rounded-xl shadow-sm select-none"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transition: "none",
        }}
        draggable={false}
        onError={onError}
      />

      {/* ── diagram hotspots ── */}
      {hotspots &&
        hotspots.map((hs, idx) => (
          <button
            key={idx}
            onClick={(e) => handleHotspotClick(e, hs.layerIndex)}
            className="absolute bg-transparent hover:bg-primary/10 border border-transparent hover:border-primary/30 rounded transition-colors cursor-pointer z-10"
            style={{
              left: `${hs.x}%`,
              top: `${hs.y}%`,
              width: `${hs.width}%`,
              height: `${hs.height}%`,
            }}
            title={`图层 ${hs.layerIndex + 1}`}
            aria-label={`选择图层 ${hs.layerIndex + 1}`}
          />
        ))}
    </div>
  );
}
