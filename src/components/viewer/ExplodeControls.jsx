import { useRef } from "react";
import { FiLayers, FiRotateCcw } from "react-icons/fi";

function ExplodeControls({ value, onChange }) {
  const sliderRef = useRef();

  const handlePointerDown = (e) => {
    e.stopPropagation();
  };

  const handleExplode = () => {
    onChange(100);
  };

  const handleReset = () => {
    onChange(0);
  };

  return (
    <div
      className="bg-canvas rounded-xl p-5 space-y-4
        border border-hairline"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerDown}
    >
      <h3 className="text-ink font-medium font-sans text-sm flex items-center gap-2 tracking-tight">
        <FiLayers style={{ color: "#cc785c" }} />
        分解视图
      </h3>

      <div className="flex items-center gap-3">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-hairline
            bg-canvas hover:bg-surface-cream-strong hover:scale-105 text-body text-xs
            transition-all duration-200 ease-out hover:shadow-sm"
          title="复原"
        >
          <FiRotateCcw size={13} />
          复原
        </button>

        <input
          ref={sliderRef}
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-1.5 bg-hairline rounded-full appearance-none cursor-pointer
            accent-primary
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:shadow-sm
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:duration-150
            [&::-webkit-slider-thumb]:hover:scale-110"
        />

        <button
          onClick={handleExplode}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-on-primary text-xs
            transition-all duration-200 ease-out
            hover:brightness-110 hover:scale-105
            hover:shadow-md hover:shadow-primary/20 active:scale-95"
          style={{ backgroundColor: "#cc785c" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#a9583e")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#cc785c")}
          title="分解"
        >
          <FiLayers size={13} />
          分解
        </button>
      </div>
    </div>
  );
}

export default ExplodeControls;
