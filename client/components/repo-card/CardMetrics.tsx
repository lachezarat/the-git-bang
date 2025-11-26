import {
  type RepositoryDetails,
  getLanguageColor,
} from "../../lib/repositoryData";

interface CardMetricsProps {
  details: RepositoryDetails;
}

export function CardMetrics({ details }: CardMetricsProps) {
  return (
    <>
      <div className="card-metrics mb-6">
        <div className="text-space-cyan/80 font-display text-xs uppercase tracking-wider mb-4">
          Intelligence Metrics
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="border-l-2 border-space-cyan/30 pl-3">
            <div className="text-space-cyan/50 text-xs mb-1">Commits</div>
            <div className="text-space-cyan font-bold text-lg tabular-nums">
              {details.commits.toLocaleString()}
            </div>
          </div>
          <div className="border-l-2 border-space-amber/30 pl-3">
            <div className="text-space-amber/50 text-xs mb-1">Watchers</div>
            <div className="text-space-amber font-bold text-lg tabular-nums glow-amber">
              {details.watchers.toLocaleString()}
            </div>
          </div>
          <div className="border-l-2 border-space-magenta/30 pl-3">
            <div className="text-space-magenta/50 text-xs mb-1">Open PRs</div>
            <div className="text-space-magenta font-bold text-lg tabular-nums glow-magenta">
              {details.openPrs.toLocaleString()}
            </div>
          </div>
          <div className="border-l-2 border-space-cyan/30 pl-3">
            <div className="text-space-cyan/50 text-xs mb-1">Contributors</div>
            <div className="text-space-cyan font-bold text-lg tabular-nums">
              {details.contributors.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {details.languages.length > 0 && (
        <div className="card-metrics mb-6">
          <div className="text-space-cyan/80 font-display text-xs uppercase tracking-wider mb-4">
            Language Breakdown
          </div>
          <div className="grid grid-cols-2 gap-2">
            {details.languages.slice(0, 9).map((lang, i) => {
              const color = getLanguageColor(lang);
              return (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: `#${color.toString(16)}` }}
                  />
                  <span className="text-space-cyan/70 text-xs font-mono truncate">
                    {lang}
                  </span>
                </div>
              );
            })}
            {details.languages.length > 9 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-space-cyan/30" />
                <span className="text-space-cyan/70 text-xs font-mono">
                  Others ({details.languages.length - 9})
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
