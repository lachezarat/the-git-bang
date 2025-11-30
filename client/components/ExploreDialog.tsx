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
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface ExploreDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    content: string;
    isGenerating: boolean;
    repoId: string;
    onGenerateVibe: () => void;
}

type ExploreDialogMode = "explore" | "qa";

interface QAState {
    question: string;
    answer: string;
    isLoading: boolean;
    error: string | null;
}

// Mermaid component with zoom/pan functionality
const Mermaid = ({ chart }: { chart: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>("");
    const [error, setError] = useState<boolean>(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: true,
            theme: "base",
            themeVariables: {
                darkMode: true,
                background: "#0a0e1a",
                primaryColor: "#1a1f2e", // Single node background color
                secondaryColor: "#1a1f2e",
                tertiaryColor: "#1a1f2e",
                primaryTextColor: "#fff",
                secondaryTextColor: "#fff",
                tertiaryTextColor: "#fff",
                lineColor: "#00fff9",
                mainBkg: "#1a1f2e", // Consistent node background
                nodeBorder: "#00fff9",
                clusterBkg: "#1a1f2e",
                clusterBorder: "#ff006e",
                defaultLinkColor: "#00fff9",
                titleColor: "#00fff9",
                edgeLabelBackground: "#0a0e1a",
                actorBorder: "#00fff9",
                actorBkg: "#1a1f2e",
                actorTextColor: "#fff",
                actorLineColor: "#00fff9",
                signalColor: "#00fff9",
                signalTextColor: "#fff",
                labelBoxBkgColor: "#1a1f2e",
                labelBoxBorderColor: "#ff006e",
                labelTextColor: "#fff",
                loopTextColor: "#fff",
                noteBorderColor: "#ff006e",
                noteBkgColor: "#1a1f2e",
                noteTextColor: "#fff",
                activationBorderColor: "#00fff9",
                activationBkgColor: "#1a1f2e",
                sequenceNumberColor: "#fff",
                // Ensure all nodes use the same background
                nodeBkg: "#1a1f2e",
                nodeTextColor: "#ffffff",
            },
        });
    }, []);

    useEffect(() => {
        const renderChart = async () => {
            try {
                setError(false);

                // Pre-validate: detect common malformed patterns from DeepWiki
                const invalidPatterns = [
                    /font-family:/i,
                    /style\s*=/i,
                    /<br\s*\/?>/i,
                    /class\s*=/i,
                ];

                const isInvalid = invalidPatterns.some(pattern => pattern.test(chart));

                if (isInvalid) {
                    console.warn("Detected malformed Mermaid diagram, skipping render");
                    setError(true);
                    return;
                }

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
            <div className="p-4 border border-yellow-500/50 rounded bg-yellow-500/10 text-yellow-200 text-sm my-4">
                <p className="mb-2 font-bold">⚠️ Diagram Skipped</p>
                <p className="text-xs opacity-70">This diagram contains invalid syntax and cannot be rendered.</p>
            </div>
        );
    }

    return (
        <>
            <div
                ref={ref}
                onClick={() => setIsFullscreen(true)}
                className="mermaid-chart flex justify-center p-6 bg-black/40 rounded-lg border border-space-cyan/20 my-4 overflow-x-auto cursor-pointer hover:border-space-cyan/40 transition-all group relative"
                dangerouslySetInnerHTML={{ __html: svg }}
            >
            </div>
            <div className="text-center -mt-2 mb-4">
                <button
                    onClick={() => setIsFullscreen(true)}
                    className="text-xs text-space-cyan/50 hover:text-space-cyan transition-colors"
                >
                    Click diagram to expand ↗
                </button>
            </div>


            {/* Fullscreen Modal with Zoom/Pan */}
            {isFullscreen && (
                <div className="fixed inset-0 z-[9999] bg-black">
                    <TransformWrapper
                        initialScale={1}
                        minScale={0.5}
                        maxScale={4}
                        centerOnInit={true}
                    >
                        {({ zoomIn, zoomOut, resetTransform }) => (
                            <>
                                {/* Floating Control Bar */}
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-space-cyan/30 shadow-lg">
                                    <button
                                        onClick={() => zoomIn()}
                                        className="px-3 py-1.5 bg-space-cyan/10 hover:bg-space-cyan/20 text-space-cyan border border-space-cyan/30 rounded transition-all text-sm font-bold"
                                        title="Zoom In"
                                    >
                                        +
                                    </button>
                                    <button
                                        onClick={() => zoomOut()}
                                        className="px-3 py-1.5 bg-space-cyan/10 hover:bg-space-cyan/20 text-space-cyan border border-space-cyan/30 rounded transition-all text-sm font-bold"
                                        title="Zoom Out"
                                    >
                                        −
                                    </button>
                                    <button
                                        onClick={() => resetTransform()}
                                        className="px-3 py-1.5 bg-space-cyan/10 hover:bg-space-cyan/20 text-space-cyan border border-space-cyan/30 rounded transition-all text-sm font-bold"
                                        title="Reset View"
                                    >
                                        ↺
                                    </button>
                                    <div className="border-l border-white/20 mx-1" />
                                    <button
                                        onClick={() => setIsFullscreen(false)}
                                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded transition-all text-sm font-bold"
                                        title="Close"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Full-Screen Diagram */}
                                <TransformComponent
                                    wrapperClass="!w-screen !h-screen"
                                    contentClass="!w-full !h-full flex items-center justify-center"
                                >
                                    <div
                                        dangerouslySetInnerHTML={{ __html: svg }}
                                        className="mermaid-chart-fullscreen"
                                    />
                                </TransformComponent>

                                {/* Floating Instructions */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-white/50 text-xs bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded">
                                    💡 Drag to pan • Scroll to zoom • Double-click to reset
                                </div>
                            </>
                        )}
                    </TransformWrapper>
                </div>
            )}

        </>
    );
};

const markdownComponents = {
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
    table: ({ children }: any) => (
        <div className="overflow-x-auto my-4 rounded-lg border border-space-cyan/20">
            <table className="w-full border-collapse">{children}</table>
        </div>
    ),
    thead: ({ children }: any) => (
        <thead className="bg-space-cyan/10 border-b border-space-cyan/30">{children}</thead>
    ),
    tbody: ({ children }: any) => <tbody>{children}</tbody>,
    tr: ({ children }: any) => (
        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">{children}</tr>
    ),
    th: ({ children }: any) => (
        <th className="px-4 py-3 text-left text-space-cyan font-bold text-sm">{children}</th>
    ),
    td: ({ children }: any) => (
        <td className="px-4 py-3 text-gray-300 text-sm">{children}</td>
    ),
    h1: ({ children }: any) => <h1 className="text-2xl font-bold text-space-cyan mb-4 border-b border-space-cyan/30 pb-2">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-xl font-bold text-white mt-6 mb-3 flex items-center gap-2"><span className="text-space-cyan">#</span> {children}</h2>,
    h3: ({ children }: any) => {
        // Create ID for subsection navigation
        const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return <h3 id={`subsection-${id}`} className="text-lg font-bold text-gray-200 mt-4 mb-2 scroll-mt-4">{children}</h3>;
    },
    ul: ({ children }: any) => <ul className="list-disc list-outside ml-5 space-y-1 text-gray-300">{children}</ul>,
    li: ({ children }: any) => <li className="marker:text-space-cyan">{children}</li>,
    p: ({ children }: any) => {
        // Filter out "Sources:" paragraphs (DeepWiki internal links)
        const text = String(children);
        if (text.startsWith('Sources:') || text.match(/^Sources:\s*README/)) {
            return null;
        }
        return <p className="text-gray-300 leading-relaxed mb-4">{children}</p>;
    },
    strong: ({ children }: any) => <strong className="text-space-cyan font-bold">{children}</strong>,
};

export function ExploreDialog({
    open,
    onOpenChange,
    content,
    isGenerating,
    repoId,
    onGenerateVibe,
}: ExploreDialogProps) {
    const [activeSection, setActiveSection] = useState(0);
    const [sections, setSections] = useState<Array<{ title: string; level: number; content: string; subsections: Array<{ title: string; id: string }> }>>([]);

    // Q&A State
    const [mode, setMode] = useState<ExploreDialogMode>("explore");
    const [qaState, setQaState] = useState<QAState>({
        question: "",
        answer: "",
        isLoading: false,
        error: null,
    });

    // Parse markdown into sections based on headers
    useEffect(() => {
        if (!content) return;

        const lines = content.split('\n');
        const parsedSections: Array<{ title: string; level: number; content: string; subsections: Array<{ title: string; id: string }> }> = [];
        let currentSection: { title: string; level: number; content: string; subsections: Array<{ title: string; id: string }> } | null = null;

        lines.forEach((line) => {
            const h1Match = line.match(/^# (.+)$/);
            const h2Match = line.match(/^## (.+)$/);
            const h3Match = line.match(/^### (.+)$/);

            // Skip "Page:" meta-headers (DeepWiki format)
            if (h1Match && h1Match[1].startsWith('Page:')) {
                return;
            }

            // h2 = new section
            if (h2Match) {
                // Save previous section
                if (currentSection) {
                    parsedSections.push(currentSection);
                }

                const title = h2Match[1];
                currentSection = { title, level: 2, content: line + '\n', subsections: [] };
            }
            // h3 = subsection within current section
            else if (h3Match && currentSection) {
                const title = h3Match[1];
                const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                currentSection.subsections.push({ title, id });
                currentSection.content += line + '\n';
            }
            // Regular content
            else if (currentSection) {
                currentSection.content += line + '\n';
            }
        });

        // Add last section
        if (currentSection) {
            parsedSections.push(currentSection);
        }

        // If no sections found, treat entire content as one section
        if (parsedSections.length === 0) {
            parsedSections.push({ title: 'Documentation', level: 2, content, subsections: [] });
        }

        setSections(parsedSections);
        setActiveSection(0);
    }, [content]);

    const scrollToSubsection = (subsectionId: string) => {
        const element = document.getElementById(`subsection-${subsectionId}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Q&A Handler
    const handleAskQuestion = async () => {
        if (!qaState.question.trim()) return;

        setQaState(prev => ({ ...prev, isLoading: true, error: null, answer: "" }));

        try {
            const response = await fetch("/api/ai/ask-question", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: repoId,
                    question: qaState.question
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to ask question: ${response.statusText}`);
            }

            const data = await response.json();
            setQaState(prev => ({
                ...prev,
                answer: data.answer,
                isLoading: false
            }));
        } catch (error) {
            console.error("Error asking question:", error);
            setQaState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : "Failed to get answer",
                isLoading: false
            }));
        }
    };



    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1000px] bg-black/90 border-space-cyan/50 backdrop-blur-xl text-white z-[2000] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-space-cyan flex items-center gap-3">
                        <svg className="w-7 h-7 text-space-cyan" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span>Deep Dive Analysis</span>
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        {repoId}
                    </DialogDescription>

                    {/* Mode Tabs */}
                    {!isGenerating && (
                        <div className="flex gap-2 mt-4 border-b border-white/10 pb-2">
                            <button
                                onClick={() => setMode("explore")}
                                className={`px-4 py-2 rounded-t transition-all ${mode === "explore"
                                        ? "bg-space-cyan/20 text-space-cyan border-b-2 border-space-cyan"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                📚 Documentation
                            </button>
                            <button
                                onClick={() => setMode("qa")}
                                className={`px-4 py-2 rounded-t transition-all ${mode === "qa"
                                        ? "bg-space-cyan/20 text-space-cyan border-b-2 border-space-cyan"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                💬 Ask AI
                            </button>
                        </div>
                    )}
                </DialogHeader>

                <div className="flex-1 flex gap-4 mt-4 min-h-0">
                    {isGenerating ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-20">
                            <div className="relative">
                                {/* Spinning circle */}
                                <div className="w-16 h-16 border-4 border-space-cyan/20 border-t-space-cyan rounded-full animate-spin" />
                                {/* Inner glow */}
                                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-space-cyan/50 rounded-full animate-spin blur-sm" />
                            </div>
                            <p className="mt-6 text-space-cyan/70 text-sm">Loading documentation...</p>
                        </div>
                    ) : mode === "explore" ? (

                        <>
                            {/* Table of Contents Sidebar */}
                            {sections.length > 1 && (
                                <div className="w-64 flex-shrink-0 overflow-y-auto custom-scrollbar pr-2 border-r border-white/10">
                                    <div className="text-xs text-space-cyan/50 uppercase tracking-wider mb-3 font-bold">
                                        Contents
                                    </div>
                                    <nav className="space-y-0.5">
                                        {sections.map((section, index) => (
                                            <div key={index}>
                                                <button
                                                    onClick={() => setActiveSection(index)}
                                                    className={`
                                                        w-full text-left px-3 py-2 rounded text-sm transition-all border-l-2
                                                        ${activeSection === index
                                                            ? 'bg-space-cyan/20 text-space-cyan border-space-cyan font-semibold'
                                                            : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent'
                                                        }
                                                    `}
                                                >
                                                    {section.title}
                                                </button>

                                                {/* Show subsections when this section is active */}
                                                {activeSection === index && section.subsections.length > 0 && (
                                                    <div className="ml-4 mt-1 space-y-0.5">
                                                        {section.subsections.map((subsection) => (
                                                            <button
                                                                key={subsection.id}
                                                                onClick={() => scrollToSubsection(subsection.id)}
                                                                className="w-full text-left px-3 py-1.5 rounded text-xs text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                                                            >
                                                                {subsection.title}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </nav>
                                </div>
                            )}

                            {/* Content Area - Only render active section */}
                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                {sections[activeSection] && (
                                    <div className="prose prose-invert prose-cyan max-w-none">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={markdownComponents}
                                        >
                                            {sections[activeSection].content}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        /* Q&A Mode */
                        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                            {/* Question Input */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={qaState.question}
                                    onChange={(e) => setQaState(prev => ({ ...prev, question: e.target.value }))}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                                    placeholder="Ask a question about this repository..."
                                    className="flex-1 px-4 py-3 bg-black/40 border border-space-cyan/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-space-cyan transition-colors"
                                    disabled={qaState.isLoading}
                                />
                                <button
                                    onClick={handleAskQuestion}
                                    disabled={qaState.isLoading || !qaState.question.trim()}
                                    className="px-6 py-3 bg-space-cyan/10 border border-space-cyan/30 text-space-cyan font-bold hover:bg-space-cyan/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded"
                                >
                                    {qaState.isLoading ? (
                                        <div className="w-5 h-5 border-2 border-space-cyan/20 border-t-space-cyan rounded-full animate-spin" />
                                    ) : (
                                        "Ask"
                                    )}
                                </button>
                            </div>

                            {/* Error Display */}
                            {qaState.error && (
                                <div className="p-4 rounded bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                                    ❌ {qaState.error}
                                </div>
                            )}

                            {/* Answer Display */}
                            {qaState.answer && (
                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    <div className="p-6 rounded-lg bg-white/5 border border-space-cyan/20">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-8 h-8 rounded-full bg-space-cyan/20 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-space-cyan" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                                                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                                                </svg>
                                            </div>
                                            <span className="text-space-cyan font-bold">DeepWiki AI Answer</span>
                                        </div>
                                        <div className="prose prose-invert prose-cyan max-w-none">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={markdownComponents}
                                            >
                                                {qaState.answer}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Suggestions for first-time users */}
                            {!qaState.answer && !qaState.isLoading && !qaState.error && (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-sm">
                                    <svg className="w-16 h-16 mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="mb-3 text-center">Ask AI-powered questions about this repository</p>
                                    <div className="text-xs space-y-1 text-left">
                                        <p>💡 Example questions:</p>
                                        <p className="pl-4">• "What is the main purpose of this project?"</p>
                                        <p className="pl-4">• "How do I get started?"</p>
                                        <p className="pl-4">• "What are the key dependencies?"</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {!isGenerating && (
                    <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center">
                        <button
                            onClick={() => {
                                onOpenChange(false);
                                onGenerateVibe();
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-space-magenta/10 border border-space-magenta/30 text-space-magenta font-bold hover:bg-space-magenta/20 hover:shadow-[0_0_20px_rgba(255,0,110,0.3)] transition-all rounded uppercase text-sm tracking-wider group"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
                            </svg>
                            <span>Generate a Unique Idea for Vibe Coding</span>
                        </button>
                    </div>
                )}

            </DialogContent>
        </Dialog >
    );
}
