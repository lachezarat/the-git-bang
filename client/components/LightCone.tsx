import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { type Repository, calculatePopularity } from "../lib/repositoryData";
import {
  getStartTime,
  calculatePositionFromParams,
  END_TIME,
} from "../lib/funnelUtils";

const DEFAULT_PARTICLE_COUNT = 25000;

const particleVertexShader = `
uniform float uTime;
uniform float uPixelRatio;
uniform float uHoveredId;

attribute float size;
attribute vec3 customColor;
attribute float pulse;
attribute float activity;
attribute float brightness;
attribute float particleId;

varying vec3 vColor;
varying float vPulse;
varying float vBrightness;
varying float vId;
varying float vViewZ;

void main() {
  vColor = customColor;
  vBrightness = brightness;
  vId = particleId;

  // Check if hovered
  bool isHovered = (abs(particleId - uHoveredId) < 0.1);

  // Pulse intensity for core brightness (passed to fragment shader)
  // Hovered particles pulse faster and stronger
  float pulseSpeed = isHovered ? 8.0 : (activity * 2.0);
  float pulseIntensity = 0.5 + 0.5 * sin(uTime * pulseSpeed + pulse * 6.28318);
  vPulse = pulseIntensity;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewZ = mvPosition.z;

  gl_Position = projectionMatrix * mvPosition;

  // Hovered particles are bigger (2.5x as requested) and pulse in size
  float hoverSizePulse = isHovered ? (1.0 + 0.2 * sin(uTime * 6.0)) : 1.0;
  float sizeMult = isHovered ? 1.5 * hoverSizePulse : 1.0;

  gl_PointSize = size * uPixelRatio * (300.0 / -mvPosition.z) * sizeMult;
}
`;

const particleFragmentShader = `
uniform float uFocusedId; // -1.0 if none focused
uniform float uHoveredId; // -1.0 if none hovered
uniform float uTime;

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
  bool isHovered = (abs(vId - uHoveredId) < 0.1);

  // Dimming factor
  float dimFactor = 1.0;
  if (isFocused && !isTarget) {
    dimFactor = 0.5; // Dim non-selected particles less drastically (was 0.1)
  }

  // Sharper glow, less blur
  float glow = 1.0 - dist * 2.0;
  glow = max(0.0, glow);
  glow = glow * glow * glow * glow * glow; // pow(glow, 5.0) optimized

  float aberration = 0.015; // Reduced aberration for cleaner look

  float distR = length(center - vec2(aberration, 0.0));
  float glowR = 1.0 - distR * 2.0;
  glowR = max(0.0, glowR);
  glowR = glowR * glowR * glowR; // pow(glowR, 3.0) optimized

  float distB = length(center + vec2(aberration, 0.0));
  float glowB = 1.0 - distB * 2.0;
  glowB = max(0.0, glowB);
  glowB = glowB * glowB * glowB; // pow(glowB, 3.0) optimized

  vec3 finalColor = vec3(
    vColor.r * glowR,
    vColor.g * glow,
    vColor.b * glowB
  );

  // Apply brightness based on star count (popularity)
  float brightnessFactor = pow(vBrightness, 1.5);
  finalColor *= (0.2 + 2.0 * brightnessFactor) / 1.5;

  // Core-focused pulsing: pulse affects the inner core strongly, outer glow less
  // Core region (dist < 0.15) pulses strongly, outer regions pulse subtly
  float coreRegion = 1.0 - smoothstep(0.0, 0.2, dist); // 1.0 at center, 0.0 at edges
  float pulseStrength = mix(0.05, 0.5, coreRegion); // Outer: 5% pulse, Core: 50% pulse
  float pulseEffect = 1.0 + pulseStrength * (vPulse - 0.5) * 2.0; // Centered around 1.0

  // Solid core for better visibility - this is where the pulse is most visible
  float core = 1.0 - smoothstep(0.0, 0.12, dist);
  float corePulse = 0.4 + 0.6 * vPulse; // Core brightness pulses 0.4 to 1.0
  finalColor += vec3(1.0) * core * (0.3 + 0.5 * brightnessFactor) * corePulse;

  // Apply pulse to color (stronger in core)
  finalColor *= pulseEffect;

  // Apply selection dimming
  finalColor *= dimFactor;

  // Alpha - stable outer glow, no pulse on alpha for cleaner edges
  float alpha = glow * (0.3 + 0.7 * brightnessFactor);

  // Apply selection dimming to alpha too
  alpha *= dimFactor;

  // Global reduction (dimmer)
  finalColor *= 0.63;
  alpha *= 0.63;

  // Depth-based clarity
  float viewDist = -vViewZ;
  float depthClarity = 1.0 - smoothstep(50.0, 250.0, viewDist);
  alpha *= (1.0 + depthClarity * 0.4);

    // Hover effect: Enhanced glow and brightness
  if (isHovered) {
    // Pulsing intensity for hover (smoother, slower pulse)
    float hoverPulse = 0.6 + 0.4 * sin(uTime * 6.0);
    
    // Brighten the particle - blend with original color
    vec3 brightColor = finalColor * 3.0; 
    
    // Add glow overlay using the particle's own color (vColor)
    // Mix with a bit of white for "glow" but keep it tinted
    vec3 glowColor = mix(vColor, vec3(1.0), 0.3); 
    vec3 glowOverlay = glowColor * hoverPulse * 0.5;
    
    // Outer pulsing ring using particle color
    float ringDist = abs(dist - 0.35);
    float ring = 1.0 - smoothstep(0.0, 0.1, ringDist);
    vec3 ringGlow = vColor * ring * hoverPulse * 1.0;
    
    // Combine
    finalColor = brightColor + glowOverlay + ringGlow;
    alpha = 1.0;
  }

  gl_FragColor = vec4(finalColor, alpha);
}
`;

