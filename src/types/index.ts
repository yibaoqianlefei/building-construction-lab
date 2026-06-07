/* ── core data models ── */

export interface LayerData {
  name: string;
  material: string;
  thickness: number;       // metres
  color: string;           // hex
  description: string;
  modelPath?: string;      // GLB file path
  layerObjectName?: string; // object name inside shared GLB
  excludeNames?: string[];  // hide these named objects (for non-interactive "rest" layer)
  interactive?: boolean;    // false → no hover/click/lift (default true)
  explodeDirection?: string; // "auto" or specific axis for per-layer explosion
  explodeDistance?: number;  // explosion move distance in metres (per-layer)
}

export interface NodeData {
  id: string;
  title: string;
  description: string;
  directionLabel?: string;  // optional — not meaningful for single-layer nodes
  layers: LayerData[];
  explodeAxis?: string | null;     // null → disable explosion
  floatDirection?: string | null;  // null → disable float-on-select
  floatDistance?: number;
  modelRotation?: number[];
  cameraPosition?: number[];
  layerOrderReverse?: boolean;
  diagramImage?: string;   // URL or path to section diagram
  diagramHotspots?: Array<{ x: number; y: number; width: number; height: number; layerIndex: number }>;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  available: boolean;
  nodeIds?: string[];
}

export interface SectionData {
  id: string;
  title: string;
  available: boolean;
  description?: string;
  nodeId?: string;
}

export interface Note {
  id: string;
  nodeId: string;
  nodeTitle: string;
  image: string;           // data URL
  text: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  role: "user" | "developer";
  full_name?: string;
  email?: string;
}

export interface ClassData {
  id: string;
  name: string;
  join_code: string;
  teacher_id: string;
  created_at: string;
}

/* ── background scene config ── */

export interface BackgroundScene {
  id: string;
  name: string;
  modelPath: string;
  position: number[];
}

export interface SpatialCardData {
  layer: LayerData;
  worldPosition: number[];
  layerIndex: number;
}

export interface ModelInteractionState {
  explodeValue: number;
  autoRotate: boolean;
  isOrthographic: boolean;
  hoveredLayer: number | null;
  selectedLayer: number | null;
  screenshotMode: boolean;
  showLabels: boolean;
  syncZoom: boolean;
  viewTarget: string | null;
  spatialCard: SpatialCardData | null;
}

export interface PanelState {
  knowledgePanelExpanded: number;
  panelMode: string;
}

export interface GameState {
  slotOccupants: Map<number, number>;
  verifiedSlots: Map<number, boolean>;
  cardOrder: number[];
  activeLayerIdx: number;
  done: boolean;
}
