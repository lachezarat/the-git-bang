import { useRef, useMemo, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { type Repository } from "../lib/repositoryData";
import { calculateParticlePosition } from "../lib/funnelUtils";

interface DirectionalArrowProps {
  repo: Repository;
  repositories: Repository[];
}

export default function DirectionalArrow({
  repo,
  repositories,
}: DirectionalArrowProps) {
  const { camera, size } = useThree();
  const arrowRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const position = useMemo(() => {
    return calculateParticlePosition(repo, repositories);
  }, [repo, repositories]);

  const targetVec = useMemo(
    () => new THREE.Vector3(position.x, position.y, position.z),
    [position],
  );

  useFrame(() => {
    if (!arrowRef.current) return;

    // Clone to not mutate original
    const screenPos = targetVec.clone();
    screenPos.project(camera);

    const isBehind =
      targetVec
        .clone()
        .sub(camera.position)
        .dot(camera.getWorldDirection(new THREE.Vector3())) < 0;

    // Check if off-screen
    // In NDC, x and y are between -1 and 1.
    const isOffScreen =
      screenPos.x < -0.9 ||
      screenPos.x > 0.9 ||
      screenPos.y < -0.9 ||
      screenPos.y > 0.9 ||
      isBehind;

    if (isOffScreen) {
      if (!isVisible) setIsVisible(true);

      const halfWidth = size.width / 2;
      const halfHeight = size.height / 2;

      // Calculate position relative to center in PIXELS (y points down in CSS)
      // NDC y points up, so we invert it for pixel space calculations
      let relX = screenPos.x * halfWidth;
      let relY = -screenPos.y * halfHeight;

      // If behind, invert coords to point correctly
      if (isBehind) {
        relX = -relX;
        relY = -relY;
      }

      // Normalize to extract angle
      const angle = Math.atan2(relY, relX);

      const padding = 40; // px

      // Screen boundaries relative to center
      const boundX = halfWidth - padding;
      const boundY = halfHeight - padding;

      // Intersection logic
      const absTan = Math.abs(Math.tan(angle));
      const slope = boundY / boundX;

      let screenX = 0;
      let screenY = 0;

      if (absTan <= slope) {
        // Hits left or right edge
        screenX = relX > 0 ? boundX : -boundX;
        screenY = screenX * Math.tan(angle);
      } else {
        // Hits top or bottom edge
        screenY = relY > 0 ? boundY : -boundY;
        screenX = screenY / Math.tan(angle);
      }

      arrowRef.current.style.transform = `translate(${screenX}px, ${screenY}px) rotate(${angle + Math.PI / 2}rad)`;
    } else {
      if (isVisible) setIsVisible(false);
    }
  });

  return (
    <Html fullscreen style={{ pointerEvents: "none" }}>
      <div
        ref={arrowRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          display: isVisible ? "flex" : "none",
          justifyContent: "center",
          alignItems: "center",
          width: "40px",
          height: "40px",
          // Use transform for positioning and rotation
        }}
      >
        {/* Simple CSS Arrow */}
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "10px solid transparent",
            borderRight: "10px solid transparent",
            borderBottom: "20px solid #00fff9",
            filter: "drop-shadow(0 0 5px #00fff9)",
          }}
        />
      </div>
    </Html>
  );
}
