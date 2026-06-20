import { Suspense, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Edges, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { assetPath } from "../../utils/baseUrl";

const DEFAULT_LIFT = 0.14;
const LIFT_LERP = 0.06;
const GLOW_LERP = 0.25;

const COLOR_HOVER = new THREE.Color("#FFF8E7"); // warm white
const COLOR_SELECT = new THREE.Color("#FFF8E7"); // warm white-gold
const COLOR_OFF = new THREE.Color("#000000");
const PULSE_DURATION = 2.0; // seconds of initial pulse

/* ── Per-layer GLB loader ── */
function GLBModelRenderer({ modelPath, objectName, excludeNames, interactive = true, onPointerOver, onPointerOut, onClick }) {
  const { scene } = useGLTF(assetPath(modelPath), true);  /* Draco enabled */

  /* ── debug: dump all named objects in the GLB (dev only) ── */
  useMemo(() => {
    if (typeof window !== "undefined" && !window._glbDebugged?.[modelPath]) {
      const allNames = [];
      scene.traverse((child) => {
        if (child.name) allNames.push(`"${child.name}" (${child.type})`);
      });
      console.log(
        `%c[GLB Debug] %c${modelPath} %c— ${allNames.length} named objects`,
        "color:#cc785c;font-weight:bold",
        "color:#333",
        "color:#666"
      );
      console.log(allNames.join("\n"));
      if (!window._glbDebugged) window._glbDebugged = {};
      window._glbDebugged[modelPath] = true;
    }
    return null;
  }, [scene, modelPath]);

  const { model, hitBox, worldOffset } = useMemo(() => {
    let source;
    let worldOffset = new THREE.Vector3();
    if (objectName) {
      const found = scene.getObjectByName(objectName);
      if (!found) {
        const names = [];
        scene.traverse((child) => { if (child.name) names.push(child.name); });
        console.warn(
          `[GLBModelRenderer] object "${objectName}" not found in "${modelPath}". Available names:`,
          names
        );
        return { model: null, hitBox: null, worldOffset };
      }
      found.getWorldPosition(worldOffset);
      source = found;
    } else {
      source = scene;
    }
    const cloned = source.clone(true);

    /* zero root position so wrapper group controls world placement */
    if (objectName) {
      cloned.position.set(0, 0, 0);
    }

    /* hide excluded objects (for "rest of model" non-interactive layer) */
    if (!objectName && excludeNames?.length) {
      cloned.traverse((child) => {
        if (child.name && excludeNames.includes(child.name)) {
          child.visible = false;
        }
      });
    }

    /* attach edge lines as children of each mesh — guarantees alignment */
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
            new THREE.LineBasicMaterial({
              color: "#1F2937",
              transparent: true,
              opacity: 0.45,
              polygonOffset: true,
              polygonOffsetFactor: 1,
              polygonOffsetUnits: 1,
            })
          );
          child.add(line); // edge line inherits mesh transform automatically
        }
      }
    });

    /* hit zone only for interactive layers */
    let hb = null;
    if (interactive) {
      const box = new THREE.Box3().setFromObject(cloned);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);
      const minDim = 0.03;
      const expand = 0.02;
      hb = {
        center: [center.x, center.y, center.z],
        size: [
          Math.max(size.x + expand, minDim),
          Math.max(size.y + expand, minDim),
          Math.max(size.z + expand, minDim),
        ],
      };
    }

    return { model: cloned, hitBox: hb, worldOffset };
  }, [scene, objectName, excludeNames, interactive, modelPath]);

  if (!model) return null;

  return (
    <group position={worldOffset.toArray()}>
      <primitive object={model} />
      {hitBox && (
        <mesh
          name="hitZone"
          position={hitBox.center}
          onPointerOver={interactive ? onPointerOver : undefined}
          onPointerOut={interactive ? onPointerOut : undefined}
          onClick={interactive ? (e) => { e.stopPropagation(); onClick?.(e); } : undefined}
        >
          <boxGeometry args={hitBox.size} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

{/* ── Loading placeholder shown while GLB downloads/decodes ── */}
function PlaceholderLayer({ thickness, color }) {
  const ref = useRef();
  const time = useRef(0);
  useFrame((_, delta) => {
    time.current += delta;
    if (ref.current) {
      ref.current.material.opacity = 0.25 + Math.sin(time.current * 1.8) * 0.1;
    }
  });
  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={[thickness, 1.5, 0.8]} />
      <meshStandardMaterial
        color={color}
        roughness={0.6}
        metalness={0.05}
        transparent
        opacity={0.35}
        depthWrite
      />
      <Edges scale={1}>
        <lineBasicMaterial color="#1F2937" transparent opacity={0.3} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
      </Edges>
    </mesh>
  );
}

function ConstructionLayer({
  layer,
  isHovered,
  isSelected,
  isDimmed,
  isPlaced = false,
  isFlashing = false,
  isCorrect = false,
  isWrong = false,
  explodeValue,
  floatDirection = "y",
  floatDistance = DEFAULT_LIFT,
  interactive = true,
  excludeNames,
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
  const currentLineColor = useRef(new THREE.Color("#1F2937"));
  const pulseTime = useRef(0);
  const selectedAt = useRef(0);
  const hasGLB = !!layer.modelPath;
  const layerObjectName = layer.layerObjectName;

  const isLocked = !interactive || isPlaced || isCorrect || isWrong;

  useFrame((_, delta) => {
    pulseTime.current += delta;
    /* restart pulse timer when selection changes */
    if (isSelected && selectedAt.current === 0) selectedAt.current = pulseTime.current;
    if (!isSelected) selectedAt.current = 0;
    const selectedElapsed = isSelected ? pulseTime.current - selectedAt.current : 0;

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

    /* ---- glow targets (wrong > correct > flashing > placed > hover > selected > off) ---- */
    let targetIntensity, targetRoughness, targetEmissive;

    if (isWrong) {
      const pulse = Math.sin(pulseTime.current * 3) * 0.5 + 0.5;
      targetIntensity = 0.3 + pulse * 0.5;
      targetRoughness = 0.3;
      targetEmissive = new THREE.Color("#EF4444");
    } else if (isCorrect) {
      targetIntensity = 0.4;
      targetRoughness = 0.35;
      targetEmissive = new THREE.Color("#22C55E");
    } else if (isFlashing) {
      targetIntensity = 0.8;
      targetRoughness = 0.3;
      targetEmissive = new THREE.Color("#EF4444");
    } else if (isPlaced) {
      targetIntensity = 0;
      targetRoughness = 0.45;
      targetEmissive = COLOR_OFF;
    } else if (isHovered) {
      targetIntensity = 0.8;
      targetRoughness = 0.28;
      targetEmissive = COLOR_HOVER;
    } else if (isSelected) {
      /* warm gold glow — strong pulse for 2s, then stable at 1.2 */
      const fade = Math.max(0, 1 - selectedElapsed / PULSE_DURATION);
      const wave = Math.sin(selectedElapsed * Math.PI * 3.2) * 0.15 * fade;
      targetIntensity = 1.2 + wave;
      targetRoughness = 0.2;
      targetEmissive = COLOR_SELECT;
    } else {
      targetIntensity = 0;
      targetRoughness = 0.45;
      targetEmissive = COLOR_OFF;
    }

    /* ---- dim / highlight opacity targets ---- */
    const DIM_LERP = 0.25;
    let opacityTarget, lineOpacityTarget;
    const lineColorTarget = new THREE.Color();

    if (isWrong) {
      opacityTarget = 1;
      lineOpacityTarget = 0.9;
      lineColorTarget.set("#EF4444");
    } else if (isCorrect) {
      opacityTarget = 1;
      lineOpacityTarget = 0.9;
      lineColorTarget.set("#22C55E");
    } else if (isFlashing) {
      opacityTarget = 1;
      lineOpacityTarget = 0.9;
      lineColorTarget.set("#EF4444");
    } else if (isPlaced) {
      opacityTarget = layer.name.includes("空气") ? 0.3 : 1;
      lineOpacityTarget = 0.45;
      lineColorTarget.set("#1F2937");
    } else if (isSelected) {
      opacityTarget = 1;
      lineOpacityTarget = 0.95;
      lineColorTarget.set("#FFD700"); // gold edge lines
    } else if (isDimmed) {
      if (isHovered) {
        opacityTarget = 0.7;
        lineOpacityTarget = 0.65;
        lineColorTarget.set("#1F2937");
      } else {
        opacityTarget = 0.25;
        lineOpacityTarget = 0.25;
        lineColorTarget.set("#1F2937");
      }
    } else {
      opacityTarget = layer.name.includes("空气") ? 0.3 : 1;
      lineOpacityTarget = isHovered ? 0.85 : 0.45;
      lineColorTarget.set("#1F2937");
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
          <Suspense fallback={<PlaceholderLayer thickness={layer.thickness} color={layer.color} />}>
            <GLBModelRenderer
              modelPath={layer.modelPath}
              objectName={layerObjectName}
              excludeNames={excludeNames}
              interactive={interactive}
              onPointerOver={isLocked ? undefined : onPointerOver}
              onPointerOut={isLocked ? undefined : onPointerOut}
              onClick={isLocked ? undefined : onClick}
            />
          </Suspense>
        </group>
      ) : (
        <mesh
          ref={meshRef}
          onPointerOver={isLocked ? undefined : onPointerOver}
          onPointerOut={isLocked ? undefined : onPointerOut}
          onClick={isLocked ? undefined : (e) => {
            e.stopPropagation();
            onClick?.(e);
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
              color="#1F2937"
              linewidth={1}
              transparent
              opacity={0.45}
              polygonOffset
              polygonOffsetFactor={1}
              polygonOffsetUnits={1}
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
