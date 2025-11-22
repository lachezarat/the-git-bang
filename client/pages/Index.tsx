import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, PerspectiveCamera } from "@react-three/drei";
import Scene3D from "../components/Scene3D";
import BootSequence from "../components/BootSequence";
import HUD from "../components/HUD";
import ScanlineOverlay from "../components/ScanlineOverlay";
import * as THREE from "three";

function CameraRig() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  
  useFrame((state) => {
    if (cameraRef.current) {
      const time = state.clock.elapsedTime;
      const noiseX = Math.sin(time * 0.3) * 0.03;
      const noiseY = Math.cos(time * 0.4) * 0.03;
      const noiseZ = Math.sin(time * 0.2) * 0.03;
      
      cameraRef.current.position.x = 25 + noiseX;
      cameraRef.current.position.y = 15 + noiseY;
      cameraRef.current.position.z = 25 + noiseZ;
    }
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault fov={80} position={[25, 15, 25]} />;
}

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
        <CameraRig />
        <ambientLight intensity={0.05} />
        <pointLight position={[20, 20, 20]} intensity={0.3} color="#00fff9" />
        <pointLight position={[-20, -20, -20]} intensity={0.2} color="#ff006e" />
        <pointLight position={[0, 20, -20]} intensity={0.15} color="#ffba08" />
        
        <Stars
          radius={300}
          depth={60}
          count={8000}
          factor={7}
          saturation={0}
          fade
          speed={0.3}
        />

        <Scene3D />

        <OrbitControls
          target={[0, 0, 0]}
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={80}
          autoRotate={bootComplete}
          autoRotateSpeed={0.3}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>

      {bootComplete && <HUD />}
    </div>
  );
}
