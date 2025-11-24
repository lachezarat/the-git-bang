import { useMemo } from "react";
import * as THREE from "three";

const LONGITUDINAL_LINES = 16;
const RING_COUNT = 16;

export default function FunnelWireframe() {
  const { longitudinalGeometries, ringGeometries } = useMemo(() => {
    const longitudinalGeometries: THREE.BufferGeometry[] = [];
    const ringGeometries: THREE.BufferGeometry[] = [];

    // Funnel parameters (1.5x spacing, scaled down by 1.083 to match cone, extended 1.5x horizontally)
    const startX = (-93.75 / 1.083) * 1.5;
    const endX = (93.75 / 1.083) * 1.5;
    const startRadius = (3.75 * 1.5) / 1.083; // Narrow on the left
    const endRadius = (56.25 * 1.5) / 1.083; // Wide on the right

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

  return (
    <group>
      {/* Longitudinal lines */}
      {longitudinalGeometries.map((geometry, i) => (
        // @ts-ignore
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
        // @ts-ignore
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
        // @ts-ignore
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
