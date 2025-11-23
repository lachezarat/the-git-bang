import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

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
}

export default function LightCone({ particlesRef }: LightConeProps = {}) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Use provided ref or internal ref
  const activeRef = particlesRef || pointsRef;

  const { geometry, uniforms } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const pulses = new Float32Array(PARTICLE_COUNT);
    const activities = new Float32Array(PARTICLE_COUNT);
    const brightnesses = new Float32Array(PARTICLE_COUNT);

    // Function to get color based on star count (like real stars in the universe)
    // Blue (cool/dim stars) → Cyan → White → Yellow → Orange → Red (hot/bright stars)
    const getColorFromStars = (stars: number): THREE.Color => {
      const logStars = Math.log10(stars + 1);

      // Color stops based on logarithmic star scale
      if (logStars < 1) { // 0-10 stars - Blue (cool, dim stars)
        return new THREE.Color("#4a90e2").lerp(new THREE.Color("#00d9ff"), logStars);
      } else if (logStars < 2) { // 10-100 stars - Cyan to White
        return new THREE.Color("#00d9ff").lerp(new THREE.Color("#ffffff"), logStars - 1);
      } else if (logStars < 3) { // 100-1000 stars - White to Yellow
        return new THREE.Color("#ffffff").lerp(new THREE.Color("#ffeb3b"), logStars - 2);
      } else if (logStars < 4) { // 1000-10000 stars - Yellow to Orange
        return new THREE.Color("#ffeb3b").lerp(new THREE.Color("#ff9800"), logStars - 3);
      } else { // 10000+ stars - Orange to Red (hot, bright giants)
        const t = Math.min((logStars - 4) / 1.5, 1);
        return new THREE.Color("#ff9800").lerp(new THREE.Color("#ff3d00"), t);
      }
    };

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Random year between 2008 and 2025 - distributed across entire timeline
      const year = START_YEAR + Math.random() * (END_YEAR - START_YEAR);
      const logT = mapTimeToLog(year);

      // X position along funnel length (1.5x spacing)
      const x = logT * 187.5 - 93.75;

      // Funnel radius: starts at 3.75 (narrow left) and expands to 56.25 (wide right) - 1.5x spacing
      const startRadius = 3.75;
      const endRadius = 56.25;
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

      // Generate star count with power law distribution (most repos are small, few are huge)
      // This creates a realistic distribution like real repositories
      const randomBase = Math.pow(Math.random(), 3); // Power distribution
      const stars = Math.floor(randomBase * 250000); // Max ~250k stars (like React/Vue)

      // Get color based on star count (mimics real star temperature/brightness)
      const starColor = getColorFromStars(stars);
      colors[i * 3] = starColor.r;
      colors[i * 3 + 1] = starColor.g;
      colors[i * 3 + 2] = starColor.b;

      // Logarithmic size scaling based on star count (prevents huge repos from being too large)
      // Like real stars: size correlates with luminosity, but logarithmically
      const logStars = Math.log10(stars + 1);
      sizes[i] = 2.0 + logStars * 1.2; // Base 2.0, scales with log10(stars)

      // Brightness correlates with star count (normalized logarithmically)
      const maxLogStars = Math.log10(250000);
      brightnesses[i] = Math.min(logStars / maxLogStars, 1.0);

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
  }, []);

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
