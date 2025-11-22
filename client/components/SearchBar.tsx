import { useState, useMemo } from "react";
import type { Repository } from "../lib/repositoryData";

interface SearchBarProps {
  onSearchChange?: (query: string, isFocused: boolean) => void;
  onSuggestionSelect?: (repo: Repository) => void;
  repositories?: Repository[];
}

export default function SearchBar({
  onSearchChange,
  onSuggestionSelect,
  repositories = [],
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const suggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2 || repositories.length === 0)
      return [];
    const query = searchQuery.toLowerCase();
    return repositories
      .filter(
        (repo) =>
          repo.name.toLowerCase().includes(query) ||
          repo.owner.toLowerCase().includes(query) ||
          repo.description.toLowerCase().includes(query),
      )
      .slice(0, 5);
  }, [searchQuery, repositories]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange?.(value, isFocused);
  };

  const handleFocus = (focused: boolean) => {
    setIsFocused(focused);
    onSearchChange?.(searchQuery, focused);
  };

  return (
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

        {isFocused && suggestions.length > 0 && (
          <div className="liquid-glass absolute bottom-full left-0 right-0 mb-2 p-3 space-y-1 max-h-[300px] overflow-y-auto">
            {suggestions.map((repo) => (
              <div
                key={`${repo.owner}/${repo.name}`}
                className="px-3 py-2 hover:bg-space-cyan/10 cursor-pointer transition-colors border-l-2 border-transparent hover:border-space-cyan"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSuggestionSelect?.(repo);
                  setSearchQuery(`${repo.owner}/${repo.name}`);
                  setIsFocused(false);
                }}
              >
                <div className="text-space-cyan font-mono text-sm">
                  {repo.owner}/{repo.name}
                </div>
                <div className="text-space-cyan/50 text-xs font-mono mt-0.5">
                  {repo.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
