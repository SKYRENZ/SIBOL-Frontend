import React, { useState } from "react";
import { Plus, Search, MessageCircle, X } from "lucide-react";

interface ChatHistoryProps {
  chats: any[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat?: () => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");

  const filteredChats = chats.filter((chat) => {
    const text = (chat.title || chat.messages?.[0]?.text || "").toLowerCase();
    return text.includes(query.toLowerCase());
  });

  return (
    <aside className="relative h-full w-full bg-white px-4 sm:px-5 py-4 sm:py-6 flex flex-col">
      {/* HEADER ACTIONS */}
      <div className="space-y-2 sm:space-y-3">
        <button
          type="button"
          onClick={() => {
            setShowSearch(false);
            setQuery("");
            onNewChat?.();
          }}
          className="flex items-center gap-2 text-[#6f9f84] font-medium hover:opacity-80 text-sm sm:text-base bg-transparent"
        >
          <Plus size={16} className="sm:!w-4 sm:!h-4" />
          New Chat
        </button>

        <button
          type="button"
          onClick={() => setShowSearch((v) => !v)}
          className="flex items-center gap-2 text-[#6f9f84] font-medium hover:opacity-80 text-sm sm:text-base bg-transparent"
        >
          <Search size={16} className="sm:!w-4 sm:!h-4" />
          Search Chat
        </button>

        {showSearch && (
          <div className="relative mt-2">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your chats..."
              className="w-full px-3 py-2 rounded-lg bg-white text-sm sm:text-base text-[#4f7f63] placeholder:text-[#9bb6a7] shadow focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent text-[#9bb6a7] hover:text-[#6f9f84]"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* CHAT LIST */}
      <div className="flex-1 overflow-y-auto mt-4 sm:mt-6 relative">
        <p className="text-xs sm:text-sm text-[#9bb6a7] mb-2 sm:mb-3">Your Chats</p>

        <div className="space-y-2">
          {filteredChats.map((chat) => {
            const isActive = chat.id === activeChatId;

            return (
              <button
                key={chat.id}
                type="button"
                onClick={() => onSelectChat(chat.id)}
                className={`
                  w-full flex items-start gap-2 text-left px-3 py-2 rounded-lg transition-shadow duration-150
                  ${isActive ? "bg-[#7fa98a] text-white shadow-md" : "bg-transparent text-[#6f9f84] hover:opacity-80"}
                `}
              >
                <MessageCircle
                  size={16}
                  className={`mt-0.5 flex-shrink-0 ${isActive ? "text-white" : "text-[#6f9f84]"}`}
                />
                <span className="text-sm sm:text-base line-clamp-2">
                  {chat.title || chat.messages?.[0]?.text || "Untitled chat"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FOOTER */}
      <div className="pt-3 sm:pt-4 text-xs sm:text-sm text-[#9bb6a7]">
        Contact us:{" "}
        <a
          href="mailto:sibolhelp@gmail.com"
          className="underline text-[#4f7f63]"
          target="_blank"
          rel="noopener noreferrer"
        >
          sibolhelp@gmail.com
        </a>
      </div>
    </aside>
  );
};

export default ChatHistory;
