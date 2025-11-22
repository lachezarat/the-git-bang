export default function StatsPanel() {
  return (
    <div
      className="hud-element absolute top-6 right-6 pointer-events-auto"
      style={{ animationDelay: "0.2s" }}
    >
      <div className="liquid-glass px-6 py-4 min-w-[320px] relative overflow-hidden">
        <div className="scanline-overlay absolute inset-0 pointer-events-none opacity-30" />

        <div className="relative space-y-3 font-mono text-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-space-cyan pulse-dot" />
            <span className="text-space-cyan/60 uppercase tracking-wider">
              System Status
            </span>
          </div>

          <div
            className="flex justify-between items-baseline border-l-2 border-space-cyan/20 pl-3"
            style={{ animationDelay: "0.3s" }}
          >
            <span className="text-space-cyan/50 uppercase tracking-wide">
              Repositories Indexed
            </span>
            <span className="text-space-amber glow-amber font-bold text-base tabular-nums">
              47,293
            </span>
          </div>

          <div
            className="flex justify-between items-baseline border-l-2 border-space-magenta/20 pl-3"
            style={{ animationDelay: "0.4s" }}
          >
            <span className="text-space-cyan/50 uppercase tracking-wide">
              Timeline Range
            </span>
            <span className="text-space-magenta glow-magenta font-bold text-base tabular-nums">
              2008-2025
            </span>
          </div>

          <div
            className="flex justify-between items-baseline border-l-2 border-space-cyan/20 pl-3"
            style={{ animationDelay: "0.5s" }}
          >
            <span className="text-space-cyan/50 uppercase tracking-wide">
              Active Cluster
            </span>
            <span className="text-space-cyan glow-cyan font-bold text-base">
              JavaScript
            </span>
          </div>

          <div className="pt-3 mt-3 border-t border-space-cyan/10">
            <div className="flex items-center gap-2 text-space-cyan/40">
              <div className="w-1 h-1 rounded-full bg-space-cyan animate-pulse" />
              <span className="text-xs">
                LIVE RENDERING • {new Date().getFullYear()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
