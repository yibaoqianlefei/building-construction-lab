import { useRef, useState, useEffect } from "react";
import { ChevronsLeft, ChevronsRight, RotateCw, Tags, Minus, Plus, Link2, Grid3x3, MoreHorizontal } from "lucide-react";

const STEP = 10;

interface BottomControlBarProps {
  explodeValue: number;
  onExplodeChange: (v: number) => void;
  onExplodeReset: () => void;
  onExplodeMax: () => void;
  autoRotate: boolean;
  onAutoRotateToggle: () => void;
  screenshotActive: boolean;
  onScreenshotToggle: () => void;
  showLabels: boolean;
  onLabelsToggle: () => void;
  explodeAxis?: string | null;
  syncZoom?: boolean;
  onSyncZoomToggle?: () => void;
  isOrthographic?: boolean;
  onOrthographicToggle?: () => void;
}

function BottomControlBar({
  explodeValue,
  onExplodeChange,
  onExplodeReset,
  onExplodeMax,
  autoRotate,
  onAutoRotateToggle,
  screenshotActive,
  onScreenshotToggle,
  showLabels,
  onLabelsToggle,
  explodeAxis,
  syncZoom,
  onSyncZoomToggle,
  isOrthographic,
  onOrthographicToggle,
}: BottomControlBarProps) {
  const sliderRef = useRef<HTMLInputElement>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
  };

  const stepDown = () => onExplodeChange(Math.max(0, explodeValue - STEP));
  const stepUp = () => onExplodeChange(Math.min(100, explodeValue + STEP));

  /* close more menu on outside click */
  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [moreOpen]);

  /* any "more" tool active? */
  const moreActive =
    screenshotActive ||
    syncZoom ||
    isOrthographic;

  return (
    <div
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10
        flex items-center gap-0.5 sm:gap-2
        px-2 sm:px-4 py-2 sm:py-2.5
        bg-white/80 backdrop-blur-lg
        border border-white/40 rounded-2xl
        shadow-lg shadow-black/5"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerDown}
    >
      {/* ── explode group ── */}
      {explodeAxis != null && (
        <>
          <button
            onClick={onExplodeReset}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center
              text-gray-400 hover:text-rose-500 hover:bg-rose-50
              transition-all duration-200 relative shrink-0"
            title="复原 (E)"
          >
            <ChevronsLeft size={16} className="sm:size-[18px]" strokeWidth={1.5} />
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 hidden sm:block">E</span>
          </button>

          {/* mobile minus */}
          <button
            onClick={stepDown}
            className="sm:hidden w-6 h-6 rounded-full flex items-center justify-center shrink-0
              text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all duration-200"
            title="减少"
          >
            <Minus size={12} strokeWidth={2} />
          </button>

          <input
            ref={sliderRef}
            type="range"
            min="0"
            max="100"
            value={explodeValue}
            onChange={(e) => onExplodeChange(Number(e.target.value))}
            className="w-14 sm:w-24 md:w-32 h-6 py-1 bg-gray-200 rounded-full appearance-none cursor-pointer
              accent-rose-500 shrink
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
              sm:[&::-webkit-slider-thumb]:w-4 sm:[&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-rose-400
              [&::-webkit-slider-thumb]:shadow-sm
              [&::-webkit-slider-thumb]:hover:border-rose-500
              [&::-webkit-slider-thumb]:transition-colors"
            style={{ touchAction: "none" }}
          />

          {/* mobile plus */}
          <button
            onClick={stepUp}
            className="sm:hidden w-6 h-6 rounded-full flex items-center justify-center shrink-0
              text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all duration-200"
            title="增加"
          >
            <Plus size={12} strokeWidth={2} />
          </button>

          <button
            onClick={onExplodeMax}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center
              text-gray-400 hover:text-rose-500 hover:bg-rose-50
              transition-all duration-200 relative shrink-0"
            title="分解 (E)"
          >
            <ChevronsRight size={16} className="sm:size-[18px]" strokeWidth={1.5} />
          </button>

          <div className="w-px h-5 bg-gray-200/70 mx-0.5 sm:mx-1 shrink-0" />
        </>
      )}

      {/* ── primary toggles ── */}
      <button
        onClick={onAutoRotateToggle}
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center
          transition-all duration-300 relative shrink-0
          ${autoRotate ? "bg-rose-50" : ""}`}
        title={autoRotate ? "暂停旋转 (R)" : "自动旋转 (R)"}
      >
        <RotateCw
          size={16}
          className={`sm:size-[18px] transition-colors duration-300 ${
            autoRotate ? "text-rose-500" : "text-gray-400"
          }`}
          strokeWidth={1.5}
          style={{ animation: autoRotate ? "spin 3s linear infinite" : "none" }}
        />
        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 hidden sm:block">R</span>
      </button>

      {onLabelsToggle && (
        <button
          onClick={onLabelsToggle}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center
            transition-all duration-300 relative shrink-0
            ${showLabels ? "bg-rose-50" : ""}`}
          title="标签 (L)"
        >
          <Tags
            size={16}
            className={`sm:size-[18px] transition-colors duration-300 ${
              showLabels ? "text-rose-500" : "text-gray-400"
            }`}
            strokeWidth={1.5}
          />
          <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 hidden sm:block">L</span>
        </button>
      )}

      {/* ── more menu (secondary tools) ── */}
      {(onScreenshotToggle || onSyncZoomToggle || onOrthographicToggle) && (
        <>
          <div className="w-px h-5 bg-gray-200/70 mx-0.5 sm:mx-1 shrink-0" />

          <div ref={moreRef} className="relative shrink-0">
            <button
              onClick={() => setMoreOpen((v) => !v)}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center
                transition-all duration-200 relative
                ${moreActive ? "bg-rose-50 text-rose-500" : "text-gray-400 hover:text-rose-500 hover:bg-rose-50"}`}
              title="更多工具"
            >
              <MoreHorizontal size={16} className="sm:size-[18px]" strokeWidth={1.5} />
              {moreActive && (
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
              )}
            </button>

            {moreOpen && (
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                  flex items-center gap-0.5
                  px-2 py-1.5
                  bg-white/95 backdrop-blur-lg
                  border border-gray-200/60 rounded-xl
                  shadow-lg shadow-black/5"
              >
                {onScreenshotToggle && (
                  <button
                    onClick={() => { onScreenshotToggle(); setMoreOpen(false); }}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center
                      transition-all duration-200
                      ${screenshotActive ? "bg-rose-50 text-rose-500" : "text-gray-400 hover:text-rose-500 hover:bg-rose-50"}`}
                    title="截图 (Ctrl+S)"
                  >
                    <svg
                      width="16" height="16" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round"
                      className="sm:size-[18px]"
                    >
                      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                      <circle cx="12" cy="13" r="3" />
                    </svg>
                  </button>
                )}
                {onSyncZoomToggle && (
                  <button
                    onClick={() => { onSyncZoomToggle(); setMoreOpen(false); }}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center
                      transition-all duration-200
                      ${syncZoom ? "bg-rose-50 text-rose-500" : "text-gray-400 hover:text-rose-500 hover:bg-rose-50"}`}
                    title={syncZoom ? "取消同步缩放" : "同步缩放"}
                  >
                    <Link2 size={16} className="sm:size-[18px]" strokeWidth={1.5} />
                  </button>
                )}
                {onOrthographicToggle && (
                  <button
                    onClick={() => { onOrthographicToggle(); setMoreOpen(false); }}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center
                      transition-all duration-200
                      ${isOrthographic ? "bg-rose-50 text-rose-500" : "text-gray-400 hover:text-rose-500 hover:bg-rose-50"}`}
                    title={isOrthographic ? "正交 → 切换透视" : "透视 → 切换正交"}
                  >
                    <Grid3x3 size={16} className="sm:size-[18px]" strokeWidth={1.5} />
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}

export default BottomControlBar;
