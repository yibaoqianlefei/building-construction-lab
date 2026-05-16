import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Grid, Edges } from "@react-three/drei";
import * as THREE from "three";
import externalWallData from "../../data/externalWall";

function ShadowLight({ targetRef }) {
  const lightRef = useRef();

  return (
    <directionalLight
      ref={lightRef}
      position={[8, 12, 6]}
      intensity={2.5}
      color="#fffdf7"
      castShadow
      shadow-mapSize-width={4096}
      shadow-mapSize-height={4096}
      shadow-camera-near={0.5}
      shadow-camera-far={30}
      shadow-camera-left={-8}
      shadow-camera-right={8}
      shadow-camera-top={8}
      shadow-camera-bottom={-8}
      shadow-bias={-0.00015}
    />
  );
}

function RendererSetup() {
  const { gl } = useThree();

  useEffect(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.toneMapping = THREE.CineonToneMapping;
    gl.toneMappingExposure = 0.9;
  }, [gl]);

  return null;
}

function ShadowPlane() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.78, 0]}
      receiveShadow
    >
      <planeGeometry args={[8, 8]} />
      <shadowMaterial opacity={0.3} />
    </mesh>
  );
}

function MenuBackground() {
  const groupRef = useRef();
  const { layers } = externalWallData;
  const totalWidth = layers.reduce((sum, l) => sum + l.thickness, 0);

  const layerPositions = (() => {
    let offset = 0;
    return layers.map((layer) => {
      const x = offset + layer.thickness / 2 - totalWidth / 2;
      offset += layer.thickness;
      return x;
    });
  })();

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.2;
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.5) * 0.08;
    }
  });

  return (
    <>
      <RendererSetup />

      <color attach="background" args={["#f5f5f7"]} />

      <ambientLight intensity={1.2} color="#ffffff" />

      <ShadowLight targetRef={groupRef} />

      <directionalLight
        position={[-6, 3, -4]}
        intensity={0.8}
        color="#d4e3f0"
      />

      <directionalLight
        position={[0, 10, 2]}
        intensity={0.6}
        color="#ffffff"
      />

      <ShadowPlane />

      <group ref={groupRef}>
        {layers.map((layer, i) => (
          <mesh
            key={layer.name}
            position={[layerPositions[i], 0, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[layer.thickness, 1.4, 0.7]} />
            <meshStandardMaterial
              color={layer.color}
              transparent={layer.name.includes("空气")}
              opacity={layer.name.includes("空气") ? 0.3 : 1}
              roughness={0.5}
              metalness={0.05}
              depthWrite={layer.name.includes("空气") ? false : true}
            />
            <Edges scale={1}>
              <lineBasicMaterial
                color="#9CA3AF"
                transparent
                opacity={0.4}
              />
            </Edges>
          </mesh>
        ))}
      </group>

      <Grid
        position={[0, -1.2, 0]}
        args={[10, 10]}
        cellSize={0.2}
        cellThickness={0.5}
        cellColor="#e5e7eb"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#d1d5db"
        fadeDistance={8}
        infinite
      />
    </>
  );
}

export default MenuBackground;
