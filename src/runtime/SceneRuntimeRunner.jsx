/* ── V2 SceneRuntimeRunner ──
   React + R3F bridge: mounts inside Canvas, runs runtime.update() each frame.
   This is the ONLY entry point for the runtime system.
   Returns null — no visual output, pure state observer. */

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { SceneRuntime } from "./SceneRuntime";
import { useRuntimeStore } from "../store/RuntimeStore";

function SceneRuntimeRunner({
  layers,
  explodeValue = 0,
  explodeAxis = null,
  groupRefsById = null,
  /** Camera adapter props (from ModelViewer) */
  cameraControls = null,   // OrbitControls ref
  isOrthographic = false,
  viewTarget = null,
}) {
  const runtimeRef = useRef(null);
  const layersVersionRef = useRef("");

  /* ── Init / reset ── */
  useEffect(() => {
    const runtime = new SceneRuntime();
    runtimeRef.current = runtime;

    /* Register with store */
    useRuntimeStore.getState().setRuntime(runtime);
    useRuntimeStore.getState().setEnabled(true);

    return () => {
      runtime.reset();
      runtimeRef.current = null;
      useRuntimeStore.getState().reset();
    };
  }, []);

  /* ── Rebuild engine when layers or axis change ── */
  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime || !layers?.length) return;

    const version = layers.map((l) => l.name).join("|") + "|" + (explodeAxis || "none");
    if (version === layersVersionRef.current) return;
    layersVersionRef.current = version;

    /* Convert layers to LayerMeta format */
    const metas = layers.map((l) => ({
      name: l.name || "",
      thickness: l.thickness || 0,
      explodeDirection: l.explodeDirection,
      explodeDistance: l.explodeDistance,
      interactive: l.interactive,
    }));

    runtime.rebuildEngine(metas, explodeAxis, groupRefsById || {});
  }, [layers, explodeAxis, groupRefsById]);

  /* ── Per-frame update ── */
  const { camera } = useThree();

  useFrame((_, delta) => {
    const runtime = runtimeRef.current;
    if (!runtime) return;

    const t0 = performance.now();

    /* Sync props → state */
    runtime.syncExplodeValue(explodeValue, explodeAxis);

    /* Build camera context from live THREE objects.
       Plain data for CameraSystem, THREE refs for CameraTruthSync. */
    const ctrl = cameraControls;
    const cameraCtx = (camera && ctrl) ? {
      position: [camera.position.x, camera.position.y, camera.position.z],
      target: [ctrl.target.x, ctrl.target.y, ctrl.target.z],
      zoom: camera.zoom || 1,
      isOrthographic,
      viewTarget: viewTarget ?? null,
      camera,   // THREE.Camera reference for truth comparison
      controls: ctrl,  // OrbitControls reference for truth comparison
    } : undefined;

    /* Run systems */
    runtime.update(delta, cameraCtx);

    const t1 = performance.now();

    /* Push to store for devtools */
    const store = useRuntimeStore.getState();
    store.updateSnapshot(runtime.state);
    store.updateDebug({
      frameTime: (t1 - t0),
      lastUpdateDuration: (t1 - t0),
      layerOffsetCount: runtime.state.layerOffsets
        ? Object.keys(runtime.state.layerOffsets).length
        : 0,
    });
  });

  return null; // Pure observer, no visual output
}

export default SceneRuntimeRunner;
