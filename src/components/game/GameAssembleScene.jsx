import { useState, useMemo, useCallback, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import DraggableLayer from "./DraggableLayer";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function SceneContent({ nodeData, onComplete, resetKey }) {
  const { layers, explodeAxis = "x" } = nodeData;
  const lockAxis = explodeAxis;
  const controlsRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  /* target positions with gaps between layers */
  const GAP = 0.12;
  const targetPositions = useMemo(() => {
    let offset = 0;
    const total = layers.reduce((s, l) => s + l.thickness + GAP, 0) - GAP;
    return layers.map((layer) => {
      const pos = offset + layer.thickness / 2 - total / 2;
      offset += layer.thickness + GAP;
      return lockAxis === "y" ? [0, pos, 0] : [pos, 0, 0];
    });
  }, [layers, lockAxis]);

  /* shuffled start positions — each layer gets a random slot */
  const startPositions = useMemo(() => {
    return shuffle(targetPositions.map((tp, i) => ({ pos: tp, origIdx: i })))
      .map((item) => item.pos);
  }, [targetPositions]);

  /* which slot indices are locked (correct layer placed there) */
  const [lockedSlots, setLockedSlots] = useState(new Set());
  const [done, setDone] = useState(false);

  const handlePlaced = useCallback((layerIndex, slotIndex) => {
    setLockedSlots((prev) => {
      const next = new Set(prev);
      if (slotIndex === layerIndex) {
        next.add(slotIndex);
        if (next.size >= layers.length) {
          setDone(true);
          setTimeout(() => onComplete?.(), 600);
        }
      }
      return next;
    });
  }, [layers.length, onComplete]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    if (controlsRef.current) controlsRef.current.enabled = false;
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    if (controlsRef.current) controlsRef.current.enabled = true;
  }, []);

  return (
    <>
      <color attach="background" args={["#f5f5f7"]} />
      <ambientLight intensity={1.0} color="#ffffff" />
      <directionalLight position={[8, 10, 6]} intensity={1.8} color="#fffdf7" castShadow />
      <directionalLight position={[-4, 2, -3]} intensity={0.4} color="#d4e3f0" />

      <OrbitControls
        ref={(el) => { controlsRef.current = el; }}
        enableDamping
        dampingFactor={0.08}
        minDistance={2}
        maxDistance={10}
        target={[0, 1, 0]}
      />

      <Grid
        position={[0, -1.5, 0]}
        args={[10, 10]}
        cellSize={0.2}
        cellColor="#e5e7eb"
        sectionSize={1}
        sectionColor="#d1d5db"
        fadeDistance={10}
        infinite
      />

      {layers.map((layer, i) => (
        <DraggableLayer
          key={`${layer.name}-${resetKey}`}
          layer={layer}
          layerIndex={i}
          targetPos={targetPositions[i]}
          startPos={startPositions[i]}
          allSlots={targetPositions}
          lockedSlots={lockedSlots}
          lockAxis={lockAxis}
          isPlaced={lockedSlots.has(i)}
          onPlaced={(slotIdx) => handlePlaced(i, slotIdx)}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        />
      ))}

      {done && <Celebration />}
    </>
  );
}

function GameAssembleScene({ nodeData, onComplete, resetKey }) {
  return (
    <Canvas
      camera={{ position: [2.5, 2.2, 4.5], fov: 40, near: 0.5, far: 100 }}
      shadows
      gl={{ antialias: true }}
    >
      <SceneContent nodeData={nodeData} onComplete={onComplete} resetKey={resetKey} />
    </Canvas>
  );
}

function Celebration() {
  return (
    <mesh position={[0, 1.5, 0]}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshBasicMaterial color="#D4A43A" transparent opacity={0.6} />
    </mesh>
  );
}

export default GameAssembleScene;