interface LightConeProps {
  particlesRef?: React.RefObject<THREE.Points>;
  repositories?: Repository[];
  focusedId?: string | null;
  hoveredId?: string | null;
  dataLoaded?: boolean;
}

export default function LightCone({
  particlesRef,
  repositories = [],
  focusedId = null,
  hoveredId = null,
  dataLoaded = false,
}: LightConeProps = {}) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Use provided ref or internal ref
  const activeRef = particlesRef || pointsRef;

  // Find the numeric index of the focused repo to pass as ID
  // We'll use the index in the array as the ID for simplicity in the shader
  const focusedIndex = useMemo(() => {
    if (!focusedId || repositories.length === 0) return -1.0;
    return repositories.findIndex((r) => r.id === focusedId);
  }, [focusedId, repositories]);

  const hoveredIndex = useMemo(() => {
    if (!hoveredId || repositories.length === 0) return -1.0;
    const index = repositories.findIndex((r) => r.id === hoveredId);
    return index;
  }, [hoveredId, repositories]);

  // Track if repositories just became available (first load)
  const prevRepoCount = useRef(0);
  useEffect(() => {
    if (prevRepoCount.current === 0 && repositories.length > 0) {
      // Force immediate update of shader uniforms when data first loads
      if (materialRef.current && hoveredId) {
        const index = repositories.findIndex((r) => r.id === hoveredId);
        if (index >= 0) {
          materialRef.current.uniforms.uHoveredId.value = index;
        }
      }
    }
    prevRepoCount.current = repositories.length;
  }, [repositories, hoveredId]);




  const geometry = useMemo(() => {
    // Only use fallback if data is NOT loaded and we have no repos.
    // If data IS loaded and we have no repos (e.g. filtered out), count should be 0.
    const shouldUseFallback = !dataLoaded && repositories.length === 0;
    const count = shouldUseFallback ? DEFAULT_PARTICLE_COUNT : repositories.length;

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const pulses = new Float32Array(count);
    const activities = new Float32Array(count);
    const brightnesses = new Float32Array(count);
    const particleIds = new Float32Array(count);

    // Calculate start time based on earliest repository
    const startTime = getStartTime(repositories);

    // Reusable color object
    const tempColor = new THREE.Color();

    for (let i = 0; i < count; i++) {
      let timestamp, popularity, normalizedSize;
      let angle = 0;
      let radiusRatio = 0; // repo.positionRadius

      // Set ID attribute (just the index)
      particleIds[i] = i;

      if (!shouldUseFallback) {
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
      const pos = calculatePositionFromParams(
        timestamp,
        angle,
        radiusRatio,
        startTime,
      );

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
    geometry.computeBoundingSphere();
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("pulse", new THREE.BufferAttribute(pulses, 1));
    geometry.setAttribute("activity", new THREE.BufferAttribute(activities, 1));
    geometry.setAttribute(
      "brightness",
      new THREE.BufferAttribute(brightnesses, 1),
    );
    geometry.setAttribute("particleId", new THREE.BufferAttribute(particleIds, 1));

    return geometry;
  }, [repositories, dataLoaded]);

  // Create uniforms once and update values
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uFocusedId: { value: -1.0 },
    uHoveredId: { value: -1.0 },
  }), []); // Empty dependency array to keep object stable

  // Handle resize for pixel ratio
  useEffect(() => {
    const handleResize = () => {
      if (materialRef.current) {
        materialRef.current.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useFrame((state) => {
    if (materialRef.current && materialRef.current.uniforms) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;

      // robustly update these every frame to handle material recreation or ref desync
      // This ensures that even if the material was just created, it gets the right values immediately
      if (materialRef.current.uniforms.uHoveredId && materialRef.current.uniforms.uHoveredId.value !== hoveredIndex) {
        materialRef.current.uniforms.uHoveredId.value = hoveredIndex;
      }
      if (materialRef.current.uniforms.uFocusedId && materialRef.current.uniforms.uFocusedId.value !== focusedIndex) {
        materialRef.current.uniforms.uFocusedId.value = focusedIndex;
      }
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
