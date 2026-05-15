import { Html } from "@react-three/drei";

function LayerLabel({ layer, position }) {
  return (
    <Html position={position} center style={{ pointerEvents: "none" }}>
      <div className="bg-white/80 backdrop-blur-md text-gray-700 text-xs rounded-md px-3.5 py-2.5 shadow-lg border border-gray-200/70 min-w-[170px]">
        <h3
          className="font-bold text-sm mb-1.5 pb-1 border-b border-gray-200/70"
          style={{ color: layer.color }}
        >
          {layer.name}
        </h3>
        <p className="text-gray-500 mb-0.5">
          <span className="text-gray-400">材料：</span>
          {layer.material}
        </p>
        <p className="text-gray-500 mb-0.5">
          <span className="text-gray-400">厚度：</span>
          {(layer.thickness * 1000).toFixed(0)} mm
        </p>
        <p className="text-gray-400 leading-relaxed mt-1.5 text-[11px]">
          {layer.description}
        </p>
      </div>
    </Html>
  );
}

export default LayerLabel;
