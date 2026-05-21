import { Suspense, useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Edges, useGLTF } from "@react-three/drei"; // Edges still used by procedural box path
import * as THREE from "three";

const DEFAULT_LIFT = 0.14;
const LIFT_LERP = 0.06;
const GLOW_LERP = 0.2;

const COLOR_HOVER = new THREE.Color("#FFE8C0");
const COLOR_SELECT = new THREE.Color("#F5D68A");
const COLOR_OFF = new THREE.Color("#000000");

/* ── Per-layer GLB loader ── */
function GLBModelRenderer({ modelPath, objectName, onPointerOver, onPointerOut, onClick }) {
  const { scene } = useGLTF(modelPath);

  const { model, edgeLines, hitBox } = useMemo(() => {
    let source;
    if (objectName) {
      const found = scene.getObjectByName(objectName);
      if (!found) {
        console.warn(`[GLBModelRenderer] object "${objectName}" not found in "${modelPath}"`);
        return { model: null, edgeLines: [], hitBox: null };
      }
      source = found;
    } else {
      source = scene;
    }
    const cloned = source.clone(true);
    const lines = [];
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (!child.material.depthWrite) {
          child.material.depthWrite = true;
        }
        if (child.geometry) {
          const edgesGeo = new THREE.EdgesGeometry(child.geometry, 15);
          const line = new THREE.LineSegments(
            edgesGeo,
            new THREE.LineBasicMaterial({ color: "#4B5563", transparent: true, opacity: 0.45 })
          );
          line.position.copy(child.position);
          line.rotation.copy(child.rotation);
          line.scale.copy(child.scale);
          line.updateMatrixWorld();
          lines.push(line);
        }
      }
    });

    /* hit zone from bounding box, expanded for thin layers */
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const minDim = 0.03;
    const expand = 0.02;
    const hb = {
      center: [center.x, center.y, center.z],
      size: [
        Math.max(size.x + expand, minDim),
        Math.max(size.y + expand, minDim),
        Math.max(size.z + expand, minDim),
      ],
    };

    return { model: cloned, edgeLines: lines, hitBox: hb };
  }, [scene, objectName, modelPath]);

  if (!model) return null;

  return (
    <group>
      <primitive object={model} />
      {edgeLines.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
      {hitBox && (
        <mesh
          name="hitZone"
          position={hitBox.center}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
          onClick={(e) => { e.stopPropagation(); onClick(e); }}
        >
          <boxGeometry args={hitBox.size} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

function ConstructionLayer({
  layer,
  isHovered,
  isSelected,
  isDimmed,
  explodeValue,
  floatDirection = "y",
  floatDistance = DEFAULT_LIFT,
  onPointerOver,
  onPointerOut,
  onClick,
}) {
  const meshRef = useRef();
  const groupRef = useRef();
  const modelGroupRef = useRef();
  const lineMatRef = useRef();
  const hoverOffset = useRef(0);
  const glowIntensity = useRef(0);
  const glowRoughness = useRef(0.45);
  const currentOpacity = useRef(layer.name.includes("空气") ? 0.3 : 1);
  const currentLineOpacity = useRef(0.45);
  const currentLineColor = useRef(new THREE.Color("#4B5563"));
  const hasGLB = !!layer.modelPath;
  const layerObjectName = layer.layerObjectName;

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
      const lift = hoverOffset.current * floatDistance;
      if (floatDirection === "x") groupRef.current.position.x = lift;
      else if (floatDirection === "z") groupRef.current.position.z = lift;
      else groupRef.current.position.y = lift;
    }

    /* ---- glow targets (hover always wins so it works on selected/dimmed layers too) ---- */
    let targetIntensity, targetRoughness, targetEmissive;

    if (isHovered) {
      targetIntensity = 0.6;
      targetRoughness = 0.3;
      targetEmissive = COLOR_HOVER;
    } else {
      targetIntensity = 0;
      targetRoughness = 0.45;
      targetEmissive = COLOR_OFF;
    }

    /* ---- dim / highlight opacity targets ---- */
    const DIM_LERP = 0.2;
    let opacityTarget, lineOpacityTarget;
    const lineColorTarget = new THREE.Color();

    if (isSelected) {
      opacityTarget = 1;
      lineOpacityTarget = 0.9;
      lineColorTarget.set("#D4A43A");
    } else if (isDimmed) {
      if (isHovered) {
        opacityTarget = 0.7;
        lineOpacityTarget = 0.65;
        lineColorTarget.set("#1F2937");
      } else {
        opacityTarget = 0.25;
        lineOpacityTarget = 0.25;
        lineColorTarget.set("#4B5563");
      }
    } else {
      opacityTarget = layer.name.includes("空气") ? 0.3 : 1;
      lineOpacityTarget = isHovered ? 0.85 : 0.45;
      lineColorTarget.set(isHovered ? "#1F2937" : "#4B5563");
    }

    currentOpacity.current = THREE.MathUtils.lerp(currentOpacity.current, opacityTarget, DIM_LERP);
    currentLineOpacity.current = THREE.MathUtils.lerp(currentLineOpacity.current, lineOpacityTarget, DIM_LERP);
    currentLineColor.current.lerp(lineColorTarget, DIM_LERP);

    /* update edge line materials (procedural + GLB) */
    if (lineMatRef.current) {
      lineMatRef.current.opacity = currentLineOpacity.current;
      lineMatRef.current.color.copy(currentLineColor.current);
    }
    if (hasGLB && modelGroupRef.current) {
      modelGroupRef.current.traverse((child) => {
        if (child.isLineSegments && child.material) {
          child.material.opacity = currentLineOpacity.current;
          child.material.color.copy(currentLineColor.current);
        }
      });
    }

    /* lerp glow values */
    glowIntensity.current = THREE.MathUtils.lerp(glowIntensity.current, targetIntensity, GLOW_LERP);
    glowRoughness.current = THREE.MathUtils.lerp(glowRoughness.current, targetRoughness, GLOW_LERP);

    /* apply to all visible meshes */
    const targets = hasGLB
      ? collectMeshes(modelGroupRef.current).filter(m => m.name !== "hitZone")
      : [meshRef.current];
    targets.forEach((m) => {
      if (m?.material && m.visible !== false) {
        m.material.emissiveIntensity = glowIntensity.current;
        m.material.roughness = glowRoughness.current;
        m.material.emissive?.lerp(targetEmissive, GLOW_LERP);
        m.material.transparent = true;
        m.material.opacity = currentOpacity.current;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {hasGLB ? (
        <group ref={modelGroupRef}>
          <Suspense fallback={null}>
            <GLBModelRenderer
              modelPath={layer.modelPath}
              objectName={layerObjectName}
              onPointerOver={onPointerOver}
              onPointerOut={onPointerOut}
              onClick={onClick}
            />
          </Suspense>
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
            roughness={0.45}
            metalness={0.05}
            transparent
            depthWrite={!layer.name.includes("空气")}
          />
          <Edges scale={1}>
            <lineBasicMaterial
              ref={lineMatRef}
              color="#4B5563"
              linewidth={1}
              transparent
              opacity={0.45}
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
