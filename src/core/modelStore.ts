import { create } from 'zustand';

export interface LayerState {
  id: string;
  name: string;
  initialPos: [number, number, number]; // 构件在原始模型中的世界坐标
  thickness: number;
  explodeDirection?: [number, number, number]; // 独立爆炸方向（案例节点）
  explodeDistance?: number;
}

export interface ModelState {
  layers: LayerState[];
  explodeValue: number;
  selectedLayerId: string | null;
  hoveredLayerId: string | null;
  viewMode: 'persp' | 'ortho';
  // Actions
  setExplodeValue: (v: number) => void;
  setSelectedLayerId: (id: string | null) => void;
  setHoveredLayerId: (id: string | null) => void;
  setViewMode: (mode: 'persp' | 'ortho') => void;
  setLayers: (layers: LayerState[]) => void;
}

export const useModelStore = create<ModelState>((set) => ({
  layers: [],
  explodeValue: 0,
  selectedLayerId: null,
  hoveredLayerId: null,
  viewMode: 'ortho', // 默认正交
  setExplodeValue: (v) => set({ explodeValue: v }),
  setSelectedLayerId: (id) => set({ selectedLayerId: id }),
  setHoveredLayerId: (id) => set({ hoveredLayerId: id }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setLayers: (layers) => set({ layers }),
}));
