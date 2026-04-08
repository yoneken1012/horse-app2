"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, X } from "lucide-react";

const ACCEPTED_TYPES =
  "image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif,video/mp4,video/quicktime,video/webm";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25MB

interface ChatMessage {
  id: string;
  horse_id: string;
  user_id: string;
  message: string;
  image_url: string | null;
  created_at: string;
  profiles: {
    name: string;
    avatar_url: string | null;
  };
}

interface ChatTabProps {
  horseId: string;
  currentUserId: string;
  currentUserName: string;
}

export function ChatTab({ horseId, currentUserId, currentUserName }: ChatTabProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // メッセージ取得
  const fetchMessages = async () => {
    const supabase = createClient();
    const { data, error: fetchError } = await supabase
      .from("horse_chats")
      .select(
        `
        *,
        profiles:user_id ( name, avatar_url )
      `
      )
      .eq("horse_id", horseId)
      .order("created_at", { ascending: true });

    if (fetchError) {
      console.error("チャットの取得に失敗しました:", fetchError.message);
      return;
    }

    setMessages(
      (data ?? []).map((row) => ({
        id: row.id as string,
        horse_id: row.horse_id as string,
        user_id: row.user_id as string,
        message: row.message as string,
        image_url: (row.image_url as string | null) ?? null,
        created_at: row.created_at as string,
        profiles: row.profiles as { name: string; avatar_url: string | null },
      }))
    );
  };

  useEffect(() => {
    fetchMessages();
  }, [horseId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // リアルタイム購読
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`horse-chat-${horseId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "horse_chats",
          filter: `horse_id=eq.${horseId}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [horseId]);

  // ファイル選択
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setError(null);

    const isImage = selected.type.startsWith("image/");
    const isVideo = selected.type.startsWith("video/");

    if (isImage && selected.size > MAX_IMAGE_SIZE) {
      setError("画像は5MB以下にしてください");
      e.target.value = "";
      return;
    }
    if (isVideo && selected.size > MAX_VIDEO_SIZE) {
      setError("動画は25MB以下にしてください");
      e.target.value = "";
      return;
    }

    setFile(selected);
    setMediaType(isImage ? "image" : isVideo ? "video" : null);
    setPreview(URL.createObjectURL(selected));
  };

  const clearFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // メッセージ送信
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed && !file) return;

    setIsSending(true);
    setError(null);

    const supabase = createClient();

    try {
      // ファイルアップロード
      let imageUrl: string | null = null;
      if (file && mediaType) {
        const filePath = `chat/${horseId}/${currentUserId}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(filePath, file);

        if (uploadError) {
          throw new Error(`アップロードに失敗しました: ${uploadError.message}`);
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("post-images").getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // 楽観的更新
      const optimisticMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        horse_id: horseId,
        user_id: currentUserId,
        message: trimmed,
        image_url: imageUrl,
        created_at: new Date().toISOString(),
        profiles: { name: currentUserName, avatar_url: null },
      };
      setMessages((prev) => [...prev, optimisticMessage]);
      setNewMessage("");
      clearFile();

      const { error: insertError } = await supabase.from("horse_chats").insert({
        horse_id: horseId,
        user_id: currentUserId,
        message: trimmed || (mediaType === "image" ? "画像を送信しました" : "動画を送信しました"),
        image_url: imageUrl,
      });

      if (insertError) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
        throw new Error("送信に失敗しました");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "送信に失敗しました");
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateHeader = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
  };

  const getDateKey = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  };

  // 画像URLから画像か動画かを判定
  const isVideoUrl = (url: string) => {
    return /\.(mp4|mov|webm|quicktime)/i.test(url);
  };

  return (
    <div className="flex flex-col">
      {/* メッセージ一覧 */}
      <div className="flex max-h-96 flex-col gap-1 overflow-y-auto px-2 py-2">
        {messages.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">
            まだメッセージがありません
          </p>
        ) : (
          messages.map((msg, index) => {
            const isOwn = msg.user_id === currentUserId;
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const showDateHeader =
              !prevMsg || getDateKey(prevMsg.created_at) !== getDateKey(msg.created_at);

            return (
              <div key={msg.id}>
                {/* 日付区切り */}
                {showDateHeader && (
                  <div className="my-3 flex justify-center">
                    <span className="rounded-full bg-gray-100 px-3 py-0.5 text-xs text-gray-500">
                      {formatDateHeader(msg.created_at)}
                    </span>
                  </div>
                )}

                {/* メッセージ */}
                <div
                  className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}
                >
                  <div className={`max-w-[75%] ${isOwn ? "order-2" : "order-1"}`}>
                    {!isOwn && (
                      <p className="mb-0.5 text-xs font-medium text-gray-500">
                        {msg.profiles.name}
                      </p>
                    )}
                    <div className="flex items-end gap-1.5">
                      {isOwn && (
                        <span className="shrink-0 text-[10px] text-gray-400">
                          {formatTime(msg.created_at)}
                        </span>
                      )}
                      <div
                        className={`overflow-hidden rounded-2xl text-sm ${
                          isOwn
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        {/* メディア表示 */}
                        {msg.image_url && (
                          isVideoUrl(msg.image_url) ? (
                            <video
                              src={msg.image_url}
                              controls
                              className="max-h-48 w-full object-cover"
                            />
                          ) : (
                            <img
                              src={msg.image_url}
                              alt="送信画像"
                              className="max-h-48 w-full object-cover"
                            />
                          )
                        )}
                        {msg.message && (
                          <p className="whitespace-pre-wrap break-words px-3 py-2">
                            {msg.message}
                          </p>
                        )}
                      </div>
                      {!isOwn && (
                        <span className="shrink-0 text-[10px] text-gray-400">
                          {formatTime(msg.created_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* エラー表示 */}
      {error && (
        <p className="px-2 pb-1 text-xs text-red-500">{error}</p>
      )}

      {/* プレビュー */}
      {preview && (
        <div className="relative mx-2 mb-2">
          {mediaType === "video" ? (
            <video
              src={preview}
              controls
              className="max-h-32 rounded-md"
            />
          ) : (
            <img
              src={preview}
              alt="プレビュー"
              className="max-h-32 rounded-md object-cover"
            />
          )}
          <button
            type="button"
            onClick={clearFile}
            className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white hover:bg-black/70"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 入力エリア */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t pt-3"
      >
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
          className="shrink-0 px-2 text-gray-500 hover:text-gray-700"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="メッセージを入力..."
          className="flex-1 text-gray-900"
        />
        <Button
          type="submit"
          size="sm"
          disabled={isSending || (!newMessage.trim() && !file)}
          className="bg-blue-500 px-3 text-white hover:bg-blue-600"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
