/* ── V1 CameraTruthSync ──
   Dual-truth calibration: compares THREE.js physical camera state
   with RuntimeState.camera logical state, computes drift.

   Does NOT modify camera behavior. Observation + diagnosis only. */

import * as THREE from "three";
import type { SceneRuntime } from "../SceneRuntime";

export interface CameraDrift {
  position: number;
  target: number;
  zoom: number;
}

/** Euclidean distance between THREE.Vector3 and plain {x,y,z} */
function distance(a: THREE.Vector3, b: { x: number; y: number; z: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

export class CameraTruthSync {
  /** Current drift metrics */
  drift: CameraDrift = { position: 0, target: 0, zoom: 0 };

  /** True when drift exceeds threshold */
  warning = false;

  /**
   * Compare THREE truth vs Runtime logical state.
   * @param camera  THREE.Camera (physical truth)
   * @param controls OrbitControls (physical target truth)
   * @param runtime SceneRuntime (logical state)
   */
  update(
    camera: THREE.Camera,
    controls: any,
    runtime: SceneRuntime
  ): void {
    if (!camera || !controls) return;
    if (!runtime.state.camera) return;

    // 1. Physical truth (Three.js)
    const physPos = camera.position;
    const physTarget = controls.target;

    // 2. Logical truth (Runtime)
    const logPos = runtime.state.camera.position;
    const logTarget = runtime.state.camera.target;

    // 3. Compute drift
    const posDrift = distance(physPos, logPos);
    const targetDrift = distance(physTarget, logTarget);
    const zoomDrift = Math.abs((camera.zoom || 1) - (runtime.state.camera.zoom || 1));

    this.drift = { position: posDrift, target: targetDrift, zoom: zoomDrift };

    // 4. Warning threshold (0.5 world-units or 0.2 zoom)
    this.warning = posDrift > 0.5 || targetDrift > 0.5 || zoomDrift > 0.2;

    // 5. Write back to runtime (observation only, no reverse control)
    runtime.state.camera.drift = { ...this.drift };
    runtime.state.camera.isDriftWarning = this.warning;
  }
}
