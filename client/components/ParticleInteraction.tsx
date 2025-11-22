import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

interface ParticleInteractionProps {
  particlesRef: React.RefObject<THREE.Points>;
}

export default function ParticleInteraction({
  particlesRef,
}: ParticleInteractionProps) {
  const { camera, gl, controls } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const targetPosition = useRef<THREE.Vector3 | null>(null);
  const isAnimating = useRef(false);

  useEffect(() => {
    raycaster.current.params.Points = { threshold: 0.5 };

    const handleClick = (event: MouseEvent) => {
      if (!particlesRef.current) return;

      // Calculate mouse position in normalized device coordinates
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Update the picking ray with the camera and mouse position
      raycaster.current.setFromCamera(mouse.current, camera);

      // Calculate objects intersecting the picking ray
      const intersects = raycaster.current.intersectObject(
        particlesRef.current,
      );

      if (intersects.length > 0) {
        const point = intersects[0].point;

        // Calculate camera target position (move camera closer to the particle)
        const direction = new THREE.Vector3()
          .subVectors(point, camera.position)
          .normalize();
        const distance = 30; // Distance from particle to camera
        const newCameraPosition = new THREE.Vector3()
          .copy(point)
          .sub(direction.multiplyScalar(distance));

        // Animate camera to new position
        isAnimating.current = true;

        gsap.to(camera.position, {
          x: newCameraPosition.x,
          y: newCameraPosition.y,
          z: newCameraPosition.z,
          duration: 1.5,
          ease: "power2.inOut",
          onUpdate: () => {
            if (controls) {
              (controls as any).target.copy(point);
              (controls as any).update();
            }
          },
          onComplete: () => {
            isAnimating.current = false;
          },
        });

        // Animate orbit controls target
        if (controls) {
          gsap.to((controls as any).target, {
            x: point.x,
            y: point.y,
            z: point.z,
            duration: 1.5,
            ease: "power2.inOut",
          });
        }
      }
    };

    gl.domElement.addEventListener("click", handleClick);

    return () => {
      gl.domElement.removeEventListener("click", handleClick);
    };
  }, [camera, gl, particlesRef, controls]);

  return null;
}
