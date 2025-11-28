import { useRef, useEffect, useCallback } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import type { Repository } from "../lib/repositoryData";

interface ParticleInteractionProps {
  particlesRef: React.RefObject<THREE.Points>;
  onParticleClick?: (repo: any, position: { x: number; y: number }) => void;
  onParticleHover?: (repo: Repository | null) => void;
  repositories?: Repository[];
}

export default function ParticleInteraction({
  particlesRef,
  onParticleClick,
  onParticleHover,
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
  const lastHoveredIndex = useRef<number | null>(null);
  const throttleTimeout = useRef<number | null>(null);

  useFrame(() => {
    if (!controls) return;
    const ctrl = controls as any;

    if (isLocked.current && !isAnimating.current) {
      const currentDist = camera.position.distanceTo(ctrl.target);
      // If distance changes significantly (user zoom), unlock
      if (Math.abs(currentDist - lastDistance.current) > 2.0) {
        ctrl.enablePan = true;
        isLocked.current = false;
      }
    }
  });

  // Throttled hover detection
  const checkHover = useCallback(
    (event: MouseEvent) => {
      if (!particlesRef.current || !onParticleHover) return;

      // Calculate mouse position in normalized device coordinates
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Update the picking ray with the camera and mouse position
      raycaster.current.setFromCamera(mouse.current, camera);

      // Calculate objects intersecting the picking ray
      const intersects = raycaster.current.intersectObject(particlesRef.current);

      if (intersects.length > 0) {

        // Sort by distanceToRay to prioritize particles closest to the cursor center
        // This helps when particles are close to each other or overlapping
        intersects.sort((a, b) => {
          const distToRayA = (a as any).distanceToRay ?? 0;
          const distToRayB = (b as any).distanceToRay ?? 0;

          // If distances to ray are very similar, prefer closer to camera
          if (Math.abs(distToRayA - distToRayB) < 0.1) {
            return a.distance - b.distance;
          }
          return distToRayA - distToRayB;
        });

        const index = intersects[0].index ?? 0;

        // Only update if we're hovering a different particle
        if (index !== lastHoveredIndex.current) {
          lastHoveredIndex.current = index;
          const repo = repositories[index];
          if (repo) {
            onParticleHover(repo);
          }
        }
      } else {
        // No particle under cursor
        if (lastHoveredIndex.current !== null) {
          lastHoveredIndex.current = null;
          onParticleHover(null);
        }
      }
    },
    [camera, particlesRef, onParticleHover, repositories]
  );

  // Throttled mousemove handler for hover
  useEffect(() => {
    if (!onParticleHover) return;

    const handleMouseMove = (event: MouseEvent) => {
      // Throttle to ~60fps (16ms) for performance
      if (throttleTimeout.current) return;

      throttleTimeout.current = window.setTimeout(() => {
        throttleTimeout.current = null;
        checkHover(event);
      }, 16);
    };

    const handleMouseLeave = () => {
      if (lastHoveredIndex.current !== null) {
        lastHoveredIndex.current = null;
        onParticleHover(null);
      }
    };

    gl.domElement.addEventListener("mousemove", handleMouseMove);
    gl.domElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      gl.domElement.removeEventListener("mousemove", handleMouseMove);
      gl.domElement.removeEventListener("mouseleave", handleMouseLeave);
      if (throttleTimeout.current) {
        clearTimeout(throttleTimeout.current);
      }
    };
  }, [gl, checkHover, onParticleHover]);

  useEffect(() => {
    // Increased threshold for better hover detection
    raycaster.current.params.Points = { threshold: 5.0 };

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

      if (intersects.length > 0) {
        // Sort by distanceToRay to prioritize particles closest to the cursor center
        intersects.sort((a, b) => {
          const distToRayA = (a as any).distanceToRay ?? 0;
          const distToRayB = (b as any).distanceToRay ?? 0;

          if (Math.abs(distToRayA - distToRayB) < 0.1) {
            return a.distance - b.distance;
          }
          return distToRayA - distToRayB;
        });

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
