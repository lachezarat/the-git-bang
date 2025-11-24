interface YearMarkerProps {
  year?: number;
}

export default function YearMarker({ year = 2025 }: YearMarkerProps) {
  return (
    <div
      className="hud-element fixed top-20 left-6 pointer-events-none"
      style={{ animationDelay: "0.6s" }}
    >
      <div
        className="font-display font-bold text-white/10 select-none"
        style={{
          fontSize: "clamp(32px, 5vw, 72px)",
          letterSpacing: "-0.05em",
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {year}
      </div>
      <div className="text-space-cyan/40 font-mono text-xs mt-1 tracking-wider">
        TEMPORAL MARKER
      </div>
    </div>
  );
}
