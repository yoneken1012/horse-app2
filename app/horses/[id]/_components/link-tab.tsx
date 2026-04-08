"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Plus, Trash2, X } from "lucide-react";

interface HorseLink {
  id: string;
  horse_id: string;
  user_id: string;
  url: string;
  title: string | null;
  category: string;
  created_at: string;
}

interface LinkTabProps {
  horseId: string;
  currentUserId: string;
}

const CATEGORIES = [
  { id: "all", label: "すべて" },
  { id: "bloodline", label: "血統" },
  { id: "race_result", label: "レース結果" },
  { id: "news", label: "ニュース" },
  { id: "video", label: "動画" },
  { id: "other", label: "その他" },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

const categoryLabel: Record<string, string> = {
  bloodline: "血統",
  race_result: "レース結果",
  news: "ニュース",
  video: "動画",
  other: "その他",
};

export function LinkTab({ horseId, currentUserId }: LinkTabProps) {
  const [links, setLinks] = useState<HorseLink[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [formCategory, setFormCategory] = useState<string>("other");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = async () => {
    const supabase = createClient();
    const { data, error: fetchError } = await supabase
      .from("horse_links")
      .select("*")
      .eq("horse_id", horseId)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("リンクの取得に失敗しました:", fetchError.message);
      return;
    }

    setLinks(
      (data ?? []).map((row) => ({
        id: row.id as string,
        horse_id: row.horse_id as string,
        user_id: row.user_id as string,
        url: row.url as string,
        title: row.title as string | null,
        category: row.category as string,
        created_at: row.created_at as string,
      }))
    );
  };

  useEffect(() => {
    fetchLinks();
  }, [horseId]);

  const filteredLinks =
    activeCategory === "all"
      ? links
      : links.filter((link) => link.category === activeCategory);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError("URLを入力してください");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("horse_links").insert({
      horse_id: horseId,
      user_id: currentUserId,
      url: trimmedUrl,
      title: title.trim() || null,
      category: formCategory,
    });

    if (insertError) {
      setError("リンクの追加に失敗しました");
      setIsSubmitting(false);
      return;
    }

    setUrl("");
    setTitle("");
    setFormCategory("other");
    setShowForm(false);
    setIsSubmitting(false);
    fetchLinks();
  };

  const handleDelete = async (linkId: string) => {
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("horse_links")
      .delete()
      .eq("id", linkId)
      .eq("user_id", currentUserId);

    if (deleteError) {
      console.error("リンクの削除に失敗しました:", deleteError.message);
      return;
    }

    setLinks((prev) => prev.filter((l) => l.id !== linkId));
  };

  return (
    <div className="space-y-4">
      {/* カテゴリフィルタ */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeCategory === cat.id
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* リンク追加ボタン / フォーム */}
      {!showForm ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(true)}
          className="w-full"
        >
          <Plus className="mr-1 h-4 w-4" />
          リンクを追加
        </Button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-lg border bg-gray-50 p-3"
        >
          <div>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="URL（必須）"
              type="url"
              required
              className="bg-white text-gray-900"
            />
          </div>
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タイトル（任意）"
              className="bg-white text-gray-900"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFormCategory(cat.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  formCategory === cat.id
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-100"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              {isSubmitting ? "追加中..." : "追加"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setError(null);
              }}
            >
              <X className="mr-1 h-3.5 w-3.5" />
              キャンセル
            </Button>
          </div>
        </form>
      )}

      {/* リンク一覧 */}
      {filteredLinks.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          {activeCategory === "all"
            ? "リンクがまだ登録されていません"
            : `「${CATEGORIES.find((c) => c.id === activeCategory)?.label}」のリンクはありません`}
        </p>
      ) : (
        <div className="space-y-2">
          {filteredLinks.map((link) => (
            <div
              key={link.id}
              className="flex items-start gap-3 rounded-lg border bg-white p-3"
            >
              <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <div className="min-w-0 flex-1">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-sm font-medium text-blue-600 hover:underline"
                >
                  {link.title || link.url}
                </a>
                {link.title && (
                  <p className="truncate text-xs text-gray-400">{link.url}</p>
                )}
                <span className="mt-1 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                  {categoryLabel[link.category] ?? link.category}
                </span>
              </div>
              {link.user_id === currentUserId && (
                <button
                  onClick={() => handleDelete(link.id)}
                  className="shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
