import { useEffect, useState } from "react";

export default function BootSequence() {
  const [showScanline, setShowScanline] = useState(true);
  const [currentText, setCurrentText] = useState("");
  const fullText = "INITIALIZING GITCOSMOS OBSERVATORY...";

  useEffect(() => {
    const scanlineTimer = setTimeout(() => {
      setShowScanline(false);
    }, 2000);

    let index = 0;
    const typingInterval = setInterval(() => {
      if (index <= fullText.length) {
        setCurrentText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);

    return () => {
      clearTimeout(scanlineTimer);
      clearInterval(typingInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[10000] bg-space-void flex items-center justify-center pointer-events-none">
      {showScanline && <div className="scanline" />}

      <div className="text-center space-y-8">
        <div className="terminal-text text-2xl md:text-4xl font-display glow-cyan">
          {currentText}
          <span className="animate-flicker">_</span>
        </div>

        <div className="space-y-2 text-sm md:text-base font-data text-space-cyan/60">
          <div className="hud-element" style={{ animationDelay: "1s" }}>
            [✓] QUANTUM RENDERING ENGINE... ONLINE
          </div>
          <div className="hud-element" style={{ animationDelay: "1.2s" }}>
            [✓] NEURAL PATHFINDING MATRIX... ACTIVE
          </div>
          <div className="hud-element" style={{ animationDelay: "1.4s" }}>
            [✓] CHROMATIC ABERRATION FILTER... CALIBRATED
          </div>
          <div className="hud-element" style={{ animationDelay: "1.6s" }}>
            [✓] SPATIAL VISUALIZATION CORE... INITIALIZED
          </div>
          <div className="hud-element" style={{ animationDelay: "1.8s" }}>
            [✓] DEEP SPACE NAVIGATION... READY
          </div>
        </div>

        <div className="hud-element mt-12" style={{ animationDelay: "2.5s" }}>
          <div className="inline-block px-6 py-2 border border-space-cyan/30 rounded-sm">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-space-cyan animate-pulse" />
              <span className="text-space-cyan/80 font-data text-xs tracking-wider">
                SYSTEM BOOT SEQUENCE IN PROGRESS
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
