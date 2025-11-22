export default function ControlsPanel() {
  return (
    <div
      className="hud-element absolute bottom-6 right-6 pointer-events-none"
      style={{ animationDelay: "0.8s" }}
    >
      <div className="liquid-glass px-6 py-4 min-w-[260px]">
        <div className="space-y-3 font-mono">
          <div className="text-space-cyan/80 glow-cyan font-display text-sm uppercase tracking-wider mb-4">
            Navigation Controls
          </div>

          <div className="space-y-2 text-xs text-space-cyan/60">
            <div className="flex items-center justify-between border-l-2 border-space-cyan/20 pl-3">
              <span className="uppercase tracking-wide">Pan</span>
              <span className="text-space-cyan/80 font-semibold">
                Left Click + Drag
              </span>
            </div>

            <div className="flex items-center justify-between border-l-2 border-space-amber/20 pl-3">
              <span className="uppercase tracking-wide">Zoom</span>
              <span className="text-space-amber/80 font-semibold">
                Scroll Wheel
              </span>
            </div>

            <div className="flex items-center justify-between border-l-2 border-space-magenta/20 pl-3">
              <span className="uppercase tracking-wide">Orbit</span>
              <span className="text-space-magenta/80 font-semibold">
                Right Click + Drag
              </span>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-space-cyan/10">
            <div className="flex items-center gap-2 text-space-cyan/40 text-xs">
              <div className="w-1 h-1 rounded-full bg-space-cyan pulse-dot" />
              <span>Interactive Navigation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
