import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { type Repository, calculatePopularity } from "../lib/repositoryData";

const DEFAULT_PARTICLE_COUNT = 25000;
const END_TIME = new Date("2025-12-31").getTime();

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

  // Sharper glow, less blur
  float glow = 1.0 - dist * 2.0;
  glow = pow(glow, 3.5); // Increased power for sharper falloff

  float aberration = 0.015; // Reduced aberration for cleaner look

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

  // Apply brightness based on star count (popularity)
  // High contrast: Popular repos shine very bright, small ones are dim
  float brightnessFactor = pow(vBrightness, 1.5); // Non-linear brightness curve
  finalColor *= (0.2 + 2.0 * brightnessFactor) / 1.5; // Reduced brightness by 20%

  finalColor *= (0.8 + 0.2 * vPulse); // Subtle pulse

  // Solid core for better visibility
  float core = 1.0 - smoothstep(0.0, 0.1, dist);
  finalColor += vec3(1.0) * core * (0.4 + 0.4 * brightnessFactor);

  // Alpha also affected by brightness - dimmer stars are more transparent
  // Make small stars much more transparent to reduce noise
  float alpha = glow * (0.6 + 0.4 * vPulse) * (0.3 + 0.7 * brightnessFactor);

  gl_FragColor = vec4(finalColor, alpha);
}
`;

interface LightConeProps {
  particlesRef?: React.RefObject<THREE.Points>;
  repositories?: Repository[];
}

export default function LightCone({
  particlesRef,
  repositories = [],
}: LightConeProps = {}) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Use provided ref or internal ref
  const activeRef = particlesRef || pointsRef;

  const { geometry, uniforms } = useMemo(() => {
    const count =
      repositories.length > 0 ? repositories.length : DEFAULT_PARTICLE_COUNT;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const pulses = new Float32Array(count);
    const activities = new Float32Array(count);
    const brightnesses = new Float32Array(count);

    // Calculate start time based on earliest repository
    const startTime =
      repositories.length > 0
        ? Math.min(...repositories.map((r) => r.createdAt))
        : new Date("2011-01-01").getTime();

    // Reusable color object
    const tempColor = new THREE.Color();

    for (let i = 0; i < count; i++) {
      let timestamp, popularity, normalizedSize;

      if (repositories.length > 0) {
        const repo = repositories[i];
        timestamp = repo.createdAt;
        popularity = calculatePopularity(repo.stars);

        // Set color from repo data
        tempColor.setHex(repo.color);
        colors[i * 3] = tempColor.r;
        colors[i * 3 + 1] = tempColor.g;
        colors[i * 3 + 2] = tempColor.b;

        // Calculate size based on stars using logarithmic scale
        // Max stars is around 400k
        const logStars = Math.log10(repo.stars + 1);
        const maxLogStars = 5.6; // log10(400000) approx 5.6

        // Normalize to 0-1 range
        normalizedSize = Math.max(0, Math.min(1, logStars / maxLogStars));
      } else {
        // Fallback random generation (should not happen with loaded data)
        timestamp = startTime + Math.random() * (END_TIME - startTime);
        popularity = Math.pow(Math.random(), 3);

        tempColor.setHSL(Math.random(), 0.8, 0.5);
        colors[i * 3] = tempColor.r;
        colors[i * 3 + 1] = tempColor.g;
        colors[i * 3 + 2] = tempColor.b;

        normalizedSize = Math.pow(Math.random(), 4);
      }

      // Map time to log scale
      const t = (timestamp - startTime) / (END_TIME - startTime);
      const clampedT = Math.max(0, Math.min(1, t));
      const logT = Math.log(1 + clampedT * 9) / Math.log(10);

      // X position along funnel length (scaled down by 1.083, extended 1.5x horizontally to match wireframe)
      // Original range: -93.75 to +93.75 (total 187.5)
      // After 1.083 scaling: -86.57 to +86.57 (total 173.15)
      // After 1.5x extension: -129.86 to +129.86 (total 259.72)
      const x = ((logT * 187.5 - 93.75) / 1.083) * 1.5;

      // Funnel radius: starts at 3.75 (narrow left) and expands to 56.25 (wide right)
      // Increased by 1.5x then scaled down by 1.083
      const startRadius = (3.75 * 1.5) / 1.083;
      const endRadius = (56.25 * 1.5) / 1.083;
      const funnelRadius = startRadius + (endRadius - startRadius) * logT;

      // Random position within circular cross-section
      // Use pre-calculated deterministic values from repo data if available
      let angle, radiusOffset;

      if (repositories.length > 0) {
        const repo = repositories[i];
        angle = repo.positionAngle;
        radiusOffset = repo.positionRadius * funnelRadius;
      } else {
        angle = Math.random() * Math.PI * 2;
        radiusOffset = Math.sqrt(Math.random()) * funnelRadius;
      }

      const y = Math.cos(angle) * radiusOffset;
      const z = Math.sin(angle) * radiusOffset;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Map to size range: min 1.5, max 12.0
      // We use a power function to make the very largest ones pop more
      sizes[i] = 1.5 + Math.pow(normalizedSize, 2) * 15.0;

      // Brightness correlates with popularity (star count)
      // Also use log scale for brightness so small repos aren't too dim
      brightnesses[i] = 0.2 + normalizedSize * 0.8;

      pulses[i] = Math.random();
      activities[i] = 0.5 + Math.random() * 1.5;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("customColor", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("pulse", new THREE.BufferAttribute(pulses, 1));
    geometry.setAttribute("activity", new THREE.BufferAttribute(activities, 1));
    geometry.setAttribute(
      "brightness",
      new THREE.BufferAttribute(brightnesses, 1),
    );

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
