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
    h1: ({ children }: any) => <h1 className="text-2xl font-bold text-space-cyan mb-4 border-b border-space-cyan/30 pb-2">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-xl font-bold text-white mt-6 mb-3 flex items-center gap-2"><span className="text-space-cyan">#</span> {children}</h2>,
    h3: ({ children }: any) => <h3 className="text-lg font-bold text-gray-200 mt-4 mb-2">{children}</h3>,
    ul: ({ children }: any) => <ul className="list-disc list-outside ml-5 space-y-1 text-gray-300">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal list-outside ml-5 space-y-2 text-gray-300">{children}</ol>,
    li: ({ children }: any) => <li className="marker:text-space-cyan">{children}</li>,
    p: ({ children }: any) => <p className="text-gray-300 leading-relaxed mb-4">{children}</p>,
    strong: ({ children }: any) => <strong className="text-space-cyan font-bold">{children}</strong>,
    a: ({ href, children }: any) => (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-space-cyan hover:text-space-cyan/80 underline decoration-space-cyan/30 underline-offset-4 transition-colors">
            {children}
        </a>
    ),
    code: ({ node, inline, className, children, ...props }: any) => {
        if (inline) {
            return (
                <code className="bg-space-cyan/10 text-space-cyan px-1.5 py-0.5 font-mono text-sm border border-space-cyan/20" {...props}>
                    {children}
                </code>
            );
        }
        return (
            <code className="block bg-black/50 text-gray-300 p-4 border border-space-cyan/20 font-mono text-sm overflow-x-auto whitespace-pre-wrap" {...props}>
                {children}
            </code>
        );
    },
    pre: ({ children }: any) => <pre className="not-prose my-4">{children}</pre>,
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
            <DialogContent className="sm:max-w-[800px] bg-black/95 border border-cyan-500/40 backdrop-blur-xl text-white z-[2100] max-h-[90vh] flex flex-col shadow-[0_0_40px_rgba(0,255,249,0.1)]">
                <DialogHeader className="border-b border-cyan-500/20 pb-4">
                    <DialogTitle className="text-2xl font-mono uppercase tracking-wider text-cyan-400">
                        Execution Plan: {ideaTitle}
                    </DialogTitle>
                    <DialogDescription className="text-white/40 font-mono text-xs tracking-wide mt-2">
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
                        <div className="prose prose-invert prose-cyan max-w-none">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={markdownComponents}
                            >
                                {content}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
