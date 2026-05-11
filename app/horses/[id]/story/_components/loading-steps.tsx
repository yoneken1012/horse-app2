"use client";

import { useEffect, useState } from "react";

const STEPS = [
  { label: "過去の投稿を分析しています", duration: 1200 },
  { label: "レース成績を読み込んでいます", duration: 1100 },
  { label: "調教師の記録を確認しています", duration: 1000 },
  { label: "物語を紡いでいます", duration: 1400 },
  { label: "文章を整えています", duration: 900 },
];

interface LoadingStepsProps {
  onComplete: () => void;
}

export function LoadingSteps({ onComplete }: LoadingStepsProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep >= STEPS.length) {
      const finalTimer = setTimeout(() => onComplete(), 500);
      return () => clearTimeout(finalTimer);
    }
    const timer = setTimeout(() => {
      setCurrentStep((s) => s + 1);
    }, STEPS[currentStep].duration);
    return () => clearTimeout(timer);
  }, [currentStep, onComplete]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6">
      <div className="mb-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        <span
          aria-hidden="true"
          className="inline-block h-3 w-3 rounded-full border border-muted-foreground/30 border-t-primary animate-spin"
        />
        <span>Generating Story</span>
      </div>
      <div className="space-y-3 w-full max-w-[280px]">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStep;
          const isActive = idx === currentStep;
          const isPending = idx > currentStep;
          return (
            <div
              key={step.label}
              className={`flex items-center gap-3 text-xs tracking-wide transition-opacity duration-500 ${
                isPending ? "opacity-25" : "opacity-100"
              }`}
            >
              <span
                className={`inline-flex h-4 w-4 items-center justify-center text-[10px] ${
                  isDone ? "text-primary" : isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {isDone ? "✓" : isActive ? <span className="animate-pulse">●</span> : "○"}
              </span>
              <span className={isDone ? "text-foreground" : isActive ? "text-foreground" : "text-muted-foreground"}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
