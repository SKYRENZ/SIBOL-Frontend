import React, { useState } from "react";
import Header from "../Components/Header";
import MascotPanel from "../Components/FAQ/MascotPanel";
import FAQItem from "../Components/FAQ/FAQItem";
import ChatPanel from "../Components/FAQ/ChatPanel";

const user = {
  firstName: "Laurenz",
  lastName: "Listangco",
};

const defaultFAQs = [
  "How long does the stage 1 process usually take?",
  "How do I properly segregate food waste?",
  "What food waste can be processed?",
  "How often should the machine be maintained?",
  "Is the system safe for households?",
];

const ChatSupport: React.FC = () => {
  // Tracks if user has clicked "How may I help?" or a FAQ
  const [isChatMode, setIsChatMode] = useState(false);
  // Optional first user message (FAQ clicked)
  const [initialUserMessage, setInitialUserMessage] = useState<string | undefined>(undefined);

  // Handler for clicking "How may I help?" (shows suggested FAQs)
  const handleHelpClick = () => {
    setInitialUserMessage(undefined); // no initial FAQ
    setIsChatMode(true);
  };

  // Handler for clicking a FAQ (user message)
  const handleSelectFAQ = (faq: string) => {
    setInitialUserMessage(faq); // this FAQ becomes first user message
    setIsChatMode(true);
  };

  return (
    <>
      <Header />

      <main className="min-h-[calc(100vh-80px)] bg-[#f4f9f4] px-4 sm:px-6 pt-24 pb-8">
        <div className="relative mx-auto w-full max-w-[1400px] bg-white rounded-[28px] shadow-sm overflow-hidden flex flex-col lg:flex-row flex-1">


          {/* LEFT PANEL */}
          <section className="relative lg:w-[45%] w-full">
            {!isChatMode ? (
              <MascotPanel user={user} onHelpClick={handleHelpClick} />
            ) : (
              <FAQItem onSelectFAQ={handleSelectFAQ} />
            )}
          </section>

          {/* CURVE DIVIDER */}
          <div className="hidden lg:block absolute left-[40%] top-0 bottom-0 translate-x-[-1px] pointer-events-none">
            <img
              src={new URL("../assets/images/border.svg", import.meta.url).href}
              className="h-full w-auto"
              alt=""
            />
          </div>

          {/* RIGHT PANEL */}
          <section className="flex-1 bg-[#e6efe6]">
            {isChatMode ? (
              <ChatPanel
                initialUserMessage={initialUserMessage}
                suggestedFAQs={defaultFAQs}
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
