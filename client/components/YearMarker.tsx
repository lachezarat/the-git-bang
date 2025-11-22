import { useState, useEffect } from "react";

export default function YearMarker() {
  const [currentYear, setCurrentYear] = useState(2025);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentYear((prev) => {
        if (prev >= 2025) return 2008;
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="hud-element fixed bottom-12 left-12 pointer-events-none"
      style={{ animationDelay: "0.6s" }}
    >
      <div
        className="font-display font-bold text-white/10 select-none"
        style={{
          fontSize: "clamp(48px, 8vw, 120px)",
          letterSpacing: "-0.05em",
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {currentYear}
      </div>
      <div className="text-space-cyan/40 font-mono text-xs mt-2 tracking-wider">
        TEMPORAL MARKER
      </div>
    </div>
  );
}
