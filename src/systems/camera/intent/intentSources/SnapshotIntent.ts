/* ── SnapshotIntent ──
   Fallback intent from observed camera state.
   Priority 0 — always overridden by any real intent.
   Ensures arbiter always has at least one intent to blend from. */

import type { CameraIntent } from "../CameraIntent";

export function createSnapshotIntent(
  position: [number, number, number],
  target: [number, number, number],
  zoom?: number
): CameraIntent {
  return {
    id: "snapshot-intent",
    source: "snapshot",
    position,
    target,
    zoom,
    priority: 0, // lowest — always overridden
    strength: 1.0,
    timestamp: Date.now(),
  };
}
