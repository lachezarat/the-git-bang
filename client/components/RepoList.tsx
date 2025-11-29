import React, { useState, useEffect, useRef, useMemo } from "react";
import { Repository } from "../lib/repositoryData";

interface RepoListProps {
    repositories: Repository[];
    onSelect: (repo: Repository) => void;
}

const BATCH_SIZE = 50;

export default function RepoList({ repositories, onSelect }: RepoListProps) {
    const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
    const observerTarget = useRef<HTMLDivElement>(null);

    // Reset visible count when repositories change (e.g. filtering)
    useEffect(() => {
        setVisibleCount(BATCH_SIZE);
    }, [repositories]);

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, repositories.length));
                }
            },
            { threshold: 0.1, rootMargin: "100px" }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [repositories.length]);

    const visibleRepositories = useMemo(() => {
        return repositories.slice(0, visibleCount);
    }, [repositories, visibleCount]);

    return (
        <div className="absolute inset-0 z-10 overflow-y-auto pt-24 pb-12 px-4 md:px-12 pointer-events-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {visibleRepositories.map((repo) => (
                    <div
                        key={repo.id}
                        onClick={() => onSelect(repo)}
                        className="group relative bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-[#00fff9]/50 transition-all duration-300 cursor-pointer hover:bg-black/60 hover:shadow-[0_0_30px_rgba(0,255,249,0.1)]"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]"
                                    style={{
                                        color: `#${repo.color.toString(16).padStart(6, '0')}`,
                                        backgroundColor: `#${repo.color.toString(16).padStart(6, '0')}`
                                    }}
                                />
                                <span className="text-xs font-mono text-white/60 uppercase tracking-wider">
                                    {repo.primaryLanguage}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-[#ffba08]">
                                <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-sm font-bold">
                                    {(repo.stars / 1000).toFixed(1)}k
                                </span>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#00fff9] transition-colors truncate">
                            {repo.name}
                        </h3>

                        <p className="text-sm text-white/50 mb-4">
                            {repo.owner}
                        </p>

                        <div className="flex items-center justify-between text-xs text-white/40 font-mono">
                            <span>Created {new Date(repo.createdAt).toLocaleDateString()}</span>
                            <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                                <span>View Details</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sentinel element for infinite scroll */}
            {visibleCount < repositories.length && (
                <div ref={observerTarget} className="h-20 w-full flex justify-center items-center mt-8">
                    <div className="w-6 h-6 border-2 border-[#00fff9] border-t-transparent rounded-full animate-spin opacity-50"></div>
                </div>
            )}
        </div>
    );
}
