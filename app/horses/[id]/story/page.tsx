import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { StoryContent } from "./_components/story-content";

interface StoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function StoryPage({ params }: StoryPageProps) {
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
