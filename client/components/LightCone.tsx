import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import particleVertexShader from "../shaders/particleVertex.glsl?raw";
import particleFragmentShader from "../shaders/particleFragment.glsl?raw";

const PARTICLE_COUNT = 50000;
const START_YEAR = 2008;
const END_YEAR = 2025;

const LANGUAGE_COLORS = {
  javascript: new THREE.Color(0x4a90e2),
  ruby: new THREE.Color(0xe85d75),
  go: new THREE.Color(0x00d9ff),
  rust: new THREE.Color(0xff6b35),
  python: new THREE.Color(0x3572a5),
  typescript: new THREE.Color(0x2b7489),
  java: new THREE.Color(0xb07219),
  cpp: new THREE.Color(0xf34b7d),
  other: new THREE.Color(0xf2f2f2),
};

const LANGUAGES = Object.values(LANGUAGE_COLORS);

function mapTimeToLog(year: number): number {
  const t = (year - START_YEAR) / (END_YEAR - START_YEAR);
  return Math.log(1 + t * 9) / Math.log(10);
}

export default function LightCone() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const particleData = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const pulses = new Float32Array(PARTICLE_COUNT);
    const activities = new Float32Array(PARTICLE_COUNT);
    const matrices = [];

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

      const languageColor = LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)];
      colors[i * 3] = languageColor.r;
      colors[i * 3 + 1] = languageColor.g;
      colors[i * 3 + 2] = languageColor.b;

      const popularity = Math.pow(Math.random(), 3);
      sizes[i] = 2 + popularity * 8;

      pulses[i] = Math.random();
      activities[i] = 0.5 + Math.random() * 1.5;

      const matrix = new THREE.Matrix4();
      matrix.setPosition(x, y, z);
      matrices.push(matrix);
    }

    return { positions, colors, sizes, pulses, activities, matrices };
  }, []);

  useEffect(() => {
    if (meshRef.current) {
      particleData.matrices.forEach((matrix, i) => {
        meshRef.current!.setMatrixAt(i, matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [particleData]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]} frustumCulled={true}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      >
        <instancedBufferAttribute
          attach="attributes-size"
          args={[particleData.sizes, 1]}
        />
        <instancedBufferAttribute
          attach="attributes-color"
          args={[particleData.colors, 3]}
        />
        <instancedBufferAttribute
          attach="attributes-pulse"
          args={[particleData.pulses, 1]}
        />
        <instancedBufferAttribute
          attach="attributes-activity"
          args={[particleData.activities, 1]}
        />
      </shaderMaterial>
    </instancedMesh>
  );
}
