import { LANGUAGE_COLORS } from "../lib/repositoryData";

interface TimelinePanelProps {
  onLanguageSelect?: (language: string | null) => void;
  selectedLanguage?: string | null;
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
}: TimelinePanelProps) {
  const handleLanguageClick = (language: string) => {
    if (onLanguageSelect) {
      // Toggle off if already selected
      onLanguageSelect(selectedLanguage === language ? null : language);
    }
  };

  return (
    <div
      className="hud-element absolute bottom-6 left-6 pointer-events-auto"
      style={{ animationDelay: "0.7s" }}
    >
      <div className="liquid-glass px-6 py-4 min-w-[280px]">
        <div className="space-y-4 font-mono text-xs">
          <div className="text-space-cyan/80 glow-cyan mb-3 font-display text-sm uppercase tracking-wider">
            Timeline Axis
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 border-l-2 border-space-cyan/30 pl-3">
              <span className="text-space-cyan glow-cyan text-lg">◀</span>
              <span className="font-display font-bold">2011</span>
              <span className="text-space-cyan/40 uppercase text-xs">
                Origin
              </span>
            </div>

            <div className="flex items-center gap-3 border-l-2 border-space-magenta/30 pl-3">
              <span className="text-space-magenta glow-magenta text-lg">
                ▶
              </span>
              <span className="font-display font-bold">2025</span>
              <span className="text-space-magenta/60 uppercase text-xs">
                Present
              </span>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-space-cyan/20">
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
