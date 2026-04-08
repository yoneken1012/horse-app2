"use client";

import { useState } from "react";
import { CalendarTab } from "./calendar-tab";
import { ChatTab } from "./chat-tab";
import { LinkTab } from "./link-tab";
import { Calendar, MessageCircle, Link2 } from "lucide-react";

interface Post {
  id: string;
  content: string;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  profiles: {
    name: string;
    avatar_url: string | null;
  };
}

interface HorseTabsProps {
  posts: Post[];
  horseId: string;
  currentUserId: string;
  currentUserName: string;
}

const tabs = [
  { id: "calendar", label: "カレンダー", icon: Calendar },
  { id: "chat", label: "チャット", icon: MessageCircle },
  { id: "links", label: "リンク", icon: Link2 },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function HorseTabs({ posts, horseId, currentUserId, currentUserName }: HorseTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("calendar");

  return (
    <div>
      {/* タブバー */}
      <div className="flex border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-b-2 border-gray-900 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* タブコンテンツ */}
      <div className="py-4">
        {activeTab === "calendar" && <CalendarTab posts={posts} />}
        {activeTab === "chat" && (
          <ChatTab
            horseId={horseId}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
          />
        )}
        {activeTab === "links" && (
          <LinkTab horseId={horseId} currentUserId={currentUserId} />
        )}
      </div>
    </div>
  );
}
