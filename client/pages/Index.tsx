import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import Scene3D from "../components/Scene3D";
import BootSequence from "../components/BootSequence";
import HUD from "../components/HUD";
import ScanlineOverlay from "../components/ScanlineOverlay";
import RepoCard from "../components/RepoCard";
import AmbientSound from "../components/AmbientSound";
import ErrorBoundary from "../components/ErrorBoundary";
import { useRepositoryData } from "../hooks/useRepositoryData";
import * as THREE from "three";

import CameraTracker from "../components/CameraTracker";

export default function Index() {
  const [bootComplete, setBootComplete] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const cursorRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<any>(null);
  const [repoCardPos, setRepoCardPos] = useState({ x: 0, y: 0 });
  const [currentYear, setCurrentYear] = useState(2025);

  // Load repository data
  const {
    data: repoData,
    loading: dataLoading,
    error: dataError,
  } = useRepositoryData();
  const repositories = repoData?.repositories || [];

  const handleSearchChange = (query: string, isFocused: boolean) => {
    setSearchQuery(query);
    setSearchActive(isFocused && query.length > 0);
  };

  const handleSuggestionSelect = (repo: any) => {
    setSelectedRepo(repo);
    setRepoCardPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    setSearchActive(false);
  };

  const handleParticleClick = (
    repo: any,
    position: { x: number; y: number },
  ) => {
    console.log(
      "handleParticleClick called with repo:",
      repo,
      "position:",
      position,
    );
    setSelectedRepo(repo);
    setRepoCardPos(position);
  };

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
    // Wait for both boot sequence and data to load
    const timer = setTimeout(() => {
      if (!dataLoading) {
        setBootComplete(true);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [dataLoading]);

  // Show error if data loading failed
  useEffect(() => {
    if (dataError) {
      console.error("Failed to load repository data:", dataError);
    }
  }, [dataError]);

  return (
    <ErrorBoundary>
      <div className="relative w-screen h-screen overflow-hidden bg-space-void">
        <div
          ref={cursorRef}
          className="custom-cursor"
          style={{ left: cursorPos.x, top: cursorPos.y }}
        />

        <div className="blue-noise-overlay" />
        <div className="noise-overlay" />
        <ScanlineOverlay />

        {!bootComplete && <BootSequence />}

        <Canvas
          className="absolute inset-0"
          dpr={[1, 2]}
          gl={{ antialias: true }}
        >
          <PerspectiveCamera makeDefault fov={75} position={[0, 0, 225]} />
          <ambientLight intensity={0.05} />
          <pointLight position={[20, 20, 20]} intensity={0.3} color="#00fff9" />
          <pointLight
            position={[-20, -20, -20]}
            intensity={0.2}
            color="#ff006e"
          />
          <pointLight position={[0, 20, -20]} intensity={0.15} color="#ffba08" />

          <Scene3D
            searchActive={searchActive}
            searchQuery={searchQuery}
            onParticleClick={handleParticleClick}
            repositories={repositories}
          />

          <CameraTracker onYearChange={setCurrentYear} />

          <OrbitControls
            target={[0, 0, 0]}
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            minDistance={37.5}
            maxDistance={300}
            autoRotate={false}
            autoRotateSpeed={0.1}
            enableDamping
            dampingFactor={0.05}
            zoomToCursor={true}
            screenSpacePanning={true}
            mouseButtons={{
              LEFT: THREE.MOUSE.PAN,
              MIDDLE: THREE.MOUSE.DOLLY,
              RIGHT: THREE.MOUSE.ROTATE,
            }}
          />
        </Canvas>

        {bootComplete && (
          <HUD
            onSearchChange={handleSearchChange}
            onSuggestionSelect={handleSuggestionSelect}
            repositories={repositories}
            currentYear={currentYear}
          />
        )}
        {bootComplete && <AmbientSound />}

        {selectedRepo && (
          <RepoCard
            repo={selectedRepo}
            position={repoCardPos}
            onClose={() => setSelectedRepo(null)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
