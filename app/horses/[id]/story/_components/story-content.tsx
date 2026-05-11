"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LoadingSteps } from "./loading-steps";

interface Horse {
  id: string;
  name: string;
  image_url: string | null;
  story_text: string | null;
  story_title: string | null;
  story_image_url: string | null;
}

export function StoryContent({ horse }: { horse: Horse }) {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <LoadingSteps onComplete={() => setIsLoading(false)} />;
  }

  if (!horse.story_text) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
          No story available
        </p>
        <p className="text-sm text-foreground mb-6 leading-relaxed">
          The story for this horse has not been generated yet.
        </p>
        <Link
          href={`/horses/${horse.id}`}
          className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to horse
        </Link>
      </div>
    );
  }

  const headerImage = horse.story_image_url || horse.image_url;

  return (
    <article className="px-3 py-6">
      {/* Back link */}
      <Link
        href={`/horses/${horse.id}`}
        className="inline-block mb-4 text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back
      </Link>

      {/* Header image */}
      {headerImage && (
        <div className="relative aspect-[4/3] w-full mb-6 overflow-hidden rounded-sm">
          <Image
            src={headerImage}
            alt={horse.name}
            fill
            className="object-cover"
            sizes="(max-width: 420px) 100vw, 420px"
            priority
          />
        </div>
      )}

      {/* Story label */}
      <div className="text-center mb-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        The Story of
      </div>

      {/* Horse name */}
      <h1 className="text-center mb-2 text-2xl font-medium tracking-wide text-foreground">
        {horse.name}
      </h1>

      {/* Story title */}
      {horse.story_title && (
        <p className="text-center mb-2 text-sm italic text-muted-foreground tracking-wide">
          ― {horse.story_title} ―
        </p>
      )}

      {/* Reading time */}
      <p className="text-center mb-8 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        A 2-minute read
      </p>

      {/* Story body */}
      <div className="font-serif text-foreground text-[15px] leading-[1.9] tracking-wide whitespace-pre-line">
        {horse.story_text}
      </div>

      {/* Footer ornament */}
      <div className="mt-10 mb-6 text-center text-muted-foreground text-xs tracking-[0.3em]">
        ✦ ✦ ✦
      </div>

      {/* Bottom back link */}
      <div className="text-center">
        <Link
          href={`/horses/${horse.id}`}
          className="inline-block text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to horse
        </Link>
      </div>
    </article>
  );
}
