import { useRef } from "react";
import { ChevronsLeft, ChevronsRight, RotateCw, Tags, Minus, Plus } from "lucide-react";

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
}: BottomControlBarProps) {
  const sliderRef = useRef<HTMLInputElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
  };

  const stepDown = () => onExplodeChange(Math.max(0, explodeValue - STEP));
  const stepUp = () => onExplodeChange(Math.min(100, explodeValue + STEP));

  return (
    <div
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10
        flex items-center gap-1.5 sm:gap-3
        px-3 sm:px-4 py-2 sm:py-2.5
        bg-white/75 backdrop-blur-lg
        border border-white/30 rounded-2xl
        shadow-lg shadow-black/5"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerDown}
    >
      {explodeAxis != null && (
        <>
          <button
            onClick={onExplodeReset}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center
              text-gray-400 hover:text-rose-500 hover:bg-rose-50
              transition-all duration-200 relative"
            title="复原 (E)"
          >
            <ChevronsLeft size={16} className="sm:size-[18px]" strokeWidth={1.5} />
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 hidden sm:block">E</span>
          </button>

          {/* mobile minus button */}
          <button
            onClick={stepDown}
            className="sm:hidden w-6 h-6 rounded-full flex items-center justify-center
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
            className="w-16 sm:w-24 md:w-32 h-6 py-1 bg-gray-200 rounded-full appearance-none cursor-pointer
              accent-rose-500
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-5
              [&::-webkit-slider-thumb]:h-5
              sm:[&::-webkit-slider-thumb]:w-4
              sm:[&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-rose-400
              [&::-webkit-slider-thumb]:shadow-sm
              [&::-webkit-slider-thumb]:hover:border-rose-500
              [&::-webkit-slider-thumb]:transition-colors"
            style={{ touchAction: "none" }}
          />

          {/* mobile plus button */}
          <button
            onClick={stepUp}
            className="sm:hidden w-6 h-6 rounded-full flex items-center justify-center
              text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all duration-200"
            title="增加"
          >
            <Plus size={12} strokeWidth={2} />
          </button>

          <button
            onClick={onExplodeMax}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center
              text-gray-400 hover:text-rose-500 hover:bg-rose-50
              transition-all duration-200 relative"
            title="分解 (E)"
          >
            <ChevronsRight size={16} className="sm:size-[18px]" strokeWidth={1.5} />
          </button>

          <div className="w-px h-5 bg-gray-200 mx-1" />
        </>
      )}

      <button
        onClick={onAutoRotateToggle}
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center
          transition-all duration-300 relative
          ${autoRotate ? "bg-rose-50" : ""}`}
        title={autoRotate ? "暂停旋转 (R)" : "自动旋转 (R)"}
      >
        <RotateCw
          size={16}
          className={`sm:size-[18px] transition-colors duration-300 ${
            autoRotate ? "text-rose-500" : "text-gray-400"
          }`}
          strokeWidth={1.5}
          style={{
            animation: autoRotate ? "spin 3s linear infinite" : "none",
          }}
        />
        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 hidden sm:block">R</span>
      </button>

      {onLabelsToggle && (
        <>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button
            onClick={onLabelsToggle}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center
              transition-all duration-300 relative
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
        </>
      )}

      {onScreenshotToggle && (
        <>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button
            onClick={onScreenshotToggle}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center
              transition-all duration-300 relative
              ${screenshotActive ? "bg-rose-50" : ""}`}
            title="截图 (Ctrl+S)"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`sm:size-[18px] transition-colors duration-300 ${
                screenshotActive ? "text-rose-500" : "text-gray-400"
              }`}
            >
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

export default BottomControlBar;
