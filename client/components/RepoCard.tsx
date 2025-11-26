import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { type Repository } from "../lib/repositoryData";
import { useRepoDetails } from "../hooks/useRepoDetails";
import { CardHeader } from "./repo-card/CardHeader";
import { CardMetrics } from "./repo-card/CardMetrics";
import { CardTimeline } from "./repo-card/CardTimeline";
import { CardActions } from "./repo-card/CardActions";

interface RepoCardProps {
  repo: Repository;
  position: { x: number; y: number };
  onClose: () => void;
}

export default function RepoCard({ repo, position, onClose }: RepoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [vibeIdeas, setVibeIdeas] = useState<string[]>([]);

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

  const handleGenerateVibe = () => {
    setExpanded(true);
    setVibeIdeas([
      "AI-Powered Code Review Dashboard",
      "Real-Time Collaboration Workspace",
      "Developer Analytics Platform",
    ]);

    if (cardRef.current) {
      gsap.to(cardRef.current, {
        height: 900,
        duration: 0.5,
        ease: "power2.inOut",
      });
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
          width: "420px",
          maxHeight: "80vh",
          height: expanded ? "auto" : "auto",
          transition: "height 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
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
            onExpand={handleGenerateVibe}
            expanded={expanded}
            vibeIdeas={vibeIdeas}
          />
        </div>
      </div>
    </>
  );
}
