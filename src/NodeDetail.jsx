import { useState } from "react";
import { FiHome, FiInfo } from "react-icons/fi";
import ModelViewer from "./components/viewer/ModelViewer";
import ExplodeControls from "./components/viewer/ExplodeControls";
import externalWallData from "./data/externalWall";

const ACCENT = "#4A6FA5";

function NodeDetail() {
  const data = externalWallData;
  const [explodeValue, setExplodeValue] = useState(0);
  const [hoveredLayer, setHoveredLayer] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState(null);

  return (
    <div className="min-h-screen bg-white text-gray-700 flex flex-col">
      <nav className="flex items-center justify-between px-5 md:px-8 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2.5">
          <FiHome className="text-[#4A6FA5]" size={18} />
          <span className="text-sm font-medium text-gray-500 tracking-wider">
            建筑构造交互系统
          </span>
        </div>
        <div className="text-sm text-gray-400 font-medium">{data.title}</div>
      </nav>

      <main className="flex-1 flex flex-col lg:flex-row p-4 md:p-6 gap-4 md:gap-5 min-h-0">
        <div className="flex-1 min-h-[380px] lg:min-h-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
          <ModelViewer
            layers={data.layers}
            explodeValue={explodeValue}
            hoveredLayer={hoveredLayer}
            selectedLayer={selectedLayer}
            onHoverLayer={setHoveredLayer}
            onSelectLayer={setSelectedLayer}
          />
        </div>

        <aside className="w-full lg:w-80 xl:w-88 flex flex-col gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm">
            <h2 className="text-gray-800 font-bold text-base flex items-center gap-2 mb-2.5">
              <FiInfo style={{ color: ACCENT }} />
              {data.title}
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              {data.description}
            </p>
            <p className="text-gray-400 text-xs mt-2.5">
              方向：{data.directionLabel}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm">
            <h3 className="text-gray-800 font-bold text-sm mb-3">构造层图例</h3>
            <div className="space-y-1.5">
              {data.layers.map((layer, i) => {
                const active = hoveredLayer === i || selectedLayer === i;
                return (
                  <div
                    key={layer.name}
                    className={`flex items-center gap-3 p-2.5 rounded cursor-pointer transition-colors ${
                      active
                        ? "bg-blue-50/70 ring-1 ring-[#4A6FA5]/30"
                        : "hover:bg-gray-100"
                    }`}
                    onMouseEnter={() => setHoveredLayer(i)}
                    onMouseLeave={() => setHoveredLayer(null)}
                    onClick={() =>
                      setSelectedLayer(selectedLayer === i ? null : i)
                    }
                  >
                    <div
                      className="w-4 h-4 rounded-sm flex-shrink-0 border border-gray-300"
                      style={{ backgroundColor: layer.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-xs font-semibold"
                        style={{ color: active ? ACCENT : "#374151" }}
                      >
                        {layer.name}
                      </div>
                      <div className="text-gray-400 text-[10px] truncate">
                        {layer.material} · {(layer.thickness * 1000).toFixed(0)}mm
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <ExplodeControls value={explodeValue} onChange={setExplodeValue} />
        </aside>
      </main>
    </div>
  );
}

export default NodeDetail;
