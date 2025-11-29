import { LANGUAGE_COLORS } from "../lib/repositoryData";
import { useState, useRef, useEffect, useCallback } from "react";

interface TimelinePanelProps {
  onLanguageSelect?: (language: string | null) => void;
  selectedLanguage?: string | null;
  minStars?: number;
  maxStars?: number | null;
  onMinStarsChange?: (value: number) => void;
  onMaxStarsChange?: (value: number | null) => void;
}

const TOP_LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Go",
  "Rust",
  "Ruby",
  "Java",
  "C++",
  "C#",
  "PHP",
];

export default function TimelinePanel({
  onLanguageSelect,
  selectedLanguage,
  minStars = 0,
  maxStars = null,
  onMinStarsChange,
  onMaxStarsChange,
}: TimelinePanelProps) {
  const handleLanguageClick = (language: string) => {
    if (onLanguageSelect) {
      // Toggle off if already selected
      onLanguageSelect(selectedLanguage === language ? null : language);
    }
  };

  // Slider Logic
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDraggingMin, setIsDraggingMin] = useState(false);
  const [isDraggingMax, setIsDraggingMax] = useState(false);

  // Constants for the slider range
  const ABSOLUTE_MIN = 1000;
  const ABSOLUTE_MAX = 400000; // Approx max stars in dataset
  const LOG_MIN = Math.log(ABSOLUTE_MIN + 1);
  const LOG_MAX = Math.log(ABSOLUTE_MAX + 1);

  // Helper to convert value to percentage (logarithmic scale for better usability)
  const valueToPercent = useCallback((value: number) => {
    const logValue = Math.log(value + 1);
    const percent = ((logValue - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 100;
    return Math.max(0, Math.min(100, percent));
  }, [LOG_MIN, LOG_MAX]);

  // Helper to convert percentage to value
  const percentToValue = useCallback((percent: number) => {
    const logValue = (percent / 100) * (LOG_MAX - LOG_MIN) + LOG_MIN;
    const value = Math.exp(logValue) - 1;
    return Math.round(value);
  }, [LOG_MIN, LOG_MAX]);

  const handleMouseDown = (type: "min" | "max") => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "min") setIsDraggingMin(true);
    else setIsDraggingMax(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingMin && !isDraggingMax) return;
      if (!trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const newValue = percentToValue(percent);

      if (isDraggingMin) {
        // Ensure min doesn't cross max
        const currentMax = maxStars ?? ABSOLUTE_MAX;
        if (newValue < currentMax) {
          onMinStarsChange?.(newValue);
        }
      } else if (isDraggingMax) {
        // Ensure max doesn't cross min
        if (newValue > minStars) {
          onMaxStarsChange?.(newValue);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDraggingMin(false);
      setIsDraggingMax(false);
    };

    if (isDraggingMin || isDraggingMax) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingMin, isDraggingMax, minStars, maxStars, onMinStarsChange, onMaxStarsChange, percentToValue, ABSOLUTE_MAX]);

  const minPercent = valueToPercent(minStars);
  const maxPercent = valueToPercent(maxStars ?? ABSOLUTE_MAX);

  return (
    <div
      className="hud-element absolute bottom-6 left-6 pointer-events-auto"
      style={{ animationDelay: "0.7s" }}
    >
      <div className="liquid-glass px-6 py-4 min-w-[340px]">
        <div className="space-y-4 font-mono text-xs">
          <div className="text-space-magenta/80 glow-magenta mb-3 font-display text-sm uppercase tracking-wider flex justify-between items-center">
            <span>Star Filter</span>
            <span className="text-[10px] opacity-60">LOG SCALE</span>
          </div>

          {/* Slider Container */}
          <div className="relative h-12 select-none">
            {/* Value Labels */}
            <div className="absolute -top-1 w-full flex justify-between text-[10px] text-space-cyan/60 font-mono pointer-events-none">
              <span className="whitespace-nowrap" style={{ left: `${minPercent}%`, transform: 'translateX(-50%)', position: 'absolute' }}>
                {minStars.toLocaleString()}
              </span>
              <span className="whitespace-nowrap" style={{ left: `${maxPercent}%`, transform: 'translateX(-50%)', position: 'absolute' }}>
                {maxStars ? maxStars.toLocaleString() : "MAX"}
              </span>
            </div>

            {/* Track */}
            <div
              ref={trackRef}
              className="absolute top-6 left-0 w-full h-1 bg-space-cyan/20 rounded-full cursor-pointer"
              onClick={(e) => {
                // Click on track to jump nearest handle
                if (!trackRef.current) return;
                const rect = trackRef.current.getBoundingClientRect();
                const percent = ((e.clientX - rect.left) / rect.width) * 100;
                const val = percentToValue(percent);

                const distToMin = Math.abs(percent - minPercent);
                const distToMax = Math.abs(percent - maxPercent);

                if (distToMin < distToMax) {
                  onMinStarsChange?.(val);
                } else {
                  onMaxStarsChange?.(val);
                }
              }}
            >
              {/* Active Range */}
              <div
                className="absolute h-full bg-space-magenta/50 rounded-full"
                style={{
                  left: `${minPercent}%`,
                  width: `${maxPercent - minPercent}%`,
                }}
              />
            </div>

            {/* Min Handle */}
            <div
              className="absolute top-6 w-4 h-4 -mt-1.5 -ml-2 bg-space-void border-2 border-space-cyan rounded-full cursor-grab active:cursor-grabbing hover:scale-125 transition-transform z-10 shadow-[0_0_10px_rgba(0,255,249,0.5)]"
              style={{ left: `${minPercent}%` }}
              onMouseDown={handleMouseDown("min")}
            />

            {/* Max Handle */}
            <div
              className="absolute top-6 w-4 h-4 -mt-1.5 -ml-2 bg-space-void border-2 border-space-magenta rounded-full cursor-grab active:cursor-grabbing hover:scale-125 transition-transform z-10 shadow-[0_0_10px_rgba(255,0,110,0.5)]"
              style={{ left: `${maxPercent}%` }}
              onMouseDown={handleMouseDown("max")}
            />
          </div>

          <div className="pt-4 mt-2 border-t border-space-cyan/20">
            <div className="text-space-cyan/50 text-xs mb-3 uppercase tracking-wider">
              Stellar Classification
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {TOP_LANGUAGES.map((lang) => {
                const colorHex = LANGUAGE_COLORS[lang]
                  .toString(16)
                  .padStart(6, "0");
                const isSelected = selectedLanguage === lang;

                return (
                  <div
                    key={lang}
                    className={`flex items-center gap-3 cursor-pointer transition-opacity hover:opacity-100 ${selectedLanguage && !isSelected ? "opacity-30" : "opacity-80"
                      }`}
                    onClick={() => handleLanguageClick(lang)}
                  >
                    <div
                      className={`w-2 h-2 rounded-full transition-transform ${isSelected ? "scale-150 ring-2 ring-white/50" : ""
                        }`}
                      style={{ background: `#${colorHex}` }}
                    />
                    <span
                      className={`text-xs transition-colors ${isSelected
                        ? "text-white font-bold"
                        : "text-space-cyan/70"
                        }`}
                    >
                      {lang}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
