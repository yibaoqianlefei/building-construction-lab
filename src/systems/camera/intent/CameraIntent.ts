/* ── V1 CameraIntent ──
   Unified camera control intention from any source.
   All camera control sources (explosion, view switch, user drag, sync)
   emit intents. The CameraArbiter resolves conflicts. */

export type IntentSource =
  | "explosion"
  | "view"
  | "user"
  | "sync"
  | "snapshot";  // fallback: observed camera state

export interface CameraIntent {
  id: string;
  source: IntentSource;

  position?: [number, number, number];  // desired camera position
  target?: [number, number, number];    // desired look-at target
  zoom?: number;                         // desired zoom level

  priority: number;   // 0–10, higher wins
  strength: number;   // 0–1, blend weight
  timestamp: number;

  duration?: number;  // smooth time in seconds
}
