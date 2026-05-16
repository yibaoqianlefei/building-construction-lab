import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import * as THREE from "three";

const HOVER_LIFT = 0.14;
const LIFT_LERP = 0.06;
const GLOW_LERP = 0.2;

const COLOR_HOVER = new THREE.Color("#FFE8C0");
const COLOR_SELECT = new THREE.Color("#F5D68A");
const COLOR_OFF = new THREE.Color("#000000");

function ConstructionLayer({
  layer,
  isHovered,
  isSelected,
  explodeValue,
  onPointerOver,
  onPointerOut,
  onClick,
}) {
  const meshRef = useRef();
  const groupRef = useRef();
  const hoverOffset = useRef(0);
  const glowIntensity = useRef(0);
  const glowRoughness = useRef(0.45);

  useFrame(() => {
    const material = meshRef.current?.material;
    if (!material) return;

    /* ---- lift ---- */
    const canLift = explodeValue > 0;
    const liftTarget = isSelected && canLift ? 1 : 0;
    hoverOffset.current = THREE.MathUtils.lerp(
      hoverOffset.current,
      liftTarget,
      LIFT_LERP
    );
    if (groupRef.current) {
      groupRef.current.position.y = hoverOffset.current * HOVER_LIFT;
    }

    /* ---- glow ---- */
    let targetIntensity;
    let targetRoughness;
    let targetEmissive;

    if (isSelected) {
      targetIntensity = 0;
      targetRoughness = 0.45;
      targetEmissive = COLOR_OFF;
    } else if (isHovered) {
      targetIntensity = 0.6;
      targetRoughness = 0.3;
      targetEmissive = COLOR_HOVER;
    } else {
      targetIntensity = 0;
      targetRoughness = 0.45;
      targetEmissive = COLOR_OFF;
    }

    glowIntensity.current = THREE.MathUtils.lerp(
      glowIntensity.current,
      targetIntensity,
      GLOW_LERP
    );
    glowRoughness.current = THREE.MathUtils.lerp(
      glowRoughness.current,
      targetRoughness,
      GLOW_LERP
    );

    material.emissiveIntensity = glowIntensity.current;
    material.roughness = glowRoughness.current;
    material.emissive.lerp(targetEmissive, GLOW_LERP);
  });

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={(e) => {
          e.stopPropagation();
          onClick(e);
        }}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[layer.thickness, 1.5, 0.8]} />
        <meshStandardMaterial
          color={layer.color}
          transparent={layer.name.includes("空气")}
          opacity={layer.name.includes("空气") ? 0.3 : 1}
          roughness={0.45}
          metalness={0.05}
          depthWrite={layer.name.includes("空气") ? false : true}
        />
        <Edges scale={1}>
          <lineBasicMaterial
            color={isHovered && !isSelected ? "#1F2937" : "#4B5563"}
            linewidth={1}
            transparent
            opacity={isHovered && !isSelected ? 0.85 : 0.45}
          />
        </Edges>
      </mesh>
    </group>
  );
}

export default ConstructionLayer;
