/* ── core data models ── */

export interface LayerData {
  name: string;
  material: string;
  thickness: number;       // metres
  color: string;           // hex
  description: string;
  modelPath?: string;      // GLB file path
  layerObjectName?: string; // object name inside shared GLB
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
