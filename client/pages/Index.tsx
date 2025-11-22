import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import Scene3D from "../components/Scene3D";
import BootSequence from "../components/BootSequence";
import HUD from "../components/HUD";
import ScanlineOverlay from "../components/ScanlineOverlay";

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
      <ScanlineOverlay />

      {!bootComplete && <BootSequence />}

      <Canvas className="absolute inset-0" dpr={[1, 2]} gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault fov={75} position={[75, 50, 75]} />
        <ambientLight intensity={0.05} />
        <pointLight position={[20, 20, 20]} intensity={0.3} color="#00fff9" />
        <pointLight position={[-20, -20, -20]} intensity={0.2} color="#ff006e" />
        <pointLight position={[0, 20, -20]} intensity={0.15} color="#ffba08" />
        
        <Scene3D />

        <OrbitControls
          target={[0, 0, 0]}
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={25}
          maxDistance={200}
          autoRotate={false}
          autoRotateSpeed={0.1}
          enableDamping
          dampingFactor={0.05}
          zoomToCursor={true}
        />
      </Canvas>

      {bootComplete && <HUD />}
    </div>
  );
}
