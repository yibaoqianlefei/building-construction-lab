// 未来扩展：
// - 当模型替换为多个独立层时，可启用 explode 功能（需传入 layers 数组）
// - 可添加 onLayerClick 回调实现点击高亮
// - 可集成 ConstructionLayer 组件支持逐层交互

import { useRef, useEffect, Suspense, useMemo, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Component } from "react";
import { assetPath } from "../../utils/baseUrl";

/* ── error boundary for GLB loading ── */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error) { console.warn("[MenuBackground] GLB load error:", error.message); }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function SceneModelPlaceholder() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#e6dfd8" wireframe />
    </mesh>
  );
}

/* ── model loader ── */
function SceneModel({ modelPath, onReady }) {
  const { scene } = useGLTF(assetPath(modelPath), true);  /* Draco enabled */

  useEffect(() => { if (scene) onReady?.(); }, [scene, onReady]);

  const fixed = useMemo(() => {
    if (!scene) return null;
    const cloned = scene.clone(true);
    const bbox = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    bbox.getCenter(center);

    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.renderOrder = 0;
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat) => {
          mat.depthWrite = true;
          mat.depthTest = true;
          mat.transparent = false;
          mat.polygonOffset = true;
          mat.polygonOffsetFactor = 1;
          mat.polygonOffsetUnits = 1;
          mat.needsUpdate = true;
        });
      }
    });
    cloned.position.set(-center.x, -center.y, -center.z);
    return cloned;
  }, [scene]);

  if (!fixed) return <PlaceholderCube />;
  return <primitive object={fixed} />;
}

function PlaceholderCube() {
  return (
    <mesh>
      <boxGeometry args={[1.2, 1.2, 0.6]} />
      <meshStandardMaterial color="#9CA3AF" roughness={0.6} metalness={0.1} />
    </mesh>
  );
}

/* ── shadow light ── */
function ShadowLight() {
  return (
    <directionalLight
      position={[6, 10, 4]}
      intensity={2.4}
      color="#fffdf7"
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-near={0.5}
      shadow-camera-far={20}
      shadow-camera-left={-3}
      shadow-camera-right={3}
      shadow-camera-top={3}
      shadow-camera-bottom={-3}
      shadow-bias={-0.0002}
    />
  );
}

/* ── renderer config ── */
function RendererSetup() {
  const { gl } = useThree();
  useEffect(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFShadowMap;  /* faster than PCFSoft */
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.0;
  }, [gl]);
  return null;
}

function ShadowPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]} receiveShadow renderOrder={1}>
      <planeGeometry args={[12, 12]} />
      <shadowMaterial opacity={0.2} transparent depthWrite={false} />
    </mesh>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1.2, 1.2, 0.6]} />
      <meshStandardMaterial color="#cc785c" wireframe transparent opacity={0.3} depthWrite={false} />
    </mesh>
  );
}

function MenuBackground({ autoRotate = true, modelPath = "/models/Exhibition model.glb", position = [0, 0, 0], onLoaded }) {
  const groupRef = useRef();

  /* preload + handle model-ready callback */
  const handleSceneReady = useCallback(() => onLoaded?.(), [onLoaded]);

  useEffect(() => {
    useGLTF.preload(assetPath(modelPath), true);
  }, [modelPath]);

  return (
    <>
      <RendererSetup />
      <color attach="background" args={["#faf9f5"]} />

      <ambientLight intensity={1.2} color="#ffffff" />
      <ShadowLight />
      <directionalLight position={[-5, 3, -3]} intensity={0.6} color="#d4e3f0" />

      <ShadowPlane />

      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
        minDistance={0.5}
        maxDistance={15}
        maxPolarAngle={Math.PI / 2}
        target={[0, 0.5, 0]}
      />

      <group ref={groupRef} position={position} scale={1.5}>
        <Suspense fallback={<LoadingFallback />}>
          <ErrorBoundary fallback={<SceneModelPlaceholder />}>
            <SceneModel modelPath={modelPath} onReady={handleSceneReady} />
          </ErrorBoundary>
        </Suspense>
      </group>
    </>
  );
}

export default MenuBackground;
