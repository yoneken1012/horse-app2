"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "たった今";
  if (diffMinutes < 60) return `${diffMinutes}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}/${m}/${d}`;
}

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
    reactionCount: number;
    isLikedByCurrentUser: boolean;
  };
  currentUserId: string;
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [reactionCount, setReactionCount] = useState(post.reactionCount);
  const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser);
  const [isProcessing, setIsProcessing] = useState(false);

  const relativeTime = formatRelativeTime(post.created_at);

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
          <span className="font-bold text-gray-900">{post.profiles.name}</span>
          <span className="text-xs text-gray-500">{relativeTime}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="whitespace-pre-wrap text-sm text-gray-800">{post.content}</p>
        {post.media_url && post.media_type === "image" && (
          <img
            src={post.media_url}
            alt="投稿画像"
            className="aspect-video w-full rounded-md object-cover"
          />
        )}
        {post.media_url && post.media_type === "video" && (
          <video
            src={post.media_url}
            controls
            className="aspect-video w-full rounded-md object-cover"
          />
        )}
      </CardContent>
      <CardFooter>
        <Button
          variant="ghost"
          size="sm"
          className={isLiked ? "text-red-500" : "text-gray-600"}
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
