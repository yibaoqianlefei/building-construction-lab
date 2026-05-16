import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import { AnimatePresence } from "framer-motion";
import * as THREE from "three";
import LayerLabel from "./LayerLabel";

const HOVER_LIFT = 0.08;
const LERP_SPEED = 0.15;

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
  const timerRef = useRef(null);
  const hoverOffset = useRef(0);
  const [delayedShow, setDelayedShow] = useState(false);

  useEffect(() => {
    const shouldShow = isHovered || isSelected;

    if (shouldShow) {
      if (isSelected) {
        setDelayedShow(true);
      } else {
        timerRef.current = setTimeout(() => setDelayedShow(true), 150);
      }
    } else {
      setDelayedShow(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isHovered, isSelected]);

  useFrame(() => {
    const canLift = explodeValue > 0;
    const target = isSelected && canLift ? 1 : 0;
    hoverOffset.current = THREE.MathUtils.lerp(
      hoverOffset.current,
      target,
      LERP_SPEED
    );

    if (groupRef.current) {
      groupRef.current.position.y = hoverOffset.current * HOVER_LIFT;
    }
  });

  return (
    <group ref={groupRef}>
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
          roughness={0.45}
          metalness={0.05}
        />
        <Edges scale={1}>
          <lineBasicMaterial
            color={
              isSelected ? "#D4A43A" : isHovered ? "#1F2937" : "#4B5563"
            }
            linewidth={1}
            transparent
            opacity={isSelected ? 0.9 : isHovered ? 0.85 : 0.45}
          />
        </Edges>
      </mesh>

      <AnimatePresence>
        {delayedShow && (
          <LayerLabel
            layer={layer}
            position={[
              0,
              layer.name.includes("空气") ? 0 : 0.85,
              layer.name.includes("空气") ? 0.55 : 0,
            ]}
          />
        )}
      </AnimatePresence>
    </group>
  );
}

export default ConstructionLayer;
