/* ── V1 CameraIntentStore ──
   Collects intents from all camera control sources.
   Thread-safe Map with source filtering and bulk operations. */

import type { CameraIntent, IntentSource } from "./CameraIntent";

export class CameraIntentStore {
  private intents = new Map<string, CameraIntent>();

  add(intent: CameraIntent): void {
    // Use id as key — later intents with same id overwrite
    this.intents.set(intent.id, intent);
  }

  remove(id: string): void {
    this.intents.delete(id);
  }

  /** Remove all intents from a specific source. */
  clearBySource(source: IntentSource): void {
    for (const [id, intent] of this.intents) {
      if (intent.source === source) {
        this.intents.delete(id);
      }
    }
  }

  /** Remove all intents (call at start of each frame). */
  clearAll(): void {
    this.intents.clear();
  }

  getAll(): CameraIntent[] {
    return Array.from(this.intents.values());
  }

  getBySource(source: IntentSource): CameraIntent[] {
    return this.getAll().filter((i) => i.source === source);
  }

  get count(): number {
    return this.intents.size;
  }
}
