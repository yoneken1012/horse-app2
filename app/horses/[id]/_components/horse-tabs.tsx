"use client";

import { useState } from "react";
import { CalendarTab } from "./calendar-tab";
import { ChatTab } from "./chat-tab";
import { LinkTab } from "./link-tab";
import { Calendar, MessageCircle, Link2 } from "lucide-react";

interface ChatRecord {
  id: string;
  message: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  profiles: {
    name: string;
    avatar_url: string | null;
  };
}

interface HorseTabsProps {
  chats: ChatRecord[];
  horseId: string;
  currentUserId: string;
  currentUserName: string;
}

const tabs = [
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "links", label: "Links", icon: Link2 },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function HorseTabs({ chats, horseId, currentUserId, currentUserName }: HorseTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("chat");

  return (
    <div>
      {/* タブバー */}
      <div className="flex border-b border-border/60">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-[11px] uppercase tracking-[0.15em] font-normal transition-colors ${
                isActive
                  ? "border-b border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* タブコンテンツ */}
      <div className="py-3">
        {activeTab === "calendar" && <CalendarTab chats={chats} currentUserId={currentUserId} />}
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
