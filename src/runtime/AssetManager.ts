/* ── V6 Asset Manager ──
   Centralized GLB loading with object-name indexing.
   Load once → index by object name → clone per layer.
   Proper lifecycle: load / getClone / disposeNode / disposeAll. */

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { assetPath } from "../utils/baseUrl";

interface NodeAssets {
  glbPath: string;
  scene: THREE.Group;
  /** Index: objectName → mesh/group reference */
  objectMap: Map<string, THREE.Object3D>;
  layerCount: number;
}

export class AssetManager {
  private nodes = new Map</* nodeId */ string, NodeAssets>();
  private loader: GLTFLoader | null = null;
  private loading = new Map<string, Promise<THREE.Group>>();

  private getLoader(): GLTFLoader {
    if (!this.loader) {
      this.loader = new GLTFLoader();
      const draco = new DRACOLoader();
      draco.setDecoderPath(assetPath("/draco/gltf/"));
      this.loader.setDRACOLoader(draco);
    }
    return this.loader;
  }

  /** Load a GLB file (deduplicated). Returns the raw scene. */
  async loadGlb(modelPath: string): Promise<THREE.Group> {
    const path = modelPath.startsWith("/") ? modelPath : "/" + modelPath;
    const fullPath = assetPath(path);

    /* deduplicate concurrent loads */
    const pending = this.loading.get(fullPath);
    if (pending) return pending;

    const promise = this.getLoader().loadAsync(fullPath).then((gltf) => gltf.scene);
    this.loading.set(fullPath, promise);

    try {
      const scene = await promise;
      this.loading.delete(fullPath);
      return scene;
    } catch (e) {
      this.loading.delete(fullPath);
      throw e;
    }
  }

  /** Register a node's GLB and index its named objects */
  async registerNode(nodeId: string, glbPath: string): Promise<NodeAssets> {
    /* check if already registered */
    const existing = this.nodes.get(nodeId);
    if (existing) {
      existing.layerCount++;
      return existing;
    }

    const scene = await this.loadGlb(glbPath);

    /* index all named children */
    const objectMap = new Map<string, THREE.Object3D>();
    scene.traverse((child) => {
      if (child.name) objectMap.set(child.name, child);
    });

    const assets: NodeAssets = { glbPath, scene, objectMap, layerCount: 1 };
    this.nodes.set(nodeId, assets);
    return assets;
  }

  /** Get a safe clone of a named object for rendering */
  getClone(nodeId: string, objectName?: string, excludeNames?: string[]): THREE.Object3D | null {
    const assets = this.nodes.get(nodeId);
    if (!assets) {
      console.warn(`[AssetManager] Node "${nodeId}" not registered`);
      return null;
    }

    let source: THREE.Object3D;
    if (objectName) {
      const found = assets.objectMap.get(objectName);
      if (!found) {
        console.warn(`[AssetManager] Object "${objectName}" not found in ${nodeId}. Available: ${[...assets.objectMap.keys()].join(", ")}`);
        return null;
      }
      source = found;
    } else {
      source = assets.scene;
    }

    const cloned = source.clone(true);

    /* zero root position so wrapper group controls placement */
    if (objectName) {
      cloned.position.set(0, 0, 0);
    }

    /* hide excluded objects (for "rest of model" layer) */
    if (!objectName && excludeNames?.length) {
      cloned.traverse((child) => {
        if (child.name && excludeNames.includes(child.name)) {
          child.visible = false;
        }
      });
    }

    /* configure shadows */
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return cloned;
  }

  /** Release one layer reference. If no layers left, dispose the node. */
  releaseLayer(nodeId: string): void {
    const assets = this.nodes.get(nodeId);
    if (!assets) return;
    assets.layerCount--;
    if (assets.layerCount <= 0) {
      this.disposeNode(nodeId);
    }
  }

  /** Dispose a node's assets (geometry + textures + materials) */
  disposeNode(nodeId: string): void {
    const assets = this.nodes.get(nodeId);
    if (!assets) return;

    assets.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        for (const mat of mats) {
          if (!mat) continue;
          for (const key of Object.keys(mat)) {
            const val = (mat as any)[key];
            if (val instanceof THREE.Texture) val.dispose();
          }
          mat.dispose();
        }
      }
    });
    this.nodes.delete(nodeId);
  }

  /** Dispose everything */
  disposeAll(): void {
    for (const [id] of this.nodes) {
      this.disposeNode(id);
    }
    this.nodes.clear();
    this.loading.clear();
  }

  get size(): number {
    return this.nodes.size;
  }
}

/** Global singleton */
export const assetManager = new AssetManager();
