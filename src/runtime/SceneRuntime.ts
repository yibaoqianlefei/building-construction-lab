/* ── V5 SceneRuntime ──
   Orchestrator: owns RuntimeState, runs registered systems each frame.
   Update order: Orchestrator → Explosion → Camera (+ truth + intents). */

import { createDefaultRuntimeState, type RuntimeStateData, type CameraGoal } from "./RuntimeState";
import { ExplosionSystem, type LayerMeta } from "../systems/ExplosionSystem";
import { CameraSystem, type CameraContext } from "../systems/CameraSystem";
import { CameraTruthSync } from "./sync/CameraTruthSync";
import { CameraIntentStore } from "../systems/camera/intent/CameraIntentStore";
import { CameraArbiter } from "../systems/camera/intent/CameraArbiter";
import { createSnapshotIntent } from "../systems/camera/intent/intentSources/SnapshotIntent";
import { SceneOrchestrator } from "../orchestrator/SceneOrchestrator";

export class SceneRuntime {
  state: RuntimeStateData;
  explosionSystem: ExplosionSystem;
  cameraSystem: CameraSystem;
  cameraTruthSync: CameraTruthSync;

  /** Phase 2-3: Intent arbitration */
  intentStore: CameraIntentStore;
  arbiter: CameraArbiter;

  /** Phase 2-5: Scene orchestrator (director-level sequencer) */
  orchestrator: SceneOrchestrator;

  constructor() {
    this.state = createDefaultRuntimeState();
    this.explosionSystem = new ExplosionSystem();
    this.cameraSystem = new CameraSystem();
    this.cameraTruthSync = new CameraTruthSync();
    this.intentStore = new CameraIntentStore();
    this.arbiter = new CameraArbiter();
    this.orchestrator = new SceneOrchestrator(this);
  }

  /** Called each frame from SceneRuntimeRunner. ctx is prepared by the runner. */
  update(delta: number, cameraCtx?: CameraContext): void {
    /* ── 0. Orchestrator (highest priority — may override explode/camera goals) ── */
    this.orchestrator.update(delta);

    /* ── 1. Explosion ── */
    this.explosionSystem.update(delta, this.state);

    /* ── 2. Camera ── */
    if (cameraCtx) {
      this.cameraSystem.update(delta, this.state, cameraCtx);

      if (cameraCtx.camera && cameraCtx.controls) {
        this.cameraTruthSync.update(cameraCtx.camera, cameraCtx.controls, this);
      }

      this.intentStore.clearBySource("snapshot");
      this.intentStore.add(createSnapshotIntent(
        cameraCtx.position,
        cameraCtx.target,
        cameraCtx.zoom
      ));
      const intents = this.intentStore.getAll();
      const decision = this.arbiter.decide(intents);
      if (this.state.camera) {
        this.state.camera.decision = {
          winner: decision.winner?.id ?? null,
          source: decision.winner?.source ?? null,
          intentsConsidered: decision.intentsConsidered,
        };
        this.state.camera.activeIntents = intents.length;
      }
    }
  }

  /** Phase 2-5: Set explode value programmatically (for orchestrator). */
  setExplode(value: number): void {
    if (!this.state.explode) {
      this.state.explode = { value, target: value, axis: null };
    } else {
      this.state.explode.target = value;
      this.state.explode.value = value;
    }
  }

  /** Phase 2-4: Set camera goal for smooth writeback (partial merge). */
  setCameraGoal(goal: Partial<CameraGoal>): void {
    this.state.cameraGoal = {
      position: goal.position !== undefined ? goal.position : this.state.cameraGoal.position,
      target: goal.target !== undefined ? goal.target : this.state.cameraGoal.target,
      zoom: goal.zoom !== undefined ? goal.zoom : this.state.cameraGoal.zoom,
      projectionMode: goal.projectionMode !== undefined ? goal.projectionMode : this.state.cameraGoal.projectionMode,
    };
  }

  /** Sync explode target from props (called before update). */
  syncExplodeValue(value: number, axis: string | null | undefined): void {
    if (!this.state.explode) {
      this.state.explode = { value, target: value, axis: axis ?? null };
    } else {
      this.state.explode.value = value;
      this.state.explode.target = value;
      this.state.explode.axis = axis ?? null;
    }
  }

  /** Rebuild engine when layers change. */
  rebuildEngine(
    layers: LayerMeta[],
    explodeAxis: string | null | undefined,
    groupRefsById: Record<string, any>
  ): void {
    this.explosionSystem.rebuild(layers, explodeAxis, groupRefsById);
  }

  /** Reset all systems (call on unmount or node change). */
  reset(): void {
    this.explosionSystem.reset();
    this.intentStore.clearAll();
    this.state = createDefaultRuntimeState();
  }
}
