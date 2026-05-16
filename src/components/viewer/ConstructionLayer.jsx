import { useRef } from "react";
import { Edges } from "@react-three/drei";
import LayerLabel from "./LayerLabel";

function ConstructionLayer({
  layer,
  isHovered,
  isSelected,
  onPointerOver,
  onPointerOut,
  onClick,
}) {
  const meshRef = useRef();

  const showLabel = isHovered || isSelected;

  return (
    <>
      <mesh
        ref={meshRef}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={onClick}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[layer.thickness, 1.5, 0.8]} />
        <meshStandardMaterial
          color={layer.color}
          transparent={layer.name.includes("空气")}
          opacity={layer.name.includes("空气") ? 0.3 : 1}
          emissive={isHovered ? layer.color : "#000000"}
          emissiveIntensity={isHovered ? 0.25 : 0}
          roughness={0.5}
          metalness={0.05}
        />
        <Edges scale={1}>
          <lineBasicMaterial
            color={isHovered ? "#1F2937" : "#6B7280"}
            linewidth={1}
            transparent
            opacity={isHovered ? 0.85 : 0.45}
          />
        </Edges>
      </mesh>

      {showLabel && (
        <LayerLabel
          layer={layer}
          position={[
            0,
            layer.name.includes("空气") ? 0 : 0.85,
            layer.name.includes("空气") ? 0.55 : 0,
          ]}
        />
      )}
    </>
  );
}

export default ConstructionLayer;
