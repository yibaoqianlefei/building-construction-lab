import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Grid, Html } from "@react-three/drei";
import * as THREE from "three";
import ConstructionLayer from "./ConstructionLayer";

const EXPLODE_STEP = 0.003;
const LERP_SPEED = 3.5;
const LERP_DONE = 0.005;

function getExplodedBounds(layers) {
  let xOffset = 0;
  const totalWidth = layers.reduce((s, l) => s + l.thickness, 0);
  let minX = Infinity;
  let maxX = -Infinity;

  layers.forEach((layer, i) => {
    const half = layer.thickness / 2;
    const baseX = xOffset + half - totalWidth / 2;
    const cx = baseX + i * 100 * EXPLODE_STEP;
    minX = Math.min(minX, cx - half);
    maxX = Math.max(maxX, cx + half);
    xOffset += layer.thickness;
  });

  const centerX = (minX + maxX) / 2;
  const width = maxX - minX;
  return { centerX, width };
}

function ShadowPlane() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.78, 0]}
      receiveShadow
    >
      <planeGeometry args={[8, 8]} />
      <shadowMaterial opacity={0.3} />
    </mesh>
  );
}

function RendererSetup() {
  const { gl } = useThree();

  useEffect(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.toneMapping = THREE.CineonToneMapping;
    gl.toneMappingExposure = 0.9;
  }, [gl]);

  return null;
}

function WallAssembly({
  layers,
  explodeValue,
  hoveredLayer,
  selectedLayer,
  onHoverLayer,
  onLayerClick,
  wallRef,
}) {
  const groupRefs = useRef([]);
  const smoothExplode = useRef(0);

  const initialPositions = useMemo(() => {
    let xOffset = 0;
    const totalWidth = layers.reduce((sum, l) => sum + l.thickness, 0);
    return layers.map((layer) => {
      const x = xOffset + layer.thickness / 2 - totalWidth / 2;
      xOffset += layer.thickness;
      return x;
    });
  }, [layers]);

  useFrame((_, delta) => {
    const target = explodeValue;
    smoothExplode.current +=
      (target - smoothExplode.current) * Math.min(delta * 8, 1);

    layers.forEach((layer, i) => {
      const grp = groupRefs.current[i];
      if (grp) {
        grp.position.x =
          initialPositions[i] + i * smoothExplode.current * EXPLODE_STEP;
      }
    });
  });

  return (
    <group ref={wallRef}>
      {layers.map((layer, i) => (
        <group
          key={layer.name}
          ref={(el) => (groupRefs.current[i] = el)}
          position={[initialPositions[i], 0, 0]}
        >
          <ConstructionLayer
            layer={layer}
            isHovered={hoveredLayer === i}
            isSelected={selectedLayer === i}
            explodeValue={explodeValue}
            onPointerOver={() => onHoverLayer(i)}
            onPointerOut={() => onHoverLayer(null)}
            onClick={(e) => onLayerClick(i, layer, e)}
          />
        </group>
      ))}
    </group>
  );
}

