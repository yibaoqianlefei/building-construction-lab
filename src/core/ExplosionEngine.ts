/* ── V6 Explosion Engine ──
   ID-driven pure computation: stateMachine → layer positions.
   No React. No useFrame. No refs. Testable.
   All operations keyed by layer.id — never by array index. */

import * as THREE from "three";

const EXPLODE_STEP = 0.003;
const EXPLODE_LERP = 1.0;

const CANDIDATE_DIRS: [number, number, number][] = [
  [1, 0, 0], [-1, 0, 0],
  [0, 1, 0], [0, -1, 0],
  [0, 0, 1], [0, 0, -1],
];

interface LayerEntry {
  layerId: string;
  index: number;
  basePosition: number;
  explodeDirection: number[] | null;
  explodeDistance: number;
}

export class ExplosionEngine {
  smoothProgress = 0;

  /** ID-keyed layer entries (Map, not array index) */
  private entries = new Map<string, LayerEntry>();
  private mode: "uniform" | "individual" = "uniform";
  private axis = "x";
  private isX = true;
  private dirSign = 1;

  /** Rebuild layer data when layers or axis change */
  rebuild(
    layers: any[],
    explodeAxis: string | null | undefined,
    groupRefs: Record<string, THREE.Group | null>
  ): void {
    this.entries.clear();
    const hasExplosion = explodeAxis != null;
    this.mode = (explodeAxis === "individual" || layers.some((l: any) => l.explodeDirection != null))
      ? "individual" : "uniform";
    this.axis = explodeAxis?.replace("-", "") || "x";
    this.isX = this.axis === "x";
    this.dirSign = explodeAxis?.startsWith("-") ? -1 : 1;

    const useModelPositions = layers[0]?.layerObjectName != null;
    const isIndividual = this.mode === "individual";

    let offset = 0;
    const total = layers.reduce((s: number, l: any) => s + (l.thickness || 0), 0);

    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      const layerId = `${layer.name || "layer"}-${i}`;
      const basePos = (useModelPositions || isIndividual) ? 0
        : (() => { const p = offset + (layer.thickness || 0) / 2 - total / 2; offset += layer.thickness || 0; return p; })();

      this.entries.set(layerId, {
        layerId,
        index: i,
        basePosition: basePos,
        explodeDirection: null,
        explodeDistance: layer.explodeDistance || 0.25,
      });
    }

    if (isIndividual) {
      this.computeAutoDirs(layers, groupRefs);
    }
  }

  private computeAutoDirs(
    layers: any[],
    groupRefs: Record<string, THREE.Group | null>
  ): void {
    const interactiveIndices = layers
      .map((l, i) => (l.explodeDirection != null && l.interactive !== false ? i : -1))
      .filter((i: number) => i >= 0);
    if (interactiveIndices.length === 0) return;

    const allReady = interactiveIndices.every((i: number) => {
      const id = `${layers[i].name || "layer"}-${i}`;
      const grp = groupRefs[id];
      return grp && grp.children.length > 0;
    });
    if (!allReady) return;

    const staticBox = new THREE.Box3();
    for (let i = 0; i < layers.length; i++) {
      if (layers[i].explodeDirection != null && layers[i].interactive !== false) continue;
      const id = `${layers[i].name || "layer"}-${i}`;
      const grp = groupRefs[id];
      if (grp) staticBox.expandByObject(grp);
    }

    for (const i of interactiveIndices) {
      const layerId = `${layers[i].name || "layer"}-${i}`;
      const entry = this.entries.get(layerId);
      if (!entry) continue;

      const grp = groupRefs[layerId];
      if (!grp) continue;

      const myBox = new THREE.Box3().setFromObject(grp);
      const testBox = myBox.clone();
      const dist = entry.explodeDistance;

      let bestDir: [number, number, number] = [0, 1, 0];
      let bestOverlap = Infinity;

      for (const d of CANDIDATE_DIRS) {
        testBox.copy(myBox).translate(
          new THREE.Vector3(d[0], d[1], d[2]).multiplyScalar(dist)
        );
        if (!testBox.intersectsBox(staticBox)) {
          bestDir = d;
          break;
        }
        const overlapBox = testBox.clone().intersect(staticBox);
        const overlapVol = overlapBox.isEmpty() ? 0 :
          (overlapBox.max.x - overlapBox.min.x) *
          (overlapBox.max.y - overlapBox.min.y) *
          (overlapBox.max.z - overlapBox.min.z);
        if (overlapVol < bestOverlap) { bestOverlap = overlapVol; bestDir = d; }
      }
      entry.explodeDirection = [...bestDir];
    }
  }

  /** Called each frame. Returns normalized progress (0–1). */
  tick(delta: number, targetProgress: number): number {
    const alpha = 1 - Math.exp(-EXPLODE_LERP * delta);
    this.smoothProgress += (targetProgress - this.smoothProgress) * alpha;
    if (Math.abs(targetProgress - this.smoothProgress) < 0.05) {
      this.smoothProgress = targetProgress;
    }
    return this.smoothProgress / 100;
  }

  /** Get world position for a layer by ID. Returns absolute position (no accumulation). */
  getLayerOffset(layerId: string): [number, number, number] {
    const entry = this.entries.get(layerId);
    if (!entry) return [0, 0, 0];

    const t = Math.max(0, Math.min(1, this.smoothProgress / 100));

    if (this.mode === "individual") {
      const dir = entry.explodeDirection;
      const dist = entry.explodeDistance || 0;
      if (dir && dist > 0 && Number.isFinite(dir[0])) {
        const x = entry.basePosition + dir[0] * dist * t;
        const y = entry.basePosition + dir[1] * dist * t;
        const z = entry.basePosition + dir[2] * dist * t;
        return [Number.isFinite(x) ? x : 0, Number.isFinite(y) ? y : 0, Number.isFinite(z) ? z : 0];
      }
      return [0, 0, 0];
    }

    const off = entry.index * this.dirSign * this.smoothProgress * EXPLODE_STEP;
    const v = Number.isFinite(entry.basePosition + off) ? entry.basePosition + off : 0;
    return this.isX ? [v, 0, 0] : [0, v, 0];
  }
}
