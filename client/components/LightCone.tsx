import { useRef, useMemo } from "react";
import { useFrame, extend } from "@react-three/fiber";
import * as THREE from "three";
import { Points, PointMaterial } from "@react-three/drei";

const PARTICLE_COUNT = 50000;
const START_YEAR = 2008;
const END_YEAR = 2025;

function mapTimeToLog(year: number): number {
  const t = (year - START_YEAR) / (END_YEAR - START_YEAR);
  return Math.log(1 + t * 9) / Math.log(10);
}

export default function LightCone() {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);

    const languageColors = [
      new THREE.Color(0x4a90e2),
      new THREE.Color(0xe85d75),
      new THREE.Color(0x00d9ff),
      new THREE.Color(0xff6b35),
      new THREE.Color(0x3572a5),
      new THREE.Color(0x2b7489),
      new THREE.Color(0xb07219),
      new THREE.Color(0xf34b7d),
      new THREE.Color(0xf2f2f2),
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const year = START_YEAR + Math.random() * (END_YEAR - START_YEAR);
      const logT = mapTimeToLog(year);
      
      const x = logT * 30 - 15;
      
      const coneRadius = logT * 8;
      const angle = Math.random() * Math.PI * 2;
      const radiusOffset = Math.random() * coneRadius;
      
      const y = Math.cos(angle) * radiusOffset + (Math.random() - 0.5) * 2;
      const z = Math.sin(angle) * radiusOffset + (Math.random() - 0.5) * 2;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const languageColor = languageColors[Math.floor(Math.random() * languageColors.length)];
      colors[i * 3] = languageColor.r;
      colors[i * 3 + 1] = languageColor.g;
      colors[i * 3 + 2] = languageColor.b;
    }

    return [positions, colors];
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