function DirectionIndicator({ layers }) {
  const totalWidth = layers.reduce((sum, l) => sum + l.thickness, 0);
  const leftEdge = -totalWidth / 2;
  const rightEdge = totalWidth / 2;
  const y = -1.05;
  const z = 0;

  return (
    <>
      <Html position={[leftEdge, y, z]} center>
        <div className="text-gray-500 text-[10px] whitespace-nowrap select-none bg-white/75 backdrop-blur-sm px-2 py-0.5 rounded-sm border border-gray-200/60">
          室内
        </div>
      </Html>
      <Html position={[rightEdge, y, z]} center>
        <div className="text-gray-500 text-[10px] whitespace-nowrap select-none bg-white/75 backdrop-blur-sm px-2 py-0.5 rounded-sm border border-gray-200/60">
          室外
        </div>
      </Html>

      <mesh position={[0, y + 0.12, z]}>
        <boxGeometry args={[totalWidth + 0.1, 0.012, 0.012]} />
        <meshStandardMaterial color="#9CA3AF" />
      </mesh>

      <mesh
        position={[leftEdge - 0.08, y + 0.12, z]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <coneGeometry args={[0.04, 0.08, 8]} />
        <meshStandardMaterial color="#9CA3AF" />
      </mesh>
      <mesh
        position={[rightEdge + 0.08, y + 0.12, z]}
        rotation={[0, 0, -Math.PI / 2]}
      >
        <coneGeometry args={[0.04, 0.08, 8]} />
        <meshStandardMaterial color="#9CA3AF" />
      </mesh>
    </>
  );
}

function CameraAdjuster({ layers, explodeValue, autoRotate }) {
  const { camera } = useThree();
  const controlsRef = useRef(null);
  const isTransitioning = useRef(false);

  /* fixed goal target; lerp controls.target toward it each frame.
     camera.position stays under OrbitControls full control so autoRotate
     never stops. */
  const goalTgt = useRef(new THREE.Vector3(0, 0, 0));

  /* original target for restore */
  const origTgt = useRef(new THREE.Vector3(0, 0, 0));
  const originalsSaved = useRef(false);

  /* per-frame lerp — only guides controls.target; OrbitControls
     continues to own camera.position so autoRotate never stops */
  useFrame((_, delta) => {
    const ctrl = controlsRef.current;
    if (!ctrl || !isTransitioning.current) return;

    const alpha = 1 - Math.exp(-LERP_SPEED * delta);
    ctrl.target.lerp(goalTgt.current, alpha);

    if (ctrl.target.distanceTo(goalTgt.current) < LERP_DONE) {
      isTransitioning.current = false;
    }
  });

  /* trigger transition on explode / un-explode */
  const wasExploded = useRef(false);
  useEffect(() => {
    const isExploded = explodeValue >= 99;
    if ((isExploded && !wasExploded.current) || (!isExploded && wasExploded.current)) {
      if (isExploded) {
        if (!originalsSaved.current) {
          const ctrl = controlsRef.current;
          origTgt.current.copy(ctrl ? ctrl.target : new THREE.Vector3(0, 0, 0));
          originalsSaved.current = true;
        }

        const { centerX } = getExplodedBounds(layers);
        goalTgt.current.set(centerX, 0, 0);
        isTransitioning.current = true;
      } else if (originalsSaved.current) {
        goalTgt.current.copy(origTgt.current);
        isTransitioning.current = true;
      }
    }
    wasExploded.current = isExploded;
  }, [explodeValue, layers, camera]);

  return (
    <OrbitControls
      ref={(el) => {
        controlsRef.current = el;
      }}
      enableDamping
      dampingFactor={0.08}
      minDistance={0.8}
      maxDistance={12}
      maxPolarAngle={Math.PI * 0.7}
      target={[0, 0, 0]}
      autoRotate={autoRotate}
      autoRotateSpeed={0.5}
      onStart={() => {
        isTransitioning.current = false;
      }}
    />
  );
}

function ShadowLight({ targetRef }) {
  const lightRef = useRef();

  return (
    <directionalLight
      ref={lightRef}
      position={[8, 12, 6]}
      intensity={2.5}
      color="#fffdf7"
      castShadow
      shadow-mapSize-width={4096}
      shadow-mapSize-height={4096}
      shadow-camera-near={0.5}
      shadow-camera-far={30}
      shadow-camera-left={-8}
      shadow-camera-right={8}
      shadow-camera-top={8}
      shadow-camera-bottom={-8}
      shadow-bias={-0.00015}
    />
  );
}

function Scene({
  layers,
  explodeValue,
  hoveredLayer,
  selectedLayer,
  onHoverLayer,
  onLayerClick,
  autoRotate,
}) {
  const wallRef = useRef();

  return (
    <>
      <RendererSetup />

      <color attach="background" args={["#f5f5f7"]} />

      <ambientLight intensity={1.2} color="#ffffff" />

      <ShadowLight targetRef={wallRef} />

      <directionalLight
        position={[-6, 3, -4]}
        intensity={0.8}
        color="#d4e3f0"
      />

      <directionalLight
        position={[0, 10, 2]}
        intensity={0.6}
        color="#ffffff"
      />

      <ShadowPlane />

      <WallAssembly
        layers={layers}
        explodeValue={explodeValue}
        hoveredLayer={hoveredLayer}
        selectedLayer={selectedLayer}
        onHoverLayer={onHoverLayer}
        onLayerClick={onLayerClick}
        wallRef={wallRef}
      />

      <DirectionIndicator layers={layers} />

      <Grid
        position={[0, -1.2, 0]}
        args={[10, 10]}
        cellSize={0.2}
        cellThickness={0.5}
        cellColor="#e5e7eb"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#d1d5db"
        fadeDistance={8}
        infinite
      />

      <CameraAdjuster
        layers={layers}
        explodeValue={explodeValue}
        autoRotate={autoRotate}
      />
    </>
  );
}

function ModelViewer({
  layers,
  explodeValue,
  autoRotate,
  hoveredLayer,
  selectedLayer,
  onHoverLayer,
  onLayerClick,
  onBlankClick,
}) {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <Canvas
        camera={{ near: 1, far: 100, position: [1.2, 1.6, 2.8], fov: 40 }}
        shadows
        gl={{ antialias: true, alpha: false }}
        onPointerMissed={onBlankClick}
      >
        <Scene
          layers={layers}
          explodeValue={explodeValue}
          hoveredLayer={hoveredLayer}
          selectedLayer={selectedLayer}
          onHoverLayer={onHoverLayer}
          onLayerClick={onLayerClick}
          autoRotate={autoRotate}
        />
      </Canvas>
    </div>
  );
}

export default ModelViewer;
