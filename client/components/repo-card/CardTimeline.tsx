import { useState } from "react";

interface CardTimelineProps {
  timestamp: number;
}

export function CardTimeline({ timestamp }: CardTimelineProps) {
  const [hovered, setHovered] = useState(false);
  const year = new Date(timestamp).getFullYear();
  const dateStr = new Date(timestamp).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="card-timeline mb-6">
      <div className="text-space-cyan/80 font-display text-xs uppercase tracking-wider mb-3">
        Temporal Context
      </div>
      <div
        className="relative h-12 border border-space-cyan/20 bg-space-void/30 p-2 cursor-crosshair"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="absolute left-0 top-0 bottom-0 w-px bg-space-cyan/30" />
        <div className="absolute right-0 top-0 bottom-0 w-px bg-space-cyan/30" />

        {/* Progress Indicator */}
        <div
          className="absolute top-2 bottom-2 w-1 bg-space-cyan shadow-[0_0_10px_rgba(0,255,249,0.8)] z-10"
          style={{
            left: `${Math.max(0, Math.min(100, ((year - 2011) / (2025 - 2011)) * 100))}%`,
          }}
        />

        {/* Date Tooltip */}
        <div
          className={`absolute top-[-2rem] transform -translate-x-1/2 bg-space-void border border-space-cyan/50 px-2 py-1 text-[10px] text-space-cyan font-mono shadow-[0_0_10px_rgba(0,255,249,0.3)] transition-opacity duration-200 pointer-events-none z-20 ${hovered ? "opacity-100" : "opacity-0"}`}
          style={{
            left: `${Math.max(0, Math.min(100, ((year - 2011) / (2025 - 2011)) * 100))}%`,
          }}
        >
          {dateStr}
        </div>

        <div className="flex justify-between text-xs text-space-cyan/40 font-mono mt-8">
          <span>2011</span>
          <span>2025</span>
        </div>
      </div>
    </div>
  );
}
