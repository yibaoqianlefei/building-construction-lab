/* ── V1 SceneOrchestrator ──
   Director-level sequencer: dispatches timed SceneActions to SceneRuntime.
   Sits ABOVE all systems in the update order.
   Enables teaching scenarios: "explode → camera pan → wait → card show". */

import { ActionQueue } from "./ActionQueue";
import type { SceneAction } from "./SceneActions";
import type { SceneRuntime } from "../runtime/SceneRuntime";

export class SceneOrchestrator {
  private queue = new ActionQueue();
  private runtime: SceneRuntime;

  constructor(runtime: SceneRuntime) {
    this.runtime = runtime;
  }

  /** Add action to end of queue. */
  addAction(action: SceneAction): void {
    this.queue.add(action);
  }

  /** Interrupt current action, insert new one at front. */
  interrupt(action: SceneAction): void {
    this.queue.insertFront(action);
  }

  /** Clear all queued and current actions. */
  clear(): void {
    this.queue.clear();
  }

  /** Called each frame from SceneRuntime.update(). */
  update(delta: number): void {
    this.queue.update(delta);

    const action = this.queue.getCurrent();
    if (!action) return;

    // Progress for potential lerp-based actions
    const progress = this.queue.getProgress();

    switch (action.type) {
      case "explosion":
        this.runtime.setExplode(action.payload?.value ?? 0);
        break;

      case "camera_move":
        if (action.payload?.position || action.payload?.target) {
          this.runtime.setCameraGoal({
            position: action.payload.position ?? undefined,
            target: action.payload.target ?? undefined,
          });
        }
        break;

      case "camera_view":
        if (action.payload?.mode) {
          this.runtime.setCameraGoal({
            projectionMode: action.payload.mode,
          });
        }
        break;

      case "ui_show":
        if (action.payload?.id && this.runtime.state.ui) {
          this.runtime.state.ui[action.payload.id] = true;
        }
        break;

      case "ui_hide":
        if (action.payload?.id && this.runtime.state.ui) {
          this.runtime.state.ui[action.payload.id] = false;
        }
        break;

      case "wait":
        // Pure delay — no state change
        break;
    }

    // Track progress for lerp-aware actions
    (action as any)._progress = progress;
  }

  isIdle(): boolean {
    return this.queue.isIdle();
  }

  get currentAction(): SceneAction | null {
    return this.queue.getCurrent();
  }

  get pendingCount(): number {
    return this.queue.pendingCount;
  }
}
