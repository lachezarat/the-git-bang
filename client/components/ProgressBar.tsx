import { useEffect, useState } from "react";

interface ProgressBarProps {
    duration?: number; // Duration in ms to reach 90%
    stages?: string[]; // Array of reasoning steps to cycle through
}

export function ProgressBar({ duration = 3000, stages = ["Loading..."] }: ProgressBarProps) {
    const [progress, setProgress] = useState(0);
    const [currentStageIndex, setCurrentStageIndex] = useState(0);

    useEffect(() => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            // Logarithmic progress curve that slows down as it approaches 90%
            const nextProgress = Math.min(90, (elapsed / duration) * 90);

            setProgress(nextProgress);

            // Calculate which stage to show based on progress
            // We map 0-90% progress to the stages array indices
            const stageIndex = Math.min(
                stages.length - 1,
                Math.floor((nextProgress / 90) * stages.length)
            );
            setCurrentStageIndex(stageIndex);

            if (elapsed >= duration) {
                clearInterval(interval);
            }
        }, 50);

        return () => clearInterval(interval);
    }, [duration, stages.length]);

    return (
        <div className="w-full max-w-md mx-auto space-y-2">
            <div className="flex justify-between text-xs font-mono text-space-cyan/80 uppercase tracking-wider h-4">
                <span className="animate-pulse">
                    {stages[currentStageIndex]}
                    <span className="inline-block w-1.5 h-3 ml-1 bg-space-cyan/50 animate-pulse align-middle" />
                </span>
                <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1 bg-space-cyan/10 rounded-full overflow-hidden">
                <div
                    className="h-full bg-space-cyan shadow-[0_0_10px_rgba(0,255,249,0.5)] transition-all duration-100 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
