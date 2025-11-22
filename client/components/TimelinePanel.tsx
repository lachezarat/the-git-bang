export default function TimelinePanel() {
  return (
    <div
      className="hud-element absolute bottom-6 left-6 pointer-events-none"
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
              <span className="font-display font-bold">2008</span>
              <span className="text-space-cyan/40 uppercase text-xs">Origin</span>
            </div>

            <div className="flex items-center gap-3 border-l-2 border-space-magenta/30 pl-3">
              <span className="text-space-magenta glow-magenta text-lg">▶</span>
              <span className="font-display font-bold">2025</span>
              <span className="text-space-magenta/60 uppercase text-xs">Present</span>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-space-cyan/20">
            <div className="text-space-cyan/50 text-xs mb-3 uppercase tracking-wider">
              Stellar Classification
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ background: "#4a90e2" }} />
                <span className="text-xs text-space-cyan/70">JavaScript</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ background: "#00d9ff" }} />
                <span className="text-xs text-space-cyan/70">Go</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ background: "#ff6b35" }} />
                <span className="text-xs text-space-cyan/70">Rust</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ background: "#e85d75" }} />
                <span className="text-xs text-space-cyan/70">Ruby</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
