/* ── ViewIntent ──
   Camera movement caused by ViewGizmo / view preset switch.
   Priority 8 — above explosion (6), below user (10). */

import type { CameraIntent } from "../CameraIntent";

export function createViewIntent(
  position: [number, number, number],
  target: [number, number, number],
  zoom?: number
): CameraIntent {
  return {
    id: "view-intent",
    source: "view",
    position,
    target,
    zoom,
    priority: 8,
    strength: 1.0,
    timestamp: Date.now(),
    duration: 0.6,
  };
}
