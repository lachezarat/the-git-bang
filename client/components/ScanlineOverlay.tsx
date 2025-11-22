export default function ScanlineOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[9998]">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            rgba(0, 255, 249, 0.03) 0px,
            transparent 1px,
            transparent 2px,
            rgba(0, 255, 249, 0.03) 3px
          )`,
          animation: "scanlineScroll 8s linear infinite",
        }}
      />
      <style>{`
        @keyframes scanlineScroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }
      `}</style>
    </div>
  );
}
