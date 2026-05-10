"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

interface CalendarTabProps {
  chats: ChatRecord[];
  currentUserId: string;
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }
  return days;
}

function formatDate(dateString: string): string {
  const d = new Date(dateString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|mov|webm|quicktime)/i.test(url);
}

export function CalendarTab({ chats }: CalendarTabProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // チャットを日付でグループ化
  const chatsByDate = chats.reduce<Record<string, ChatRecord[]>>((acc, chat) => {
    const dateKey = formatDate(chat.created_at);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(chat);
    return acc;
  }, {});

  const calendarDays = getCalendarDays(currentYear, currentMonth);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  };

  const handleDayClick = (day: number) => {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(selectedDate === dateKey ? null : dateKey);
  };

  const selectedChats = selectedDate ? chatsByDate[selectedDate] ?? [] : [];

  const todayKey = formatDate(today.toISOString());

  return (
    <div className="space-y-4">
      {/* カレンダーヘッダー */}
      <div className="flex items-center justify-between">
        <Button
          size="sm"
          className="bg-slate-700 px-3 text-white hover:bg-slate-600"
          onClick={handlePrevMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-bold text-gray-900">
          {currentYear}年{currentMonth + 1}月
        </span>
        <Button
          size="sm"
          className="bg-slate-700 px-3 text-white hover:bg-slate-600"
          onClick={handleNextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-px text-center text-xs font-medium text-gray-500">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-px">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="h-10" />;
          }

          const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const hasChats = Boolean(chatsByDate[dateKey]);
          const isSelected = selectedDate === dateKey;
          const isToday = dateKey === todayKey;

          return (
            <button
              key={dateKey}
              onClick={() => handleDayClick(day)}
              className={`relative flex h-10 items-center justify-center rounded-md text-sm transition-colors ${
                isSelected
                  ? "bg-gray-900 text-white"
                  : isToday
                    ? "bg-blue-50 font-bold text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {day}
              {hasChats && (
                <span
                  className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${
                    isSelected ? "bg-white" : "bg-blue-500"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* 選択日のメッセージ一覧 */}
      {selectedDate && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-700">
            {selectedDate.replace(/-/g, "/")} のメッセージ
          </h3>
          {selectedChats.length === 0 ? (
            <p className="text-sm text-gray-400">この日のメッセージはありません</p>
          ) : (
            selectedChats.map((chat) => (
              <Card key={chat.id} className="bg-white shadow-sm">
                <CardContent className="space-y-2 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">
                      {chat.profiles.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(chat.created_at).toLocaleTimeString("ja-JP", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-gray-800">
                    {chat.message}
                  </p>
                  {chat.image_url && !isVideoUrl(chat.image_url) && (
                    <img
                      src={chat.image_url}
                      alt="添付画像"
                      className="aspect-video w-full rounded-md object-cover"
                    />
                  )}
                  {chat.image_url && isVideoUrl(chat.image_url) && (
                    <video
                      src={chat.image_url}
                      controls
                      className="aspect-video w-full rounded-md object-cover"
                    />
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
