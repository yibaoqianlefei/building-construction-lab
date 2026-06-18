/* ── V1 SceneActions ──
   Action type definitions for SceneOrchestrator.
   Each action is a single step in a timed sequence. */

export type SceneActionType =
  | "explosion"    // set explode value
  | "camera_move"  // lerp camera to position + target
  | "camera_view"  // switch projection mode
  | "ui_show"      // set UI flag true
  | "ui_hide"      // set UI flag false
  | "wait";        // pure delay, no state change

export interface SceneAction {
  id: string;
  type: SceneActionType;
  duration: number;  // seconds
  payload?: any;
  priority?: number;
}
