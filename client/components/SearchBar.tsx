import { useState, useMemo } from "react";

interface RepoSuggestion {
  name: string;
  owner: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  activity: number;
  growth: number;
  health: number;
  community: number;
  year: number;
}

interface SearchBarProps {
  onSearchChange?: (query: string, isFocused: boolean) => void;
  onSuggestionSelect?: (repo: RepoSuggestion) => void;
}

export default function SearchBar({ onSearchChange, onSuggestionSelect }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const universalRepos: RepoSuggestion[] = useMemo(() => [
    {
      name: "react",
      owner: "facebook",
      description: "A declarative, efficient JavaScript library",
      language: "JavaScript",
      stars: 228000,
      forks: 46700,
      activity: 94,
      growth: 12,
      health: 98,
      community: 1847,
      year: 2013,
    },
    {
      name: "react-native",
      owner: "facebook",
      description: "A framework for building native applications",
      language: "JavaScript",
      stars: 118000,
      forks: 24200,
      activity: 91,
      growth: 15,
      health: 96,
      community: 892,
      year: 2015,
    },
    {
      name: "vue",
      owner: "vuejs",
      description: "The Progressive JavaScript Framework",
      language: "TypeScript",
      stars: 207000,
      forks: 33700,
      activity: 88,
      growth: 18,
      health: 95,
      community: 1245,
      year: 2014,
    },
    {
      name: "tensorflow",
      owner: "tensorflow",
      description: "An Open Source Machine Learning Framework",
      language: "Python",
      stars: 185000,
      forks: 74000,
      activity: 92,
      growth: 22,
      health: 97,
      community: 2893,
      year: 2015,
    },
    {
      name: "kubernetes",
      owner: "kubernetes",
      description: "Production-Grade Container Orchestration",
      language: "Go",
      stars: 109000,
      forks: 39300,
      activity: 96,
      growth: 28,
      health: 99,
      community: 3421,
      year: 2014,
    },
    {
      name: "rust",
      owner: "rust-lang",
      description: "Empowering everyone to build reliable software",
      language: "Rust",
      stars: 96400,
      forks: 12400,
      activity: 95,
      growth: 35,
      health: 98,
      community: 2103,
      year: 2010,
    },
  ], []);

  const suggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const query = searchQuery.toLowerCase();
    return universalRepos.filter(
      (repo) =>
        repo.name.toLowerCase().includes(query) ||
        repo.owner.toLowerCase().includes(query) ||
        repo.description.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [searchQuery, universalRepos]);

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
          <div className="liquid-glass absolute top-full left-0 right-0 mt-2 p-3 space-y-1 max-h-[300px] overflow-y-auto">
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
