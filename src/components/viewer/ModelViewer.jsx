import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import * as THREE from "three";
import ConstructionLayer from "./ConstructionLayer";
import ExplosionLabels from "./ExplosionLabels";

const EXPLODE_STEP = 0.003;
const EXPLODE_LERP = 1.0;   // slow explode speed, ~3s to 95%

function getExplodedBounds(layers, axis = "x", t = 1) {
  const dir = axis.startsWith("-") ? -1 : 1;
  const cleanAxis = axis.replace("-", "");
  let offset = 0;
  const total = layers.reduce((s, l) => s + l.thickness, 0);
  let minV = Infinity;
  let maxV = -Infinity;

  layers.forEach((layer, i) => {
    const half = layer.thickness / 2;
    const base = offset + half - total / 2;
    const exploded = base + i * dir * t * 100 * EXPLODE_STEP;
    minV = Math.min(minV, exploded - half);
    maxV = Math.max(maxV, exploded + half);
    offset += layer.thickness;
  });

  const center = (minV + maxV) / 2;
  const span = maxV - minV;
  return { center, span, axis: cleanAxis, isX: cleanAxis === "x" };
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
    gl.shadowMap.type = THREE.PCFShadowMap;  // faster than PCFSoft
    gl.toneMapping = THREE.CineonToneMapping;
    gl.toneMappingExposure = 0.9;
  }, [gl]);

  return null;
}

function WallAssembly({
  layers,
  explodeValue,
  explodeAxis,
  floatDirection,
  floatDistance,
  hoveredLayer,
  selectedLayer,
  onHoverLayer,
  onLayerClick,
  wallRef,
  smoothExplodeRef,
}) {
  const groupRefs = useRef([]);

  const useModelPositions = layers[0]?.layerObjectName != null;
  const hasExplosion = explodeAxis != null;

  const initialPositions = useMemo(() => {
    if (useModelPositions) return layers.map(() => 0);

    let offset = 0;
    const total = layers.reduce((sum, l) => sum + l.thickness, 0);
    return layers.map((layer) => {
      const pos = offset + layer.thickness / 2 - total / 2;
      offset += layer.thickness;
      return pos;
    });
  }, [layers, useModelPositions]);

  const explodeDir = hasExplosion ? (explodeAxis.startsWith("-") ? -1 : 1) : 1;
  const cleanAxis = hasExplosion ? explodeAxis.replace("-", "") : "x";
  const isX = cleanAxis === "x";
  const hasSelection = selectedLayer !== null && selectedLayer !== undefined;

  useFrame((_, delta) => {
    const target = hasExplosion ? explodeValue : 0;
    const alpha = 1 - Math.exp(-EXPLODE_LERP * delta);
    smoothExplodeRef.current += (target - smoothExplodeRef.current) * alpha;

    layers.forEach((layer, i) => {
      const grp = groupRefs.current[i];
      if (grp) {
        const off = i * explodeDir * smoothExplodeRef.current * EXPLODE_STEP;
        if (isX) {
          grp.position.x = initialPositions[i] + off;
          grp.position.y = 0;
        } else {
          grp.position.y = initialPositions[i] + off;
          grp.position.x = 0;
        }
      }
    });
  });

  return (
    <group ref={wallRef}>
      {layers.map((layer, i) => (
        <group
          key={layer.name}
          ref={(el) => (groupRefs.current[i] = el)}
          position={[isX ? initialPositions[i] : 0, isX ? 0 : initialPositions[i], 0]}
        >
          <ConstructionLayer
            layer={layer}
            isHovered={hoveredLayer === i}
            isSelected={selectedLayer === i}
            isDimmed={hasSelection && selectedLayer !== i}
            explodeValue={explodeValue}
            floatDirection={floatDirection}
            floatDistance={floatDistance}
            onPointerOver={() => onHoverLayer(i)}
            onPointerOut={() => onHoverLayer(null)}
            onClick={(e) => onLayerClick(i, layer, e)}
          />
        </group>
      ))}
    </group>
  );
}

