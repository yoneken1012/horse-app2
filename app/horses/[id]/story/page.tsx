import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { StoryContent } from "./_components/story-content";
import { Suspense } from "react";

interface StoryPageProps {
  params: Promise<{ id: string }>;
}

async function StoryLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: horse } = await supabase
    .from("horses")
    .select("id, name, image_url, story_text, story_title, story_image_url")
    .eq("id", id)
    .single();

  if (!horse) {
    notFound();
  }

  return <StoryContent horse={horse} />;
}

export default function StoryPage({ params }: StoryPageProps) {
  return (
    <Suspense>
      <StoryLoader params={params} />
    </Suspense>
  );
}
