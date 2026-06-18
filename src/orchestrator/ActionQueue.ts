/* ── V1 ActionQueue ──
   Sequential FIFO queue with per-action duration tracking.
   Actions execute one at a time. When an action's duration expires,
   it auto-advances to the next. */

import type { SceneAction } from "./SceneActions";

export class ActionQueue {
  private queue: SceneAction[] = [];
  private current: SceneAction | null = null;
  private elapsed = 0; // seconds elapsed for current action

  /** Add action to end of queue. */
  add(action: SceneAction): void {
    this.queue.push(action);
  }

  /** Insert action at front (interrupt current, preserve rest). */
  insertFront(action: SceneAction): void {
    if (this.current) {
      this.queue.unshift(this.current);
    }
    this.current = action;
    this.elapsed = 0;
  }

  /** Clear queue and current action. */
  clear(): void {
    this.queue = [];
    this.current = null;
    this.elapsed = 0;
  }

  /** Advance one frame. Auto-promotes next action when current expires. */
  update(delta: number): void {
    // No action active → try to dequeue next
    if (!this.current && this.queue.length > 0) {
      this.current = this.queue.shift()!;
      this.elapsed = 0;
    }

    if (!this.current) return;

    this.elapsed += delta;

    // Current action expired → advance
    if (this.elapsed >= this.current.duration) {
      this.current = null;
      this.elapsed = 0;
    }
  }

  /** The currently executing action (null if idle). */
  getCurrent(): SceneAction | null {
    return this.current;
  }

  /** Progress of current action (0–1). */
  getProgress(): number {
    if (!this.current || this.current.duration <= 0) return 1;
    return Math.min(this.elapsed / this.current.duration, 1);
  }

  /** True when no action is running and queue is empty. */
  isIdle(): boolean {
    return this.current === null && this.queue.length === 0;
  }

  /** Number of actions waiting in queue. */
  get pendingCount(): number {
    return this.queue.length;
  }
}
