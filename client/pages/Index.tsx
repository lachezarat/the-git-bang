import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import Scene3D from "../components/Scene3D";
import HUD from "../components/HUD";
import ScanlineOverlay from "../components/ScanlineOverlay";
import RepoCard from "../components/RepoCard";
import RepoList from "../components/RepoList";
import AmbientSound from "../components/AmbientSound";
import ErrorBoundary from "../components/ErrorBoundary";
import { useRepositoryData } from "../hooks/useRepositoryData";
import * as THREE from "three";

import CameraTracker from "../components/CameraTracker";

export default function Index() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<any>(null);
  const [hoveredRepo, setHoveredRepo] = useState<any>(null);
  const [hoverSource, setHoverSource] = useState<"3d" | "hud" | null>(null);
  const [repoCardPos, setRepoCardPos] = useState({ x: 0, y: 0 });
  const [currentYear, setCurrentYear] = useState(2025);
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  const controlsRef = useRef<any>(null);

  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const [minStars, setMinStars] = useState(1000);
  const [maxStars, setMaxStars] = useState<number | null>(null);

  const [viewMode, setViewMode] = useState<"3d" | "list">("3d");
  const [sortMode, setSortMode] = useState<"stars" | "date">("stars");

  // Reset camera when repo is deselected
  useEffect(() => {
    if (!selectedRepo && controlsRef.current) {
      // Optional: Reset to initial view
      // controlsRef.current.reset();
    }
  }, [selectedRepo]);

  // Load repository data
  const {
    data: repoData,
    loading: dataLoading,
    error: dataError,
  } = useRepositoryData();
  const repositories = repoData?.repositories || [];

  const filteredRepositories = useMemo(() => {
    return repositories.filter((repo) => {
      const matchesLanguage = selectedLanguage
        ? repo.primaryLanguage === selectedLanguage
        : true;
      const matchesMinStars = repo.stars >= minStars;
      const matchesMaxStars = maxStars !== null ? repo.stars <= maxStars : true;

      return matchesLanguage && matchesMinStars && matchesMaxStars;
    });
  }, [repositories, selectedLanguage, minStars, maxStars]);

  const sortedRepositories = useMemo(() => {
    return [...filteredRepositories].sort((a, b) => {
      if (sortMode === "stars") {
        return b.stars - a.stars;
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [filteredRepositories, sortMode]);

  const handleSurpriseMe = useCallback(() => {
    if (filteredRepositories.length > 0) {
      const randomRepo = filteredRepositories[Math.floor(Math.random() * filteredRepositories.length)];
      setSelectedRepo(randomRepo);
      setRepoCardPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      // If in 3D mode, maybe we want to fly to it?
      // For now, just opening the card is good.
    }
  }, [filteredRepositories]);

  const handleSearchChange = useCallback(
    (query: string, isFocused: boolean) => {
      setSearchQuery(query);
      setSearchActive(isFocused && query.length > 0);
    },
    [],
  );

  const handleSuggestionSelect = useCallback((repo: any) => {
    setSelectedRepo(repo);
    setRepoCardPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    setSearchActive(false);
  }, []);

  const handleParticleClick = useCallback(
    (repo: any, position: { x: number; y: number }) => {
      console.log(
        "handleParticleClick called with repo:",
        repo,
        "position:",
        position,
      );
      setSelectedRepo(repo);
      setRepoCardPos(position);
    },
    [],
  );

  const handleParticleHover = useCallback((repo: any) => {
    setHoveredRepo(repo);
    setHoverSource(repo ? "3d" : null);
  }, []);

  const handleHudHover = useCallback((repo: any) => {
    setHoveredRepo(repo);
    setHoverSource(repo ? "hud" : null);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Directly update the DOM ref to avoid re-renders
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX - 10}px`;
        cursorRef.current.style.top = `${e.clientY - 10}px`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = target.closest(
        'a, button, [role="button"], input, select, textarea, .cursor-pointer',
      );
      setIsHoveringClickable(!!isClickable);
    };

    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseout", () => setIsHoveringClickable(false)); // Optional reset

    return () => {
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", () =>
        setIsHoveringClickable(false),
      );
    };
  }, []);

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
          className={`custom-cursor ${isHoveringClickable ? "hovering" : ""}`}
        // Initial position will be 0,0 but updated immediately by mousemove event
        />

        <div className="blue-noise-overlay" />
        <div className="noise-overlay" />
        <ScanlineOverlay />

        {viewMode === "3d" && (
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
            <pointLight
              position={[0, 20, -20]}
              intensity={0.15}
              color="#ffba08"
            />

            <Scene3D
              searchActive={searchActive}
              searchQuery={searchQuery}
              onParticleClick={handleParticleClick}
              onParticleHover={handleParticleHover}
              repositories={filteredRepositories}
              focusedRepo={selectedRepo}
              hoveredRepo={hoveredRepo}
              cardPosition={repoCardPos}
              enableHoverPulse={true}
              dataLoaded={!dataLoading}
            />

            <CameraTracker
              onYearChange={setCurrentYear}
              focusedRepo={selectedRepo}
              repositories={filteredRepositories}
            />

            <OrbitControls
              ref={controlsRef}
              target={[0, 0, 0]}
              enableZoom={true}
              enablePan={true}
              enableRotate={true}
              minDistance={0.1}
              maxDistance={1000}
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
        )}

        <HUD
          onSearchChange={handleSearchChange}
          onSuggestionSelect={handleSuggestionSelect}
          onSuggestionHover={handleHudHover}
          repositories={filteredRepositories}
          currentYear={currentYear}
          onLanguageSelect={setSelectedLanguage}
          selectedLanguage={selectedLanguage}
          hoveredRepo={hoveredRepo}
          minStars={minStars}
          maxStars={maxStars}
          onMinStarsChange={setMinStars}
          onMaxStarsChange={setMaxStars}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onSurpriseMe={handleSurpriseMe}
          onSortChange={setSortMode}
          sortMode={sortMode}
        />

        {viewMode === "list" && (
          <RepoList
            repositories={sortedRepositories}
            onSelect={(repo) => {
              setSelectedRepo(repo);
              setRepoCardPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
            }}
          />
        )}
        <AmbientSound />

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
