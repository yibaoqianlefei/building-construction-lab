import { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const CORRECT_COLOR = new THREE.Color("#4CAF50");
const WRONG_COLOR = new THREE.Color("#EF4444");

function LayeredModel({ layers, feedback, explodeAxis = "x", isDragging }) {
  const groupRef = useRef();

  const initialPositions = useMemo(() => {
    let offset = 0;
    const total = layers.reduce((s, l) => s + l.thickness, 0);
    return layers.map((l) => {
      const pos = offset + l.thickness / 2 - total / 2;
      offset += l.thickness;
      return pos;
    });
  }, [layers]);

  const meshRefs = useRef([]);

  useFrame(({ clock }) => {
    if (groupRef.current && !isDragging) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.25;
    }
  });

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => {
      meshRefs.current.forEach((m) => {
        if (m?.material) {
          m.material.emissive.set("#000000");
          m.material.emissiveIntensity = 0;
        }
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const isX = explodeAxis === "x";

  return (
    <group ref={groupRef}>
      {layers.map((layer, i) => {
        const fb = feedback?.correctIndices?.includes(i)
          ? "correct"
          : feedback?.incorrectIndices?.includes(i)
            ? "wrong"
            : null;

        return (
          <mesh
            key={layer.name}
            ref={(el) => (meshRefs.current[i] = el)}
            position={[isX ? initialPositions[i] : 0, isX ? 0 : initialPositions[i], 0]}
          >
            <boxGeometry args={[layer.thickness, 1.2, 0.6]} />
            <meshStandardMaterial
              color={layer.color}
              transparent={layer.name.includes("空气")}
              opacity={layer.name.includes("空气") ? 0.3 : 1}
              roughness={0.5}
              metalness={0.05}
              emissive={
                fb === "correct" ? CORRECT_COLOR
                : fb === "wrong" ? WRONG_COLOR
                : "#000000"
              }
              emissiveIntensity={fb ? 0.5 : 0}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function GameModelPreview({ layers, feedback, explodeAxis, isDragging }) {
  if (!layers?.length) return null;
  return (
    <div className="w-full h-full min-h-[320px] rounded-2xl overflow-hidden bg-gray-50 border border-gray-200">
      <Canvas camera={{ position: [2, 1.2, 3], fov: 38 }} gl={{ antialias: true }}>
        <ambientLight intensity={0.9} color="#ffffff" />
        <directionalLight position={[5, 8, 5]} intensity={1.5} color="#fffdf7" />
        <directionalLight position={[-3, 2, -3]} intensity={0.4} color="#d4e3f0" />
        <LayeredModel layers={layers} feedback={feedback} explodeAxis={explodeAxis} isDragging={isDragging} />
        <gridHelper args={[8, 8, "#e5e7eb", "#d1d5db"]} position={[0, -1, 0]} />
      </Canvas>
    </div>
  );
}

export default GameModelPreview;
