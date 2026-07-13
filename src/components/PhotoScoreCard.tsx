import React from "react";
import { PhotoAnalysis } from "../utils/photoAnalyzer";

interface PhotoScoreCardProps {
  analysis: PhotoAnalysis;
}

export const PhotoScoreCard: React.FC<PhotoScoreCardProps> = ({ analysis }) => {
  if (!analysis) return null;

  // Renders the clean text bars based on the score ratio
  const renderBar = (current: number, max: number) => {
    const totalBars = 10;
    const filledBars = Math.round((current / max) * totalBars);
    const emptyBars = totalBars - filledBars;
    return "█".repeat(filledBars) + "░".repeat(emptyBars);
  };

  const starsCount = Math.round((analysis.score / 100) * 5);
  const starsDisplay = "★".repeat(starsCount) + "☆".repeat(5 - starsCount);

  return (
    <div className="mt-4 border rounded-xl bg-card p-5 text-card-foreground shadow-sm max-w-sm space-y-4 text-sm font-mono mx-auto w-full">
      {/* Header section matching your style */}
      <div className="text-amber-500 font-bold text-base border-b pb-2">
        {starsDisplay} Photo Quality
      </div>

      {/* Score Block */}
      <div className="space-y-0.5">
        <div className="text-xs text-muted-foreground uppercase font-sans font-semibold">Overall Score</div>
        <div className="text-2xl font-black font-sans text-primary">
          {analysis.score} <span className="text-sm font-normal text-muted-foreground">/ 100</span>
        </div>
      </div>

      {/* Metrics Progress bars matching your alignment */}
      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="w-24 shrink-0">Brightness</span>
          <span className="text-primary tracking-widest font-normal flex-1 text-left select-none">
            {renderBar(analysis.brightness, 20)}
          </span>
          <span className="shrink-0 text-muted-foreground">{analysis.brightness}/20</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="w-24 shrink-0">Sharpness</span>
          <span className="text-primary tracking-widest font-normal flex-1 text-left select-none">
            {renderBar(analysis.sharpness, 20)}
          </span>
          <span className="shrink-0 text-muted-foreground">{analysis.sharpness}/20</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="w-24 shrink-0">Contrast</span>
          <span className="text-primary tracking-widest font-normal flex-1 text-left select-none">
            {renderBar(analysis.contrast, 15)}
          </span>
          <span className="shrink-0 text-muted-foreground">{analysis.contrast}/15</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="w-24 shrink-0">Resolution</span>
          <span className="text-primary tracking-widest font-normal flex-1 text-left select-none">
            {renderBar(analysis.resolution, 35)}
          </span>
          <span className="shrink-0 text-muted-foreground">{analysis.resolution}/35</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="w-24 shrink-0">Aspect Ratio</span>
          <span className="text-primary tracking-widest font-normal flex-1 text-left select-none">
            {renderBar(analysis.aspectRatio, 10)}
          </span>
          <span className="shrink-0 text-muted-foreground">{analysis.aspectRatio}/10</span>
        </div>
      </div>

      {/* Suggestions block with checkmarks */}
      <div className="pt-3 border-t space-y-2 font-sans">
        <div className="text-xs font-bold text-muted-foreground uppercase font-mono">AI Suggestions</div>
        <ul className="space-y-1.5 text-xs font-mono">
          {analysis.score >= 85 ? (
            <>
              <li className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                ✓ Excellent photo quality.
              </li>
              <li className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                ✓ Great lighting.
              </li>
              <li className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                ✓ Sharp image.
              </li>
              <li className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                ✓ Ready to publish.
              </li>
            </>
          ) : (
            analysis.tips.map((tip, idx) => (
              <li key={idx} className="text-amber-600 dark:text-amber-400 flex items-start gap-1">
                <span>⚠ {tip}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};