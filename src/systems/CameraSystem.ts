/* ── V2 CameraSystem ──
   Observer-only adapter: reads camera state from existing system
   and writes to RuntimeState.camera. Does NOT control anything.

   Rules:
   - Does NOT create Camera
   - Does NOT control OrbitControls
   - Does NOT handle animation
   - Does NOT replace ViewSwitcher / CameraController
   - Only reads → writes

   CameraContext now carries THREE references for truth comparison by CameraTruthSync. */

import type { RuntimeStateData } from "../runtime/RuntimeState";

/** Camera context prepared by SceneRuntimeRunner.
    Plain data for CameraSystem, THREE refs for CameraTruthSync. */
export interface CameraContext {
  position: [number, number, number];
  target: [number, number, number];
  zoom: number;
  isOrthographic: boolean;
  viewTarget: string | null;
  /** THREE camera reference (for truth comparison only) */
  camera?: any;
  /** OrbitControls reference (for truth comparison only) */
  controls?: any;
}

export class CameraSystem {
  /** Called each frame from SceneRuntime. Writes camera snapshot to RuntimeState. */
  update(_delta: number, state: RuntimeStateData, ctx: CameraContext): void {
    state.camera = {
      position: { x: ctx.position[0], y: ctx.position[1], z: ctx.position[2] },
      target: { x: ctx.target[0], y: ctx.target[1], z: ctx.target[2] },
      zoom: ctx.zoom,
      fov: 40,
      isOrthographic: ctx.isOrthographic,
      projectionMode: ctx.isOrthographic ? "ortho" : "persp",
      viewTarget: ctx.viewTarget,
      // drift fields are populated by CameraTruthSync separately
    };
  }
}
