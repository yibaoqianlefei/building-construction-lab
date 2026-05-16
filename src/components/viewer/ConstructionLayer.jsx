import { Suspense, useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Edges, useGLTF } from "@react-three/drei";
import * as THREE from "three";

const HOVER_LIFT = 0.14;
const LIFT_LERP = 0.06;
const GLOW_LERP = 0.2;

const COLOR_HOVER = new THREE.Color("#FFE8C0");
const COLOR_SELECT = new THREE.Color("#F5D68A");
const COLOR_OFF = new THREE.Color("#000000");

/* ── Per-layer GLB loader ── */
function GLBModelRenderer({ modelPath }) {
  const { scene } = useGLTF(modelPath);
  const model = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (!child.material.depthWrite) {
          child.material.depthWrite = true;
        }
      }
    });
  }, [model]);

  return <primitive object={model} />;
}

function ConstructionLayer({
  layer,
  isHovered,
  isSelected,
  explodeValue,
  floatDirection = "y",
  onPointerOver,
  onPointerOut,
  onClick,
}) {
  const meshRef = useRef();
  const groupRef = useRef();
  const modelGroupRef = useRef();
  const hoverOffset = useRef(0);
  const glowIntensity = useRef(0);
  const glowRoughness = useRef(0.45);
  const hasGLB = !!layer.modelPath;

  useFrame(() => {
    /* ---- lift ---- */
    const canLift = explodeValue > 0;
    const liftTarget = isSelected && canLift ? 1 : 0;
    hoverOffset.current = THREE.MathUtils.lerp(
      hoverOffset.current,
      liftTarget,
      LIFT_LERP
    );
    if (groupRef.current) {
      const lift = hoverOffset.current * HOVER_LIFT;
      if (floatDirection === "x") groupRef.current.position.x = lift;
      else if (floatDirection === "z") groupRef.current.position.z = lift;
      else groupRef.current.position.y = lift;
    }

    /* ---- glow targets ---- */
    let targetIntensity, targetRoughness, targetEmissive;

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

    /* apply glow to all meshes */
    const targets = hasGLB
      ? collectMeshes(modelGroupRef.current)
      : [meshRef.current];
    targets.forEach((m) => {
      if (m?.material) {
        m.material.emissiveIntensity = glowIntensity.current;
        m.material.roughness = glowRoughness.current;
        m.material.emissive?.lerp(targetEmissive, GLOW_LERP);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {hasGLB ? (
        <group ref={modelGroupRef}>
          <Suspense fallback={null}>
            <GLBModelRenderer modelPath={layer.modelPath} />
          </Suspense>
          <mesh
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}
            onClick={(e) => {
              e.stopPropagation();
              onClick(e);
            }}
            visible={false}
          >
            <boxGeometry args={[2, layer.thickness || 0.1, 2]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </group>
      ) : (
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
      )}
    </group>
  );
}

function collectMeshes(obj) {
  const list = [];
  if (!obj) return list;
  obj.traverse((child) => {
    if (child.isMesh) list.push(child);
  });
  return list;
}

export default ConstructionLayer;
