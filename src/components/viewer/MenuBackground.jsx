import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Grid, Edges } from "@react-three/drei";
import externalWallData from "../../data/externalWall";

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
      groupRef.current.rotation.y = clock.elapsedTime * 0.25;
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.5) * 0.08;
    }
  });

  return (
    <>
      <color attach="background" args={["#f8f9fa"]} />

      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 8, 5]} intensity={1.1} castShadow />
      <directionalLight position={[-3, 2, -4]} intensity={0.3} />

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
              roughness={0.7}
              metalness={0.03}
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
