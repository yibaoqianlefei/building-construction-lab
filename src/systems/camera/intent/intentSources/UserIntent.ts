/* ── UserIntent ──
   Camera movement from direct user interaction (OrbitControls drag/zoom).
   Priority 10 — highest, suppresses all automatic animation. */

import type { CameraIntent } from "../CameraIntent";

export function createUserIntent(
  position: [number, number, number],
  target: [number, number, number],
  zoom?: number
): CameraIntent {
  return {
    id: "user-intent",
    source: "user",
    position,
    target,
    zoom,
    priority: 10, // user always wins
    strength: 1.0,
    timestamp: Date.now(),
  };
}
