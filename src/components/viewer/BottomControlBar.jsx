import { useRef } from "react";
import { ChevronsLeft, ChevronsRight, RotateCw, PanelLeftOpen } from "lucide-react";

function BottomControlBar({
  explodeValue,
  onExplodeChange,
  onExplodeReset,
  onExplodeMax,
  autoRotate,
  onAutoRotateToggle,
  showLeftPanel,
  onLeftPanelToggle,
  screenshotActive,
  onScreenshotToggle,
}) {
  const sliderRef = useRef();

  const handlePointerDown = (e) => {
    e.stopPropagation();
  };

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
      <button
        onClick={onExplodeReset}
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center
          text-gray-400 hover:text-gold-500 hover:bg-gold-50
          transition-all duration-200"
        title="复原"
      >
        <ChevronsLeft size={16} className="sm:size-[18px]" strokeWidth={1.5} />
      </button>

      <input
        ref={sliderRef}
        type="range"
        min="0"
        max="100"
        value={explodeValue}
        onChange={(e) => onExplodeChange(Number(e.target.value))}
        className="w-16 sm:w-24 md:w-32 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer
          accent-gold-500
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-3.5
          [&::-webkit-slider-thumb]:h-3.5
          sm:[&::-webkit-slider-thumb]:w-4
          sm:[&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:border-2
          [&::-webkit-slider-thumb]:border-gold-400
          [&::-webkit-slider-thumb]:shadow-sm
          [&::-webkit-slider-thumb]:hover:border-gold-500
          [&::-webkit-slider-thumb]:transition-colors"
      />

      <button
        onClick={onExplodeMax}
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center
          text-gray-400 hover:text-gold-500 hover:bg-gold-50
          transition-all duration-200"
        title="分解"
      >
        <ChevronsRight size={16} className="sm:size-[18px]" strokeWidth={1.5} />
      </button>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      <button
        onClick={onAutoRotateToggle}
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center
          transition-all duration-300
          ${autoRotate ? "bg-gold-50" : ""}`}
        title={autoRotate ? "暂停旋转" : "自动旋转"}
      >
        <RotateCw
          size={16}
          className={`sm:size-[18px] transition-colors duration-300 ${
            autoRotate ? "text-gold-500" : "text-gray-400"
          }`}
          strokeWidth={1.5}
          style={{
            animation: autoRotate ? "spin 3s linear infinite" : "none",
          }}
        />
      </button>

      {onLeftPanelToggle && (
        <>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button
            onClick={onLeftPanelToggle}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center
              transition-all duration-300
              ${showLeftPanel ? "bg-gold-50" : ""}`}
            title="全部构件"
          >
            <PanelLeftOpen
              size={16}
              className={`sm:size-[18px] transition-colors duration-300 ${
                showLeftPanel ? "text-gold-500" : "text-gray-400"
              }`}
              strokeWidth={1.5}
            />
          </button>
        </>
      )}

      {onScreenshotToggle && (
        <>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button
            onClick={onScreenshotToggle}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center
              transition-all duration-300
              ${screenshotActive ? "bg-gold-50" : ""}`}
            title="截图"
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
                screenshotActive ? "text-gold-500" : "text-gray-400"
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
