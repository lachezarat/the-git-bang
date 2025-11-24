import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";

interface CameraTrackerProps {
    onYearChange: (year: number) => void;
}

const START_TIME = new Date("2008-01-01").getTime();
const END_TIME = new Date("2025-12-31").getTime();

export default function CameraTracker({ onYearChange }: CameraTrackerProps) {
    const { controls } = useThree();
    const lastYearRef = useRef<number>(2025);

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
