import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import LightCone from "./LightCone";
import FunnelWireframe from "./FunnelWireframe";
import * as THREE from "three";

interface Scene3DProps {
  searchActive?: boolean;
  searchQuery?: string;
}

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
        <torusGeometry args={[37.5, 0.04, 16, 100]} />
        <meshStandardMaterial
          color="#ff006e"
          emissive="#ff006e"
          emissiveIntensity={0.2}
          wireframe
          transparent
          opacity={0.2}
        />
      </mesh>

      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[37.5, 0.04, 16, 100]} />
        <meshStandardMaterial
          color="#ffba08"
          emissive="#ffba08"
          emissiveIntensity={0.2}
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>

      <mesh position={[62.5, 0, 0]}>
        <torusGeometry args={[2.5, 0.12, 16, 32]} />
        <meshStandardMaterial
          color="#00fff9"
          emissive="#00fff9"
          emissiveIntensity={0.5}
          wireframe
        />
      </mesh>

      <mesh position={[-62.5, 0, 0]}>
        <torusGeometry args={[0.75, 0.08, 16, 32]} />
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
            array={new Float32Array([-62.5, 0, 0, 62.5, 0, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#00fff9" opacity={0.25} transparent />
      </line>

      <group position={[-62.5, 0, 0]}>
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
                      125 * Math.cos(angle * 0.8),
                      125 * Math.sin(angle) * 1.2,
                      125 * Math.cos(angle) * 0.8,
                    ])
                  }
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#00fff9" opacity={0.03} transparent />
            </line>
          );
        })}
      </group>
    </group>
  );
}

export default function Scene3D({ searchActive = false, searchQuery = "" }: Scene3DProps) {
  return (
    <group>
      <FunnelWireframe />
      <LightCone />
      {/* <ConeGuides /> */}
    </group>
  );
}
