import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ProgressBar } from "./ProgressBar";

interface IdeaPlanDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    content: string;
    isGenerating: boolean;
    ideaTitle: string;
}

const markdownComponents = {
    h1: ({ children }: any) => <h1 className="text-2xl font-bold text-space-magenta mb-4 border-b border-space-magenta/30 pb-2">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-xl font-bold text-white mt-6 mb-3 flex items-center gap-2"><span className="text-space-magenta">#</span> {children}</h2>,
    h3: ({ children }: any) => <h3 className="text-lg font-bold text-gray-200 mt-4 mb-2">{children}</h3>,
    ul: ({ children }: any) => <ul className="list-disc list-outside ml-5 space-y-1 text-gray-300">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal list-outside ml-5 space-y-2 text-gray-300">{children}</ol>,
    li: ({ children }: any) => <li className="marker:text-space-magenta">{children}</li>,
    p: ({ children }: any) => <p className="text-gray-300 leading-relaxed mb-4">{children}</p>,
    strong: ({ children }: any) => <strong className="text-space-magenta font-bold">{children}</strong>,
    a: ({ href, children }: any) => {
        const isAffiliate = href?.includes("builderio.partnerlinks.io");
        if (isAffiliate) {
            return (
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 mt-2 bg-space-magenta/20 border border-space-magenta/40 text-space-magenta font-bold hover:bg-space-magenta/30 hover:shadow-[0_0_15px_rgba(255,0,110,0.3)] transition-all rounded uppercase text-xs tracking-wider no-underline group"
                >
                    <span>{children}</span>
                    <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </a>
            );
        }
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-space-cyan hover:text-space-cyan/80 underline decoration-space-cyan/30 underline-offset-4 transition-colors">
                {children}
            </a>
        );
    },
    code: ({ children }: any) => <code className="bg-space-magenta/10 text-space-magenta px-1.5 py-0.5 rounded font-mono text-sm border border-space-magenta/20">{children}</code>,
};

export function IdeaPlanDialog({
    open,
    onOpenChange,
    content,
    isGenerating,
    ideaTitle,
}: IdeaPlanDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] bg-black/95 border-space-magenta/50 backdrop-blur-xl text-white z-[2100] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-display font-bold text-space-magenta glow-magenta">
                        Execution Plan: {ideaTitle}
                    </DialogTitle>
                    <DialogDescription className="text-space-cyan/70">
                        Step-by-step guide accelerated by Builder.io
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 mt-4 custom-scrollbar">
                    {isGenerating ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-6">
                            <ProgressBar
                                stages={[
                                    "Reviewing idea requirements...",
                                    "Mapping Builder.io features...",
                                    "Structuring execution steps...",
                                    "Generating Fusion prompts...",
                                    "Polishing output..."
                                ]}
                            />
                        </div>
                    ) : (
                        <div className="prose prose-invert prose-magenta max-w-none">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={markdownComponents}
                            >
                                {content}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                {!isGenerating && (
                    <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                        <button
                            onClick={() => window.open("https://builderio.partnerlinks.io/5ao76wthwoji", "_blank")}
                            className="flex items-center gap-2 px-6 py-3 bg-space-magenta/10 border border-space-magenta/30 text-space-magenta font-bold hover:bg-space-magenta/20 hover:shadow-[0_0_20px_rgba(255,0,110,0.3)] transition-all rounded uppercase text-sm tracking-wider group"
                        >
                            <span>Open Builder.io Dashboard</span>
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
