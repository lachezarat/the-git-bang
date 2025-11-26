import { AppIdea } from "@shared/api";
import { type Repository } from "../../lib/repositoryData";

interface CardActionsProps {
  repo: Repository;
  onExpand: () => void | Promise<void>;
  expanded: boolean;
  vibeIdeas: AppIdea[];
  isGenerating: boolean;
}

export function CardActions({
  repo,
  onExpand,
  expanded,
  vibeIdeas,
  isGenerating,
}: CardActionsProps) {
  return (
    <div className="space-y-3">
      <button
        className="card-button w-full border-beam liquid-glass px-6 py-4 flex items-center justify-between group hover:shadow-[0_0_30px_rgba(0,255,249,0.4)] transition-all hover:scale-[1.02]"
        onClick={() => window.open(`https://deepwiki.com/${repo.id}`, "_blank")}
      >
        <div className="flex items-center gap-3">
          <svg
            className="w-6 h-6 text-space-cyan"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <div className="text-left">
            <div className="text-space-cyan font-display font-bold">
              DEEPWIKI
            </div>
            <div className="text-space-cyan/50 text-xs font-mono">
              View Analysis
            </div>
          </div>
        </div>
        <svg
          className="w-5 h-5 text-space-cyan group-hover:translate-x-1 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      <button
        className="card-button w-full border-beam liquid-glass px-6 py-4 flex items-center justify-between group hover:shadow-[0_0_30px_rgba(255,0,110,0.4)] transition-all hover:scale-[1.02]"
        style={{ borderColor: "rgba(255, 0, 110, 0.3)" }}
        onClick={onExpand}
      >
        <div className="flex items-center gap-3">
          <svg
            className="w-6 h-6 text-space-magenta"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
          </svg>
          <div className="text-left">
            <div className="text-space-magenta font-display font-bold glow-magenta">
              USE FOR VIBE CODING
            </div>
            <div className="text-space-magenta/50 text-xs font-mono">
              AI-Powered App Ideas
            </div>
          </div>
        </div>
        <svg
          className="w-5 h-5 text-space-magenta group-hover:translate-x-1 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {expanded && (
        <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-space-cyan/80 font-display text-xs uppercase tracking-wider mb-3">
            Generated App Ideas
          </div>

          {isGenerating ? (
            <div className="liquid-glass p-6 border border-space-magenta/20 flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-space-magenta border-t-transparent rounded-full animate-spin" />
              <div className="text-space-magenta/80 text-xs font-mono animate-pulse">
                CONSULTING MACHINE SPIRITS...
              </div>
            </div>
          ) : (
            vibeIdeas.map((idea, i) => (
              <div
                key={i}
                className="liquid-glass p-4 border border-space-magenta/20 hover:border-space-magenta/50 hover:shadow-[0_0_20px_rgba(255,0,110,0.3)] transition-all cursor-pointer group"
                onClick={() =>
                  window.open("https://builder.io/c/docs/developers", "_blank")
                }
              >
                <div className="text-space-magenta font-display font-bold text-sm mb-1 group-hover:glow-magenta">
                  {idea.title}
                </div>
                <div className="text-gray-300 text-xs font-sans mb-3 leading-relaxed">
                  {idea.description}
                </div>
                <div className="bg-space-magenta/10 border border-space-magenta/30 p-2 rounded">
                  <div className="text-space-magenta/80 text-[10px] font-mono uppercase mb-1">
                    Builder.io Acceleration
                  </div>
                  <div className="text-space-cyan/80 text-xs font-mono leading-tight">
                    {idea.builder_angle}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
