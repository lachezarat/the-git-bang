import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import LightCone from "./LightCone";

function ConeGuides() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[15, 0.03, 16, 100]} />
        <meshStandardMaterial
          color="#ff006e"
          emissive="#ff006e"
          emissiveIntensity={0.2}
          wireframe
          transparent
          opacity={0.25}
        />
      </mesh>

      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[15, 0.03, 16, 100]} />
        <meshStandardMaterial
          color="#ffba08"
          emissive="#ffba08"
          emissiveIntensity={0.2}
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>

      <mesh position={[25, 0, 0]}>
        <torusGeometry args={[1.0, 0.08, 16, 32]} />
        <meshStandardMaterial
          color="#00fff9"
          emissive="#00fff9"
          emissiveIntensity={0.5}
          wireframe
        />
      </mesh>

      <mesh position={[-25, 0, 0]}>
        <torusGeometry args={[0.3, 0.05, 16, 32]} />
        <meshStandardMaterial
          color="#00fff9"
          emissive="#00fff9"
          emissiveIntensity={0.5}
          wireframe
        />
      </mesh>

      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([-25, 0, 0, 25, 0, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#00fff9" opacity={0.3} transparent />
      </line>

      <group position={[-25, 0, 0]}>
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <line key={i}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={
                    new Float32Array([
                      0,
                      0,
                      0,
                      50 * Math.cos(angle * 0.8),
                      50 * Math.sin(angle) * 1.2,
                      50 * Math.cos(angle) * 0.8,
                    ])
                  }
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#00fff9" opacity={0.04} transparent />
            </line>
          );
        })}
      </group>
    </group>
  );
}

export default function Scene3D() {
  return (
    <group>
      <LightCone />
      <ConeGuides />
    </group>
  );
}
