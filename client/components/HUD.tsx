import { useState } from "react";
import SearchBar from "./SearchBar";
import StatsPanel from "./StatsPanel";
import YearMarker from "./YearMarker";
import NavigationControls from "./NavigationControls";
import TimelinePanel from "./TimelinePanel";
import ControlsPanel from "./ControlsPanel";

interface HUDProps {
  onSearchChange?: (query: string, isFocused: boolean) => void;
  onSuggestionSelect?: (repo: any) => void;
}

export default function HUD({ onSearchChange, onSuggestionSelect }: HUDProps) {
  return (
    <div className="hud-container">
      <NavigationControls />
      <YearMarker />
      <StatsPanel />
      <TimelinePanel />
      <ControlsPanel />
      <SearchBar onSearchChange={onSearchChange} onSuggestionSelect={onSuggestionSelect} />

      <div
        className="hud-element absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ animationDelay: "0.8s" }}
      >
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border border-space-cyan/20 rounded-full" />
          <div className="absolute inset-0 border border-space-cyan/30 rounded-full animate-ping" />
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-space-cyan rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_20px_rgba(0,255,249,0.8)]" />
        </div>
      </div>

      <div
        className="hud-element absolute top-1/2 left-8 -translate-y-1/2"
        style={{ animationDelay: "0.9s" }}
      >
        <div className="h-48 w-px bg-gradient-to-b from-transparent via-space-cyan/30 to-transparent" />
      </div>

      <div
        className="hud-element absolute top-1/2 right-8 -translate-y-1/2"
        style={{ animationDelay: "0.9s" }}
      >
        <div className="h-48 w-px bg-gradient-to-b from-transparent via-space-magenta/30 to-transparent" />
      </div>

      <div
        className="hud-element absolute top-8 left-1/2 -translate-x-1/2"
        style={{ animationDelay: "1s" }}
      >
        <div className="w-48 h-px bg-gradient-to-r from-transparent via-space-cyan/30 to-transparent" />
      </div>

      <div
        className="hud-element absolute bottom-8 left-1/2 -translate-x-1/2"
        style={{ animationDelay: "1s" }}
      >
        <div className="w-48 h-px bg-gradient-to-r from-transparent via-space-amber/30 to-transparent" />
      </div>
    </div>
  );
}
