import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { type Repository } from "../lib/repositoryData";
import { calculateParticlePosition } from "../lib/funnelUtils";

interface SonarPingProps {
  repo: Repository;
  repositories: Repository[];
}

export default function SonarPing({ repo, repositories }: SonarPingProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  const position = useMemo(() => {
    return calculateParticlePosition(repo, repositories);
  }, [repo, repositories]);

  useFrame((state) => {
    if (meshRef.current && materialRef.current) {
      const t = state.clock.elapsedTime;
      // Loop every 1 second
      const progress = t % 1.0;

      // Expand from 1x to 4x scale
      const scale = 1.0 + progress * 8.0;
      meshRef.current.scale.set(scale, scale, scale);

      // Look at camera to ensure the ring is always visible flat-on
      meshRef.current.lookAt(state.camera.position);

      // Fade out as it expands
      // Opacity starts at 0.8 and goes to 0
      materialRef.current.opacity = 0.8 * (1.0 - progress);
    }
  });

  return (
    <mesh ref={meshRef} position={[position.x, position.y, position.z]}>
      <ringGeometry args={[2.0, 2.2, 32]} />
      <meshBasicMaterial
        ref={materialRef}
        color="#00fff9" // Cyan color to match the theme
        transparent
        opacity={0.8}
        side={THREE.DoubleSide}
        depthWrite={false} // Don't occlude other objects
      />
    </mesh>
  );
}
