import {
  type Repository,
  type RepositoryDetails,
  getLanguageColor,
} from "../../lib/repositoryData";

interface CardHeaderProps {
  repo: Repository;
  details: RepositoryDetails | null;
  loading: boolean;
  onClose: () => void;
}

export function CardHeader({
  repo,
  details,
  loading,
  onClose,
}: CardHeaderProps) {
  return (
    <>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center border border-space-cyan/30 bg-space-void/50 hover:bg-space-cyan/20 transition-colors z-10"
        style={{
          clipPath:
            "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)",
        }}
      >
        <svg
          className="w-4 h-4 text-space-cyan"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div className="card-header space-y-3 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-display font-bold text-white glow-cyan mb-1 break-all">
              {repo.name}
            </h2>
            <div className="text-space-cyan/60 font-mono text-sm">
              {repo.owner}
            </div>
          </div>

          <div className="text-right space-y-1 font-mono text-xs">
            <div className="text-space-amber glow-amber font-bold text-lg tabular-nums">
              {repo.stars.toLocaleString()}
            </div>
            <div className="text-space-cyan/50">STARS</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="px-3 py-1 text-xs font-mono font-semibold border angular-clip"
            style={{
              backgroundColor: `#${repo.color.toString(16)}20`,
              borderColor: `#${repo.color.toString(16)}`,
              color: `#${repo.color.toString(16)}`,
            }}
          >
            {repo.primaryLanguage}
          </div>
          {details && (
            <div className="text-space-cyan/40 font-mono text-xs">
              {details.forks.toLocaleString()} FORKS
            </div>
          )}
        </div>

        <p className="text-space-cyan/70 text-sm font-mono leading-relaxed">
          {loading ? "Loading details..." : details?.description}
        </p>
      </div>
    </>
  );
}
