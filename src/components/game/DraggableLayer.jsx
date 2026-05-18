import { useRef, useMemo, useEffect } from "react";
import { Edges, DragControls } from "@react-three/drei";
import * as THREE from "three";

const SNAP_DIST = 0.2;

function DraggableLayer({
  layer,
  layerIndex,
  targetPos,
  startPos,
  allSlots,
  lockedSlots,
  lockAxis,
  isPlaced,
  onPlaced,
  onDragStart,
  onDragEnd,
}) {
  const meshRef = useRef();
  const meshPos = useRef(new THREE.Vector3(...startPos));
  const targetVec = useMemo(() => new THREE.Vector3(...targetPos), [targetPos]);
  const slotVecs = useMemo(() => allSlots.map((s) => new THREE.Vector3(...s)), [allSlots]);

  /* set initial position once */
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...startPos);
      meshPos.current.set(...startPos);
    }
  }, []);

  function getAxisVal(v, axis) {
    if (axis === "x") return v.x;
    if (axis === "y") return v.y;
    return v.z;
  }

  function clampOnAxis(pos, axis) {
    const base = getAxisVal(targetVec, axis);
    if (axis === "x") pos.x = THREE.MathUtils.clamp(pos.x, base - 2, base + 2);
    if (axis === "y") pos.y = THREE.MathUtils.clamp(pos.y, base - 2, base + 2);
    if (axis === "z") pos.z = THREE.MathUtils.clamp(pos.z, base - 2, base + 2);
    /* lock off-axis */
    if (axis !== "x") pos.x = targetVec.x;
    if (axis !== "y") pos.y = targetVec.y;
    if (axis !== "z") pos.z = targetVec.z;
    return pos;
  }

  function handleDragStart() {
    if (isPlaced) return;
    if (meshRef.current) meshPos.current.copy(meshRef.current.position);
    onDragStart?.();
  }

  function handleDrag(_local, _dl, _world, deltaWorld) {
    if (isPlaced || !meshRef.current) return;
    const next = meshPos.current.clone().add(deltaWorld);
    clampOnAxis(next, lockAxis);
    meshPos.current.copy(next);
    meshRef.current.position.copy(next);
  }

  function handleDragEnd() {
    onDragEnd?.();
    if (isPlaced || !meshRef.current) return;

    const pos = meshRef.current.position;
    let bestIdx = -1;
    let bestDist = Infinity;

    slotVecs.forEach((sv, idx) => {
      if (lockedSlots.has(idx)) return;
      /* only compare distance along the constrained axis */
      const d = Math.abs(getAxisVal(pos, lockAxis) - getAxisVal(sv, lockAxis));
      if (d < bestDist) { bestDist = d; bestIdx = idx; }
    });

    if (bestIdx >= 0 && bestDist < SNAP_DIST) {
      pos.copy(slotVecs[bestIdx]);
      meshPos.current.copy(pos);
      if (bestIdx === layerIndex) {
        onPlaced?.(bestIdx);
      }
    }
  }

  return (
    <DragControls
      axis={lockAxis}
      autoTransform={false}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
    >
      <mesh
        ref={meshRef}
        castShadow
      >
        <boxGeometry args={[layer.thickness, 1.2, 0.6]} />
        <meshStandardMaterial
          color={layer.color}
          roughness={0.5}
          metalness={0.05}
          transparent={layer.name.includes("空气")}
          opacity={layer.name.includes("空气") ? 0.3 : 1}
        />
        <Edges scale={1}>
          <lineBasicMaterial
            color={isPlaced ? "#D4A43A" : "#6B7280"}
            transparent
            opacity={isPlaced ? 0.9 : 0.5}
          />
        </Edges>
      </mesh>
    </DragControls>
  );
}

export default DraggableLayer;
