import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";

interface LaserBeamProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  intensity?: number;
  color?: string;
  visible?: boolean;
}

const laserVertexShader = `
uniform float uTime;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPosition.xyz;
  
  gl_Position = projectionMatrix * mvPosition;
}
`;

const laserFragmentShader = `
uniform float uTime;
uniform float uIntensity;
uniform vec3 uColor;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec3 viewDir = normalize(vViewPosition);
  float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);
  
  float radial = abs(vUv.x - 0.5) * 2.0;
  float core = 1.0 - smoothstep(0.0, 0.8, radial);
  
  float scan = fract(vUv.y * 2.0 - uTime * 0.5);
  scan = smoothstep(0.0, 0.1, scan) * smoothstep(0.3, 0.2, scan);
  
  vec2 noiseCoord = vUv * 10.0 + vec2(0.0, uTime * 0.3);
  float noiseValue = noise(noiseCoord) * 0.3;
  
  float brightness = core * (0.6 + fresnel * 0.4) + scan * 0.4 + noiseValue;
  brightness *= uIntensity;
  
  float pulse = 0.8 + 0.2 * sin(uTime * 3.0);
  brightness *= pulse;
  
  vec3 finalColor = uColor * brightness;
  float alpha = brightness * (0.7 + fresnel * 0.3);
  
  gl_FragColor = vec4(finalColor, alpha);
}
`;

export default function LaserBeam({
  start,
  end,
  intensity = 1.0,
  color = "#00fff9",
  visible = true,
}: LaserBeamProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uColor: { value: new THREE.Color(color) },
    }),
    [color],
  );

  useEffect(() => {
    if (!visible || !meshRef.current || !groupRef.current) return;

    // Animate laser spawn
    gsap.fromTo(
      uniforms.uIntensity,
      { value: 0 },
      {
        value: intensity,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          // Sound hook placeholder for laser-fire sound
          console.log("[SOUND] laser-fire");
        },
      },
    );

    // Animate beam extension
    const initialScale = groupRef.current.scale.clone();
    gsap.fromTo(
      groupRef.current.scale,
      { y: 0.1 },
      {
        y: initialScale.y,
        duration: 0.4,
        ease: "elastic.out(1, 0.5)",
      },
    );

    return () => {
      gsap.killTweensOf(uniforms.uIntensity);
      if (groupRef.current) {
        gsap.killTweensOf(groupRef.current.scale);
      }
    };
  }, [visible, intensity, uniforms]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }

    if (meshRef.current && groupRef.current) {
      // Position and orient the beam
      const direction = new THREE.Vector3().subVectors(end, start);
      const length = direction.length();

      groupRef.current.position.copy(start);
      groupRef.current.position.add(direction.clone().multiplyScalar(0.5));

      groupRef.current.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.clone().normalize(),
      );

      groupRef.current.scale.y = length;
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <cylinderGeometry args={[0.15, 0.15, 1, 32, 1]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={laserVertexShader}
          fragmentShader={laserFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
