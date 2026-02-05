import React, { useState } from "react";
import Header from "../Components/Header";
import MascotPanel from "../Components/ChatSupport/MascotPanel";
import FAQItem from "../Components/ChatSupport/FAQItem";
import ChatPanel from "../Components/ChatSupport/ChatPanel";
import ChatHistory from "../Components/ChatSupport/ChatHistory";

const user = { firstName: "Laurenz", lastName: "Listangco" };

const defaultFAQs = [
  "How long does the stage 1 process usually take?",
  "How do I properly segregate food waste?",
  "What food waste can be processed?",
  "How often should the machine be maintained?",
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
  const [initialUserMessage, setInitialUserMessage] = useState<string | undefined>(undefined);
  const [isAITyping, setIsAITyping] = useState(false);

  const startNewChat = (initialMessage?: string) => {
    const id = crypto.randomUUID();
    const newChat: Chat = {
      id,
      title: initialMessage || "New Conversation",
      // initially empty; we'll call handleSendMessage so the normal flow (add user msg + AI reply) runs
      messages: [],
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(id);
    setIsChatMode(true);

    if (initialMessage) {
      // trigger the message flow so backend will respond
      // call asynchronously without awaiting to avoid blocking UI
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
      // Call backend AI
      const res = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      credentials: "include",
      headers: {
          "Content-Type": "application/json",
      },
          body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error("Chat failed");

      const data = await res.json();

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === id
            ? {
                ...chat,
                messages: [...chat.messages, { sender: "bot", text: data.reply }],
              }
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
    setInitialUserMessage(undefined);
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

          <section className={`relative h-full overflow-auto ${isChatMode ? "lg:w-[35%] w-full" : "lg:w-[45%] w-full"}`}>
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

          <div className="absolute top-0 h-full pointer-events-none lg:block left-[45%]">
            <img
              src={new URL("../assets/images/border.svg", import.meta.url).href}
              className={`h-full w-auto ${isChatMode ? "scale-x-[-1]" : ""}`}
              alt="divider"
            />
          </div>

          <section className="flex-1 h-full overflow-auto bg-[#e6efe6]">
            {isChatMode ? (
              <ChatPanel
                initialUserMessage={initialUserMessage}
                suggestedFAQs={defaultFAQs}
                messages={activeChat?.messages ?? []}
                onEndConversation={handleEndConversation}
                onSendMessage={handleSendMessage}
                isAITyping={isAITyping}
              />
            ) : (
              <FAQItem onSelectFAQ={handleSelectFAQ} isChatMode={isChatMode} />
            )}
          </section>
        </div>
      </main>
    </>
  );
};

export default ChatSupport;
