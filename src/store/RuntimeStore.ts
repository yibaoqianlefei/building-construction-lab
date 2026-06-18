/* ── V1 RuntimeStore ──
   Zustand store for global runtime state access.
   Exposes runtime state, debug info, and enable/disable toggle.
   Also mounted on window.__RUNTIME__ for devtools inspection. */

import { create } from "zustand";
import type { SceneRuntime } from "../runtime/SceneRuntime";
import type { RuntimeStateData } from "../runtime/RuntimeState";

export interface RuntimeDebugInfo {
  frameTime: number;        // ms
  lastUpdateDuration: number; // ms
  layerOffsetCount: number;
}

export interface RuntimeStoreState {
  /** Whether runtime mode is active */
  enabled: boolean;
  /** The SceneRuntime instance (null when disabled) */
  runtime: SceneRuntime | null;
  /** Snapshot of current RuntimeState (updated each frame) */
  snapshot: RuntimeStateData | null;
  /** Debug info for devtools */
  debug: RuntimeDebugInfo;

  // Actions
  setEnabled: (v: boolean) => void;
  setRuntime: (r: SceneRuntime | null) => void;
  updateSnapshot: (s: RuntimeStateData) => void;
  updateDebug: (d: Partial<RuntimeDebugInfo>) => void;
  reset: () => void;
}

const defaultDebug: RuntimeDebugInfo = {
  frameTime: 0,
  lastUpdateDuration: 0,
  layerOffsetCount: 0,
};

export const useRuntimeStore = create<RuntimeStoreState>((set) => ({
  enabled: false,
  runtime: null,
  snapshot: null,
  debug: { ...defaultDebug },

  setEnabled: (v) => set({ enabled: v }),
  setRuntime: (r) => set({ runtime: r }),
  updateSnapshot: (s) => set({ snapshot: { ...s } }),
  updateDebug: (d) => set((prev) => ({ debug: { ...prev.debug, ...d } })),
  reset: () => set({ runtime: null, snapshot: null, debug: { ...defaultDebug } }),
}));

/* ── Mount on window for devtools ── */
if (typeof window !== "undefined") {
  const win = window as any;

  win.__RUNTIME__ = {
    get store() {
      return useRuntimeStore.getState();
    },
    get state() {
      return useRuntimeStore.getState().snapshot;
    },
    get debug() {
      return useRuntimeStore.getState().debug;
    },
  };

  /* Phase 2-3: Camera Intent debugging */
  win.__CAMERA_INTENTS__ = {
    get all() {
      const rt = useRuntimeStore.getState().runtime;
      return rt?.intentStore?.getAll() ?? [];
    },
    get count() {
      const rt = useRuntimeStore.getState().runtime;
      return rt?.intentStore?.count ?? 0;
    },
    get winner() {
      const rt = useRuntimeStore.getState().runtime;
      const intents = rt?.intentStore?.getAll() ?? [];
      const arbiter = rt?.arbiter;
      if (!arbiter || intents.length === 0) return null;
      const decision = arbiter.decide(intents);
      return {
        id: decision.winner?.id ?? null,
        source: decision.winner?.source ?? null,
        priority: decision.winner?.priority ?? null,
        intentsConsidered: decision.intentsConsidered,
      };
    },
    addIntent(intent: any) {
      const rt = useRuntimeStore.getState().runtime;
      rt?.intentStore?.add(intent);
    },
    clearBySource(source: string) {
      const rt = useRuntimeStore.getState().runtime;
      rt?.intentStore?.clearBySource(source as any);
    },
  };
}
