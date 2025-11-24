import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import type { Repository } from "../lib/repositoryData";

interface ParticleInteractionProps {
  particlesRef: React.RefObject<THREE.Points>;
  onParticleClick?: (repo: any, position: { x: number; y: number }) => void;
  repositories?: Repository[];
}

export default function ParticleInteraction({
  particlesRef,
  onParticleClick,
  repositories = [],
}: ParticleInteractionProps) {
  const { camera, gl, controls } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const targetPosition = useRef<THREE.Vector3 | null>(null);
  const isAnimating = useRef(false);
  const mouseDownPos = useRef({ x: 0, y: 0 });
  const isLocked = useRef(false);
  const lastDistance = useRef(0);

  useFrame(() => {
    if (!controls) return;
    const ctrl = controls as any;

    if (isLocked.current && !isAnimating.current) {
      const currentDist = camera.position.distanceTo(ctrl.target);
      // If distance changes significantly (user zoom), unlock
      if (Math.abs(currentDist - lastDistance.current) > 2.0) {
        ctrl.enablePan = true;
        isLocked.current = false;
        console.log("Zoom detected, unlocking pan");
      }
    }
  });

  useEffect(() => {
    raycaster.current.params.Points = { threshold: 2.0 };

    const handleMouseDown = (event: MouseEvent) => {
      mouseDownPos.current = { x: event.clientX, y: event.clientY };
    };

    const handleClick = (event: MouseEvent) => {
      if (!particlesRef.current) return;

      // Check if mouse moved between mousedown and mouseup (drag vs click)
      const dragThreshold = 5;
      const deltaX = Math.abs(event.clientX - mouseDownPos.current.x);
      const deltaY = Math.abs(event.clientY - mouseDownPos.current.y);

      if (deltaX > dragThreshold || deltaY > dragThreshold) {
        console.log("Drag detected, ignoring click");
        return; // This was a drag, not a click
      }

      // Calculate mouse position in normalized device coordinates
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Update the picking ray with the camera and mouse position
      raycaster.current.setFromCamera(mouse.current, camera);

      // Calculate objects intersecting the picking ray
      const intersects = raycaster.current.intersectObject(
        particlesRef.current,
      );

      console.log("Particle click detected, intersects:", intersects.length);

      if (intersects.length > 0) {
        console.log("Showing repo card for particle:", intersects[0].index);
        const point = intersects[0].point;
        const index = intersects[0].index || 0;

        // Get the actual repository data
        const repo = repositories[index];

        if (repo) {
          // Trigger card modal
          if (onParticleClick) {
            onParticleClick(repo, { x: event.clientX, y: event.clientY });
          }

          // Calculate camera target position (move camera closer to the particle)
          const direction = new THREE.Vector3()
            .subVectors(point, camera.position)
            .normalize();
          const distance = 40; // Fixed distance from particle to camera
          const newCameraPosition = new THREE.Vector3()
            .copy(point)
            .sub(direction.multiplyScalar(distance));

          // Lock controls
          if (controls) {
            (controls as any).enablePan = false;
            isLocked.current = true;
          }

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
              // Record distance after animation settles
              if (controls) {
                lastDistance.current = camera.position.distanceTo(
                  (controls as any).target,
                );
              }
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
      }
    };

    gl.domElement.addEventListener("mousedown", handleMouseDown);
    gl.domElement.addEventListener("click", handleClick);

    return () => {
      gl.domElement.removeEventListener("mousedown", handleMouseDown);
      gl.domElement.removeEventListener("click", handleClick);
    };
  }, [camera, gl, particlesRef, controls, onParticleClick, repositories]);

  return null;
}
