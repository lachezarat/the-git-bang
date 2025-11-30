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

interface QAPair {
    question: string;
    answer: string;
}

interface QAState {
    currentQuestion: string;
    history: QAPair[];
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
                primaryColor: "#1a1f2e",
                secondaryColor: "#1a1f2e",
                tertiaryColor: "#1a1f2e",
                primaryTextColor: "#fff",
                secondaryTextColor: "#fff",
                tertiaryTextColor: "#fff",
                lineColor: "#00fff9",
                mainBkg: "#1a1f2e",
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
                nodeBkg: "#1a1f2e",
                nodeTextColor: "#ffffff",
            },
        });
    }, []);

    useEffect(() => {
        const renderChart = async () => {
            try {
                setError(false);
                const invalidPatterns = [/font-family:/i, /style\s*=/i, /<br\s*\/?>/i, /class\s*=/i];
                if (invalidPatterns.some(pattern => pattern.test(chart))) {
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
            <div className="p-4 border border-yellow-500/40 bg-yellow-500/10 text-yellow-200 text-sm my-4">
                <p className="mb-2 font-mono font-bold uppercase text-xs tracking-wider">⚠️ DIAGRAM SKIPPED</p>
                <p className="text-xs opacity-70">Invalid syntax detected.</p>
            </div>
        );
    }

    return (
        <>
            <div
                onClick={() => setIsFullscreen(true)}
                className="mermaid-chart flex justify-center p-6 bg-black/40 border border-space-cyan/20 my-4 overflow-x-auto cursor-pointer hover:border-space-cyan/40 transition-all"
                dangerouslySetInnerHTML={{ __html: svg }}
            />
            <div className="text-center -mt-2 mb-4">
                <button onClick={() => setIsFullscreen(true)} className="text-xs text-space-cyan/50 hover:text-space-cyan transition-colors font-mono">
                    Click diagram to expand ↗
                </button>
            </div>

            {isFullscreen && (
                <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
                    <TransformWrapper initialScale={1} minScale={0.3} maxScale={3} centerOnInit={true}>
                        {({ zoomIn, zoomOut, resetTransform }) => (
                            <>
                                {/* Controls at top */}
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-black/80 backdrop-blur-sm px-4 py-2 border border-space-cyan/30 shadow-lg">
                                    <button onClick={() => zoomIn()} className="px-3 py-1.5 bg-space-cyan/10 hover:bg-space-cyan/20 text-space-cyan border border-space-cyan/30 transition-all text-sm font-bold font-mono" title="Zoom In">+</button>
                                    <button onClick={() => zoomOut()} className="px-3 py-1.5 bg-space-cyan/10 hover:bg-space-cyan/20 text-space-cyan border border-space-cyan/30 transition-all text-sm font-bold font-mono" title="Zoom Out">−</button>
                                    <button onClick={() => resetTransform()} className="px-3 py-1.5 bg-space-cyan/10 hover:bg-space-cyan/20 text-space-cyan border border-space-cyan/30 transition-all text-sm font-bold font-mono" title="Reset View">↺</button>
                                    <div className="border-l border-white/20 mx-1" />
                                    <button onClick={() => setIsFullscreen(false)} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all text-sm font-bold font-mono" title="Close">✕</button>
                                </div>

                                {/* Centered diagram with consistent max sizes */}
                                <TransformComponent wrapperClass="!w-screen !h-screen flex items-center justify-center" contentClass="flex items-center justify-center">
                                    <div
                                        dangerouslySetInnerHTML={{ __html: svg }}
                                        className="mermaid-chart-fullscreen max-w-[90vw] max-h-[85vh] flex items-center justify-center"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    />
                                </TransformComponent>

                                {/* Help text at bottom */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-white/50 text-xs bg-black/60 backdrop-blur-sm px-3 py-1.5 font-mono border border-white/10">
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
        if (!inline && isMermaid) return <Mermaid chart={String(children).replace(/\n$/, "")} />;
        return !inline && match ? (
            <div className="relative group">
                <div className="absolute -top-3 right-2 text-[10px] text-space-cyan/50 font-mono bg-black/80 px-2 py-0.5 border border-space-cyan/20 uppercase tracking-wider">{match[1]}</div>
                <pre className="bg-black/50 border border-space-cyan/20 p-5 overflow-x-auto my-4 font-mono text-sm leading-relaxed">
                    <code className={className} {...props}>{children}</code>
                </pre>
            </div>
        ) : (
            <code className="bg-space-cyan/10 text-space-cyan px-2 py-0.5 font-mono text-xs" {...props}>{children}</code>
        );
    },
    table: ({ children }: any) => (<div className="overflow-x-auto my-6 border border-space-cyan/20"><table className="w-full border-collapse">{children}</table></div>),
    thead: ({ children }: any) => (<thead className="bg-space-cyan/10 border-b border-space-cyan/30">{children}</thead>),
    tbody: ({ children }: any) => <tbody>{children}</tbody>,
    tr: ({ children }: any) => (<tr className="border-b border-white/5 hover:bg-white/5 transition-colors">{children}</tr>),
    th: ({ children }: any) => (<th className="px-5 py-3 text-left text-space-cyan font-mono font-bold text-xs uppercase tracking-wider">{children}</th>),
    td: ({ children }: any) => (<td className="px-5 py-3 text-gray-300 text-sm font-mono">{children}</td>),
    h1: ({ children }: any) => <h1 className="text-2xl font-mono uppercase tracking-wider text-space-cyan mb-5 pb-3 border-b border-space-cyan/30">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-xl font-mono uppercase tracking-wide text-white mt-8 mb-4 flex items-center gap-2"><span className="text-space-cyan">#</span> {children}</h2>,
    h3: ({ children }: any) => {
        const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return <h3 id={`subsection-${id}`} className="text-lg font-mono text-gray-200 mt-6 mb-3 scroll-mt-4">{children}</h3>;
    },
    ul: ({ children }: any) => <ul className="list-disc list-outside ml-6 space-y-2 text-gray-300 my-4">{children}</ul>,
    li: ({ children }: any) => <li className="marker:text-space-cyan leading-relaxed">{children}</li>,
    p: ({ children }: any) => {
        const text = String(children);
        if (text.startsWith('Sources:') || text.match(/^Sources:\s*README/)) return null;
        return <p className="text-gray-300 leading-loose mb-5 text-[15px]">{children}</p>;
    },
    strong: ({ children }: any) => <strong className="text-space-cyan font-bold">{children}</strong>,
    a: ({ children, href }: any) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-space-cyan hover:text-space-magenta underline decoration-space-cyan/40 hover:decoration-space-magenta transition-colors font-mono"
        >
            {children}
        </a>
    ),
};

export function ExploreDialog({ open, onOpenChange, content, isGenerating, repoId, onGenerateVibe }: ExploreDialogProps) {
    const [activeSection, setActiveSection] = useState(0);
    const [sections, setSections] = useState<Array<{ title: string; level: number; content: string; subsections: Array<{ title: string; id: string }> }>>([]);
    const [mode, setMode] = useState<ExploreDialogMode>("explore");
    const [qaState, setQaState] = useState<QAState>({
        currentQuestion: "",
        history: [],
        isLoading: false,
        error: null,
    });

    useEffect(() => {
        if (!content) return;
        const lines = content.split('\n');
        const parsedSections: Array<{ title: string; level: number; content: string; subsections: Array<{ title: string; id: string }> }> = [];
        let currentSection: { title: string; level: number; content: string; subsections: Array<{ title: string; id: string }> } | null = null;

        lines.forEach((line) => {
            const h1Match = line.match(/^# (.+)$/);
            const h2Match = line.match(/^## (.+)$/);
            const h3Match = line.match(/^### (.+)$/);
            if (h1Match && h1Match[1].startsWith('Page:')) return;
            if (h2Match) {
                if (currentSection) parsedSections.push(currentSection);
                currentSection = { title: h2Match[1], level: 2, content: line + '\n', subsections: [] };
            } else if (h3Match && currentSection) {
                const title = h3Match[1];
                const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                currentSection.subsections.push({ title, id });
                currentSection.content += line + '\n';
            } else if (currentSection) {
                currentSection.content += line + '\n';
            }
        });
        if (currentSection) parsedSections.push(currentSection);
        if (parsedSections.length === 0) parsedSections.push({ title: 'Documentation', level: 2, content, subsections: [] });
        setSections(parsedSections);
        setActiveSection(0);
    }, [content]);

    const scrollToSubsection = (subsectionId: string) => {
        document.getElementById(`subsection-${subsectionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleAskQuestion = async () => {
        if (!qaState.currentQuestion.trim()) return;
        setQaState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await fetch("/api/ai/ask-question", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: repoId, question: qaState.currentQuestion }),
            });
            if (!response.ok) throw new Error(`Failed to ask question: ${response.statusText}`);
            const data = await response.json();

            // Add to history and clear current question
            setQaState(prev => ({
                ...prev,
                history: [...prev.history, { question: prev.currentQuestion, answer: data.answer }],
                currentQuestion: "",
                isLoading: false
            }));
        } catch (error) {
            setQaState(prev => ({ ...prev, error: error instanceof Error ? error.message : "Failed to get answer", isLoading: false }));
        }
    };


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1200px] bg-black/95 border border-space-cyan/40 backdrop-blur-xl text-white z-[2000] max-h-[92vh] flex flex-col shadow-[0_0_40px_rgba(0,255,249,0.15)]">
                <DialogHeader className="border-b border-white/10 pb-4">
                    <DialogTitle className="text-2xl font-mono uppercase tracking-wider text-space-cyan flex items-center gap-3">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span>DEEP DIVE ANALYSIS</span>
                    </DialogTitle>
                    <DialogDescription className="text-white/50 font-mono text-xs tracking-wide mt-2">{repoId}</DialogDescription>
                    {!isGenerating && (
                        <div className="flex gap-1 mt-4 border-b border-white/10">
                            <button onClick={() => setMode("explore")} className={`px-5 py-2.5 border-b-2 transition-all font-mono text-xs uppercase tracking-wider ${mode === "explore" ? "border-space-cyan text-space-cyan" : "border-transparent text-white/40 hover:text-white/70 hover:border-white/20"}`}>📚 DOCUMENTATION</button>
                            <button onClick={() => setMode("qa")} className={`px-5 py-2.5 border-b-2 transition-all font-mono text-xs uppercase tracking-wider ${mode === "qa" ? "border-space-cyan text-space-cyan" : "border-transparent text-white/40 hover:text-white/70 hover:border-white/20"}`}>💬 ASK AI</button>
                        </div>
                    )}
                </DialogHeader>

                <div className="flex-1 flex gap-6 mt-6 min-h-0">
                    {isGenerating ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-20">
                            <div className="relative">
                                <div className="w-16 h-16 border-2 border-space-cyan/20 border-t-space-cyan animate-spin" />
                                <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-space-cyan/50 animate-spin blur-sm" />
                            </div>
                            <p className="mt-8 text-space-cyan/70 font-mono text-sm uppercase tracking-wider">LOADING DOCUMENTATION...</p>
                        </div>
                    ) : mode === "explore" ? (
                        <>
                            {sections.length > 1 && (
                                <div className="w-72 flex-shrink-0 overflow-y-auto custom-scrollbar border-r border-white/10 pr-4">
                                    <div className="text-[10px] text-space-cyan/60 uppercase tracking-widest mb-4 font-mono font-bold">TABLE OF CONTENTS</div>
                                    <nav className="space-y-1">
                                        {sections.map((section, index) => (
                                            <div key={index}>
                                                <button onClick={() => setActiveSection(index)} className={`w-full text-left px-4 py-2.5 text-sm font-mono transition-all border-l-2 ${activeSection === index ? 'bg-space-cyan/10 text-space-cyan border-space-cyan font-semibold' : 'text-white/50 hover:text-white hover:bg-white/5 border-transparent hover:border-white/20'}`}>{section.title}</button>
                                                {activeSection === index && section.subsections.length > 0 && (
                                                    <div className="ml-6 mt-1 space-y-0.5 border-l border-white/10 pl-2">
                                                        {section.subsections.map((subsection) => (
                                                            <button key={subsection.id} onClick={() => scrollToSubsection(subsection.id)} className="w-full text-left px-3 py-1.5 text-xs font-mono text-white/40 hover:text-white/80 hover:bg-white/5 transition-all">{subsection.title}</button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </nav>
                                </div>
                            )}
                            <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar">
                                {sections[activeSection] && (
                                    <div className="prose prose-invert prose-cyan max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{sections[activeSection].content}</ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col gap-5 overflow-hidden min-h-[500px]">
                            {/* Question Input */}
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={qaState.currentQuestion}
                                    onChange={(e) => setQaState(prev => ({ ...prev, currentQuestion: e.target.value }))}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                                    placeholder="Ask a question about this repository..."
                                    className="flex-1 px-5 py-3.5 bg-black/50 border border-space-cyan/30 text-white placeholder-white/30 focus:outline-none focus:border-space-cyan font-mono text-sm transition-colors"
                                    disabled={qaState.isLoading}
                                />
                                <button
                                    onClick={handleAskQuestion}
                                    disabled={qaState.isLoading || !qaState.currentQuestion.trim()}
                                    className="px-8 py-3.5 bg-space-cyan/10 border border-space-cyan/40 text-space-cyan font-mono text-xs uppercase tracking-wider font-bold hover:bg-space-cyan/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    {qaState.isLoading ? (
                                        <div className="w-5 h-5 border-2 border-space-cyan/20 border-t-space-cyan animate-spin" />
                                    ) : (
                                        "ASK"
                                    )}
                                </button>
                            </div>

                            {/* Error Display */}
                            {qaState.error && (
                                <div className="p-4 border border-red-500/40 bg-red-500/10 text-red-300 text-sm font-mono">
                                    ❌ {qaState.error}
                                </div>
                            )}

                            {/* Q&A History - scrollable */}
                            {qaState.history.length > 0 ? (
                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                                    {qaState.history.map((pair, index) => (
                                        <div key={index} className="space-y-3">
                                            {/* Question */}
                                            <div className="p-4 bg-white/5 border-l-2 border-space-cyan/50">
                                                <div className="text-xs text-space-cyan/60 uppercase font-mono mb-2 tracking-wider">
                                                    YOUR QUESTION
                                                </div>
                                                <div className="text-sm text-white font-mono">
                                                    {pair.question}
                                                </div>
                                            </div>

                                            {/* Answer */}
                                            <div className="p-6 bg-white/3 border border-space-cyan/20">
                                                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
                                                    <div className="w-8 h-8 border border-space-cyan/40 bg-space-cyan/10 flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-space-cyan" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                                                            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-space-cyan font-mono text-xs uppercase tracking-wider font-bold">DEEPWIKI AI</span>
                                                </div>
                                                <div className="prose prose-invert prose-cyan max-w-none">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                                        {pair.answer}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : !qaState.isLoading && !qaState.error && (
                                <div className="flex-1 flex flex-col items-center justify-center text-white/30 font-mono">
                                    <svg className="w-16 h-16 mb-6 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="mb-4 text-center text-sm uppercase tracking-wider">ASK AI-POWERED QUESTIONS</p>
                                    <div className="text-xs space-y-1.5">
                                        <p className="text-space-cyan/60 uppercase tracking-wider">EXAMPLE QUESTIONS:</p>
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
                    <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-center">
                        <button onClick={() => { onOpenChange(false); onGenerateVibe(); }} className="flex items-center gap-3 px-8 py-4 bg-space-magenta/10 border border-space-magenta/40 text-space-magenta font-mono font-bold hover:bg-space-magenta/20 hover:shadow-[0_0_20px_rgba(255,0,110,0.2)] transition-all uppercase text-xs tracking-widest">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
                            </svg>
                            <span>GENERATE A UNIQUE IDEA FOR VIBE CODING</span>
                        </button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
