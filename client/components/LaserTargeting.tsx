import { useState, useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import LaserBeam from "./LaserBeam";
import TargetingReticle from "./TargetingReticle";

interface LaserTargetingProps {
  searchActive: boolean;
  searchQuery: string;
  hoveredParticle: THREE.Vector3 | null;
}

export default function LaserTargeting({ 
  searchActive, 
  searchQuery,
  hoveredParticle 
}: LaserTargetingProps) {
  const { camera } = useThree();
  const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(null);
  const [startPosition, setStartPosition] = useState(new THREE.Vector3(0, -20, 30));

  useEffect(() => {
    // Update search bar position in world space
    const searchBarWorldPos = new THREE.Vector3(0, -20, 30);
    setStartPosition(searchBarWorldPos);
  }, []);

  useEffect(() => {
    if (searchActive && searchQuery) {
      // Simulate finding a target repository
      // In real implementation, this would raycast to actual particles
      const randomTarget = new THREE.Vector3(
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 80
      );
      setTargetPosition(randomTarget);
    } else if (hoveredParticle) {
      setTargetPosition(hoveredParticle);
    } else {
      setTargetPosition(null);
    }
  }, [searchActive, searchQuery, hoveredParticle]);

  const isSearching = searchActive && searchQuery.length > 0;
  const isHovering = !isSearching && hoveredParticle !== null;

  return (
    <>
      {targetPosition && (
        <>
          <LaserBeam
            start={startPosition}
            end={targetPosition}
            intensity={isSearching ? 1.0 : 0.5}
            color={isSearching ? "#00fff9" : "#00fff980"}
            visible={true}
          />
          
          {isSearching && (
            <TargetingReticle
              position={targetPosition}
              visible={true}
            />
          )}
        </>
      )}
    </>
  );
}
