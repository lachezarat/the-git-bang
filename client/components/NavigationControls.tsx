export default function NavigationControls() {
  return (
    <div
      className="hud-element absolute top-6 left-6 flex gap-3 pointer-events-auto"
      style={{ animationDelay: "0.1s" }}
    >
      <button
        className="relative w-12 h-12 liquid-glass diamond-clip group hover:scale-105 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,249,0.4)]"
        title="Reset Camera"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-space-cyan group-hover:text-white transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
      </button>

      <button
        className="relative w-12 h-12 liquid-glass diamond-clip group hover:scale-105 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,249,0.4)]"
        title="Toggle Post-Processing"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-space-cyan group-hover:text-white transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </div>
      </button>

      <button
        className="relative w-12 h-12 liquid-glass diamond-clip group hover:scale-105 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,249,0.4)]"
        title="Toggle Particle Labels"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-space-cyan group-hover:text-white transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
        </div>
      </button>
    </div>
  );
}
