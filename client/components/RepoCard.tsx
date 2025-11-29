import { AppIdea } from "@shared/api";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { type Repository } from "../lib/repositoryData";
import { useRepoDetails } from "../hooks/useRepoDetails";
import { CardHeader } from "./repo-card/CardHeader";
import { CardMetrics } from "./repo-card/CardMetrics";
import { CardTimeline } from "./repo-card/CardTimeline";
import { CardActions } from "./repo-card/CardActions";
import { VibeIdeasDialog } from "./VibeIdeasDialog";
import { ExploreDialog } from "./ExploreDialog";

interface RepoCardProps {
  repo: Repository;
  position: { x: number; y: number };
  onClose: () => void;
}

export default function RepoCard({ repo, position, onClose }: RepoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [showIdeasDialog, setShowIdeasDialog] = useState(false);
  const [vibeIdeas, setVibeIdeas] = useState<AppIdea[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const [showExploreDialog, setShowExploreDialog] = useState(false);
  const [exploreContent, setExploreContent] = useState("");
  const [isExploring, setIsExploring] = useState(false);

  const { details, loading } = useRepoDetails(repo.id);

  // Animation Logic
  useEffect(() => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const tl = gsap.timeline();

    // Reset initial states
    gsap.set(card, { xPercent: -50, yPercent: -50 });

    tl.fromTo(
      card,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" },
    );

    const header = card.querySelector(".card-header");
    if (header) {
      gsap.fromTo(
        header,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.4, delay: 0.2, ease: "power2.out" },
      );
    }

    const metrics = card.querySelector(".card-metrics");
    if (metrics) {
      gsap.fromTo(
        metrics,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          delay: 0.3,
          ease: "back.out(2)",
        },
      );
    }

    const timeline = card.querySelector(".card-timeline");
    if (timeline) {
      gsap.fromTo(
        timeline,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, delay: 0.4, ease: "power2.out" },
      );
    }

    const buttons = card.querySelectorAll(".card-button");
    if (buttons.length > 0) {
      gsap.fromTo(
        buttons,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          delay: 0.5,
          stagger: 0.1,
          ease: "power2.out",
        },
      );
    }

    return () => {
      tl.kill();
    };
  }, []); // Run only on mount

  const fetchVibeIdeas = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: repo.id,
          description: details?.description || "",
          topics: details?.topics || [],
          languages: details?.languages || [repo.primaryLanguage],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}):`, errorText);
        let errorMessage = "Failed to generate ideas";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Response was not JSON (likely 502 or 500 HTML page)
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = (await response.json()) as { ideas: AppIdea[] };
      setVibeIdeas(data.ideas);
    } catch (error) {
      console.error("Error generating ideas:", error);
      setVibeIdeas([
        {
          title: "Error Generating Ideas",
          description:
            error instanceof Error
              ? error.message
              : "Could not connect to the AI mainframe.",
          builder_angle: "Try again later.",
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVibe = async (force = false) => {
    setShowIdeasDialog(true);
    // If we have ideas and not forcing, just show them (prefetching worked!)
    if (!force && vibeIdeas.length > 0) return;

    // Otherwise, fetch now
    if (!isGenerating) {
      await fetchVibeIdeas();
    }
  };

  const handleExplore = async () => {
    setShowExploreDialog(true);

    // TRIGGER PREFETCHING IN BACKGROUND
    // We don't await this, so it runs in parallel with exploration
    if (vibeIdeas.length === 0 && !isGenerating) {
      console.log("🚀 Prefetching Vibe Ideas in background...");
      fetchVibeIdeas();
    }

    if (exploreContent) return;

    setIsExploring(true);
    try {
      const response = await fetch("/api/ai/explore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: repo.id,
          description: details?.description || "",
          topics: details?.topics || [],
          languages: details?.languages || [repo.primaryLanguage],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to explore: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setExploreContent(data.markdown);
    } catch (error) {
      console.error("Error exploring:", error);
      setExploreContent(
        "Failed to explore repository. The machine spirits are silent.",
      );
    } finally {
      setIsExploring(false);
    }
  };

  const year = new Date(repo.createdAt).getFullYear();

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] pointer-events-auto"
        onClick={onClose}
      />

      <div
        ref={cardRef}
        className="repo-card fixed z-[1001] pointer-events-auto flex flex-col"
        style={{
          left: "50%",
          top: "50%",
          // transform is handled by GSAP (xPercent/yPercent)
          width: "500px",
          maxHeight: "95vh",
          height: "auto",
        }}
      >
        <div className="p-6 h-full overflow-y-auto">
          <CardHeader
            repo={repo}
            details={details}
            loading={loading}
            onClose={onClose}
          />

          {!loading && details && <CardMetrics details={details} />}

          <CardTimeline timestamp={repo.createdAt} />

          <CardActions
            repo={repo}
            onGenerate={() => handleGenerateVibe(false)}
            isGenerating={isGenerating}
            onExplore={handleExplore}
            isExploring={isExploring}
          />
        </div>
      </div>

      <VibeIdeasDialog
        open={showIdeasDialog}
        onOpenChange={setShowIdeasDialog}
        ideas={vibeIdeas}
        isGenerating={isGenerating}
        onGenerateMore={() => handleGenerateVibe(true)}
        repoName={repo.id}
      />

      <ExploreDialog
        open={showExploreDialog}
        onOpenChange={setShowExploreDialog}
        content={exploreContent}
        isGenerating={isExploring}
        repoId={repo.id}
        onGenerateVibe={() => handleGenerateVibe(false)}
      />
    </>
  );
}
