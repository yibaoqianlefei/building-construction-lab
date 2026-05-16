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
      className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 space-y-4
        border border-gray-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerDown}
    >
      <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2 tracking-tight">
        <FiLayers style={{ color: "#D4A43A" }} />
        分解视图
      </h3>

      <div className="flex items-center gap-3">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200
            bg-white/80 hover:bg-gray-100 hover:scale-105 text-gray-600 text-xs
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
          className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer
            accent-[#D4A43A]
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-[#D4A43A]
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:shadow-sm
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:duration-150
            [&::-webkit-slider-thumb]:hover:scale-110"
        />

        <button
          onClick={handleExplode}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs
            transition-all duration-200 ease-out
            hover:brightness-110 hover:scale-105
            hover:shadow-md hover:shadow-gold-500/20 active:scale-95"
          style={{ backgroundColor: "#D4A43A" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#B8891F")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#D4A43A")}
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
