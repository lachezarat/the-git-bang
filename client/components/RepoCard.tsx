import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

interface RepoData {
  name: string;
  owner: string;
  language: string;
  stars: number;
  forks: number;
  description: string;
  activity: number;
  growth: number;
  health: number;
  community: number;
  year: number;
}

interface RepoCardProps {
  repo: RepoData;
  position: { x: number; y: number };
  onClose: () => void;
}

export default function RepoCard({ repo, position, onClose }: RepoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [vibeIdeas, setVibeIdeas] = useState<string[]>([]);

  useEffect(() => {
    if (!cardRef.current) return;

    const tl = gsap.timeline();

    tl.fromTo(
      cardRef.current,
      {
        opacity: 0,
        scale: 0.8,
        y: 20,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.6,
        ease: "expo.out",
      }
    );

    gsap.fromTo(
      ".card-header",
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.4, delay: 0.2, ease: "power2.out" }
    );

    gsap.fromTo(
      ".card-metrics",
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.4, delay: 0.3, ease: "back.out(2)" }
    );

    gsap.fromTo(
      ".card-timeline",
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, delay: 0.4, ease: "power2.out" }
    );

    gsap.fromTo(
      ".card-button",
      { opacity: 0, y: 10 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.3, 
        delay: 0.5, 
        stagger: 0.1, 
        ease: "power2.out" 
      }
    );

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

  const languageColors: Record<string, string> = {
    JavaScript: "#4a90e2",
    TypeScript: "#2b7489",
    Python: "#3572a5",
    Go: "#00d9ff",
    Rust: "#ff6b35",
    Ruby: "#e85d75",
    Java: "#b07219",
  };

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
          left: `${Math.min(Math.max(position.x, 220), window.innerWidth - 220)}px`,
          top: `${Math.min(Math.max(position.y, 320), window.innerHeight - 320)}px`,
          transform: "translate(-50%, -50%)",
          width: "420px",
          height: expanded ? "900px" : "600px",
          transition: "height 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center border border-space-cyan/30 bg-space-void/50 hover:bg-space-cyan/20 transition-colors z-10"
          style={{ clipPath: "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)" }}
        >
          <svg className="w-4 h-4 text-space-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 h-full overflow-y-auto">
          <div className="card-header space-y-3 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-2xl font-display font-bold text-white glow-cyan mb-1">
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
                  backgroundColor: `${languageColors[repo.language] || "#f2f2f2"}20`,
                  borderColor: languageColors[repo.language] || "#f2f2f2",
                  color: languageColors[repo.language] || "#f2f2f2",
                }}
              >
                {repo.language}
              </div>
              <div className="text-space-cyan/40 font-mono text-xs">
                {repo.forks.toLocaleString()} FORKS
              </div>
            </div>

            <p className="text-space-cyan/70 text-sm font-mono leading-relaxed">
              {repo.description}
            </p>
          </div>

          <div className="card-metrics mb-6">
            <div className="text-space-cyan/80 font-display text-xs uppercase tracking-wider mb-4">
              Intelligence Metrics
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="border-l-2 border-space-cyan/30 pl-3">
                <div className="text-space-cyan/50 text-xs mb-1">Activity</div>
                <div className="text-space-cyan font-bold text-lg tabular-nums">
                  {repo.activity}%
                </div>
              </div>
              <div className="border-l-2 border-space-amber/30 pl-3">
                <div className="text-space-amber/50 text-xs mb-1">Growth</div>
                <div className="text-space-amber font-bold text-lg tabular-nums glow-amber">
                  {repo.growth}%
                </div>
              </div>
              <div className="border-l-2 border-space-magenta/30 pl-3">
                <div className="text-space-magenta/50 text-xs mb-1">Health</div>
                <div className="text-space-magenta font-bold text-lg tabular-nums glow-magenta">
                  {repo.health}%
                </div>
              </div>
              <div className="border-l-2 border-space-cyan/30 pl-3">
                <div className="text-space-cyan/50 text-xs mb-1">Community</div>
                <div className="text-space-cyan font-bold text-lg tabular-nums">
                  {repo.community}
                </div>
              </div>
            </div>
          </div>

          <div className="card-timeline mb-6">
            <div className="text-space-cyan/80 font-display text-xs uppercase tracking-wider mb-3">
              Temporal Context
            </div>
            <div className="relative h-12 border border-space-cyan/20 bg-space-void/30 p-2">
              <div className="absolute left-0 top-0 bottom-0 w-px bg-space-cyan/30" />
              <div className="absolute right-0 top-0 bottom-0 w-px bg-space-cyan/30" />
              <div
                className="absolute top-2 bottom-2 w-1 bg-space-cyan shadow-[0_0_10px_rgba(0,255,249,0.8)]"
                style={{ left: `${((repo.year - 2008) / (2025 - 2008)) * 100}%` }}
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
              onClick={() => window.open(`https://deepwiki.com/${repo.owner}/${repo.name}`, '_blank')}
            >
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-space-cyan" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 2h2v2h-2V5zm0 4h2v2h-2V9zm-4-4h2v2H8V5zm0 4h2v2H8V9zM6 5h2v2H6V5zm0 4h2v2H6V9zm0 4h2v2H6v-2zm0 4h2v2H6v-2zm2 4H6v-2h2v2zm12 0h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2v-2h2v2z"/>
                </svg>
                <div className="text-left">
                  <div className="text-space-cyan font-display font-bold">DEEP DIVE</div>
                  <div className="text-space-cyan/50 text-xs font-mono">Explore on DeepWiki</div>
                </div>
              </div>
              <svg className="w-5 h-5 text-space-cyan group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              className="card-button w-full border-beam liquid-glass px-6 py-4 flex items-center justify-between group hover:shadow-[0_0_30px_rgba(255,0,110,0.4)] transition-all hover:scale-[1.02]"
              style={{ borderColor: "rgba(255, 0, 110, 0.3)" }}
              onClick={handleGenerateVibe}
            >
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-space-magenta" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                </svg>
                <div className="text-left">
                  <div className="text-space-magenta font-display font-bold glow-magenta">
                    GENERATE VIBE CODE
                  </div>
                  <div className="text-space-magenta/50 text-xs font-mono">AI-Powered App Ideas</div>
                </div>
              </div>
              <svg className="w-5 h-5 text-space-magenta group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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

            <button className="card-button w-full px-6 py-3 flex items-center justify-between text-space-cyan/60 hover:text-space-cyan border border-space-cyan/10 hover:border-space-cyan/30 transition-all group">
              <span className="font-mono text-sm uppercase tracking-wide">View Commits</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
