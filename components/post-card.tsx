"use client";

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
  const reactionCount = post.reactions.length;
  const isLiked = post.reactions.some(
    (reaction) => reaction.user_id === currentUserId
  );

  const formattedDate = new Date(post.created_at).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

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
            className="w-full rounded-md object-cover"
          />
        )}
        {post.media_url && post.media_type === "video" && (
          <video
            src={post.media_url}
            controls
            className="w-full rounded-md"
          />
        )}
      </CardContent>
      <CardFooter>
        <Button
          variant="ghost"
          size="sm"
          className={isLiked ? "text-red-500" : "text-muted-foreground"}
          disabled
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
