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
                        <div className="space-y-4">
                            {ideas.map((idea, i) => (
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
