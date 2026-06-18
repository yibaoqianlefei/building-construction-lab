/* ── V1 RuntimeState ──
   Pure data container. No business logic. No methods.
   All fields are nullable — runtime may not have all data available. */

export interface ExplodeState {
  value: number;         // current explode value (0–100)
  target: number;        // target explode value
  axis: string | null;   // "x" | "y" | "-x" | "-y" | "individual" | null
}

export interface CameraState {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  zoom: number;
  fov: number;
  isOrthographic: boolean;
  projectionMode: "persp" | "ortho";  // active projection
  viewTarget: string | null;           // current view preset target

  /** Phase 2-2.5: CameraTruthSync drift metrics */
  drift?: {
    position: number;  // |physPos - logPos|
    target: number;    // |physTarget - logTarget|
    zoom: number;      // |physZoom - logZoom|
  };
  isDriftWarning?: boolean;  // true when drift exceeds threshold

  /** Phase 2-3: CameraArbiter decision */
  decision?: {
    winner: string | null;       // id of winning intent
    source: string | null;       // source of winning intent
    intentsConsidered: number;   // total intents this frame
  };
  activeIntents?: number;       // count of active intents
}

export interface InteractionState {
  hoveredLayerId: string | null;
  selectedLayerId: string | null;
}

export interface LabelState {
  visible: boolean;
  activeLayerId: string | null;
}

export interface AnimationState {
  autoRotate: boolean;
}

export interface PerformanceState {
  frameTime: number;     // ms
  frameCount: number;
}

export interface RuntimeStateData {
  camera: CameraState | null;
  explode: ExplodeState | null;
  interaction: InteractionState | null;
  labels: LabelState | null;
  animation: AnimationState | null;
  performance: PerformanceState;
  /** Computed per-layer offsets from ExplosionSystem (ID-keyed) */
  layerOffsets: Record<string, [number, number, number]> | null;
}

export function createDefaultRuntimeState(): RuntimeStateData {
  return {
    camera: null,
    explode: null,
    interaction: null,
    labels: null,
    animation: null,
    performance: { frameTime: 0, frameCount: 0 },
    layerOffsets: null,
  };
}
