import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, PerspectiveCamera } from "@react-three/drei";
import Scene3D from "../components/Scene3D";
import BootSequence from "../components/BootSequence";
import HUD from "../components/HUD";

export default function Index() {
  const [bootComplete, setBootComplete] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBootComplete(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-space-void">
      <div
        ref={cursorRef}
        className="custom-cursor"
        style={{ left: cursorPos.x, top: cursorPos.y }}
      />

      <div className="noise-overlay" />

      {!bootComplete && <BootSequence />}

      <Canvas className="absolute inset-0">
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#00fff9" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#ff006e" />
        
        <Stars
          radius={300}
          depth={50}
          count={5000}
          factor={7}
          saturation={0}
          fade
          speed={0.5}
        />

        <Scene3D />

        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
          autoRotate={bootComplete}
          autoRotateSpeed={0.2}
        />
      </Canvas>

      {bootComplete && <HUD />}
    </div>
  );
}