function CameraAdjuster({ layers, autoRotate, explodeAxis, smoothExplodeRef, onControlsReady }) {
  const { camera } = useThree();
  const controlsRef = useRef(null);
  const userInteracting = useRef(false);

  const explodedTarget = useRef(new THREE.Vector3());
  const defaultTarget = useRef(new THREE.Vector3());
  const cacheReady = useRef(false);
  const hasExplosion = explodeAxis != null;

  /* set up on first frame */
  if (!cacheReady.current && controlsRef.current) {
    defaultTarget.current.copy(controlsRef.current.target);

    if (hasExplosion) {
      const { center, isX } = getExplodedBounds(layers, explodeAxis);
      explodedTarget.current.set(isX ? center : 0, isX ? 0 : center, 0);
    }
    cacheReady.current = true;
  }

  /* only lerp controls.target — never touch camera.position.
     OrbitControls owns the camera and will orbit around the shifting target
     without any direction change. */
  useFrame((_, delta) => {
    const ctrl = controlsRef.current;
    if (!ctrl || !cacheReady.current || userInteracting.current) return;

    if (!hasExplosion) return; // no explosion → keep default target

    const t = smoothExplodeRef.current / 100;
    const goal = new THREE.Vector3().lerpVectors(
      defaultTarget.current,
      explodedTarget.current,
      t
    );

    const alpha = 1 - Math.exp(-8.0 * delta);
    ctrl.target.lerp(goal, alpha);
  });

  return (
    <OrbitControls
      ref={(el) => {
        controlsRef.current = el;
        globalControls = el;  /* for PanSyncController */
        if (el && onControlsReady) onControlsReady(el);
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
        userInteracting.current = true;
      }}
      onEnd={() => {
        userInteracting.current = false;
      }}
    />
  );
}

function ShadowLight({ layers, explodeAxis, smoothExplodeRef }) {
  const lightRef = useRef();
  const lastTRef = useRef(-1);
  const hasExplosion = explodeAxis != null;

  useFrame(() => {
    const light = lightRef.current;
    if (!light || !layers?.length) return;
    if (!hasExplosion) return; // no explosion → keep default shadow camera

    const t = smoothExplodeRef.current / 100;
    if (Math.abs(t - lastTRef.current) < 0.005) return;
    lastTRef.current = t;

    const { center, span, isX } = getExplodedBounds(layers, explodeAxis, t);

    const pad = Math.max(span * 0.3, 2);
    const half = span / 2 + pad;

    if (isX) {
      light.shadow.camera.left = center - half;
      light.shadow.camera.right = center + half;
      light.shadow.camera.top = half;
      light.shadow.camera.bottom = -half;
    } else {
      light.shadow.camera.left = -half;
      light.shadow.camera.right = half;
      light.shadow.camera.top = center + half;
      light.shadow.camera.bottom = center - half;
    }
    light.shadow.camera.updateProjectionMatrix();
  });

  return (
    <directionalLight
      ref={lightRef}
      position={[8, 12, 6]}
      intensity={2.5}
      color="#fffdf7"
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-near={0.5}
      shadow-camera-far={30}
      shadow-camera-left={-8}
      shadow-camera-right={8}
      shadow-camera-top={8}
      shadow-camera-bottom={-8}
      shadow-bias={-0.0002}
    />
  );
}

function DebugInfo({ nodeTitle, modelRotation, layerOrderReverse }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    console.log(
      `%c[节点加载] %c${nodeTitle || "(未命名)"}`,
      "font-weight:bold;color:#ff3d58",
      "font-weight:bold;color:#333"
    );
    console.log(`  modelRotation: [${(modelRotation || [0, 0, 0]).join(", ")}]`);
    console.log(`  layerOrderReverse: ${layerOrderReverse ?? false}`);

    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [nodeTitle, modelRotation, layerOrderReverse]);

  if (!visible) return null;
  return <axesHelper args={[1.5]} />;
}

/* ── module-level ref so PanSyncController can reach OrbitControls ── */
let globalControls = null;

/* ── sync diagram pan to 3D camera rotation ── */
const MAX_AZIMUTH = Math.PI / 3;   /* ±60° */
const MAX_POLAR   = Math.PI / 6;   /* ±30° */

function PanSyncController({ panOffset }) {
  const { camera } = useThree();
  const baseSph = useRef(null);

  useFrame(() => {
    if (!panOffset || !globalControls) return;
    const ctrl = globalControls;
    const { x, y, w, h } = panOffset;
    if (!w || !h) return;

    /* init on first frame */
    if (!baseSph.current) {
      const sph = new THREE.Spherical().setFromVector3(camera.position.clone().sub(ctrl.target));
      baseSph.current = { radius: sph.radius, phi: sph.phi, theta: sph.theta };
      return;
    }

    const base = baseSph.current;
    /* pan (+x drags image right) → camera rotates left (-theta) */
    const targetTheta = base.theta - (x / w) * MAX_AZIMUTH;
    const targetPhi   = base.phi   - (y / h) * MAX_POLAR;

    const cur = new THREE.Spherical().setFromVector3(camera.position.clone().sub(ctrl.target));
    const a = 0.12;
    const newTheta = cur.theta + (targetTheta - cur.theta) * a;
    const newPhi   = cur.phi   + (targetPhi   - cur.phi)   * a;
    const pos = new THREE.Vector3().setFromSpherical(new THREE.Spherical(base.radius, newPhi, newTheta)).add(ctrl.target);
    camera.position.lerp(pos, 0.3);
    ctrl.update();
  });

  return null;
}

