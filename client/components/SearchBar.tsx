import { useState, useMemo, useEffect } from "react";
import type { Repository } from "../lib/repositoryData";

interface SearchBarProps {
  onSearchChange?: (query: string, isFocused: boolean) => void;
  onSuggestionSelect?: (repo: Repository) => void;
  onSuggestionHover?: (repo: Repository | null) => void;
  repositories?: Repository[];
}

export default function SearchBar({
  onSearchChange,
  onSuggestionSelect,
  onSuggestionHover,
  repositories = [],
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const suggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 1) {
      // HOT repositories - curated list
      // Builder.io first, then other trendy but less massive repos to make Builder stand out
      const defaults = [
        "BuilderIO/builder",
        "emilkowalski/sonner",
        "unocss/unocss",
        "pmndrs/react-three-fiber",
        "resend/react-email"
      ];

      const foundDefaults = repositories.filter(r => defaults.includes(r.id));

      // Sort by the order in defaults array
      foundDefaults.sort((a, b) => defaults.indexOf(a.id) - defaults.indexOf(b.id));

      // If we don't have enough defaults, fill with top starred (excluding the titans if possible, but simple fallback is fine)
      let combined = foundDefaults;
      if (combined.length < 5) {
        const topStarred = [...repositories]
          .filter(r => !defaults.includes(r.id))
          .sort((a, b) => b.stars - a.stars)
          .slice(0, 5 - combined.length);
        combined = [...combined, ...topStarred];
      }

      return combined;
    }

    const query = searchQuery.toLowerCase();

    // Filter repositories that match the query
    const matches = repositories.filter(
      (repo) =>
        repo.name.toLowerCase().includes(query) ||
        repo.owner.toLowerCase().includes(query) ||
        `${repo.owner}/${repo.name}`.toLowerCase().includes(query),
    );

    // Sort by stars (most popular first)
    const sorted = matches.sort((a, b) => b.stars - a.stars);

    const result = sorted.slice(0, 5);
    return result;
  }, [searchQuery, repositories]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setSelectedIndex(-1); // Reset selection when typing
    onSearchChange?.(value, isFocused);
  };

  const handleFocus = (focused: boolean) => {
    setIsFocused(focused);
    if (!focused) {
      // Small delay to allow click on suggestion
      setTimeout(() => {
        setSelectedIndex(-1);
      }, 200);
    }
    onSearchChange?.(searchQuery, focused);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isFocused || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const newIndex = prev < suggestions.length - 1 ? prev + 1 : prev;
        onSuggestionHover?.(suggestions[newIndex]);
        return newIndex;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const newIndex = prev > 0 ? prev - 1 : -1;
        onSuggestionHover?.(newIndex >= 0 ? suggestions[newIndex] : null);
        return newIndex;
      });
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const selectedRepo = suggestions[selectedIndex];
      onSuggestionSelect?.(selectedRepo);
      onSuggestionHover?.(null);
      setSearchQuery(`${selectedRepo.owner}/${selectedRepo.name}`);
      setIsFocused(false);
      setSelectedIndex(-1);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsFocused(false);
      setSelectedIndex(-1);
      onSuggestionHover?.(null);
      setSearchQuery("");
      onSearchChange?.("", false);
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && searchQuery.length > 0) {
        setSearchQuery("");
        onSearchChange?.("", false);
        setIsFocused(false);
        setSelectedIndex(-1);
        onSuggestionHover?.(null);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [searchQuery, onSearchChange, onSuggestionHover]);

  return (
    <>
      {/* Suggestions dropdown - rendered separately to avoid clip-path clipping */}
      {isFocused && suggestions.length > 0 && (
        <div
          className="fixed left-1/2 -translate-x-1/2 pointer-events-auto"
          style={{
            bottom: "calc(5rem + 10px)", // Position closer to the search bar
            zIndex: 10001, // Higher than search bar
            minWidth: "500px",
            maxWidth: "700px",
          }}
        >
          <div
            className="liquid-glass p-4 space-y-1 max-h-[500px] overflow-y-auto rounded-sm"
            style={{
              animation:
                "geometricReveal 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
          >
            {searchQuery.length === 0 && (
              <div className="text-space-cyan/60 text-xs mb-3 font-mono uppercase tracking-wider border-b border-space-cyan/20 pb-2 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177 7.547 7.547 0 01-1.705-1.715.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
                </svg>
                HOT
              </div>
            )}
            {suggestions.map((repo, index) => (
              <div
                key={`${repo.owner}/${repo.name}`}
                className={`px-4 py-3 cursor-pointer transition-all duration-200 border-l-2 rounded-sm ${index === selectedIndex
                  ? "bg-space-cyan/20 border-space-cyan shadow-lg shadow-space-cyan/20"
                  : "border-transparent hover:bg-space-cyan/10 hover:border-space-cyan/50 hover:shadow-md hover:shadow-space-cyan/10"
                  }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSuggestionSelect?.(repo);
                  onSuggestionHover?.(null);
                  setSearchQuery(`${repo.owner}/${repo.name}`);
                }}
                onMouseEnter={() => {
                  setSelectedIndex(index);
                  onSuggestionHover?.(repo);
                }}
                onMouseLeave={() => {
                  onSuggestionHover?.(null);
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="text-space-cyan font-mono text-sm font-bold tracking-wide">
                    {repo.owner}/
                    <span className="text-space-cyan/90">{repo.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-space-amber/80 text-xs font-mono font-semibold">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
                    </svg>
                    {repo.stars.toLocaleString()}
                  </div>
                </div>
                <div className="text-space-cyan/50 text-xs font-mono mt-1.5 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-space-cyan/40"></span>
                  {repo.primaryLanguage}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search bar */}
      <div
        className="hud-element fixed bottom-10 left-1/2 -translate-x-1/2 pointer-events-auto z-50"
        style={{ animationDelay: "0.4s" }}
      >
        <div className="relative">
          <div className="liquid-glass trapezoid-clip border-beam px-8 py-4 min-w-[500px] max-w-[700px]">
            <div className="flex items-center gap-4">
              <svg
                className="w-5 h-5 text-space-cyan"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => handleFocus(true)}
                onBlur={() => handleFocus(false)}
                onKeyDown={handleKeyDown}
                placeholder="SEARCH REPOSITORIES..."
                className="flex-1 bg-transparent border-none outline-none text-space-cyan placeholder:text-space-cyan/30 font-mono text-sm tracking-wider font-semibold caret-space-cyan"
                style={{ fontVariantNumeric: "tabular-nums" }}
              />

              <div className="flex items-center gap-2 text-space-cyan/40 text-xs font-mono">
                <kbd className="px-2 py-1 border border-space-cyan/20 bg-space-void/50">
                  /
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
