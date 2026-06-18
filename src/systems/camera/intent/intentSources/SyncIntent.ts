/* ── SyncIntent ──
   Camera movement from diagram ↔ 3D sync (PanSyncController, SyncZoomAdjuster).
   Priority 3 — lowest, overridden by all other sources. */

import type { CameraIntent } from "../CameraIntent";

export function createSyncIntent(
  position: [number, number, number],
  target: [number, number, number],
  zoom?: number
): CameraIntent {
  return {
    id: "sync-intent",
    source: "sync",
    position,
    target,
    zoom,
    priority: 3,
    strength: 0.4,
    timestamp: Date.now(),
  };
}
