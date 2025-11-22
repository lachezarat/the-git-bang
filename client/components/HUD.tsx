import { useEffect, useState } from "react";

export default function HUD() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hud-container pointer-events-none">
      <div
        className="hud-element absolute top-6 left-6 font-display text-xs md:text-sm"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="space-y-1 text-space-cyan/80">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-space-cyan animate-pulse" />
            <span className="glow-cyan">GITCOSMOS v1.0.0</span>
          </div>
          <div className="text-space-cyan/50 font-data text-xs">
            OBSERVATORY STATUS: ACTIVE
          </div>
        </div>
      </div>

      <div
        className="hud-element absolute top-6 right-6 font-data text-xs md:text-sm text-right"
        style={{ animationDelay: "0.4s" }}
      >
        <div className="space-y-1 text-space-cyan/80">
          <div className="glow-cyan">
            {time.toLocaleTimeString("en-US", { hour12: false })}
          </div>
          <div className="text-space-cyan/50 text-xs">
            STARDATE: {time.toLocaleDateString("en-US")}
          </div>
        </div>
      </div>

      <div
        className="hud-element absolute bottom-6 left-6 font-data text-xs"
        style={{ animationDelay: "0.6s" }}
      >
        <div className="space-y-2 text-space-cyan/60">
          <div className="flex items-center gap-2">
            <span className="text-space-magenta glow-magenta">◆</span>
            <span>NEURAL PATHFINDING: 100%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-space-cyan glow-cyan">◆</span>
            <span>QUANTUM RENDERER: OPTIMAL</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-space-amber glow-amber">◆</span>
            <span>CHROMATIC FILTER: ACTIVE</span>
          </div>
        </div>
      </div>

      <div
        className="hud-element absolute bottom-6 right-6 font-display text-xs pointer-events-auto"
        style={{ animationDelay: "0.8s" }}
      >
        <div className="px-4 py-3 border border-space-cyan/20 bg-space-void/40 backdrop-blur-sm rounded-sm">
          <div className="text-space-cyan/80 mb-2 glow-cyan">
            NAVIGATION CONTROLS
          </div>
          <div className="space-y-1 text-space-cyan/50 font-data text-xs">
            <div>ORBIT: LEFT CLICK + DRAG</div>
            <div>ZOOM: SCROLL WHEEL</div>
            <div>PAN: RIGHT CLICK + DRAG</div>
          </div>
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="hud-element" style={{ animationDelay: "1s" }}>
          <div className="w-8 h-8 border border-space-cyan/30 rounded-full relative">
            <div className="absolute inset-0 border border-space-cyan/20 rounded-full animate-ping" />
            <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-space-cyan rounded-full -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      <div
        className="hud-element absolute top-1/2 left-6 -translate-y-1/2"
        style={{ animationDelay: "1.2s" }}
      >
        <div className="h-32 w-px bg-gradient-to-b from-transparent via-space-cyan/30 to-transparent" />
      </div>

      <div
        className="hud-element absolute top-1/2 right-6 -translate-y-1/2"
        style={{ animationDelay: "1.2s" }}
      >
        <div className="h-32 w-px bg-gradient-to-b from-transparent via-space-magenta/30 to-transparent" />
      </div>

      <div
        className="hud-element absolute top-6 left-1/2 -translate-x-1/2"
        style={{ animationDelay: "1.4s" }}
      >
        <div className="w-32 h-px bg-gradient-to-r from-transparent via-space-cyan/30 to-transparent" />
      </div>

      <div
        className="hud-element absolute bottom-6 left-1/2 -translate-x-1/2"
        style={{ animationDelay: "1.4s" }}
      >
        <div className="w-32 h-px bg-gradient-to-r from-transparent via-space-amber/30 to-transparent" />
      </div>
    </div>
  );
}
