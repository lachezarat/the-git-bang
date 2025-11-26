import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { type Repository } from "../lib/repositoryData";
import { calculateParticlePosition } from "../lib/funnelUtils";

interface SelectionHaloProps {
  repo: Repository;
  repositories: Repository[];
}

export default function SelectionHalo({
  repo,
  repositories,
}: SelectionHaloProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const position = useMemo(() => {
    return calculateParticlePosition(repo, repositories);
  }, [repo, repositories]);

  useFrame((state) => {
    if (meshRef.current) {
      // Slow rotation
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x += 0.005;

      // Pulsing scale
      const t = state.clock.elapsedTime;
      const scale = 1 + Math.sin(t * 3) * 0.15;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <mesh ref={meshRef} position={[position.x, position.y, position.z]}>
      <sphereGeometry args={[2.5, 12, 12]} />
      <meshBasicMaterial color="#00fff9" wireframe transparent opacity={0.5} />
    </mesh>
  );
}
