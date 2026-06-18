import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import * as THREE from "three";
import ConstructionLayer from "./ConstructionLayer";
import ExplosionLabels from "./ExplosionLabels";
import SpatialLabel from "./SpatialLabel";
import { ExplosionEngine } from "../../core/ExplosionEngine";
import SceneRuntimeRunner from "../../runtime/SceneRuntimeRunner";

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

const CANDIDATE_DIRS = [
  [1, 0, 0], [-1, 0, 0],
  [0, 1, 0], [0, -1, 0],
  [0, 0, 1], [0, 0, -1],
];

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
  useEngine = false,
}) {
  const groupRefs = useRef([]);
  const groupRefsById = useRef({}); // ID-keyed refs for ExplosionEngine
  const computedDirs = useRef(null); // cached per-layer direction vectors
  const dirsReady = useRef(false);
  const engineRef = useRef(null);             // ExplosionEngine instance
  const layersVersionRef = useRef(0);          // track layers changes for rebuild
  const debugLoggedRef = useRef(false);        // throttle debug logging

  const useModelPositions = layers[0]?.layerObjectName != null;
  const hasExplosion = explodeAxis != null;
  const isIndividual = hasExplosion && (explodeAxis === "individual" || layers.some(l => l.explodeDirection != null));

  const initialPositions = useMemo(() => {
    if (useModelPositions || isIndividual) return layers.map(() => 0);
    let offset = 0;
    const total = layers.reduce((sum, l) => sum + l.thickness, 0);
    return layers.map((layer) => {
      const pos = offset + layer.thickness / 2 - total / 2;
      offset += layer.thickness;
      return pos;
    });
  }, [layers, useModelPositions, isIndividual]);

  const explodeDir = hasExplosion && !isIndividual ? (explodeAxis.startsWith("-") ? -1 : 1) : 1;
  const cleanAxis = hasExplosion && !isIndividual ? explodeAxis.replace("-", "") : "x";
  const isX = cleanAxis === "x";
  const hasSelection = selectedLayer !== null && selectedLayer !== undefined;

  /* ── auto direction computation (one-time, delayed until models load) ── */
  const tryComputeAutoDirs = () => {
    if (dirsReady.current || !isIndividual) return;
    // wait until all interactive layer refs have children (models loaded)
    const interactiveIndices = layers
      .map((l, i) => (l.explodeDirection != null && l.interactive !== false ? i : -1))
      .filter(i => i >= 0);
    const allReady = interactiveIndices.every(i => {
      const grp = groupRefs.current[i];
      return grp && grp.children.length > 0;
    });
    if (!allReady || interactiveIndices.length === 0) return;

    // compute static bounding box (non-interactive layer)
    const staticBox = new THREE.Box3();
    layers.forEach((l, i) => {
      if (l.explodeDirection != null && l.interactive !== false) return;
      const grp = groupRefs.current[i];
      if (grp) staticBox.expandByObject(grp);
    });

    // for each interactive layer, test directions
    const dirs = new Array(layers.length).fill(null);
    interactiveIndices.forEach(i => {
      const grp = groupRefs.current[i];
      if (!grp) return;
      const myBox = new THREE.Box3().setFromObject(grp);
      const testBox = myBox.clone();
      const dist = layers[i].explodeDistance || 0.25;

      let bestDir = [0, 1, 0]; // default: up
      let bestOverlap = Infinity;

      for (const d of CANDIDATE_DIRS) {
        const vec = new THREE.Vector3(d[0], d[1], d[2]);
        testBox.copy(myBox).translate(vec.clone().multiplyScalar(dist));
        if (!testBox.intersectsBox(staticBox)) {
          bestDir = d;
          break; // first non-overlapping direction wins
        }
        // track best partial overlap
        const overlapBox = testBox.clone().intersect(staticBox);
        const overlapVol = overlapBox.isEmpty() ? 0 :
          (overlapBox.max.x - overlapBox.min.x) *
          (overlapBox.max.y - overlapBox.min.y) *
          (overlapBox.max.z - overlapBox.min.z);
        if (overlapVol < bestOverlap) {
          bestOverlap = overlapVol;
          bestDir = d;
        }
      }
      dirs[i] = new THREE.Vector3(bestDir[0], bestDir[1], bestDir[2]);
    });

    computedDirs.current = dirs;
    dirsReady.current = true;
  };

  useFrame((_, delta) => {
    const target = hasExplosion ? explodeValue : 0;

    /* ── Lazy init engine ── */
    if (useEngine && !engineRef.current) {
      engineRef.current = new ExplosionEngine();
    }

    /* ── Engine rebuild when layers/axis change ── */
    if (useEngine && engineRef.current) {
      const version = layers.map(l => l.name).join("|") + "|" + (explodeAxis || "none");
      if (version !== layersVersionRef.current) {
        layersVersionRef.current = version;
        engineRef.current.rebuild(layers, explodeAxis, groupRefsById.current);
      }
    }

    const alpha = 1 - Math.exp(-EXPLODE_LERP * delta);
    smoothExplodeRef.current += (target - smoothExplodeRef.current) * alpha;

    // try compute auto dirs once models are loaded
    if (!dirsReady.current) tryComputeAutoDirs();

    const t = smoothExplodeRef.current / 100;

    /* ── Engine tick (parallel, independent smoothing) ── */
    let engineT = 0;
    if (useEngine && engineRef.current) {
      engineT = engineRef.current.tick(delta, target);
    }

    /* ── Debug: reset log throttle every 120 frames (~2s at 60fps) ── */
    const frame = Math.floor(Date.now() / 2000); // ~2s throttle
    if (frame !== debugLoggedRef.current) {
      debugLoggedRef.current = frame;
    }

    layers.forEach((layer, i) => {
      const grp = groupRefs.current[i];
      if (!grp) return;

      /* ── OLD position (always computed for debug) ── */
      let oldPos;
      if (isIndividual) {
        const dir = computedDirs.current?.[i];
        const dist = layer.explodeDistance || 0;
        if (dir && dist > 0) {
          oldPos = [
            initialPositions[i] + dir.x * dist * t,
            initialPositions[i] + dir.y * dist * t,
            initialPositions[i] + dir.z * dist * t,
          ];
        } else {
          oldPos = [0, 0, 0];
        }
      } else {
        const off = i * explodeDir * smoothExplodeRef.current * EXPLODE_STEP;
        if (isX) {
          oldPos = [initialPositions[i] + off, 0, 0];
        } else {
          oldPos = [0, initialPositions[i] + off, 0];
        }
      }

      /* ── NEW engine position ── */
      if (useEngine && engineRef.current) {
        const layerId = `${layer.name || "layer"}-${i}`;
        const enginePos = engineRef.current.getLayerOffset(layerId);

        /* ── Debug: compare OLD vs NEW ── */
        if ((i === 0 || i === layers.length - 1) && engineT > 0) {
          console.log(
            `[Engine] Layer ${i} "${layerId}" (t=${engineT.toFixed(3)})`,
            "OLD:", oldPos.map(v => v.toFixed(4)),
            "NEW:", enginePos.map(v => v.toFixed(4)),
          );
        }

        /* Use engine position */
        grp.position.set(enginePos[0], enginePos[1], enginePos[2]);
      } else {
        /* Use old position (default path) */
        if (isIndividual) {
          grp.position.set(oldPos[0], oldPos[1], oldPos[2]);
        } else {
          if (isX) {
            grp.position.x = oldPos[0];
            grp.position.y = 0;
          } else {
            grp.position.y = oldPos[1];
            grp.position.x = 0;
          }
        }
      }
    });
  });

  return (
    <group ref={wallRef}>
      {layers.map((layer, i) => {
        const layerId = `${layer.name || "layer"}-${i}`;
        return (
        <group
          key={layer.name}
          ref={(el) => {
            groupRefs.current[i] = el;
            if (useEngine) groupRefsById.current[layerId] = el;
          }}
          position={[isX && !isIndividual ? initialPositions[i] : 0, isX || isIndividual ? 0 : initialPositions[i], 0]}
        >
          <ConstructionLayer
            layer={layer}
            isHovered={hoveredLayer === i}
            isSelected={selectedLayer === i}
            isDimmed={hasSelection && selectedLayer !== i}
            explodeValue={explodeValue}
            floatDirection={floatDirection}
            floatDistance={floatDistance}
            interactive={layer.interactive !== false}
            excludeNames={layer.excludeNames}
            onPointerOver={() => onHoverLayer(i)}
            onPointerOut={() => onHoverLayer(null)}
            onClick={(e) => {
              const grp = groupRefs.current[i];
              const box = new THREE.Box3().setFromObject(grp);
              const center = new THREE.Vector3();
              box.getCenter(center);
              onLayerClick(i, layer, e, center.toArray());
            }}
          />
        </group>
        );
      })}
    </group>
  );
}

