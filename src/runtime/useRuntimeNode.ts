/* ── V6 useRuntimeNode ──
   React hook: layers[] → pre-loaded model data + lifecycle.
   Integrates AssetManager with ConstructionLayer rendering. */

import { useState, useEffect, useRef } from "react";
import { assetManager } from "./AssetManager";
import * as THREE from "three";

export interface RuntimeLayerData {
  /** Original layer config */
  layer: any;
  /** Index in layers array */
  index: number;
  /** Pre-computed base position */
  basePosition: number;
  /** Loaded model clone for rendering */
  model: THREE.Object3D | null;
  /** Whether model is done loading */
  modelReady: boolean;
  /** Error message if model load failed */
  modelError: string | null;
}

export interface RuntimeNodeState {
  nodeId: string;
  layers: RuntimeLayerData[];
  allReady: boolean;
  glbPath: string | null;
}

/**
 * Hook: given a node's layers array, load all GLB models via AssetManager.
 * Returns RuntimeLayerData[] for ConstructionLayer to render.
 * Automatically cleans up on node change or unmount.
 */
export function useRuntimeNode(
  nodeId: string,
  layers: any[],
): RuntimeNodeState {
  const [runtimeLayers, setRuntimeLayers] = useState<RuntimeLayerData[]>([]);
  const [allReady, setAllReady] = useState(false);
  const lastNodeId = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    /* cleanup previous node */
    if (lastNodeId.current && lastNodeId.current !== nodeId) {
      for (const rl of runtimeLayers) {
        assetManager.releaseLayer(lastNodeId.current);
      }
    }
    lastNodeId.current = nodeId;

    /* compute base positions */
    let offset = 0;
    const total = layers.reduce((s: number, l: any) => s + (l.thickness || 0), 0);
    const initialData: RuntimeLayerData[] = layers.map((layer: any, i: number) => {
      const pos = offset + (layer.thickness || 0) / 2 - total / 2;
      offset += layer.thickness || 0;
      return {
        layer,
        index: i,
        basePosition: pos,
        model: null,
        modelReady: false,
        modelError: null,
      };
    });

    setRuntimeLayers(initialData);
    setAllReady(false);

    /* collect unique GLB paths (deduplicate shared GLB) */
    const glbPaths = new Set<string>();
    for (const layer of layers) {
      if (layer.modelPath) glbPaths.add(layer.modelPath);
    }

    if (glbPaths.size === 0) {
      /* no GLB models — all procedural */
      setAllReady(true);
      return;
    }

    /* load all GLBs and build runtime data */
    async function loadAll() {
      const updated = [...initialData];

      for (const glbPath of glbPaths) {
        try {
          /* register node in AssetManager (loads GLB + indexes objects) */
          await assetManager.registerNode(nodeId, glbPath);
        } catch (e: any) {
          console.error(`[useRuntimeNode] Failed to load ${glbPath}:`, e.message);
          /* mark all layers using this path as errored */
          for (let i = 0; i < updated.length; i++) {
            if (updated[i].layer.modelPath === glbPath) {
              updated[i].modelError = e.message;
              updated[i].modelReady = true; // stop waiting
            }
          }
        }
      }

      /* now get clones for each layer */
      for (let i = 0; i < updated.length; i++) {
        const layer = updated[i].layer;
        if (!layer.modelPath) {
          updated[i].modelReady = true; // procedural layer
          continue;
        }

        try {
          const clone = assetManager.getClone(
            nodeId,
            layer.layerObjectName,
            layer.excludeNames
          );
          updated[i].model = clone;
          updated[i].modelReady = true;
        } catch (e: any) {
          updated[i].modelError = e.message;
          updated[i].modelReady = true;
        }
      }

      if (!cancelled) {
        setRuntimeLayers(updated);
        setAllReady(true);
      }
    }

    loadAll();

    return () => {
      cancelled = true;
      /* release all layers for this node */
      for (const glbPath of glbPaths) {
        assetManager.releaseLayer(nodeId);
      }
    };
  }, [nodeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const glbPath = layers.find((l: any) => l.modelPath)?.modelPath || null;

  return { nodeId, layers: runtimeLayers, allReady, glbPath };
}
