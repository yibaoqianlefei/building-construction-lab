/* ── V1 CameraArbiter ──
   Core decision engine: resolves conflicting CameraIntents into
   a single CameraDecision each frame.

   Algorithm:
   1. Sort by priority (desc), then timestamp (desc)
   2. Winner = highest-priority intent
   3. Blend all intents via weighted lerp (strength-weighted)
   4. Return unified position / target / zoom */

import type { CameraIntent } from "./CameraIntent";

export interface CameraDecision {
  position: [number, number, number];
  target: [number, number, number];
  zoom: number;
  /** The intent that won priority arbitration */
  winner: CameraIntent | null;
  /** All intents considered this frame */
  intentsConsidered: number;
}

export class CameraArbiter {
  decide(intents: CameraIntent[]): CameraDecision {
    // No intents → identity decision
    if (intents.length === 0) {
      return {
        position: [0, 0, 4],
        target: [0, 0, 0],
        zoom: 1,
        winner: null,
        intentsConsidered: 0,
      };
    }

    // 1. Sort: priority desc, then timestamp desc (newest wins ties)
    const sorted = [...intents].sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return b.timestamp - a.timestamp;
    });

    const winner = sorted[0];

    // 2. Weighted blend (weak fusion)
    // Accumulate weighted contributions
    let px = 0, py = 0, pz = 0;
    let tx = 0, ty = 0, tz = 0;
    let zSum = 0;
    let totalWeight = 0;

    for (const intent of sorted) {
      const w = intent.strength;
      totalWeight += w;

      if (intent.position) {
        px += intent.position[0] * w;
        py += intent.position[1] * w;
        pz += intent.position[2] * w;
      }

      if (intent.target) {
        tx += intent.target[0] * w;
        ty += intent.target[1] * w;
        tz += intent.target[2] * w;
      }

      if (intent.zoom !== undefined) {
        zSum += intent.zoom * w;
      } else {
        zSum += 1 * w;
      }
    }

    const invW = totalWeight > 0 ? 1 / totalWeight : 1;

    return {
      position: [px * invW, py * invW, pz * invW],
      target: [tx * invW, ty * invW, tz * invW],
      zoom: totalWeight > 0 ? zSum * invW : 1,
      winner,
      intentsConsidered: intents.length,
    };
  }
}
