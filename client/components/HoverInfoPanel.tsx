import type { Repository } from "../lib/repositoryData";

interface HoverInfoPanelProps {
  hoveredRepo: Repository | null;
}

// Language color mapping (matching repositoryData.ts)
const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572a5",
  Java: "#b07219",
  Go: "#00add8",
  Rust: "#dea584",
  "C++": "#f34b7d",
  C: "#555555",
  Ruby: "#701516",
  PHP: "#4f5d95",
  Swift: "#f05138",
  Kotlin: "#a97bff",
  Scala: "#c22d40",
  Shell: "#89e051",
  Lua: "#000080",
  Dart: "#00b4ab",
  Elixir: "#6e4a7e",
  Clojure: "#db5855",
  Haskell: "#5e5086",
  "C#": "#178600",
  "Objective-C": "#438eff",
  R: "#198ce7",
  Julia: "#a270ba",
  Vim: "#199f4b",
  Perl: "#0298c3",
  OCaml: "#3be133",
  MATLAB: "#e16737",
  Jupyter: "#f37626",
  Vue: "#41b883",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Unknown: "#8b949e",
};

function formatStars(stars: number): string {
  if (stars >= 1000000) {
    return `${(stars / 1000000).toFixed(1)}M`;
  }
  if (stars >= 1000) {
    return `${(stars / 1000).toFixed(1)}K`;
  }
  return stars.toString();
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}

export default function HoverInfoPanel({ hoveredRepo }: HoverInfoPanelProps) {
  const langColor = hoveredRepo
    ? LANGUAGE_COLORS[hoveredRepo.primaryLanguage] || LANGUAGE_COLORS.Unknown
    : "#8b949e";

  return (
    <div
      className="hud-element absolute right-6 pointer-events-none"
      style={{ animationDelay: "0.3s", top: "230px" }}
    >
      <div
        className={`liquid-glass px-5 py-4 w-[280px] relative overflow-hidden transition-all duration-300 ${
          hoveredRepo ? "opacity-100" : "opacity-40"
        }`}
      >
        <div className="scanline-overlay absolute inset-0 pointer-events-none opacity-20" />

        <div className="relative font-mono text-xs">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                hoveredRepo ? "pulse-dot" : ""
              }`}
              style={{ backgroundColor: hoveredRepo ? langColor : "#8b949e40" }}
            />
            <span className="text-space-cyan/60 uppercase tracking-wider">
              {hoveredRepo ? "Target Acquired" : "Awaiting Target"}
            </span>
          </div>

          {hoveredRepo ? (
            <>
              {/* Repository Name */}
              <div className="mb-3 border-l-2 border-space-cyan/30 pl-3">
                <div className="text-space-cyan/50 uppercase tracking-wide text-[10px] mb-1">
                  Repository
                </div>
                <div className="text-space-cyan font-bold text-sm truncate">
                  {hoveredRepo.name}
                </div>
                <div className="text-space-cyan/40 text-[10px]">
                  {hoveredRepo.owner}
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {/* Stars */}
                <div className="border-l-2 border-space-amber/30 pl-3">
                  <div className="text-space-cyan/50 uppercase tracking-wide text-[10px] mb-1">
                    Stars
                  </div>
                  <div className="text-space-amber glow-amber font-bold text-base tabular-nums">
                    {formatStars(hoveredRepo.stars)}
                  </div>
                </div>

                {/* Language */}
                <div className="border-l-2 pl-3" style={{ borderColor: `${langColor}40` }}>
                  <div className="text-space-cyan/50 uppercase tracking-wide text-[10px] mb-1">
                    Language
                  </div>
                  <div
                    className="font-bold text-sm truncate"
                    style={{ color: langColor }}
                  >
                    {hoveredRepo.primaryLanguage || "Unknown"}
                  </div>
                </div>
              </div>

              {/* Created Date */}
              <div className="border-l-2 border-space-magenta/30 pl-3">
                <div className="text-space-cyan/50 uppercase tracking-wide text-[10px] mb-1">
                  Created
                </div>
                <div className="text-space-magenta glow-magenta font-bold text-sm">
                  {formatDate(hoveredRepo.createdAt)}
                </div>
              </div>

              {/* Action hint */}
              <div className="pt-3 mt-3 border-t border-space-cyan/10">
                <div className="flex items-center gap-2 text-space-cyan/40">
                  <div className="w-1 h-1 rounded-full bg-space-cyan/60 animate-pulse" />
                  <span className="text-[10px] uppercase tracking-wide">
                    Click to view details
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="py-4 text-center">
              <div className="text-space-cyan/30 text-[10px] uppercase tracking-wide">
                Hover over a particle
              </div>
              <div className="text-space-cyan/20 text-[10px] mt-1">
                to view repository info
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
