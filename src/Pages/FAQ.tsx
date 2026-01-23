import React, { useState } from "react";
import Header from "../Components/Header";
import MascotPanel from "../Components/FAQ/MascotPanel";
import FAQItem from "../Components/FAQ/FAQItem";
import ChatPanel from "../Components/FAQ/ChatPanel";

const user = { firstName: "Laurenz", lastName: "Listangco" };

const defaultFAQs = [
  "How long does the stage 1 process usually take?",
  "How do I properly segregate food waste?",
  "What food waste can be processed?",
  "How often should the machine be maintained?",
  "Is the system safe for households?",
];

const ChatSupport: React.FC = () => {
  const [isChatMode, setIsChatMode] = useState(false);
  const [initialUserMessage, setInitialUserMessage] = useState<string | undefined>(undefined);

  const startNewChat = (message?: string) => {
    setInitialUserMessage(message);
    setIsChatMode(true);
  };

  const handleHelpClick = () => {
    startNewChat();
  };

  const handleSelectFAQ = (faq: string) => {
    // Always start a new chat with the selected FAQ
    startNewChat(faq);
  };

  const handleEndConversation = () => {
    setIsChatMode(false);
    setInitialUserMessage(undefined);
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#f4f9f4] px-4 sm:px-6 pt-24 pb-8">
        <div className="relative mx-auto w-full max-w-[1400px] bg-white rounded-[28px] shadow-sm flex flex-col lg:flex-row h-[calc(100vh-6rem)] overflow-hidden">

          {/* LEFT PANEL */}
          <section className="relative lg:w-[45%] w-full h-full overflow-auto">
            {!isChatMode && (
              <MascotPanel user={user} onHelpClick={handleHelpClick} />
            )}
          </section>

          {/* CURVE DIVIDER */}
          <div className="hidden lg:block absolute left-[45%] top-0 h-full pointer-events-none">
            <img
              src={new URL("../assets/images/border.svg", import.meta.url).href}
              className="h-full w-auto"
              alt="divider"
            />
          </div>

          {/* RIGHT PANEL */}
          <section className="flex-1 bg-[#e6efe6] h-full overflow-auto">
            {isChatMode ? (
              <ChatPanel
                initialUserMessage={initialUserMessage}
                suggestedFAQs={defaultFAQs}
                onEndConversation={handleEndConversation}
              />
            ) : (
              <FAQItem onSelectFAQ={handleSelectFAQ} />
            )}
          </section>

        </div>
      </main>
    </>
  );
};

export default ChatSupport;
