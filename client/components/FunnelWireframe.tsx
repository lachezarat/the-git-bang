import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const LONGITUDINAL_LINES = 16;
const RING_COUNT = 16;

export default function FunnelWireframe() {
  const groupRef = useRef<THREE.Group>(null);

  const { longitudinalGeometries, ringGeometries } = useMemo(() => {
    const longitudinalGeometries: THREE.BufferGeometry[] = [];
    const ringGeometries: THREE.BufferGeometry[] = [];

    // Funnel parameters
    const startX = -62.5;
    const endX = 62.5;
    const startRadius = 2.5; // Narrow on the left
    const endRadius = 37.5; // Wide on the right

    // Create longitudinal lines (running the length of the funnel)
    for (let i = 0; i < LONGITUDINAL_LINES; i++) {
      const angle = (i / LONGITUDINAL_LINES) * Math.PI * 2;
      const points: THREE.Vector3[] = [];

      // Create points along the length
      const segments = 64;
      for (let j = 0; j <= segments; j++) {
        const t = j / segments;
        const x = startX + (endX - startX) * t;
        const radius = startRadius + (endRadius - startRadius) * t;
        
        const y = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        points.push(new THREE.Vector3(x, y, z));
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      longitudinalGeometries.push(geometry);
    }

    // Create circular cross-section rings
    for (let i = 0; i <= RING_COUNT; i++) {
      const t = i / RING_COUNT;
      const x = startX + (endX - startX) * t;
      const radius = startRadius + (endRadius - startRadius) * t;

      const points: THREE.Vector3[] = [];
      const segments = 64;
      
      for (let j = 0; j <= segments; j++) {
        const angle = (j / segments) * Math.PI * 2;
        const y = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        points.push(new THREE.Vector3(x, y, z));
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      ringGeometries.push(geometry);
    }

    return { longitudinalGeometries, ringGeometries };
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle breathing effect on the wireframe
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      groupRef.current.scale.setScalar(breathe);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Longitudinal lines */}
      {longitudinalGeometries.map((geometry, i) => (
        <line key={`long-${i}`} geometry={geometry}>
          <lineBasicMaterial
            color="#00fff9"
            transparent
            opacity={0.25}
            linewidth={1}
          />
        </line>
      ))}

      {/* Ring cross-sections */}
      {ringGeometries.map((geometry, i) => (
        <line key={`ring-${i}`} geometry={geometry}>
          <lineBasicMaterial
            color="#00fff9"
            transparent
            opacity={0.2}
            linewidth={1}
          />
        </line>
      ))}

      {/* Add glowing meshes for enhanced visibility */}
      {longitudinalGeometries.map((geometry, i) => (
        <line key={`glow-long-${i}`} geometry={geometry}>
          <lineBasicMaterial
            color="#00fff9"
            transparent
            opacity={0.1}
            linewidth={2}
            blending={THREE.AdditiveBlending}
          />
        </line>
      ))}
    </group>
  );
}
