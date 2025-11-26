import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import { gsap } from "gsap";
import { type Repository } from "../lib/repositoryData";
import { calculateParticlePosition } from "../lib/funnelUtils";

interface CameraTrackerProps {
  onYearChange: (year: number) => void;
  focusedRepo: Repository | null;
  repositories: Repository[];
}

const START_TIME = new Date("2011-01-01").getTime();
const END_TIME = new Date("2025-12-31").getTime();

export default function CameraTracker({
  onYearChange,
  focusedRepo,
  repositories,
}: CameraTrackerProps) {
  const { camera, controls } = useThree();
  const lastYearRef = useRef<number>(2025);
  const isAnimatingRef = useRef(false);

  // Handle Camera Movement on Selection
  useEffect(() => {
    if (!focusedRepo || !controls) return;
    const orbitControls = controls as unknown as OrbitControls;

    isAnimatingRef.current = true;

    const particlePos = calculateParticlePosition(focusedRepo, repositories);
    const targetVec = new THREE.Vector3(
      particlePos.x,
      particlePos.y,
      particlePos.z,
    );

    // Strategy:
    // 1. Maintain current viewing angle (azimuth/polar) relative to the new target.
    // 2. Zoom in to a fixed distance (e.g. 50 units).

    const currentPos = camera.position.clone();
    const currentTarget = orbitControls.target.clone();

    // Calculate the vector from the CURRENT target to the camera (this represents the viewing angle/offset)
    const offset = currentPos.sub(currentTarget);

    // Normalize direction and set to desired zoom distance (e.g., 40 units away)
    const zoomDistance = 40;
    const newOffset = offset.normalize().multiplyScalar(zoomDistance);

    // The new camera position is the New Target (Particle) + The New Offset
    const newCameraPos = targetVec.clone().add(newOffset);

    // Animate
    gsap.to(camera.position, {
      x: newCameraPos.x,
      y: newCameraPos.y,
      z: newCameraPos.z,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => {
        orbitControls.update();
      },
    });

    gsap.to(orbitControls.target, {
      x: targetVec.x,
      y: targetVec.y,
      z: targetVec.z,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => {
        orbitControls.update();
      },
      onComplete: () => {
        isAnimatingRef.current = false;
      },
    });
  }, [focusedRepo, repositories, camera, controls]);

  // Track Year based on Camera Target X (Timeline)
  useFrame(() => {
    if (controls) {
      const orbitControls = controls as unknown as OrbitControls;
      const targetX = orbitControls.target.x;

      // Inverse mapping from X to Timestamp
      // x = logT * 187.5 - 93.75
      // logT = (x + 93.75) / 187.5

      let logT = (targetX + 93.75) / 187.5;

      // Clamp logT
      logT = Math.max(0, Math.min(1, logT));

      // t = (10^logT - 1) / 9
      const t = (Math.pow(10, logT) - 1) / 9;

      const timestamp = t * (END_TIME - START_TIME) + START_TIME;
      const year = new Date(timestamp).getFullYear();

      if (year !== lastYearRef.current) {
        lastYearRef.current = year;
        onYearChange(year);
      }
    }
  });

  return null;
}
