import React, { useEffect, useState } from "react";
import Header from "../Components/Header";
import MascotPanel from "../Components/ChatSupport/MascotPanel";
import FAQItem from "../Components/ChatSupport/FAQItem";
import ChatPanel from "../Components/ChatSupport/ChatPanel";
import ChatHistory from "../Components/ChatSupport/ChatHistory";
import { getMyProfile } from "../services/profile/profileService";

// =============================
// TYPES
// =============================
interface Message {
  sender: "user" | "bot";
  text: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

interface User {
  firstName: string;
  lastName: string;
}

const defaultFAQs = [
  "How long does the stage 1 process usually take?",
  "How do I properly segregate food waste?",
  "What food waste can be processed?",
  "How often should the machine be maintained?",
];

// =============================
// MAIN COMPONENT
// =============================
const ChatSupport: React.FC = () => {
  const [showHistoryMobile, setShowHistoryMobile] = useState(false);
  const [isChatMode, setIsChatMode] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isAITyping, setIsAITyping] = useState(false);

  const [user, setUser] = useState<User>({ firstName: "Guest", lastName: "" });
  const [loadingUser, setLoadingUser] = useState(true);

  // =============================
  // LOAD USER PROFILE
  // =============================
  useEffect(() => {
    (async () => {
      try {
        const apiProfile = await getMyProfile();
        const normalizedUser: User = {
          firstName: apiProfile?.FirstName ?? apiProfile?.firstName ?? "Guest",
          lastName: apiProfile?.LastName ?? apiProfile?.lastName ?? "",
        };
        setUser(normalizedUser);
      } catch (err) {
        console.error("Failed to load user profile:", err);
      } finally {
        setLoadingUser(false);
      }
    })();
  }, []);

  // =============================
  // CHAT FUNCTIONS
  // =============================
  const startNewChat = (initialMessage?: string) => {
    const id = crypto.randomUUID();
    const newChat: Chat = {
      id,
      title: initialMessage || "New Conversation",
      messages: [],
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(id);
    setIsChatMode(true);

    if (initialMessage) {
      void handleSendMessage(initialMessage, id);
    }
  };

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    setIsChatMode(true);
  };

  const handleSendMessage = async (text: string, chatIdParam?: string) => {
    const id = chatIdParam ?? activeChatId;
    if (!id) return;

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === id
          ? {
              ...chat,
              title: chat.messages.length === 0 ? text.slice(0, 50) : chat.title,
              messages: [...chat.messages, { sender: "user", text }],
            }
          : chat
      )
    );

    try {
      setIsAITyping(true);
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error("Chat failed");

      const data = await res.json();

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === id
            ? { ...chat, messages: [...chat.messages, { sender: "bot", text: data.reply }] }
            : chat
        )
      );
    } catch {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === id
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  { sender: "bot", text: "Sorry, I couldn't process that. Please try again." },
                ],
              }
            : chat
        )
      );
    } finally {
      setIsAITyping(false);
    }
  };

  const handleEndConversation = () => {
    setIsChatMode(false);
    setActiveChatId(null);
  };

  const handleSelectFAQ = (faq: string) => {
    if (!activeChatId) startNewChat(faq);
    else handleSendMessage(faq);
  };

  const activeChat = chats.find((c) => c.id === activeChatId);

  // =============================
  // RENDER
  // =============================
  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#f4f9f4] px-4 sm:px-6 pt-24 pb-8">
        <div className="relative mx-auto w-full max-w-[1400px] bg-white rounded-[28px] shadow-sm h-[calc(100vh-6rem)] overflow-hidden">
          <div className="flex h-full">
            {/* LEFT PANEL */}
            <section
              className={`
                bg-white h-full transition-transform duration-300
                ${isChatMode ? "lg:w-[35%]" : "lg:w-[45%]"}
                lg:relative
                absolute top-0 left-0 z-40
                w-[85%] sm:w-[70%] lg:w-auto
                ${showHistoryMobile ? "translate-x-0" : "-translate-x-full"}
                lg:translate-x-0
              `}
            >
              {!isChatMode ? (
                <MascotPanel
                  firstName={user.firstName}
                  lastName={user.lastName}
                  onHelpClick={() => startNewChat()}
                />
              ) : (
                <ChatHistory
                  chats={chats}
                  activeChatId={activeChatId}
                  onSelectChat={(id) => {
                    handleSelectChat(id);
                    setShowHistoryMobile(false);
                  }}
                  onNewChat={() => {
                    startNewChat();
                    setShowHistoryMobile(false);
                  }}
                />
              )}
            </section>

            {/* MOBILE OVERLAY */}
            {showHistoryMobile && (
              <div
                className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                onClick={() => setShowHistoryMobile(false)}
              />
            )}

            {/* RIGHT PANEL */}
            <section className="relative flex-1 h-full overflow-hidden bg-[#e6efe6]">
              {isChatMode ? (
                <ChatPanel
                  messages={activeChat?.messages ?? []}
                  suggestedFAQs={defaultFAQs}
                  onSendMessage={handleSendMessage}
                  onEndConversation={handleEndConversation}
                  isAITyping={isAITyping}
                  onOpenHistory={() => setShowHistoryMobile(true)}
                />
              ) : (
                <FAQItem onSelectFAQ={handleSelectFAQ} />
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
};

export default ChatSupport;
