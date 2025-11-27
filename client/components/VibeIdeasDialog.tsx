import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { AppIdea } from "@shared/api";

interface VibeIdeasDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ideas: AppIdea[];
    isGenerating: boolean;
    onGenerateMore: () => void;
}

export function VibeIdeasDialog({
    open,
    onOpenChange,
    ideas,
    isGenerating,
    onGenerateMore,
}: VibeIdeasDialogProps) {
    return (
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
                            <div className="w-12 h-12 border-4 border-space-magenta border-t-transparent rounded-full animate-spin" />
                            <div className="text-space-magenta/80 font-mono animate-pulse">
                                CONSULTING MACHINE SPIRITS...
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {ideas.map((idea, i) => (
                                <div
                                    key={i}
                                    className="relative p-5 rounded-lg border border-space-magenta/20 bg-space-magenta/5 hover:bg-space-magenta/10 transition-colors group"
                                >
                                    <div className="pr-24"> {/* Add padding right to avoid overlap with MRR */}
                                        <h3 className="text-xl font-bold text-space-magenta mb-2 group-hover:glow-magenta transition-all">
                                            {idea.title}
                                        </h3>
                                    </div>

                                    {/* Potential MRR - Absolute Top Right */}
                                    <div className="absolute top-5 right-5 text-right">
                                        <div className="text-[10px] text-space-cyan uppercase font-mono mb-0.5">
                                            Potential MRR
                                        </div>
                                        <div className="text-sm font-mono text-white font-bold">
                                            {idea.potential_mrr || "N/A"}
                                        </div>
                                    </div>

                                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                                        {idea.description}
                                    </p>

                                    {/* Monetization Strategy - Full Width */}
                                    <div className="bg-black/40 p-3 rounded border border-white/10 mb-4">
                                        <div className="text-[10px] text-space-cyan uppercase font-mono mb-1">
                                            Monetization Strategy
                                        </div>
                                        <div className="text-sm font-mono text-white">
                                            {idea.monetization_strategy || "N/A"}
                                        </div>
                                    </div>

                                    <div className="bg-space-magenta/10 border border-space-magenta/30 p-3 rounded">
                                        <div className="text-space-magenta/80 text-[10px] font-mono uppercase mb-1">
                                            Builder.io Acceleration
                                        </div>
                                        <div className="text-gray-200 text-sm leading-tight">
                                            {idea.builder_angle}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {!isGenerating && ideas.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
                        <button
                            onClick={onGenerateMore}
                            className="w-full py-3 bg-space-magenta/10 border border-space-magenta/30 text-space-magenta font-bold hover:bg-space-magenta/20 hover:shadow-[0_0_15px_rgba(255,0,110,0.3)] transition-all rounded uppercase text-sm tracking-wider"
                        >
                            Generate More Ideas
                        </button>

                        <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-400">
                                Ready to build? Start your project with Builder.io
                            </div>
                            <button
                                onClick={() => window.open("https://builder.io/app/", "_blank")}
                                className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded transition-colors"
                            >
                                Open Builder.io
                            </button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
