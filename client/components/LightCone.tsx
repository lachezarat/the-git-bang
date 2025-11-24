import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { type Repository, calculatePopularity } from "../lib/repositoryData";
import { getStartTime, calculatePositionFromParams, END_TIME } from "../lib/funnelUtils";

const DEFAULT_PARTICLE_COUNT = 25000;

const particleVertexShader = `
uniform float uTime;
uniform float uPixelRatio;

attribute float size;
attribute vec3 customColor;
attribute float pulse;
attribute float activity;
attribute float brightness;
attribute float id;

varying vec3 vColor;
varying float vPulse;
varying float vBrightness;
varying float vId;
varying float vViewZ;

void main() {
  vColor = customColor;
  vBrightness = brightness;
  vId = id;

  float pulseIntensity = 0.5 + 0.5 * sin(uTime * activity * 2.0 + pulse * 6.28318);
  vPulse = pulseIntensity;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewZ = mvPosition.z;

  gl_Position = projectionMatrix * mvPosition;

  gl_PointSize = size * uPixelRatio * (300.0 / -mvPosition.z) * (0.8 + 0.4 * pulseIntensity);
}
`;

const particleFragmentShader = `
uniform float uFocusedId; // -1.0 if none focused

varying vec3 vColor;
varying float vPulse;
varying float vBrightness;
varying float vId;
varying float vViewZ;

void main() {
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);

  if (dist > 0.5) {
    discard;
  }

  // Check focus state
  bool isFocused = (uFocusedId > -0.5);
  bool isTarget = (abs(vId - uFocusedId) < 0.1); // Float comparison

  // Dimming factor
  float dimFactor = 1.0;
  if (isFocused && !isTarget) {
    dimFactor = 0.1; // Dim non-selected particles to 10%
  }

  // Sharper glow, less blur (40% less blurred means tighter falloff)
  // Increased exponent from 3.5 to ~5.0
  float glow = 1.0 - dist * 2.0;
  glow = pow(glow, 5.0);

  float aberration = 0.015; // Reduced aberration for cleaner look

  float distR = length(center - vec2(aberration, 0.0));
  float glowR = 1.0 - distR * 2.0;
  glowR = pow(max(glowR, 0.0), 3.0); // Sharpened chromatic aberration too

  float distB = length(center + vec2(aberration, 0.0));
  float glowB = 1.0 - distB * 2.0;
  glowB = pow(max(glowB, 0.0), 3.0); // Sharpened chromatic aberration too

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

  // Apply selection dimming
  finalColor *= dimFactor;

  // Alpha also affected by brightness - dimmer stars are more transparent
  // Make small stars much more transparent to reduce noise
  float alpha = glow * (0.6 + 0.4 * vPulse) * (0.3 + 0.7 * brightnessFactor);
  
  // Apply selection dimming to alpha too
  alpha *= dimFactor;

  // Global reduction (30% dimmer)
  finalColor *= 0.7;
  alpha *= 0.7;

  // Depth-based clarity (Global Depth-Based Clarity)
  // -vViewZ is distance from camera. Range ~40 to ~300.
  // We want closer particles to be less transparent (restore some alpha).
  float viewDist = -vViewZ;
  float depthClarity = 1.0 - smoothstep(50.0, 250.0, viewDist); // 1.0 when close, 0.0 when far

  // Boost alpha back up for closer particles to increase clarity
  // This effectively reduces the "30% dimmer" effect when up close
  alpha *= (1.0 + depthClarity * 0.4);

  gl_FragColor = vec4(finalColor, alpha);
}
`;

interface LightConeProps {
  particlesRef?: React.RefObject<THREE.Points>;
  repositories?: Repository[];
  focusedId?: string | null;
}

export default function LightCone({
  particlesRef,
  repositories = [],
  focusedId = null,
}: LightConeProps = {}) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Use provided ref or internal ref
  const activeRef = particlesRef || pointsRef;

  // Find the numeric index of the focused repo to pass as ID
  // We'll use the index in the array as the ID for simplicity in the shader
  const focusedIndex = useMemo(() => {
    if (!focusedId || repositories.length === 0) return -1.0;
    return repositories.findIndex(r => r.id === focusedId);
  }, [focusedId, repositories]);

  const { geometry, uniforms } = useMemo(() => {
    const count =
      repositories.length > 0 ? repositories.length : DEFAULT_PARTICLE_COUNT;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const pulses = new Float32Array(count);
    const activities = new Float32Array(count);
    const brightnesses = new Float32Array(count);
    const ids = new Float32Array(count);

    // Calculate start time based on earliest repository
    const startTime = getStartTime(repositories);

    // Reusable color object
    const tempColor = new THREE.Color();

    for (let i = 0; i < count; i++) {
      let timestamp, popularity, normalizedSize;
      let angle = 0;
      let radiusRatio = 0; // repo.positionRadius

      // Set ID attribute (just the index)
      ids[i] = i;

      if (repositories.length > 0) {
        const repo = repositories[i];
        timestamp = repo.createdAt;
        popularity = calculatePopularity(repo.stars);
        angle = repo.positionAngle;
        radiusRatio = repo.positionRadius;

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
        angle = Math.random() * Math.PI * 2;
        radiusRatio = Math.sqrt(Math.random());

        tempColor.setHSL(Math.random(), 0.8, 0.5);
        colors[i * 3] = tempColor.r;
        colors[i * 3 + 1] = tempColor.g;
        colors[i * 3 + 2] = tempColor.b;

        normalizedSize = Math.pow(Math.random(), 4);
      }

      // Calculate position using shared helper
      const pos = calculatePositionFromParams(timestamp, angle, radiusRatio, startTime);

      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;

      // Map to size range: min 2.0, max 25.0 (Huge for top repos)
      // Use power 4.0 to make the curve very steep (only top 1% get huge)
      sizes[i] = 2.0 + Math.pow(normalizedSize, 4.0) * 23.0;

      // Brightness correlates with popularity
      // Steeper curve for brightness too
      brightnesses[i] = 0.3 + Math.pow(normalizedSize, 2.0) * 1.5;

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
    geometry.setAttribute("id", new THREE.BufferAttribute(ids, 1));

    const uniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uFocusedId: { value: -1.0 },
    };

    return { geometry, uniforms };
  }, [repositories]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      // Update focused ID uniform
      materialRef.current.uniforms.uFocusedId.value = focusedIndex;
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
