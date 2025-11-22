import { useState } from "react";

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

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
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
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

        {isFocused && searchQuery && (
          <div className="liquid-glass absolute top-full left-0 right-0 mt-2 p-3 space-y-1">
            <div className="px-3 py-2 hover:bg-space-cyan/10 cursor-pointer transition-colors border-l-2 border-transparent hover:border-space-cyan">
              <div className="text-space-cyan font-mono text-sm">react/react</div>
              <div className="text-space-cyan/50 text-xs font-mono mt-0.5">
                A declarative, efficient JavaScript library
              </div>
            </div>
            <div className="px-3 py-2 hover:bg-space-cyan/10 cursor-pointer transition-colors border-l-2 border-transparent hover:border-space-cyan">
              <div className="text-space-cyan font-mono text-sm">facebook/react-native</div>
              <div className="text-space-cyan/50 text-xs font-mono mt-0.5">
                A framework for building native applications
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
