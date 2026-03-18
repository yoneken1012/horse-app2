"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    media_url: string | null;
    media_type: string | null;
    created_at: string;
    profiles: {
      name: string;
      avatar_url: string | null;
    };
    reactions: {
      id: string;
      user_id: string;
    }[];
  };
  currentUserId: string;
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [reactionCount, setReactionCount] = useState(post.reactions.length);
  const [isLiked, setIsLiked] = useState(
    post.reactions.some((reaction) => reaction.user_id === currentUserId)
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const formattedDate = new Date(post.created_at).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleToggleLike = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const supabase = createClient();
    const previousIsLiked = isLiked;
    const previousCount = reactionCount;

    // 楽観的更新
    setIsLiked(!isLiked);
    setReactionCount(isLiked ? reactionCount - 1 : reactionCount + 1);

    try {
      if (previousIsLiked) {
        const { error } = await supabase
          .from("reactions")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", currentUserId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("reactions").insert({
          post_id: post.id,
          user_id: currentUserId,
          type: "like",
        });

        if (error) throw error;
      }
    } catch {
      // ロールバック
      setIsLiked(previousIsLiked);
      setReactionCount(previousCount);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold">{post.profiles.name}</span>
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="whitespace-pre-wrap text-sm">{post.content}</p>
        {post.media_url && post.media_type === "image" && (
          <img
            src={post.media_url}
            alt="投稿画像"
            className="max-h-96 w-full rounded-md object-cover"
          />
        )}
        {post.media_url && post.media_type === "video" && (
          <video
            src={post.media_url}
            controls
            className="max-h-96 w-full rounded-md"
          />
        )}
      </CardContent>
      <CardFooter>
        <Button
          variant="ghost"
          size="sm"
          className={isLiked ? "text-red-500" : "text-muted-foreground"}
          disabled={isProcessing}
          onClick={handleToggleLike}
        >
          <Heart
            className="mr-1 h-4 w-4"
            fill={isLiked ? "currentColor" : "none"}
          />
          {reactionCount}
        </Button>
      </CardFooter>
    </Card>
  );
}
