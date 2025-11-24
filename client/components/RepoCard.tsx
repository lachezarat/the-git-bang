import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import {
  type Repository,
  type RepositoryDetails,
  fetchRepositoryDetails,
  getLanguageColor
} from "../lib/repositoryData";

interface RepoCardProps {
  repo: Repository;
  position: { x: number; y: number };
  onClose: () => void;
}



export default function RepoCard({ repo, position, onClose }: RepoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [vibeIdeas, setVibeIdeas] = useState<string[]>([]);
  const [details, setDetails] = useState<RepositoryDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Calculate safe position within viewport bounds
  const cardWidth = 420;
  const maxCardHeight = window.innerHeight - 120;
  const padding = 20;

  const halfWidth = cardWidth / 2;
  const halfHeight = maxCardHeight / 2;

  const safeX = Math.min(
    Math.max(position.x, halfWidth + padding),
    window.innerWidth - halfWidth - padding,
  );
  const safeY = Math.min(
    Math.max(position.y, halfHeight + padding),
    window.innerHeight - halfHeight - padding,
  );

  useEffect(() => {
    let mounted = true;

    const loadDetails = async () => {
      setLoading(true);
      const data = await fetchRepositoryDetails(repo.id);
      if (mounted) {
        setDetails(data);
        setLoading(false);
      }
    };

    loadDetails();

    return () => {
      mounted = false;
    };
  }, [repo.id]);

  useEffect(() => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const tl = gsap.timeline();

    // Animate the card itself
    tl.fromTo(
      card,
      { opacity: 0, scale: 0.8, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "expo.out" },
    );

    // Animate elements only if they exist
    const header = card.querySelector(".card-header");
    if (header) {
      gsap.fromTo(
        header,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.4, delay: 0.2, ease: "power2.out" },
      );
    }

    const metrics = card.querySelector(".card-metrics");
    if (metrics) {
      gsap.fromTo(
        metrics,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.4, delay: 0.3, ease: "back.out(2)" },
      );
    }

    const timeline = card.querySelector(".card-timeline");
    if (timeline) {
      gsap.fromTo(
        timeline,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, delay: 0.4, ease: "power2.out" },
      );
    }

    const buttons = card.querySelectorAll(".card-button");
    if (buttons.length > 0) {
      gsap.fromTo(
        buttons,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, delay: 0.5, stagger: 0.1, ease: "power2.out" },
      );
    }

    return () => {
      tl.kill();
    };
  }, []);

  const handleGenerateVibe = () => {
    setExpanded(true);
    setVibeIdeas([
      "AI-Powered Code Review Dashboard",
      "Real-Time Collaboration Workspace",
      "Developer Analytics Platform",
    ]);

    if (cardRef.current) {
      gsap.to(cardRef.current, {
        height: 900,
        duration: 0.5,
        ease: "power2.inOut",
      });
    }
  };

  const year = new Date(repo.createdAt).getFullYear();

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] pointer-events-auto"
        onClick={onClose}
      />

      <div
        ref={cardRef}
        className="repo-card fixed z-[1001] pointer-events-auto"
        style={{
          left: `${safeX}px`,
          top: `${safeY}px`,
          transform: "translate(-50%, -50%)",
          width: "420px",
          maxHeight: "calc(100vh - 120px)",
          height: expanded ? "auto" : "auto",
          transition: "height 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center border border-space-cyan/30 bg-space-void/50 hover:bg-space-cyan/20 transition-colors z-10"
          style={{
            clipPath:
              "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)",
          }}
        >
          <svg
            className="w-4 h-4 text-space-cyan"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-6 h-full overflow-y-auto">
          <div className="card-header space-y-3 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-2xl font-display font-bold text-white glow-cyan mb-1 break-all">
                  {repo.name}
                </h2>
                <div className="text-space-cyan/60 font-mono text-sm">
                  {repo.owner}
                </div>
              </div>

              <div className="text-right space-y-1 font-mono text-xs">
                <div className="text-space-amber glow-amber font-bold text-lg tabular-nums">
                  {repo.stars.toLocaleString()}
                </div>
                <div className="text-space-cyan/50">STARS</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="px-3 py-1 text-xs font-mono font-semibold border angular-clip"
                style={{
                  backgroundColor: `#${repo.color.toString(16)}20`,
                  borderColor: `#${repo.color.toString(16)}`,
                  color: `#${repo.color.toString(16)}`,
                }}
              >
                {repo.primaryLanguage}
              </div>
              {details && (
                <div className="text-space-cyan/40 font-mono text-xs">
                  {details.forks.toLocaleString()} FORKS
                </div>
              )}
            </div>

            <p className="text-space-cyan/70 text-sm font-mono leading-relaxed">
              {loading ? "Loading details..." : details?.description}
            </p>
          </div>

          {!loading && details && (
            <>
              <div className="card-metrics mb-6">
                <div className="text-space-cyan/80 font-display text-xs uppercase tracking-wider mb-4">
                  Intelligence Metrics
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-l-2 border-space-cyan/30 pl-3">
                    <div className="text-space-cyan/50 text-xs mb-1">Commits</div>
                    <div className="text-space-cyan font-bold text-lg tabular-nums">
                      {details.commits.toLocaleString()}
                    </div>
                  </div>
                  <div className="border-l-2 border-space-amber/30 pl-3">
                    <div className="text-space-amber/50 text-xs mb-1">Watchers</div>
                    <div className="text-space-amber font-bold text-lg tabular-nums glow-amber">
                      {details.watchers.toLocaleString()}
                    </div>
                  </div>
                  <div className="border-l-2 border-space-magenta/30 pl-3">
                    <div className="text-space-magenta/50 text-xs mb-1">Open PRs</div>
                    <div className="text-space-magenta font-bold text-lg tabular-nums glow-magenta">
                      {details.openPrs.toLocaleString()}
                    </div>
                  </div>
                  <div className="border-l-2 border-space-cyan/30 pl-3">
                    <div className="text-space-cyan/50 text-xs mb-1">Contributors</div>
                    <div className="text-space-cyan font-bold text-lg tabular-nums">
                      {details.contributors.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {details.languages.length > 0 && (
                <div className="card-metrics mb-6">
                  <div className="text-space-cyan/80 font-display text-xs uppercase tracking-wider mb-4">
                    Language Breakdown
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {details.languages.slice(0, 9).map((lang, i) => {
                      const color = getLanguageColor(lang);
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: `#${color.toString(16)}` }}
                          />
                          <span className="text-space-cyan/70 text-xs font-mono truncate">
                            {lang}
                          </span>
                        </div>
                      );
                    })}
                    {details.languages.length > 9 && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-space-cyan/30" />
                        <span className="text-space-cyan/70 text-xs font-mono">
                          Others ({details.languages.length - 9})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="card-timeline mb-6">
            <div className="text-space-cyan/80 font-display text-xs uppercase tracking-wider mb-3">
              Temporal Context
            </div>
            <div className="relative h-12 border border-space-cyan/20 bg-space-void/30 p-2">
              <div className="absolute left-0 top-0 bottom-0 w-px bg-space-cyan/30" />
              <div className="absolute right-0 top-0 bottom-0 w-px bg-space-cyan/30" />
              <div
                className="absolute top-2 bottom-2 w-1 bg-space-cyan shadow-[0_0_10px_rgba(0,255,249,0.8)]"
                style={{
                  left: `${Math.max(0, Math.min(100, ((year - 2008) / (2025 - 2008)) * 100))}%`,
                }}
              />
              <div className="flex justify-between text-xs text-space-cyan/40 font-mono mt-8">
                <span>2008</span>
                <span>2025</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              className="card-button w-full border-beam liquid-glass px-6 py-4 flex items-center justify-between group hover:shadow-[0_0_30px_rgba(0,255,249,0.4)] transition-all hover:scale-[1.02]"
              onClick={() =>
                window.open(
                  `https://github.com/${repo.id}`,
                  "_blank",
                )
              }
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
                    GITHUB
                  </div>
                  <div className="text-space-cyan/50 text-xs font-mono">
                    View Repository
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
              onClick={handleGenerateVibe}
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

            {expanded && vibeIdeas.length > 0 && (
              <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-space-cyan/80 font-display text-xs uppercase tracking-wider mb-3">
                  Generated App Ideas
                </div>
                {vibeIdeas.map((idea, i) => (
                  <div
                    key={i}
                    className="liquid-glass p-4 border border-space-magenta/20 hover:border-space-magenta/50 hover:shadow-[0_0_20px_rgba(255,0,110,0.3)] transition-all cursor-pointer group"
                  >
                    <div className="text-space-magenta font-mono text-sm font-semibold mb-2 group-hover:glow-magenta">
                      {idea}
                    </div>
                    <div className="text-space-cyan/40 text-xs font-mono">
                      Click to build with Builder.io
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
