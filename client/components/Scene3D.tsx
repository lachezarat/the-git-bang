import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";

function RotatingNode({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial
        color="#00fff9"
        emissive="#00fff9"
        emissiveIntensity={0.5}
        wireframe
      />
    </mesh>
  );
}

function ConnectionLine({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
  const points = [start, end];
  
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flat())}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#00fff9" opacity={0.3} transparent />
    </line>
  );
}

export default function Scene3D() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  const nodes: [number, number, number][] = [
    [0, 0, 0],
    [2, 1, 0],
    [-2, 1, 0],
    [0, -1, 2],
    [1, 1, -2],
    [-1, -1, -1],
  ];

  return (
    <group ref={groupRef}>
      {nodes.map((pos, i) => (
        <RotatingNode key={i} position={pos} />
      ))}

      <ConnectionLine start={nodes[0]} end={nodes[1]} />
      <ConnectionLine start={nodes[0]} end={nodes[2]} />
      <ConnectionLine start={nodes[0]} end={nodes[3]} />
      <ConnectionLine start={nodes[1]} end={nodes[4]} />
      <ConnectionLine start={nodes[2]} end={nodes[5]} />

      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[3, 0.05, 16, 100]} />
        <meshStandardMaterial
          color="#ff006e"
          emissive="#ff006e"
          emissiveIntensity={0.3}
          wireframe
        />
      </mesh>

      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.5, 0.03, 16, 100]} />
        <meshStandardMaterial
          color="#ffba08"
          emissive="#ffba08"
          emissiveIntensity={0.2}
          wireframe
        />
      </mesh>
    </group>
  );
}
