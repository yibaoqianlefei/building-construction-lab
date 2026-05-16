import { Html } from "@react-three/drei";

function LayerLabel({ layer, position }) {
  return (
    <Html position={position} center style={{ pointerEvents: "none" }}>
      <div
        className="bg-white/85 backdrop-blur-xl text-gray-700 text-xs
          rounded-2xl px-4 py-3
          shadow-[0_8px_30px_rgba(0,0,0,0.08)]
          border border-gray-200/50 min-w-[180px]"
      >
        <h3
          className="font-bold text-sm mb-2 pb-1.5 border-b border-gray-200/50 tracking-tight"
          style={{ color: layer.color }}
        >
          {layer.name}
        </h3>
        <p className="text-gray-500 mb-0.5">
          <span className="text-gray-400">材料：</span>
          {layer.material}
        </p>
        <p className="text-gray-500 mb-0.5 tabular-nums">
          <span className="text-gray-400">厚度：</span>
          {(layer.thickness * 1000).toFixed(0)} mm
        </p>
        <p className="text-gray-400 leading-relaxed mt-2 text-[11px]">
          {layer.description}
        </p>
      </div>
    </Html>
  );
}

export default LayerLabel;