function CameraAdjuster({ layers, autoRotate, explodeAxis, smoothExplodeRef, onControlsReady, isOrthographic, disabled = false }) {
  const { camera } = useThree();
  const controlsRef = useRef(null);
  const userInteracting = useRef(false);

  const explodedTarget = useRef(new THREE.Vector3());
  const defaultTarget = useRef(new THREE.Vector3());
  const cacheReady = useRef(false);
  const hasExplosion = explodeAxis != null;
  const isIndividualExp = explodeAxis === "individual";

  /* set up on first frame */
  if (!cacheReady.current && controlsRef.current) {
    defaultTarget.current.copy(controlsRef.current.target);

    if (hasExplosion && !isIndividualExp) {
      const { center, isX } = getExplodedBounds(layers, explodeAxis);
      explodedTarget.current.set(isX ? center : 0, isX ? 0 : center, 0);
    }
    cacheReady.current = true;
  }

  /* only lerp controls.target — never touch camera.position.
     OrbitControls owns the camera and will orbit around the shifting target
     without any direction change. */
  useFrame((_, delta) => {
    if (disabled) return; // Phase 2-4: Runtime controls camera
    const ctrl = controlsRef.current;
    if (!ctrl || !cacheReady.current) return;

    /* suppress target drift briefly after perspective restore */
    if (justRestoredPersp && restoreFrameCount > 0) {
      restoreFrameCount--;
      if (restoreFrameCount <= 0) justRestoredPersp = false;
    }

    /* persist target so pan/orbit is preserved across camera type switches */
    if (!userInteracting.current && !justRestoredPersp) {
      savedTarget.copy(ctrl.target);
    }

    if (!hasExplosion || userInteracting.current || isIndividualExp || justRestoredPersp) return;

    const t = smoothExplodeRef.current / 100;
    const goal = new THREE.Vector3().lerpVectors(
      defaultTarget.current,
      explodedTarget.current,
      t
    );

    const alpha = 1 - Math.exp(-8.0 * delta);
    ctrl.target.lerp(goal, alpha);
  });

  /* ── conditional props per camera type ── */
  const baseProps = {
    enableDamping: true,
    dampingFactor: 0.08,
    maxPolarAngle: Math.PI * 0.7,
    target: savedTarget.toArray(),
    autoRotate,
    autoRotateSpeed: 0.5,
    onStart: () => { userInteracting.current = true; },
    onEnd: () => { userInteracting.current = false; },
  };

  const perspProps = { minDistance: 0.8, maxDistance: 12 };
  const orthoProps = { minZoom: 0.3, maxZoom: 8 };

  return (
    <OrbitControls
      key={isOrthographic ? "ortho" : "persp"}
      ref={(el) => {
        controlsRef.current = el;
        globalControls = el;  /* for PanSyncController */
        if (el && onControlsReady) onControlsReady(el);
      }}
      {...baseProps}
      {...(isOrthographic ? orthoProps : perspProps)}
    />
  );
}

