import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { AppIdea } from "@shared/api";
import { useState, useEffect } from "react";
import { IdeaPlanDialog } from "./IdeaPlanDialog";
import { useToast } from "@/hooks/use-toast";
import { ProgressBar } from "./ProgressBar";

interface VibeIdeasDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ideas: AppIdea[];
    isGenerating: boolean;
    onGenerateMore: () => void;
    repoName?: string;
}

export function VibeIdeasDialog({
    open,
    onOpenChange,
    ideas,
    isGenerating,
    onGenerateMore,
    repoName = "Repository",
}: VibeIdeasDialogProps) {
    const [selectedIdea, setSelectedIdea] = useState<AppIdea | null>(null);
    const [planContent, setPlanContent] = useState<string>("");
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
    const [showPlanDialog, setShowPlanDialog] = useState(false);
    const [pageIndex, setPageIndex] = useState(0);
    const { toast } = useToast();

    // Reset page index when ideas change (new batch fetched)
    useEffect(() => {
        setPageIndex(0);
    }, [ideas]);

    const displayedIdeas = ideas.slice(pageIndex * 3, (pageIndex + 1) * 3);
    const hasMoreLocalIdeas = (pageIndex + 1) * 3 < ideas.length;

    const handleLocalGenerateMore = () => {
        if (hasMoreLocalIdeas) {
            setPageIndex(prev => prev + 1);
        } else {
            onGenerateMore();
        }
    };

    const handleGetPlan = async (idea: AppIdea) => {
        setSelectedIdea(idea);
        setShowPlanDialog(true);
        setIsGeneratingPlan(true);
        setPlanContent("");

        try {
            const response = await fetch("/api/ai/idea-plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ideaTitle: idea.title,
                    ideaDescription: idea.description,
                    ideaBuilderAngle: idea.builder_angle,
                    repoName: repoName,
                }),
            });

            if (!response.ok) throw new Error("Failed to generate plan");

            const data = await response.json();
            setPlanContent(data.markdown);
        } catch (error) {
            console.error("Plan generation failed:", error);
            toast({
                title: "Plan Generation Failed",
                description: "Could not generate execution plan. Please try again.",
                variant: "destructive",
            });
            setShowPlanDialog(false);
        } finally {
            setIsGeneratingPlan(false);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[600px] bg-black/90 border-space-magenta/50 backdrop-blur-xl text-white z-[2000]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-display font-bold text-space-magenta glow-magenta">
                            Vibe Coding Ideas
                        </DialogTitle>
                        <DialogDescription className="text-space-cyan/70">
                            AI-generated app concepts accelerated by Builder.io
                        </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-[60vh] overflow-y-auto pr-2 mt-4">
                        {isGenerating ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <ProgressBar
                                    stages={[
                                        "Reading repository context...",
                                        "Analyzing tech stack...",
                                        "Brainstorming concepts...",
                                        "Refining monetization strategies...",
                                        "Finalizing ideas..."
                                    ]}
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {displayedIdeas.map((idea, i) => (
                                    <div
                                        key={i}
                                        className="relative overflow-hidden rounded-lg border border-space-magenta/30 bg-gradient-to-br from-space-magenta/10 via-black/60 to-space-cyan/5 hover:from-space-magenta/15 hover:to-space-cyan/10 transition-all duration-300 group"
                                    >
                                        {/* Header with title and MRR */}
                                        <div className="relative p-4 pb-3 border-b border-white/5">
                                            <div className="flex items-start justify-between gap-4">
                                                <h3 className="text-lg font-bold text-white group-hover:text-space-magenta transition-colors flex-1 leading-tight">
                                                    {idea.title}
                                                </h3>
                                                <div className="text-xl font-mono text-space-cyan font-bold glow-cyan whitespace-nowrap">
                                                    {idea.potential_mrr || "N/A"}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="relative p-4 space-y-3">
                                            <p className="text-gray-300 text-sm leading-relaxed">
                                                {idea.description}
                                            </p>

                                            {/* Two-column layout for strategy and builder */}
                                            <div className="grid grid-cols-2 gap-3">
                                                {/* Monetization Strategy */}
                                                <div className="bg-black/50 p-3 rounded border-l-2 border-space-cyan/50">
                                                    <div className="text-[9px] text-space-cyan/70 uppercase font-mono mb-1.5 tracking-wider">
                                                        Strategy
                                                    </div>
                                                    <div className="text-xs font-mono text-gray-200 leading-relaxed">
                                                        {idea.monetization_strategy || "N/A"}
                                                    </div>
                                                </div>

                                                {/* Builder Acceleration */}
                                                <div className="bg-space-magenta/10 p-3 rounded border-l-2 border-space-magenta/50">
                                                    <div className="text-[9px] text-space-magenta/70 uppercase font-mono mb-1.5 tracking-wider">
                                                        Builder.io Edge
                                                    </div>
                                                    <div className="text-xs text-gray-200 leading-relaxed">
                                                        {idea.builder_angle}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <button
                                                onClick={() => handleGetPlan(idea)}
                                                className="w-full mt-2 py-2 bg-space-magenta/20 hover:bg-space-magenta/30 border border-space-magenta/40 text-space-magenta text-xs font-bold uppercase tracking-wider rounded transition-all hover:shadow-[0_0_10px_rgba(255,0,110,0.2)] flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                </svg>
                                                Get Detailed Execution Plan
                                            </button>
                                        </div>

                                        {/* Bottom accent line */}
                                        <div className="h-[2px] bg-gradient-to-r from-space-magenta/50 via-space-cyan/30 to-transparent" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {!isGenerating && ideas.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
                            <button
                                onClick={handleLocalGenerateMore}
                                className="w-full py-3 bg-space-magenta/10 border border-space-magenta/30 text-space-magenta font-bold hover:bg-space-magenta/20 hover:shadow-[0_0_15px_rgba(255,0,110,0.3)] transition-all rounded uppercase text-sm tracking-wider"
                            >
                                {hasMoreLocalIdeas ? "Show Next 3 Ideas" : "Generate Fresh Ideas"}
                            </button>

                            <div className="flex items-center justify-between">
                                <div className="text-xs text-gray-400">
                                    Ready to build? Start your project with Builder.io
                                </div>
                                <button
                                    onClick={() => window.open("https://builderio.partnerlinks.io/5ao76wthwoji", "_blank")}
                                    className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded transition-colors"
                                >
                                    Open Builder.io
                                </button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <IdeaPlanDialog
                open={showPlanDialog}
                onOpenChange={setShowPlanDialog}
                content={planContent}
                isGenerating={isGeneratingPlan}
                ideaTitle={selectedIdea?.title || ""}
            />
        </>
    );
}
