import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface ExploreDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    content: string;
    isGenerating: boolean;
    repoId: string;
    onGenerateVibe: () => void;
}

const Mermaid = ({ chart }: { chart: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>("");
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: true,
            theme: "base",
            themeVariables: {
                darkMode: true,
                background: "#0a0e1a",
                primaryColor: "#00fff9",
                secondaryColor: "#ff006e",
                tertiaryColor: "#1a1f2e",
                primaryTextColor: "#fff",
                secondaryTextColor: "#fff",
                tertiaryTextColor: "#fff",
                lineColor: "#00fff9",
                mainBkg: "#0a0e1a",
                nodeBorder: "#00fff9",
                clusterBkg: "#1a1f2e",
                clusterBorder: "#ff006e",
                defaultLinkColor: "#00fff9",
                titleColor: "#00fff9",
                edgeLabelBackground: "#0a0e1a",
                actorBorder: "#00fff9",
                actorBkg: "#0a0e1a",
                actorTextColor: "#fff",
                actorLineColor: "#00fff9",
                signalColor: "#00fff9",
                signalTextColor: "#fff",
                labelBoxBkgColor: "#0a0e1a",
                labelBoxBorderColor: "#ff006e",
                labelTextColor: "#fff",
                loopTextColor: "#fff",
                noteBorderColor: "#ff006e",
                noteBkgColor: "#1a1f2e",
                noteTextColor: "#fff",
                activationBorderColor: "#00fff9",
                activationBkgColor: "#1a1f2e",
                sequenceNumberColor: "#fff",
            },
        });
    }, []);

    useEffect(() => {
        const renderChart = async () => {
            try {
                setError(false);
                const { svg } = await mermaid.render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, chart);
                setSvg(svg);
            } catch (error) {
                console.error("Mermaid render error:", error);
                setError(true);
            }
        };
        renderChart();
    }, [chart]);

    if (error) {
        return (
            <div className="p-4 border border-red-500/50 rounded bg-red-500/10 text-red-200 text-sm font-mono my-4">
                <p className="mb-2 font-bold">Failed to render architecture diagram</p>
                <pre className="whitespace-pre-wrap text-xs opacity-70 overflow-x-auto">{chart}</pre>
            </div>
        );
    }

    return (
        <div
            ref={ref}
            className="mermaid-chart flex justify-center p-6 bg-black/40 rounded-lg border border-space-cyan/20 my-4 overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
};

export function ExploreDialog({
    open,
    onOpenChange,
    content,
    isGenerating,
    repoId,
    onGenerateVibe,
}: ExploreDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] bg-black/90 border-space-cyan/50 backdrop-blur-xl text-white z-[2000] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-display font-bold text-space-cyan glow-cyan">
                        Deep Dive Analysis
                    </DialogTitle>
                    <DialogDescription className="text-space-cyan/70">
                        AI-Powered Technical Exploration
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 mt-4 custom-scrollbar">
                    {isGenerating ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-6">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-space-cyan/30 border-t-space-cyan rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-8 bg-space-cyan/20 rounded-full animate-pulse" />
                                </div>
                            </div>
                            <div className="text-space-cyan font-mono animate-pulse text-center">
                                <div className="text-lg font-bold">ANALYZING ARCHITECTURE</div>
                                <div className="text-sm opacity-70 mt-1">Deciphering code patterns...</div>
                            </div>
                        </div>
                    ) : (
                        <div className="prose prose-invert prose-cyan max-w-none">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({ node, inline, className, children, ...props }: any) {
                                        const match = /language-(\w+)/.exec(className || "");
                                        const isMermaid = match && match[1] === "mermaid";

                                        if (!inline && isMermaid) {
                                            return <Mermaid chart={String(children).replace(/\n$/, "")} />;
                                        }

                                        return !inline && match ? (
                                            <div className="relative group">
                                                <div className="absolute -top-3 right-2 text-xs text-space-cyan/50 font-mono bg-black/80 px-2 py-0.5 rounded border border-space-cyan/20">
                                                    {match[1]}
                                                </div>
                                                <pre className="bg-black/50 border border-space-cyan/20 rounded-lg p-4 overflow-x-auto my-4">
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                </pre>
                                            </div>
                                        ) : (
                                            <code className="bg-space-cyan/10 text-space-cyan px-1.5 py-0.5 rounded font-mono text-sm" {...props}>
                                                {children}
                                            </code>
                                        );
                                    },
                                    h1: ({ children }) => <h1 className="text-2xl font-bold text-space-cyan mb-4 border-b border-space-cyan/30 pb-2">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-xl font-bold text-white mt-6 mb-3 flex items-center gap-2"><span className="text-space-cyan">#</span> {children}</h2>,
                                    h3: ({ children }) => <h3 className="text-lg font-bold text-gray-200 mt-4 mb-2">{children}</h3>,
                                    ul: ({ children }) => <ul className="list-disc list-outside ml-5 space-y-1 text-gray-300">{children}</ul>,
                                    li: ({ children }) => <li className="marker:text-space-cyan">{children}</li>,
                                    p: ({ children }) => <p className="text-gray-300 leading-relaxed mb-4">{children}</p>,
                                    strong: ({ children }) => <strong className="text-space-cyan font-bold">{children}</strong>,
                                }}
                            >
                                {content}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                {!isGenerating && (
                    <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                        <button
                            onClick={() => {
                                onOpenChange(false);
                                onGenerateVibe();
                            }}
                            className="flex items-center gap-2 px-4 py-3 bg-space-magenta/10 border border-space-magenta/30 text-space-magenta font-bold hover:bg-space-magenta/20 hover:shadow-[0_0_20px_rgba(255,0,110,0.3)] transition-all rounded uppercase text-sm tracking-wider group"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
                            </svg>
                            <span>Use for Vibe Coding</span>
                        </button>

                        <button
                            onClick={() => window.open(`https://deepwiki.com/${repoId}`, "_blank")}
                            className="flex items-center gap-2 px-6 py-3 bg-space-cyan/10 border border-space-cyan/30 text-space-cyan font-bold hover:bg-space-cyan/20 hover:shadow-[0_0_20px_rgba(0,255,249,0.3)] transition-all rounded uppercase text-sm tracking-wider group"
                        >
                            <span>Explore Deeper on DeepWiki</span>
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
