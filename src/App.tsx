import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import {
  useGLTF,
  Center,
  OrbitControls,
  AccumulativeShadows,
  RandomizedLight,
  MeshRefractionMaterial,
  useEnvironment,
  Environment,
} from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  N8AO,
  ToneMapping,
} from "@react-three/postprocessing";
import { useControls } from "leva";

interface RingProps {
  frame: string;
  diamonds: string;
  env: THREE.Texture;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

function Ring({ frame, diamonds, env, ...props }: RingProps) {
  const { nodes, materials, scene } = useGLTF(
    "/models/3-stone-transformed.glb"
  );

  console.log("Model loading state:", { nodes, materials, scene });

  // Return null if the model hasn't loaded yet or if required nodes are missing
  if (!nodes || !materials || !nodes.mesh_0 || !nodes.mesh_9 || !nodes.mesh_4) {
    console.log("Required nodes or materials missing:", { nodes, materials });
    return null;
  }

  const mesh0 = nodes.mesh_0 as THREE.Mesh;
  const mesh9 = nodes.mesh_9 as THREE.Mesh;
  const mesh4 = nodes.mesh_4 as THREE.InstancedMesh;

  if (
    !mesh0.geometry ||
    !mesh9.geometry ||
    !mesh4.geometry ||
    !mesh4.instanceMatrix
  ) {
    console.log("Required geometries or instanceMatrix missing:", {
      mesh0: mesh0.geometry,
      mesh9: mesh9.geometry,
      mesh4: mesh4.geometry,
      instanceMatrix: mesh4.instanceMatrix,
    });
    return null;
  }

  return (
    <group {...props} dispose={null}>
      <mesh castShadow geometry={mesh0.geometry}>
        <meshStandardMaterial
          color={frame}
          roughness={0.15}
          metalness={1}
          envMapIntensity={1.5}
        />
      </mesh>
      <mesh
        castShadow
        geometry={mesh9.geometry}
        material={materials.WhiteMetal}
      />
      <instancedMesh
        castShadow
        args={[mesh4.geometry, undefined, 65]}
        instanceMatrix={mesh4.instanceMatrix}
      >
        <MeshRefractionMaterial
          color={diamonds}
          side={THREE.DoubleSide}
          envMap={env}
          aberrationStrength={0.02}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
}

function Scene() {
  const { shadow, frame, diamonds } = useControls({
    shadow: "#000000",
    frame: "#fff0f0",
    diamonds: "#ffffff",
  });

  const env = useEnvironment({
    files:
      "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/peppermint_powerplant_2_1k.hdr",
  });

  return (
    <>
      <Environment files={"/scenes/scene6.hdr"} background />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      />
      <group position={[0, -0.25, 0]}>
        <Center top position={[0, -0.12, 0]} rotation={[-0.1, 0, 0.085]}>
          <Ring frame={frame} diamonds={diamonds} env={env} scale={0.1} />
        </Center>
        <AccumulativeShadows
          temporal
          frames={100}
          color={shadow}
          opacity={1.05}
        >
          <RandomizedLight radius={5} position={[10, 5, -5]} />
        </AccumulativeShadows>
      </group>
      <OrbitControls
        enablePan={false}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2.25}
      />
      <EffectComposer>
        <N8AO aoRadius={0.15} intensity={4} distanceFalloff={2} />
        <Bloom
          luminanceThreshold={3.5}
          intensity={0.85}
          levels={9}
          mipmapBlur
        />
        <ToneMapping />
      </EffectComposer>
    </>
  );
}

export default function App() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: false }}
      camera={{ position: [-5, 5, 14], fov: 20 }}
    >
      <Scene />
    </Canvas>
  );
}
