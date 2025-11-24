import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Repository } from "../lib/repositoryData";

interface ConnectionLineProps {
    repo: Repository | null;
    cardPosition: { x: number; y: number } | null;
}

export default function ConnectionLine({
    repo,
    cardPosition,
}: ConnectionLineProps) {
    const lineRef = useRef<THREE.Line>(null);
    const materialRef = useRef<THREE.LineBasicMaterial>(null);

    // Calculate the 3D position of the repo particle
    const particlePosition = useMemo(() => {
        if (!repo) return null;

        // Re-calculate position using the same logic as LightCone
        // This duplicates logic but ensures we get the exact same spot
        // Ideally this would be shared or passed down, but calculation is cheap
        const END_TIME = new Date("2025-12-31").getTime();
        const startTime = new Date("2011-01-01").getTime(); // Approximate start

        const timestamp = repo.createdAt;
        const t = (timestamp - startTime) / (END_TIME - startTime);
        const clampedT = Math.max(0, Math.min(1, t));
        const logT = Math.log(1 + clampedT * 9) / Math.log(10);

        const x = ((logT * 187.5 - 93.75) / 1.083) * 1.5;

        const startRadius = (3.75 * 1.5) / 1.083;
        const endRadius = (56.25 * 1.5) / 1.083;
        const funnelRadius = startRadius + (endRadius - startRadius) * logT;

        const angle = repo.positionAngle;
        const radiusOffset = repo.positionRadius * funnelRadius;

        const y = Math.cos(angle) * radiusOffset;
        const z = Math.sin(angle) * radiusOffset;

        return new THREE.Vector3(x, y, z);
    }, [repo]);

    useFrame(({ camera, size }) => {
        if (!lineRef.current || !particlePosition || !cardPosition) return;

        // Convert 2D screen coordinates of the card to 3D world coordinates
        // We want the line to end near the camera but projected from the card's screen pos

        // Normalize screen coordinates (-1 to +1)
        // cardPosition is in pixels from top-left
        const ndcX = (cardPosition.x / size.width) * 2 - 1;
        const ndcY = -(cardPosition.y / size.height) * 2 + 1;

        // Create a vector at the screen position
        const vector = new THREE.Vector3(ndcX, ndcY, 0.5);

        // Unproject to get a point in 3D space on the near plane
        vector.unproject(camera);

        // Calculate direction from camera to that point
        const dir = vector.sub(camera.position).normalize();

        // Place the end point at a fixed distance from camera
        const distance = 20; // Distance in front of camera
        const targetPos = camera.position.clone().add(dir.multiplyScalar(distance));

        // Update geometry
        const positions = new Float32Array([
            particlePosition.x, particlePosition.y, particlePosition.z,
            targetPos.x, targetPos.y, targetPos.z
        ]);

        lineRef.current.geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(positions, 3)
        );

        // Pulse opacity
        if (materialRef.current) {
            materialRef.current.opacity = 0.3 + Math.sin(Date.now() * 0.005) * 0.2;
        }
    });

    if (!repo) return null;

    return (
        <line ref={lineRef as any}>
            <bufferGeometry />
            <lineBasicMaterial
                ref={materialRef}
                color="#00fff9"
                transparent
                opacity={0.5}
                linewidth={1}
            />
        </line>
    );
}
