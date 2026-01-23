import React, { useState } from "react";
import Header from "../Components/Header";
import MascotPanel from "../Components/FAQ/MascotPanel";
import FAQItem from "../Components/FAQ/FAQItem";
import ChatPanel from "../Components/FAQ/ChatPanel";
import ChatHistory from "../Components/FAQ/ChatHistory";

const user = { firstName: "Laurenz", lastName: "Listangco" };

const defaultFAQs = [
  "How long does the stage 1 process usually take?",
  "How do I properly segregate food waste?",
  "What food waste can be processed?",
  "How often should the machine be maintained?",
  "Is the system safe for households?",
];

interface Message {
  sender: "user" | "bot";
  text: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

const ChatSupport: React.FC = () => {
  const [isChatMode, setIsChatMode] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);

  // Start a new chat
  const startNewChat = (initialMessage?: string) => {
    const id = crypto.randomUUID();
    const newChat: Chat = {
      id,
      title: initialMessage || "New Conversation",
      messages: initialMessage ? [{ sender: "user", text: initialMessage }] : [],
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(id);
    setIsChatMode(true);
  };

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    setIsChatMode(true);
  };

  const handleSendMessage = (text: string) => {
    if (!activeChatId) return;

    setChats((prev) =>
      prev.map((chat): Chat => {
        if (chat.id === activeChatId) {
          const newMessages: Message[] = [
            ...chat.messages,
            { sender: "user" as const, text },
            { sender: "bot" as const, text: "Thanks! I'm checking that for you now. Please hold on for a moment." },
          ];

          const newTitle = chat.messages.length === 0 ? text.slice(0, 50) : chat.title;
          return { ...chat, messages: newMessages, title: newTitle };
        }
        return chat;
      })
    );
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

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#f4f9f4] px-4 sm:px-6 pt-24 pb-8">
        <div className="relative mx-auto w-full max-w-[1400px] bg-white rounded-[28px] shadow-sm flex flex-col lg:flex-row h-[calc(100vh-6rem)] overflow-hidden">

          {/* LEFT PANEL */}
          <section
            className={`relative h-full overflow-auto ${
              isChatMode ? "lg:w-[35%] w-full" : "lg:w-[45%] w-full"
            }`}
          >
            {!isChatMode ? (
              <MascotPanel user={user} onHelpClick={() => startNewChat()} />
            ) : (
              <ChatHistory
                chats={chats}
                activeChatId={activeChatId}
                onSelectChat={handleSelectChat}
                onNewChat={() => startNewChat()}
              />
            )}
          </section>

          {/* CURVE DIVIDER */}
          <div className="absolute top-0 h-full pointer-events-none lg:block left-[45%]">
            <img
              src={new URL("../assets/images/border.svg", import.meta.url).href}
              className={`h-full w-auto ${isChatMode ? "scale-x-[-1]" : ""}`}
              alt="divider"
            />
          </div>

          {/* RIGHT PANEL */}
          <section className="flex-1 h-full overflow-auto bg-[#e6efe6]">
            {!isChatMode ? (
              <FAQItem onSelectFAQ={handleSelectFAQ} />
            ) : activeChat ? (
              <ChatPanel
                suggestedFAQs={defaultFAQs}
                messages={activeChat.messages}
                onEndConversation={handleEndConversation}
                onSendMessage={handleSendMessage}
              />
            ) : null}
          </section>
        </div>
      </main>
    </>
  );
};

export default ChatSupport;
