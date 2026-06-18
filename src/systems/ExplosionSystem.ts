/* ── V1 ExplosionSystem ──
   Adapter: wraps ExplosionEngine, reads RuntimeState.explode,
   calls engine.tick() → getLayerOffset(), writes to RuntimeState.layerOffsets.

   Rules:
   - Does NOT recompute positions — delegates entirely to ExplosionEngine.
   - Does NOT modify EXPLODE_STEP, direction, individual/uniform logic.
   - Output is ID-keyed, not index-keyed. */

import { ExplosionEngine } from "../core/ExplosionEngine";
import type { RuntimeStateData } from "../runtime/RuntimeState";

export interface LayerMeta {
  name: string;
  thickness: number;
  explodeDirection?: number[] | null;
  explodeDistance?: number;
  interactive?: boolean;
}

export class ExplosionSystem {
  private engine = new ExplosionEngine();
  private layersVersion = "";
  private layerIds: string[] = [];
  private _ready = false;

  get ready(): boolean {
    return this._ready;
  }

  /** Call when layers or explodeAxis change (from SceneRuntimeRunner). */
  rebuild(
    layers: LayerMeta[],
    explodeAxis: string | null | undefined,
    groupRefsById: Record<string, any>
  ): void {
    const version = layers.map((l) => l.name).join("|") + "|" + (explodeAxis || "none");
    if (version === this.layersVersion) return;
    this.layersVersion = version;

    /* Store layer IDs for offset collection */
    this.layerIds = layers.map((l, i) => `${l.name || "layer"}-${i}`);

    /* Rebuild engine with current layer data */
    const engineLayers = layers.map((l, i) => ({
      name: l.name,
      thickness: l.thickness || 0,
      explodeDirection: l.explodeDirection,
      explodeDistance: l.explodeDistance,
      interactive: l.interactive,
      layerObjectName: undefined as string | undefined,
      excludeNames: undefined as string[] | undefined,
    }));
    this.engine.rebuild(engineLayers, explodeAxis, groupRefsById);
    this._ready = true;
  }

  /** Called each frame. Reads explode value from state, ticks engine, writes offsets. */
  update(delta: number, state: RuntimeStateData): void {
    if (!this._ready || !state.explode) return;

    const target = state.explode.target;
    this.engine.tick(delta, target);

    /* Collect all layer offsets via stored IDs */
    const offsets: Record<string, [number, number, number]> = {};
    for (const layerId of this.layerIds) {
      const offset = this.engine.getLayerOffset(layerId);
      offsets[layerId] = offset;
    }

    state.layerOffsets = offsets;
    state.performance.frameCount++;
  }

  /** Reset engine state (call on unmount or node change). */
  reset(): void {
    this.engine = new ExplosionEngine();
    this.layersVersion = "";
    this._ready = false;
  }
}
