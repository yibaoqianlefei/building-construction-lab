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
      className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200 shadow-sm"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerDown}
    >
      <h3 className="text-gray-800 font-bold text-sm flex items-center gap-2">
        <FiLayers style={{ color: "#4A6FA5" }} />
        分解视图
      </h3>

      <div className="flex items-center gap-2.5">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-100 text-gray-600 text-xs transition-colors"
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
          className="flex-1 h-1.5 bg-gray-200 rounded appearance-none cursor-pointer
            accent-[#4A6FA5]
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-sm
            [&::-webkit-slider-thumb]:bg-[#4A6FA5]
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:shadow-sm"
        />

        <button
          onClick={handleExplode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-white text-xs transition-colors"
          style={{ backgroundColor: "#4A6FA5" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3d5c8a")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4A6FA5")}
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
