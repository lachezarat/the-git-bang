import SearchBar from "./SearchBar";
import StatsPanel from "./StatsPanel";
import YearMarker from "./YearMarker";
import TimelinePanel from "./TimelinePanel";
import ControlsPanel from "./ControlsPanel";
import HoverInfoPanel from "./HoverInfoPanel";
import type { Repository } from "../lib/repositoryData";

interface HUDProps {
  onSearchChange?: (query: string, isFocused: boolean) => void;
  onSuggestionSelect?: (repo: any) => void;
  onSuggestionHover?: (repo: any) => void;
  repositories?: Repository[];
  currentYear?: number;
  onLanguageSelect?: (language: string | null) => void;
  selectedLanguage?: string | null;
  hoveredRepo?: Repository | null;
  minStars?: number;
  maxStars?: number | null;
  onMinStarsChange?: (value: number) => void;
  onMaxStarsChange?: (value: number | null) => void;
}

export default function HUD({
  onSearchChange,
  onSuggestionSelect,
  onSuggestionHover,
  repositories = [],
  currentYear = 2025,
  onLanguageSelect,
  selectedLanguage,
  hoveredRepo = null,
  minStars = 1000,
  maxStars = null,
  onMinStarsChange = () => { },
  onMaxStarsChange = () => { },
  viewMode = "3d",
  onViewModeChange = () => { },
  onSurpriseMe = () => { },
  onSortChange = () => { },
  sortMode = "stars",
}: HUDProps & {
  viewMode?: "3d" | "list";
  onViewModeChange?: (mode: "3d" | "list") => void;
  onSurpriseMe?: () => void;
  onSortChange?: (sort: "stars" | "date") => void;
  sortMode?: "stars" | "date";
}) {
  return (
    <div className="hud-container">
      <YearMarker year={currentYear} />
      <StatsPanel
        repositoryCount={repositories.length}
        activeLanguage={selectedLanguage}
      />
      <HoverInfoPanel hoveredRepo={hoveredRepo} />
      <TimelinePanel
        onLanguageSelect={onLanguageSelect}
        selectedLanguage={selectedLanguage}
        minStars={minStars}
        maxStars={maxStars}
        onMinStarsChange={onMinStarsChange}
        onMaxStarsChange={onMaxStarsChange}
      />
      <ControlsPanel />
      <SearchBar
        onSearchChange={onSearchChange}
        onSuggestionSelect={onSuggestionSelect}
        onSuggestionHover={onSuggestionHover}
        repositories={repositories}
      />

      {/* View Controls */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-auto flex flex-col gap-3 z-50">
        <div className="liquid-glass p-2 flex flex-row gap-2 items-center">
          <button
            onClick={() => onViewModeChange(viewMode === "3d" ? "list" : "3d")}
            className={`px-4 py-2 rounded border transition-all duration-300 text-xs font-mono uppercase tracking-wider whitespace-nowrap ${viewMode === "list"
              ? "bg-space-cyan/20 border-space-cyan text-space-cyan shadow-[0_0_15px_rgba(0,255,249,0.3)]"
              : "bg-black/40 border-white/10 text-white/60 hover:border-space-cyan/50 hover:text-space-cyan"
              }`}
          >
            {viewMode === "3d" ? "List View" : "3D View"}
          </button>

          <button
            onClick={onSurpriseMe}
            className="px-4 py-2 rounded border bg-black/40 border-white/10 text-white/60 hover:border-space-magenta/50 hover:text-space-magenta transition-all duration-300 text-xs font-mono uppercase tracking-wider whitespace-nowrap"
          >
            Surprise Me
          </button>

          {viewMode === "list" && (
            <div className="relative group">
              <div className="px-4 py-2 rounded border bg-black/40 border-white/10 text-white/60 hover:border-space-amber/50 hover:text-space-amber transition-all duration-300 text-xs font-mono uppercase tracking-wider cursor-pointer flex items-center gap-2">
                <span>Sort: {sortMode === 'stars' ? 'Stars' : 'Date'}</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <div className="absolute top-full right-0 mt-2 w-32 bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top shadow-xl z-50">
                <button
                  onClick={() => onSortChange('stars')}
                  className={`w-full text-left px-4 py-2 text-xs font-mono uppercase tracking-wider hover:bg-white/10 transition-colors ${sortMode === 'stars' ? 'text-space-amber' : 'text-white/60'}`}
                >
                  Stars
                </button>
                <button
                  onClick={() => onSortChange('date')}
                  className={`w-full text-left px-4 py-2 text-xs font-mono uppercase tracking-wider hover:bg-white/10 transition-colors ${sortMode === 'date' ? 'text-space-amber' : 'text-white/60'}`}
                >
                  Date
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className="hud-element absolute top-1/2 left-8 -translate-y-1/2"
        style={{ animationDelay: "0.9s" }}
      >
        <div className="h-48 w-px bg-gradient-to-b from-transparent via-space-cyan/30 to-transparent" />
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
