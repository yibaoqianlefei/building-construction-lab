/* ── V3 CameraSystem ──
   Bidirectional: reads camera state (observer) + writes cameraGoal back to
   THREE camera & OrbitControls (smooth, lerp-based writeback).

   Writeback is only active when cameraGoal has non-null fields.
   Uses manual lerp math — no THREE dependency. */

import type { RuntimeStateData } from "../runtime/RuntimeState";

/** Camera context prepared by SceneRuntimeRunner. */
export interface CameraContext {
  position: [number, number, number];
  target: [number, number, number];
  zoom: number;
  isOrthographic: boolean;
  viewTarget: string | null;
  /** THREE camera reference */
  camera?: any;
  /** OrbitControls reference */
  controls?: any;
}

/** Smooth lerp factors (tuned for no-jitter, no-overshoot). */
const LERP_POSITION = 0.08;
const LERP_TARGET = 0.12;
const LERP_ZOOM = 0.1;

export class CameraSystem {
  /** Bidirectional update: read + optional writeback. */
  update(_delta: number, state: RuntimeStateData, ctx: CameraContext): void {
    const { camera, controls } = ctx;

    // ===== 1. READ PHASE: snapshot current camera state =====
    state.camera = {
      position: { x: ctx.position[0], y: ctx.position[1], z: ctx.position[2] },
      target: { x: ctx.target[0], y: ctx.target[1], z: ctx.target[2] },
      zoom: ctx.zoom,
      fov: 40,
      isOrthographic: ctx.isOrthographic,
      projectionMode: ctx.isOrthographic ? "ortho" : "persp",
      viewTarget: ctx.viewTarget,
    };

    // ===== 2. WRITEBACK PHASE: apply cameraGoal to THREE objects =====
    const goal = state.cameraGoal;
    if (!goal || !camera || !controls) return;

    // position (manual lerp — no THREE import needed)
    if (goal.position) {
      camera.position.x += (goal.position.x - camera.position.x) * LERP_POSITION;
      camera.position.y += (goal.position.y - camera.position.y) * LERP_POSITION;
      camera.position.z += (goal.position.z - camera.position.z) * LERP_POSITION;
    }

    // target (OrbitControls core — manual lerp)
    if (goal.target) {
      controls.target.x += (goal.target.x - controls.target.x) * LERP_TARGET;
      controls.target.y += (goal.target.y - controls.target.y) * LERP_TARGET;
      controls.target.z += (goal.target.z - controls.target.z) * LERP_TARGET;
      controls.update();
    }

    // zoom
    if (goal.zoom !== null && goal.zoom !== undefined && camera.zoom !== undefined) {
      camera.zoom += (goal.zoom - camera.zoom) * LERP_ZOOM;
      camera.updateProjectionMatrix();
    }

    // projection mode (record only, no forced switch)
    if (goal.projectionMode && state.camera) {
      state.camera.projectionMode = goal.projectionMode;
    }
  }
}