function ShadowLight({ layers, explodeAxis, smoothExplodeRef }) {
  const lightRef = useRef();
  const lastTRef = useRef(-1);
  const hasExplosion = explodeAxis != null;
  const isIndividualExp = explodeAxis === "individual";

  useFrame(() => {
    const light = lightRef.current;
    if (!light || !layers?.length) return;
    if (!hasExplosion || isIndividualExp) return; // keep default shadow camera

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
      "font-weight:bold;color:#cc785c",
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

/* ── module-level refs for cross-component camera access ── */
let globalControls = null;
const savedCameraPos = new THREE.Vector3();
const savedTarget = new THREE.Vector3(0, 0.8, 0); // default target for initial load

/* track whether we just restored perspective to suppress one-frame target drift */
let justRestoredPersp = false;
let restoreFrameCount = 0;

const perspState = {
  pos: new THREE.Vector3(),
  target: new THREE.Vector3(),
  fov: 40,
  zoom: 1,
  near: 1,
  far: 100,
};
let perspStateValid = false;

const PERSP_FOV = 40;

/* ── Camera type switcher: creates and swaps Perspective/OrthographicCamera ── */
function CameraSwitcher({ isOrthographic, wallRef }) {
  const { set, camera, size } = useThree();
  const camRef = useRef(null);
  const frustumRef = useRef(5);
  const prevIsOrtho = useRef(isOrthographic);

  /* continuously save perspective state while perspective camera is active */
  if (camera.isPerspectiveCamera && globalControls && !justRestoredPersp) {
    perspState.pos.copy(camera.position);
    perspState.target.copy(globalControls.target);
    perspState.fov = camera.fov || PERSP_FOV;
    perspState.zoom = camera.zoom || 1;
    perspState.near = camera.near || 1;
    perspState.far = camera.far || 100;
    perspStateValid = true;
  }

  /* save target every render (for OrbitControls restore on remount) */
  if (globalControls) {
    savedTarget.copy(globalControls.target);
  }
  savedCameraPos.copy(camera.position);

  useEffect(() => {
    const aspect = size.width / size.height;
    const wasOrtho = prevIsOrtho.current;
    prevIsOrtho.current = isOrthographic;

    let newCam;
    if (isOrthographic) {
      /* ── switching TO orthographic ── */
      /* save perspective state from current camera before leaving it */
      if (!wasOrtho && camera.isPerspectiveCamera) {
        perspState.pos.copy(camera.position);
        perspState.target.copy(savedTarget);
        perspState.fov = camera.fov || PERSP_FOV;
        perspState.zoom = camera.zoom || 1;
        perspState.near = camera.near || 1;
        perspState.far = camera.far || 100;
        perspStateValid = true;
      }

      /* compute frustum: prefer model bounding box, fallback to perspective match */
      let fs;
      if (wallRef?.current) {
        const box = new THREE.Box3().setFromObject(wallRef.current);
        const sz = new THREE.Vector3();
        box.getSize(sz);
        fs = Math.max(Math.max(sz.x, sz.y, sz.z) * 1.4, 3);
      } else {
        const refTarget = perspStateValid ? perspState.target : savedTarget;
        const refPos = perspStateValid ? perspState.pos : savedCameraPos;
        const dist = refPos.distanceTo(refTarget);
        const fovRad = (PERSP_FOV / 2) * Math.PI / 180;
        fs = Math.max(2 * dist * Math.tan(fovRad), 3);
      }
      frustumRef.current = fs;

      newCam = new THREE.OrthographicCamera(
        -fs * aspect / 2, fs * aspect / 2,
        fs / 2, -fs / 2,
        0.1, 100
      );
      /* keep current camera position (orbit position) */
      const refPos = perspStateValid ? perspState.pos : savedCameraPos;
      newCam.position.copy(refPos);
      savedTarget.copy(perspStateValid ? perspState.target : savedTarget);
    } else {
      /* ── switching TO perspective: compute position from ortho frustum ── */
      justRestoredPersp = true;
      restoreFrameCount = 3;

      /* dynamically calculate distance so model size matches ortho view */
      const orthoHeight = camera.isOrthographicCamera
        ? camera.top - camera.bottom
        : frustumRef.current;
      const fov = perspStateValid ? perspState.fov : PERSP_FOV;
      const fovHalfRad = (fov / 2) * Math.PI / 180;
      const distance = (orthoHeight / 2) / Math.tan(fovHalfRad);

      /* compute position: move back from target along camera direction */
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      const target = savedTarget.clone();
      const newPos = target.clone().addScaledVector(forward, -distance);

      newCam = new THREE.PerspectiveCamera(fov, aspect, 1, 100);
      newCam.position.copy(newPos);
      /* keep savedTarget as-is (already has correct value) */
    }
    camRef.current = newCam;
    set({ camera: newCam });
  }, [isOrthographic]); // eslint-disable-line react-hooks/exhaustive-deps

  /* keep ortho frustum in sync with window resize */
  useEffect(() => {
    if (!camRef.current?.isOrthographicCamera) return;
    const aspect = size.width / size.height;
    const fs = frustumRef.current;
    camRef.current.left = -fs * aspect / 2;
    camRef.current.right = fs * aspect / 2;
    camRef.current.top = fs / 2;
    camRef.current.bottom = -fs / 2;
    camRef.current.updateProjectionMatrix();
  }, [size.width, size.height]);

  return null;
}

/* ── view preset switcher ── */
const VIEW_DIRECTIONS = {
  front:  new THREE.Vector3(0, 0, 1),
  back:   new THREE.Vector3(0, 0, -1),
  left:   new THREE.Vector3(-1, 0, 0),
  right:  new THREE.Vector3(1, 0, 0),
  top:    new THREE.Vector3(0, 1, 0),
  bottom: new THREE.Vector3(0, -1, 0),
};
const DEFAULT_CAM = new THREE.Vector3(0, 1.2, 4.0);
const DEFAULT_TARGET = new THREE.Vector3(0, 0.8, 0);

function ViewSwitcher({ viewTarget, onDone, isOrthographic }) {
  const { camera } = useThree();
  const goalPos = useRef(new THREE.Vector3());
  const goalTarget = useRef(new THREE.Vector3());
  const active = useRef(false);

  useFrame(() => {
    if (!viewTarget || !globalControls) return;
    const ctrl = globalControls;

    /* compute goal on first frame */
    if (!active.current) {
      const dir = VIEW_DIRECTIONS[viewTarget];
      if (dir) {
        if (isOrthographic) {
          /* orthographic: position at fixed distance along view axis */
          goalTarget.current.set(0, 0.8, 0);
          goalPos.current.copy(goalTarget.current).addScaledVector(dir, 10);
        } else {
          /* perspective: preserve current distance to target */
          const dist = camera.position.distanceTo(ctrl.target);
          goalPos.current.copy(ctrl.target).addScaledVector(dir, dist);
          goalTarget.current.copy(ctrl.target);
        }
      } else {
        /* default perspective */
        goalPos.current.copy(DEFAULT_CAM);
        goalTarget.current.copy(DEFAULT_TARGET);
      }
      active.current = true;
    }

    /* lerp camera + target */
    camera.position.lerp(goalPos.current, 0.12);
    ctrl.target.lerp(goalTarget.current, 0.12);

    /* done when close enough */
    if (camera.position.distanceTo(goalPos.current) < 0.02 &&
        ctrl.target.distanceTo(goalTarget.current) < 0.01) {
      camera.position.copy(goalPos.current);
      ctrl.target.copy(goalTarget.current);
      active.current = false;
      if (onDone) onDone();
    }
  });

  useEffect(() => { active.current = false; }, [viewTarget]);

  return null;
}

/* ── sync diagram pan to 3D view target (focus point) ── */
const PAN_RANGE_PERSP = 2.0; // perspective: world units at default distance

function PanSyncController({ panOffset, syncScale, isOrthographic }) {
  const { camera } = useThree();
  const defaultTarget = useRef(new THREE.Vector3());
  const currentGoal = useRef(new THREE.Vector3());
  const initDone = useRef(false);
  const lastCam = useRef(null);

  /* reset when camera changes (ortho↔persp switch) */
  if (lastCam.current !== camera) {
    lastCam.current = camera;
    initDone.current = false;
  }

  useFrame(() => {
    if (!panOffset || !globalControls) return;
    const ctrl = globalControls;
    const { x, y, w, h } = panOffset;
    if (!w || !h) return;

    /* record resting target on first frame */
    if (!initDone.current) {
      defaultTarget.current.copy(ctrl.target);
      currentGoal.current.copy(ctrl.target);
      initDone.current = true;
      return;
    }

    /* skip when user is manually rotating/panning */
    if (ctrl._isDragging) return;

    /* use live scale, not frozen-at-pan-time scale */
    const scale = syncScale || 1;

    /* pan range: match visible world width to diagram width */
    let panRange;
    const isOrtho = isOrthographic || camera.isOrthographicCamera;
    if (isOrtho) {
      const visW = (camera.right - camera.left) / camera.zoom;
      panRange = visW;
    } else {
      panRange = PAN_RANGE_PERSP;
    }

    const dx = -(x / w) * panRange / scale;
    const dy =  (y / h) * panRange / scale;

    /* direction vectors */
    let camRight, camUp;
    if (isOrtho) {
      /* ortho: use fixed world axes — keeps view locked to front */
      camRight = new THREE.Vector3(1, 0, 0);
      camUp = new THREE.Vector3(0, 1, 0);
    } else {
      /* perspective: use camera-relative directions */
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      camRight = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
      camUp = camera.up.clone().normalize();
    }

    /* goal = defaultTarget + right*dx + up*dy */
    currentGoal.current.copy(defaultTarget.current)
      .addScaledVector(camRight, dx)
      .addScaledVector(camUp, dy);

    /* smoothly move controls target toward goal */
    ctrl.target.lerp(currentGoal.current, 0.12);
  });

  return null;
}

/* ── sync diagram scale to 3D camera ── */
function SyncZoomAdjuster({ syncScale, isOrthographic }) {
  const { camera } = useThree();
  const baseDist = useRef(0);
  const baseZoom = useRef(1);
  const init = useRef(false);
  const lastCam = useRef(null);

  /* reset when camera changes (ortho↔persp switch) */
  if (lastCam.current !== camera) {
    lastCam.current = camera;
    init.current = false;
  }

  useFrame(() => {
    if (!init.current) {
      baseDist.current = camera.position.length();
      baseZoom.current = camera.zoom;
      init.current = true;
      return;
    }

    if (isOrthographic) {
      /* ortho: scale by adjusting camera.zoom */
      const targetZoom = baseZoom.current * syncScale;
      camera.zoom += (targetZoom - camera.zoom) * 0.15;
      camera.updateProjectionMatrix();
    } else {
      /* perspective: scale by moving camera toward/away from target */
      const targetDist = baseDist.current / syncScale;
      const alpha = 0.15;
      const currentDist = camera.position.length();
      const lerped = currentDist + (targetDist - currentDist) * alpha;
      const newRatio = lerped / currentDist;
      camera.position.multiplyScalar(newRatio);
    }
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
  viewTarget,
  onViewDone,
  isOrthographic,
  spatialCard,
  onSpatialCardClose,
  useEngine = false,
  useRuntime = false,
}) {
  const wallRef = useRef();
  const smoothExplodeRef = useRef(0);

  return (
    <>
      <RendererSetup />
      <CameraSwitcher isOrthographic={isOrthographic} wallRef={wallRef} />

      {spatialCard && (
        <SpatialLabel
          layer={spatialCard.layer}
          position={spatialCard.worldPosition}
          explodeAxis={explodeAxis}
          onClose={onSpatialCardClose}
        />
      )}

      <color attach="background" args={["#f5f5f7"]} />

      {/* sync camera zoom with diagram scale (disabled when Runtime controls camera) */}
      {!useRuntime && syncScale != null && <SyncZoomAdjuster syncScale={syncScale} isOrthographic={isOrthographic} />}
      {/* sync camera pan with diagram drag */}
      {!useRuntime && panOffset != null && <PanSyncController panOffset={panOffset} syncScale={syncScale} isOrthographic={isOrthographic} />}
      {/* view preset switcher */}
      {!useRuntime && viewTarget != null && <ViewSwitcher viewTarget={viewTarget} onDone={onViewDone} isOrthographic={isOrthographic} />}

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
          useEngine={useEngine}
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
        isOrthographic={isOrthographic}
        disabled={useRuntime}
      />

      {/* ── Runtime observer (parallel, read-only) ── */}
      {useRuntime && (
        <SceneRuntimeRunner
          layers={layers}
          explodeValue={explodeValue}
          explodeAxis={explodeAxis}
          cameraControls={globalControls}
          isOrthographic={isOrthographic}
          viewTarget={viewTarget}
        />
      )}
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
  cameraPosition = [0, 1.2, 4.0],
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
  viewTarget,
  onViewDone,
  isOrthographic = false,
  spatialCard,
  onSpatialCardClose,
  useEngine = false,
  useRuntime = false,
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
          viewTarget={viewTarget}
          onViewDone={onViewDone}
          showLabels={showLabels}
          isOrthographic={isOrthographic}
          spatialCard={spatialCard}
          onSpatialCardClose={onSpatialCardClose}
          useEngine={useEngine}
          useRuntime={useRuntime}
        />
      </Canvas>
    </div>
  );
}

export default ModelViewer;
