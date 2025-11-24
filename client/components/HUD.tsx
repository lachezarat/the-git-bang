import { useState } from "react";
import SearchBar from "./SearchBar";
import StatsPanel from "./StatsPanel";
import YearMarker from "./YearMarker";
import TimelinePanel from "./TimelinePanel";
import ControlsPanel from "./ControlsPanel";
import type { Repository } from "../lib/repositoryData";

interface HUDProps {
  onSearchChange?: (query: string, isFocused: boolean) => void;
  onSuggestionSelect?: (repo: any) => void;
  repositories?: Repository[];
  currentYear?: number;
  onLanguageSelect?: (language: string | null) => void;
  selectedLanguage?: string | null;
}

export default function HUD({
  onSearchChange,
  onSuggestionSelect,
  repositories = [],
  currentYear = 2025,
  onLanguageSelect,
  selectedLanguage,
}: HUDProps) {
  return (
    <div className="hud-container">
      <YearMarker year={currentYear} />
      <StatsPanel
        repositoryCount={repositories.length}
        activeLanguage={selectedLanguage}
      />
      <TimelinePanel
        onLanguageSelect={onLanguageSelect}
        selectedLanguage={selectedLanguage}
      />
      <ControlsPanel />
      <SearchBar
        onSearchChange={onSearchChange}
        onSuggestionSelect={onSuggestionSelect}
        repositories={repositories}
      />

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
