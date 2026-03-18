"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ImagePlus, X } from "lucide-react";

const ACCEPTED_TYPES =
  "image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif,video/mp4,video/quicktime,video/webm";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_CONTENT_LENGTH = 500;

interface PostFormProps {
  userId: string;
}

export function PostForm({ userId }: PostFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setError(null);

    const isImage = selected.type.startsWith("image/");
    const isVideo = selected.type.startsWith("video/");

    if (isImage && selected.size > MAX_IMAGE_SIZE) {
      setError("画像は5MB以下、動画は25MB以下にしてください");
      e.target.value = "";
      return;
    }
    if (isVideo && selected.size > MAX_VIDEO_SIZE) {
      setError("画像は5MB以下、動画は25MB以下にしてください");
      e.target.value = "";
      return;
    }

    setFile(selected);
    setMediaType(isImage ? "image" : isVideo ? "video" : null);

    const objectUrl = URL.createObjectURL(selected);
    setPreview(objectUrl);
  };

  const clearFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      setError("投稿内容を入力してください");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const supabase = createClient();

    try {
      let mediaUrl: string | null = null;
      let uploadedMediaType: "image" | "video" | null = null;

      if (file && mediaType) {
        const filePath = `${userId}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(filePath, file);

        if (uploadError) {
          throw new Error(`メディアのアップロードに失敗しました: ${uploadError.message}`);
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("post-images").getPublicUrl(filePath);

        mediaUrl = publicUrl;
        uploadedMediaType = mediaType;
      }

      const { error: insertError } = await supabase.from("posts").insert({
        user_id: userId,
        content: trimmed,
        media_url: mediaUrl,
        media_type: uploadedMediaType,
      });

      if (insertError) {
        throw new Error(`投稿に失敗しました: ${insertError.message}`);
      }

      // 成功: フォームクリア
      setContent("");
      clearFile();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "投稿に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-6 bg-white shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="今日のトレーニングの様子を投稿..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={MAX_CONTENT_LENGTH}
            rows={3}
            className="resize-none"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {content.length}/{MAX_CONTENT_LENGTH}
            </span>
          </div>

          {preview && mediaType === "image" && (
            <div className="relative">
              <img
                src={preview}
                alt="プレビュー"
                className="max-h-64 w-full rounded-md object-cover"
              />
              <button
                type="button"
                onClick={clearFile}
                className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {preview && mediaType === "video" && (
            <div className="relative">
              <video
                src={preview}
                controls
                className="max-h-64 w-full rounded-md"
              />
              <button
                type="button"
                onClick={clearFile}
                className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex items-center justify-between">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="mr-1 h-4 w-4" />
                画像・動画
              </Button>
            </div>
            <Button type="submit" size="sm" disabled={isSubmitting} className="bg-gray-900 text-white hover:bg-gray-800 hover:text-white">
              {isSubmitting ? "投稿中..." : "投稿する"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
