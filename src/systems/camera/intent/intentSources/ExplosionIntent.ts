/* ── ExplosionIntent ──
   Camera movement caused by explode animation.
   Priority 6 — below user (10) and view switch (8). */

import type { CameraIntent } from "../CameraIntent";

export function createExplosionIntent(
  position: [number, number, number],
  target: [number, number, number],
  zoom?: number
): CameraIntent {
  return {
    id: "explosion-intent",
    source: "explosion",
    position,
    target,
    zoom,
    priority: 6,
    strength: 0.7,
    timestamp: Date.now(),
    duration: 0.3,
  };
}
