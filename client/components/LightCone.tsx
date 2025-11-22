import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

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

const particleVertexShader = `
uniform float uTime;
uniform float uPixelRatio;

attribute float size;
attribute vec3 color;
attribute float pulse;
attribute float activity;

varying vec3 vColor;
varying float vPulse;

void main() {
  vColor = color;
  
  float pulseIntensity = 0.5 + 0.5 * sin(uTime * activity * 2.0 + pulse * 6.28318);
  vPulse = pulseIntensity;
  
  vec4 modelPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  
  gl_Position = projectedPosition;
  
  gl_PointSize = size * uPixelRatio * (300.0 / -viewPosition.z) * (0.8 + 0.4 * pulseIntensity);
}
`;

const particleFragmentShader = `
varying vec3 vColor;
varying float vPulse;

float dither4x4(vec2 position, float brightness) {
  int x = int(mod(position.x, 4.0));
  int y = int(mod(position.y, 4.0));
  int index = x + y * 4;
  float limit = 0.0;
  
  if (index == 0) limit = 0.0625;
  else if (index == 1) limit = 0.5625;
  else if (index == 2) limit = 0.1875;
  else if (index == 3) limit = 0.6875;
  else if (index == 4) limit = 0.8125;
  else if (index == 5) limit = 0.3125;
  else if (index == 6) limit = 0.9375;
  else if (index == 7) limit = 0.4375;
  else if (index == 8) limit = 0.25;
  else if (index == 9) limit = 0.75;
  else if (index == 10) limit = 0.125;
  else if (index == 11) limit = 0.625;
  else if (index == 12) limit = 1.0;
  else if (index == 13) limit = 0.5;
  else if (index == 14) limit = 0.875;
  else if (index == 15) limit = 0.375;
  
  return brightness < limit ? 0.0 : 1.0;
}

void main() {
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);
  
  if (dist > 0.5) {
    discard;
  }
  
  float glow = 1.0 - dist * 2.0;
  glow = pow(glow, 2.0);
  
  float aberration = 0.02;
  
  float distR = length(center - vec2(aberration, 0.0));
  float glowR = 1.0 - distR * 2.0;
  glowR = pow(max(glowR, 0.0), 2.0);
  
  float distB = length(center + vec2(aberration, 0.0));
  float glowB = 1.0 - distB * 2.0;
  glowB = pow(max(glowB, 0.0), 2.0);
  
  vec3 finalColor = vec3(
    vColor.r * glowR,
    vColor.g * glow,
    vColor.b * glowB
  );
  
  finalColor *= (0.7 + 0.3 * vPulse);
  
  float core = 1.0 - smoothstep(0.0, 0.2, dist);
  finalColor += vec3(1.0) * core * 0.5;
  
  float brightness = (finalColor.r + finalColor.g + finalColor.b) / 3.0;
  float dither = dither4x4(gl_FragCoord.xy, brightness);
  
  finalColor = mix(finalColor, finalColor * dither, 0.15);
  
  gl_FragColor = vec4(finalColor, glow * (0.8 + 0.2 * vPulse));
}
`;

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
