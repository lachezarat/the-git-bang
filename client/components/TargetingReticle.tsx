import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";

interface TargetingReticleProps {
  position: THREE.Vector3;
  visible?: boolean;
}

export default function TargetingReticle({ position, visible = true }: TargetingReticleProps) {
  const outerRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const bracketsRef = useRef<THREE.Group>(null);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!visible || !groupRef.current) return;

    // Animate reticle expansion
    const tl = gsap.timeline();
    
    tl.fromTo(
      groupRef.current.scale,
      { x: 0, y: 0, z: 0 },
      {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.3,
        ease: "back.out(2)",
        onComplete: () => {
          // Sound hook placeholder for target-lock sound
          console.log("[SOUND] target-lock");
        }
      }
    );

    return () => {
      tl.kill();
    };
  }, [visible]);

  useFrame((state) => {
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += 0.01;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z -= 0.015;
    }
    if (bracketsRef.current) {
      const pulse = 0.9 + 0.1 * Math.sin(state.clock.elapsedTime * 2);
      bracketsRef.current.scale.setScalar(pulse);
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={position}>
      <mesh ref={outerRingRef}>
        <torusGeometry args={[1.5, 0.05, 16, 32]} />
        <meshBasicMaterial 
          color="#00fff9" 
          transparent 
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={innerRingRef}>
        <torusGeometry args={[1.0, 0.08, 16, 32]} />
        <meshBasicMaterial 
          color="#00fff9" 
          transparent 
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <group ref={bracketsRef}>
        {[0, 90, 180, 270].map((angle, i) => (
          <group key={i} rotation={[0, 0, (angle * Math.PI) / 180]}>
            <mesh position={[1.8, 1.8, 0]}>
              <boxGeometry args={[0.5, 0.1, 0.05]} />
              <meshBasicMaterial 
                color="#ff006e" 
                transparent 
                opacity={0.9}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            <mesh position={[1.8, 1.8, 0]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.5, 0.1, 0.05]} />
              <meshBasicMaterial 
                color="#ff006e" 
                transparent 
                opacity={0.9}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
        ))}
      </group>

      <pointLight position={[0, 0, 0]} intensity={2} color="#00fff9" distance={5} />
    </group>
  );
}
