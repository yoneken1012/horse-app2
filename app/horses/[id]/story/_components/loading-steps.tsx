"use client";

import { useEffect, useState } from "react";

const STEPS = [
  { label: "Analyzing past posts", duration: 1200 },
  { label: "Reading race records", duration: 1100 },
  { label: "Reviewing trainer notes", duration: 1000 },
  { label: "Weaving the narrative", duration: 1400 },
  { label: "Composing the story", duration: 900 },
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
      <div className="mb-8 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        Generating Story
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
