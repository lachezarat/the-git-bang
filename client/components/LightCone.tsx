import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { generateParticlesFromRepositories, getLanguageColor, calculatePopularity, type Repository } from "../lib/repositoryData";

const PARTICLE_COUNT = 25000;
const START_YEAR = 2008;
const END_YEAR = 2025;

function mapTimeToLog(year: number): number {
  const t = (year - START_YEAR) / (END_YEAR - START_YEAR);
  return Math.log(1 + t * 9) / Math.log(10);
}

const particleVertexShader = `
uniform float uTime;
uniform float uPixelRatio;

attribute float size;
attribute vec3 customColor;
attribute float pulse;
attribute float activity;
attribute float brightness;

varying vec3 vColor;
varying float vPulse;
varying float vBrightness;

void main() {
  vColor = customColor;
  vBrightness = brightness;

  float pulseIntensity = 0.5 + 0.5 * sin(uTime * activity * 2.0 + pulse * 6.28318);
  vPulse = pulseIntensity;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  gl_Position = projectionMatrix * mvPosition;

  gl_PointSize = size * uPixelRatio * (300.0 / -mvPosition.z) * (0.8 + 0.4 * pulseIntensity);
}
`;

const particleFragmentShader = `
varying vec3 vColor;
varying float vPulse;
varying float vBrightness;

void main() {
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);

  if (dist > 0.5) {
    discard;
  }

  float glow = 1.0 - dist * 2.0;
  glow = pow(glow, 2.5);

  float aberration = 0.025;

  float distR = length(center - vec2(aberration, 0.0));
  float glowR = 1.0 - distR * 2.0;
  glowR = pow(max(glowR, 0.0), 2.5);

  float distB = length(center + vec2(aberration, 0.0));
  float glowB = 1.0 - distB * 2.0;
  glowB = pow(max(glowB, 0.0), 2.5);

  vec3 finalColor = vec3(
    vColor.r * glowR,
    vColor.g * glow,
    vColor.b * glowB
  );

  // Apply brightness based on star count (popularity)
  // Popular repos (high brightness) shine brighter, less popular are dimmer
  finalColor *= (0.3 + 0.7 * vBrightness);

  finalColor *= (0.6 + 0.4 * vPulse);

  float core = 1.0 - smoothstep(0.0, 0.15, dist);
  finalColor += vec3(1.0) * core * 0.6 * vBrightness;

  // Alpha also affected by brightness - dimmer stars are more transparent
  float alpha = glow * (0.7 + 0.3 * vPulse) * (0.4 + 0.6 * vBrightness);

  gl_FragColor = vec4(finalColor, alpha);
}
`;

interface LightConeProps {
  particlesRef?: React.RefObject<THREE.Points>;
  repositories?: Repository[];
}

export default function LightCone({ particlesRef, repositories = [] }: LightConeProps = {}) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Use provided ref or internal ref
  const activeRef = particlesRef || pointsRef;

  const { geometry, uniforms } = useMemo(() => {
    // If no repositories provided, return empty geometry
    if (repositories.length === 0) {
      const emptyGeometry = new THREE.BufferGeometry();
      const emptyUniforms = {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      };
      return { geometry: emptyGeometry, uniforms: emptyUniforms };
    }

    // Generate particles from repository data
    const particleRepos = generateParticlesFromRepositories(repositories, PARTICLE_COUNT);
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const pulses = new Float32Array(PARTICLE_COUNT);
    const activities = new Float32Array(PARTICLE_COUNT);
    const brightnesses = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const repo = particleRepos[i];

      // Map repository year to position along funnel
      const logT = mapTimeToLog(repo.year);

      // X position along funnel length
      const x = logT * 125 - 62.5;

      // Funnel radius: starts at 2.5 (narrow left) and expands to 37.5 (wide right)
      const startRadius = 2.5;
      const endRadius = 37.5;
      const funnelRadius = startRadius + (endRadius - startRadius) * logT;

      // Random position within circular cross-section
      const angle = Math.random() * Math.PI * 2;
      // Use square root for uniform distribution within circle
      const radiusOffset = Math.sqrt(Math.random()) * funnelRadius;

      const y = Math.cos(angle) * radiusOffset;
      const z = Math.sin(angle) * radiusOffset;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Get language-specific color
      const languageColor = new THREE.Color(getLanguageColor(repo.language));
      colors[i * 3] = languageColor.r;
      colors[i * 3 + 1] = languageColor.g;
      colors[i * 3 + 2] = languageColor.b;

      // Calculate popularity from actual star count
      const popularity = calculatePopularity(repo.stars);
      sizes[i] = 2.0 + popularity * 8;

      // Brightness correlates with popularity (star count)
      brightnesses[i] = popularity;

      pulses[i] = Math.random();
      // Activity from actual repo metrics
      activities[i] = repo.activity / 100;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('pulse', new THREE.BufferAttribute(pulses, 1));
    geometry.setAttribute('activity', new THREE.BufferAttribute(activities, 1));
    geometry.setAttribute('brightness', new THREE.BufferAttribute(brightnesses, 1));

    const uniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    };

    return { geometry, uniforms };
  }, [repositories]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points ref={activeRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