/* ── sync diagram scale to 3D camera distance ── */
function SyncZoomAdjuster({ syncScale }) {
  const { camera } = useThree();
  const baseDist = useRef(0);
  const init = useRef(false);

  useFrame(() => {
    if (!init.current) {
      baseDist.current = camera.position.length();
      init.current = true;
      return;
    }
    const targetDist = baseDist.current / syncScale;
    /* lerp for smooth transition */
    const alpha = 0.15;
    const currentDist = camera.position.length();
    const ratio = targetDist / currentDist;
    const lerped = currentDist + (targetDist - currentDist) * alpha;
    const newRatio = lerped / currentDist;
    camera.position.multiplyScalar(newRatio);
  });

  return null;
}

function Scene({
  layers,
  explodeValue,
  explodeAxis,
  floatDirection,
  floatDistance,
  modelRotation,
  nodeTitle,
  layerOrderReverse,
  hoveredLayer,
  selectedLayer,
  onHoverLayer,
  onLayerClick,
  autoRotate,
  onControlsReady,
  showLabels,
  syncScale,
  panOffset,
}) {
  const wallRef = useRef();
  const smoothExplodeRef = useRef(0);

  return (
    <>
      <RendererSetup />

      <color attach="background" args={["#f5f5f7"]} />

      {/* sync camera zoom with diagram scale */}
      {syncScale != null && <SyncZoomAdjuster syncScale={syncScale} />}
      {/* sync camera pan with diagram drag */}
      {panOffset != null && <PanSyncController panOffset={panOffset} />}

      <ambientLight intensity={1.2} color="#ffffff" />

      <ShadowLight layers={layers} explodeAxis={explodeAxis} smoothExplodeRef={smoothExplodeRef} />

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

      <DebugInfo
        nodeTitle={nodeTitle}
        modelRotation={modelRotation}
        layerOrderReverse={layerOrderReverse}
      />

      <group rotation={modelRotation}>
        <WallAssembly
          layers={layers}
          explodeValue={explodeValue}
          explodeAxis={explodeAxis}
          floatDirection={floatDirection}
          floatDistance={floatDistance}
          hoveredLayer={hoveredLayer}
          selectedLayer={selectedLayer}
          onHoverLayer={onHoverLayer}
          onLayerClick={onLayerClick}
          wallRef={wallRef}
          smoothExplodeRef={smoothExplodeRef}
        />
        {explodeAxis != null && (
          <ExplosionLabels
            layers={layers}
            explodeValue={explodeValue}
            explodeAxis={explodeAxis}
            activeLayer={selectedLayer}
            showLabels={showLabels}
            onLabelClick={onLayerClick}
          />
        )}
      </group>

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
        autoRotate={autoRotate}
        explodeAxis={explodeAxis}
        smoothExplodeRef={smoothExplodeRef}
        onControlsReady={onControlsReady}
      />
    </>
  );
}

function ModelViewer({
  layers,
  explodeValue,
  explodeAxis,
  floatDirection,
  floatDistance,
  modelRotation = [0, 0, 0],
  nodeTitle,
  layerOrderReverse,
  cameraPosition = [1.2, 1.6, 2.8],
  onControlsReady,
  autoRotate,
  hoveredLayer,
  selectedLayer,
  onHoverLayer,
  onLayerClick,
  onBlankClick,
  showLabels,
  syncScale,
  panOffset,
}) {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <Canvas
        camera={{ near: 1, far: 100, position: cameraPosition, fov: 40 }}
        dpr={[1, 1.5]}
        shadows
        gl={{ preserveDrawingBuffer: true, antialias: true, alpha: false }}
        onPointerMissed={onBlankClick}
      >
        <Scene
          layers={layers}
          explodeValue={explodeValue}
          explodeAxis={explodeAxis}
          floatDirection={floatDirection}
          floatDistance={floatDistance}
          modelRotation={modelRotation}
          nodeTitle={nodeTitle}
          layerOrderReverse={layerOrderReverse}
          onControlsReady={onControlsReady}
          hoveredLayer={hoveredLayer}
          selectedLayer={selectedLayer}
          onHoverLayer={onHoverLayer}
          onLayerClick={onLayerClick}
          autoRotate={autoRotate}
          syncScale={syncScale}
          panOffset={panOffset}
          showLabels={showLabels}
        />
      </Canvas>
    </div>
  );
}

export default ModelViewer;
