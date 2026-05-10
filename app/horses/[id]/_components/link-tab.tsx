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
  { id: "all", label: "All" },
  { id: "bloodline", label: "Bloodline" },
  { id: "race_result", label: "Race" },
  { id: "news", label: "News" },
  { id: "video", label: "Video" },
  { id: "other", label: "Other" },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

const categoryLabel: Record<string, string> = {
  bloodline: "Bloodline",
  race_result: "Race",
  news: "News",
  video: "Video",
  other: "Other",
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
    <div className="space-y-3">
      {/* カテゴリフィルタ */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`rounded-sm px-3 py-1 text-[10px] uppercase tracking-wider font-normal transition-colors ${
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground border border-primary"
                : "bg-transparent text-muted-foreground hover:text-foreground border border-border hover:border-foreground/40"
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
          className="w-full text-xs uppercase tracking-wider"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Link
        </Button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-sm border border-border bg-secondary/50 p-3"
        >
          <div>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="URL (required)"
              type="url"
              required
              className="bg-background text-foreground"
            />
          </div>
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="bg-background text-foreground"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFormCategory(cat.id)}
                className={`rounded-sm px-3 py-1 text-[10px] uppercase tracking-wider font-normal transition-colors ${
                  formCategory === cat.id
                    ? "bg-primary text-primary-foreground border border-primary"
                    : "bg-transparent text-muted-foreground border border-border hover:border-foreground/40"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs uppercase tracking-wider"
            >
              {isSubmitting ? "Adding..." : "Add"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setError(null);
              }}
              className="text-xs uppercase tracking-wider"
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* リンク一覧 */}
      {filteredLinks.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {activeCategory === "all"
            ? "No links yet"
            : `No ${CATEGORIES.find((c) => c.id === activeCategory)?.label} links`}
        </p>
      ) : (
        <div className="space-y-2">
          {filteredLinks.map((link) => (
            <div
              key={link.id}
              className="flex items-start gap-3 rounded-sm border border-border bg-card p-3"
            >
              <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-sm font-medium text-foreground hover:text-primary underline-offset-4 hover:underline transition-colors"
                >
                  {link.title || link.url}
                </a>
                {link.title && (
                  <p className="truncate text-xs text-muted-foreground/70">{link.url}</p>
                )}
                <span className="mt-1 inline-block rounded-sm bg-secondary text-muted-foreground border border-border text-[10px] uppercase tracking-wider px-1.5">
                  {categoryLabel[link.category] ?? link.category}
                </span>
              </div>
              {link.user_id === currentUserId && (
                <button
                  onClick={() => handleDelete(link.id)}
                  className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive"
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
