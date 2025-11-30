import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { AppIdea } from "@shared/api";
import { useState, useEffect, useRef } from "react";
import { IdeaPlanDialog } from "./IdeaPlanDialog";
import { useToast } from "@/hooks/use-toast";
import { ProgressBar } from "./ProgressBar";
import ReactMarkdown from "react-markdown";

// Custom markdown components for better formatting
const ideaMarkdownComponents = {
    strong: ({ children }: any) => <strong className="text-cyan-400 font-bold block mt-3 mb-1 first:mt-0">{children}</strong>,
    p: ({ children }: any) => <p className="mb-3 last:mb-0">{children}</p>,
    ul: ({ children }: any) => <ul className="space-y-2 ml-0">{children}</ul>,
    li: ({ children }: any) => <li className="flex gap-2 items-start"><span className="text-cyan-400 mt-0.5">•</span><span className="flex-1">{children}</span></li>,
};

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

    const scrollRef = useRef<HTMLDivElement>(null);
    const [isSwitching, setIsSwitching] = useState(false);

    const displayedIdeas = ideas.slice(pageIndex * 3, (pageIndex + 1) * 3);
    const hasMoreLocalIdeas = (pageIndex + 1) * 3 < ideas.length;

    const handleLocalGenerateMore = () => {
        if (hasMoreLocalIdeas) {
            setIsSwitching(true);
            // Quick loading state for better UX
            setTimeout(() => {
                setPageIndex(prev => prev + 1);
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = 0;
                }
                setIsSwitching(false);
            }, 600);
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
                <DialogContent className="sm:max-w-[680px] bg-black/95 border border-cyan-500/40 backdrop-blur-xl text-white z-[2000] shadow-[0_0_40px_rgba(0,255,249,0.1)]">
                    <DialogHeader className="border-b border-cyan-500/20 pb-4">
                        <DialogTitle className="text-2xl font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-3">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
                            </svg>
                            <span>VIBE CODING IDEA</span>
                        </DialogTitle>
                        <DialogDescription className="text-white/40 font-mono text-xs tracking-wide mt-2">
                            AI-POWERED APP CONCEPT
                        </DialogDescription>
                    </DialogHeader>

                    <div ref={scrollRef} className="max-h-[60vh] overflow-y-auto pr-2 mt-4 custom-scrollbar">
                        {isGenerating || isSwitching ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                {isSwitching ? (
                                    <div className="flex flex-col items-center animate-pulse">
                                        <div className="w-8 h-8 border-2 border-space-magenta border-t-transparent rounded-full animate-spin mb-2" />
                                        <span className="text-space-magenta font-mono text-sm">Fetching next batch...</span>
                                    </div>
                                ) : (
                                    <ProgressBar
                                        stages={[
                                            "Reading repository context...",
                                            "Analyzing tech stack...",
                                            "Brainstorming concepts...",
                                            "Refining monetization strategies...",
                                            "Finalizing ideas..."
                                        ]}
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {displayedIdeas.map((idea, i) => (
                                    <div
                                        key={i}
                                        className="relative overflow-hidden border border-cyan-500/30 bg-black/60 hover:bg-black/80 hover:border-cyan-500/50 transition-all duration-300 group"
                                    >
                                        {/* Header with MRR on top, title below */}
                                        <div className="relative p-4 pb-3 border-b border-cyan-500/20">
                                            {/* MRR Badge at top */}
                                            <div className="flex justify-end mb-2">
                                                <div className="text-sm font-mono text-cyan-400 font-bold px-3 py-1 bg-cyan-500/10 border border-cyan-500/30">
                                                    {idea.potential_mrr || "N/A"}
                                                </div>
                                            </div>
                                            {/* Title */}
                                            <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors leading-tight">
                                                {idea.title}
                                            </h3>
                                        </div>

                                        {/* Content */}
                                        <div className="relative p-4 space-y-3">
                                            <div className="text-gray-300 text-sm leading-relaxed">
                                                <ReactMarkdown components={ideaMarkdownComponents}>{idea.description}</ReactMarkdown>
                                            </div>

                                            {/* Full-width stacked sections */}
                                            <div className="flex flex-col gap-3">
                                                {/* Monetization Strategy */}
                                                <div className="bg-black/50 p-3 border-l-2 border-cyan-500/50 w-full">
                                                    <div className="text-[10px] text-cyan-400/60 uppercase font-mono mb-2 tracking-widest">
                                                        MONETIZATION
                                                    </div>
                                                    <div className="text-xs text-gray-200 leading-relaxed">
                                                        <ReactMarkdown components={ideaMarkdownComponents}>{idea.monetization_strategy || "N/A"}</ReactMarkdown>
                                                    </div>
                                                </div>

                                                {/* Builder Acceleration */}
                                                <div className="bg-black/50 p-3 border-l-2 border-cyan-500/50 w-full">
                                                    <div className="text-[10px] text-cyan-400/60 uppercase font-mono mb-2 tracking-widest">
                                                        BUILDER.IO EDGE
                                                    </div>
                                                    <div className="text-xs text-gray-200 leading-relaxed">
                                                        <ReactMarkdown components={ideaMarkdownComponents}>{idea.builder_angle}</ReactMarkdown>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <button
                                                onClick={() => handleGetPlan(idea)}
                                                className="w-full mt-2 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider transition-all hover:shadow-[0_0_10px_rgba(0,255,249,0.2)] flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                </svg>
                                                GET DETAILED EXECUTION PLAN
                                            </button>
                                        </div>

                                        {/* Bottom accent line */}
                                        <div className="h-[1px] bg-gradient-to-r from-cyan-500/50 via-cyan-500/20 to-transparent" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {!isGenerating && ideas.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-cyan-500/20 flex flex-col gap-3">
                            <button
                                onClick={handleLocalGenerateMore}
                                className="w-full py-3.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-bold hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(0,255,249,0.2)] transition-all uppercase text-xs tracking-widest"
                            >
                                {hasMoreLocalIdeas ? "SHOW NEXT 3 IDEAS" : "GENERATE FRESH IDEA"}
                            </button>

                            <div className="flex items-center justify-between">
                                <div className="text-xs text-gray-400 font-mono">
                                    Ready to build? Start your project with Builder.io
                                </div>
                                <button
                                    onClick={() => window.open("https://builderio.partnerlinks.io/5ao76wthwoji", "_blank")}
                                    className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 border border-white/20 font-mono uppercase tracking-wider transition-colors"
                                >
                                    OPEN BUILDER.IO
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
