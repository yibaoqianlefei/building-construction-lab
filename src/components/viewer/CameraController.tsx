/* ── CameraController ──
   Single camera manager. Switches persp/ortho via camera copy + R3F set().
   One OrbitControls instance — never remounts. Ortho zoom via wheel. */

import { useRef, useEffect, useCallback, useSyncExternalStore } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useCameraContext } from "../../core3d/CameraContext";
import { getState, subscribe } from "../../core/stateMachine";

const PERSP_FOV = 40;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 5.0;

interface PerspSnapshot {
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
}

/** Reads from Engine Store — no props needed for camera state */
export function CameraController({
  onControlsReady,
}: {
  onControlsReady?: (ctrl: any) => void;
}) {
  const { set, camera, size, gl } = useThree();
  /* single source of truth: stateMachine */
  const sm = useSyncExternalStore(subscribe, getState);
  const isOrthographic = sm.cameraMode === "ortho";
  const autoRotate = sm.autoRotate;
  const ctx = useCameraContext();
  const controlsRef = useRef<any>(null);
  const perspSnap = useRef<PerspSnapshot>({
    position: new THREE.Vector3(0, 1.2, 4.0),
    target: new THREE.Vector3(0, 0.8, 0),
    fov: PERSP_FOV,
  });
  const orthoFrustum = useRef(5);
  const prevOrtho = useRef(isOrthographic);
  const targetRef = useRef(new THREE.Vector3(0, 0.8, 0));

  /* ── save/restore target from controls ── */
  useFrame(() => {
    const ctrl = controlsRef.current;
    if (ctrl?.target) {
      targetRef.current.copy(ctrl.target);
      ctx.savedTarget.current.copy(ctrl.target);
    }
  });

  /* ── save perspective snapshot while in persp mode ── */
  if (!isOrthographic && controlsRef.current) {
    perspSnap.current.position.copy(camera.position);
    perspSnap.current.target.copy(targetRef.current);
    perspSnap.current.fov = (camera as THREE.PerspectiveCamera).fov || PERSP_FOV;
  }

  /* ── camera type switch via copy ── */
  useEffect(() => {
    if (prevOrtho.current === isOrthographic) return;
    prevOrtho.current = isOrthographic;

    const aspect = size.width / (size.height || 1);

    if (isOrthographic) {
      /* save persp before switching */
      perspSnap.current.position.copy(camera.position);
      perspSnap.current.target.copy(targetRef.current);

      /* create ortho camera, copy position from persp */
      const halfH = orthoFrustum.current / 2;
      const halfW = halfH * aspect;
      const ortho = new THREE.OrthographicCamera(-halfW, halfW, halfH, -halfH, 0.1, 100);
      ortho.position.copy(perspSnap.current.position);
      ortho.zoom = 1;
      ortho.updateProjectionMatrix();
      set({ camera: ortho });
    } else {
      /* restore persp from snapshot */
      const fov = perspSnap.current.fov || PERSP_FOV;
      const persp = new THREE.PerspectiveCamera(fov, aspect, 1, 100);
      persp.position.copy(perspSnap.current.position);
      persp.updateProjectionMatrix();
      set({ camera: persp });
    }
  }, [isOrthographic]);

  /* ── sync ortho frustum to window resize ── */
  useEffect(() => {
    if (!isOrthographic) return;
    const aspect = size.width / (size.height || 1);
    const fs = orthoFrustum.current;
    const oc = camera as THREE.OrthographicCamera;
    oc.left = -fs * aspect / 2;
    oc.right = fs * aspect / 2;
    oc.top = fs / 2;
    oc.bottom = -fs / 2;
    oc.updateProjectionMatrix();
  }, [size.width, size.height]);

  /* ── ortho wheel zoom handler ── */
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!isOrthographic) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      (camera as THREE.OrthographicCamera).zoom = Math.max(
        ZOOM_MIN,
        Math.min(ZOOM_MAX, (camera as THREE.OrthographicCamera).zoom * delta)
      );
      (camera as THREE.OrthographicCamera).updateProjectionMatrix();
    },
    [isOrthographic, camera]
  );

  useEffect(() => {
    const el = gl.domElement;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel, gl]);

  return (
    <OrbitControls
      ref={(el) => {
        controlsRef.current = el;
        ctx.controlsRef.current = el;
        if (el && onControlsReady) onControlsReady(el);
      }}
      enableDamping
      dampingFactor={0.08}
      maxPolarAngle={Math.PI * 0.7}
      minDistance={0.8}
      maxDistance={12}
      minZoom={ZOOM_MIN}
      maxZoom={ZOOM_MAX}
      autoRotate={autoRotate}
      autoRotateSpeed={0.5}
      target={targetRef.current.toArray()}
    />
  );
}
